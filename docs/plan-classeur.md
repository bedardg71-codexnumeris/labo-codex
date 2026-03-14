# Plan de travail — Classeur (flux USB multi-appareil)

> **Principe** : La clé USB est le cloud personnel. L'appareil n'est qu'un terminal.
> **Nom UX** : "Classeur"
> **Valeurs** : Sobre en carbone, sécuritaire, autonome, open source, gratuit.

---

## Vision architecturale

```
┌─────────────────────────────────────┐
│         Interface utilisateur        │
│  [Ouvrir]  [Enregistrer]  [Fusion]  │
├─────────────────────────────────────┤
│       Couche d'abstraction           │
│    "Classeur" (workspace portable)   │
├──────────┬──────────┬───────────────┤
│ IndexedDB│  FSAPI   │  ZIP (fichier)│
│ (cache)  │ (dossier)│  (universel)  │
│ toujours │ Chrome   │  Safari/iPad  │
│  actif   │ Mac/PC   │  + archivage  │
└──────────┴──────────┴───────────────┘
         ↕              ↕
      Local          Clé USB
```

---

## Phase 1 — Le cœur (COMPLÉTÉE — Beta 98.5, commit 8f1fc57)

Objectif : Ouvrir et sauvegarder un Classeur ZIP depuis/vers n'importe quel emplacement (clé USB incluse), sur Mac ET iPad.

### Étape 1.1 — Module `js/classeur.js` (fondations)

**Fichier** : `js/classeur.js` (nouveau)

**Responsabilités** :
- Générer un Classeur ZIP (métadonnées + blobs)
- Lire un Classeur ZIP et charger dans IndexedDB
- Gérer le manifeste (`classeur-manifeste.json`)
- Exposer l'API globale : `window.Classeur`

**Format du Classeur ZIP** :
```
MonClasseur.classeur.zip
├── classeur-manifeste.json    ← identité, version, timestamps
├── donnees.json               ← toutes les métadonnées (clés namespacées)
└── travaux/                   ← blobs PDF/images
    ├── FT_abc123.pdf
    ├── FT_def456.jpg
    └── ...
```

**Manifeste** (`classeur-manifeste.json`) :
```json
{
  "formatVersion": 1,
  "appVersion": "98.4",
  "nom": "Cours 601-101 — H2026",
  "auteur": "Grégoire Lebeau",
  "dateCreation": "2026-03-14T10:00:00",
  "dateDerniereModification": "2026-03-14T14:30:00",
  "appareilOrigine": "MacBook Pro — Chrome",
  "trimestre": "h2026",
  "contenu": {
    "cles": ["h2026_groupeEtudiants", "h2026_presences", ...],
    "nombreFichiersTravaux": 42,
    "tailleTotaleOctets": 187000000
  },
  "historique": []
}
```

**API publique** :
```javascript
window.Classeur = {
  // Générer un ZIP Classeur depuis IndexedDB
  genererClasseur(options) → Promise<Blob>

  // Charger un ZIP Classeur dans IndexedDB
  chargerClasseur(fichierZip) → Promise<{manifeste, stats}>

  // Vérifier si un fichier est un Classeur valide
  validerClasseur(fichierZip) → Promise<{valide, erreurs}>

  // Obtenir le manifeste sans charger les données
  lireManifeste(fichierZip) → Promise<manifeste>

  // État courant
  etatClasseur() → {derniereSauvegarde, modificationsNonSauvees, nom}
};
```

**Sous-tâches** :
- [ ] 1.1a — Créer le squelette du module (IIFE, 'use strict', API exposée)
- [ ] 1.1b — Implémenter `genererClasseur()` : collecte clés + blobs → ZIP
- [ ] 1.1c — Implémenter `chargerClasseur()` : ZIP → IndexedDB + blobs
- [ ] 1.1d — Implémenter `validerClasseur()` et `lireManifeste()`
- [ ] 1.1e — Tracking des modifications (flag `modificationsNonSauvees`)
- [ ] 1.1f — Tests manuels : export → reimport → vérification intégrité

---

### Étape 1.2 — Sauvegarde multi-plateforme (`navigator.share` + fallback)

**Fichier** : intégré dans `js/classeur.js`

**Problème** : `<a download>` ne permet pas de choisir la destination sur iPad Safari.

**Solution** : détection de capacités, 3 stratégies :

```javascript
async function sauvegarderClasseur(blob, nomFichier) {
  // 1. FSAPI (Chrome/Edge — choix de destination natif)
  if (window.showSaveFilePicker) {
    const handle = await showSaveFilePicker({
      suggestedName: nomFichier,
      types: [{ description: 'Classeur', accept: { 'application/zip': ['.zip'] } }]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  // 2. Web Share API (iPad Safari — "Enregistrer dans Fichiers")
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], nomFichier)] })) {
    await navigator.share({
      files: [new File([blob], nomFichier, { type: 'application/zip' })],
      title: 'Classeur — ' + nomFichier
    });
    return;
  }

  // 3. Fallback (<a download> — téléchargements par défaut)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Sous-tâches** :
- [ ] 1.2a — Implémenter `sauvegarderClasseur()` avec les 3 stratégies
- [ ] 1.2b — Implémenter `ouvrirClasseur()` (file picker universel)
- [ ] 1.2c — Tester sur Mac Chrome (FSAPI)
- [ ] 1.2d — Tester sur iPad Safari (navigator.share)
- [ ] 1.2e — Tester fallback (Firefox, etc.)

---

### Étape 1.3 — Bouton dans l'en-tête

**Fichiers** : `index.html`, `styles.css`, `js/classeur.js`

**Emplacement** : `.entete-controles-gauche`, à côté du sélecteur Normal/Anonymisé

**HTML** :
```html
<div class="entete-controles-gauche">
    <!-- Sélecteur mode existant -->
    <div id="selecteur-mode" class="selecteur-mode-centre" data-tooltip="entete-mode-affichage"></div>

    <!-- NOUVEAU : Bouton Classeur -->
    <div id="classeur-controle" class="classeur-controle" data-tooltip="entete-classeur">
        <button id="btn-classeur" class="btn-action-header btn-classeur" onclick="Classeur.ouvrirMenu()">
            <span class="classeur-icone">📁</span>
            <span class="classeur-label">Classeur</span>
            <span id="classeur-indicateur" class="classeur-indicateur u-hide"></span>
        </button>
    </div>
</div>
```

**Indicateur visuel** :
- Pastille orange : modifications non sauvegardées
- Pastille verte : tout est sauvegardé
- Pas de pastille : aucun classeur actif (travail local seulement)

**Menu déroulant** (au clic sur le bouton) :
- "Ouvrir un classeur..." → file picker
- "Enregistrer le classeur" → sauvegarde vers la dernière destination
- "Enregistrer sous..." → choix de destination
- Séparateur
- "Nouveau classeur" → crée un classeur vide
- "Détails du classeur" → affiche le manifeste (nom, date, taille, nb fichiers)

**Sous-tâches** :
- [ ] 1.3a — HTML du bouton + menu déroulant dans index.html
- [ ] 1.3b — CSS cohérent avec le design system (styles.css)
- [ ] 1.3c — JS du menu déroulant (ouvrirMenu, fermerMenu)
- [ ] 1.3d — Branchement des actions (ouvrir, enregistrer, etc.)
- [ ] 1.3e — Indicateur de modifications non sauvegardées
- [ ] 1.3f — Tooltip d'aide contextuelle
- [ ] 1.3g — Tests visuels mode sombre + clair
- [ ] 1.3h — Tests iPad (cibles tactiles 44px, espacement)

---

### Étape 1.4 — Limite de taille relevée

**Fichier** : `js/import-export.js`

**Changement** : augmenter `TAILLE_MAX_IMPORT_OCTETS` pour les ZIP de 200 Mo à 1 Go.

**Sous-tâches** :
- [ ] 1.4a — Modifier la constante (ligne ~596-597)
- [ ] 1.4b — Tester avec un fichier > 200 Mo

---

### Ordre d'exécution Phase 1

```
1.1a (squelette) → 1.1b (export) → TEST
                 → 1.1c (import) → TEST
                 → 1.1d (validation) → TEST
                 → 1.1e (tracking modifs) → TEST
→ 1.2a-b (save/open multi-plateforme) → TEST Mac → TEST iPad
→ 1.3a-h (UI en-tête) → TEST visuel
→ 1.4 (limite taille) → TEST
→ 1.1f (test intégration complet : export Mac → USB → iPad → USB → Mac)
```

---

## Phase 2 — TimeMachine (EN COURS — 14 mars 2026)

Objectif : Versionner automatiquement les données du classeur pour permettre de revenir à un état antérieur.

### Architecture

Le dossier `historique/` dans le ZIP contient des snapshots de `donnees.json` (pas les blobs — trop lourds et rarement modifiés).

**Format ZIP enrichi** :
```
MonClasseur.classeur.zip
├── classeur-manifeste.json    ← avec champ historique[]
├── donnees.json               ← version courante
├── travaux/                   ← blobs (inchangé)
└── historique/                ← NOUVEAU
    ├── 2026-03-14T10-00-00.json
    ├── 2026-03-13T14-30-00.json
    └── ...
```

**Stockage intermédiaire (IndexedDB)** :
- `_classeur_hist_index` — index des snapshots [{date, appareil, taille}]
- `_classeur_snapshot_avant` — données au moment du dernier chargement/sauvegarde
- `_classeur_hist_<DATE>` — contenu de chaque snapshot

**Rotation** : max 10 snapshots ET max 30 jours (le plus restrictif).

### Étape 2.1 — Infrastructure (COMPLÉTÉE — commit 9eedefa)

- Constantes : `DOSSIER_HISTORIQUE`, `MAX_SNAPSHOTS`, `MAX_JOURS_HISTORIQUE`
- `_purgerHistorique()` : rotation max 10 / 30 jours, nettoyage IDB
- `_ecrireHistoriqueDansZip()` : IDB → ZIP
- `_chargerHistoriqueDepuisZip()` : ZIP → IDB
- `_nettoyerHistoriqueIDB()` : nettoyage complet

### Étape 2.2 — Branchement dans les flux (COMPLÉTÉE — commit 20442df)

- `genererClasseur()` : archive le snapshot précédent, rotation, écrit historique dans ZIP
- `chargerClasseur()` : capture snapshot + charge historique existant du ZIP
- `fermerClasseur()` : nettoie l'historique IDB
- Manifeste enrichi avec champ `historique[]`

### Étape 2.3 — Restauration (COMPLÉTÉE — commit bf11f3e)

- `actionRestaurer()` : prompt() avec liste numérotée, confirm() de sécurité
- Archivage automatique des données actuelles avant écrasement
- Synchronisation cache localStorage après restauration
- Bouton "Historique des versions..." dans le menu (visible si classeur actif)

### Étape 2.4 — Comparaison visuelle (COMPLÉTÉE — commit à venir)

- `_comparerDonnees(ancien, actuel)` : diff par clé (ajoutées, supprimées, modifiées via JSON.stringify)
- `_formaterDiff(diff)` : affichage lisible avec regroupement par préfixe (ex: `h2026_*`)
- `_grouperParPrefixe(cles)` : condense les clés similaires (>3 → "prefixe_* (N clés)")
- `actionComparer()` : prompt() pour choisir un snapshot, compare vs données actuelles, alert() du résumé
- Bouton "Comparer avec une version..." dans le menu (visible si classeur actif)

## Phase 3 — Multi-classeur + fusion (EN COURS — #227)

### Cas d'usage

L'enseignant utilise Labo Codex sur Mac et iPad. Chaque appareil a son propre classeur ZIP sur clé USB.
En fin de semaine, il veut fusionner les deux classeurs en un seul état cohérent.

### Architecture proposée

```
Classeur A (Mac)          Classeur B (iPad)
├── donnees.json          ├── donnees.json
├── travaux/              ├── travaux/
└── historique/           └── historique/
         ↓                         ↓
    ┌─────────────────────────────────┐
    │     Fusion intelligente          │
    │  1. Comparer les clés            │
    │  2. Auto-merge (timestamp)       │
    │  3. Conflits → choix utilisateur │
    └─────────────────────────────────┘
                  ↓
         Classeur fusionné
```

### Stratégie de fusion

Pour chaque clé présente dans un ou les deux classeurs :
- **Clé uniquement dans A** → prendre A
- **Clé uniquement dans B** → prendre B
- **Clé dans A et B, valeurs identiques** → garder (pas de conflit)
- **Clé dans A et B, valeurs différentes** → CONFLIT
  - Auto-résolution par `dateDerniereModification` du manifeste ? Trop grossier (c'est global, pas par clé)
  - Meilleure approche : comparer avec l'ancêtre commun (dernier snapshot partagé)
  - Si un seul côté a changé vs ancêtre → prendre celui qui a changé
  - Si les deux ont changé → conflit réel → choix utilisateur

### Étapes d'implémentation

#### Étape 3.1 — Lecture d'un classeur externe (sans import) (COMPLÉTÉE — 14 mars 2026)

- `lireClasseurExterne(fichierZip)` → extrait donnees.json + manifeste SANS écrire dans IndexedDB
- Retourne `{manifeste, donnees, travauxListe, _zip}` en mémoire seulement
- API publique : `Classeur.lireExterne(fichierZip)`
- `_zip` conservé pour extraction ultérieure des blobs lors de la fusion

#### Étape 3.2 — Analyse de fusion (diff 3 parties) (COMPLÉTÉE — 14 mars 2026)

- `_analyserFusion(local, externe, ancetre)` : diff 3 parties avec ancêtre commun, 2 parties sans
- 8 catégories : ajouteesLocal/Externe, modifieesLocal/Externe, supprimeesLocal/Externe, conflits, identiques
- `_analyserFusionTravaux(travauxLocal, travauxExterne)` : diff blobs par chemin
- `_formaterAnalyseFusion(analyse, analyseTravaux)` : résumé lisible avec regroupement par préfixe
- Ignore les clés internes `_classeur_*`

#### Étape 3.3 — Résolution des conflits (COMPLÉTÉE — 14 mars 2026)

- `_resoudreConflits(analyse, donneesLocales, donneesExternes, analyseTravaux)` : flux interactif
- Auto-résolution des cas non-conflictuels (ajoutées, modifiées, supprimées d'un seul côté)
- 4 stratégies pour les conflits : tout local, tout externe, un par un, annuler
- Résolution un par un : prompt() avec `_resumerValeur()` (type + taille de chaque valeur)
- Retourne `{resolutions: {clé→'local'|'externe'|'supprimer'}, importerTravaux, annule}`

#### Étape 3.4 — Fusion des blobs (travaux) (COMPLÉTÉE — 14 mars 2026)

- `_fusionnerTravaux(zipExterne, donneesExternes, cheminsAImporter, onProgression)`
- Extrait l'ID du chemin (`travaux/FT_abc.pdf` → `FT_abc`), récupère métadonnées depuis `fichiersTravaux`
- Stocke via `travauxStockage.stockerBlob()`, callback progression + `_yield()`
- Fusionne la liste `fichiersTravaux` locale (ajout sans doublon par ID)
- Retourne `{importes, ignores, erreurs}`

#### Étape 3.5 — Action menu "Fusionner avec un classeur..." (COMPLÉTÉE — 14 mars 2026)

- `actionFusionner()` : flux complet en 12 étapes avec overlay progression
- File picker → `lireClasseurExterne()` → collecte IDB locale → ancêtre commun (snapshot)
- `_analyserFusion()` + `_analyserFusionTravaux()` → `_resoudreConflits()` (interaction)
- Application : `db.set()` (externes), `db.remove()` (supprimées) → `syncToLocalStorageCache()`
- `_fusionnerTravaux()` pour blobs → `marquerModification()` → résumé final alert()
- Bouton "Fusionner avec un classeur..." dans menu (`index.html`), visible si classeur actif
- API publique : `Classeur.actionFusionner()`
- `_actualiserMenu()` mis à jour pour `classeur-menu-fusionner`

#### Étape 3.6 — Export sélectif par trimestre (COMPLÉTÉE — 14 mars 2026)

- `_detecterTrimestresDisponibles(donnees)` : scan des préfixes de clés (regex `[ah]\d{4}|demo`)
- `_filtrerDonneesPourExport(donnees, trimestres, inclureGlobales)` : filtre par préfixe, inclut globales
- `_filtrerTravauxPourExport(donneesFiltrees, chemins)` : garde les blobs référencés uniquement
- `_formaterNomTrimestre(prefixe)` : "h2026" → "Hiver 2026", "a2025" → "Automne 2025"
- `actionExporterSelection()` : flux complet — collecte IDB → détection trimestres → prompt choix
  (numéros séparés par virgules ou "tous") → filtrage → résumé/confirm → ZIP partiel → sauvegarde
- ZIP partiel : donnees.json filtrées + blobs associés + manifeste (sans TimeMachine)
- Manifeste enrichi : `exportSelectif: true`, `trimestresInclus: [...]`
- Garde-fous : 0 trimestre → message, 1 seul trimestre → redirige vers export complet
- Bouton "Exporter une sélection..." toujours visible dans le menu (pas besoin de classeur actif)
- API publique : `Classeur.actionExporterSelection()`
- **Note** : filtre par groupe-cours non implémenté (trop invasif — nécessiterait de filtrer le contenu des tableaux)

## Phase 4 — Auto-save FSAPI (COMPLÉTÉE — 14 mars 2026)

Objectif : Sauvegarder automatiquement le classeur vers la clé USB sans dialogue, sur Chrome/Edge.

### Étape 4.1 — Handle FSAPI persistant (COMPLÉTÉE)

- Variable `_fileHandle` (mémoire seulement, non sérialisable, perdu au rechargement)
- `actionOuvrir()` utilise `showOpenFilePicker` (Chrome/Edge) pour obtenir un handle dès l'ouverture
- `sauvegarderVersDestination(blob, nom, {forcerDialogue})` : si handle existe → ré-écriture directe sans dialogue
- `actionEnregistrer()` réutilise le handle (zéro dialogue après 1re sauvegarde)
- `actionEnregistrerSous()` force le dialogue (`forcerDialogue: true`), met à jour le handle
- `fermerClasseur()` nettoie le handle
- `etatClasseur()` expose `handleFSAPI: true/false`
- Helper `_ecrireViaHandle(handle, blob)` factorisé pour réutilisation
- Si le handle échoue (clé USB retirée), nettoie et redemande proprement

### Étape 4.2 — Auto-save à intervalle (COMPLÉTÉE)

- Constante `AUTO_SAVE_DELAI` : 5 minutes (300 000 ms)
- `_demarrerAutoSave()` : `setInterval` déclenché quand un handle FSAPI est obtenu
- `_arreterAutoSave()` : nettoyage quand handle perdu ou classeur fermé
- `_executerAutoSave()` : gardes (handle? actif? modifs? pas en cours?) → `genererClasseur({silencieux: true})` → `_ecrireViaHandle()`
- `genererClasseur({silencieux: true})` : nouveau paramètre qui désactive l'overlay de progression et la pause 500ms
- Notification discrète `afficherNotificationSucces('Auto-save', ...)` après chaque auto-save
- Si handle invalide (clé USB retirée) → arrête l'auto-save proprement
- `etatClasseur()` expose `autoSaveActif` et `derniereAutoSave`

### Étape 4.3 — Indicateur de connexion dans le menu (COMPLÉTÉE)

- Sous-texte `#classeur-menu-enreg-info` sous "Enregistrer" : "Vers le même emplacement" (si handle FSAPI)
- Ligne de statut `#classeur-menu-autosave` : "Auto-save actif — Toutes les 5 min — dernier : 11h45"
- Tooltip du bouton Classeur : nom + état auto-save + modifications
- `_actualiserMenu()` peuple dynamiquement ces éléments à chaque ouverture du menu
- CSS : `.classeur-menu-contenu`, `.classeur-menu-sous-texte`, `.classeur-menu-statut`

### Compatibilité

| Navigateur | Handle FSAPI | Auto-save | Indicateur |
|---|---|---|---|
| Chrome/Edge Mac | Oui | Oui (5 min) | Oui |
| Safari Mac | Non | Non | Non (fallback download) |
| iPad Safari | Non | Non | Non (fallback share/download) |

### À tester (prochaine session)

- Chrome Mac : Ouvrir → Enregistrer (dialogue) → Enregistrer (sans dialogue) → attendre 5 min → auto-save
- Chrome Mac : Retirer clé USB pendant auto-save → vérifier arrêt propre
- Safari Mac : vérifier aucune erreur, fallback download fonctionne

---

**Créé** : 14 mars 2026
**Statut** : Phases 1-4 complétées
