# Proposition : Configuration des jetons dans le module Pratiques

**Date** : 9 novembre 2025
**Demande** : Grégoire souhaite configurer les jetons dans le module de pratiques de notation
**Objectif** : Interface simple et intuitive pour configurer nombre et règles de jetons

---

## 🎯 Proposition d'interface

### Emplacement : Réglages › Pratique de notation

Ajouter une nouvelle section **après** le choix de pratique (sommative/alternative) :

```
┌─────────────────────────────────────────────────────────────┐
│ Pratique de notation                                         │
├─────────────────────────────────────────────────────────────┤
│ ○ Sommative traditionnelle                                   │
│ ● Alternative (PAN)                                          │
│                                                              │
│   Type de PAN : [PAN-Maîtrise ▼]                           │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Configuration PAN-Maîtrise                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Période d'évaluation                                    │ │
│ │ ○ 3 derniers cours (6 artefacts)                       │ │
│ │ ● 7 derniers cours (14 artefacts)                      │ │
│ │ ○ 12 derniers cours (24 artefacts)                     │ │
│ │                                                         │ │
│ │ Nombre d'artefacts à retenir pour note finale          │ │
│ │ [3 ▼] meilleurs artefacts                              │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎟️ Système de jetons                                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ ☑ Activer les jetons                                   │ │
│ │                                                         │ │
│ │ Jetons de délai                                         │ │
│ │   Nombre par trimestre : [2 ▼]                         │ │
│ │   Durée du délai : [7 ▼] jours                         │ │
│ │                                                         │ │
│ │ Jetons de reprise                                       │ │
│ │   Nombre par trimestre : [2 ▼]                         │ │
│ │   Maximum par production : [1 ▼]                       │ │
│ │   ☑ Archiver l'évaluation originale                    │ │
│ │   ☐ Supprimer l'évaluation originale                   │ │
│ │                                                         │ │
│ │ 💡 Les jetons permettent de prolonger une échéance      │ │
│ │    (délai) ou de refaire une évaluation (reprise).     │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│                           [Sauvegarder]                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Structure de données

### Dans localStorage.modalitesEvaluation

```javascript
{
    // Existant
    pratique: 'alternative',  // ou 'sommative'
    typePAN: 'pan-maitrise',

    // NOUVEAU : Configuration PAN
    configPAN: {
        nombreCours: 7,        // 3, 7, ou 12 cours
        nombreARetenir: 3,     // Nombre de meilleurs artefacts

        // NOUVEAU : Configuration jetons
        jetons: {
            actif: true,

            delai: {
                nombre: 2,          // Par trimestre
                dureeJours: 7       // Durée du délai
            },

            reprise: {
                nombre: 2,          // Par trimestre
                maxParProduction: 1,
                archiverOriginale: true  // true = archiver, false = supprimer
            }
        }
    },

    // Configuration sommative (si pertinent)
    configSOM: {
        jetons: {
            actif: false  // Généralement désactivé en sommative
        }
    },

    // Affichage
    afficherSommatif: false,
    afficherAlternatif: true
}
```

---

## 🔧 Code à ajouter dans pratiques.js

### 1. HTML à ajouter dans index.html

**Emplacement** : Après la section type PAN (ligne ~4950)

```html
<!-- Configuration PAN-Maîtrise -->
<div id="configurationPAN" style="display: none;">
    <div class="carte" style="margin-top: 20px;">
        <div class="carte-titre-bleu">
            <h3>📋 Configuration PAN-Maîtrise</h3>
        </div>
        <div class="carte-body">
            <!-- Période d'évaluation -->
            <div class="form-group">
                <label style="font-weight: 600; margin-bottom: 10px; display: block;">
                    Période d'évaluation
                </label>
                <div style="margin-left: 20px;">
                    <div style="margin-bottom: 8px;">
                        <input type="radio" id="periode3" name="periodePAN" value="3">
                        <label for="periode3">3 derniers cours (6 artefacts)</label>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <input type="radio" id="periode7" name="periodePAN" value="7" checked>
                        <label for="periode7">7 derniers cours (14 artefacts)</label>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <input type="radio" id="periode12" name="periodePAN" value="12">
                        <label for="periode12">12 derniers cours (24 artefacts)</label>
                    </div>
                </div>
            </div>

            <!-- Nombre d'artefacts à retenir -->
            <div class="form-group" style="margin-top: 20px;">
                <label for="nombreARetenir" style="font-weight: 600;">
                    Nombre d'artefacts à retenir pour note finale
                </label>
                <select id="nombreARetenir" class="form-control" style="width: auto; display: inline-block;">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3" selected>3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <span style="margin-left: 8px;">meilleurs artefacts</span>
            </div>
        </div>
    </div>

    <!-- Système de jetons -->
    <div class="carte" style="margin-top: 20px;">
        <div class="carte-titre-bleu">
            <h3>🎟️ Système de jetons</h3>
        </div>
        <div class="carte-body">
            <!-- Activation -->
            <div class="form-group">
                <label>
                    <input type="checkbox" id="jetonsActif" checked>
                    <strong>Activer les jetons</strong>
                </label>
            </div>

            <!-- Jetons de délai -->
            <div id="configJetonsDelai" style="margin-top: 20px;">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 10px;">
                    Jetons de délai
                </h4>
                <div style="margin-left: 20px;">
                    <div class="form-group">
                        <label for="nombreJetonsDelai">Nombre par trimestre :</label>
                        <select id="nombreJetonsDelai" class="form-control" style="width: auto; display: inline-block; margin-left: 10px;">
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2" selected>2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dureeDelai">Durée du délai :</label>
                        <select id="dureeDelai" class="form-control" style="width: auto; display: inline-block; margin-left: 10px;">
                            <option value="3">3 jours</option>
                            <option value="5">5 jours</option>
                            <option value="7" selected>7 jours</option>
                            <option value="10">10 jours</option>
                            <option value="14">14 jours</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Jetons de reprise -->
            <div id="configJetonsReprise" style="margin-top: 20px;">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 10px;">
                    Jetons de reprise
                </h4>
                <div style="margin-left: 20px;">
                    <div class="form-group">
                        <label for="nombreJetonsReprise">Nombre par trimestre :</label>
                        <select id="nombreJetonsReprise" class="form-control" style="width: auto; display: inline-block; margin-left: 10px;">
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2" selected>2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="maxRepriseParProduction">Maximum par production :</label>
                        <select id="maxRepriseParProduction" class="form-control" style="width: auto; display: inline-block; margin-left: 10px;">
                            <option value="1" selected>1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="999">Illimité</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 10px; display: block;">
                            Que faire de l'évaluation originale ?
                        </label>
                        <div style="margin-left: 20px;">
                            <div style="margin-bottom: 8px;">
                                <input type="radio" id="archiverOriginale" name="gestionOriginale" value="archiver" checked>
                                <label for="archiverOriginale">Archiver (garder historique)</label>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <input type="radio" id="supprimerOriginale" name="gestionOriginale" value="supprimer">
                                <label for="supprimerOriginale">Supprimer (nettoyer historique)</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Info-bulle -->
            <div class="alerte-info" style="margin-top: 20px;">
                <strong>💡 À propos des jetons</strong><br>
                Les jetons permettent de :<br>
                • <strong>Prolonger une échéance</strong> (jeton de délai)<br>
                • <strong>Refaire une évaluation</strong> pour améliorer la maîtrise (jeton de reprise)<br>
                <br>
                Les jetons sont comptabilisés par trimestre et par étudiant.
            </div>
        </div>
    </div>
</div>
```

---

### 2. JavaScript à ajouter dans pratiques.js

```javascript
/* ===============================
   CONFIGURATION PAN
   =============================== */

/**
 * Affiche/masque la configuration PAN selon la pratique
 */
function afficherConfigurationPAN() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const configPAN = document.getElementById('configurationPAN');

    if (pratique === 'alternative') {
        configPAN.style.display = 'block';
        chargerConfigurationPAN();
    } else {
        configPAN.style.display = 'none';
    }
}

/**
 * Charge la configuration PAN depuis localStorage
 */
function chargerConfigurationPAN() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const configPAN = modalites.configPAN || {};

    // Période d'évaluation
    const nombreCours = configPAN.nombreCours || 7;
    document.querySelector(`input[name="periodePAN"][value="${nombreCours}"]`).checked = true;

    // Nombre d'artefacts à retenir
    const nombreARetenir = configPAN.nombreARetenir || 3;
    document.getElementById('nombreARetenir').value = nombreARetenir;

    // Jetons
    const jetons = configPAN.jetons || {
        actif: true,
        delai: { nombre: 2, dureeJours: 7 },
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    };

    document.getElementById('jetonsActif').checked = jetons.actif;
    document.getElementById('nombreJetonsDelai').value = jetons.delai.nombre;
    document.getElementById('dureeDelai').value = jetons.delai.dureeJours;
    document.getElementById('nombreJetonsReprise').value = jetons.reprise.nombre;
    document.getElementById('maxRepriseParProduction').value = jetons.reprise.maxParProduction;

    const gestionOriginale = jetons.reprise.archiverOriginale ? 'archiver' : 'supprimer';
    document.querySelector(`input[name="gestionOriginale"][value="${gestionOriginale}"]`).checked = true;

    // Activer/désactiver sections jetons
    toggleConfigJetons();
}

/**
 * Active/désactive les sections de configuration des jetons
 */
function toggleConfigJetons() {
    const jetonsActif = document.getElementById('jetonsActif').checked;
    const configDelai = document.getElementById('configJetonsDelai');
    const configReprise = document.getElementById('configJetonsReprise');

    configDelai.style.opacity = jetonsActif ? '1' : '0.5';
    configReprise.style.opacity = jetonsActif ? '1' : '0.5';

    // Désactiver les champs si jetons inactifs
    const champsDelai = configDelai.querySelectorAll('select');
    const champsReprise = configReprise.querySelectorAll('select, input');

    champsDelai.forEach(champ => champ.disabled = !jetonsActif);
    champsReprise.forEach(champ => champ.disabled = !jetonsActif);
}

/**
 * Sauvegarde la configuration PAN
 */
function sauvegarderConfigurationPAN() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    // Période d'évaluation
    const nombreCours = parseInt(document.querySelector('input[name="periodePAN"]:checked').value);

    // Nombre d'artefacts à retenir
    const nombreARetenir = parseInt(document.getElementById('nombreARetenir').value);

    // Jetons
    const jetonsActif = document.getElementById('jetonsActif').checked;
    const nombreJetonsDelai = parseInt(document.getElementById('nombreJetonsDelai').value);
    const dureeDelai = parseInt(document.getElementById('dureeDelai').value);
    const nombreJetonsReprise = parseInt(document.getElementById('nombreJetonsReprise').value);
    const maxRepriseParProduction = parseInt(document.getElementById('maxRepriseParProduction').value);
    const gestionOriginale = document.querySelector('input[name="gestionOriginale"]:checked').value;

    // Construire l'objet config
    modalites.configPAN = {
        nombreCours: nombreCours,
        nombreARetenir: nombreARetenir,

        jetons: {
            actif: jetonsActif,

            delai: {
                nombre: nombreJetonsDelai,
                dureeJours: dureeDelai
            },

            reprise: {
                nombre: nombreJetonsReprise,
                maxParProduction: maxRepriseParProduction,
                archiverOriginale: gestionOriginale === 'archiver'
            }
        }
    };

    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));
    console.log('✅ Configuration PAN sauvegardée:', modalites.configPAN);
}

/* ===============================
   ÉVÉNEMENTS
   =============================== */

// Ajouter à la fonction attacherEvenementsPratiques() existante

// Checkbox jetons actif
const checkJetonsActif = document.getElementById('jetonsActif');
if (checkJetonsActif) {
    checkJetonsActif.addEventListener('change', toggleConfigJetons);
}

// Modifier la fonction changerPratiqueNotation() existante pour ajouter :
afficherConfigurationPAN();

// Modifier la fonction sauvegarderPratiqueNotation() existante pour ajouter :
if (document.getElementById('pratiqueNotation').value === 'alternative') {
    sauvegarderConfigurationPAN();
}
```

---

### 3. Fonctions helper dans evaluation-jetons.js

**Ajouter au début du fichier** :

```javascript
/**
 * Obtient la configuration des jetons depuis modalitesEvaluation
 * @returns {Object} Configuration des jetons
 */
function obtenirConfigJetons() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const configPAN = modalites.configPAN || {};

    // Valeurs par défaut si pas configuré
    return configPAN.jetons || {
        actif: true,
        delai: { nombre: 2, dureeJours: 7 },
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    };
}

/**
 * Compte les jetons utilisés par un étudiant
 * @param {string} da - Numéro DA
 * @param {string} type - 'delai' ou 'reprise'
 * @returns {number} Nombre de jetons utilisés
 */
function compterJetonsUtilises(da, type) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    if (type === 'delai') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonDelaiApplique === true
        ).length;
    }

    if (type === 'reprise') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonRepriseApplique === true
        ).length;
    }

    return 0;
}

/**
 * Vérifie si un étudiant peut utiliser un jeton
 * @param {string} da - Numéro DA
 * @param {string} type - 'delai' ou 'reprise'
 * @returns {Object} { disponible, utilises, total, raison }
 */
function verifierDisponibiliteJeton(da, type) {
    const config = obtenirConfigJetons();

    if (!config.actif) {
        return {
            disponible: false,
            utilises: 0,
            total: 0,
            raison: 'Système de jetons désactivé'
        };
    }

    const utilises = compterJetonsUtilises(da, type);
    const total = type === 'delai' ? config.delai.nombre : config.reprise.nombre;

    if (utilises >= total) {
        return {
            disponible: false,
            utilises: utilises,
            total: total,
            raison: `Tous les jetons ${type} utilisés (${utilises}/${total})`
        };
    }

    return {
        disponible: true,
        utilises: utilises,
        total: total,
        raison: `Jetons disponibles : ${total - utilises} restants`
    };
}
```

**Modifier appliquerJetonDelai() et appliquerJetonReprise()** pour utiliser la config :

```javascript
// Dans appliquerJetonDelai(), ajouter au début :
function appliquerJetonDelai(evaluationId) {
    console.log('⭐ Application jeton de délai:', evaluationId);

    // NOUVEAU : Vérifier disponibilité
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return false;
    }

    const verif = verifierDisponibiliteJeton(evaluation.etudiantDA, 'delai');
    if (!verif.disponible) {
        afficherNotificationErreur('Jetons épuisés', verif.raison);
        return false;
    }

    // ... reste du code existant ...
}

// Dans appliquerJetonReprise(), ajouter au début :
function appliquerJetonReprise(evaluationOriginaleId, archiverOriginale = null) {
    console.log('⭐ Application jeton de reprise:', evaluationOriginaleId);

    // NOUVEAU : Utiliser config si archiverOriginale non spécifié
    if (archiverOriginale === null) {
        const config = obtenirConfigJetons();
        archiverOriginale = config.reprise.archiverOriginale;
    }

    // NOUVEAU : Vérifier disponibilité
    const evaluation = evaluations.find(e => e.id === evaluationOriginaleId);
    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return null;
    }

    const verif = verifierDisponibiliteJeton(evaluation.etudiantDA, 'reprise');
    if (!verif.disponible) {
        afficherNotificationErreur('Jetons épuisés', verif.raison);
        return null;
    }

    // ... reste du code existant ...
}
```

---

## 🎯 Avantages de cette approche

### 1. Centralisé
- ✅ Toute la configuration au même endroit (Réglages › Pratique de notation)
- ✅ Cohérence avec configuration PAN (période, artefacts, jetons)

### 2. Simple
- ✅ Interface intuitive avec selects et radio buttons
- ✅ Valeurs par défaut raisonnables (2 jetons, 7 jours)
- ✅ Info-bulle explicative

### 3. Flexible
- ✅ Nombre de jetons configurable (0 à 5)
- ✅ Durée du délai configurable (3 à 14 jours)
- ✅ Règles de reprise configurables
- ✅ Peut désactiver complètement le système

### 4. Universel
- ✅ Fonctionne pour PAN-Maîtrise
- ✅ Fonctionne pour PAN-Spécifications (mêmes paramètres)
- ✅ Peut s'adapter à Sommative si souhaité (mettre jetons à 0)

---

## 📅 Plan d'implémentation

### Option A : Maintenant (avant 19 novembre) - 3-4 heures

**Avantages** :
- Système complet et configurable pour la démo
- Montre la flexibilité du système
- Permet de tester avec différentes configurations

**Risques** :
- Peu de temps pour tester
- Pas critique pour la démo (jetons fonctionnent déjà)

---

### Option B : Après 19 novembre (Beta 91) - 1 jour

**Avantages** :
- Temps pour bien tester
- Pas de pression pour la présentation
- Peut recevoir feedback des utilisateurs avant

**Risques** :
- Jetons restent hardcodés à 2/2 pour la démo
- Moins impressionnant pour la présentation

---

## 💡 Recommandation

**Pour le 19 novembre (Beta 90.5)** :

Si vous avez **2-3 heures disponibles** :
- ✅ Ajouter l'interface de configuration (HTML + JavaScript)
- ✅ Ajouter les fonctions helper (compterJetonsUtilises, verifierDisponibiliteJeton)
- ✅ Tester avec quelques configurations différentes

**Sinon** :
- ⏭️ Reporter à Beta 91 (après présentation)
- ✅ Mentionner dans la démo : "Le nombre de jetons sera configurable dans la prochaine version"

---

## 🎤 Message pour la présentation (19 novembre)

### Si implémenté

> "Le système de jetons est entièrement configurable. Vous pouvez définir :
> - Le nombre de jetons de délai et de reprise par trimestre
> - La durée du délai accordé
> - Le nombre maximum de reprises par production
> - Et même désactiver complètement le système si vous ne l'utilisez pas
>
> Cette configuration se fait directement dans les réglages de votre pratique de notation."

### Si pas encore implémenté

> "Le système de jetons fonctionne avec 2 jetons de chaque type par défaut.
> La configuration du nombre et des règles sera ajoutée dans la prochaine version,
> permettant à chaque enseignant d'adapter selon sa pratique pédagogique."

---

**Version** : 1.0
**Date** : 9 novembre 2025
**Auteur** : Proposition suite demande Grégoire
**Décision** : En attente de validation
