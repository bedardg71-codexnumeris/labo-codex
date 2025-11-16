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

    // TAUX MOYENS (SOM et PAN)
    let totalSOM = 0;
    let totalPAN = 0;
    let nbAvecDonnees = 0;

    etudiants.forEach(e => {
        const tauxSOM = indicesAssiduite.sommatif?.[e.da] || 0;
        const tauxPAN = indicesAssiduite.alternatif?.[e.da] || 0;

        if (tauxSOM > 0 || tauxPAN > 0) {
            nbAvecDonnees++;
        }

        totalSOM += tauxSOM;
        totalPAN += tauxPAN;
    });

    const tauxMoyenSOM = nbAvecDonnees > 0 ? Math.round((totalSOM / nbTotal) * 100) : 0;
    const tauxMoyenPAN = nbAvecDonnees > 0 ? Math.round((totalPAN / nbTotal) * 100) : 0;

    setStatText('pa-taux-som', `${tauxMoyenSOM}%`);
    setStatText('pa-taux-pan', `${tauxMoyenPAN}%`);

    // HEURES OFFERTES (calculer depuis le calendrier)
    const heuresOffertes = calculerHeuresOffertes();
    setStatText('pa-heures-offertes', `${heuresOffertes}h`);

    // HEURES MANQUÉES (total pour tous les étudiants)
    const heuresManquees = calculerHeuresManquees(presences, etudiants);
    setStatText('pa-heures-manquees', `${heuresManquees}h`);

    // SÉANCES COMPLÉTÉES (nombre de dates différentes avec présences)
    const seancesCompletees = calculerSeancesCompletees(presences);
    const totalSeances = calculerTotalSeances();
    setStatText('pa-seances-completees', `${seancesCompletees} / ${totalSeances}`);

    // ABSENCES NON JUSTIFIÉES
    const absencesNonJustifiees = calculerAbsencesNonJustifiees(presences);
    setStatText('pa-absences-non-justifiees', absencesNonJustifiees);

    // ALERTES ASSIDUITÉ
    let alerte80 = 0;
    let alerte70 = 0;

    etudiants.forEach(e => {
        const tauxSOM = (indicesAssiduite.sommatif?.[e.da] || 0) * 100;

        if (tauxSOM < 80 && tauxSOM >= 70) {
            alerte80++;
        } else if (tauxSOM < 70) {
            alerte70++;
        }
    });

    setStatText('pa-alerte-80', alerte80);
    setStatText('pa-alerte-70', alerte70);
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
        let totalSeances = 0;

        Object.values(calendrier).forEach(jour => {
            if (jour.estJourCours && !jour.estConge) {
                totalSeances++;
            }
        });

        return totalSeances;
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
        if (p.statut === 'absent' && (!p.justifie || p.justifie === false)) {
            absencesNonJustifiees++;
        }
    });

    return absencesNonJustifiees;
}

/**
 * Affiche un message si aucune donnée disponible
 */
function afficherMessageVide() {
    setStatText('pa-taux-som', '—');
    setStatText('pa-taux-pan', '—');
    setStatText('pa-heures-offertes', '—');
    setStatText('pa-heures-manquees', '—');
    setStatText('pa-seances-completees', '—');
    setStatText('pa-absences-non-justifiees', '—');
    setStatText('pa-alerte-80', '—');
    setStatText('pa-alerte-70', '—');
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
