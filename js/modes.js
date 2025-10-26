/**
 * ============================================
 * MODULE 17 : GESTION DES MODES
 * ============================================
 * Gestion des modes Normal / Simulation / Anonymisation
 */

// ============================================
// CONSTANTES
// ============================================

const MODES = {
    NORMAL: 'normal',
    SIMULATION: 'simulation',
    ANONYMISATION: 'anonymisation'
};

const THEMES = {
    normal: {
        couleur: '#032e5c', // Bleu principal (var(--bleu-principal))
        nom: 'Mode Normal',
        icone: ''
    },
    simulation: {
        couleur: '#0f1e3a', // Mauve
        nom: 'Mode Simulation',
        icone: ''
    },
    anonymisation: {
        couleur: '#1a5266', // Vert
        nom: 'Mode Anonymisation',
        icone: ''
    }
};

// ============================================
// NOMS FICTIFS RÉALISTES (QUÉBÉCOIS)
// ============================================

const NOMS_FICTIFS = {
    noms: [
        'Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie',
        'Fortin', 'Gagné', 'Ouellet', 'Pelletier', 'Bélanger', 'Lévesque', 'Bergeron',
        'Leblanc', 'Paquette', 'Girard', 'Simard', 'Boucher', 'Caron', 'Beaulieu'
    ],
    prenoms: [
        'Olivier', 'Emma', 'William', 'Léa', 'Thomas', 'Alice', 'Gabriel', 'Florence',
        'Samuel', 'Jade', 'Alexis', 'Rosalie', 'Antoine', 'Camille', 'Nathan', 'Émilie',
        'Xavier', 'Chloé', 'Félix', 'Sarah', 'Maxime', 'Laura', 'Benjamin', 'Maude'
    ]
};

// ============================================
// ÉTAT GLOBAL
// ============================================

let modeActuel = localStorage.getItem('modeApplication') || MODES.NORMAL;

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le système de modes
 */
function initialiserSystemeModes() {
    console.log('🎭 Initialisation du système de modes...');

    // Récupérer le mode sauvegardé
    modeActuel = localStorage.getItem('modeApplication') || MODES.NORMAL;

    // Appliquer le thème
    appliquerTheme(modeActuel);

    // Créer le sélecteur de mode
    creerSelecteurMode();

    console.log(`✅ Mode actif: ${THEMES[modeActuel].nom}`);
}

// ============================================
// SÉLECTEUR DE MODE
// ============================================

/**
 * Crée le sélecteur de mode dans l'en-tête
 */
function creerSelecteurMode() {
    const conteneur = document.getElementById('selecteur-mode');
    if (!conteneur) {
        console.warn('⚠️ Élément #selecteur-mode introuvable');
        return;
    }

    // Vider le conteneur
    conteneur.innerHTML = '';

    // Créer le select
    const select = document.createElement('select');
    select.id = 'select-mode';
    select.className = 'select-mode';

    // Créer les options pour chaque mode (tous adjectifs)
    const labels = {
        'normal': 'Normal',
        'simulation': 'Simulé',
        'anonymisation': 'Anonymisé'
    };

    Object.entries(MODES).forEach(([key, mode]) => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = labels[mode];

        // Sélectionner l'option si c'est le mode actuel
        if (mode === modeActuel) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    // Ajouter l'événement change
    select.addEventListener('change', (e) => changerMode(e.target.value));

    // Ajouter au conteneur
    conteneur.appendChild(select);
}

// ============================================
// GESTION DES MODES
// ============================================

/**
 * Change le mode actif
 * @param {string} nouveauMode - Le nouveau mode à activer
 */
function changerMode(nouveauMode) {
    if (nouveauMode === modeActuel) return;

    console.log(`🔄 Changement de mode: ${modeActuel} → ${nouveauMode}`);

    // Sauvegarder le nouveau mode
    modeActuel = nouveauMode;
    localStorage.setItem('modeApplication', nouveauMode);

    // Appliquer le thème
    appliquerTheme(nouveauMode);

    // Mettre à jour le sélecteur de mode
    creerSelecteurMode();

    // Générer des données si nécessaire
    if (nouveauMode === MODES.SIMULATION) {
        verifierDonnesSimulation();
    }

    // Recharger les données affichées selon le nouveau mode
    // SANS recharger toute la page
    rafraichirContenuSelonMode();

    console.log(`✅ Mode changé: ${THEMES[nouveauMode].nom}`);
}

/**
 * Rafraîchit le contenu affiché selon le mode actif
 * SANS recharger toute la page
 */
function rafraichirContenuSelonMode() {
    console.log('🔄 Rafraîchissement du contenu selon le nouveau mode...');

    // Sauvegarder la sous-section active
    const sousSectionSauvegardee = sousSectionActive;

    // Déclencher l'événement AVANT le rafraîchissement
    window.dispatchEvent(new CustomEvent('modeChanged', {
        detail: { mode: modeActuel }
    }));

    // Forcer le rafraîchissement des modules actifs
    // selon la sous-section affichée
    if (sousSectionSauvegardee) {
        // Identifier quel module doit se rafraîchir
        const mappingModules = {
            'reglages-groupe': 'afficherListeEtudiants',
            'etudiants-liste': 'afficherListeEtudiantsConsultation',
            'etudiants-profil': 'afficherProfilEtudiant',
            'evaluations-liste-evaluations': 'chargerListeEvaluationsRefonte',
            'presences-saisie': 'afficherTableauPresences',
            'tableau-bord-apercu': 'afficherTableauBordApercu'
        };

        const fonctionAAppeler = mappingModules[sousSectionSauvegardee];

        if (fonctionAAppeler && typeof window[fonctionAAppeler] === 'function') {
            console.log(`   → Rafraîchissement: ${fonctionAAppeler}()`);
            window[fonctionAAppeler]();
        } else {
            // Fallback : réafficher la sous-section
            if (typeof afficherSousSection === 'function') {
                afficherSousSection(sousSectionSauvegardee);
            }
        }
    }

    console.log('✅ Contenu rafraîchi');
}

/**
 * Applique le thème visuel selon le mode
 * @param {string} mode - Le mode actif
 */
function appliquerTheme(mode) {
    // Ajouter l'attribut data-mode sur le body
    document.body.setAttribute('data-mode', mode);

    const couleur = THEMES[mode].couleur;

    // Ajouter un bandeau si pas en mode normal
    let bandeau = document.getElementById('bandeau-mode');
    if (bandeau) bandeau.remove();

    if (mode !== MODES.NORMAL) {
        bandeau = document.createElement('div');
        bandeau.id = 'bandeau-mode';
        bandeau.innerHTML = `${THEMES[mode].icone} ${THEMES[mode].nom.toUpperCase()} - Les identités affichées sont ${mode === MODES.SIMULATION ? 'fictives' : 'anonymisées'}`;
        bandeau.style.cssText = `
            background: ${couleur};
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 0.9rem;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(bandeau);
    }
}

// ============================================
// GÉNÉRATION DE DONNÉES FICTIVES
// ============================================

/**
 * Vérifie et génère les données de simulation si nécessaire
 */
function verifierDonnesSimulation() {
    const donneesExistent = localStorage.getItem('simulation_evaluations');

    if (!donneesExistent) {
        console.log('🧪 Génération de données de simulation...');
        genererDonneesSimulation();
    }
}

/**
 * Génère des données fictives réalistes pour la simulation
 */
function genererDonneesSimulation() {
    // Générer 30 étudiants fictifs
    const etudiants = [];
    for (let i = 0; i < 30; i++) {
        const nom = NOMS_FICTIFS.noms[Math.floor(Math.random() * NOMS_FICTIFS.noms.length)];
        const prenom = NOMS_FICTIFS.prenoms[Math.floor(Math.random() * NOMS_FICTIFS.prenoms.length)];
        const da = `${Math.floor(1000000 + Math.random() * 9000000)}`;

        etudiants.push({
            id: Date.now() + i,
            da: da,
            nom: nom,
            prenom: prenom,
            groupe: '99SIM'
        });
    }

    localStorage.setItem('simulation_etudiants', JSON.stringify(etudiants));

    // Générer des évaluations réalistes
    const evaluations = [];
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const artefacts = productions.filter(p => p.type === 'artefact-portfolio');

    etudiants.forEach(etudiant => {
        artefacts.forEach((artefact, idx) => {
            // Générer une note réaliste selon une distribution normale
            const moyenne = 70 + Math.random() * 15; // Entre 70 et 85
            const ecartType = 8;
            const note = Math.max(50, Math.min(100, moyenne + (Math.random() - 0.5) * ecartType * 2));

            // Convertir en niveau IDME
            let niveau;
            if (note < 60) niveau = 'I';
            else if (note < 70) niveau = 'D';
            else if (note < 85) niveau = 'M';
            else niveau = 'E';

            evaluations.push({
                id: `EVAL_SIM_${Date.now()}_${etudiant.da}_${idx}`,
                etudiantDA: etudiant.da,
                etudiantNom: `${etudiant.prenom} ${etudiant.nom}`,
                groupe: etudiant.groupe,
                productionId: artefact.id,
                productionNom: artefact.titre,
                grilleId: artefact.grilleId,
                grilleNom: 'Global-4',
                dateEvaluation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                statutRemise: 'remis',
                criteres: [],
                noteFinale: parseFloat(note.toFixed(1)),
                niveauFinal: niveau,
                retroactionFinale: `Rétroaction générée automatiquement pour ${etudiant.prenom}.`
            });
        });
    });

    localStorage.setItem('simulation_evaluations', JSON.stringify(evaluations));

    console.log(`✅ Données de simulation générées: ${etudiants.length} étudiants, ${evaluations.length} évaluations`);
}

// ============================================
// ANONYMISATION
// ============================================

/**
 * Génère un mapping d'anonymisation pour les étudiants
 * @returns {Object} - Mapping DA réel → pseudonyme
 */
function genererMappingAnonyme() {
    const mapping = JSON.parse(localStorage.getItem('mapping_anonymisation') || '{}');

    // Si le mapping existe déjà, le retourner
    if (Object.keys(mapping).length > 0) {
        return mapping;
    }

    // Sinon, créer un nouveau mapping
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const nomsUtilises = new Set();

    etudiants.forEach(etudiant => {
        let nomAnonyme, prenomAnonyme;

        // Générer un nom unique
        do {
            nomAnonyme = NOMS_FICTIFS.noms[Math.floor(Math.random() * NOMS_FICTIFS.noms.length)];
            prenomAnonyme = NOMS_FICTIFS.prenoms[Math.floor(Math.random() * NOMS_FICTIFS.prenoms.length)];
        } while (nomsUtilises.has(`${prenomAnonyme} ${nomAnonyme}`));

        nomsUtilises.add(`${prenomAnonyme} ${nomAnonyme}`);

        mapping[etudiant.da] = {
            nom: nomAnonyme,
            prenom: prenomAnonyme,
            nomComplet: `${prenomAnonyme} ${nomAnonyme}`
        };
    });

    localStorage.setItem('mapping_anonymisation', JSON.stringify(mapping));
    return mapping;
}

/**
 * Anonymise un nom d'étudiant
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} - Nom anonymisé
 */
function anonymiserNom(da) {
    if (modeActuel !== MODES.ANONYMISATION) {
        return null; // Pas en mode anonymisation
    }

    const mapping = genererMappingAnonyme();
    return mapping[da]?.nomComplet || 'Étudiant Inconnu';
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Récupère les données selon le mode actif
 * FONCTION CENTRALE - Utilisée par tous les modules
 * 
 * @param {string} cle - Clé du localStorage (ex: 'groupeEtudiants', 'evaluationsSauvegardees')
 * @returns {Array|Object} - Données selon le mode actif
 */
function obtenirDonneesSelonMode(cle) {
    const mode = modeActuel;

    // ===================================
    // MODE SIMULATION : Données fictives
    // ===================================
    if (mode === MODES.SIMULATION) {
        // Mapping des clés : certaines données de simulation ont des noms différents
        const mappingCles = {
            'groupeEtudiants': 'simulation_etudiants',
            'evaluationsSauvegardees': 'simulation_evaluations'
        };

        const cleSimulation = mappingCles[cle] || `simulation_${cle}`;
        const donneesSimulation = localStorage.getItem(cleSimulation);

        if (donneesSimulation) {
            const donnees = JSON.parse(donneesSimulation);
            console.log(`[Simulation] Chargement de ${Array.isArray(donnees) ? donnees.length : 'N/A'} element(s) depuis ${cleSimulation}`);
            return donnees;
        }
        // Fallback : si pas de données de simulation, utiliser les vraies
        console.warn(`Pas de donnees de simulation pour ${cle}, utilisation des donnees reelles`);
    }

    // ===================================
    // MODE NORMAL ou ANONYMISATION : Données réelles
    // ===================================
    let donnees = JSON.parse(localStorage.getItem(cle) || '[]');

    // Si mode anonymisation, anonymiser selon le type de données
    if (mode === MODES.ANONYMISATION) {
        donnees = anonymiserDonnees(cle, donnees);
    }

    return donnees;
}

/**
 * Sauvegarde des données selon le mode actif
 * FONCTION CENTRALE - À utiliser partout où on fait localStorage.setItem()
 * 
 * @param {string} cle - Clé de base (ex: 'groupeEtudiants')
 * @param {*} donnees - Données à sauvegarder
 * @returns {boolean} - true si sauvegarde réussie, false si bloquée
 */
function sauvegarderDonneesSelonMode(cle, donnees) {
    const mode = modeActuel;
    
    // MODE ANONYMISATION : Bloquer toute écriture
    if (mode === MODES.ANONYMISATION) {
        console.warn('⚠️ Écriture bloquée en mode anonymisation');
        return false;
    }
    
    // MODE SIMULATION : Rediriger vers les clés de simulation
    if (mode === MODES.SIMULATION) {
        const mappingCles = {
            'groupeEtudiants': 'simulation_etudiants',
            'evaluationsSauvegardees': 'simulation_evaluations',
            'presences': 'simulation_presences'
        };
        
        const cleSimulation = mappingCles[cle] || `simulation_${cle}`;
        localStorage.setItem(cleSimulation, JSON.stringify(donnees));
        console.log(`[Simulation] Sauvegarde dans ${cleSimulation}`);
        return true;
    }
    
    // MODE NORMAL : Sauvegarder normalement
    localStorage.setItem(cle, JSON.stringify(donnees));
    console.log(`[Normal] Sauvegarde dans ${cle}`);
    return true;
}

/**
 * Anonymise les données selon leur type
 * @param {string} cle - Type de données (groupeEtudiants, evaluationsSauvegardees, etc.)
 * @param {Array|Object} donnees - Données à anonymiser
 * @returns {Array|Object} - Données anonymisées
 */
function anonymiserDonnees(cle, donnees) {
    if (!Array.isArray(donnees)) {
        return donnees; // Si ce n'est pas un tableau, retourner tel quel
    }

    const mapping = genererMappingAnonyme();

    // Anonymiser selon le type de clé
    switch (cle) {
        case 'groupeEtudiants':
            return donnees.map(etudiant => ({
                ...etudiant,
                nom: mapping[etudiant.da]?.nom || etudiant.nom,
                prenom: mapping[etudiant.da]?.prenom || etudiant.prenom,
                groupe: etudiant.groupe ? `AN.${etudiant.groupe}` : etudiant.groupe
            }));

        case 'evaluationsSauvegardees':
            return donnees.map(evaluation => {
                const nomAnonyme = mapping[evaluation.etudiantDA]?.nomComplet || evaluation.etudiantNom;
                return {
                    ...evaluation,
                    etudiantNom: nomAnonyme,
                    groupe: evaluation.groupe ? `AN.${evaluation.groupe}` : evaluation.groupe
                };
            });

        case 'presences':
            // Les présences gardent le DA mais on peut anonymiser le nom si présent
            return donnees.map(presence => ({
                ...presence,
                nom: mapping[presence.da]?.nom || presence.nom,
                prenom: mapping[presence.da]?.prenom || presence.prenom
            }));

        default:
            // Pour les autres types de données, retourner tel quel
            return donnees;
    }
}

/**
 * Anonymise les données selon leur type
 * @param {string} cle - Type de données (groupeEtudiants, evaluationsSauvegardees, etc.)
 * @param {Array|Object} donnees - Données à anonymiser
 * @returns {Array|Object} - Données anonymisées
 */
function anonymiserDonnees(cle, donnees) {
    if (!Array.isArray(donnees)) {
        return donnees; // Si ce n'est pas un tableau, retourner tel quel
    }

    const mapping = genererMappingAnonyme();

    // Anonymiser selon le type de clé
    switch (cle) {
        case 'groupeEtudiants':
            return donnees.map(etudiant => ({
                ...etudiant,
                nom: mapping[etudiant.da]?.nom || etudiant.nom,
                prenom: mapping[etudiant.da]?.prenom || etudiant.prenom,
                groupe: etudiant.groupe ? `AN.${etudiant.groupe}` : etudiant.groupe
            }));

        case 'evaluationsSauvegardees':
            return donnees.map(evaluation => {
                const nomAnonyme = mapping[evaluation.etudiantDA]?.nomComplet || evaluation.etudiantNom;
                return {
                    ...evaluation,
                    etudiantNom: nomAnonyme,
                    groupe: evaluation.groupe ? `AN.${evaluation.groupe}` : evaluation.groupe
                };
            });

        case 'presences':
            // Les présences gardent le DA mais on peut anonymiser le nom si présent
            return donnees.map(presence => ({
                ...presence,
                nom: mapping[presence.da]?.nom || presence.nom,
                prenom: mapping[presence.da]?.prenom || presence.prenom
            }));

        default:
            // Pour les autres types de données, retourner tel quel
            return donnees;
    }
}

/**
 * Vérifie si le mode actuel est en lecture seule
 * @returns {boolean}
 */
function estModeeLectureSeule() {
    return modeActuel === MODES.ANONYMISATION;
}

// ============================================
// EXPORT
// ============================================

window.MODES = MODES;
window.initialiserSystemeModes = initialiserSystemeModes;
window.changerMode = changerMode;
window.obtenirDonneesSelonMode = obtenirDonneesSelonMode;
window.anonymiserNom = anonymiserNom;
window.estModeeLectureSeule = estModeeLectureSeule;

/**
 * Sauvegarde des données selon le mode actif
 * @param {string} cle - Clé localStorage (ex: 'groupeEtudiants')
 * @param {*} donnees - Données à sauvegarder
 * @returns {boolean} - true si réussi, false si bloqué
 */
function sauvegarderDonneesSelonMode(cle, donnees) {
    const mode = modeActuel;
    
    // MODE ANONYMISATION : Bloquer toute écriture
    if (mode === MODES.ANONYMISATION) {
        console.warn('⚠️ Écriture bloquée en mode anonymisation');
        return false;
    }
    
    // MODE SIMULATION : Rediriger vers clés simulation
    if (mode === MODES.SIMULATION) {
        const mappingCles = {
            'groupeEtudiants': 'simulation_etudiants',
            'evaluationsSauvegardees': 'simulation_evaluations',
            'presences': 'simulation_presences'
        };
        
        const cleSimulation = mappingCles[cle] || `simulation_${cle}`;
        localStorage.setItem(cleSimulation, JSON.stringify(donnees));
        console.log(`[Simulation] Sauvegarde dans ${cleSimulation}`);
        return true;
    }
    
    // MODE NORMAL : Sauvegarder normalement
    localStorage.setItem(cle, JSON.stringify(donnees));
    console.log(`[Normal] Sauvegarde dans ${cle}`);
    return true;
}
window.sauvegarderDonneesSelonMode = sauvegarderDonneesSelonMode;
window.modeActuel = () => modeActuel;

