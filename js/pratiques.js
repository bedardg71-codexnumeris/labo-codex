/* ===============================
   MODULE 12: PRATIQUES DE NOTATION
   Index: 50 10-10-2025a → Modularisation
   Étendu le 20 octobre 2025 pour supporter les options d'affichage
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration du système de notation
   du cours (traditionnelle ou alternative) ET les options
   d'affichage des indices au tableau de bord.
   
   Contenu de ce module:
   - Configuration pratique de notation (sommative/alternative)
   - Gestion des types de PAN (maîtrise/spécifications/dénotation)
   - Options d'affichage des indices (sommatif/alternatif/les deux)
   - Affichage des informations contextuelles
   - Sauvegarde et chargement des modalités
   - Mise à jour du statut de configuration
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Éléments HTML requis:
   - #pratiqueNotation : Select pour choisir la pratique
   - #colonnePAN : Conteneur pour le type de PAN
   - #typePAN : Select pour choisir le type de PAN
   - #infoPAN : Zone d'information sur le PAN choisi
   - #optionsAffichageIndices : Conteneur des options d'affichage
   - #afficherSommatif : Checkbox pour afficher indices sommatifs
   - #afficherAlternatif : Checkbox pour afficher indices alternatifs
   - #statutModalites : Zone d'affichage du statut
   - #btnSauvegarderPratiqueNotation : Bouton de sauvegarde
   
   LocalStorage utilisé:
   - 'modalitesEvaluation' : Object contenant la configuration complète
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module des pratiques de notation
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Attache les événements aux éléments
 * 3. Charge les modalités sauvegardées
 * 4. Met à jour le statut d'affichage
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModulePratiques() {
    console.log('Initialisation du module Pratiques de notation');

    // Vérifier que nous sommes dans la bonne section
    const selectPratique = document.getElementById('pratiqueNotation');
    if (!selectPratique) {
        console.log('   ⚠️  Section pratiques non active, initialisation reportée');
        return;
    }
    
    // Attacher les événements
    attacherEvenementsPratiques();
    
    // Charger les modalités sauvegardées
    chargerModalites();
    
    console.log('   ✅ Module Pratiques initialisé');
}

/**
 * Attache les événements aux éléments HTML
 * Appelée par initialiserModulePratiques()
 */
function attacherEvenementsPratiques() {
    // Sélecteur pratique de notation
    const selectPratique = document.getElementById('pratiqueNotation');
    if (selectPratique) {
        selectPratique.addEventListener('change', changerPratiqueNotation);
    }

    // Sélecteur type PAN
    const selectTypePAN = document.getElementById('typePAN');
    if (selectTypePAN) {
        selectTypePAN.addEventListener('change', afficherInfoPAN);
    }

    // Checkbox mode comparatif
    const checkComparatif = document.getElementById('modeComparatif');
    if (checkComparatif) {
        checkComparatif.addEventListener('change', sauvegarderOptionsAffichage);
    }

    // Checkbox activation jetons
    const checkJetonsActif = document.getElementById('jetonsActif');
    if (checkJetonsActif) {
        checkJetonsActif.addEventListener('change', toggleConfigJetons);
    }

    // Bouton sauvegarder
    const btnSauvegarder = document.getElementById('btnSauvegarderPratiqueNotation');
    if (btnSauvegarder) {
        btnSauvegarder.addEventListener('click', sauvegarderPratiqueNotation);
    }
}

/* ===============================
   📝 GESTION DE LA PRATIQUE DE NOTATION
   =============================== */

/**
 * Gère le changement de pratique de notation
 * Appelée lors du changement dans #pratiqueNotation
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la pratique sélectionnée
 * 2. Affiche/masque la colonne PAN selon la pratique
 * 3. Réinitialise le type PAN si nécessaire
 * 4. Affiche les options d'affichage
 * 5. Sauvegarde dans localStorage
 * 6. Met à jour le statut
 */
function changerPratiqueNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const infoPAN = document.getElementById('infoPAN');

    if (pratique === 'alternative') {
        // Afficher le menu PAN
        colonnePAN.style.display = 'block';
    } else {
        // Masquer le menu PAN
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        infoPAN.style.display = 'none';
    }

    // Sauvegarder dans modalitesEvaluation
    let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'alternative' ? modalites.typePAN : null;
    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

    // Gérer l'affichage des options d'affichage
    afficherOptionsAffichage();

    // Afficher/masquer la configuration PAN
    afficherConfigurationPAN();

    mettreAJourStatutModalites();
}

/* ===============================
   📚 GESTION DU TYPE DE PAN
   =============================== */

/**
 * Affiche les informations sur le type de PAN sélectionné
 * Appelée lors du changement dans #typePAN
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le type PAN sélectionné
 * 2. Affiche la description correspondante
 * 3. Sauvegarde dans localStorage
 * 4. Met à jour le statut
 */
function afficherInfoPAN() {
    const typePAN = document.getElementById('typePAN').value;
    const infoPAN = document.getElementById('infoPAN');

    const descriptions = {
        'maitrise': 'L\'étudiant·e progresse à travers des niveaux de maîtrise (Ex: En développement, Acquis, Avancé...). En anglais on l\'appelle <em>Standard Based Grading</em>.',
        'specifications': 'L\'étudiant·e doit satisfaire à des critères précis et binaires (réussi/non réussi) pour chaque compétence. En anglais on l\'appelle <em>Specifications Grading</em>.',
        'denotation': 'Approche sans notes chiffrées pendant le trimestre. L\'accent est mis sur la rétroaction descriptive et l\'autoévaluation. En anglais on l\'appelle <em>Ungrading</em>.'
    };

    if (typePAN && descriptions[typePAN]) {
        infoPAN.innerHTML = descriptions[typePAN];
        infoPAN.style.display = 'block';

        // Sauvegarder le type de PAN
        let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        modalites.typePAN = typePAN;
        localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

        mettreAJourStatutModalites();
    } else {
        infoPAN.style.display = 'none';
    }
}

/* ===============================
   GESTION DES OPTIONS D'AFFICHAGE (NOUVEAU)
   =============================== */

/**
 * Gère l'affichage de la section des options d'affichage
 * Appelée après le changement de pratique de notation
 *
 * FONCTIONNEMENT:
 * 1. Affiche/masque la section selon la pratique choisie
 * 2. Décoche le mode comparatif par défaut
 * 3. Sauvegarde automatiquement
 */
function afficherOptionsAffichage() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const optionsAffichage = document.getElementById('optionsAffichageIndices');
    const checkComparatif = document.getElementById('modeComparatif');

    if (!optionsAffichage) return;

    if (pratique === 'alternative' || pratique === 'sommative') {
        optionsAffichage.style.display = 'block';
        // Par défaut : mode comparatif désactivé (affichage de la pratique principale uniquement)
        if (checkComparatif) {
            checkComparatif.checked = false;
        }
    } else {
        optionsAffichage.style.display = 'none';
    }

    sauvegarderOptionsAffichage();
}

/**
 * Sauvegarde les options d'affichage des indices
 * Appelée par l'événement change de la checkbox mode comparatif
 *
 * FONCTIONNEMENT:
 * 1. Récupère l'état du mode comparatif
 * 2. Si mode comparatif actif → affiche SOM + PAN
 * 3. Sinon → affiche uniquement la pratique principale choisie
 * 4. Sauvegarde dans localStorage
 */
function sauvegarderOptionsAffichage() {
    const checkComparatif = document.getElementById('modeComparatif');
    const selectPratique = document.getElementById('pratiqueNotation');

    if (!checkComparatif || !selectPratique) return;

    const modeComparatif = checkComparatif.checked;
    const pratique = selectPratique.value;

    // Récupérer la config existante
    let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    // Définir l'affichage selon le mode comparatif
    if (modeComparatif) {
        // Mode comparatif : afficher les deux
        modalites.affichageTableauBord = {
            afficherSommatif: true,
            afficherAlternatif: true
        };
    } else {
        // Mode normal : afficher uniquement la pratique principale
        if (pratique === 'sommative') {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: false
            };
        } else if (pratique === 'alternative') {
            modalites.affichageTableauBord = {
                afficherSommatif: false,
                afficherAlternatif: true
            };
        }
    }

    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

    console.log('Options d\'affichage sauvegardées:', modalites.affichageTableauBord);
}

/* ===============================
   CONFIGURATION PAN (PÉRIODE, ARTEFACTS, JETONS)
   =============================== */

/**
 * Affiche/masque la configuration PAN selon la pratique sélectionnée
 */
function afficherConfigurationPAN() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const configPAN = document.getElementById('configurationPAN');

    if (!configPAN) return;

    if (pratique === 'alternative') {
        configPAN.style.display = 'block';
        chargerConfigurationPAN();
    } else {
        configPAN.style.display = 'none';
    }
}

/**
 * Affiche les paramètres de configuration PAN
 * Appelée par le bouton "Modifier les paramètres"
 */
function afficherParametresPAN() {
    const configPAN = document.getElementById('configurationPAN');
    if (!configPAN) return;

    configPAN.style.display = 'block';
    chargerConfigurationPAN();

    // Scroller vers la section
    configPAN.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Charge la configuration PAN depuis localStorage
 */
function chargerConfigurationPAN() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const configPAN = modalites.configPAN || {};

    // Période d'évaluation
    const nombreCours = configPAN.nombreCours || 7;
    const radioPeriode = document.querySelector(`input[name="periodePAN"][value="${nombreCours}"]`);
    if (radioPeriode) {
        radioPeriode.checked = true;
    }

    // ⚠️ SINGLE SOURCE OF TRUTH: nombreARetenir vient du portfolio dans productions
    // Lire depuis productions (lecture seule)
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const portfolio = productions.find(p => p.type === 'portfolio');
    const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;

    const affichageNombreARetenir = document.getElementById('affichageNombreARetenir');
    if (affichageNombreARetenir) {
        affichageNombreARetenir.textContent = `${nombreARetenir} meilleurs artefacts`;
    }

    // Jetons - valeurs par défaut
    const jetons = configPAN.jetons || {
        actif: true,
        delai: { nombre: 2, dureeJours: 7 },
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    };

    const checkJetonsActif = document.getElementById('jetonsActif');
    if (checkJetonsActif) {
        checkJetonsActif.checked = jetons.actif;
    }

    const selectNombreJetonsDelai = document.getElementById('nombreJetonsDelai');
    if (selectNombreJetonsDelai) {
        selectNombreJetonsDelai.value = jetons.delai.nombre;
    }

    const selectDureeDelai = document.getElementById('dureeDelai');
    if (selectDureeDelai) {
        selectDureeDelai.value = jetons.delai.dureeJours;
    }

    const selectNombreJetonsReprise = document.getElementById('nombreJetonsReprise');
    if (selectNombreJetonsReprise) {
        selectNombreJetonsReprise.value = jetons.reprise.nombre;
    }

    const selectMaxRepriseParProduction = document.getElementById('maxRepriseParProduction');
    if (selectMaxRepriseParProduction) {
        selectMaxRepriseParProduction.value = jetons.reprise.maxParProduction;
    }

    const gestionOriginale = jetons.reprise.archiverOriginale ? 'archiver' : 'supprimer';
    const radioGestion = document.querySelector(`input[name="gestionOriginale"][value="${gestionOriginale}"]`);
    if (radioGestion) {
        radioGestion.checked = true;
    }

    // Activer/désactiver sections jetons
    toggleConfigJetons();
}

/**
 * Active/désactive les sections de configuration des jetons
 */
function toggleConfigJetons() {
    const checkJetonsActif = document.getElementById('jetonsActif');
    if (!checkJetonsActif) return;

    const jetonsActif = checkJetonsActif.checked;
    const configDelai = document.getElementById('configJetonsDelai');
    const configReprise = document.getElementById('configJetonsReprise');

    if (configDelai) {
        configDelai.style.opacity = jetonsActif ? '1' : '0.5';
    }

    if (configReprise) {
        configReprise.style.opacity = jetonsActif ? '1' : '0.5';
    }

    // Désactiver les champs si jetons inactifs
    if (configDelai) {
        const champsDelai = configDelai.querySelectorAll('select');
        champsDelai.forEach(champ => champ.disabled = !jetonsActif);
    }

    if (configReprise) {
        const champsReprise = configReprise.querySelectorAll('select, input');
        champsReprise.forEach(champ => champ.disabled = !jetonsActif);
    }
}

/**
 * Sauvegarde la configuration PAN
 */
function sauvegarderConfigurationPAN() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    // Période d'évaluation
    const radioPeriode = document.querySelector('input[name="periodePAN"]:checked');
    const nombreCours = radioPeriode ? parseInt(radioPeriode.value) : 7;

    // ⚠️ SINGLE SOURCE OF TRUTH: nombreARetenir n'est PLUS sauvegardé ici
    // Il est lu depuis productions (voir chargerConfigurationPAN)

    // Jetons
    const checkJetonsActif = document.getElementById('jetonsActif');
    const jetonsActif = checkJetonsActif ? checkJetonsActif.checked : true;

    const selectNombreJetonsDelai = document.getElementById('nombreJetonsDelai');
    const nombreJetonsDelai = selectNombreJetonsDelai ? parseInt(selectNombreJetonsDelai.value) : 2;

    const selectDureeDelai = document.getElementById('dureeDelai');
    const dureeDelai = selectDureeDelai ? parseInt(selectDureeDelai.value) : 7;

    const selectNombreJetonsReprise = document.getElementById('nombreJetonsReprise');
    const nombreJetonsReprise = selectNombreJetonsReprise ? parseInt(selectNombreJetonsReprise.value) : 2;

    const selectMaxRepriseParProduction = document.getElementById('maxRepriseParProduction');
    const maxRepriseParProduction = selectMaxRepriseParProduction ? parseInt(selectMaxRepriseParProduction.value) : 1;

    const radioGestion = document.querySelector('input[name="gestionOriginale"]:checked');
    const gestionOriginale = radioGestion ? radioGestion.value : 'archiver';

    // Construire l'objet config
    // ⚠️ nombreARetenir n'est PLUS dans configPAN (lecture depuis productions)
    modalites.configPAN = {
        nombreCours: nombreCours,

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
   SAUVEGARDE ET CHARGEMENT
   =============================== */

/**
 * Sauvegarde la configuration complète de la pratique de notation
 * Appelée par le bouton «Sauvegarder la configuration»
 *
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs
 * 2. Valide les champs obligatoires
 * 3. Sauvegarde dans localStorage avec timestamp
 * 4. Sauvegarde la configuration PAN si pratique alternative
 * 5. Affiche notification de succès
 * 6. Met à jour le statut
 */
function sauvegarderPratiqueNotation() {
    const pratique = document.getElementById('pratiqueNotation').value;
    const typePAN = document.getElementById('typePAN').value;

    if (!pratique) {
        alert('Veuillez choisir une pratique de notation');
        return;
    }

    if (pratique === 'alternative' && !typePAN) {
        alert('Veuillez choisir un type de pratique alternative');
        return;
    }

    // Construire la configuration complète
    let modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    modalites.pratique = pratique;
    modalites.typePAN = pratique === 'alternative' ? typePAN : null;
    modalites.dateConfiguration = new Date().toISOString();

    // S'assurer que les options d'affichage sont incluses
    if (!modalites.affichageTableauBord) {
        const checkComparatif = document.getElementById('modeComparatif');
        const modeComparatif = checkComparatif ? checkComparatif.checked : false;

        if (modeComparatif) {
            modalites.affichageTableauBord = {
                afficherSommatif: true,
                afficherAlternatif: true
            };
        } else {
            if (pratique === 'sommative') {
                modalites.affichageTableauBord = {
                    afficherSommatif: true,
                    afficherAlternatif: false
                };
            } else if (pratique === 'alternative') {
                modalites.affichageTableauBord = {
                    afficherSommatif: false,
                    afficherAlternatif: true
                };
            }
        }
    }

    localStorage.setItem('modalitesEvaluation', JSON.stringify(modalites));

    // Sauvegarder la configuration PAN si pratique alternative
    if (pratique === 'alternative') {
        sauvegarderConfigurationPAN();
    }

    afficherNotificationSucces('Configuration de la pratique de notation sauvegardée !');
    mettreAJourStatutModalites();

    console.log('Configuration complète sauvegardée:', modalites);
}

/**
 * Charge les modalités sauvegardées depuis localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Si vide: réinitialise tous les champs
 * 3. Sinon: remplit les champs avec les valeurs
 * 4. Affiche/masque la colonne PAN selon la pratique
 * 5. Charge les options d'affichage
 * 6. Met à jour le statut
 */
function chargerModalites() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    const selectPratique = document.getElementById('pratiqueNotation');
    const colonnePAN = document.getElementById('colonnePAN');
    const selectPAN = document.getElementById('typePAN');
    const optionsAffichage = document.getElementById('optionsAffichageIndices');

    // S'assurer que les éléments existent avant de continuer
    if (!selectPratique || !colonnePAN || !selectPAN) {
        console.warn('Éléments de formulaire non trouvés');
        return;
    }

    // Si pas de données sauvegardées, tout remettre à zéro
    if (!modalites.pratique) {
        selectPratique.value = '';
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
        if (optionsAffichage) {
            optionsAffichage.style.display = 'none';
        }
        mettreAJourStatutModalites();
        return;
    }

    // Charger la pratique de notation
    selectPratique.value = modalites.pratique;

    // Gérer l'affichage du menu PAN
    if (modalites.pratique === 'alternative') {
        colonnePAN.style.display = 'block';

        // Charger le type de PAN si disponible
        if (modalites.typePAN) {
            selectPAN.value = modalites.typePAN;
            afficherInfoPAN();
        } else {
            selectPAN.value = '';
        }
    } else {
        colonnePAN.style.display = 'none';
        selectPAN.value = '';
    }

    // Charger les options d'affichage
    if (modalites.affichageTableauBord) {
        const checkComparatif = document.getElementById('modeComparatif');

        if (checkComparatif) {
            // Mode comparatif activé si les deux sont affichés
            const modeComparatif = modalites.affichageTableauBord.afficherSommatif &&
                                   modalites.affichageTableauBord.afficherAlternatif;
            checkComparatif.checked = modeComparatif;
        }
    }
    
    // Afficher la section options si nécessaire
    afficherOptionsAffichage();

    // Masquer la section configurationPAN au chargement
    // Elle sera affichée par le bouton "Modifier les paramètres"
    const configPAN = document.getElementById('configurationPAN');
    if (configPAN && modalites.pratique === 'alternative') {
        configPAN.style.display = 'none';
    }

    // Mettre à jour le statut
    mettreAJourStatutModalites();
}

/* ===============================
   MISE À JOUR DU STATUT
   =============================== */

/**
 * Met à jour l'affichage du statut de configuration
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les modalités depuis localStorage
 * 2. Détermine le statut selon les valeurs
 * 3. Met à jour #statutModalites avec HTML formaté
 */
function mettreAJourStatutModalites() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const statutDiv = document.getElementById('statutModalites');

    if (!statutDiv) {
        console.error('Element #statutModalites non trouvé');
        return;
    }

    // Vérifier le statut selon la pratique choisie
    if (!modalites.pratique) {
        statutDiv.innerHTML = '<span style="color: var(--risque-critique);">✗ À configurer</span>';
    } else if (modalites.pratique === 'sommative') {
        statutDiv.innerHTML = '<span style="color: var(--vert-moyen);">✓ Sommative traditionnelle (en %)</span>';
    } else if (modalites.pratique === 'alternative' && modalites.typePAN) {
        const types = {
            'maitrise': 'Maîtrise',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        statutDiv.innerHTML = `
            <span style="color: var(--vert-moyen);">✓ Alternative (${types[modalites.typePAN]})</span>
            <button onclick="afficherParametresPAN()" class="btn btn-secondaire" style="margin-left: 15px; padding: 4px 12px; font-size: 0.85rem;">
                Modifier les paramètres
            </button>
        `;
    } else if (modalites.pratique === 'alternative' && !modalites.typePAN) {
        statutDiv.innerHTML = '<span style="color: var(--orange-accent);">⚠ Choisir un type de PAN</span>';
    }
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/* ===============================
   UTILITAIRES PUBLICS
   =============================== */

/**
 * Récupère la configuration de notation complète
 * Fonction utilitaire pour les autres modules
 * 
 * @returns {Object} Configuration complète de notation
 * 
 * UTILISÉ PAR:
 * - Module tableau-bord pour savoir quels indices afficher
 * - Module évaluations pour adapter le comportement
 * - Module statistiques pour les calculs
 */
function obtenirConfigurationNotation() {
    return JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * STRUCTURE LOCALSTORAGE:
 * {
 *   pratique: "sommative" | "alternative",
 *   typePAN: "maitrise" | "specifications" | "denotation" | null,
 *   affichageTableauBord: {
 *     afficherSommatif: boolean,
 *     afficherAlternatif: boolean
 *   },
 *   dateConfiguration: "2025-10-20T..."
 * }
 * 
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 12-pratiques.js
 * 3. Appeler initialiserModulePratiques() depuis 99-main.js
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */