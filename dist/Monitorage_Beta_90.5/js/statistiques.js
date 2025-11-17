/* ===============================
   MODULE: STATISTIQUES - APERÇU DES RÉGLAGES
   Adapté de index 35-M5
   =============================== */

/**
 * MODULE: statistiques.js
 * 
 * RÔLE:
 * Affiche les statistiques de configuration du système
 * dans la sous-section Réglages → Aperçu
 * 
 * FONCTIONNALITÉS:
 * - Informations du cours actif
 * - Matériel pédagogique configuré
 * - Statistiques système
 * 
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 * Fonction chargerStatistiquesApercu()
 */

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de statistiques
 * Charge les statistiques si on est sur la sous-section aperçu
 * 
 * APPELÉE PAR:
 * - main.js au chargement de la page
 */
function initialiserModuleStatistiques() {
    console.log('Module statistiques initialisé');
    
    // Charger les statistiques si la sous-section aperçu est affichée
    const apercu = document.getElementById('reglages-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerStatistiquesApercu();
    }
}

/* ===============================
   📈 FONCTION PRINCIPALE
   =============================== */

/**
 * Charge et affiche toutes les statistiques dans Réglages → Aperçu
 * 
 * APPELÉE PAR:
 * - initialiserModuleStatistiques()
 * - Changement vers sous-section aperçu
 * - Bouton de rafraîchissement (si présent)
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les données depuis localStorage
 * 2. Calcule les statistiques
 * 3. Met à jour les éléments HTML
 */
function chargerStatistiquesApercu() {
    console.log('Chargement des statistiques...');
    
    // === INFORMATIONS DU COURS ===
    chargerInfosCours();
    
    // === MATÉRIEL CONFIGURÉ ===
    chargerMaterielConfigure();
    
    // === SYSTÈME ===
    chargerInfosSysteme();
    
    console.log('✓ Statistiques chargées');
}

/* ===============================
   📚 INFORMATIONS DU COURS
   =============================== */

/**
 * Charge les informations du cours actif
 */
function chargerInfosCours() {
    const listeCours = JSON.parse(localStorage.getItem('listeCours') || '[]');
    const coursActif = listeCours.find(c => c.actif) || listeCours[0] || null;

    // Nombre de cours configurés
    setStatText('stat-nb-cours', listeCours.length || '0');

    // Trimestre du cours actif
    if (coursActif) {
        const trimestre = `${coursActif.session || ''}${coursActif.annee || ''}`;
        setStatText('stat-trimestre', trimestre || '—');
    } else {
        setStatText('stat-trimestre', '—');
    }
    
    // Nombre de groupes
    setStatText('stat-nb-groupes', listeCours.length > 0 ? '1' : '—');
    
    // Nombre d'élèves
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    setStatText('stat-nb-eleves', etudiants.length || '0');
}

/* ===============================
   MATÉRIEL CONFIGURÉ
   =============================== */

/**
 * Charge les informations sur le matériel pédagogique configuré
 */
function chargerMaterielConfigure() {
    // Pratique de notation
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    let pratique = 'Non configurée';
    
    if (modalites.pratique === 'sommative') {
        pratique = 'Sommative (%)';
    } else if (modalites.pratique === 'alternative' && modalites.typePAN) {
        const types = {
            'maitrise': 'PAN - Maîtrise',
            'specifications': 'PAN - Spécifications',
            'denotation': 'PAN - Dénotation'
        };
        pratique = types[modalites.typePAN] || 'PAN';
    } else if (modalites.pratique === 'alternative') {
        pratique = 'Alternative (à préciser)';
    }

    // setStatText('stat-pratique', pratique); // RETIRÉ : Carte "Pratique de notation" supprimée de l'aperçu matériel

    // Productions
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    setStatText('stat-productions', productions.length);
    
    // Grilles de critères
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    setStatText('stat-grilles', grilles.length);
    
    // Échelles de performance
    const echellesConfig = JSON.parse(localStorage.getItem('configEchelle') || 'null');
    const niveauxEchelle = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');
    const nbEchelles = (echellesConfig || niveauxEchelle.length > 0) ? '1' : '0';
    setStatText('stat-echelles', nbEchelles);
    
    // Cartouches de rétroaction - compter TOUTES les cartouches
    let totalCartouches = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle && cle.startsWith('cartouches_')) {
            const cartouches = JSON.parse(localStorage.getItem(cle) || '[]');
            totalCartouches += cartouches.length;
        }
    }
    setStatText('stat-cartouches', totalCartouches);
}

/* ===============================
   INFORMATIONS SYSTÈME
   =============================== */

/**
 * Charge les informations système
 */
function chargerInfosSysteme() {
    // Version et date - Lues automatiquement depuis l'élément .meta dans l'en-tête
    // Format attendu: "Beta 90 par Grégoire Bédard (5 novembre 2025)"
    const metaElement = document.querySelector('.meta');
    let versionBeta = 'β —';
    let dateBeta = '—';

    if (metaElement) {
        const texte = metaElement.textContent;

        // Extraire le numéro de beta (ex: "Beta 90" → "90")
        const matchBeta = texte.match(/Beta\s+(\d+)/i);
        if (matchBeta) {
            versionBeta = `β ${matchBeta[1]}`;
        }

        // Extraire la date (ex: "(5 novembre 2025)" → "5 nov. 2025")
        const matchDate = texte.match(/\((\d+)\s+(\w+)\s+(\d{4})\)/);
        if (matchDate) {
            const jour = matchDate[1];
            const mois = matchDate[2];
            const annee = matchDate[3];

            // Abréger le mois
            const moisAbreges = {
                'janvier': 'jan.', 'février': 'fév.', 'mars': 'mars', 'avril': 'avr.',
                'mai': 'mai', 'juin': 'juin', 'juillet': 'juil.', 'août': 'août',
                'septembre': 'sept.', 'octobre': 'oct.', 'novembre': 'nov.', 'décembre': 'déc.'
            };
            const moisAbrege = moisAbreges[mois.toLowerCase()] || mois;
            dateBeta = `${jour} ${moisAbrege} ${annee}`;
        }
    }

    // Version (β = lettre grecque beta)
    setStatText('stat-version', versionBeta);

    // Poids des données
    let poidsTotal = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const valeur = localStorage.getItem(cle);
        poidsTotal += (cle.length + valeur.length) * 2; // UTF-16 = 2 bytes par caractère
    }

    const poidsKo = (poidsTotal / 1024).toFixed(2);
    const poidsMo = (poidsTotal / (1024 * 1024)).toFixed(2);
    const affichagePoids = poidsTotal < 1024 * 1024 ? `${poidsKo} Ko` : `${poidsMo} Mo`;
    setStatText('stat-poids', affichagePoids);

    // Date de création de la beta
    setStatText('stat-beta-date', dateBeta);
}

/* ===============================
   FONCTION UTILITAIRE
   =============================== */

/**
 * Met à jour le texte d'un élément de statistique
 * 
 * @param {string} id - ID de l'élément HTML
 * @param {string|number} valeur - Valeur à afficher
 */
function setStatText(id, valeur) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = valeur;
    } else {
        console.warn(`⚠️ Élément ${id} non trouvé`);
    }
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js (variables globales - optionnel)
 * - styles.css (classes carte, grille-statistiques)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module peut être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ (lecture seule):
 * - listeCours
 * - cadreCalendrier
 * - seancesHoraire
 * - groupeEtudiants
 * - modalitesEvaluation
 * - productions
 * - grillesTemplates
 * - configEchelle
 * - niveauxEchelle
 * - cartouches_* (toutes)
 * 
 * HTML REQUIS:
 * Éléments avec IDs dans la sous-section reglages-apercu:
 * - stat-code-cours
 * - stat-trimestre
 * - stat-calendrier
 * - stat-horaire
 * - stat-nb-groupes
 * - stat-nb-eleves
 * - stat-pratique
 * - stat-productions
 * - stat-grilles
 * - stat-echelles
 * - stat-cartouches
 * - stat-version
 * - stat-derniere-maj
 * - stat-poids
 * 
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 * Fonction chargerStatistiquesApercu() conservée à l'identique
 */