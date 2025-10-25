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
    
    // Code du cours et trimestre
    if (coursActif) {
        setStatText('stat-code-cours', coursActif.codeCours || '—');
        const trimestre = `${coursActif.session || ''}${coursActif.annee || ''}`;
        setStatText('stat-trimestre', trimestre || '—');
    } else {
        setStatText('stat-code-cours', '—');
        setStatText('stat-trimestre', '—');
    }
    
    // Calendrier
    const cadreCalendrier = JSON.parse(localStorage.getItem('cadreCalendrier') || 'null');
    if (cadreCalendrier && cadreCalendrier.dateDebut && cadreCalendrier.dateFin) {
        const debut = cadreCalendrier.dateDebut;
        const fin = cadreCalendrier.dateFin;
        
        let nbSemaines = cadreCalendrier.nombreSemaines;
        if (!nbSemaines) {
            const dateDebut = new Date(debut);
            const dateFin = new Date(fin);
            const diffJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));
            nbSemaines = Math.ceil(diffJours / 7);
        }
        
        setStatText('stat-calendrier', `${debut} → ${fin} (${nbSemaines} sem.)`);
    } else {
        setStatText('stat-calendrier', '—');
    }
    
    // Horaire
    const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    if (seancesHoraire.length > 0) {
        const horaireTexte = seancesHoraire.map(s => {
            return `${s.jour} ${s.debut}-${s.fin}`;
        }).join(' · ');
        setStatText('stat-horaire', horaireTexte);
    } else if (coursActif && coursActif.formatHoraire) {
        setStatText('stat-horaire', coursActif.formatHoraire);
    } else {
        setStatText('stat-horaire', '—');
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
    
    setStatText('stat-pratique', pratique);
    
    // Productions
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
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
    // Version
    setStatText('stat-version', 'Beta 0.60');
    
    // Dernière MAJ
    const maintenant = new Date();
    const dateFormattee = maintenant.toLocaleDateString('fr-CA') + ' ' +
        maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    setStatText('stat-derniere-maj', dateFormattee);
    
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
 * - listeGrilles
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