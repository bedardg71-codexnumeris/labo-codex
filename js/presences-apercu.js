/* ===============================
   MODULE: PRÉSENCES - APERÇU
   Affichage des statistiques globales de présence du groupe
   =============================== */

/**
 * Initialise le module d'aperçu des présences
 * Appelée par main.js au chargement
 */
function initialiserModulePresencesApercu() {
    console.log('📊 Module Présences - Aperçu initialisé');
}

/**
 * Charge et affiche les statistiques d'aperçu des présences
 * Appelée automatiquement lors de l'affichage de la sous-section
 */
function chargerApercuPresences() {
    console.log('🔄 Chargement de l\'aperçu des présences...');

    try {
        // Récupérer les étudiants actifs
        // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiantsActifs = etudiants.filter(e =>
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );

        // Récupérer les indices d'assiduité calculés
        const indicesAssiduite = obtenirDonneesSelonMode('indicesAssiduite');

        // Récupérer les présences brutes
        const presences = obtenirDonneesSelonMode('presences');

        // Calculer les statistiques
        calculerStatistiquesPresences(etudiantsActifs, indicesAssiduite, presences);

        // Charger les informations du cours (nb cours, groupes, élèves)
        // depuis le module statistiques.js
        if (typeof chargerInfosCours === 'function') {
            chargerInfosCours();
        }

        console.log('✅ Aperçu des présences chargé');
    } catch (error) {
        console.error('❌ Erreur chargement aperçu présences:', error);
    }
}

/**
 * Calcule et affiche les statistiques de présences
 *
 * @param {Array} etudiants - Liste des étudiants actifs
 * @param {Object} indicesAssiduite - Indices calculés {sommatif: {}, alternatif: {}}
 * @param {Array} presences - Présences brutes
 */
function calculerStatistiquesPresences(etudiants, indicesAssiduite, presences) {
    const nbTotal = etudiants.length;

    if (nbTotal === 0) {
        afficherMessageVide();
        return;
    }

    // Déterminer la pratique active
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;
    const modeComparatif = afficherSom && afficherPan;

    // TAUX D'ASSIDUITÉ MOYEN DU GROUPE
    // En mode comparatif, afficher la moyenne des deux pratiques
    // Sinon, afficher la pratique active
    let totalTaux = 0;
    let nbAvecDonnees = 0;

    etudiants.forEach(e => {
        let tauxEtudiant = 0;

        if (modeComparatif) {
            // Moyenne des deux pratiques
            const tauxSOM = indicesAssiduite.sommatif?.[e.da] || 0;
            const tauxPAN = indicesAssiduite.alternatif?.[e.da] || 0;
            tauxEtudiant = (tauxSOM + tauxPAN) / 2;
        } else if (afficherSom) {
            tauxEtudiant = indicesAssiduite.sommatif?.[e.da] || 0;
        } else if (afficherPan) {
            tauxEtudiant = indicesAssiduite.alternatif?.[e.da] || 0;
        }

        if (tauxEtudiant > 0) {
            nbAvecDonnees++;
        }

        totalTaux += tauxEtudiant;
    });

    const tauxMoyen = nbAvecDonnees > 0 ? Math.round((totalTaux / nbTotal) * 100) : 0;
    setStatText('pa-taux-moyen', `${tauxMoyen}%`);

    // SÉANCES DONNÉES (format X / Total)
    const seancesCompletees = calculerSeancesCompletees(presences);
    const totalSeances = calculerTotalSeances();
    setStatText('pa-seances-donnees', `${seancesCompletees} / ${totalSeances}`);

    // PROCHAINE SÉANCE
    const prochaineSeance = calculerProchaineSeance();
    setStatText('pa-prochaine-seance', prochaineSeance);
}

/**
 * Calcule le nombre d'heures offertes depuis le calendrier
 * @returns {number} Heures offertes
 */
function calculerHeuresOffertes() {
    try {
        const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
        let heuresOffertes = 0;

        Object.values(calendrier).forEach(jour => {
            if (jour.estJourCours && !jour.estConge) {
                heuresOffertes += jour.heuresCours || 0;
            }
        });

        return heuresOffertes;
    } catch (error) {
        console.warn('⚠️ Erreur calcul heures offertes:', error);
        return 0;
    }
}

/**
 * Calcule le total d'heures manquées (toutes absences)
 * @param {Array} presences - Liste des présences
 * @param {Array} etudiants - Liste des étudiants
 * @returns {number} Heures manquées
 */
function calculerHeuresManquees(presences, etudiants) {
    let heuresManquees = 0;

    presences.forEach(p => {
        if (p.statut === 'absent' || p.statut === 'retard') {
            heuresManquees += p.heuresManquees || 0;
        }
    });

    return Math.round(heuresManquees);
}

/**
 * Calcule le nombre de séances avec présences saisies
 * @param {Array} presences - Liste des présences
 * @returns {number} Nombre de séances
 */
function calculerSeancesCompletees(presences) {
    const datesUniques = new Set();

    presences.forEach(p => {
        if (p.date) {
            datesUniques.add(p.date);
        }
    });

    return datesUniques.size;
}

/**
 * Calcule le nombre total de séances prévues
 * @returns {number} Total de séances
 */
function calculerTotalSeances() {
    try {
        const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
        const semainesUniques = new Set();

        Object.values(calendrier).forEach(jour => {
            // Compter les semaines uniques avec cours ou reprises
            if ((jour.statut === 'cours' || jour.statut === 'reprise') && jour.numeroSemaine) {
                semainesUniques.add(jour.numeroSemaine);
            }
        });

        // Retourner le nombre de semaines × 2 (2 séances par semaine)
        return semainesUniques.size * 2;
    } catch (error) {
        console.warn('⚠️ Erreur calcul total séances:', error);
        return 0;
    }
}

/**
 * Calcule le nombre d'absences non justifiées
 * @param {Array} presences - Liste des présences
 * @returns {number} Nombre d'absences non justifiées
 */
function calculerAbsencesNonJustifiees(presences) {
    let absencesNonJustifiees = 0;

    presences.forEach(p => {
        if (p.statut === 'absent' && (!p.justifie || p.justifie === false) && (!p.facultatif || p.facultatif === false)) {
            absencesNonJustifiees++;
        }
    });

    return absencesNonJustifiees;
}

/**
 * Calcule le nombre d'absences motivées (RàI)
 * Les absences motivées sont marquées avec le flag facultatif: true
 * @param {Array} presences - Liste des présences
 * @returns {number} Nombre d'absences motivées
 */
function calculerAbsencesMotivees(presences) {
    let absencesMotivees = 0;

    presences.forEach(p => {
        if (p.statut === 'absent' && p.facultatif === true) {
            absencesMotivees++;
        }
    });

    return absencesMotivees;
}

/**
 * Calcule la date de la prochaine séance à partir du calendrier
 * @returns {string} Date formatée ou message si aucune séance
 */
function calculerProchaineSeance() {
    try {
        const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
        const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

        // Obtenir la liste des jours de la semaine où il y a cours (ex: ["Lundi", "Mercredi"])
        const joursCours = seancesHoraire.map(seance => seance.jour);

        // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
        const aujourdhui = new Date();
        const dateAujourdhui = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Trouver la prochaine date de cours
        // Doit avoir statut "cours" ou "reprise" ET correspondre à un jour de cours dans l'horaire
        const prochaineSeance = Object.entries(calendrier)
            .filter(([dateStr, jour]) => {
                const estDateFuture = dateStr > dateAujourdhui;
                const estJourCours = (jour.statut === 'cours' || jour.statut === 'reprise');

                // Pour les reprises, vérifier le jour remplacé (ex: cours du lundi → vendredi)
                // Pour les cours normaux, vérifier le jour de la semaine
                const jourAVerifier = (jour.statut === 'reprise' && jour.jourRemplace)
                    ? jour.jourRemplace
                    : jour.jourSemaine;
                const estDansHoraire = joursCours.includes(jourAVerifier);

                return estDateFuture && estJourCours && estDansHoraire;
            })
            .sort((a, b) => a[0].localeCompare(b[0]))[0];

        if (!prochaineSeance) {
            return 'Aucune';
        }

        // Extraire les infos de la prochaine séance
        const [prochaineDateStr, infosJour] = prochaineSeance;
        const [annee, mois, jour] = prochaineDateStr.split('-');
        const moisAbrege = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
                            'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][parseInt(mois) - 1];

        // Récupérer et abréger le jour de la semaine
        const jourSemaine = infosJour.jourSemaine || '';
        const joursAbreges = {
            'Lundi': 'lun.',
            'Mardi': 'mar.',
            'Mercredi': 'mer.',
            'Jeudi': 'jeu.',
            'Vendredi': 'ven.',
            'Samedi': 'sam.',
            'Dimanche': 'dim.'
        };
        const jourAbrege = joursAbreges[jourSemaine] || jourSemaine;

        return `${jourAbrege} ${parseInt(jour)} ${moisAbrege}`;

    } catch (error) {
        console.warn('⚠️ Erreur calcul prochaine séance:', error);
        return '—';
    }
}

/**
 * Affiche un message si aucune donnée disponible
 */
function afficherMessageVide() {
    setStatText('pa-taux-moyen', '—');
    setStatText('pa-seances-donnees', '—');
    setStatText('pa-prochaine-seance', '—');
}

/**
 * Met à jour le texte d'un élément HTML
 * @param {string} id - ID de l'élément
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
