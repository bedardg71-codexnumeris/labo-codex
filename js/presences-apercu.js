/* ===============================
   MODULE: PRÉSENCES - APERÇU
   Affichage des statistiques globales de présence du groupe
   =============================== */

(function() {
'use strict';

/**
 * Initialise le module d'aperçu des présences
 * Appelée par main.js au chargement
 */
function initialiserModulePresencesApercu() {
}

/**
 * Charge et affiche les statistiques d'aperçu des présences
 * Appelée automatiquement lors de l'affichage de la sous-section
 * (Mesuré au lot 34, 17 sept. 2026 : AUCUN appelant, et ses cibles `pa-taux-moyen`,
 * `pa-seances-donnees`, `pa-prochaine-seance`, `stat-nb-eleves` n'existent pas dans index.html.
 * Aucun écran ne lit cette moyenne. Verrou : sentinelle-745-exclu-hors-des-moyennes-comportement,
 * B.1 — le jour où un appelant revient, l'essai de comportement du filtre des exclus est dû.)
 */
function chargerApercuPresences() {

    try {
        // 🆕 BETA 96 FIX: Utiliser obtenirEtudiantsCoursActif() pour filtrer par groupe-cours actif
        // (comme le fait le tableau de bord)
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : obtenirDonneesSelonMode('groupeEtudiants');
        const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

        // Récupérer les indices d'assiduité calculés
        const indicesAssiduite = obtenirDonneesSelonMode('indicesAssiduite');

        // Récupérer les présences brutes
        const presences = obtenirDonneesSelonMode('presences');

        // Calculer les statistiques
        calculerStatistiquesPresences(etudiantsActifs, indicesAssiduite, presences);

        // 🆕 BETA 96 FIX: Afficher le nombre d'élèves du groupe actif (pas tous les étudiants)
        const nbEleves = etudiantsActifs.length;
        setStatText('stat-nb-eleves', nbEleves || '0');

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

    // TAUX D'ASSIDUITÉ MOYEN DU GROUPE
    // 🆕 BETA 96 FIX: Toujours utiliser l'indice SOMMATIF pour l'assiduité
    // (même comportement que tableau de bord - pas de moyenne des deux pratiques)
    // Le sommatif est la mesure cumulative officielle depuis le début du trimestre
    let totalTaux = 0;
    let nbAvecDonnees = 0;

    // 🆕 BETA 96 FIX: Extraire .indice si l'indice est un objet (comme le fait apercu-contenu.js)
    const extraireIndice = (val) => {
        if (typeof val === 'object' && val !== null) {
            return val.indice || 0;
        }
        return val || 0;
    };

    etudiants.forEach(e => {
        // 🆕 BETA 96 FIX: Utiliser sommatif uniquement (pas de moyenne SOM/PAN)
        // L'alternatif utilise une fenêtre glissante qui n'est pas pertinente pour l'aperçu global
        const tauxEtudiant = extraireIndice(indicesAssiduite.sommatif?.[e.da]);

        if (tauxEtudiant > 0) {
            nbAvecDonnees++;
        }

        totalTaux += tauxEtudiant;
    });

    // 🆕 BETA 96 FIX: Diviser par nbAvecDonnees (comme tableau de bord), pas nbTotal
    // Sinon les étudiants sans données diluent la moyenne
    const tauxMoyen = nbAvecDonnees > 0 ? Math.round((totalTaux / nbAvecDonnees) * 100) : 0;
    setStatText('pa-taux-moyen', formaterPourcentage(tauxMoyen));

    // SÉANCES DONNÉES (format X / Total)
    // ✅ FIX: Utiliser obtenirSeancesCompletes() comme source unique de vérité
    // pour les deux valeurs (séances données ET total du trimestre).
    // Aligné avec indices.js qui utilise la même source pour le calcul d'assiduité.
    const seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};
    const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE
    const toutesDatesSessions = Object.keys(seancesCompletes);
    const totalSeances = toutesDatesSessions.length;
    const seancesCompletees = toutesDatesSessions.filter(d => d <= aujourdhui).length;
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
        const calendrier = db.getSync(cle('calendrierComplet'), {});
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

    // ✅ CORRIGÉ (22 janvier 2026) : Vérifier que presences est un tableau
    if (!Array.isArray(presences)) {
        console.warn('⚠️ [calculerHeuresManquees] presences n\'est pas un tableau:', typeof presences);
        return 0;
    }

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
    const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE
    const calendrier = db.getSync(cle('calendrierComplet'), {});

    // ✅ CORRIGÉ (22 janvier 2026) : Vérifier que presences est un tableau
    if (!Array.isArray(presences)) {
        console.warn('⚠️ [calculerSeancesCompletees] presences n\'est pas un tableau:', typeof presences);
        return 0;
    }

    presences.forEach(p => {
        if (p.date) {
            // Ne compter que les dates de cours déjà passées ou d'aujourd'hui
            if (p.date <= aujourdhui) {
                // Vérifier que c'est un vrai jour de cours dans le calendrier
                const infosJour = calendrier[p.date];
                if (infosJour && (infosJour.statut === 'cours' || infosJour.statut === 'reprise')) {
                    // Exclure les présences facultatives (rattrapages individuels RàI)
                    // qui ne correspondent pas à une séance officielle du groupe
                    if (!p.facultatif) {
                        datesUniques.add(p.date);
                    }
                }
            }
        }
    });

    return datesUniques.size;
}

/**
 * Calcule le nombre total de séances prévues pour le trimestre complet
 * 🆕 BETA 96 FIX: Compte TOUTES les séances du trimestre (pas seulement jusqu'à aujourd'hui)
 * @returns {number} Total de séances du trimestre
 */
function calculerTotalSeances() {
    try {
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        // 🆕 BETA 96 FIX: Utiliser obtenirSeancesHoraire() pour le bon namespace
        const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
            ? obtenirSeancesHoraire()
            : db.getSync('seancesHoraire', []);

        // 🆕 BETA 95.6 : Normaliser les jours en minuscules pour éviter problèmes de casse
        // Obtenir les jours de la semaine où il y a cours (ex: ["lundi", "mercredi"])
        const joursCours = seancesHoraire.map(seance => seance.jour ? seance.jour.toLowerCase() : '');

        let totalJoursCours = 0;

        // 🆕 BETA 96 FIX: Compter TOUTES les séances du trimestre (pas de filtre date)
        // pour afficher la progression X / Total
        Object.entries(calendrier).forEach(([date, jour]) => {
            if (jour.statut === 'cours' || jour.statut === 'reprise') {
                // Pour les reprises, vérifier le jour remplacé (ex: cours du lundi → vendredi)
                // Pour les cours normaux, vérifier le jour de la semaine
                const jourAVerifier = (jour.statut === 'reprise' && jour.jourRemplace)
                    ? jour.jourRemplace
                    : jour.jourSemaine;

                // 🆕 BETA 95.6 : Comparer en minuscules
                const jourAVerifierLower = jourAVerifier ? jourAVerifier.toLowerCase() : '';
                // Ne compter que si c'est un jour où ce groupe a cours
                if (joursCours.includes(jourAVerifierLower)) {
                    totalJoursCours++;
                }
            }
        });

        return totalJoursCours;
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

    // ✅ CORRIGÉ (22 janvier 2026) : Vérifier que presences est un tableau
    if (!Array.isArray(presences)) {
        console.warn('⚠️ [calculerAbsencesNonJustifiees] presences n\'est pas un tableau:', typeof presences);
        return 0;
    }

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

    // ✅ CORRIGÉ (22 janvier 2026) : Vérifier que presences est un tableau
    if (!Array.isArray(presences)) {
        console.warn('⚠️ [calculerAbsencesMotivees] presences n\'est pas un tableau:', typeof presences);
        return 0;
    }

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
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        // 🆕 BETA 96 FIX: Utiliser obtenirSeancesHoraire() pour le bon namespace
        const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
            ? obtenirSeancesHoraire()
            : db.getSync('seancesHoraire', []);

        // 🆕 BETA 95.6 : Normaliser les jours en minuscules pour éviter problèmes de casse
        // Obtenir la liste des jours de la semaine où il y a cours (ex: ["lundi", "mercredi"])
        const joursCours = seancesHoraire.map(seance => seance.jour ? seance.jour.toLowerCase() : '');

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
                // 🆕 BETA 95.6 : Comparer en minuscules
                const jourAVerifierLower = jourAVerifier ? jourAVerifier.toLowerCase() : '';
                const estDansHoraire = joursCours.includes(jourAVerifierLower);

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


/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.chargerApercuPresences = chargerApercuPresences;

})();
