# Protection des données — Versioning et résilience

> **Document autonome** — première version : 6 mai 2026.
>
> **Question d'origine (Grégoire)** : comment protéger les micro-data recueillies par un enseignant contre la destruction, la modification erronée ou la corruption silencieuse.
>
> **Angle traité** : le **versioning et la résilience**, c'est-à-dire la capacité de **revenir en arrière** quand quelque chose va mal. Deuxième des trois documents de la série « Protection des données vivantes ». Le document A traite du chiffrement au repos (protection contre la lecture non autorisée), le document C traite de l'anonymisation pour le partage.
>
> **Distinction importante** : le chiffrement protège la **confidentialité** (qui peut lire). Le versioning protège l'**intégrité dans le temps** (peut-on revenir à un état antérieur). Les deux sont complémentaires. Cet angle correspond le plus directement à ta crainte centrale de **destruction et perte irréversible**.

---

## Table des matières

1. [Pourquoi le versioning](#1-pourquoi-le-versioning)
2. [État actuel : la résilience de Labo Codex aujourd'hui](#2-état-actuel--la-résilience-de-labo-codex-aujourdhui)
3. [Trois mécanismes complémentaires](#3-trois-mécanismes-complémentaires)
4. [Mécanisme A — Snapshots automatiques](#4-mécanisme-a--snapshots-automatiques)
5. [Mécanisme B — Journal des modifications](#5-mécanisme-b--journal-des-modifications)
6. [Mécanisme C — Sauvegarde externalisée vers la Réserve](#6-mécanisme-c--sauvegarde-externalisée-vers-la-réserve)
7. [Architecture proposée pour Labo Codex](#7-architecture-proposée-pour-labo-codex)
8. [L'UX du versioning](#8-lux-du-versioning)
9. [Compromis et limites](#9-compromis-et-limites)
10. [Plan de mise en œuvre en trois phases](#10-plan-de-mise-en-œuvre-en-trois-phases)
11. [Questions ouvertes pour Grégoire](#11-questions-ouvertes-pour-grégoire)
12. [Synthèse en une page](#synthèse-en-une-page)

---

## 1. Pourquoi le versioning

Tu m'as dit que ta crainte centrale est la **destruction massive et la propagation virale** — perte de patrimoine pédagogique, perte irréversible. Le chiffrement (document A) ne répond pas à cette crainte. Il protège contre la lecture non autorisée mais ne sauve rien quand des données sont détruites ou modifiées par erreur.

Le versioning est la réponse directe. Le principe : à chaque modification importante des données, l'app conserve une **version antérieure** récupérable. Comme Time Machine pour les fichiers macOS, mais intégré à Labo Codex et adapté à la granularité de tes données pédagogiques.

### 1.1 Trois familles de menaces que le versioning résout

**Famille 1 — Destruction par payload.** Les scénarios D-01, D-02, D-03 du `MODELE-MENACES.md` aboutissent à une perte ou corruption massive. Si des snapshots récents existent, la restauration est possible en quelques clics. Sans versioning, l'utilisateur dépend de ses backups externes (ZIP Codex sur USB, iCloud) — qui peuvent être déjà infectés ou périmés.

**Famille 2 — Erreur humaine.** Tu modifies par mégarde une grille importante. Tu supprimes un étudiant. Tu changes les pondérations d'une évaluation déjà notée. Tu importes un pack qui écrase tes données. Aujourd'hui, Labo Codex ne te permet pas de revenir en arrière facilement — c'est restaurer depuis backup, avec perte de tout ce qui a été fait entretemps.

**Famille 3 — Corruption silencieuse.** Un bug dans un nouveau code modifie subtilement des données sans alerte. Tu t'en rends compte trois semaines plus tard. Sans historique, impossible de retrouver l'état correct sans tout reconstituer manuellement.

### 1.2 Pertinence pour ton profil d'utilisateur

Tu es prof de littérature qui vibe code avec Claude. Ta rythmique de développement implique des modifications rapides, parfois imprudentes (« je teste, on verra »). Le versioning est un filet de sécurité qui rend acceptable cette rythmique sans risquer de tout casser. C'est aussi un mécanisme qui te permet d'explorer plus librement — savoir qu'on peut revenir en arrière encourage l'expérimentation.

Pour les futurs utilisateurs de Labo Codex (collègues), le versioning est aussi un argument d'adoption — « j'utilise une app où mes données sont protégées contre la perte ».

### 1.3 Ce que le versioning ne résout pas

- **Confidentialité** : un attaquant qui veut **lire** tes données voit les snapshots aussi (sauf s'ils sont chiffrés — combinaison avec le doc A).
- **Vol de la machine** : les snapshots vivent dans IndexedDB sur le même Mac. Vol = perte des snapshots aussi. Mitigation : combinaison avec le mécanisme C (sauvegarde externalisée).
- **Destruction de l'historique lui-même** : un payload sophistiqué peut effacer les snapshots en même temps que les données. Mitigation : externaliser les snapshots dans la Réserve (sur disque, hors d'IndexedDB) — mécanisme C.

Le versioning seul est puissant. Combiné aux deux autres mécanismes (chiffrement, externalisation), c'est un dispositif robuste.

---

## 2. État actuel : la résilience de Labo Codex aujourd'hui

Pour comprendre ce qu'on ajoute, il faut comprendre ce qui existe.

### 2.1 Stratégie de backup actuelle (CLAUDE.md, SKILL_Securite_donnees §5.2)

Aujourd'hui, ta résilience repose sur :

- **Backups Codex manuels sur clé USB** (hebdomadaire).
- **Backups Codex manuels sur iCloud** (idem).
- **Pas de Time Machine** automatique (selon ta documentation).
- **Réserve manuelle sur disque externe** quand tu fais un versement de trimestre.

Cette stratégie a deux faiblesses majeures :

1. **Fréquence** : un backup hebdomadaire signifie qu'en cas d'incident, tu perds jusqu'à une semaine de travail. Pour un trimestre de 15 semaines, c'est une perte significative.
2. **Granularité grossière** : tu restaures un ZIP complet. Tu ne peux pas restaurer juste « la grille de littérature de mardi » sans écraser tout le reste.

### 2.2 Mécanismes internes existants

J'ai inventoré dans le code ce qui existe déjà en termes de résilience interne :

- **`db.js` — `_pendingWrites`** : trace les écritures IDB en cours pour les flush au `beforeunload`. Protège contre la perte si tu fermes l'onglet pendant une écriture. C'est de la **résilience transactionnelle**, pas du versioning.
- **`migrations.js`** : applique des migrations de format avec préservation des données. Pas un mécanisme de versioning, mais respecte le principe de non-destruction.
- **`reserve.js`** : permet le versement d'un trimestre complet vers la Réserve sur disque. C'est un **snapshot manuel** déclenché par l'utilisateur, à granularité trimestre. Plus structuré qu'un backup ZIP, mais toujours manuel.

### 2.3 Lacune principale

Il n'y a **aucun mécanisme automatique** qui conserve une trace des modifications passées. Si tu modifies une grille aujourd'hui et que tu réalises demain que tu as cassé quelque chose, tu n'as pas de bouton « annuler la modification d'hier ». Tu dois :

- Retrouver le bon ZIP de backup (si la modif date d'avant le dernier backup, ça marche).
- Restaurer ce ZIP, ce qui écrase **toutes** tes modifications postérieures.
- Refaire à la main toutes les modifications légitimes de cette période.

C'est laborieux et risqué. Le versioning automatique vise précisément à éviter ça.

---

## 3. Trois mécanismes complémentaires

La résilience se construit par superposition. Trois mécanismes distincts, chacun couvrant un cas différent :

| Mécanisme | Ce qu'il fait | Granularité | Coût | Cible |
|---|---|---|---|---|
| **A. Snapshots automatiques** | Capture périodique de l'état complet (ou de sous-ensembles) | Trimestre, GC, ou clé | Espace + écriture | Récupération rapide à un point dans le temps |
| **B. Journal des modifications** | Enregistre chaque modification (qui, quand, quoi, valeur avant/après) | Modification individuelle | Espace cumulé + écriture | Annulation granulaire, audit |
| **C. Sauvegarde vers Réserve** | Externalise les snapshots vers le disque hors IndexedDB | Trimestre ou versement | Espace disque externe | Survie à la destruction d'IndexedDB |

Idéalement, les trois sont combinés. Pratiquement, on peut prioriser : commencer par A (le plus rentable rapidement), ajouter B en phase 2 (granularité fine), externaliser via C en phase 3 (protection contre destruction massive).

---

## 4. Mécanisme A — Snapshots automatiques

### 4.1 Principe

À intervalles réguliers (ou déclenchés par certaines actions), l'app capture l'état complet (ou partiel) du codex et le stocke comme un **snapshot** dans IndexedDB. L'utilisateur peut consulter la liste des snapshots et restaurer à un point antérieur.

Analogie : Time Machine de macOS sauvegarde régulièrement ton disque dur. Les snapshots Labo Codex font la même chose pour ton codex actif.

### 4.2 Granularité — quoi snapshotter

Trois options de granularité :

**Granularité 1 — Trimestre entier.** Un snapshot capture toutes les clés `<trim>_*` du trimestre actif. Avantage : simple, garantit la cohérence interne. Inconvénient : volumineux (peut atteindre plusieurs Mo par snapshot). Si on garde 30 snapshots, c'est ~100 Mo dans IndexedDB.

**Granularité 2 — Par groupe-cours.** Un snapshot capture l'état d'un GC précis (étudiants, évaluations, présences pour ce GC). Avantage : plus léger, restauration ciblée. Inconvénient : risque d'incohérence si les bibliothèques évoluent entre snapshot et restauration.

**Granularité 3 — Par clé sensible.** Un snapshot par clé importante (`groupeEtudiants`, `evaluations`, `journal`, `bibliothequeGrilles`, etc.). Avantage : très fin, peu d'espace utilisé. Inconvénient : restauration complexe à orchestrer si plusieurs clés ont évolué ensemble.

**Recommandation Labo Codex** : combinaison **Granularité 1 + Granularité 3** :
- Snapshot **trimestre complet** quotidien (ou tous les N modifications majeures).
- Snapshot **par clé sensible** à chaque modification critique (édition d'évaluation finale, suppression d'étudiant).

### 4.3 Fréquence — quand snapshotter

**Stratégie temporelle** :
- À la fermeture de l'app (avant déchargement de la page).
- Toutes les 30 minutes pendant l'utilisation active.
- À chaque ouverture du trimestre (snapshot de l'état d'entrée).

**Stratégie événementielle** :
- Avant tout import (codex, bibliothèque, pack).
- Avant toute modification massive (suppression de groupe, recalcul d'évaluations).
- Avant toute migration de format.

**Recommandation** : combiner les deux. Snapshot temporel quotidien minimum + snapshot événementiel avant toute opération risquée.

### 4.4 Rétention — combien garder

Pas envisageable de garder tous les snapshots indéfiniment (explosion de l'espace). Stratégie de rétention typique, **inspirée de Time Machine** :

- **Tous les snapshots des dernières 24 heures.**
- **Un snapshot par jour des 7 derniers jours.**
- **Un snapshot par semaine des 4 dernières semaines.**
- **Un snapshot par mois des 12 derniers mois.**
- **Suppression progressive des plus anciens.**

Avec cette stratégie, tu as une couverture fine pour le passé récent (où la plupart des récupérations se font) et une couverture historique pour les cas exceptionnels.

Estimation d'espace : avec un trimestre de ~5 Mo et la stratégie ci-dessus, ~30 snapshots × 5 Mo = ~150 Mo. C'est significatif mais gérable dans IndexedDB (limite typique : plusieurs Go pour le navigateur).

### 4.5 Format d'un snapshot

```json
{
  "id": "snap_2026-05-06_14-23-45",
  "type": "snapshot",
  "date": "2026-05-06T14:23:45-04:00",
  "trimestre": "h2026",
  "declencheur": "auto-temporel-quotidien",
  "etat": {
    "h2026_groupeEtudiants": [ /* données complètes */ ],
    "h2026_evaluations": [ /* données complètes */ ],
    "h2026_presences": [ /* ... */ ],
    "h2026_journal": [ /* ... */ ],
    "h2026_indices_ACPE": [ /* ... */ ],
    /* etc. */
  },
  "metadata": {
    "version_app": "Beta 99.11",
    "build": "0411-2010",
    "taille_octets": 5237492
  }
}
```

Les snapshots sont stockés dans une clé IndexedDB dédiée, par exemple `snapshots_h2026` (un tableau de snapshots ou un objet indexé par id).

### 4.6 Identification du « moment » d'un snapshot

Pour que l'utilisateur puisse choisir intelligemment où restaurer, chaque snapshot doit être **étiquetable** :

- Date et heure (toujours).
- Déclencheur (automatique vs avant import vs avant suppression).
- Note optionnelle de l'utilisateur (« Avant la correction du devoir 3 »).
- Description automatique (« 12 modifications depuis le snapshot précédent : 3 notes ajoutées, 1 grille modifiée »).

### 4.7 Restauration

Restaurer un snapshot consiste à écraser les clés actuelles avec les valeurs du snapshot. Détails sensibles :

- **Confirmation explicite** : la restauration est destructive (les données plus récentes que le snapshot disparaissent). Dialogue avec liste de ce qui sera perdu.
- **Snapshot « avant restauration »** : avant d'appliquer la restauration, prendre un snapshot de l'état courant (pour pouvoir annuler la restauration elle-même).
- **Restauration partielle** : possibilité de restaurer **uniquement certaines clés** du snapshot, pas tout. Utile si l'utilisateur veut récupérer juste une grille modifiée sans perdre les notes saisies après.

---

## 5. Mécanisme B — Journal des modifications

### 5.1 Principe

Au lieu de capturer des états complets périodiquement (snapshots), le journal enregistre **chaque modification** au fur et à mesure : qui a modifié quoi, quand, valeur avant, valeur après. C'est ce qu'on appelle **event sourcing** en architecture logicielle.

Avantage majeur : **annulation granulaire**. L'utilisateur peut annuler une modification précise (« Ctrl+Z sur la note de Marie-Hélène du 12 mai ») sans toucher au reste.

### 5.2 Format d'une entrée du journal

```json
{
  "id": "mod_2026-05-06_14-23-45_a1b2c3",
  "date": "2026-05-06T14:23:45-04:00",
  "operation": "modifier",
  "cle": "h2026_evaluations",
  "chemin": "[12].notes.criterion_C1",
  "valeur_avant": 75,
  "valeur_apres": 82,
  "auteur": "Grégoire",
  "session_id": "sess_xyz",
  "annulable": true,
  "annulee": false
}
```

Champs explicatifs :
- `operation` : type d'opération (`ajouter`, `modifier`, `supprimer`).
- `chemin` : chemin précis dans la structure (utile pour les objets imbriqués).
- `valeur_avant` / `valeur_apres` : pour permettre l'annulation et l'audit.
- `auteur` : identité de qui a fait la modification (futur — utile si plusieurs comptes).
- `session_id` : pour grouper les modifications d'une même session de travail.
- `annulable` / `annulee` : état de la modification.

### 5.3 Quelles modifications journaliser

Tout journaliser serait coûteux et bruyant (chaque caractère tapé dans un champ texte créerait une entrée). Stratégie pragmatique :

- **Journaliser à la sauvegarde**, pas à la frappe. Quand l'utilisateur termine une saisie et que l'app appelle `db.set`, une entrée de journal est créée.
- **Journaliser les opérations critiques** : ajout/suppression d'étudiant, modification d'évaluation finalisée, import, migration.
- **Pas de journalisation** sur les modifications d'UI (préférences, navigation, etc.).

### 5.4 Espace utilisé

Un journal grossit avec le temps. Stratégie de rotation :

- Garder le journal complet pour les **30 derniers jours**.
- Compresser ou agréger les entrées plus anciennes (statistiques mensuelles plutôt que entrées individuelles).
- Purger les entrées de plus d'un an.

Estimation : ~100 entrées/jour en utilisation active × ~500 octets/entrée = ~50 Ko/jour. Sur 30 jours = ~1.5 Mo. Gérable.

### 5.5 Cas d'usage 1 — Annulation simple

L'utilisateur clique « Annuler la dernière modification » dans le menu Édition. L'app lit la dernière entrée non-annulée du journal, applique l'inverse (rétablir `valeur_avant`), marque l'entrée comme annulée.

C'est essentiellement un « Ctrl+Z » étendu qui traverse les sessions et survit aux fermetures de l'app.

### 5.6 Cas d'usage 2 — Audit rétrospectif

Un collègue te demande : « Pourquoi la note de Pierre est-elle passée de 65 à 78 ? Tu l'as modifiée ? ». Tu ouvres le panneau Historique, filtres sur Pierre, vois la modification du 14 avril avec horodatage et contexte. C'est utile pour la transparence et la responsabilisation.

### 5.7 Cas d'usage 3 — Restauration ciblée après attaque

Si un scénario D-02 (corruption silencieuse) a modifié certaines grilles, le journal montre exactement ce qui a changé et quand. L'utilisateur peut annuler les modifications suspectes une par une, sans toucher au reste.

---

## 6. Mécanisme C — Sauvegarde externalisée vers la Réserve

### 6.1 Principe

Les mécanismes A et B vivent dans IndexedDB. Si IndexedDB est entièrement détruit (scénario D-01 du modèle de menaces), les snapshots et le journal disparaissent avec.

Solution : externaliser les snapshots vers la **Réserve sur disque** (`~/Documents/Archives_LaboCodex/` via FSAPI). Les fichiers de la Réserve survivent à la destruction d'IndexedDB.

### 6.2 Architecture

À intervalles réguliers (ou déclenchés par événement), l'app prend un snapshot et l'écrit dans la Réserve sous la forme d'un fichier indépendant :

```
Archives_LaboCodex/
├── trimestres/
│   └── h2026/
│       └── versement_2026-05-01/
│           ├── donnees.json
│           ├── meta.json
│           └── travaux/
│               └── ...
├── snapshots_auto/
│   └── h2026/
│       ├── snap_2026-05-06_14-23-45.json
│       ├── snap_2026-05-06_15-00-00.json
│       └── ...
└── README.txt
```

Les snapshots auto sont distincts des versements de trimestre (qui sont archivés à long terme). Les snapshots auto ont une rétention plus courte (peut-être 7-14 jours) et servent à la récupération rapide après incident.

### 6.3 Pourquoi cette externalisation est critique pour ta crainte

Scénario D-01 : payload détruit IndexedDB. Sans mécanisme C, tous les snapshots (mécanisme A) sont détruits aussi → restauration impossible sauf depuis backup externe (USB ou iCloud, qui peuvent dater).

Avec mécanisme C : les snapshots auto dans `Archives_LaboCodex/snapshots_auto/` survivent. Restauration en quelques minutes, perte limitée au temps entre dernier snapshot externe et incident (typiquement quelques heures).

**Subtilité importante** : le payload pourrait aussi détruire les snapshots auto via FSAPI rémanent (cf. scénario D-03). Mitigation : utiliser un sous-dossier de la Réserve où la persistance FSAPI n'est PAS établie (ou révoquée régulièrement). Voir doc A §10.2 sur la combinaison avec révocation FSAPI.

### 6.4 Fréquence d'externalisation

Plus fréquent que les versements de trimestre (qui sont manuels), moins fréquent que les snapshots IndexedDB (qui sont nombreux).

**Recommandation** : externaliser **1 fois par jour** automatiquement, en plus de la possibilité manuelle. À la fermeture de l'app, vérifier si un snapshot externalisé existe pour aujourd'hui ; sinon, en produire un.

### 6.5 Compatibilité avec la stratégie de Grégoire actuelle

Tu fais déjà des backups manuels USB/iCloud hebdomadaires. Le mécanisme C ne les remplace pas — il complète. Les snapshots auto sur disque sont un filet **proche** (récupération en heures), les backups USB/iCloud sont un filet **lointain** (récupération en jours). Combinés, tu as :

- Snapshot IndexedDB : récupération en secondes (filet immédiat).
- Snapshot externalisé Réserve : récupération en minutes (filet proche).
- Versement trimestre Réserve : récupération en heures (filet structuré).
- Backup ZIP USB/iCloud : récupération en jours (filet de dernier recours).

Quatre niveaux. Pas redondant — chaque niveau adresse une magnitude de perte différente.

---

## 7. Architecture proposée pour Labo Codex

### 7.1 Nouveaux modules

**`js/snapshots.js`** : génération, stockage, restauration des snapshots automatiques. API :
- `prendreSnapshot(declencheur, note?)` → crée un snapshot et le stocke.
- `listerSnapshots(filtre?)` → liste les snapshots disponibles.
- `restaurerSnapshot(id, options?)` → restaure un snapshot (complet ou sélectif).
- `purgerAnciensSnapshots()` → applique la politique de rétention.

**`js/journal-modifications.js`** : journalisation des modifications. API :
- `enregistrerModification(cle, chemin, avant, apres)` → ajoute au journal.
- `annulerDerniere()` → annule la dernière modification non annulée.
- `annulerSpecifique(id)` → annule une modification précise.
- `consulterJournal(filtres?)` → retourne les modifications selon filtres.

**`js/externalisation.js`** : écriture des snapshots vers la Réserve. API :
- `externaliserSnapshot(snapshot)` → écrit le snapshot dans la Réserve.
- `lireSnapshotExternalise(id)` → relit depuis la Réserve.
- `synchroniserExternalisations()` → applique la politique d'externalisation périodique.

### 7.2 Modifications de `db.js`

Le wrapper `db.set` peut être étendu pour journaliser automatiquement :

```javascript
async function dbSet(cle, valeur) {
  // Lire la valeur actuelle pour le journal
  const valeurAvant = await dbGet(cle);
  
  // Écrire la nouvelle valeur
  await setIndexedDB(cle, valeur);
  
  // Journaliser si la clé est suivie
  if (estCleJournalisee(cle)) {
    await enregistrerModification(cle, null, valeurAvant, valeur);
  }
}
```

Le booléen `estCleJournalisee(cle)` détermine selon une liste — pas toutes les clés (ce serait trop bruyant), seulement celles dont l'audit est utile.

### 7.3 Modifications de `reserve.js`

Ajouter une fonction `externaliserSnapshotsAuto(handleReserve)` qui écrit les snapshots auto dans le sous-dossier `snapshots_auto/<trimestre>/` de la Réserve. Appelée par `externalisation.js` selon la politique.

### 7.4 Intégration avec le chiffrement (doc A)

Si le chiffrement au repos (doc A) est implémenté, les snapshots **doivent aussi être chiffrés** — sinon ils annulent la protection du chiffrement (un snapshot en clair contient les mêmes données que les clés chiffrées).

Stratégie : les snapshots passent par les mêmes routines que `dbSet` chiffré. Si la clé maître est chargée, les snapshots sont chiffrés. Sinon, l'utilisateur doit déverrouiller avant de pouvoir prendre ou restaurer un snapshot.

---

## 8. L'UX du versioning

### 8.1 Panneau Historique

Un nouvel élément de navigation dans Labo Codex : **Historique**. Accessible depuis le menu principal ou un raccourci.

Vue d'ensemble :

```
┌──────────────────────────────────────────────────────────┐
│  Historique de Labo Codex                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ▼ Aujourd'hui (3 snapshots)                             │
│     • 14:23  Snapshot automatique         [Restaurer]    │
│     • 12:15  Avant import "Pack Caroline"  [Restaurer]   │
│     • 09:00  Ouverture du trimestre        [Restaurer]   │
│                                                          │
│  ▼ Cette semaine (5 snapshots)                           │
│     • Lundi 14:00  Snapshot automatique    [Restaurer]   │
│     • ...                                                │
│                                                          │
│  ▶ Ce mois (12 snapshots)                                │
│  ▶ Plus ancien (3 snapshots)                             │
│                                                          │
│  Modifications récentes :                                │
│  • 14:25  Note de Marie-Hélène : 75 → 82  [Annuler]      │
│  • 14:23  Présence de Pierre, 5 mai       [Annuler]      │
│  • 14:20  Ajout d'étudiant : Lucas        [Annuler]      │
│                                                          │
│  [Filtrer par étudiant]  [Filtrer par date]              │
└──────────────────────────────────────────────────────────┘
```

L'utilisateur a une vue d'ensemble des snapshots disponibles et des modifications récentes annulables.

### 8.2 Dialogue de restauration

Quand l'utilisateur clique « Restaurer » sur un snapshot :

```
┌─────────────────────────────────────────────────────────┐
│  Restaurer le snapshot du 6 mai à 14:23                 │
│                                                         │
│  Cette restauration va remplacer l'état actuel          │
│  par celui du snapshot.                                 │
│                                                         │
│  Modifications postérieures qui seront perdues :        │
│  • 14 modifications de notes                            │
│  • 2 nouveaux étudiants ajoutés                         │
│  • 1 grille modifiée                                    │
│                                                         │
│  Avant la restauration, un snapshot                     │
│  « avant_restauration_2026-05-06_15-00 » sera créé.    │
│  Tu pourras revenir à l'état actuel si nécessaire.      │
│                                                         │
│  Restaurer :                                            │
│  ◉ Tout le trimestre                                    │
│  ○ Sélection précise...                                 │
│                                                         │
│  [Annuler]   [Confirmer la restauration]                │
└─────────────────────────────────────────────────────────┘
```

Le dialogue est explicite sur ce qui va se passer. La case « Sélection précise » permet de choisir quelles clés restaurer si l'utilisateur ne veut pas tout écraser.

### 8.3 Notification après modification importante

Quand une modification critique a lieu (suppression d'étudiant, modification massive, import qui écrase), un message discret apparaît :

```
┌──────────────────────────────────────────────────────┐
│  ✓ Modification enregistrée. [Annuler]               │
└──────────────────────────────────────────────────────┘
```

Le bouton « Annuler » est facile à voir et accessible pendant quelques secondes.

### 8.4 Notification de protection externalisée

Quand un snapshot est externalisé vers la Réserve :

```
┌──────────────────────────────────────────────────────┐
│  💾 Sauvegarde automatique vers ta Réserve effectuée │
└──────────────────────────────────────────────────────┘
```

Discret. Confirme à l'utilisateur que la protection est active.

---

## 9. Compromis et limites

### 9.1 Espace de stockage

Le versioning consomme de l'espace. Estimation :

- Snapshots IndexedDB : ~150 Mo (avec rétention 24h/7j/4semaines/12mois).
- Journal IndexedDB : ~50 Mo (30 derniers jours).
- Snapshots externalisés Réserve : ~50 Mo par trimestre (rétention 14 jours).

Total IndexedDB : ~200 Mo. C'est conséquent mais loin de la limite (plusieurs Go). Sur disque : ~50 Mo par trimestre actif — négligeable.

### 9.2 Performance

Prendre un snapshot complet du trimestre = sérialiser ~5 Mo de données et écrire en IndexedDB = quelques centaines de millisecondes. Peut être imperceptible si fait pendant l'inactivité. Visible si fait au mauvais moment (pendant une saisie).

**Mitigation** : prendre les snapshots dans les périodes d'inactivité (utiliser `requestIdleCallback`), ou en arrière-plan via Web Worker. Ce sont des optimisations standard.

### 9.3 Versioning d'un format qui évolue

Quand le format des données change (migration, nouvelle version de Labo Codex), les snapshots anciens peuvent être dans un ancien format. Restaurer un snapshot ancien nécessite d'appliquer les migrations.

**Mitigation** : chaque snapshot porte la version d'app (`metadata.version_app`). À la restauration, l'app détecte la différence et applique les migrations nécessaires avant d'écrire les données.

Risque : une migration peut être lossy. Documenter clairement.

### 9.4 Limite fondamentale — un attaquant peut détruire l'historique

Si un payload détruit tout (IndexedDB + Réserve via FSAPI rémanent), les mécanismes A et B disparaissent avec. Seul C limite cet impact si la Réserve est protégée.

Pour vraiment robuste contre cette menace : externalisation **hors du périmètre FSAPI de Labo Codex**. Par exemple, sauvegarder vers un dossier où Labo Codex n'a pas le handle FSAPI persisté — l'utilisateur doit consentir à chaque accès. Ou vers un service externe (iCloud Drive synchronisé sans handle FSAPI direct).

### 9.5 Limite ergonomique

Trop de versioning peut noyer l'utilisateur. Si chaque clic produit une entrée de journal, le panneau Historique devient illisible. Calibrer la granularité — journaliser ce qui est récupérable, pas chaque interaction.

---

## 10. Plan de mise en œuvre en trois phases

### 10.1 Phase 1 — Snapshots automatiques + restauration (3-4 semaines)

Objectif : mettre en place la couche A (snapshots) avec rétention progressive et restauration manuelle.

**Code** :
- Module `js/snapshots.js`.
- Politique de rétention (24h/7j/4sem/12mois).
- Modification du wrapper `db.set` pour déclencher les snapshots événementiels.
- Interface dans le menu : nouveau panneau « Historique ».
- Dialogue de restauration avec aperçu des changements perdus.

**Effort** : 3-4 semaines.

**Effet** : couverture immédiate des erreurs humaines et des destructions limitées. Pas de protection contre destruction massive d'IndexedDB (qui détruit aussi les snapshots).

### 10.2 Phase 2 — Journal des modifications + annulation granulaire (2-3 semaines)

Objectif : ajouter la couche B (journal) avec annulation fine.

**Code** :
- Module `js/journal-modifications.js`.
- Liste `CLES_JOURNALISEES` (à valider — démarrer avec les clés critiques).
- Modification du wrapper `db.set` pour journaliser.
- UI : section « Modifications récentes » du panneau Historique.
- Annulation : bouton « Annuler » dans les notifications après modification.

**Effort** : 2-3 semaines.

**Effet** : granularité fine, transparence et auditabilité.

### 10.3 Phase 3 — Externalisation vers la Réserve (2-3 semaines)

Objectif : protection contre la destruction massive via externalisation.

**Code** :
- Module `js/externalisation.js`.
- Intégration dans `reserve.js` pour utiliser le handle FSAPI existant.
- Politique d'externalisation périodique (1 fois/jour minimum).
- UI : notification de sauvegarde, accès aux snapshots externalisés dans le panneau Historique.

**Effort** : 2-3 semaines.

**Effet** : protection contre les scénarios D-01, D-03 du modèle de menaces. Combiné avec révocation FSAPI (doc A §10.2 et `MODELE-MENACES.md` Défense D), couverture robuste.

### 10.4 Effort total

Phases 1+2+3 : ~7-10 semaines de code à temps partiel. C'est un chantier substantiel mais l'effet est immédiat dès la Phase 1.

---

## 11. Questions ouvertes pour Grégoire

### Q1 — Quelle politique de rétention par défaut ?

Time Machine classique (24h/7j/4sem/12mois) ou autre découpage ? Préfères-tu plus de granularité courte (toutes les 15 min sur les 6 dernières heures) ou plus de couverture longue (gardons des snapshots mensuels sur 2 ans) ?

### Q2 — Quelles clés journaliser en Phase 2 ?

Toutes les CRITIQUE et SENSIBLE ? Seulement les modifications de notes finales (qui sont les plus à risque réputationnel) ?

### Q3 — Externalisation automatique ou manuelle ?

Phase 3 : externalisation **automatique** à intervalle régulier (sans intervention) ou **proposée** à l'utilisateur (notification « veux-tu externaliser maintenant ? ») ?

### Q4 — Snapshots des bibliothèques ?

Les bibliothèques partagées (grilles, échelles, cartouches) sont-elles incluses dans les snapshots ? Avantage : récupération des grilles si elles sont corrompues (D-02). Inconvénient : volume × N trimestres.

### Q5 — UX de l'annulation ?

L'annulation d'une modification doit-elle être **toujours possible** (même après mois et années) ou **limitée à un délai** (par exemple 7 jours) ?

### Q6 — Intégration avec le chiffrement (doc A) ?

Si le chiffrement est activé, les snapshots sont chiffrés aussi. Mais cela signifie que la restauration nécessite le mot de passe. Acceptable ?

### Q7 — Snapshots avant chaque session de vibe coding ?

Veux-tu un mécanisme qui propose explicitement « Tu vas modifier du code. Faire un snapshot avant ? » quand tu ouvres certains modules ? Surcouche développeur de la résilience standard.

---

## Synthèse en une page

**Question** : comment se protéger contre la destruction et la perte irréversible des données ?

**Réponse courte** : trois mécanismes complémentaires de versioning :

1. **Snapshots automatiques** dans IndexedDB (capture périodique de l'état complet, rétention progressive 24h/7j/4sem/12mois).
2. **Journal des modifications** (chaque modification critique enregistrée avec valeur avant/après, annulation granulaire).
3. **Externalisation vers la Réserve sur disque** (les snapshots auto survivent à la destruction d'IndexedDB).

**Pourquoi c'est important pour toi** : c'est l'angle qui répond le plus directement à ta crainte centrale de destruction et de perte de patrimoine. Le chiffrement (doc A) protège contre la **lecture** non autorisée. Le versioning protège contre la **perte** — c'est ta priorité.

**Stratégie de rétention** :
- Tous les snapshots des dernières 24h.
- Un par jour des 7 derniers jours.
- Un par semaine des 4 dernières semaines.
- Un par mois des 12 derniers mois.

**Espace utilisé** : ~200 Mo dans IndexedDB, ~50 Mo dans la Réserve par trimestre. Gérable.

**Plan en trois phases** :
1. **Phase 1** (3-4 sem) — Snapshots automatiques + restauration manuelle.
2. **Phase 2** (2-3 sem) — Journal des modifications + annulation granulaire.
3. **Phase 3** (2-3 sem) — Externalisation vers la Réserve.

**Couverture des scénarios du modèle de menaces** :
- D-01 (Bombe à retardement) : restauration depuis snapshot externalisé après incident.
- D-02 (Corruption silencieuse) : journal montre les modifications suspectes, annulation ciblée.
- D-03 (Effacement FSAPI) : externalisation vers dossier hors handle FSAPI persistant.
- Erreur humaine : annulation granulaire via journal.

**Recommandation immédiate** : Phase 1 peut démarrer après les Quick Wins du `MODELE-MENACES.md` §8.2. C'est compatible avec le chantier chiffrement (doc A) — pas de blocage entre les deux.

**Compromis fondamental** : si un payload détruit IndexedDB et la Réserve simultanément (cas extrême), les snapshots disparaissent aussi. Mitigation : combinaison avec révocation FSAPI rémanente (`MODELE-MENACES.md` Défense D) pour rendre l'attaque sur la Réserve plus difficile.

---

## Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Analyse de l'état actuel de résilience, trois mécanismes (snapshots, journal, externalisation), architecture proposée, UX du panneau Historique, plan en trois phases, sept questions ouvertes. |

---

**Fin du document B. Document C (Anonymisation) suit.**
