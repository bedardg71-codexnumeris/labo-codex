# Plan Beta 93.5 : Système Multi-Trimestres

**Date** : 11 décembre 2025
**Objectif** : Supporter plusieurs trimestres (cours-groupes) simultanément
**Version cible** : Beta 93.5

---

## 🎯 Contexte pédagogique

### Principe fondamental : Le trimestre comme unité

**Un "trimestre"** dans le système = **Une instance complète cours-groupe pour une session**

**Caractéristiques** :
- 1 session académique (H2026, A2026, etc.)
- 1 cours spécifique (601-101, 601-102, etc.)
- 1 groupe (01, 02, 03, 9999, etc.)
- 1 configuration complète (horaire, pratique, étudiants, évaluations, présences)

### Réalité enseignement collégial

Un·e enseignant·e peut avoir simultanément :
- **5 trimestres actifs** (5 combinaisons cours-groupe)
- **3 cours différents** (ex: 601-101, 601-102, 601-103)
- **1 session** (ex: H2026)

### Exemple concret (Grégoire)

**5 trimestres actifs en H2026** :
```
H2026-601-101-01 : 601-101 Écriture et littérature, Groupe 01 (30 étudiants)
H2026-601-101-02 : 601-101 Écriture et littérature, Groupe 02 (28 étudiants)
H2026-601-102-01 : 601-102 Littérature et imaginaire, Groupe 01 (32 étudiants)
H2026-601-102-03 : 601-102 Littérature et imaginaire, Groupe 03 (25 étudiants)
H2026-601-103-01 : 601-103 Littérature québécoise, Groupe 01 (29 étudiants)
```

**Trimestre actif** : L'enseignant sélectionne un des 5 trimestres pour travailler dessus

### Cas d'usage groupe démo

```
H2026-601-101-9999 : 601-101 Écriture et littérature, Groupe 9999 (10 étudiants fictifs)

→ Suppression facile : supprimer le trimestre → tout disparaît (étudiants, évaluations, présences)
```

---

## 📊 Architecture proposée

### Hiérarchie des données

```
TRIMESTRE (instance cours-groupe pour une session)
    │
    ├─ Session (H2026, A2026)
    ├─ Cours (601-101, 601-102)
    ├─ Groupe (01, 02, 9999)
    ├─ Horaire (lundi 8h, mercredi 10h)
    ├─ Pratique de notation (PAN-Maîtrise, Sommative)
    │
    └─ DONNÉES
        ├─ Étudiants
        ├─ Productions
        ├─ Évaluations
        └─ Présences
```

### Structure de données

#### 1. Trimestres (localStorage.trimestres - NOUVEAU NOM pour listeCours)

**Changement majeur** : `listeCours` → `trimestres` (chaque entrée = instance cours-groupe complète)

```javascript
{
    // IDENTIFIANT UNIQUE
    id: "H2026-601-101-01",           // 🆕 Format : SESSION-SIGLE-GROUPE

    // INFORMATION SESSION
    session: "H2026",                  // Session académique (H/A + année)
    annee: "2026",
    dateDebut: "2026-01-15",          // Début du trimestre
    dateFin: "2026-04-30",            // Fin du trimestre

    // INFORMATION COURS
    sigle: "601-101",                  // Code cours
    titre: "Écriture et littérature",
    competence: "4EF0",

    // INFORMATION GROUPE
    groupe: "01",                      // Numéro de groupe
    enseignant: "Grégoire Bédard",
    heuresHebdo: 4,

    // ASSOCIATIONS CONFIGURATION
    pratiqueId: "pan-maitrise",       // Pratique de notation du trimestre
    horaireId: "HORAIRE123",          // 🆕 Lien vers horaire spécifique (optionnel)

    // ÉTATS
    actif: true,                       // ✅ Trimestre actif (celui sur lequel on travaille)
    archive: false,                    // Trimestre terminé mais conservé
    dansBibliotheque: true,
    verrouille: false
}
```

**Notes importantes** :
- `id` unique par combinaison session-cours-groupe
- Un seul trimestre `actif: true` à la fois
- Plusieurs trimestres peuvent coexister (H2026-601-101-01, H2026-601-102-01, etc.)
- Désactiver/archiver un trimestre → toutes ses données deviennent inaccessibles

#### 2. Étudiants (localStorage.groupeEtudiants)
```javascript
{
    da: "2234567",
    prenom: "Émilie",
    nom: "Tremblay",
    programme: "500.A1",
    sa: false,
    groupe: "01",                      // ⚠️ Conservé pour compatibilité
    trimestreId: "H2026-601-101-01"   // 🆕 AJOUT : Lien vers trimestre précis
}
```

**Migration** : Ajouter `trimestreId` depuis le trimestre actif actuel

#### 3. Productions (localStorage.productions)
```javascript
{
    id: "PROD1234567890",
    nom: "Analyse littéraire",
    type: "artefact-portfolio",
    grilleId: "GRILLE1234567890",
    ponderation: 20,
    coursId: "601-101-h2026-01",      // ⚠️ À REMPLACER
    trimestreId: "H2026-601-101-01"   // 🆕 AJOUT : Lien vers trimestre
}
```

**Migration** : Renommer `coursId` → `trimestreId` (ou ajouter si absent)

#### 4. Évaluations (localStorage.evaluationsDetaillees)
```javascript
{
    id: "EVAL1234567890",
    da: "2234567",
    productionId: "PROD1234567890",
    trimestreId: "H2026-601-101-01",  // 🆕 AJOUT : Via production ou direct
    note: 0.82,
    // ... autres champs
}
```

**Migration** : Ajouter `trimestreId` depuis la production ou le trimestre actif

#### 5. Présences (localStorage.presences)

**Structure actuelle** : Objet avec dates comme clés
```javascript
{
    "2026-01-15": {
        presences: {
            "2234567": { present: true, heures: 2.0 }
        }
    }
}
```

**Structure proposée** : Ajout `trimestreId` dans chaque entrée
```javascript
{
    "2026-01-15": {
        trimestreId: "H2026-601-101-01",  // 🆕 AJOUT
        presences: {
            "2234567": { present: true, heures: 2.0 }
        }
    }
}
```

**Migration** : Ajouter `trimestreId` depuis le trimestre actif pour toutes les dates existantes

#### 6. Horaires (localStorage.horaire - optionnel)

**Structure actuelle** : Un seul horaire global
```javascript
{
    seances: [
        { jour: "Lundi", heureDebut: "08:00", heureFin: "10:00" },
        { jour: "Mercredi", heureDebut: "10:00", heureFin: "12:00" }
    ]
}
```

**Structure future (Beta 94)** : Horaires multiples par trimestre
```javascript
// localStorage.horaires (array)
[
    {
        id: "HORAIRE123",
        trimestreId: "H2026-601-101-01",
        seances: [...]
    }
]
```

**Beta 93.5** : On garde l'horaire global actuel, on ajoutera `horaireId` optionnel plus tard

---

## 🔧 Modifications nécessaires

### PHASE 1 : Migration données vers trimestreId

**Objectif** : Migrer toutes les données existantes pour utiliser `trimestreId` au lieu de `coursId`

#### 1.1 Renommer listeCours → trimestres

**Fichier** : `js/cours.js` (renommer en `js/trimestres.js` - optionnel)

**Migration automatique** :
```javascript
function migrerListeCoursVersTrimestres() {
    const anciensCours = db.getSync('listeCours', []);

    if (anciensCours.length > 0 && !db.getSync('trimestres')) {
        // Copier listeCours → trimestres
        db.setSync('trimestres', anciensCours);
        console.log(`✅ Migration: listeCours → trimestres (${anciensCours.length} trimestres)`);
    }
}
```

**Note** : On garde `listeCours` pour compatibilité Beta 93 pendant quelques versions

#### 1.2 Ajouter trimestreId aux étudiants

**Fichier** : `js/groupe.js`

**Migration automatique** :
```javascript
function migrerEtudiantsVersTrimestreId() {
    const etudiants = db.getSync('groupeEtudiants', []);
    const trimestreActif = obtenirTrimestreActif();

    if (!trimestreActif) {
        console.warn('⚠️ Aucun trimestre actif, migration impossible');
        return 0;
    }

    let nbMigres = 0;
    etudiants.forEach(e => {
        if (!e.trimestreId) {
            e.trimestreId = trimestreActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('groupeEtudiants', etudiants);
        console.log(`✅ Migration: ${nbMigres} étudiant(s) → trimestreId`);
    }

    return nbMigres;
}
```

#### 1.3 Migrer productions (coursId → trimestreId)

**Fichier** : `js/productions.js`

**Migration automatique** :
```javascript
function migrerProductionsVersTrimestreId() {
    const productions = db.getSync('productions', []);
    const trimestreActif = obtenirTrimestreActif();

    if (!trimestreActif) return 0;

    let nbMigres = 0;
    productions.forEach(p => {
        // Si coursId existe mais pas trimestreId, migrer
        if (p.coursId && !p.trimestreId) {
            p.trimestreId = trimestreActif.id;
            nbMigres++;
        }
        // Si aucun des deux, ajouter trimestreId
        else if (!p.coursId && !p.trimestreId) {
            p.trimestreId = trimestreActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('productions', productions);
        console.log(`✅ Migration: ${nbMigres} production(s) → trimestreId`);
    }

    return nbMigres;
}
```

#### 1.4 Ajouter trimestreId aux présences

**Fichier** : `js/saisie-presences.js`

**Migration automatique** :
```javascript
function migrerPresencesVersTrimestreId() {
    const presences = db.getSync('presences', {});
    const trimestreActif = obtenirTrimestreActif();

    if (!trimestreActif) return 0;

    let nbMigres = 0;
    Object.keys(presences).forEach(date => {
        if (!presences[date].trimestreId) {
            presences[date].trimestreId = trimestreActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('presences', presences);
        console.log(`✅ Migration: ${nbMigres} date(s) de présences → trimestreId`);
    }

    return nbMigres;
}
```

#### 1.5 Fonction de migration globale

**Fichier** : `js/main.js` ou nouveau `js/migrations.js`

```javascript
function executerMigrationsBeta935() {
    console.log('🔄 Démarrage migrations Beta 93.5...');

    const resultats = {
        trimestres: migrerListeCoursVersTrimestres(),
        etudiants: migrerEtudiantsVersTrimestreId(),
        productions: migrerProductionsVersTrimestreId(),
        presences: migrerPresencesVersTrimestreId()
    };

    const total = Object.values(resultats).reduce((sum, n) => sum + (n || 0), 0);

    if (total > 0) {
        console.log(`✅ Migrations Beta 93.5 terminées (${total} éléments migrés)`);
        afficherNotificationSucces('Données migrées vers Beta 93.5 !');
    } else {
        console.log('✅ Aucune migration nécessaire (déjà à jour)');
    }

    return resultats;
}
```

**Appel** : Au chargement de l'app, après initialisation DB

---

### PHASE 2 : Sélecteur de trimestre actif dans Réglages

**Objectif** : Permettre de choisir le trimestre actif depuis la page Réglages

#### 2.1 Interface utilisateur (index.html)

**Emplacement** : Réglages → En haut de la page (avant toutes les sections)

```html
<!-- RÉGLAGES -->
<section id="section-reglages" class="section">

    <!-- Sous-section: Configuration (NOUVEAU) -->
    <div id="reglages-configuration" class="sous-section active">
        <h2>Configuration du trimestre</h2>

        <div class="carte">
            <h3 class="carte-titre-bleu">Trimestre actif</h3>

            <div style="margin-bottom: 20px;">
                <label for="selecteurTrimestre" style="display: block; margin-bottom: 8px; font-weight: 600;">
                    Trimestre sur lequel vous travaillez actuellement :
                </label>
                <select id="selecteurTrimestre"
                        onchange="activerTrimestre(this.value)"
                        style="width: 100%; padding: 10px; font-size: 1rem; border: 1px solid var(--gris-moyen); border-radius: 4px;">
                    <!-- Options générées dynamiquement -->
                    <option value="">-- Aucun trimestre --</option>
                </select>

                <p class="text-muted" style="margin-top: 8px; font-size: 0.9rem;">
                    Toutes les données affichées (étudiants, évaluations, présences) concernent uniquement le trimestre actif.
                </p>
            </div>

            <div style="text-align: center;">
                <button onclick="ouvrirModalNouveauTrimestre()" class="btn btn-principal">
                    + Créer un nouveau trimestre
                </button>
            </div>
        </div>
    </div>

    <!-- Sous-section: Trimestre -->
    <div id="reglages-trimestre" class="sous-section">
        <h2>Trimestre</h2>
        <!-- Contenu existant -->
    </div>

    <!-- Etc. -->
</section>
```

#### 2.2 Génération du sélecteur (js/trimestres.js ou js/cours.js)

```javascript
function genererSelecteurTrimestres() {
    const selecteur = document.getElementById('selecteurTrimestre');
    if (!selecteur) return;

    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);

    // Vider le sélecteur
    selecteur.innerHTML = '<option value="">-- Aucun trimestre --</option>';

    // Grouper par session
    const parSession = {};
    trimestres.forEach(t => {
        if (!parSession[t.session]) parSession[t.session] = [];
        parSession[t.session].push(t);
    });

    // Générer options groupées par session
    Object.keys(parSession).sort().reverse().forEach(session => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = session;

        parSession[session].forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = `${t.sigle} - ${t.titre} (Groupe ${t.groupe})`;
            option.selected = t.actif;
            optgroup.appendChild(option);
        });

        selecteur.appendChild(optgroup);
    });
}
```

#### 2.3 Activation d'un trimestre (js/trimestres.js)

```javascript
function activerTrimestre(id) {
    const trimestres = db.getSync('trimestres', []);

    if (!id) {
        alert('Veuillez sélectionner un trimestre');
        return;
    }

    // Désactiver tous les trimestres
    trimestres.forEach(t => t.actif = false);

    // Activer le trimestre sélectionné
    const index = trimestres.findIndex(t => t.id === id);
    if (index !== -1) {
        trimestres[index].actif = true;
        db.setSync('trimestres', trimestres);

        // Recharger toutes les vues
        rafraichirToutesLesVues();

        afficherNotificationSucces('Trimestre activé !');
    }
}
```

#### 2.4 Rafraîchissement global des vues

```javascript
function rafraichirToutesLesVues() {
    // Recharger contexte (en-tête)
    if (typeof afficherContexte === 'function') {
        afficherContexte();
    }

    // Recharger liste étudiants
    if (typeof afficherListeEtudiants === 'function') {
        afficherListeEtudiants();
    }

    // Recharger tableau de bord
    if (typeof afficherTableauBord === 'function') {
        afficherTableauBord();
    }

    // Recharger productions
    if (typeof afficherTableauProductions === 'function') {
        afficherTableauProductions();
    }

    // Recharger présences (si visible)
    // ... etc.

    console.log('✅ Toutes les vues rechargées');
}
```

**Fichiers à modifier** :
- `index.html` : Ajouter section sélecteur en haut des Réglages
- `js/cours.js` : Renommer fonctions `activerCours` → `activerTrimestre`, ajouter `genererSelecteurTrimestres()`
- `js/main.js` : Créer `rafraichirToutesLesVues()` et exporter
- `js/contexte.js` : Utiliser `obtenirTrimestreActif()` au lieu de `obtenirCoursActif()`

---

### PHASE 3 : Filtrage par cours actif

**Modules à adapter** :

#### 3.1 Liste des étudiants (`js/etudiants.js`)
```javascript
// AVANT
const etudiants = db.getSync('groupeEtudiants', []);

// APRÈS
const coursActif = obtenirCoursActif();
const etudiants = db.getSync('groupeEtudiants', [])
    .filter(e => e.coursId === coursActif.id);
```

#### 3.2 Productions (`js/productions.js`)
```javascript
// Vérifier si filtrage déjà fait via coursId
// Sinon, ajouter filtrage similaire
```

#### 3.3 Présences (`js/saisie-presences.js`)
```javascript
// Filtrer les dates/présences du cours actif uniquement
const presences = db.getSync('presences', {});
// Filtrer par coursId dans chaque entrée
```

#### 3.4 Tableau de bord (`js/tableau-bord-apercu.js`)
```javascript
// Calculs sur étudiants du cours actif uniquement
const coursActif = obtenirCoursActif();
const etudiantsCours = obtenirEtudiantsCours(coursActif.id);
```

**Fonctions utilitaires à créer** :
```javascript
// js/cours.js
function obtenirCoursActif() {
    const cours = db.getSync('listeCours', []);
    return cours.find(c => c.actif) || cours[0] || null;
}

function obtenirEtudiantsCours(coursId) {
    const etudiants = db.getSync('groupeEtudiants', []);
    return etudiants.filter(e => e.coursId === coursId);
}

function obtenirProductionsCours(coursId) {
    const productions = db.getSync('productions', []);
    return productions.filter(p => p.coursId === coursId);
}

function obtenirPresencesCours(coursId) {
    // Implémenter selon structure présences
}
```

---

### PHASE 4 : Suppression en cascade

**Fonction modifiée** : `supprimerCours(id)` dans `js/cours.js`

```javascript
function supprimerCours(id) {
    const cours = db.getSync('listeCours', []);
    const coursASupprimer = cours.find(c => c.id === id);

    if (!coursASupprimer) return;

    if (coursASupprimer.verrouille) {
        alert('Déverrouillez ce cours avant de le supprimer');
        return;
    }

    // Compter les données liées
    const nbEtudiants = obtenirEtudiantsCours(id).length;
    const nbProductions = obtenirProductionsCours(id).length;
    // ... autres compteurs

    const confirmation = confirm(
        `Supprimer le cours ${coursASupprimer.sigle} Groupe ${coursASupprimer.groupe} ?\n\n` +
        `Cette action supprimera aussi :\n` +
        `- ${nbEtudiants} étudiant(s)\n` +
        `- ${nbProductions} production(s)\n` +
        `- Toutes les évaluations associées\n` +
        `- Toutes les présences associées\n\n` +
        `⚠️ Cette action est irréversible !`
    );

    if (!confirmation) return;

    // SUPPRESSION EN CASCADE

    // 1. Supprimer les étudiants du cours
    let etudiants = db.getSync('groupeEtudiants', []);
    etudiants = etudiants.filter(e => e.coursId !== id);
    db.setSync('groupeEtudiants', etudiants);

    // 2. Supprimer les productions du cours
    let productions = db.getSync('productions', []);
    const productionsIds = productions
        .filter(p => p.coursId === id)
        .map(p => p.id);
    productions = productions.filter(p => p.coursId !== id);
    db.setSync('productions', productions);

    // 3. Supprimer les évaluations liées aux productions supprimées
    let evaluations = db.getSync('evaluationsDetaillees', []);
    evaluations = evaluations.filter(e => !productionsIds.includes(e.productionId));
    db.setSync('evaluationsDetaillees', evaluations);

    // 4. Supprimer les présences du cours
    // (À implémenter selon structure)

    // 5. Supprimer le cours lui-même
    const nouveauxCours = cours.filter(c => c.id !== id);

    // 6. Activer un autre cours si nécessaire
    if (coursASupprimer.actif && nouveauxCours.length > 0) {
        nouveauxCours[0].actif = true;
    }

    db.setSync('listeCours', nouveauxCours);

    afficherTableauCours();
    afficherNotificationSucces('Cours et toutes ses données supprimés !');

    // Recharger les vues si nécessaire
    if (typeof rafraichirToutesLesVues === 'function') {
        rafraichirToutesLesVues();
    }
}
```

---

### PHASE 5 : Groupe démo préchargé

**Objectif** : Premier lancement → groupe démo présent et explorable

#### 5.1 Réduire pack-demarrage-complet.json

**Contenu actuel** : 10 étudiants, 8 productions, 15 semaines

**Contenu cible Beta 93.5** :
- ✅ 10 étudiants (groupe 9999)
- ⬇️ 4-5 productions (au lieu de 8)
- ⬇️ 8 semaines de présences (au lieu de 15)
- ✅ Grille SRPNF + Échelle IDME
- ✅ Quelques cartouches de base
- ✅ Trimestre H2026 (fictif)

**Fichier** : `pack-demarrage-complet.json`

**Modifications** :
1. Garder productions 1, 2, 3, 4 (supprimer 5-8)
2. Réduire évaluations aux 4 premières productions
3. Garder présences semaines 1-8 seulement
4. Vérifier que `coursId` est bien renseigné partout

#### 5.2 Chargement automatique au premier lancement

**Fichier** : `js/donnees-demo.js` (existe déjà ?)

**Logique** :
```javascript
function chargerDemoSiPremierLancement() {
    const cours = db.getSync('listeCours', []);

    // Si aucun cours n'existe, charger le pack démo
    if (cours.length === 0) {
        chargerPackDemarrage();
    }
}

function chargerPackDemarrage() {
    fetch('pack-demarrage-complet.json')
        .then(response => response.json())
        .then(data => {
            // Importer toutes les données
            Object.keys(data).forEach(cle => {
                if (cle !== '_metadata') {
                    db.setSync(cle, data[cle]);
                }
            });

            console.log('✅ Pack de démarrage chargé');
            afficherNotificationSucces('Groupe démo chargé ! Explorez l\'application.');

            // Recharger la page ou les vues
            location.reload();
        })
        .catch(err => {
            console.error('❌ Erreur chargement pack démo:', err);
        });
}
```

**Appel** : Dans `js/main.js` ou au chargement de l'app

---

## 📋 Checklist d'implémentation

### ✅ PHASE 1 : Associations cours-données
- [ ] Ajouter migration `migrerEtudiantsVersCours()`
- [ ] Modifier `js/groupe.js` : ajouter `coursId` lors ajout étudiant
- [ ] Vérifier `js/productions.js` : présence `coursId`
- [ ] Ajouter `coursId` dans `js/saisie-presences.js`
- [ ] Tester migrations sur données existantes

### ✅ PHASE 2 : Sélecteur cours actif
- [ ] Ajouter sélecteur HTML dans en-tête (`index.html`)
- [ ] Créer fonction `genererSelecteurCours()`
- [ ] Modifier `activerCours(id)` pour recharger vues
- [ ] Créer fonction `rafraichirToutesLesVues()`
- [ ] Tester changement de cours

### ✅ PHASE 3 : Filtrage par cours
- [ ] Créer fonctions utilitaires (`obtenirCoursActif`, etc.)
- [ ] Modifier `js/etudiants.js` : filtrer par `coursId`
- [ ] Modifier `js/productions.js` : filtrer par `coursId`
- [ ] Modifier `js/saisie-presences.js` : filtrer par `coursId`
- [ ] Modifier `js/tableau-bord-apercu.js` : filtrer étudiants
- [ ] Modifier `js/profil-etudiant.js` : vérifier filtrage
- [ ] Tester avec 2+ cours actifs

### ✅ PHASE 4 : Suppression cascade
- [ ] Implémenter nouvelle version `supprimerCours(id)`
- [ ] Ajouter compteurs de données liées
- [ ] Ajouter confirmation détaillée
- [ ] Tester suppression cours démo
- [ ] Tester suppression cours réel (attention !)

### ✅ PHASE 5 : Groupe démo
- [ ] Réduire `pack-demarrage-complet.json` (4-5 productions, 8 semaines)
- [ ] Vérifier tous les `coursId` dans le pack
- [ ] Implémenter `chargerDemoSiPremierLancement()`
- [ ] Tester premier lancement (localStorage vide)
- [ ] Tester suppression groupe démo

---

## 🧪 Plan de tests

### Test 1 : Migrations
1. Charger Beta 93 avec données existantes
2. Lancer Beta 93.5
3. Vérifier que tous les étudiants ont un `coursId`
4. Vérifier que toutes les présences ont un `coursId`

### Test 2 : Multi-cours
1. Créer 2 cours différents (601-101, 601-102)
2. Ajouter étudiants distincts à chaque cours
3. Changer de cours actif via sélecteur
4. Vérifier que seuls les étudiants du cours actif s'affichent

### Test 3 : Groupe démo
1. Vider localStorage complètement
2. Recharger l'app
3. Vérifier que le groupe démo apparaît
4. Explorer les données (étudiants, productions, présences)
5. Supprimer le cours démo
6. Vérifier que tout a disparu

### Test 4 : Suppression cascade
1. Créer cours test avec quelques données
2. Supprimer le cours
3. Vérifier que étudiants, productions, évaluations ont disparu
4. Vérifier qu'un autre cours devient actif

---

## 📦 Livrables Beta 93.5

### Code
- ✅ Système multi-cours fonctionnel
- ✅ Sélecteur de cours dans interface
- ✅ Filtrage par cours actif
- ✅ Suppression en cascade
- ✅ Groupe démo préchargé

### Documentation
- ✅ `BETA_93.5_CHANGELOG.md` : Détails de toutes les modifications
- ✅ Mise à jour `CLAUDE.md` : Section multi-cours
- ✅ Guide utilisateur : Comment gérer plusieurs cours

### Tests
- ✅ Plan de tests exécuté
- ✅ Validation migrations
- ✅ Validation multi-cours
- ✅ Validation groupe démo

---

## 🚀 Après Beta 93.5

### Beta 94 : Fonctionnalités avancées multi-cours

**Prévu** :
- Import/export par cours
- Duplication cours d'une session à l'autre
- Archivage de trimestres complets
- Statistiques comparatives entre groupes
- Gestion plusieurs sessions (H2026, A2026, etc.)

---

**Auteur** : Grégoire Bédard (Labo Codex) avec Claude Code
**Date** : 11 décembre 2025
**Version** : 1.0
