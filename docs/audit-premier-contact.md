# Audit UX — Premier Contact d'un Nouvel Utilisateur

> **OBSOLETE depuis Beta 99.21 (21 avril 2026)** — Cet audit decrit le flow
> avant la consolidation onboarding (retrait primo-* / parcours-apprentissage /
> tutoriel-interactif / modal-bienvenue). L'accueil V3 + tour guide 6 etapes +
> fleches didactiques sont desormais l'unique parcours d'onboarding.

**Date d'audit** : 18 avril 2026  
**Version** : Beta 99.18 (Build 0418-0655)  
**Contexte** : localStorage vide, IndexedDB vide, navigation privée ou nouvel utilisateur absolu  
**Délai couvert** : 0–10 secondes après ouverture de `app.codexnumeris.org`

---

## Artefacts UI Affichés Automatiquement au Premier Contact

### 1. BULLES D'APPRENTISSAGE (Animation parallaxe en en-tête)

**Nom/ID** : `#bulles-container` → `.bulle-trajectoire` × N  
**Fichier source** : `js/main.js:284–388`  
**CSS** : `index.html:1465–1560` (`.bulles-container`, `.bulle`, `@keyframes floatUp`)

**Condition de déclenchement** :  
- TOUJOURS affichées au chargement (pas de condition localStorage)
- Nombre généré = nombre d'étudiants du groupe, ou 10 par défaut si aucun groupe
- Logique : `const nbEtudiants = obtenirDonneesSelonMode('groupeEtudiants').length || 10`

**Timing** :  
- Immédiat lors de `DOMContentLoaded` → `genererBullesApprentissage()` ligne 391
- Pas de délai (`setTimeout`)
- Positionnées et animées dès le rendu

**Contenu affiché** :  
- Cercles blancs colorés sans texte
- Tailles : petite, moyenne, grande (effet parallaxe)
- Animation : mouvement hélicoïdal (floatUp) + spin vertical (bulle-helice)
- Durée d'animation : 30–120 secondes selon taille (grandes rapides, petites lentes)

**Action utilisateur attendue** :  
- Aucune (décoration, crée une atmosphère de mouvement)

**Interdépendances** :  
- Régénérées si clé `groupeEtudiants` change (event `storage`)
- Aucune dépendance sur les modales ou la navigation

---

### 2. MODAL BIENVENUE

**Nom/ID** : `#modal-bienvenue` / `.modal-bienvenue-overlay`  
**Fichier source** : `js/modal-bienvenue.js:143–217`

**Condition de déclenchement** :  
- Affichage SI et SEULEMENT SI `estPremierLancement() === true`
- Vérification multiples :
  1. Clé localStorage `bienvenue_vu` !== 'true'
  2. Clé db `bienvenue_vu` !== true
  3. Aucun cours ne doit exister (`db.getSync('listeCours', []).length === 0`)
  4. Aucune donnée trimestre (`db.getSync('informationsTrimestre', {}).dateDebut === undefined`)

**Timing** :  
- Déclenché par `DOMContentLoaded` → `initialiser()` ligne 233
- Avec délai `setTimeout(..., 500)` — apparaît ~500ms après le chargement du DOM
- Appel chaîné : `verifierEtAfficher()` → `estPremierLancement()` → `afficherModal()`

**Texte affiché** (citations exactes) :
```
Titre : "Bienvenue dans Monitorage"
Sous-titre : "Ton outil de suivi pédagogique"
Corps : "Cette application t'aide à suivre la progression de tes étudiants,
         gérer les présences et évaluer les productions en continu."
```

**Repères affichés** :
- ✉️ "Nouveautés — Corrections et nouvelles fonctionnalités"
- 🗺️ "Tour guidé — Aide contextuelle et navigation générale"
- ⚠️ "Rappel backup — Protection de tes données"

**Boutons présents** :
1. "🗺️ Étape par étape" (`data-action="modalBienvenue.commencerConfiguration"`)
   - Lance `window.parcours.setMode('explicite')`
   - Ferme le modal
   - Active le tour guide
   - Déclenche `afficherModalAccueil()` après 300ms
2. "🧭 Par exploration" (`data-action="modalBienvenue.explorerApplication"`)
   - Lance `window.parcours.setMode('decouverte')`
   - Ferme le modal
   - Appelle `entrerEnDemo()` après 500ms
   - Affiche notification "🧭 Explore librement..."

**Action au clic sur bouton** :
- Marque le modal comme vu : `db.setSync('bienvenue_vu', 'true')`
- Définit le prochain rappel backup à 14 jours
- Ferme le modal avec animation CSS `.modal-bienvenue-fermeture` (200ms)

**Interdépendances** :
- N'apparaît PAS si `#modal-bienvenue` existe déjà (double-check ligne 145)
- Masque/prévient l'affichage du `modal-backup-reminder` (voir logique ligne 28–30 du backup-reminder)
- La fermeture déclenche l'ouverture du modal Primo accueil (si mode explicite)

---

### 3. MODAL BACKUP REMINDER

**Nom/ID** : `#overlay-backup-reminder` → `#modal-backup-reminder`  
**Fichier source** : `js/modal-backup-reminder.js:132–192`

**Condition de déclenchement** :  
- Affichage SI `doitAfficherModal() === true` ligne 27
- Contrôles :
  1. `#modal-bienvenue` ne doit PAS exister (ligne 29)
  2. `backupNePlusRappeler` !== 'true' (ligne 34–36)
  3. `backupProchainRappel` === null OU date passée (ligne 40–51)
- **Au premier contact absolu** : Aucun rappel enregistré → affichage immédiat

**Timing** :  
- Déclenché via `initialiser()` ligne 199–207
- Avec délai `setTimeout(..., 1500)` — apparaît ~1.5s après le chargement
- Attente intentionnelle pour que le bienvenue se ferme en premier

**Texte affiché** (citations exactes) :
```
Titre : "Protège tes données"
Alerte (rouge) : "Tes données sont stockées LOCALEMENT dans ton navigateur.
                  Personne d'autre n'y a accès, mais elles peuvent être PERDUES si :
                  - Tu effaces l'historique de navigation (avec « données de sites »)
                  - Tu utilises la NAVIGATION PRIVÉE
                  - Tu changes de navigateur (Chrome ≠ Safari ≠ Firefox)
                  - Tu réinstalles ton navigateur ou changes d'ordinateur"
Alerte (info) : "Solution : Exporte régulièrement tes données via
                 Réglages → Données. Le fichier JSON peut être réimporté
                 à tout moment pour restaurer tes données."
```

**Sélecteur de rappel** (ID `select-rappel-backup`) :
- Valeurs : "7" (défaut), "14" (sélectionné), "30", "jamais"
- Défaut sélectionné : "Dans 14 jours"

**Boutons** :
1. "J'ai compris" (`data-action="backupReminder.gererChoixRappel"`)
   - Sauvegarde le choix : `definirProchainRappel(jours)` ou `desactiverRappels()`
   - Ferme le modal
2. "Exporter maintenant" (`data-action="backupReminder.allerVersExport"`)
   - Ferme le modal
   - Navigue vers `Réglages → Gestion des données`
   - Définit rappel à 7 jours

**Clés localStorage/db affectées** :
- `backupProchainRappel` (date ISO de la prochaine affichage)
- `backupNePlusRappeler` ('true' si désactivé)

**Interdépendances** :
- Apparaît APRÈS `modal-bienvenue` (conditionnelle ligne 29)
- En premier contact : aucune interdépendance réelle, mais timing délai 1.5s vs 0.5s

---

### 4. PASTILLE NOUVEAUTÉS (Badging)

**Nom/ID** : `.pastille-nouveautes` (span intégré dans bouton "Nouvelles")  
**Fichier source** : `js/init-inline.js:144–198` ; `js/accueil.js:189`

**Condition de déclenchement** :  
- Affichage en rouge (🔴) SI :
  1. `localStorage.getItem('monitorage-version-vue') !== VERSION_MAJEURE` (nouvelle version majeure)
  2. OU `localStorage.getItem('monitorage-build-vu') !== BUILD_ID` (nouveau build)

**Logique de vérification** (`verifierNouveautes()` ligne 144–156) :
```javascript
const nouvelleVersionMajeure = versionVue !== VERSION_MAJEURE;
const nouveauBuild = buildVu !== BUILD_ID;
const aDesNouveautes = nouvelleVersionMajeure || nouveauBuild;
```

**Timing** :  
- Mise à jour de l'affichage au `DOMContentLoaded` → `mettreAJourPastille()` ligne 362
- Immédiat (pas de délai)
- Aussi appelée lors du rendu accueil ligne 203

**Contenu affiché** :  
- Vide (texte blanc "") si pas de nouveautés
- 🔴 (emoji point rouge U+1F534) si `aDesNouveautes === true`
- Titre du parent : "Nouveautés disponibles" ou "Nouveautés"

**Action utilisateur attendue** :  
- Clic sur le bouton "✉️ Nouvelles" → appelle `afficherModalNouveautes()` ligne 175–198

**Comportement au clic** (`afficherModalNouveautes()` ligne 175) :
- Si nouvelle version majeure : ouvre `#modalNouveautes` (modal complet)
- Sinon (juste build nouveau) : ouvre aussi `#modalNouveautes` (avec section testeurs)
- Marque VERSION et BUILD comme vus → pastille disparaît

**Clés localStorage** :
- `monitorage-version-vue` : VERSION_MAJEURE actuelle
- `monitorage-build-vu` : BUILD_ID actuel

**Interdépendances** :
- Dépend de l'existence de la pastille dans le DOM
- Ne dépend d'aucun autre artefact UI

---

### 5. MODAL NOUVEAUTÉS (Changelog)

**Nom/ID** : `#modalNouveautes` / `.modal-overlay.actif`  
**Fichier source** : Généré dynamiquement par `js/init-inline.js:349–352`  
**Changelog data** : `js/changelog-data.js` (structure et contenu des versions)

**Condition de déclenchement** :  
- Déclenché par clic sur pastille ou bouton "Nouvelles"
- Pas d'affichage automatique au démarrage (dépend du clic utilisateur)

**Timing** :  
- N/A (dépend d'une action utilisateur, pas d'affichage automatique)
- Note : Générateur du contenu s'exécute au `DOMContentLoaded` ligne 350

**Contenu affiché** :  
- Titre : "Récemment mis à jour"
- Pour chaque version : `version.numero`, `version.titre`, couleur badge, liste d'items
- Format : "Beta 99", "Consolidation", items puntiformes (max 6–8 par version)

**Boutons/Actions** :
- Fermeture : clic sur overlay ou bouton fermer (X)
- Appelle `fermerModalNouveautes()` ligne 217–222

**Interdépendances** :
- Dépend de `#changelog-contenu` existant dans le DOM
- Dépend de fonction globale `genererChangelogHTML()` (définie ailleurs)

---

### 6. BANDEAU MISE À JOUR (Notification de nouvelle version)

**Nom/ID** : `#bandeau-mise-a-jour` (classe `.bandeau-mise-a-jour`)  
**Fichier source** : `js/init-inline.js:373–428`  
**CSS** : Styles dans `index.html` ou `styles.css`

**Condition de déclenchement** :  
- Affichage SI le build actuel n'a pas encore été vu
- Logique ligne 420–423 :
```javascript
const bandeauVu = localStorage.getItem(CLE_BANDEAU_VU);
if (bandeauVu !== BUILD_ID) {
    afficherBandeauVersion(VERSION_MAJEURE, BUILD_ID, false);
}
```

**Timing** :  
- Au `DOMContentLoaded` : vérification immédiate + affichage ligne 419–423
- Polling distant : première vérif après 30s, puis toutes les 5 min (ligne 426–427)

**Contenu affiché** :
```
Header : "➡︎ [BETA {VERSION} (BUILD {BUILD_ID})]"
Texte : "Ce projet est en développement actif."
Corps : "Une mise à jour a été déployée en arrière-plan pendant que tu travailles. 
         Rafraîchis la page pour l'activer. Tes données persistent."
Footer : "[DATE] à [HEURE]"
```

**Action utilisateur** :
- Bouton "Rafraîchir" → `location.reload()` (recharge la page)
- Bouton "X" (fermer) → appelle `fermerBandeauMiseAJour()` → `localStorage.setItem(CLE_BANDEAU_VU, BUILD_ID)`

**Clés localStorage** :
- `monitorage-bandeau-vu` : BUILD_ID du dernier bandeau vu

**Interdépendances** :
- Polling distant peut détecter une nouvelle version et afficher le bandeau même si build local n'a pas changé
- Si nouveau build détecté : `afficherBandeauVersion(...)` avec `distant=true`

---

### 7. VERSION/BUILD DANS L'EN-TÊTE

**Nom/ID** : `#version-entete` (span avec texte version), `#build-numero` (span avec texte build)  
**Fichier source** : `js/init-inline.js:227–236`, 294–334

**Condition de déclenchement** :  
- TOUJOURS affichée si éléments existent dans le DOM
- Texte chargé depuis `version.json` (source unique) ou fallback de `index.html`

**Timing** :  
- Fallback immédiat : `afficherBuildNumero()` ligne 356
- Chargement version.json : asynchrone via `chargerVersionJSON()` ligne 359
  - Sur file:// : XHR synchrone (fallback clair)
  - Sur http/https : fetch asynchrone
- En cas de scripts périmés : rechargement automatique de la page (ligne 268–281)

**Contenu affiché** :
```
#version-entete : "Beta {VERSION_MAJEURE} - Consolidation"
#build-numero : "(Build {BUILD_ID})"
```

**Interdépendances** :
- Dépend de `version.json` (synchronisation)
- En cas de mismatch build local vs version.json : tentative de reload (line 266–273)

---

### 8. SECTION D'ACCUEIL (Affichage par défaut)

**Nom/ID** : `#accueil-contenu` (conteneur principal)  
**Fichier source** : `js/accueil.js:17–204` (fonction `afficherAccueil()` et `afficherAccueilContenu()`)

**Condition de déclenchement** :  
- Affichée PAR DÉFAUT sauf si :
  1. `modeExpert === true` → affiche `apercu` (tableau de bord)
  2. `demo-actif === 'true'` → affiche `apercu`
- Logique ligne 416–424 du `main.js` :
```javascript
const _modeExpert = !!obtenirPreference('modeExpert');
const _demoActif = db.getSync('demo-actif', null) === 'true';
if (_demoActif) {
    afficherSection('apercu');
} else if (_modeExpert) {
    afficherSection('apercu');
} else {
    afficherSection('accueil');
}
```

**Timing** :  
- Appelée immédiatement après `DOMContentLoaded` (ligne 220+ du main.js)
- Pas de délai

**Contenu affiché** :
1. **Hero** : Titre "Que souhaites-tu faire ?"
2. **Section Découvrir** : Accordéon avec checkboxes
   - "🚷 Données de démonstration" (`#checkbox-demo-accueil`)
     - Légende : "Explorer avec des données fictives"
   - "🗺️ Tour guidé" (`#checkbox-tour-guide-accueil`)
     - Légende : "Afficher les conseils contextuels"
   - "💬 Info-bulles" (`#checkbox-tooltips-accueil`)
     - Légende : "Décrire l'interface au survol"
   - "ℹ️ Aide contextuelle" (`#checkbox-aide-contextuelle-accueil`)
     - Légende : "Afficher les repères d'aide"

3. **Panneau Parcours** (si `window.parcours` existe)
   - Généré par `window.parcours.genererPanneauParcours()`
   - Affiche progression ou CTA selon état

4. **Section Piloter** : 8 cartes d'action (data-action, data-param)
   - "🧠 Planifier ton cours"
   - "🎨 Configurer ta pratique de notation"
   - "📋 Saisir les présences"
   - "📈 Voir l'état des lieux"
   - "📥 Importer des travaux"
   - "📝 Annoter et évaluer"
   - "👤 Consulter un profil étudiant"
   - "🚩 Préparer des interventions"

5. **Utilitaires** : Deux boutons
   - "💾 Sauvegarder" → `data-action="ouvrirModalBackup"`
   - "✉️ Nouvelles" → `data-action="afficherModalNouveautes"` (avec pastille)

6. **Pied de page**
   - Logo Codex Numeris
   - Lien "codexnumeris.org"
   - Tagline "Réfléchir, expérimenter, partager."

**État des checkboxes** (reflètent preferences) :
- `#checkbox-demo-accueil.checked` = `estEnModeDemo() || !aDesCoursReels`
- `#checkbox-tour-guide-accueil.checked` = `obtenirPreference('tourGuide')`
- `#checkbox-tooltips-accueil.checked` = `obtenirPreference('tooltips') !== false`
- `#checkbox-aide-contextuelle-accueil.checked` = `obtenirPreference('aideContextuelle') !== false`

**Actions au changement** :
- Chaque checkbox a un `data-on-change="handler"` (délégation phase 5)
- Handlers : `toggleDemoHandler`, `toggleTourGuideHandler`, `toggleTooltipsHandler`, `toggleAideContextuelleHandler`

**Interdépendances** :
- Appelle `mettreAJourPastille()` après rendu (ligne 203) pour actualiser badge nouveautés
- Dépend de fonctions globales comme `entrerEnDemo()`, `quitterDemo()`, `definirTourGuide()`, etc.
- L'accordéon "Découvrir" est fermé par défaut (accordéon-header sans contenu affiché)

---

### 9. BANDEAU DÉMO (Conditionnel)

**Nom/ID** : `#bandeau-demo` (classe `.bandeau-demo`, hidden par défaut `.u-hide`)  
**Fichier source** : Index HTML ; contrôle via `js/donnees-demo.js`

**Condition de déclenchement** :  
- Affichage SI `db.getSync('demo-actif', null) === 'true'`
- Au premier contact : NON affiché (sauf si utilisateur active la checkbox "Données de démo")

**Timing** :  
- Affichage déclenché par la fonction `entrerEnDemo()` (appelée si checkbox cochée)
- Pas d'affichage automatique au démarrage

**Contenu affiché** :
```
Texte : "Mode démonstration"
Bouton : "Quitter" → data-action="quitterDemo"
```

**Interdépendances** :
- Visible SEULEMENT après activation de la démo
- Masqué au démarrage (`classList.add('u-hide')`)

---

### 10. BANDEAU GROUPE-COURS (Conditionnel)

**Nom/ID** : `#bandeau-groupe-cours` (classe `.bandeau-groupe-cours`)  
**Fichier source** : Contrôle dynamique (à scanner)

**Condition de déclenchement** :  
- Affichage SI un groupe-cours est actif
- Au premier contact : NON affiché (pas de groupe configuré)

**Timing** :  
- Affichage dépend de la configuration d'un groupe
- Pas d'affichage automatique au démarrage (contexte nouvel utilisateur)

---

### 11. BANDEAU ARCHIVE (Conditionnel)

**Nom/ID** : `#bandeau-archive` (classe `.bandeau-archive`, hidden par défaut `.u-hide`)  
**Fichier source** : Index HTML

**Condition de déclenchement** :  
- Affichage SI trimestre archivé
- Au premier contact : NON affiché (aucun trimestre)

**Timing** :  
- N/A (pas d'affichage automatique pour nouvel utilisateur)

---

## Séquence Temporelle Probable d'Apparition

```
Temps    Événement
────────────────────────────────────────────────────────────────
0ms      Page commence à charger (parsing HTML)
↓
Xms      DOM parsed, assets CSS chargés
↓
0ms      DOMContentLoaded déclenché
  ├─ Bulles d'apprentissage générées (immédiat)
  ├─ Navigation initialisée (immédiat)
  ├─ Accueil affiché (immédiat) → pastille actualisée
  ├─ Bandeau mise à jour vérifié/affiché (immédiat)
  ├─ Build numéro affiché (immédiat)
  ├─ Changelog chargé dans le modal (immédiat)
  ├─ version.json chargé asynchrone (immédiat, callback asynchrone)
  └─ setTimeout(..., 30000) pour polling distant (30s)
  
500ms    Modal Bienvenue affiché (setTimeout 500)
  ├─ Condition : estPremierLancement() === true
  └─ Contient 2 boutons (Étape par étape / Exploration)
  
1500ms   Modal Backup Reminder affiché (setTimeout 1500)
  ├─ Condition : doitAfficherModal() && !modal-bienvenue
  └─ Contient sélecteur rappel + 2 boutons

Au-delà de 10s : Modal Accueil Primo (si bouton "Étape par étape" cliqué)
               → Page d'accueil affichée avec tous les checkboxes initialisés
```

---

## Superpositions et Concurrences (0–10s)

### Affichés en parallèle :
1. **Bulles + Accueil** : Dès 0ms (pas de conflit)
2. **Accueil + Bandeau mise à jour** : Dès 0ms (bandeau en haut, accueil en bas)
3. **Bandeau mise à jour + Bandeau démo** : Jamais en parallèle (démo requires action)
4. **Pastille nouveautés** : Intégrée au bouton "Nouvelles" de l'accueil (pas de conflit)

### Affichés séquentiellement :
1. **Accueil** (0ms) → **Modal Bienvenue** (500ms) : Le bienvenue est un overlay, masque partiellement l'accueil
2. **Modal Bienvenue** (500ms) → **Modal Backup Reminder** (1500ms) : Backup attend que Bienvenue se ferme (condition ligne 29)

### Ordre de priorité (z-index implicite) :
1. Modal Bienvenue (position:fixed, z-index modal standard)
2. Modal Backup Reminder (position:fixed, z-index modal standard)
3. Bandeau mise à jour (position:fixed, z-index:99999 si scripts périmés → z-index plus élevé que modales)
4. Accueil + Bulles (z-index normal)

---

## Clés localStorage/IndexedDB Qui Contrôlent Ces Affichages

### Version et Nouveautés :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `monitorage-version-vue` | init-inline.js | VERSION_MAJEURE (ex: "99.18") | Pastille + Modal Nouveautés |
| `monitorage-build-vu` | init-inline.js | BUILD_ID (ex: "0418-0655") | Pastille + Bandeau mise à jour |
| `monitorage-bandeau-vu` | init-inline.js | BUILD_ID | Bandeau mise à jour (ne pas réafficher) |

### Bienvenue et Setup initial :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `bienvenue_vu` | modal-bienvenue.js | 'true' | Modal Bienvenue (ne pas réafficher) |
| `primo_accueil_vu` | primo-accueil.js | true (boolean) | Modal Primo Accueil (ne pas réafficher) |

### Backup et Protection données :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `backupProchainRappel` | modal-backup-reminder.js | ISO date string | Modal Backup (date passée = réafficher) |
| `backupNePlusRappeler` | modal-backup-reminder.js | 'true' | Modal Backup (ne pas réafficher) |

### Préférences utilisateur :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `modeExpert` | accueil.js + preferences | true / false | Section affichée (apercu vs accueil) |
| `tourGuide` | ?? | true / false | Checkbox "Tour guidé" + affichage aide |
| `tooltips` | ?? | true / false | Checkbox "Info-bulles" + affichage infobulle |
| `aideContextuelle` | ?? | true / false | Checkbox "Aide contextuelle" + repères |

### Démo et contexte :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `demo-actif` | donnees-demo.js | 'true' | Section affichée (apercu) + Bandeau démo |
| `demo-etat-precedent` | donnees-demo.js | objet d'état | Restauration après sortie démo |

### Globales/Données :
| Clé | Propriétaire | Valeur attendue | Affichage contrôlé |
|-----|---|---|---|
| `listeCours` | cours.js | [] | Condition premier lancement (bienvenue) |
| `informationsTrimestre` | trimestre.js | {} | Condition premier lancement (bienvenue) |
| `groupeCoursActif` | ?? | ID groupe ou null | Bandeau groupe-cours (hidden vs visible) |
| `groupeEtudiants` | ?? | [] | Nombre de bulles générées |

---

## Éléments visibles mais sans localStorage (Toujours affichés)

1. **Bulles d'apprentissage** : Générées via JS pure, pas de condition localStorage
2. **Accueil (section par défaut)** : Affichée par défaut sauf si modeExpert ou demo-actif
3. **Bandeau mise à jour** : Affichage immédiat si build non vu
4. **Navigation principale** : Toujours présente
5. **Bulles-container** : Conteneur toujours dans le DOM

---

## Cas Limite : Utilisateur Réapparaît Après N Jours

**Scénario** : Utilisateur revient 8 jours plus tard

Clés qui auront changé :
- `monitorage-version-vue` : Comparée à nouvelle VERSION_MAJEURE
- `monitorage-build-vu` : Comparée à nouveau BUILD_ID
- `backupProchainRappel` : Date passée → Modal Backup réapparaît

Affichages relancés :
- Pastille nouveautés (si version ou build changed)
- Modal Backup Reminder (si 14 jours passés et choix par défaut)
- Bandeau mise à jour (si build serveur > build vu)

---

## Éléments CSS Critiques (Hidden par défaut)

```css
.u-hide {
    display: none !important;
}

Appliqué par défaut à :
- #bandeau-demo
- #bandeau-archive
```

---

## Timing Résumé pour Architecture

| Artefact | Délai | localStorage check | Ordre |
|---|---|---|---|
| Bulles | 0ms | Aucun | 1er |
| Accueil | 0ms | `modeExpert`, `demo-actif` | 2e |
| Bandeau mise à jour | 0ms | `monitorage-bandeau-vu` | 3e |
| Version/Build header | 0ms + async | version.json | 4e |
| Modal Bienvenue | 500ms | `bienvenue_vu` + listeCours + trimestre | 5e |
| Modal Backup | 1500ms | `backupProchainRappel` + !bienvenue | 6e |
| Polling distant | 30s puis 5m | BUILD_ID distant | 7e |

---

## Tests de Vérification (Checklist)

- [ ] localStorage vide → Modal Bienvenue apparaît à 500ms
- [ ] Aucun cours configuré → Bienvenue non masqué
- [ ] Bienvenue fermé → Backup apparaît à 1500ms
- [ ] Backup "ne plus rappeler" → N'apparaît plus jamais
- [ ] Build change dans version.json → Bandeau mise à jour affiché
- [ ] Accueil affichée avec 8 cartes "Piloter" + checkboxes "Découvrir"
- [ ] Pastille rouge apparaît si version ou build nouveau
- [ ] Bulles générées = nombre d'étudiants (ou 10 par défaut)
- [ ] En mode démo : section apercu affichée au lieu d'accueil
- [ ] En mode expert : section apercu affichée au lieu d'accueil

---

**Document généré le 18 avril 2026 - Exhaustif et sans modifications appliquées**

---

## Annexe — Observation empirique sur iPad (18 avril 2026, 08:13–08:15)

Captures réalisées par Grégoire dans `User Xperience/IMG_6003.PNG` à `IMG_6013.PNG`.
Contexte : iPad Safari, onglet privé pour tenter de simuler un nouvel utilisateur.
URL cible : `app.codexnumeris.org`.

### Chronologie observée

**Phase 0 — Avant l'application (étapes externes à Labo Codex)**

1. **IMG_6003 (08:13)** — Cloudflare Bot Challenge.
   - Écran noir avec logo Cloudflare, texte « Vérification de sécurité en cours » et case à cocher « Vérifiez que vous êtes humain ».
   - Imposé par Cloudflare, pas par l'app. Ajoute une étape avant même d'accéder au contenu.

2. **IMG_6004 (08:13)** — Cloudflare Access Login.
   - Écran clair avec logo Cloudflare Access, titre « Codex Numeris beta », champ email, bouton « Send me a code ».
   - Le domaine passe à `*.cloudflareaccess.com`.
   - Login obligatoire par code email (deux facteurs implicite).

3. **IMG_6005 (08:14)** — Saisie du code (6 chiffres).
   - Champ « Enter code », clavier iPad affiché.
   - Bouton « Sign in ».

→ Au total 3 écrans externes avant que l'application ne se charge. Friction justifiée (accès restreint aux testeurs), mais à noter : **aucun de ces écrans ne prépare psychologiquement à ce qui arrivera ensuite dans l'app**.

**Phase 1 — Arrivée dans l'app (chargement initial)**

4. **IMG_6006 (08:14)** — Premier écran Labo Codex.
   - Onglet Safari **normal** (pas privé — la barre affiche « Lecteur disponible »).
   - **Deux éléments se superposent simultanément** dès l'arrivée :
     - Modale « Bienvenue dans Monitorage — Ton outil de suivi pédagogique » (centre-haut, bloquante)
     - Toast orange en haut-droit : « BETA 99.15 (BUILD 0418-0805) / Ce projet est en développement actif. / Une mise à jour a été déployée en arrière-plan pendant que tu travailles. Rafraîchis la page pour l'activer. Tes données persistent. / 18 avril 2026 à 08:14 / RECHARGER »
   - En arrière-plan partiellement visible : badge « Codex » à gauche, éléments de navigation, pastille.
   - La modale de bienvenue expose 3 icônes (Nouveautés / Tour guidé / Rappel backup) et une question « Comment préfères-tu apprendre un nouvel outil ? » avec deux cartes (Étape par étape / Par exploration).
   
   **Observation forte** : le toast orange et la modale bienvenue sont incompatibles conceptuellement. Le toast dit « une mise à jour est arrivée pendant que tu travailles » — mais l'utilisateur **vient tout juste d'arriver**, il ne « travaillait » pas. Le message est factuellement faux pour un nouvel arrivant.

**Phase 2 — Après fermeture de la modale bienvenue**

5. **IMG_6007 (08:14)** — Page d'accueil après dismissal.
   - En-tête complet visible : « Labo Codex / Un espace de travail pour la pratique enseignante / Beta 99.15 - Consolidation (Build 0418-0805) / samedi 18 avril 2026 ».
   - **Groupe-cours actif : « Groupe demo (Lun-AM / Mer-PM) » + mode « Normal »** — le mode démo est déjà activé automatiquement, l'utilisateur n'a rien choisi.
   - **Tooltip contextuel déclenché par effleurement** sur l'icône maison : « Retour à la page d'accueil du système ».
   - Long bloc de texte descriptif (« Labo Codex permet de donner un regard à l'enseignant·e sur sa propre pratique… »), philosophique, dense.
   - Bandeau bas : « Mode démonstration » + bouton « Quitter la démo ».
   - Toast orange toujours présent.

6. **IMG_6008 (08:14)** — Onglet Suivi > Aperçu.
   - « Aperçu / Suivi de l'apprentissage et priorisation des interventions ».
   - En-tête Observer : « Données de démonstration | 601-101 gr. demo | 20 personnes ».
   - Échelle Fragile/Modéré/Favorable/Très favorable + barres A (92%) et début de C.
   - Toast orange toujours présent.

7. **IMG_6009 (08:14)** — Lecture du texte de présentation (plein écran).
   - Le texte s'étale sur 6 paragraphes denses : « Labo Codex permet… », « À quoi sert ce labo ? », « Qu'est-ce que ça change ? », « Qu'est-ce que ça demande ? », « Labo Codex est un commun à construire. »
   - Lien bas : « Retrouver ce texte dans Aide → Introduction ».

**Phase 3 — Exploration de l'accueil**

8. **IMG_6010 (08:15)** — Hub « Que souhaites-tu faire ? ».
   - Accordéon **Découvrir** avec 4 cartes cochables : Données de démonstration / Tour guidé / Info-bulles / Aide contextuelle (Info-bulles + Aide contextuelle sont pré-cochées).
   - Accordéon **Parcourir — 0/13** avec toggle Assistance / Exploration, sections Configurer (Créer un trimestre/cours/groupe-cours) et Construire (Créer une pratique/grille/échelle).
   - Bandeau bas : Mode démonstration / Quitter la démo.

**Phase 4 — Modale de migration inattendue**

9. **IMG_6011 (08:15)** — **Modale « Mise à jour de tes données »** surgit par-dessus le contenu.
   - Titre : « Mise à jour de tes données ».
   - Texte : « L'application Monitorage a beaucoup évolué récemment pour mieux répondre aux besoins des enseignants. Pour profiter de toutes les nouvelles fonctionnalités, tes données doivent être réorganisées une seule fois. »
   - Bloc bleu « Ce qui change » : trimestres multiples, cours-groupes, comptage en périodes.
   - Bloc jaune « 2 ensemble(s) de données détecté(s) » : « La migration va créer un trimestre à partir de tes données actuelles. Aucune donnée ne sera perdue. »
   - Bloc vert « Rassure-toi » + bloc « Conseil » : exporter les données d'abord.
   - Boutons : « Plus tard » / « Migrer mes données ».
   - Contexte : cet iPad contenait des données d'une version antérieure — la migration n'apparaît pas sur un navigateur totalement vierge. Mais pour un testeur qui revient après plusieurs semaines, c'est un artefact majeur non anticipé dans l'inventaire technique initial.

**Phase 5 — État « propre » en onglet privé**

10. **IMG_6012 (08:15)** — Onglet Safari privé (titre « app.codexnumeris.org – Privé »).
    - En-tête Labo Codex avec « samedi 18 avril 2026 », aucune pastille Parcours visible.
    - Groupe-cours actif : « -- Sélectionne un trimestre -- ».
    - Onglet Suivi > Aperçu affiché vide.
    - **Bug de rendu** : en-tête Observer affiche `emo | — | 0 personne` — le mot « démo » semble tronqué en « emo ». Voir fichier `js/evaluations-apercu.js` ou équivalent pour la source de cette chaîne. Affecte l'état vide.
    - Barres d'indices (Assiduité, Complétion) affichées mais sans contenu.

11. **IMG_6013 (08:15)** — Hub « Que souhaites-tu faire ? » en onglet privé.
    - Structure identique à IMG_6010 mais accordéon Construire inclut ici aussi « Créer une production » (5e item).
    - Pas de bandeau « Mode démonstration » en bas → en onglet privé totalement vierge, le mode démo n'est pas auto-activé.

### Problèmes confirmés par l'observation

1. **Empilement à l'arrivée** (IMG_6006) — Modale bienvenue + Toast « Recharger » simultanés. Le toast est factuellement incorrect pour un nouvel arrivant.

2. **Mode démo auto-activé sur onglet normal** (IMG_6007–IMG_6008) — contradiction avec la mémoire projet qui dit « Le groupe démo est maintenant géré via checkbox dans Réglages → Trimestre ». À vérifier : est-ce un artefact de migration ? Une préférence par défaut ? Un bug ?
   - Onglet privé total (IMG_6013) ne montre PAS le bandeau Mode démo — confirme que ce n'est pas un état vierge par défaut, mais un état hérité d'une configuration antérieure.

3. **Bug de rendu « emo »** (IMG_6012) — chaîne tronquée dans l'en-tête de l'état vide du module Suivi > Aperçu > Observer. Probablement un dataset vide mal formaté.

4. **Modale migration surgissant après interaction** (IMG_6011) — non inventoriée dans la phase technique, parce qu'elle dépend de la présence de données d'une version antérieure. C'est un flow de migration majeur qui devrait être documenté et testé séparément.

5. **Texte de présentation très long et dense** (IMG_6009) — philosophique, pas task-oriented. Peut rebuter un néophyte qui cherche juste à commencer.

6. **Tooltips au survol non maîtrisés** (IMG_6007) — apparaissent au moindre effleurement iPad, ajoutent du bruit visuel.

7. **Deux hubs d'accueil concurrents** — la page d'accueil textuelle (IMG_6007/6009) et le hub « Que souhaites-tu faire ? » (IMG_6010/6013). Deux portes d'entrée se chevauchent.

### Éléments non inventoriés dans la phase technique — à ajouter

- Système de migration de données (détection + modale)
- Activation automatique du mode démo (source et condition exactes à confirmer)
- Tooltips contextuels (déclencheurs iPad vs desktop)
- Bug « emo » dans l'état vide du dataset

### Recommandation pour la phase 2 (plan de travail)

Ne pas agir tant que n'est pas résolu :
- Contradiction entre l'inventaire technique (auto-démo non censé être activé) et l'observation (auto-démo activé).
- Inventaire complet de la modale migration et ses conditions.
- Source exacte du bug « emo ».

Ces trois points doivent être clarifiés AVANT qu'on définisse le plan de refonte, sinon on risque de traiter des symptômes sans voir la cause.

---

## Annexe B — Vécu utilisateur rapporté par Grégoire (18 avril 2026)

Retours à chaud après l'exploration des captures IMG_6003 à IMG_6013. Verbatim conservé autant que possible.

### a) Bug de persistance — Checkbox démo
> « J'ai beaucoup décoché la checkbox de démo dans la page d'accueil, on me renvoie automatiquement à la page Aperçu, et quand je reviens à la page d'accueil la checkbox est encore cochée. »

**Diagnostic implicite** : le décochage ne persiste pas. Soit la clé localStorage n'est pas sauvegardée, soit la lecture/rendu ne reflète pas l'état stocké. Redirection vers Aperçu est un comportement UX additionnel à examiner : est-ce désiré? Surprend l'utilisateur.

**À investiguer** : `js/donnees-demo.js` (`basculerDonneesDemo` probable), clé de persistance, flux de redirection après changement de mode.

### b) Texte philosophique de présentation — déjà retiré
> « Le texte philosophique n'a pas du tout sa place ici. Il a d'ailleurs été retiré hier, mais ce changement est sur une build qui n'est pas déployée. »

**Statut** : correctif déjà appliqué dans `refonte-preferences-rlo`, pas encore en prod (`main`).

### c) Refonte UX d'icônes et d'ergonomie — déjà faite
> « Nous avons passé la journée d'hier à une refonte de l'UX pour intégrer des icônes et rendre l'interface plus ergonomique et significative. Cette build n'est pas déployée. »

**Statut** : 20+ commits sur `refonte-preferences-rlo` dont refactoring icônes (commit `592c2d7`), retrait manifeste accueil (`9ed544f`), chantier RLO étapes 1–9, refonte des préférences. Non déployé en prod.

**Conséquence** : les captures d'aujourd'hui reflètent une version obsolète. Plusieurs des problèmes listés ci-dessous peuvent déjà être résolus par le travail d'hier.

### d) Hub « Que souhaites-tu faire ? » — absence de guidance
> « À la question "Que souhaites-tu faire" je ne sais pas quoi répondre. Je coche les cases mais je ne sais pas plus quoi faire après. »

**Problème** : l'utilisateur est mis devant un choix sans contexte. Cocher des cases n'amène pas d'action concrète. Pas de fléchage vers « la prochaine chose à faire ».

### e) « Parcourir » → « Configurer » — barrière à l'entrée
> « À ce niveau de mon expérience, je ne m'estime pas en mesure de "parcourir" l'application. La première étape "Configurer" me fait un peu peur. »

**Problème** : le vocabulaire « Configurer un trimestre / un cours / un groupe-cours » présuppose une maîtrise qu'un néophyte n'a pas. C'est du vocabulaire d'administrateur système, pas d'invitation à la découverte.

### f) « Piloter » — demande trop
> « La dernière proposition "piloter" m'en demande encore trop. Je ne suis pas là pour "planifier mon cours", etc. »

**Problème** : le verbe « piloter » et l'action « planifier mon cours » sont hauts en responsabilité. L'utilisateur qui arrive ne veut pas piloter, il veut comprendre. La hiérarchie proposée (Découvrir → Parcourir → Piloter) semble logique sur papier mais chaque niveau escalade la demande.

### g) « Nouvelles » — jargon technique au lieu d'accompagnement
> « J'ai un peu d'espoir en scrollant vers le bas et en voyant un point rouge sur "Nouvelles" : va-t-on me dire où je suis et quoi faire ? Je clique : du jargon technique. Alors j'explore en allant dans la page "Aperçu" qui n'a pas de nom dans cette build. Il n'y a aucune donnée même si j'ai tout activé dans la page d'accueil. Je vois des barres colorées avec rien dedans et des tableaux vides. »

**Trois problèmes distincts ici** :
1. Le changelog est rédigé pour les initiés (nouvelles fonctionnalités, corrections techniques), pas comme aide à l'onboarding. Faux espoir.
2. La page « Aperçu » n'a pas de titre visible sur cette build de prod (corrigé dans la branche?).
3. Barres colorées vides même après activation de toutes les cases « Découvrir » — bug d'état vide + le mode démo ne charge visiblement pas les données fictives annoncées.

### h) Structure → Alignement pédagogique → Plan de leçon → page vide
> « Je passe à "Structure", je tombe sur "Alignement pédagogique" et je ne sais pas ce que c'est. Je clique sur "Plan de leçon" et je tombe sur une page vide. »

**Problèmes** :
- Vocabulaire non défini au premier contact (« Alignement pédagogique » = terme métier du projet, voir SKILL_Alignement.md).
- Sous-sections mènent à des pages vides sans état initial, sans guide « commencer ici ».

### Verdict utilisateur
> « Bref, cette première expérience est un désert d'apprentissage dans un chaos d'informations incompréhensibles. Pas très concluant. »

Les deux images clés du verdict : **désert** (absence de contenu, de guide, de données) et **chaos** (surabondance d'éléments concurrents à l'arrivée). C'est l'angle qui doit guider la refonte : **quel chemin unique propose-t-on à un arrivant pour que l'application lui devienne lisible?**

### Problèmes confirmés indépendants du chantier branche

Les points suivants ne sont probablement pas corrigés par le travail en branche :
- **(a) Bug checkbox démo non persistante** — logique de persistance, pas cosmétique.
- **(d) Manque de guidance après choix dans le hub** — pas de « et maintenant, clique ici ».
- **(e) « Parcourir/Configurer » intimidant** — structure des niveaux à repenser.
- **(f) « Piloter » trop ambitieux** — nomenclature et hiérarchie.
- **(g1) Changelog rédigé pour initiés** — à orienter utilisateur final dans les entrées « Nouvelles ».
- **(g3) Barres vides malgré activation démo** — bug de chargement/rendu.
- **(h) Pages vides non-guidées** — besoin d'états initiaux qui orientent.

Ces 7 points nécessitent un chantier distinct, même après que le travail d'hier sera déployé.


