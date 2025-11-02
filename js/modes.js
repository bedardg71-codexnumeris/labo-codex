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
// NOMS FICTIFS RÉALISTES (DIVERSIFIÉS)
// ============================================

const NOMS_FICTIFS = {
    // 85% Québécois
    quebecois: {
        noms: [
            'Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie',
            'Fortin', 'Gagné', 'Ouellet', 'Pelletier', 'Bélanger', 'Lévesque', 'Bergeron',
            'Leblanc', 'Paquette', 'Girard', 'Simard', 'Boucher', 'Caron', 'Beaulieu',
            'Cloutier', 'Poirier', 'Fournier', 'Leclerc', 'Dupont', 'Lefebvre', 'Dubois',
            'Martin', 'Mercier', 'Gendron', 'Landry', 'Martel', 'Hébert', 'Rousseau',
            'Dufour', 'Nadeau', 'Proulx', 'Thibault', 'Gouge', 'St-Pierre', 'Demers',
            'Picard', 'Desrosiers', 'Deschamps', 'Michaud', 'Vaillancourt', 'Carrier'
        ],
        prenoms: [
            'Olivier', 'Emma', 'William', 'Léa', 'Thomas', 'Alice', 'Gabriel', 'Florence',
            'Samuel', 'Jade', 'Alexis', 'Rosalie', 'Antoine', 'Camille', 'Nathan', 'Émilie',
            'Xavier', 'Chloé', 'Félix', 'Sarah', 'Maxime', 'Laura', 'Benjamin', 'Maude',
            'Raphaël', 'Zoé', 'Lucas', 'Juliette', 'Noah', 'Laurie', 'Jacob', 'Mélodie',
            'Mathis', 'Amélie', 'Louis', 'Charlotte', 'Charles', 'Élizabeth', 'Étienne', 'Océane',
            'Jérémie', 'Audrey', 'Nicolas', 'Sophie', 'Vincent', 'Catherine', 'Alexandre', 'Marie'
        ]
    },

    // 5% Africains
    africains: {
        noms: [
            'Diallo', 'Traoré', 'Koné', 'Touré', 'Camara', 'Keita', 'Sylla', 'Bah',
            'Barry', 'Sow', 'Dembélé', 'Diarra', 'Sangaré', 'Burin', 'Ouedraogo'
        ],
        prenoms: [
            'Amadou', 'Aïcha', 'Ibrahim', 'Fatima', 'Mamadou', 'Mariam', 'Abdoulaye', 'Aminata',
            'Moussa', 'Kadiatou', 'Sekou', 'Fatoumata', 'Boubacar', 'Safiatou', 'Adama', 'Hawa'
        ]
    },

    // 5% Latino
    latino: {
        noms: [
            'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Brunissoir', 'Perez', 'Sanchez',
            'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz'
        ],
        prenoms: [
            'Carlos', 'Maria', 'Jose', 'Carmen', 'Luis', 'Ana', 'Miguel', 'Sofia',
            'Diego', 'Isabella', 'Pablo', 'Valentina', 'Juan', 'Camila', 'Antonio', 'Lucia'
        ]
    },

    // 5% Arabes
    arabes: {
        noms: [
            'Ahmed', 'Ben Ali', 'Khalil', 'Hassan', 'Mansour', 'Saidi', 'Amari', 'Brahim',
            'El Khoury', 'Salah', 'Farid', 'Nasser', 'Bouazza', 'Hamdi', 'Rachid'
        ],
        prenoms: [
            'Mohamed', 'Yasmine', 'Omar', 'Leila', 'Karim', 'Sarah', 'Ali', 'Nadia',
            'Youssef', 'Amina', 'Mehdi', 'Fatima', 'Bilal', 'Samira', 'Amine', 'Khadija'
        ]
    }
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
            'tableau-bord-apercu': 'afficherTableauBordApercu',
            'tableau-bord-profil': 'afficherProfilComplet'  // AJOUT: Rafraîchir le profil lors du changement de mode
        };

        const fonctionAAppeler = mappingModules[sousSectionSauvegardee];

        if (fonctionAAppeler && typeof window[fonctionAAppeler] === 'function') {
            console.log(`   → Rafraîchissement: ${fonctionAAppeler}()`);

            // SPÉCIAL : Pour afficherProfilComplet
            if (fonctionAAppeler === 'afficherProfilComplet' && window.profilActuelDA) {
                // Récupérer les étudiants AVANT le changement de mode pour connaître la position
                const etudiantsAvant = window.etudiantsListeCache || [];
                const indexAvant = etudiantsAvant.findIndex(e => e.da === window.profilActuelDA);

                // Vérifier si le DA existe dans le nouveau mode
                const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
                const etudiantsTries = typeof filtrerEtudiantsParMode === 'function'
                    ? filtrerEtudiantsParMode(etudiants)
                    : etudiants.filter(e => e.groupe !== '9999');

                const etudiantExiste = etudiantsTries.find(e => e.da === window.profilActuelDA);

                if (etudiantExiste) {
                    // L'étudiant existe dans le nouveau mode, afficher son profil
                    console.log(`   ✅ Même étudiant (DA: ${window.profilActuelDA})`);
                    window[fonctionAAppeler](window.profilActuelDA);
                } else {
                    // L'étudiant n'existe pas : afficher l'étudiant à la même position dans la nouvelle liste
                    let daAAfficher;

                    if (indexAvant >= 0 && indexAvant < etudiantsTries.length) {
                        // Afficher l'étudiant à la même position
                        daAAfficher = etudiantsTries[indexAvant].da;
                        console.log(`   ↔️ DA inexistant, position ${indexAvant + 1}/${etudiantsTries.length} → DA: ${daAAfficher}`);
                    } else {
                        // Position invalide : afficher le premier étudiant
                        daAAfficher = etudiantsTries[0]?.da;
                        console.log(`   ↔️ DA inexistant, affichage du premier étudiant → DA: ${daAAfficher}`);
                    }

                    if (daAAfficher) {
                        window[fonctionAAppeler](daAAfficher);
                    } else {
                        // Aucun étudiant disponible, retourner à la liste
                        console.log(`   ⚠️ Aucun étudiant disponible, retour à la liste`);
                        if (typeof afficherSousSection === 'function') {
                            afficherSousSection('tableau-bord-apercu');
                        }
                    }
                }
            } else {
                window[fonctionAAppeler]();
            }
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

        // Texte du bandeau
        let texte = `${THEMES[mode].icone} ${THEMES[mode].nom.toUpperCase()} - Les identités affichées sont ${mode === MODES.SIMULATION ? 'fictives' : 'anonymisées'}`;

        // Ajouter contrôle DA seulement en mode anonymisation
        if (mode === MODES.ANONYMISATION) {
            const afficherDAReel = obtenirOptionAffichageDA();
            texte += ` | DA: <label style="cursor: pointer; margin-left: 10px;">
                <input type="checkbox" id="checkbox-da-anonyme" ${afficherDAReel ? 'checked' : ''}
                       onchange="definirOptionAffichageDA(this.checked)"
                       style="margin-right: 5px; cursor: pointer;">
                Afficher DA réels
            </label>`;
        }

        bandeau.innerHTML = texte;
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
    // Vérifier si des données de simulation existent (étudiants OU évaluations)
    const etudiantsExistent = localStorage.getItem('simulation_etudiants');
    const evaluationsExistent = localStorage.getItem('simulation_evaluations');

    if (!etudiantsExistent && !evaluationsExistent) {
        console.log('🧪 Aucune donnée de simulation trouvée');
        console.log('💡 Pour utiliser le mode simulé:');
        console.log('   1. Allez dans Réglages → Modes → Clonage anonymisé');
        console.log('   2. Cliquez sur "Cloner depuis Groupe 1"');
        console.log('   3. Cliquez sur "Synchroniser les données"');

        // Ne pas générer automatiquement - l'utilisateur doit utiliser le clonage
        // genererDonneesSimulation();
    } else if (etudiantsExistent && !evaluationsExistent) {
        console.log('⚠️ Étudiants simulés trouvés, mais pas d\'évaluations');
        console.log('💡 Cliquez sur "Synchroniser les données" dans Réglages → Modes');
    } else {
        console.log('✅ Données de simulation trouvées');
    }
}

/**
 * Génère des données fictives réalistes pour la simulation
 */
function genererDonneesSimulation() {
    // Générer 30 étudiants fictifs avec diversité culturelle
    const etudiants = [];
    const nomsUtilises = new Set();

    for (let i = 0; i < 30; i++) {
        // Choisir UNE catégorie pour cet étudiant (garantit cohérence nom + prénom)
        const categorie = choisirCategorieCulturelle();
        const listeCategorielle = NOMS_FICTIFS[categorie];

        let nom, prenom;

        // Générer un nom unique DANS CETTE CATÉGORIE
        let tentatives = 0;
        do {
            nom = listeCategorielle.noms[Math.floor(Math.random() * listeCategorielle.noms.length)];
            prenom = listeCategorielle.prenoms[Math.floor(Math.random() * listeCategorielle.prenoms.length)];
            tentatives++;

            // Sécurité : si trop de tentatives, abandonner (tous les noms de cette catégorie sont utilisés)
            if (tentatives > 100) {
                console.warn(`Impossible de générer un nom unique dans la catégorie ${categorie}`);
                break;
            }
        } while (nomsUtilises.has(`${prenom} ${nom}`));

        nomsUtilises.add(`${prenom} ${nom}`);

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
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
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
 * Choisit une catégorie culturelle selon les proportions définies
 * 85% québécois, 5% africain, 5% latino, 5% arabe
 * @returns {string} - Nom de la catégorie
 */
function choisirCategorieCulturelle() {
    const random = Math.random() * 100;

    if (random < 85) return 'quebecois';
    if (random < 90) return 'africains';
    if (random < 95) return 'latino';
    return 'arabes';
}

/**
 * Génère un mapping d'anonymisation pour les étudiants
 * @returns {Object} - Mapping DA réel → pseudonyme
 */
function genererMappingAnonyme() {
    let mapping = JSON.parse(localStorage.getItem('mapping_anonymisation') || '{}');

    // Vérifier si le mapping existe ET utilise le nouveau format
    if (Object.keys(mapping).length > 0) {
        // Détecter l'ancien format (noms fictifs au lieu de "Élève X")
        const premierDA = Object.keys(mapping)[0];
        const premierMapping = mapping[premierDA];

        // Ancien format si: nom n'est pas vide OU prenom ne commence pas par "Élève" OU pas de propriété numero/ordreAffichage
        const estAncienFormat = premierMapping.nom ||
                               !premierMapping.prenom?.startsWith('Élève') ||
                               !premierMapping.hasOwnProperty('numero') ||
                               !premierMapping.hasOwnProperty('ordreAffichage');

        if (estAncienFormat) {
            console.log('🔄 Ancien format de mapping détecté, régénération avec format "Élève X"...');
            // Forcer la régénération
            mapping = {};
        } else {
            // Format correct, retourner tel quel
            return mapping;
        }
    }

    // Créer un nouveau mapping avec format "Élève X"
    // IMPORTANT : Lire DIRECTEMENT depuis localStorage pour éviter la récursion
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');

    // Filtrer pour exclure le groupe 9999 (simulation)
    const etudiantsReels = etudiants.filter(e => e.groupe !== '9999');

    // Créer un tableau de numéros et le mélanger (Fisher-Yates shuffle)
    // pour éviter de reconnaître les étudiants en début/fin de liste alphabétique
    const numeros = Array.from({ length: etudiantsReels.length }, (_, i) => i + 1);
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }

    // Créer aussi un ordre d'affichage aléatoire pour éviter de reconnaître par la position
    const ordresAffichage = Array.from({ length: etudiantsReels.length }, (_, i) => i);
    for (let i = ordresAffichage.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordresAffichage[i], ordresAffichage[j]] = [ordresAffichage[j], ordresAffichage[i]];
    }

    etudiantsReels.forEach((etudiant, index) => {
        // Utiliser un numéro aléatoire: "Élève 17", "Élève 3", etc.
        const numero = numeros[index];

        mapping[etudiant.da] = {
            nom: '',
            prenom: `Élève ${numero}`,
            nomComplet: `Élève ${numero}`,
            numero: numero,
            ordreAffichage: ordresAffichage[index]  // Pour trier aléatoirement
        };
    });

    localStorage.setItem('mapping_anonymisation', JSON.stringify(mapping));
    console.log(`✅ Mapping anonymisation créé avec ${etudiantsReels.length} étudiants (numéros aléatoires)`);
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
    // Déterminer la valeur par défaut selon le type de clé
    const clesSontObjets = ['presences', 'indicesAssiduiteDetailles', 'indicesCP', 'calendrierComplet'];
    const valeurParDefaut = clesSontObjets.includes(cle) ? '{}' : '[]';
    let donnees = JSON.parse(localStorage.getItem(cle) || valeurParDefaut);

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
 * Obtient l'option d'affichage du DA en mode anonymisation
 * @returns {boolean} - true pour afficher le DA réel, false pour "ANONYME"
 */
function obtenirOptionAffichageDA() {
    const option = localStorage.getItem('anonymisation_afficher_da_reel');
    return option === null ? true : option === 'true'; // Par défaut: true (DA réel)
}

/**
 * Définit l'option d'affichage du DA en mode anonymisation
 * @param {boolean} afficherDAReel - true pour DA réel, false pour "ANONYME"
 */
function definirOptionAffichageDA(afficherDAReel) {
    localStorage.setItem('anonymisation_afficher_da_reel', afficherDAReel.toString());
    console.log(`📝 Option DA anonymisation: ${afficherDAReel ? 'DA réel' : 'DA fictif (ANONYME)'}`);

    // Rafraîchir l'affichage si on est en mode anonymisation
    if (modeActuel === MODES.ANONYMISATION && typeof rafraichirContenuSelonMode === 'function') {
        rafraichirContenuSelonMode();
    }
}

/**
 * Réinitialise le mapping d'anonymisation (force regénération)
 * Utile quand la liste d'étudiants change
 */
function reinitialiserMappingAnonyme() {
    localStorage.removeItem('mapping_anonymisation');
    console.log('🔄 Mapping d\'anonymisation réinitialisé');
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
    const afficherDAReel = obtenirOptionAffichageDA();

    // Anonymiser selon le type de clé
    switch (cle) {
        case 'groupeEtudiants':
            // Anonymiser et ajouter l'ordre d'affichage
            const etudiantsAnonymes = donnees.map(etudiant => ({
                ...etudiant,
                // IMPORTANT: Garder le DA réel pour les calculs, créer daAffichage pour l'interface
                daReel: etudiant.da, // Toujours garder le vrai DA
                daAffichage: afficherDAReel ? etudiant.da : 'ANONYME', // Pour affichage seulement
                nom: mapping[etudiant.da]?.nom || '',
                prenom: mapping[etudiant.da]?.prenom || etudiant.prenom,
                groupe: etudiant.groupe ? `AN.${etudiant.groupe}` : etudiant.groupe,
                ordreAffichage: mapping[etudiant.da]?.ordreAffichage ?? 999 // Pour tri aléatoire
            }));

            // Trier selon l'ordre d'affichage aléatoire pour éviter de reconnaître par la position
            return etudiantsAnonymes.sort((a, b) => a.ordreAffichage - b.ordreAffichage);

        case 'evaluationsSauvegardees':
            return donnees.map(evaluation => {
                const nomAnonyme = mapping[evaluation.etudiantDA]?.nomComplet || evaluation.etudiantNom;
                return {
                    ...evaluation,
                    // IMPORTANT: Garder le DA réel pour les calculs
                    etudiantDAReel: evaluation.etudiantDA, // Toujours garder le vrai DA
                    etudiantDAffichage: afficherDAReel ? evaluation.etudiantDA : 'ANONYME',
                    etudiantNom: nomAnonyme,
                    groupe: evaluation.groupe ? `AN.${evaluation.groupe}` : evaluation.groupe
                };
            });

        case 'presences':
            // Les présences gardent le DA mais on peut anonymiser le nom si présent
            return donnees.map(presence => ({
                ...presence,
                // IMPORTANT: Garder le DA réel pour les calculs
                daReel: presence.da, // Toujours garder le vrai DA
                daAffichage: afficherDAReel ? presence.da : 'ANONYME',
                nom: mapping[presence.da]?.nom || '',
                prenom: mapping[presence.da]?.prenom || presence.prenom
            }));

        default:
            // Pour les autres types de données, retourner tel quel
            return donnees;
    }
}

/**
 * Obtient le DA à afficher pour un étudiant en mode anonymisation
 * @param {Object} etudiant - Objet étudiant avec propriétés da et daAffichage
 * @returns {string} - Le DA à afficher
 */
function obtenirDAAffichage(etudiant) {
    if (modeActuel !== MODES.ANONYMISATION) {
        return etudiant.da;
    }
    return etudiant.daAffichage || etudiant.da;
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
window.sauvegarderDonneesSelonMode = sauvegarderDonneesSelonMode;
window.anonymiserNom = anonymiserNom;
window.estModeeLectureSeule = estModeeLectureSeule;
window.obtenirOptionAffichageDA = obtenirOptionAffichageDA;
window.definirOptionAffichageDA = definirOptionAffichageDA;
window.reinitialiserMappingAnonyme = reinitialiserMappingAnonyme;
window.obtenirDAAffichage = obtenirDAAffichage;

// ============================================
// CLONAGE DE GROUPE (pour démonstrations)
// ============================================

/**
 * Récupère les étudiants du groupe source (Groupe 1 par défaut)
 * @param {string} groupeSource - Numéro du groupe source
 * @returns {Array} - Liste des étudiants du groupe source
 */
function obtenirEtudiantsGroupe1(groupeSource = '00001') {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    return etudiants.filter(e => e.groupe === groupeSource);
}

/**
 * Récupère les étudiants du groupe cloné (Groupe 9999)
 * @returns {Array} - Liste des étudiants clonés
 */
function obtenirEtudiantsGroupe9999() {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    return etudiants.filter(e => e.groupe === '9999');
}

/**
 * Génère un mapping aléatoire et crée les étudiants clonés
 * Crée N étudiants fictifs (Groupe 9999) basés sur les étudiants réels (Groupe 1)
 */
function genererMappingAleatoire() {
    console.log('🔄 Génération du mapping de clonage...');

    // 1. Récupérer les étudiants du groupe source
    const etudiantsSource = obtenirEtudiantsGroupe1();

    if (etudiantsSource.length === 0) {
        afficherNotificationErreur('Erreur', 'Aucun étudiant trouvé dans le Groupe 00001');
        return;
    }

    // 2. Supprimer les anciens clones s'ils existent
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    let tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    tousEtudiants = tousEtudiants.filter(e => e.groupe !== '9999');

    // 3. Créer le mapping et les nouveaux clones
    const mapping = {};
    const nomsUtilises = new Set();
    const clones = [];

    etudiantsSource.forEach((etudiantSource, index) => {
        // Choisir UNE catégorie culturelle pour cet étudiant cloné
        const categorie = choisirCategorieCulturelle();
        const listeCategorielle = NOMS_FICTIFS[categorie];

        let nom, prenom;
        let tentatives = 0;

        // Générer un nom unique dans cette catégorie
        do {
            nom = listeCategorielle.noms[Math.floor(Math.random() * listeCategorielle.noms.length)];
            prenom = listeCategorielle.prenoms[Math.floor(Math.random() * listeCategorielle.prenoms.length)];
            tentatives++;

            if (tentatives > 100) {
                console.warn(`Trop de tentatives pour ${etudiantSource.da}`);
                break;
            }
        } while (nomsUtilises.has(`${prenom} ${nom}`));

        nomsUtilises.add(`${prenom} ${nom}`);

        // Créer le DA fictif : 9999001, 9999002, etc.
        const daClone = `9999${String(index + 1).padStart(3, '0')}`;

        // Créer l'étudiant cloné
        const clone = {
            id: Date.now() + index,
            da: daClone,
            nom: nom,
            prenom: prenom,
            groupe: '9999',
            programmeCode: etudiantSource.programmeCode || '',
            programmeNom: etudiantSource.programmeNom || ''
        };

        clones.push(clone);

        // Enregistrer le mapping : DA source → DA clone
        mapping[etudiantSource.da] = {
            daClone: daClone,
            nomSource: `${etudiantSource.prenom} ${etudiantSource.nom}`,
            nomClone: `${prenom} ${nom}`,
            categorie: categorie
        };
    });

    // 4. Sauvegarder les étudiants clonés dans l'espace de simulation
    // IMPORTANT : Toujours sauvegarder dans simulation_etudiants pour éviter de mélanger avec les vrais étudiants
    // On sauvegarde SEULEMENT les clones (pas les originaux) dans simulation_etudiants
    localStorage.setItem('simulation_etudiants', JSON.stringify(clones));
    console.log(`📝 ${clones.length} étudiants clonés sauvegardés dans simulation_etudiants`);

    // 5. Sauvegarder le mapping
    localStorage.setItem('mapping_clonage', JSON.stringify(mapping));

    console.log(`✅ Mapping généré: ${clones.length} étudiants clonés`);
    afficherNotificationSucces(`${clones.length} étudiants clonés créés dans le Groupe 9999`);

    // 6. Mettre à jour l'affichage
    mettreAJourStatistiquesClonage();
    afficherTableauMapping();
}

/**
 * Synchronise les données (évaluations, présences, indices) du groupe source vers le groupe cloné
 */
function synchroniserDonnees() {
    console.log('🔄 Synchronisation des données...');

    const mapping = JSON.parse(localStorage.getItem('mapping_clonage') || '{}');

    if (Object.keys(mapping).length === 0) {
        afficherNotificationErreur('Erreur', 'Aucun mapping trouvé. Générez d\'abord le mapping.');
        return;
    }

    let compteurs = {
        evaluations: 0,
        presences: 0,
        indices: 0
    };

    // 1. CLONER LES ÉVALUATIONS
    // IMPORTANT : Lire DIRECTEMENT depuis les clés normales (groupe réel)
    // pour cloner vers le groupe 9999, puis sauvegarder selon le mode
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');

    // Supprimer les anciennes évaluations clonées
    const evaluationsNonClonees = evaluations.filter(e => e.groupe !== '9999');
    const nouvellesEvaluations = [];

    Object.keys(mapping).forEach(daSource => {
        const daClone = mapping[daSource].daClone;
        const nomClone = mapping[daSource].nomClone;

        // Trouver toutes les évaluations de l'étudiant source
        const evaluationsSource = evaluations.filter(e => e.etudiantDA === daSource);

        evaluationsSource.forEach(evalSource => {
            const evalClone = {
                ...evalSource,
                id: `EVAL_CLONE_${Date.now()}_${daClone}_${Math.random().toString(36).substr(2, 9)}`,
                etudiantDA: daClone,
                etudiantNom: nomClone,
                groupe: '9999'
            };

            nouvellesEvaluations.push(evalClone);
            compteurs.evaluations++;
        });
    });

    // Sauvegarder les évaluations clonées dans l'espace de simulation
    // IMPORTANT : Toujours sauvegarder dans simulation_evaluations
    localStorage.setItem('simulation_evaluations', JSON.stringify(nouvellesEvaluations));
    console.log(`📝 ${nouvellesEvaluations.length} évaluations clonées sauvegardées dans simulation_evaluations`);

    // 2. CLONER LES PRÉSENCES
    // IMPORTANT : Lire DIRECTEMENT depuis les clés normales (groupe réel)
    const presencesRaw = localStorage.getItem('presences');
    let presences = presencesRaw ? JSON.parse(presencesRaw) : [];
    let presencesClonees = []; // Tableau pour les présences clonées UNIQUEMENT

    // Cloner les présences pour le groupe 9999
    if (Array.isArray(presences)) {
        // Format tableau moderne
        Object.keys(mapping).forEach(daSource => {
            const daClone = mapping[daSource].daClone;

            // Cloner toutes les présences de l'étudiant source
            const presencesSource = presences.filter(p => p.da === daSource);
            presencesSource.forEach(p => {
                presencesClonees.push({
                    ...p,
                    da: daClone
                });
                compteurs.presences++;
            });
        });
    } else {
        // Format objet legacy - cloner pour le groupe 9999
        Object.keys(mapping).forEach(daSource => {
            const daClone = mapping[daSource].daClone;

            if (presences[daSource]) {
                Object.keys(presences[daSource]).forEach(date => {
                    presencesClonees.push({
                        da: daClone,
                        date: date,
                        heures: presences[daSource][date] === 'present' ? 2 : 0,
                        statut: presences[daSource][date]
                    });
                    compteurs.presences++;
                });
            }
        });
    }

    // Sauvegarder les présences clonées dans l'espace de simulation
    // IMPORTANT : Toujours sauvegarder dans simulation_presences
    localStorage.setItem('simulation_presences', JSON.stringify(presencesClonees));
    console.log(`📝 ${presencesClonees.length} présences clonées sauvegardées dans simulation_presences`);

    // 3. RECALCULER LES INDICES A, C, P
    console.log('📊 Recalcul des indices pour le groupe cloné...');

    // Sauvegarder le mode actuel et passer temporairement en mode simulation
    // pour que les indices soient sauvegardés dans les bonnes clés
    const modeOriginal = modeActuel;
    modeActuel = MODES.SIMULATION;

    // Recalculer les indices d'assiduité
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
        compteurs.indices++;
    }

    // Recalculer les indices de complétion et performance
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
        compteurs.indices++;
    }

    // Revenir au mode d'origine
    modeActuel = modeOriginal;

    console.log(`✅ Synchronisation terminée:`, compteurs);
    afficherNotificationSucces(
        `Données synchronisées: ${compteurs.evaluations} évaluations, ${compteurs.presences} historiques de présences`
    );

    // Mettre à jour l'affichage
    mettreAJourStatistiquesClonage();

    // Rafraîchir le tableau de bord si on est dans cette section
    if (typeof rafraichirContenuSelonMode === 'function') {
        rafraichirContenuSelonMode();
    }

    // Rafraîchir spécifiquement le tableau de bord si la fonction existe
    if (typeof initialiserModuleTableauBordApercu === 'function') {
        setTimeout(() => {
            initialiserModuleTableauBordApercu();
        }, 500);
    }
}

/**
 * Affiche le tableau de mapping dans l'interface
 */
function afficherTableauMapping() {
    const conteneur = document.getElementById('tableau-mapping-groupes');
    if (!conteneur) return;

    const mapping = JSON.parse(localStorage.getItem('mapping_clonage') || '{}');

    if (Object.keys(mapping).length === 0) {
        conteneur.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p>Aucun mapping disponible.</p>
                <p style="font-size: 0.9rem;">Cliquez sur "Générer mapping aléatoire" pour créer le Groupe 9999.</p>
            </div>
        `;
        return;
    }

    // Créer le tableau
    let html = `
        <table class="tableau" style="font-size: 0.9rem;">
            <thead>
                <tr>
                    <th>DA Source</th>
                    <th>Nom Source (Groupe 1)</th>
                    <th>→</th>
                    <th>DA Clone</th>
                    <th>Nom Clone (Groupe 9999)</th>
                    <th>Origine</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(mapping).forEach(daSource => {
        const info = mapping[daSource];

        // Icône selon l'origine culturelle
        let icone = '';
        switch(info.categorie) {
            case 'quebecois': icone = '🇨🇦'; break;
            case 'africains': icone = '🌍'; break;
            case 'latino': icone = '🌎'; break;
            case 'arabes': icone = '🌏'; break;
        }

        html += `
            <tr>
                <td><code>${daSource}</code></td>
                <td>${info.nomSource}</td>
                <td style="text-align: center; color: var(--bleu-principal); font-size: 1.2rem;">→</td>
                <td><code>${info.daClone}</code></td>
                <td><strong>${info.nomClone}</strong></td>
                <td style="text-align: center;">${icone}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    conteneur.innerHTML = html;
}

/**
 * Met à jour les statistiques de clonage affichées
 */
function mettreAJourStatistiquesClonage() {
    const statGroupe1 = document.getElementById('stat-groupe1');
    const statGroupe2 = document.getElementById('stat-groupe2');
    const statMappings = document.getElementById('stat-mappings');

    if (!statGroupe1 || !statGroupe2 || !statMappings) return;

    // Compter les étudiants
    const etudiantsGroupe1 = obtenirEtudiantsGroupe1();
    const etudiantsGroupe9999 = obtenirEtudiantsGroupe9999();
    const mapping = JSON.parse(localStorage.getItem('mapping_clonage') || '{}');

    statGroupe1.textContent = etudiantsGroupe1.length;
    statGroupe2.textContent = etudiantsGroupe9999.length;
    statMappings.textContent = Object.keys(mapping).length;
}

/**
 * Exporte le groupe fictif (Groupe 9999) avec toutes ses données
 * Crée un fichier JSON téléchargeable pour partage/formation
 */
function exporterGroupeFictif() {
    console.log('📦 Export du groupe fictif...');

    // Vérifier que le Groupe 9999 existe
    const etudiantsClones = obtenirEtudiantsGroupe9999();

    if (etudiantsClones.length === 0) {
        afficherNotificationErreur('Erreur', 'Aucun groupe fictif à exporter. Générez d\'abord le Groupe 9999.');
        return;
    }

    // Récupérer toutes les données du Groupe 9999
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluationsClones = evaluations.filter(e => e.groupe === '9999');

    const presences = obtenirDonneesSelonMode('presences');
    const presencesClones = {};
    etudiantsClones.forEach(etudiant => {
        if (presences[etudiant.da]) {
            presencesClones[etudiant.da] = presences[etudiant.da];
        }
    });

    // Récupérer les indices A, C, P
    const indicesAssiduiteDetailles = obtenirDonneesSelonMode('indicesAssiduiteDetailles');
    const indicesCP = obtenirDonneesSelonMode('indicesCP');

    const indicesClones = {
        assiduiteDetailles: {},
        indicesCP: {}
    };

    etudiantsClones.forEach(etudiant => {
        if (indicesAssiduiteDetailles[etudiant.da]) {
            indicesClones.assiduiteDetailles[etudiant.da] = indicesAssiduiteDetailles[etudiant.da];
        }
        if (indicesCP[etudiant.da]) {
            indicesClones.indicesCP[etudiant.da] = indicesCP[etudiant.da];
        }
    });

    // Récupérer le mapping
    const mapping = JSON.parse(localStorage.getItem('mapping_clonage') || '{}');

    // Construire l'objet d'export
    const exportData = {
        version: 'Beta 72',
        type: 'groupe-fictif',
        dateExport: new Date().toISOString(),
        groupe: '9999',
        description: 'Groupe de démonstration avec données réalistes',
        statistiques: {
            nbEtudiants: etudiantsClones.length,
            nbEvaluations: evaluationsClones.length,
            nbPresences: Object.keys(presencesClones).length
        },
        etudiants: etudiantsClones,
        evaluations: evaluationsClones,
        presences: presencesClones,
        indices: indicesClones,
        mapping: mapping
    };

    // Créer le fichier JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `groupe-fictif-9999_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Export terminé');
    afficherNotificationSucces(`Groupe 9999 exporté: ${etudiantsClones.length} étudiants, ${evaluationsClones.length} évaluations`);
}

/**
 * Importe un groupe fictif depuis un fichier JSON
 * Remplace le Groupe 9999 existant par les données importées
 */
function importerGroupeFictif() {
    console.log('📥 Import d\'un groupe fictif...');

    // Créer un input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                // Valider le format
                if (importData.type !== 'groupe-fictif') {
                    afficherNotificationErreur('Erreur', 'Format de fichier invalide. Ce n\'est pas un export de groupe fictif.');
                    return;
                }

                // Confirmer avec l'utilisateur
                if (!confirm(`Importer le groupe fictif ?\n\n${importData.statistiques.nbEtudiants} étudiants\n${importData.statistiques.nbEvaluations} évaluations\n\n⚠️ Cela remplacera le Groupe 9999 existant.`)) {
                    return;
                }

                // Supprimer l'ancien Groupe 9999
                // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
                let tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
                tousEtudiants = tousEtudiants.filter(e => e.groupe !== '9999');

                // Ajouter les nouveaux étudiants
                tousEtudiants = tousEtudiants.concat(importData.etudiants);
                sauvegarderDonneesSelonMode('groupeEtudiants', tousEtudiants);

                // Supprimer les anciennes évaluations du Groupe 9999
                let toutesEvaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
                toutesEvaluations = toutesEvaluations.filter(e => e.groupe !== '9999');

                // Ajouter les nouvelles évaluations
                toutesEvaluations = toutesEvaluations.concat(importData.evaluations);
                sauvegarderDonneesSelonMode('evaluationsSauvegardees', toutesEvaluations);

                // Importer les présences
                const presences = obtenirDonneesSelonMode('presences');
                Object.assign(presences, importData.presences);
                sauvegarderDonneesSelonMode('presences', presences);

                // Importer les indices
                // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
                if (importData.indices) {
                    // Indices d'assiduité
                    if (importData.indices.assiduiteDetailles) {
                        const indicesAssiduiteDetailles = obtenirDonneesSelonMode('indicesAssiduiteDetailles');
                        Object.assign(indicesAssiduiteDetailles, importData.indices.assiduiteDetailles);
                        sauvegarderDonneesSelonMode('indicesAssiduiteDetailles', indicesAssiduiteDetailles);
                    }

                    // Indices C et P
                    if (importData.indices.indicesCP) {
                        const indicesCP = obtenirDonneesSelonMode('indicesCP');
                        Object.assign(indicesCP, importData.indices.indicesCP);
                        sauvegarderDonneesSelonMode('indicesCP', indicesCP);
                    }
                }

                // Importer le mapping
                if (importData.mapping) {
                    localStorage.setItem('mapping_clonage', JSON.stringify(importData.mapping));
                }

                console.log('✅ Import terminé');
                afficherNotificationSucces(`Groupe fictif importé avec succès !\n${importData.statistiques.nbEtudiants} étudiants, ${importData.statistiques.nbEvaluations} évaluations`);

                // Mettre à jour l'affichage
                mettreAJourStatistiquesClonage();
                afficherTableauMapping();

                // Rafraîchir l'interface si on est dans une section concernée
                if (typeof rafraichirContenuSelonMode === 'function') {
                    rafraichirContenuSelonMode();
                }

            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                afficherNotificationErreur('Erreur', 'Impossible de lire le fichier. Format invalide.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

/**
 * Supprime complètement le Groupe 9999 et toutes ses données
 * Étudiants, évaluations, présences, indices et mapping
 */
function supprimerGroupeFictif() {
    console.log('🗑️ Demande de suppression du Groupe 9999...');

    // Vérifier s'il y a un groupe 9999
    const etudiantsGroupe9999 = obtenirEtudiantsGroupe9999();

    if (etudiantsGroupe9999.length === 0) {
        afficherNotificationErreur('Aucun groupe à supprimer', 'Le Groupe 9999 n\'existe pas.');
        return;
    }

    // Demander confirmation
    const confirmation = confirm(
        `⚠️ SUPPRESSION DU GROUPE 9999\n\n` +
        `Vous êtes sur le point de supprimer :\n` +
        `• ${etudiantsGroupe9999.length} étudiants fictifs\n` +
        `• Toutes leurs évaluations\n` +
        `• Toutes leurs présences\n` +
        `• Tous les indices calculés\n` +
        `• Le mapping de clonage\n\n` +
        `Cette action est IRRÉVERSIBLE.\n\n` +
        `Voulez-vous continuer ?`
    );

    if (!confirmation) {
        console.log('❌ Suppression annulée par l\'utilisateur');
        return;
    }

    try {
        // IMPORTANT : Supprimer des DEUX espaces de stockage (normal ET simulation)
        // pour éviter que le Groupe 9999 persiste dans un mode ou l'autre

        let nbEtudiantsSupprimes = 0;
        let nbEvaluationsSupprimes = 0;
        let nbPresencesSupprimes = 0;
        let nbIndicesASupprimes = 0;
        let nbIndicesCPSupprimes = 0;

        // 1. Supprimer les étudiants du Groupe 9999 (NORMAL + SIMULATION)
        // IMPORTANT : Les clés de simulation utilisent un mapping personnalisé
        ['groupeEtudiants', 'simulation_etudiants'].forEach(cle => {
            let tousEtudiants = JSON.parse(localStorage.getItem(cle) || '[]');
            const nbAvant = tousEtudiants.length;
            tousEtudiants = tousEtudiants.filter(e => e.groupe !== '9999');
            localStorage.setItem(cle, JSON.stringify(tousEtudiants));
            nbEtudiantsSupprimes += (nbAvant - tousEtudiants.length);
        });
        console.log(`   ✅ ${nbEtudiantsSupprimes} étudiants supprimés (tous modes)`);

        // 2. Supprimer les évaluations du Groupe 9999 (NORMAL + SIMULATION)
        ['evaluationsSauvegardees', 'simulation_evaluations'].forEach(cle => {
            let toutesEvaluations = JSON.parse(localStorage.getItem(cle) || '[]');
            const nbAvant = toutesEvaluations.length;
            toutesEvaluations = toutesEvaluations.filter(e => e.groupe !== '9999');
            localStorage.setItem(cle, JSON.stringify(toutesEvaluations));
            nbEvaluationsSupprimes += (nbAvant - toutesEvaluations.length);
        });
        console.log(`   ✅ ${nbEvaluationsSupprimes} évaluations supprimées (tous modes)`);

        // 3. Supprimer les présences des étudiants 9999xxx (NORMAL + SIMULATION)
        ['presences', 'simulation_presences'].forEach(cle => {
            let presences = JSON.parse(localStorage.getItem(cle) || '[]');

            if (Array.isArray(presences)) {
                const nbAvant = presences.length;
                presences = presences.filter(p => !p.da || !p.da.startsWith('9999'));
                nbPresencesSupprimes += (nbAvant - presences.length);
            } else {
                // Format objet legacy
                Object.keys(presences).forEach(da => {
                    if (da.startsWith('9999')) {
                        delete presences[da];
                        nbPresencesSupprimes++;
                    }
                });
            }
            localStorage.setItem(cle, JSON.stringify(presences));
        });
        console.log(`   ✅ ${nbPresencesSupprimes} entrées de présences supprimées (tous modes)`);

        // 4. Supprimer les indices d'assiduité du Groupe 9999 (NORMAL + SIMULATION)
        // 4a. indicesAssiduite (ancien format avec sommatif/alternatif)
        ['indicesAssiduite', 'simulation_indicesAssiduite'].forEach(cle => {
            let indicesAssiduite = JSON.parse(localStorage.getItem(cle) || '{}');

            if (indicesAssiduite.sommatif) {
                Object.keys(indicesAssiduite.sommatif).forEach(da => {
                    if (da.startsWith('9999')) {
                        delete indicesAssiduite.sommatif[da];
                        nbIndicesASupprimes++;
                    }
                });
            }
            if (indicesAssiduite.alternatif) {
                Object.keys(indicesAssiduite.alternatif).forEach(da => {
                    if (da.startsWith('9999')) {
                        delete indicesAssiduite.alternatif[da];
                    }
                });
            }
            localStorage.setItem(cle, JSON.stringify(indicesAssiduite));
        });

        // 4b. indicesAssiduiteDetailles (nouveau format détaillé)
        ['indicesAssiduiteDetailles', 'simulation_indicesAssiduiteDetailles'].forEach(cle => {
            let indicesAssiduiteDetailles = JSON.parse(localStorage.getItem(cle) || '{}');

            Object.keys(indicesAssiduiteDetailles).forEach(da => {
                if (da.startsWith('9999')) {
                    delete indicesAssiduiteDetailles[da];
                    nbIndicesASupprimes++;
                }
            });
            localStorage.setItem(cle, JSON.stringify(indicesAssiduiteDetailles));
        });
        console.log(`   ✅ ${nbIndicesASupprimes} indices A supprimés (tous modes)`);

        // 5. Supprimer les indices C et P du Groupe 9999 (NORMAL + SIMULATION)
        ['indicesCP', 'simulation_indicesCP'].forEach(cle => {
            let indicesCP = JSON.parse(localStorage.getItem(cle) || '{}');

            Object.keys(indicesCP).forEach(da => {
                if (da.startsWith('9999')) {
                    delete indicesCP[da];
                    nbIndicesCPSupprimes++;
                }
            });
            localStorage.setItem(cle, JSON.stringify(indicesCP));
        });
        console.log(`   ✅ ${nbIndicesCPSupprimes} indices C/P supprimés (tous modes)`);

        // 6. Supprimer les sélections de portfolio du Groupe 9999 (NORMAL + SIMULATION)
        let nbPortfoliosSupprimes = 0;
        ['portfoliosEleves', 'simulation_portfoliosEleves'].forEach(cle => {
            let portfoliosEleves = JSON.parse(localStorage.getItem(cle) || '{}');

            Object.keys(portfoliosEleves).forEach(da => {
                if (da.startsWith('9999')) {
                    delete portfoliosEleves[da];
                    nbPortfoliosSupprimes++;
                }
            });
            localStorage.setItem(cle, JSON.stringify(portfoliosEleves));
        });
        console.log(`   ✅ ${nbPortfoliosSupprimes} portfolios supprimés (tous modes)`);

        // 7. Supprimer le mapping de clonage
        localStorage.removeItem('mapping_clonage');
        console.log(`   ✅ Mapping de clonage supprimé`);

        // 8. Rafraîchir l'affichage
        console.log('🔄 Rafraîchissement de l\'interface...');

        if (typeof mettreAJourStatistiquesClonage === 'function') {
            mettreAJourStatistiquesClonage();
        }

        if (typeof afficherTableauMapping === 'function') {
            afficherTableauMapping();
        }

        if (typeof rafraichirContenuSelonMode === 'function') {
            rafraichirContenuSelonMode();
        }

        console.log('✅ Groupe 9999 supprimé avec succès');
        afficherNotificationSucces(
            'Groupe supprimé',
            `${nbEtudiantsSupprimes} étudiants, ${nbEvaluationsSupprimes} évaluations et toutes les données associées ont été supprimées.`
        );

    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        afficherNotificationErreur(
            'Erreur de suppression',
            'Une erreur est survenue lors de la suppression du groupe. Consultez la console pour plus de détails.'
        );
    }
}

// ============================================
// GÉNÉRATION ALÉATOIRE DE GROUPE FICTIF
// ============================================

/**
 * Génère une note réaliste basée sur une distribution normale
 * Moyenne: 75%, Écart-type: 10%
 * @returns {number} - Note entre 50 et 100
 */
function genererNoteRealiste() {
    // Distribution normale avec Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Note avec moyenne 75% et écart-type 10%
    const note = 75 + z * 10;

    // Limiter entre 50 et 100
    return Math.max(50, Math.min(100, Math.round(note)));
}

/**
 * Liste des programmes disponibles avec leurs codes
 * @returns {Object} - Objet {code: nom}
 */
function obtenirProgrammesDisponibles() {
    return {
        '200.B0': 'Sciences de la nature',
        '200.B1': 'Sciences de la nature',
        '300.M0': 'Sciences humaines',
        '300.M1': 'Sciences humaines avec mathématiques',
        '500.AE': 'Arts, lettres et communication – Multidisciplinaire',
        '500.AL': 'Arts, lettres et communication – Langues',
        '420.B0': 'Techniques de l\'informatique',
        '410.B0': 'Techniques de comptabilité et de gestion',
        '410.D0': 'Gestion de commerces',
        '180.A0': 'Soins Infirmiers',
        '351.A1': 'Techniques d\'éducation spécialisée',
        '322.A1': 'Techniques d\'éducation à l\'enfance',
        '510.A0': 'Arts visuels',
        '501.A0': 'Musique',
        '081.06': 'Tremplin DEC'
    };
}

/**
 * Sélectionne un programme aléatoire
 * @returns {Object} - {code, nom}
 */
function genererProgrammeAleatoire() {
    const programmes = obtenirProgrammesDisponibles();
    const codes = Object.keys(programmes);
    const codeChoisi = codes[Math.floor(Math.random() * codes.length)];

    return {
        code: codeChoisi,
        nom: programmes[codeChoisi]
    };
}

/**
 * Génère une évaluation réaliste avec scores SRPNF cohérents
 * @param {string} etudiantDA - DA de l'étudiant
 * @param {string} etudiantNom - Nom complet de l'étudiant
 * @param {Object} production - Objet production
 * @param {Object} grille - Objet grille d'évaluation
 * @returns {Object} - Évaluation complète
 */
function genererEvaluationRealiste(etudiantDA, etudiantNom, production, grille) {
    const noteGlobale = genererNoteRealiste();

    // Générer des notes SRPNF cohérentes avec la note globale
    // Structure (15%), Rigueur (20%), Plausibilité (10%), Nuance (25%), Français (30%)
    const criteres = [];

    if (grille && grille.criteres) {
        grille.criteres.forEach(critere => {
            // Variation autour de la note globale (±5%)
            const variation = (Math.random() - 0.5) * 10;
            const noteCritere = Math.max(50, Math.min(100, noteGlobale + variation));

            // Convertir en niveau IDME
            let niveau = 'I';
            if (noteCritere >= 85) niveau = 'E';
            else if (noteCritere >= 75) niveau = 'M';
            else if (noteCritere >= 65) niveau = 'D';

            criteres.push({
                critereId: critere.id,
                critereNom: critere.nom,
                niveauSelectionne: niveau,
                retroaction: '',
                ponderation: critere.ponderation || 0
            });
        });
    }

    // Convertir note globale en niveau IDME
    let niveauFinal = 'I';
    if (noteGlobale >= 85) niveauFinal = 'E';
    else if (noteGlobale >= 75) niveauFinal = 'M';
    else if (noteGlobale >= 65) niveauFinal = 'D';

    const maintenant = new Date();

    return {
        id: `EVAL_FICTIF_${Date.now()}_${etudiantDA}_${Math.random().toString(36).substr(2, 9)}`,
        etudiantDA: etudiantDA,
        etudiantNom: etudiantNom,
        groupe: '9999',
        productionId: production.id,
        productionNom: production.titre || production.nom,
        grilleId: grille.id,
        grilleNom: grille.nom,
        echelleId: 'echelle-idme',
        cartoucheId: '',
        dateEvaluation: maintenant.toISOString(),
        heureEvaluation: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        statutRemise: 'À temps',
        criteres: criteres,
        noteFinale: noteGlobale,
        niveauFinal: niveauFinal,
        retroactionFinale: '',
        optionsAffichage: {
            description: true,
            objectif: true,
            tache: true,
            adresse: false,
            contexte: false
        },
        verrouillee: true
    };
}

/**
 * Génère un groupe fictif aléatoire complet (Groupe 9999)
 * Avec étudiants, évaluations, présences et indices réalistes
 */
function genererGroupeFictifAleatoire() {
    console.log('🎲 Génération d\'un groupe fictif aléatoire...');

    // 1. Récupérer le nombre d'étudiants souhaité
    const inputNbEtudiants = document.getElementById('input-nb-etudiants');
    const nbEtudiants = inputNbEtudiants ? parseInt(inputNbEtudiants.value, 10) : 10;

    // Valider le nombre
    if (nbEtudiants < 5 || nbEtudiants > 50) {
        afficherNotificationErreur('Erreur', 'Le nombre d\'étudiants doit être entre 5 et 50.');
        return;
    }

    // 2. Récupérer les grilles et productions existantes
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

    if (grilles.length === 0) {
        afficherNotificationErreur('Erreur', 'Aucune grille d\'évaluation trouvée. Créez d\'abord des grilles.');
        return;
    }

    if (productions.length === 0) {
        afficherNotificationErreur('Erreur', 'Aucune production trouvée. Créez d\'abord des productions.');
        return;
    }

    // 3. Supprimer l'ancien Groupe 9999 s'il existe
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    let tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    tousEtudiants = tousEtudiants.filter(e => e.groupe !== '9999');

    let toutesEvaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    toutesEvaluations = toutesEvaluations.filter(e => e.groupe !== '9999');

    let presences = obtenirDonneesSelonMode('presences');
    // Gérer les deux formats possibles (objet legacy ou tableau)
    if (Array.isArray(presences)) {
        presences = presences.filter(p => !p.da || !p.da.startsWith('9999'));
    } else {
        // Format objet legacy - convertir en tableau puis filtrer
        const presencesArray = [];
        Object.keys(presences).forEach(da => {
            if (!da.startsWith('9999') && presences[da]) {
                Object.keys(presences[da]).forEach(date => {
                    presencesArray.push({
                        da: da,
                        date: date,
                        heures: presences[da][date] === 'present' ? 2 : 0,
                        statut: presences[da][date]
                    });
                });
            }
        });
        presences = presencesArray;
    }

    // 4. Générer les nouveaux étudiants fictifs
    const nomsUtilises = new Set();
    const etudiantsFictifs = [];
    const nouvellesEvaluations = [];
    const nouvellesPresences = [];

    for (let i = 0; i < nbEtudiants; i++) {
        // Choisir une catégorie culturelle
        const categorie = choisirCategorieCulturelle();
        const listeCategorielle = NOMS_FICTIFS[categorie];

        // Générer un nom unique
        let nom, prenom;
        let tentatives = 0;
        do {
            nom = listeCategorielle.noms[Math.floor(Math.random() * listeCategorielle.noms.length)];
            prenom = listeCategorielle.prenoms[Math.floor(Math.random() * listeCategorielle.prenoms.length)];
            tentatives++;

            if (tentatives > 100) {
                console.warn(`Impossible de générer un nom unique pour l'étudiant ${i + 1}`);
                break;
            }
        } while (nomsUtilises.has(`${prenom} ${nom}`));

        nomsUtilises.add(`${prenom} ${nom}`);

        // Générer un programme aléatoire
        const programme = genererProgrammeAleatoire();

        // Créer le DA fictif
        const daFictif = `9999${String(i + 1).padStart(3, '0')}`;

        // Créer l'étudiant
        const etudiant = {
            id: Date.now() + i,
            da: daFictif,
            nom: nom,
            prenom: prenom,
            groupe: '9999',
            programmeCode: programme.code,
            programmeNom: programme.nom
        };

        etudiantsFictifs.push(etudiant);

        // 5. Générer des évaluations réalistes pour cet étudiant
        // Choisir 3 à 6 productions aléatoires
        const nbEvaluations = 3 + Math.floor(Math.random() * 4); // Entre 3 et 6
        const productionsChoisies = [];

        for (let j = 0; j < Math.min(nbEvaluations, productions.length); j++) {
            let production;
            do {
                production = productions[Math.floor(Math.random() * productions.length)];
            } while (productionsChoisies.includes(production.id));

            productionsChoisies.push(production.id);

            // Trouver une grille compatible
            const grille = grilles[Math.floor(Math.random() * grilles.length)];

            // Créer l'évaluation réaliste
            const evaluation = genererEvaluationRealiste(
                daFictif,
                `${prenom} ${nom}`,
                production,
                grille
            );

            nouvellesEvaluations.push(evaluation);
        }

        // 6. Générer des présences réalistes (75-95% de présence)
        const tauxPresence = 0.75 + Math.random() * 0.20; // Entre 75% et 95%
        const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
        const datesCours = Object.keys(calendrier).filter(date => {
            const jour = calendrier[date];
            return jour.typeSemaine === 'cours' && new Date(date) <= new Date();
        });

        // Générer les présences au format tableau attendu par saisie-presences.js
        datesCours.forEach(date => {
            const estPresent = Math.random() < tauxPresence;
            nouvellesPresences.push({
                da: daFictif,
                date: date,
                heures: estPresent ? 2 : 0,
                statut: estPresent ? 'present' : 'absent'
            });
        });
    }

    // 7. Sauvegarder toutes les données
    // IMPORTANT : Utiliser sauvegarderDonneesSelonMode pour respecter le mode actuel
    tousEtudiants = tousEtudiants.concat(etudiantsFictifs);
    sauvegarderDonneesSelonMode('groupeEtudiants', tousEtudiants);

    toutesEvaluations = toutesEvaluations.concat(nouvellesEvaluations);
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', toutesEvaluations);

    const toutesPresences = presences.concat(nouvellesPresences);
    sauvegarderDonneesSelonMode('presences', toutesPresences);

    // 8. Recalculer les indices A, C, P
    console.log('📊 Recalcul des indices pour le groupe fictif...');

    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    }

    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    console.log(`✅ Groupe fictif généré: ${nbEtudiants} étudiants, ${nouvellesEvaluations.length} évaluations`);
    afficherNotificationSucces(
        `Groupe fictif créé avec succès`,
        `${nbEtudiants} étudiants fictifs avec ${nouvellesEvaluations.length} évaluations réalistes`
    );

    // 9. Mettre à jour l'affichage
    mettreAJourStatistiquesClonage();
}

// ============================================
// FILTRAGE DES ÉTUDIANTS PAR MODE
// ============================================

/**
 * Filtre la liste des étudiants selon le mode actuel
 * - Mode Normal : affiche seulement les groupes réels (exclut 9999)
 * - Mode Simulé : affiche seulement le Groupe 9999
 * - Mode Anonymisé : affiche les groupes réels (exclut 9999) avec noms anonymisés
 *
 * @param {Array} etudiants - Liste complète des étudiants
 * @returns {Array} - Liste filtrée selon le mode
 */
function filtrerEtudiantsParMode(etudiants) {
    if (!etudiants || !Array.isArray(etudiants)) {
        return [];
    }

    // Lire directement la variable modeActuel (pas un appel de fonction)
    const mode = modeActuel;

    switch(mode) {
        case 'simulation':
            // Mode Simulé : afficher SEULEMENT le Groupe 9999
            return etudiants.filter(e => e.groupe === '9999');

        case 'normal':
        case 'anonymisation':
            // Mode Normal et Anonymisé : exclure le Groupe 9999
            return etudiants.filter(e => e.groupe !== '9999');

        default:
            // Par défaut, exclure le Groupe 9999
            return etudiants.filter(e => e.groupe !== '9999');
    }
}

// Exporter les fonctions
window.genererMappingAleatoire = genererMappingAleatoire;
window.synchroniserDonnees = synchroniserDonnees;
window.afficherTableauMapping = afficherTableauMapping;
window.mettreAJourStatistiquesClonage = mettreAJourStatistiquesClonage;
window.obtenirEtudiantsGroupe1 = obtenirEtudiantsGroupe1;
window.exporterGroupeFictif = exporterGroupeFictif;
window.importerGroupeFictif = importerGroupeFictif;
window.supprimerGroupeFictif = supprimerGroupeFictif;
window.genererGroupeFictifAleatoire = genererGroupeFictifAleatoire;
window.filtrerEtudiantsParMode = filtrerEtudiantsParMode;

// ============================================
// INITIALISATION AUTOMATIQUE
// ============================================

/**
 * Initialisation immédiate du système de modes
 * S'exécute dès que modes.js est chargé (AVANT tous les autres modules)
 */
console.log('🎭 Chargement de modes.js...');

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎭 DOM prêt, initialisation du système de modes...');
        initialiserSystemeModes();
    });
} else {
    // DOM déjà prêt
    console.log('🎭 DOM déjà prêt, initialisation immédiate du système de modes...');
    initialiserSystemeModes();
}

