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
        couleur: '#1a5266', // Teal/sarcelle
        nom: 'Mode Assisté',
        icone: '😎'
    },
    anonymisation: {
        couleur: '#0f1e3a', // Bleu très foncé
        nom: 'Mode Anonymisation',
        icone: ''
    }
};

// ============================================
// ÉTAT GLOBAL
// ============================================

let modeActuel = db.getSync('modeApplication', MODES.NORMAL);

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le système de modes
 */
function initialiserSystemeModes() {
    console.log('🎭 Initialisation du système de modes...');

    // Récupérer le mode sauvegardé
    modeActuel = db.getSync('modeApplication', MODES.NORMAL);

    // Appliquer le thème
    appliquerTheme(modeActuel);

    // Créer le sélecteur de mode
    creerSelecteurMode();

    // Afficher/masquer le bouton Assistance Primo selon le mode
    gererAffichageBoutonPrimo(modeActuel);

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
        'simulation': 'Assisté',
        'anonymisation': 'Anonymisé'
    };

    // Ordre souhaité : Normal → Assisté → Anonymisé
    // Note: Anonymisé en dernier pour éviter activation accidentelle
    const ordreAffichage = [
        MODES.NORMAL,
        MODES.SIMULATION,
        MODES.ANONYMISATION
    ];

    ordreAffichage.forEach(mode => {
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
async function changerMode(nouveauMode) {
    if (nouveauMode === modeActuel) return;

    console.log(`🔄 Changement de mode: ${modeActuel} → ${nouveauMode}`);

    // Sauvegarder le nouveau mode
    modeActuel = nouveauMode;
    db.setSync('modeApplication', nouveauMode);

    // Appliquer le thème
    appliquerTheme(nouveauMode);

    // Mettre à jour le sélecteur de mode
    creerSelecteurMode();

    // Afficher/masquer le bouton Assistance Primo selon le mode
    gererAffichageBoutonPrimo(nouveauMode);

    // ✅ NOUVEAU (9 décembre 2025) : Gérer les données demo selon le mode
    if (typeof chargerDonneesDemo === 'function' && typeof dechargerDonneesDemo === 'function') {
        if (nouveauMode === 'simulation') {  // ✅ CORRIGÉ : 'simulation' pas 'assiste'
            // Charger les données demo en mode Assisté
            console.log('   → Chargement données demo (mode Assisté)...');
            await chargerDonneesDemo();
        } else {
            // Décharger les données demo en mode Normal/Anonymisé
            console.log('   → Déchargement données demo...');
            await dechargerDonneesDemo();
        }
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
            'reglages-trimestre': 'initialiserTrimestreV2',  // 🆕 FIX (20 jan 2026): Rafraîchir section Trimestre
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

                // 🔧 FIX (23 jan 2026): Utiliser obtenirEtudiantsCoursActif() pour cohérence
                // avec afficherProfilComplet() qui utilise aussi ce filtre par coursId
                const etudiantsTries = typeof obtenirEtudiantsCoursActif === 'function'
                    ? obtenirEtudiantsCoursActif()
                    : (typeof filtrerEtudiantsParMode === 'function'
                        ? filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants'))
                        : obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.groupe !== '9999'));

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

    // ✅ NOUVEAU (9 décembre 2025) : Ajouter classe pour compatibilité CSS Primo
    // Retirer toutes les classes de mode
    document.body.classList.remove('mode-normal', 'mode-assiste', 'mode-anonymise');

    // Ajouter la classe appropriée
    if (mode === MODES.SIMULATION) {
        document.body.classList.add('mode-assiste');
    } else if (mode === MODES.ANONYMISATION) {
        document.body.classList.add('mode-anonymise');
    } else {
        document.body.classList.add('mode-normal');
    }

    const couleur = THEMES[mode].couleur;

    // Ajouter un bandeau si pas en mode normal
    let bandeau = document.getElementById('bandeau-mode');
    if (bandeau) bandeau.remove();

    if (mode !== MODES.NORMAL) {
        bandeau = document.createElement('div');
        bandeau.id = 'bandeau-mode';

        // Texte du bandeau
        let texte = `${THEMES[mode].icone} ${THEMES[mode].nom.toUpperCase()} - Les identités affichées ${mode === MODES.SIMULATION ? 'sont réelles' : 'sont anonymisées'}`;

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
    let mapping = db.getSync('mapping_anonymisation', {});

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
    // IMPORTANT : Lire DIRECTEMENT depuis storage pour éviter la récursion avec obtenirDonneesSelonMode
    // ✅ NAMESPACING (Beta 95.5) : Utiliser cle() pour le namespacing par trimestre
    const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
    const etudiants = db.getSync(cleEtudiants, []);

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

    db.setSync('mapping_anonymisation', mapping);
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

/**
 * Anonymise le texte d'une rétroaction en remplaçant les prénoms réels par les prénoms anonymisés
 * ✅ NOUVEAU (30 déc 2025) - Corrige le bug d'affichage des vrais prénoms en mode Anonymisé
 *
 * @param {string} texte - Le texte de la rétroaction
 * @param {string} daEtudiant - Le DA de l'étudiant concerné (pour obtenir le prénom anonymisé)
 * @returns {string} - Le texte anonymisé (ou original si pas en mode anonymisation)
 */
function anonymiserTexteRetroaction(texte, daEtudiant) {
    // Si pas en mode anonymisation, retourner le texte tel quel
    if (modeActuel !== MODES.ANONYMISATION) {
        return texte;
    }

    if (!texte) return texte;

    // Lire les étudiants DIRECTEMENT (pas via obtenirDonneesSelonMode pour éviter récursion)
    // ✅ NAMESPACING (Beta 95.5) : Utiliser cle() pour le namespacing par trimestre
    const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
    const etudiants = db.getSync(cleEtudiants, []);
    const mapping = genererMappingAnonyme();

    let texteAnonyme = texte;

    // Remplacer tous les prénoms réels par "Élève X"
    etudiants.forEach(etudiant => {
        if (etudiant.prenom && mapping[etudiant.da]) {
            const prenomReel = etudiant.prenom;
            const prenomAnonyme = mapping[etudiant.da].prenom || 'Élève';

            // Remplacer "Bonjour Prénom" par "Bonjour Élève X"
            const regexBonjour = new RegExp(`Bonjour ${prenomReel}`, 'gi');
            texteAnonyme = texteAnonyme.replace(regexBonjour, `Bonjour ${prenomAnonyme}`);

            // Remplacer le prénom seul suivi d'espace ou ponctuation (pour éviter les faux positifs)
            // Par exemple "Marie, tu as bien travaillé" → "Élève 5, tu as bien travaillé"
            const regexPrenom = new RegExp(`\\b${prenomReel}\\b`, 'g');
            texteAnonyme = texteAnonyme.replace(regexPrenom, prenomAnonyme);
        }
    });

    // Si un DA spécifique est fourni et qu'on veut s'assurer que ce prénom est anonymisé
    if (daEtudiant && mapping[daEtudiant]) {
        const etudiant = etudiants.find(e => e.da === daEtudiant);
        if (etudiant && etudiant.prenom) {
            const regexPrenom = new RegExp(`\\b${etudiant.prenom}\\b`, 'g');
            texteAnonyme = texteAnonyme.replace(regexPrenom, mapping[daEtudiant].prenom || 'Élève');
        }
    }

    return texteAnonyme;
}

// Exposer la fonction globalement
window.anonymiserTexteRetroaction = anonymiserTexteRetroaction;

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
    console.log(`🔍 [obtenirDonneesSelonMode] cle="${cle}", modeActuel="${modeActuel}", mode="${mode}"`);

    // ===================================
    // MODE ASSISTÉ et NORMAL : Données réelles partagées
    // ===================================
    // Depuis Beta 92, le mode Assisté utilise les mêmes données réelles que Normal
    // (Primo aide l'utilisateur avec ses vraies données, pas des données simulées)

    // Déterminer la valeur par défaut selon le type de clé
    // IMPORTANT: 'presences' est un TABLEAU, pas un objet (utilisé avec .forEach dans profil-etudiant.js)
    const clesSontObjets = ['indicesAssiduiteDetailles', 'indicesCP', 'indicesAssiduite', 'calendrierComplet', 'snapshots'];
    const valeurParDefaut = clesSontObjets.includes(cle) ? {} : [];

    // Utiliser cle() pour le namespacing par trimestre (si disponible)
    const cleEffective = (typeof window.cle === 'function') ? window.cle(cle) : cle;
    let donnees = db.getSync(cleEffective, valeurParDefaut);

    // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025)
    // Filtrer par coursId pour les données liées au cours actif uniquement
    // Ceci corrige le bug de contamination entre cours/trimestres
    // 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
    const clesAvecCoursId = ['groupeEtudiants', 'productions', 'presences', 'evaluationsSauvegardees'];
    if (clesAvecCoursId.includes(cle) && Array.isArray(donnees)) {
        const coursActif = db.getSync('infoCours', null);
        if (coursActif && coursActif.id) {
            const totalAvant = donnees.length;
            // 🆕 BETA 95.3 : Mode cours = tous les groupes fusionnés
            const estModeCours = coursActif._modeCours || coursActif.groupe === null;

            donnees = donnees.filter(item => {
                // Compatibilité : ancien format sans coursId
                if (!item.coursId) {
                    // Pour étudiants : vérifier groupe (sauf en mode cours)
                    if (cle === 'groupeEtudiants') {
                        // En mode cours, accepter tous les étudiants (pas de filtre groupe)
                        if (estModeCours) {
                            return true;
                        }
                        const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
                        // ✅ CORRECTION (9 jan 2026) : Normaliser les groupes avant comparaison
                        // "1" et "00001" doivent être considérés comme égaux
                        const normaliserGroupe = (g) => String(g || '').padStart(5, '0');
                        return normaliserGroupe(item.groupe) === normaliserGroupe(groupeCours);
                    }
                    // Pour autres données sans coursId : les inclure (migration progressive)
                    return true;
                }
                return item.coursId === coursActif.id;
            });
            if (donnees.length !== totalAvant) {
                const modeLabel = estModeCours ? 'tous groupes' : `groupe ${coursActif.groupe}`;
                console.log(`📋 [coursId] Filtré ${cle}: ${donnees.length}/${totalAvant} pour cours ${coursActif.id} (${modeLabel})`);
            }
        }
    }

    // Si mode anonymisation, anonymiser selon le type de données
    if (mode === MODES.ANONYMISATION) {
        console.log(`🎭 [ANONYMISATION] Mode actif, anonymisation de "${cle}"...`);
        donnees = anonymiserDonnees(cle, donnees);
        console.log(`🎭 [ANONYMISATION] ${cle} anonymisé:`, Array.isArray(donnees) ? `${donnees.length} éléments` : 'objet');
    }

    return donnees;
}

/**
 * Sauvegarde des données selon le mode actif
 * FONCTION CENTRALE - À utiliser partout où on fait db.setSync()
 *
 * @param {string} cle - Clé de base (ex: 'groupeEtudiants')
 * @param {*} donnees - Données à sauvegarder
 * @returns {boolean|string} - true si succès, false si bloqué (mode anonymisation), 'quota' si quota dépassé
 */
function sauvegarderDonneesSelonMode(cle, donnees) {
    const mode = modeActuel;

    // MODE ANONYMISATION : Bloquer toute écriture
    if (mode === MODES.ANONYMISATION) {
        console.warn('⚠️ Écriture bloquée en mode anonymisation');
        return false;
    }

    // MODE ASSISTÉ et NORMAL : Sauvegarder dans les mêmes clés réelles
    // Depuis Beta 92, le mode Assisté partage les données avec Normal
    try {
        // Utiliser cle() pour le namespacing par trimestre (si disponible)
        const cleEffective = (typeof window.cle === 'function') ? window.cle(cle) : cle;
        db.setSync(cleEffective, donnees);
        console.log(`[${mode === MODES.SIMULATION ? 'Assisté' : 'Normal'}] Sauvegarde dans ${cleEffective}`);
        return true;
    } catch (error) {
        // Détecter erreur de quota dépassé
        if (error.name === 'QuotaExceededError' ||
            (error.message && error.message.includes('quota'))) {
            console.error('❌ Quota de stockage dépassé:', error);
            return 'quota';
        }
        // Autre erreur
        console.error(`❌ Erreur sauvegarde ${cle}:`, error);
        return 'error';
    }
}

/**
 * Obtient l'option d'affichage du DA en mode anonymisation
 * @returns {boolean} - true pour afficher le DA réel, false pour "ANONYME"
 */
function obtenirOptionAffichageDA() {
    const option = db.getSync('anonymisation_afficher_da_reel', null);
    // ✅ CORRECTION (29 déc 2025) : Par défaut false (masquer DA) au lieu de true
    // En mode anonymisation, les DA doivent être masqués par défaut
    return option === null ? false : option === 'true' || option === true;
}

/**
 * Définit l'option d'affichage du DA en mode anonymisation
 * @param {boolean} afficherDAReel - true pour DA réel, false pour "ANONYME"
 */
function definirOptionAffichageDA(afficherDAReel) {
    db.setSync('anonymisation_afficher_da_reel', afficherDAReel);
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
    db.removeSync('mapping_anonymisation');
    db.removeSync('mapping_groupes_anonymes'); // 🆕 BETA 96.1: Aussi réinitialiser le mapping des groupes
    console.log('🔄 Mapping d\'anonymisation réinitialisé');
}

/**
 * Anonymise un numéro de groupe en le convertissant en lettre
 * @param {string} groupe - Numéro de groupe (ex: "00001", "00002")
 * @returns {string} - Groupe anonymisé avec lettre (ex: "Gr. A", "Gr. B")
 */
function anonymiserGroupe(groupe) {
    if (!groupe) return groupe;

    // Récupérer ou créer le mapping des groupes
    let mappingGroupes = db.getSync('mapping_groupes_anonymes', null);

    if (!mappingGroupes) {
        // Créer le mapping en collectant tous les groupes uniques
        // Utiliser window.cle pour le namespacing par trimestre
        const cleNamespacee = (typeof window.cle === 'function') ? window.cle('groupeEtudiants') : 'groupeEtudiants';
        const etudiants = db.getSync(cleNamespacee, []);
        const groupesUniques = [...new Set(etudiants.map(e => e.groupe).filter(Boolean))].sort();

        mappingGroupes = {};
        groupesUniques.forEach((g, index) => {
            // Convertir index en lettre (0 → A, 1 → B, etc.)
            const lettre = String.fromCharCode(65 + (index % 26));
            mappingGroupes[g] = `Gr. ${lettre}`;
        });

        db.setSync('mapping_groupes_anonymes', mappingGroupes);
        console.log('🎭 Mapping groupes anonymes créé:', mappingGroupes);
    }

    return mappingGroupes[groupe] || `Gr. ?`;
}

/**
 * Anonymise les données selon leur type
 * @param {string} cle - Type de données (groupeEtudiants, evaluationsSauvegardees, etc.)
 * @param {Array|Object} donnees - Données à anonymiser
 * @returns {Array|Object} - Données anonymisées
 */
function anonymiserDonnees(cle, donnees) {
    console.log(`🎭 [anonymiserDonnees] Appelé pour clé: "${cle}", type:`, Array.isArray(donnees) ? 'tableau' : typeof donnees);

    if (!Array.isArray(donnees)) {
        console.log(`🎭 [anonymiserDonnees] Pas un tableau, retour sans modification`);
        return donnees; // Si ce n'est pas un tableau, retourner tel quel
    }

    const mapping = genererMappingAnonyme();
    const afficherDAReel = obtenirOptionAffichageDA();
    console.log(`🎭 [anonymiserDonnees] Mapping généré:`, Object.keys(mapping).length, 'étudiants, afficherDAReel:', afficherDAReel);

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
                groupeReel: etudiant.groupe, // 🆕 Garder le groupe réel pour le filtrage par cours
                groupe: etudiant.groupe ? anonymiserGroupe(etudiant.groupe) : etudiant.groupe,
                ordreAffichage: mapping[etudiant.da]?.ordreAffichage ?? 999 // Pour tri aléatoire
            }));

            // Trier selon l'ordre d'affichage aléatoire pour éviter de reconnaître par la position
            const etudiantsTries = etudiantsAnonymes.sort((a, b) => a.ordreAffichage - b.ordreAffichage);
            console.log(`🎭 [anonymiserDonnees] Étudiants anonymisés:`, etudiantsTries.length, 'étudiants. Exemple:', etudiantsTries[0] ? {da: etudiantsTries[0].daAffichage, nom: etudiantsTries[0].nom, prenom: etudiantsTries[0].prenom} : 'aucun');
            return etudiantsTries;

        case 'evaluationsSauvegardees':
            return donnees.map(evaluation => {
                const nomAnonyme = mapping[evaluation.etudiantDA]?.nomComplet || evaluation.etudiantNom;
                return {
                    ...evaluation,
                    // IMPORTANT: Garder le DA réel pour les calculs
                    etudiantDAReel: evaluation.etudiantDA, // Toujours garder le vrai DA
                    etudiantDAffichage: afficherDAReel ? evaluation.etudiantDA : 'ANONYME',
                    etudiantNom: nomAnonyme,
                    groupe: evaluation.groupe ? anonymiserGroupe(evaluation.groupe) : evaluation.groupe
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
// GESTION BOUTON ASSISTANCE PRIMO
// ============================================

/**
 * Gère l'affichage des boutons d'en-tête et de la section Aide selon le mode actif
 * @param {string} mode - Le mode actif
 */
function gererAffichageBoutonPrimo(mode) {
    // Bouton Assistance Primo (visible en mode Assisté)
    const boutonPrimo = document.getElementById('btn-assistance-primo');
    if (boutonPrimo) {
        boutonPrimo.style.display = (mode === MODES.SIMULATION) ? 'inline-block' : 'none';
    }

    // Boutons Soutenir/Feedback (visibles en mode Normal uniquement)
    const boutonSoutenir = document.getElementById('btn-soutenir-projet');
    const boutonFeedback = document.getElementById('btn-feedback');

    if (boutonSoutenir) {
        boutonSoutenir.style.display = (mode === MODES.NORMAL) ? 'inline-block' : 'none';
    }

    if (boutonFeedback) {
        boutonFeedback.style.display = (mode === MODES.NORMAL) ? 'inline-block' : 'none';
    }

    // Section Aide dans la navigation (visible en mode Assisté)
    const boutonAide = document.getElementById('btn-section-aide');
    if (boutonAide) {
        if (mode === MODES.SIMULATION) {
            // Mode Assisté : section Aide visible
            boutonAide.style.display = 'inline-block';
        } else {
            // Modes Normal et Anonymisé : section Aide masquée
            boutonAide.style.display = 'none';

            // Si on est sur la section Aide, rediriger vers Tableau de bord
            if (typeof sectionActive !== 'undefined' && sectionActive === 'aide') {
                if (typeof afficherSection === 'function') {
                    afficherSection('tableau-bord');
                }
            }
        }
    }
}

// ============================================
// EXPORT
// ============================================

/**
 * Vérifie si on est en mode Assisté
 * @returns {boolean} true si mode Assisté actif
 */
function estModeAssiste() {
    return modeActuel === MODES.SIMULATION; // 'simulation' = mode Assisté
}

// Alias pour compatibilité (à migrer progressivement)
function estModeGuide() {
    return estModeAssiste();
}

window.MODES = MODES;
window.initialiserSystemeModes = initialiserSystemeModes;
window.changerMode = changerMode;
window.estModeAssiste = estModeAssiste;
window.estModeGuide = estModeGuide; // Alias compatibilité
window.obtenirDonneesSelonMode = obtenirDonneesSelonMode;
window.sauvegarderDonneesSelonMode = sauvegarderDonneesSelonMode;
window.anonymiserNom = anonymiserNom;
window.anonymiserGroupe = anonymiserGroupe;
window.estModeeLectureSeule = estModeeLectureSeule;
window.obtenirOptionAffichageDA = obtenirOptionAffichageDA;
window.definirOptionAffichageDA = definirOptionAffichageDA;
window.reinitialiserMappingAnonyme = reinitialiserMappingAnonyme;
window.obtenirDAAffichage = obtenirDAAffichage;


// ============================================
// FILTRAGE DES ÉTUDIANTS PAR MODE
// ============================================

/**
 * Filtre la liste des étudiants selon le mode actuel
 * - Mode Normal : affiche seulement les groupes réels (exclut 9999)
 * - Mode Assisté : affiche seulement le Groupe 9999 (données de démo/exploration)
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

    // Groupes de démonstration (9999 legacy + demo nouveau)
    const GROUPES_DEMO = ['9999', 'demo'];
    const estGroupeDemo = (groupe) => GROUPES_DEMO.includes(groupe);

    switch(mode) {
        case 'simulation':
            // Mode Assisté : afficher SEULEMENT les groupes démo
            return etudiants.filter(e => estGroupeDemo(e.groupe));

        case 'normal':
        case 'anonymisation':
            // Mode Normal et Anonymisé : exclure les groupes démo
            return etudiants.filter(e => !estGroupeDemo(e.groupe));

        default:
            // Par défaut, exclure les groupes démo
            return etudiants.filter(e => !estGroupeDemo(e.groupe));
    }
}

// Exporter les fonctions
window.filtrerEtudiantsParMode = filtrerEtudiantsParMode;

// ============================================
// FILTRAGE DES ÉTUDIANTS PAR COURS/TRIMESTRE ACTIF
// ============================================

/**
 * Obtient les étudiants du cours actif uniquement
 * Filtre par coursId pour éviter la contamination entre trimestres
 * 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
 *
 * @returns {Array} - Liste des étudiants du cours actif (vide si aucun cours)
 */
function obtenirEtudiantsCoursActif() {
    // Obtenir le cours actif
    const coursActif = typeof db !== 'undefined' && db.getSync
        ? db.getSync('infoCours', null)
        : JSON.parse(localStorage.getItem('infoCours') || 'null');

    // Si aucun cours actif, retourner tableau vide
    if (!coursActif || !coursActif.id) {
        console.log('[Modes] Aucun cours actif - liste étudiants vide');
        return [];
    }

    // Obtenir tous les étudiants
    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // 🆕 BETA 95.3 : Mode cours = tous les groupes fusionnés
    const estModeCours = coursActif._modeCours || coursActif.groupe === null;

    // DEBUG (11 jan 2026)
    console.log('[Modes] DEBUG infoCours:', {
        id: coursActif.id,
        groupe: coursActif.groupe,
        _modeCours: coursActif._modeCours,
        estModeCours
    });

    // Filtrer par coursId (et optionnellement par groupe)
    const etudiantsFiltres = tousEtudiants.filter(e => {
        // 🆕 CORRECTION (23 jan 2026) : Utiliser groupeReel si disponible (mode anonymisation)
        const groupeEtudiant = e.groupeReel || e.groupe;

        // Compatibilité : si l'étudiant n'a pas de coursId, vérifier le groupe
        if (!e.coursId) {
            // Ancien format : vérifier si le groupe correspond au cours actif
            // En mode cours, accepter tous les étudiants (pas de filtre groupe)
            if (estModeCours) {
                return true; // Inclure tous les étudiants du trimestre
            }
            const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
            // ✅ CORRECTION (9 jan 2026) : Normaliser les groupes avant comparaison
            const normaliserGroupe = (g) => String(g || '').padStart(5, '0');
            return normaliserGroupe(groupeEtudiant) === normaliserGroupe(groupeCours);
        }

        // Nouveau format avec coursId
        if (e.coursId !== coursActif.id) {
            return false; // Pas le bon cours
        }

        // Si mode cours (tous groupes), retourner tous les étudiants du cours
        if (estModeCours) {
            return true;
        }

        // Sinon, filtrer aussi par groupe
        const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
        if (!groupeCours) return true; // Pas de groupe spécifié = tous
        const normaliserGroupe = (g) => String(g || '').padStart(5, '0');
        return normaliserGroupe(groupeEtudiant) === normaliserGroupe(groupeCours);
    });

    const modeLabel = estModeCours ? 'tous groupes' : `groupe ${coursActif.groupe}`;
    console.log(`[Modes] Étudiants cours actif (${coursActif.id}, ${modeLabel}): ${etudiantsFiltres.length}/${tousEtudiants.length}`);

    // DEBUG (11 jan 2026) : Afficher les groupes distincts des étudiants
    const groupesDistincts = [...new Set(tousEtudiants.map(e => e.groupe))];
    console.log('[Modes] DEBUG groupes étudiants:', groupesDistincts);

    // Appliquer le filtrage par mode (exclure groupe 9999 en mode normal)
    return filtrerEtudiantsParMode(etudiantsFiltres);
}

/**
 * Vérifie si un étudiant appartient au cours/trimestre actif
 *
 * @param {Object} etudiant - L'étudiant à vérifier
 * @returns {boolean} - true si l'étudiant est dans le cours actif
 */
function etudiantDansCoursActif(etudiant) {
    if (!etudiant) return false;

    const coursActif = typeof db !== 'undefined' && db.getSync
        ? db.getSync('infoCours', null)
        : JSON.parse(localStorage.getItem('infoCours') || 'null');

    if (!coursActif || !coursActif.id) return false;

    // Vérifier coursId
    if (etudiant.coursId) {
        return etudiant.coursId === coursActif.id;
    }

    // Compatibilité ancien format : vérifier groupe
    // 🆕 CORRECTION (23 jan 2026) : Utiliser groupeReel si disponible (mode anonymisation)
    const groupeEtudiant = etudiant.groupeReel || etudiant.groupe;
    const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
    return groupeEtudiant === groupeCours;
}

/**
 * 🆕 BETA 95.5 : Obtient la pratique de notation active du groupe-cours
 * Retourne l'ID de la pratique (ex: "sommative", "pan-standards")
 *
 * @returns {string|null} - ID de la pratique active ou null si non définie
 */
function obtenirPratiqueActiveGroupeCours() {
    // 1. Essayer depuis groupeCoursActif (source principale)
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.pratiqueId) {
        console.log('[Modes] Pratique active depuis groupeCoursActif:', gcActif.pratiqueId);
        return gcActif.pratiqueId;
    }

    // 2. Essayer depuis infoCours (rétrocompatibilité)
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.pratiqueId) {
        console.log('[Modes] Pratique active depuis infoCours:', infoCours.pratiqueId);
        return infoCours.pratiqueId;
    }

    // 3. Essayer depuis le groupe-cours complet dans groupesCours
    if (gcActif && gcActif.id) {
        const cleGC = typeof cle === 'function' ? cle('groupesCours') : 'groupesCours';
        const groupesCours = db.getSync(cleGC, []);
        const gc = groupesCours.find(g => g.id === gcActif.id);
        if (gc && gc.pratiqueId) {
            console.log('[Modes] Pratique active depuis groupesCours:', gc.pratiqueId);
            return gc.pratiqueId;
        }
    }

    // 4. Fallback : lire depuis modalitesEvaluation (ancienne méthode)
    const modalites = db.getSync('modalitesEvaluation', {});
    if (modalites.pratiqueNotation) {
        console.log('[Modes] Pratique active depuis modalitesEvaluation:', modalites.pratiqueNotation);
        return modalites.pratiqueNotation;
    }

    // 5. Défaut : sommative
    console.warn('[Modes] Aucune pratique définie, utilisation par défaut: sommative');
    return 'sommative';
}

// Exporter les nouvelles fonctions
window.obtenirEtudiantsCoursActif = obtenirEtudiantsCoursActif;
window.etudiantDansCoursActif = etudiantDansCoursActif;
window.obtenirPratiqueActiveGroupeCours = obtenirPratiqueActiveGroupeCours;

// ============================================
// INITIALISATION AUTOMATIQUE
// ============================================

/**
 * Initialisation immédiate du système de modes
 * S'exécute dès que modes.js est chargé (AVANT tous les autres modules)
 */
console.log('🎭 Chargement de modes.js VERSION 2025-11-17 08:42...');

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

