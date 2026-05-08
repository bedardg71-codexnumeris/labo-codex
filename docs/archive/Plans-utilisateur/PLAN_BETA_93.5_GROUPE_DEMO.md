# Plan Beta 93.5 : Intégration Groupe Démo

**Date** : 11 décembre 2025
**Objectif** : Précharger un groupe démo supprimable facilement
**Version cible** : Beta 93.5

---

## 🎯 Objectif principal

Permettre aux nouveaux utilisateurs d'explorer l'application avec des données réalistes **déjà présentes** au premier lancement, et de **supprimer facilement** ce groupe démo une fois qu'ils veulent travailler avec leurs propres données.

---

## 📚 Contexte pédagogique

### Hiérarchie réelle

```
TRIMESTRE (période temporelle unique : H2026, A2026, etc.)
    ↓
COURS (un ou plusieurs : 601-101, 601-102, 601-103)
    ↓
GROUPE (un ou plusieurs par cours : 01, 02, 03, 9999)
    ↓
ÉTUDIANTS + DONNÉES (évaluations, présences)
```

### Exemple concret - Automne 2025 (Grégoire)

**1 trimestre actif : A2025**
- 1 cours : 601-103 Littérature québécoise
- 1 groupe : Groupe 01
- 30 étudiants

### Exemple futur - Hiver 2026 (Grégoire)

**1 trimestre actif : H2026**
- 3 cours : 601-101, 601-102, 601-103
- 5 groupes :
  * 601-101 Groupe 01 (30 étudiants)
  * 601-101 Groupe 02 (28 étudiants)
  * 601-102 Groupe 01 (32 étudiants)
  * 601-102 Groupe 03 (25 étudiants)
  * 601-103 Groupe 01 (29 étudiants)

**= 1 trimestre, 3 cours, 5 groupes**

### Groupe démo pour Beta 93.5

**Trimestre** : H2026 (fictif)
**Cours** : 601-101 Écriture et littérature
**Groupe** : 9999 (fictif)
**Étudiants** : 10 étudiants fictifs
**Données** : 4-5 productions, 8 semaines de présences

**Identifiant unique** : `H2026-601-101-9999`

**Suppression** : Supprimer ce cours-groupe → tout disparaît

---

## 📊 Architecture Beta 93.5

### Principe : Identifier chaque cours-groupe de façon unique

**Format d'ID** : `SESSION-SIGLE-GROUPE`

**Exemples** :
- `H2026-601-101-01` : Hiver 2026, Écriture et littérature, Groupe 01
- `H2026-601-101-02` : Hiver 2026, Écriture et littérature, Groupe 02
- `H2026-601-102-01` : Hiver 2026, Littérature et imaginaire, Groupe 01
- `H2026-601-101-9999` : Hiver 2026, Écriture et littérature, Groupe 9999 (DÉMO)

### Structure de données

#### 1. Cours (localStorage.listeCours)

**Structure actuelle Beta 93** :
```javascript
{
    id: "601-101-h2026-01",           // ✅ Déjà au bon format
    sigle: "601-101",
    titre: "Écriture et littérature",
    competence: "4EF0",
    enseignant: "Grégoire Bédard",
    session: "H2026",
    annee: "2026",
    groupe: "01",
    heuresHebdo: 4,
    pratiqueId: "pan-maitrise",
    actif: true,
    dansBibliotheque: true,
    verrouille: false
}
```

**✅ Aucun changement nécessaire pour Beta 93.5**

**Note** : Le format d'ID existant `"601-101-h2026-01"` est équivalent à `"H2026-601-101-01"` (juste ordre différent)

#### 2. Étudiants (localStorage.groupeEtudiants)

**Ajout** : Lien vers le cours-groupe spécifique

```javascript
{
    da: "2234567",
    prenom: "Émilie",
    nom: "Tremblay",
    programme: "500.A1",
    sa: false,
    groupe: "01",                      // ⚠️ Ambigu (groupe de quel cours ?)
    coursId: "601-101-h2026-01"       // 🆕 AJOUT : Lien précis vers cours-groupe
}
```

**Pour le groupe démo** :
```javascript
{
    da: "2234567",
    prenom: "Émilie",
    nom: "Tremblay",
    programme: "500.A1",
    sa: false,
    groupe: "9999",
    coursId: "601-101-h2026-9999"     // Groupe démo
}
```

#### 3. Productions (localStorage.productions)

**Vérifier présence** : `coursId` devrait déjà exister

```javascript
{
    id: "PROD1234567890",
    nom: "Analyse littéraire",
    type: "artefact-portfolio",
    grilleId: "GRILLE1234567890",
    ponderation: 20,
    coursId: "601-101-h2026-01"       // ✅ Devrait déjà être là
}
```

**Si absent** : Ajouter via migration

#### 4. Évaluations (localStorage.evaluationsDetaillees)

**Lien indirect via production** :
```javascript
{
    id: "EVAL1234567890",
    da: "2234567",
    productionId: "PROD1234567890",
    // coursId déduit via production.coursId
    note: 0.82,
    // ... autres champs
}
```

**✅ Aucun changement nécessaire** (lien indirect suffit)

#### 5. Présences (localStorage.presences)

**Ajout** : Lien vers cours-groupe dans chaque date

**Structure actuelle** :
```javascript
{
    "2026-01-15": {
        presences: {
            "2234567": { present: true, heures: 2.0 }
        }
    }
}
```

**Structure Beta 93.5** :
```javascript
{
    "2026-01-15": {
        coursId: "601-101-h2026-01",      // 🆕 AJOUT
        presences: {
            "2234567": { present: true, heures: 2.0 }
        }
    }
}
```

---

## 🔧 Implémentation Beta 93.5

### PHASE 1 : Migration données existantes

**Objectif** : Ajouter `coursId` aux données qui n'en ont pas

#### 1.1 Migration étudiants

**Fichier** : `js/groupe.js`

**Migration automatique au chargement** :
```javascript
function migrerEtudiantsVersCoursId() {
    const etudiants = db.getSync('groupeEtudiants', []);
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        console.warn('⚠️ Aucun cours actif, migration impossible');
        return 0;
    }

    let nbMigres = 0;
    etudiants.forEach(e => {
        if (!e.coursId) {
            e.coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('groupeEtudiants', etudiants);
        console.log(`✅ Migration: ${nbMigres} étudiant(s) → coursId`);
    }

    return nbMigres;
}
```

**Appel** : Dans `initialiserModuleGroupe()` ou équivalent

#### 1.2 Migration productions

**Fichier** : `js/productions.js`

**Vérification** : La plupart des productions ont déjà `coursId`

**Migration si besoin** :
```javascript
function migrerProductionsVersCoursId() {
    const productions = db.getSync('productions', []);
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) return 0;

    let nbMigres = 0;
    productions.forEach(p => {
        if (!p.coursId) {
            p.coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('productions', productions);
        console.log(`✅ Migration: ${nbMigres} production(s) → coursId`);
    }

    return nbMigres;
}
```

#### 1.3 Migration présences

**Fichier** : `js/saisie-presences.js`

**Migration** :
```javascript
function migrerPresencesVersCoursId() {
    const presences = db.getSync('presences', {});
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) return 0;

    let nbMigres = 0;
    Object.keys(presences).forEach(date => {
        if (!presences[date].coursId) {
            presences[date].coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('presences', presences);
        console.log(`✅ Migration: ${nbMigres} date(s) → coursId`);
    }

    return nbMigres;
}
```

#### 1.4 Migration globale

**Fichier** : `js/main.js` (ou nouveau `js/migrations.js`)

```javascript
function executerMigrationsBeta935() {
    console.log('🔄 Démarrage migrations Beta 93.5...');

    const resultats = {
        etudiants: migrerEtudiantsVersCoursId(),
        productions: migrerProductionsVersCoursId(),
        presences: migrerPresencesVersCoursId()
    };

    const total = Object.values(resultats).reduce((sum, n) => sum + (n || 0), 0);

    if (total > 0) {
        console.log(`✅ Migrations Beta 93.5 terminées (${total} éléments migrés)`);
    } else {
        console.log('✅ Aucune migration nécessaire');
    }

    return resultats;
}
```

**Appel** : Au chargement de l'app, dans `js/main.js` après initialisation DB

---

### PHASE 2 : Suppression en cascade

**Objectif** : Supprimer un cours → supprimer TOUTES ses données liées

**Fichier** : `js/cours.js`

**Fonction modifiée** : `supprimerCours(id)`

```javascript
function supprimerCours(id) {
    const cours = db.getSync('listeCours', []);
    const coursASupprimer = cours.find(c => c.id === id);

    if (!coursASupprimer) return;

    if (coursASupprimer.verrouille) {
        alert('Déverrouillez ce cours avant de le supprimer');
        return;
    }

    // COMPTER LES DONNÉES LIÉES
    const etudiants = db.getSync('groupeEtudiants', []);
    const productions = db.getSync('productions', []);
    const evaluations = db.getSync('evaluationsDetaillees', []);
    const presences = db.getSync('presences', {});

    const nbEtudiants = etudiants.filter(e => e.coursId === id).length;
    const nbProductions = productions.filter(p => p.coursId === id).length;
    const productionsIds = productions.filter(p => p.coursId === id).map(p => p.id);
    const nbEvaluations = evaluations.filter(e => productionsIds.includes(e.productionId)).length;
    const nbPresences = Object.keys(presences).filter(date => presences[date].coursId === id).length;

    // CONFIRMATION DÉTAILLÉE
    const message = `Supprimer le cours ${coursASupprimer.sigle} - ${coursASupprimer.titre} (Groupe ${coursASupprimer.groupe}) ?\n\n` +
        `Cette action supprimera :\n` +
        `• ${nbEtudiants} étudiant(s)\n` +
        `• ${nbProductions} production(s)\n` +
        `• ${nbEvaluations} évaluation(s)\n` +
        `• ${nbPresences} date(s) de présences\n\n` +
        `⚠️ Cette action est IRRÉVERSIBLE !`;

    if (!confirm(message)) return;

    // SUPPRESSION EN CASCADE

    // 1. Supprimer les étudiants du cours
    const nouveauxEtudiants = etudiants.filter(e => e.coursId !== id);
    db.setSync('groupeEtudiants', nouveauxEtudiants);

    // 2. Supprimer les productions du cours
    const nouvellesProductions = productions.filter(p => p.coursId !== id);
    db.setSync('productions', nouvellesProductions);

    // 3. Supprimer les évaluations liées aux productions supprimées
    const nouvellesEvaluations = evaluations.filter(e => !productionsIds.includes(e.productionId));
    db.setSync('evaluationsDetaillees', nouvellesEvaluations);

    // 4. Supprimer les présences du cours
    const nouvellesPresences = {};
    Object.keys(presences).forEach(date => {
        if (presences[date].coursId !== id) {
            nouvellesPresences[date] = presences[date];
        }
    });
    db.setSync('presences', nouvellesPresences);

    // 5. Supprimer le cours lui-même
    const nouveauxCours = cours.filter(c => c.id !== id);

    // 6. Activer un autre cours si nécessaire
    if (coursASupprimer.actif && nouveauxCours.length > 0) {
        nouveauxCours[0].actif = true;
    }

    db.setSync('listeCours', nouveauxCours);

    // 7. Rafraîchir l'affichage
    afficherTableauCours();
    afficherNotificationSucces('Cours et toutes ses données supprimés !');

    // 8. Recharger les vues si une fonction globale existe
    if (typeof rafraichirToutesLesVues === 'function') {
        rafraichirToutesLesVues();
    }
}
```

---

### PHASE 3 : Pack démo réduit

**Objectif** : Réduire `pack-demarrage-complet.json` pour économiser localStorage

**Fichier** : `pack-demarrage-complet.json`

#### Contenu actuel
- 10 étudiants
- 8 productions
- 15 semaines de données

#### Contenu Beta 93.5
- ✅ 10 étudiants (OK)
- ⬇️ **4 productions** (réduire de 8 à 4)
- ⬇️ **8 semaines** de présences (réduire de 15 à 8)
- ✅ Grille SRPNF
- ✅ Échelle IDME
- ✅ Quelques cartouches de base

#### Productions à conserver

**Garder** :
1. Production 1 : Analyse littéraire A1
2. Production 2 : Dissertation A2
3. Production 3 : Commentaire critique A3
4. Production 4 : Synthèse finale

**Supprimer** : Productions 5, 6, 7, 8

#### Présences à conserver

**Garder** : Semaines 1 à 8 seulement
**Supprimer** : Semaines 9 à 15

#### Vérifications

**Tous les éléments doivent avoir** :
```javascript
coursId: "601-101-h2026-9999"  // Groupe démo
```

**Structure trimestre** :
```javascript
{
    id: "601-101-h2026-9999",
    sigle: "601-101",
    titre: "Écriture et littérature",
    groupe: "9999",
    session: "H2026",
    annee: "2026",
    enseignant: "Primo Primavera",
    // ... autres champs
}
```

---

### PHASE 4 : Préchargement automatique

**Objectif** : Charger le pack démo au premier lancement de l'app

**Fichier** : `js/donnees-demo.js` (existe déjà) ou `js/main.js`

#### Fonction de chargement

```javascript
function chargerPackDemoSiPremierLancement() {
    const cours = db.getSync('listeCours', []);

    // Si aucun cours n'existe, charger le pack démo
    if (cours.length === 0) {
        console.log('🎯 Premier lancement détecté, chargement pack démo...');
        chargerPackDemarrage();
    } else {
        console.log('✅ Données existantes détectées, pas de chargement démo');
    }
}

function chargerPackDemarrage() {
    fetch('pack-demarrage-complet.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fichier pack démo introuvable');
            }
            return response.json();
        })
        .then(data => {
            console.log('📦 Pack démo chargé:', data._metadata);

            // Importer toutes les données
            Object.keys(data).forEach(cle => {
                if (cle !== '_metadata') {
                    db.setSync(cle, data[cle]);
                    console.log(`  ✅ ${cle} importé`);
                }
            });

            console.log('✅ Pack de démarrage importé avec succès');

            // Notification utilisateur
            setTimeout(() => {
                afficherNotificationSucces(
                    'Groupe démo chargé ! Explorez l\'application avec des données réalistes. ' +
                    'Vous pourrez supprimer ce groupe facilement depuis Réglages → Cours.'
                );
            }, 500);

            // Recharger la page pour afficher les données
            setTimeout(() => {
                location.reload();
            }, 3000);
        })
        .catch(err => {
            console.error('❌ Erreur chargement pack démo:', err);
        });
}
```

#### Appel au démarrage

**Dans `js/main.js`**, après initialisation DB :

```javascript
// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Démarrage application Beta 93.5');

    // 1. Initialiser DB
    // ... code existant

    // 2. Exécuter migrations
    executerMigrationsBeta935();

    // 3. Charger pack démo si premier lancement
    chargerPackDemoSiPremierLancement();

    // 4. Initialiser modules
    // ... code existant
});
```

---

## 📋 Checklist d'implémentation

### ✅ PHASE 1 : Migrations
- [ ] Créer `migrerEtudiantsVersCoursId()` dans `js/groupe.js`
- [ ] Créer `migrerProductionsVersCoursId()` dans `js/productions.js`
- [ ] Créer `migrerPresencesVersCoursId()` dans `js/saisie-presences.js`
- [ ] Créer `executerMigrationsBeta935()` dans `js/main.js`
- [ ] Appeler migrations au chargement de l'app
- [ ] Tester avec données Beta 93 existantes

### ✅ PHASE 2 : Suppression cascade
- [ ] Modifier `supprimerCours(id)` dans `js/cours.js`
- [ ] Ajouter compteurs de données liées
- [ ] Ajouter confirmation détaillée
- [ ] Implémenter suppression étudiants
- [ ] Implémenter suppression productions
- [ ] Implémenter suppression évaluations
- [ ] Implémenter suppression présences
- [ ] Tester suppression groupe démo

### ✅ PHASE 3 : Pack démo réduit
- [ ] Ouvrir `pack-demarrage-complet.json`
- [ ] Supprimer productions 5-8
- [ ] Supprimer évaluations productions 5-8
- [ ] Réduire présences aux semaines 1-8
- [ ] Vérifier tous les `coursId` = "601-101-h2026-9999"
- [ ] Tester import du pack réduit

### ✅ PHASE 4 : Préchargement
- [ ] Créer `chargerPackDemoSiPremierLancement()` dans `js/donnees-demo.js`
- [ ] Créer `chargerPackDemarrage()` (fetch + import)
- [ ] Appeler au démarrage dans `js/main.js`
- [ ] Tester premier lancement (localStorage vide)
- [ ] Vérifier notification utilisateur
- [ ] Vérifier rechargement automatique

---

## 🧪 Plan de tests

### Test 1 : Migration données existantes
1. Ouvrir Beta 93 avec données réelles
2. Charger Beta 93.5
3. Vérifier console : migrations exécutées
4. Vérifier que tous les étudiants ont `coursId`
5. Vérifier que toutes les présences ont `coursId`
6. Vérifier que l'app fonctionne normalement

### Test 2 : Suppression groupe démo
1. Vider localStorage
2. Charger Beta 93.5 (pack démo se charge)
3. Vérifier groupe démo visible (10 étudiants, 4 productions)
4. Aller dans Réglages → Cours
5. Supprimer le cours 601-101 Groupe 9999
6. Confirmer suppression
7. Vérifier que tout a disparu (étudiants, productions, présences)
8. Vérifier que l'app est maintenant vide

### Test 3 : Premier lancement
1. Vider localStorage complètement
2. Ouvrir Beta 93.5
3. Vérifier console : "Premier lancement détecté"
4. Vérifier console : "Pack démo chargé"
5. Attendre rechargement automatique
6. Vérifier notification affichée
7. Vérifier groupe démo présent et fonctionnel
8. Explorer : Tableau de bord, Étudiants, Évaluations, Présences

### Test 4 : Compatibilité données existantes
1. Charger Beta 93.5 avec données réelles existantes
2. Vérifier qu'aucun pack démo n'est chargé
3. Vérifier que les données existantes fonctionnent
4. Vérifier que `coursId` a été ajouté via migration
5. Vérifier calculs A-C-P corrects

---

## 📦 Livrables Beta 93.5

### Code
- ✅ Migrations automatiques `coursId`
- ✅ Suppression en cascade fonctionnelle
- ✅ Pack démo réduit (4 productions, 8 semaines)
- ✅ Préchargement automatique premier lancement

### Documentation
- ✅ `BETA_93.5_CHANGELOG.md` : Détails des modifications
- ✅ Mise à jour `CLAUDE.md` : Section groupe démo
- ✅ Instructions utilisateur : Comment supprimer le groupe démo

### Tests
- ✅ 4 scénarios de tests validés
- ✅ Migration données existantes OK
- ✅ Suppression groupe démo OK
- ✅ Premier lancement OK

---

## 🚀 Après Beta 93.5 → Beta 94

### Beta 94 : Système multi-cours complet

**Prévu** :
- Sélecteur de cours-groupe actif dans Réglages
- Support réel de 3 cours × 5 groupes simultanément
- Filtrage dynamique par cours-groupe sélectionné
- Navigation fluide entre cours-groupes
- Import/export par cours-groupe
- Duplication cours d'un trimestre à l'autre

**Base posée par Beta 93.5** :
- ✅ `coursId` déjà présent partout
- ✅ Suppression cascade fonctionnelle
- ✅ Migrations automatiques en place
- ✅ Exemple concret avec groupe démo

---

**Auteur** : Grégoire Bédard (Labo Codex) avec Claude Code
**Date** : 11 décembre 2025
**Version** : 1.0
