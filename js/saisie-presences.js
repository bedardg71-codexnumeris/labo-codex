/* ===============================
   MODULE: SAISIE DES PRÉSENCES
   Version refondée complète avec toutes les fonctionnalités

   ⚠️ ARCHITECTURE ⚠️
   Ce module LIT les données depuis :
   - trimestre.js : obtenirCalendrierComplet()
   - horaire.js : obtenirSeancesJour(dateStr)

   Il ne doit JAMAIS recalculer les dates ou séances.

   🆕 BETA 95.1 : Comptage en périodes
   - Les présences sont saisies en nombre de périodes (0, 1, 2, ...)
   - Les heures sont calculées automatiquement pour rétrocompatibilité
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de saisie des présences
 * Appelée par main.js au chargement
 */
/* ===============================
   CALCUL DES INDICES D'ASSIDUITÉ
   =============================== */

/**
 * Fonction orchestratrice : Calcule et sauvegarde les deux indices
 * Appelée après chaque enregistrement de présences
 */
function calculerEtSauvegarderIndicesAssiduite() {
    console.log('Calcul des indices d\'assiduité...');

    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    // Structure de sortie
    const indices = {
        sommatif: {},
        alternatif: {},
        dateCalcul: new Date().toISOString()
    };

    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );

    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        indices.sommatif[etudiant.da] = calculerAssiduiteSommative(etudiant.da);
        indices.alternatif[etudiant.da] = calculerAssiduiteAlternative(etudiant.da);
    });

    // Sauvegarder
    // IMPORTANT : Utiliser sauvegarderDonneesSelonMode pour respecter le mode actuel
    sauvegarderDonneesSelonMode('indicesAssiduite', indices);

    console.log('✅ Indices d\'assiduité sauvegardés');
    console.log('   Sommatif:', Object.keys(indices.sommatif).length, 'étudiants');
    console.log('   Alternatif:', Object.keys(indices.alternatif).length, 'étudiants');

    return indices;
}

/**
 * Calcule l'assiduité SOMMATIVE (depuis le début du trimestre)
 * Formule : Total heures présentes ÷ Total heures DONNÉES (pas théoriques)
 *
 * IMPORTANT : Les séances facultatives (interventions RàI) ne pénalisent PAS l'assiduité.
 * - Séance facultative où l'étudiant est PRÉSENT : compte au numérateur ET au dénominateur
 * - Séance facultative où l'étudiant est ABSENT : ne compte NI au numérateur NI au dénominateur
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object} - { indice, heuresPresentes, heuresOffertes, nombreSeances }
 */
function calculerAssiduiteSommative(da) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    // Obtenir toutes les DATES où des présences ont été saisies
    const datesSaisies = [...new Set(presences.map(p => p.date))].sort();

    if (datesSaisies.length === 0) {
        console.warn('⚠️ Aucune présence saisie');
        return {
            indice: 1,
            heuresPresentes: 0,
            heuresOffertes: 0,
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0
        };
    }

    // Obtenir les présences de cet étudiant
    const presencesEtudiant = presences.filter(p => p.da === da);

    // Calculer le total d'heures DONNÉES pour cet étudiant
    // = nombre de séances (excluant les séances facultatives où l'étudiant était absent) × 2h
    let totalHeuresDonnees = 0;
    let totalHeuresPresentes = 0;

    // Compter les séances NON facultatives pour l'affichage
    const seancesNonFacultatives = new Set();

    datesSaisies.forEach(date => {
        // Trouver la présence de l'étudiant pour cette date
        const presenceDate = presencesEtudiant.find(p => p.date === date);

        if (presenceDate) {
            // L'étudiant a une entrée pour cette date
            const estFacultatif = presenceDate.facultatif === true;
            const heuresPresence = presenceDate.heures || 0;

            if (estFacultatif && heuresPresence === 0) {
                // Séance facultative où l'étudiant était absent
                // Ne compte ni au numérateur ni au dénominateur
                console.log(`   ⚪ ${date}: Séance facultative (absent) - non comptabilisée`);
            } else if (estFacultatif && heuresPresence > 0) {
                // Séance facultative où l'étudiant était PRÉSENT
                // Utiliser la durée RÉELLE de l'intervention (pas 2h fixes)
                totalHeuresDonnees += heuresPresence;
                totalHeuresPresentes += heuresPresence;
                console.log(`   ✅ ${date}: Intervention RàI (${heuresPresence}h) - ${heuresPresence}h/${heuresPresence}h comptabilisées`);
            } else {
                // Séance normale (2h standard)
                // Compter comme séance non facultative
                seancesNonFacultatives.add(date);

                // CORRECTIF : Si heuresPresence > 2h (ex: cours + intervention RàI),
                // ajuster le dénominateur pour éviter les pourcentages > 100%
                const heuresCours = 2;
                if (heuresPresence > heuresCours) {
                    // Les heures supplémentaires sont des interventions RàI
                    // Ajouter au numérateur ET au dénominateur
                    totalHeuresDonnees += heuresPresence;
                    totalHeuresPresentes += heuresPresence;
                } else {
                    // Cas normal : <= 2h
                    totalHeuresDonnees += heuresCours;
                    totalHeuresPresentes += heuresPresence;
                }
            }
        } else {
            // L'étudiant n'a pas d'entrée pour cette date
            // Vérifier si cette date correspond à une séance facultative (intervention RàI)
            const presencesDate = presences.filter(p => p.date === date);
            const estSeanceFacultative = presencesDate.length > 0 &&
                                         presencesDate.every(p => p.facultatif === true);

            if (!estSeanceFacultative) {
                // Séance normale obligatoire : compte au dénominateur (0 au numérateur)
                seancesNonFacultatives.add(date);
                totalHeuresDonnees += 2;
            }
            // Si séance facultative : on ne fait rien (ni numérateur ni dénominateur)
        }
    });

    if (totalHeuresDonnees === 0) {
        console.warn(`⚠️ Aucune heure donnée pour ${da}`);
        return {
            indice: 1,
            heuresPresentes: 0,
            heuresOffertes: 0,
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0
        };
    }

    const indice = totalHeuresPresentes / totalHeuresDonnees;

    console.log(`   Sommatif ${da}: ${totalHeuresPresentes}h / ${totalHeuresDonnees}h = ${(indice * 100).toFixed(1)}%`);

    // 🆕 BETA 95.1 : Calculer les équivalents en périodes pour l'affichage
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
    const periodesPresentes = Math.round((totalHeuresPresentes * 60) / dureePeriode);
    const periodesOffertes = Math.round((totalHeuresDonnees * 60) / dureePeriode);

    // Retourner un objet avec tous les détails (Single Source of Truth)
    return {
        indice: Math.min(indice, 1),
        heuresPresentes: totalHeuresPresentes,
        heuresOffertes: totalHeuresDonnees,
        periodesPresentes: periodesPresentes,  // 🆕 BETA 95.1
        periodesOffertes: periodesOffertes,    // 🆕 BETA 95.1
        nombreSeances: seancesNonFacultatives.size
    };
}

/**
 * ✨ NOUVELLE FONCTION (Beta 93): Calcule l'assiduité jusqu'à une date limite
 * Utilisée pour la reconstruction rétroactive des snapshots historiques
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
 * @returns {Object} - {indice, heuresPresentes, heuresOffertes, nombreSeances}
 */
/**
 * Calcule l'assiduité PONCTUELLE pour une séance spécifique
 * (Beta 93 - Système de snapshots par séance)
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} dateSeance - Date de la séance au format YYYY-MM-DD
 * @returns {Object} - { indice, heuresPresentes, heuresOffertes }
 */
function calculerAssiduiteSeance(da, dateSeance) {
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    // Trouver la présence pour cette séance spécifique
    const presenceSeance = presences.find(p => p.da === da && p.date === dateSeance);

    // Si aucune donnée de présence, considérer comme absent (indice = 0)
    if (!presenceSeance) {
        // Vérifier si c'était une séance facultative pour tous
        const presencesDate = presences.filter(p => p.date === dateSeance);
        const estSeanceFacultative = presencesDate.length > 0 &&
                                     presencesDate.every(p => p.facultatif === true);

        if (estSeanceFacultative) {
            // Séance facultative non suivie = ne pénalise pas (indice = 1, 0h données)
            return {
                indice: 1,
                heuresPresentes: 0,
                heuresOffertes: 0
            };
        } else {
            // Séance normale non enregistrée = absent (indice = 0)
            return {
                indice: 0,
                heuresPresentes: 0,
                heuresOffertes: 2 // Heures théoriques par défaut
            };
        }
    }

    const estFacultatif = presenceSeance.facultatif === true;
    const heuresPresence = presenceSeance.heures || 0;

    // Séance facultative où l'étudiant était absent
    if (estFacultatif && heuresPresence === 0) {
        return {
            indice: 1, // Ne pénalise pas
            heuresPresentes: 0,
            heuresOffertes: 0
        };
    }

    // Séance facultative où l'étudiant était présent
    if (estFacultatif && heuresPresence > 0) {
        return {
            indice: 1, // Présent = 100%
            heuresPresentes: heuresPresence,
            heuresOffertes: heuresPresence
        };
    }

    // Séance normale
    const heuresCours = 2; // Heures théoriques par défaut

    if (heuresPresence > heuresCours) {
        // Étudiant présent avec heures supplémentaires (ex: récupération)
        return {
            indice: 1,
            heuresPresentes: heuresPresence,
            heuresOffertes: heuresPresence
        };
    } else {
        // Séance normale avec présence partielle ou complète
        const indice = heuresPresence / heuresCours;
        return {
            indice: Math.min(indice, 1),
            heuresPresentes: heuresPresence,
            heuresOffertes: heuresCours
        };
    }
}

function calculerAssiduiteJusquADate(da, dateLimite) {
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    // Filtrer seulement les présences JUSQU'À la date limite
    const presencesFiltrees = presences.filter(p => p.date <= dateLimite);
    const datesSaisies = [...new Set(presencesFiltrees.map(p => p.date))].sort();

    if (datesSaisies.length === 0) {
        return {
            indice: 1,
            heuresPresentes: 0,
            heuresOffertes: 0,
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0
        };
    }

    const presencesEtudiant = presencesFiltrees.filter(p => p.da === da);
    let totalHeuresDonnees = 0;
    let totalHeuresPresentes = 0;
    const seancesNonFacultatives = new Set();

    datesSaisies.forEach(date => {
        const presenceDate = presencesEtudiant.find(p => p.date === date);

        if (presenceDate) {
            const estFacultatif = presenceDate.facultatif === true;
            const heuresPresence = presenceDate.heures || 0;

            if (estFacultatif && heuresPresence === 0) {
                // Séance facultative absente: non comptabilisée
            } else if (estFacultatif && heuresPresence > 0) {
                // Séance facultative présente
                totalHeuresDonnees += heuresPresence;
                totalHeuresPresentes += heuresPresence;
            } else {
                // Séance normale
                seancesNonFacultatives.add(date);
                const heuresCours = 2;
                if (heuresPresence > heuresCours) {
                    totalHeuresDonnees += heuresPresence;
                    totalHeuresPresentes += heuresPresence;
                } else {
                    totalHeuresDonnees += heuresCours;
                    totalHeuresPresentes += heuresPresence;
                }
            }
        } else {
            // Étudiant absent
            const presencesDate = presencesFiltrees.filter(p => p.date === date);
            const estSeanceFacultative = presencesDate.length > 0 &&
                                         presencesDate.every(p => p.facultatif === true);

            if (!estSeanceFacultative) {
                seancesNonFacultatives.add(date);
                totalHeuresDonnees += 2;
            }
        }
    });

    if (totalHeuresDonnees === 0) {
        return {
            indice: 1,
            heuresPresentes: 0,
            heuresOffertes: 0,
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0
        };
    }

    const indice = totalHeuresPresentes / totalHeuresDonnees;

    // 🆕 BETA 95.1 : Calculer les équivalents en périodes
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
    const periodesPresentes = Math.round((totalHeuresPresentes * 60) / dureePeriode);
    const periodesOffertes = Math.round((totalHeuresDonnees * 60) / dureePeriode);

    return {
        indice: Math.min(indice, 1),
        heuresPresentes: totalHeuresPresentes,
        heuresOffertes: totalHeuresDonnees,
        periodesPresentes: periodesPresentes,
        periodesOffertes: periodesOffertes,
        nombreSeances: seancesNonFacultatives.size
    };
}

/**
 * Calcule l'assiduité ALTERNATIVE (sur les N dernières séances)
 * Formule : Heures présentes sur N dernières séances ÷ heures données (excluant facultatif absent)
 *
 * IMPORTANT : Les séances facultatives (interventions RàI) ne pénalisent PAS l'assiduité.
 * - Séance facultative où l'étudiant est PRÉSENT : compte au numérateur ET au dénominateur
 * - Séance facultative où l'étudiant est ABSENT : ne compte NI au numérateur NI au dénominateur
 *
 * Le nombre de séances est paramétrable via les réglages de notation.
 * Par défaut : 6 séances (= 3 cours = 12h)
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {number} - Indice entre 0 et 1
 */
function calculerAssiduiteAlternative(da) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    // Obtenir le nombre de séances depuis les réglages
    const config = db.getSync('modalitesEvaluation', {});
    const nombreCours = config.configPAN?.nombreCours || 3; // Par défaut 3 cours
    const nombreSeances = nombreCours * 2; // 3 cours = 6 séances

    console.log(`   Calcul alternatif : ${nombreCours} derniers cours = ${nombreSeances} séances`);

    // Obtenir toutes les dates où des présences ont été saisies (ordre chronologique)
    const datesSaisies = [...new Set(presences.map(p => p.date))].sort();

    if (datesSaisies.length === 0) {
        console.log(`   Alternatif ${da}: Aucune saisie, retour 100%`);
        return 1; // Pas encore de saisie
    }

    // Prendre les N dernières dates de saisie
    const dernieresDates = datesSaisies.slice(-nombreSeances);

    console.log(`   Dernières dates pour ${da}:`, dernieresDates);

    // Obtenir les présences de cet étudiant
    const presencesEtudiant = presences.filter(p =>
        p.da === da && dernieresDates.includes(p.date)
    );

    // Calculer en tenant compte des séances facultatives
    let totalHeuresDonnees = 0;
    let totalHeuresPresentes = 0;

    dernieresDates.forEach(date => {
        const presenceDate = presencesEtudiant.find(p => p.date === date);

        if (presenceDate) {
            const estFacultatif = presenceDate.facultatif === true;
            const heuresPresence = presenceDate.heures || 0;

            if (estFacultatif && heuresPresence === 0) {
                // Séance facultative où l'étudiant était absent
                // Ne compte ni au numérateur ni au dénominateur
                console.log(`   ⚪ ${date}: Séance facultative (absent) - non comptabilisée`);
            } else if (estFacultatif && heuresPresence > 0) {
                // Séance facultative où l'étudiant était PRÉSENT
                // Utiliser la durée RÉELLE de l'intervention (pas 2h fixes)
                totalHeuresDonnees += heuresPresence;
                totalHeuresPresentes += heuresPresence;
            } else {
                // Séance normale (2h standard)
                // CORRECTIF : Si heuresPresence > 2h (ex: cours + intervention RàI),
                // ajuster le dénominateur pour éviter les pourcentages > 100%
                const heuresCours = 2;
                if (heuresPresence > heuresCours) {
                    // Les heures supplémentaires sont des interventions RàI
                    // Ajouter au numérateur ET au dénominateur
                    totalHeuresDonnees += heuresPresence;
                    totalHeuresPresentes += heuresPresence;
                } else {
                    // Cas normal : <= 2h
                    totalHeuresDonnees += heuresCours;
                    totalHeuresPresentes += heuresPresence;
                }
            }
        } else {
            // L'étudiant n'a pas d'entrée pour cette date
            // Vérifier si cette date correspond à une séance facultative (intervention RàI)
            const presencesDate = presences.filter(p => p.date === date);
            const estSeanceFacultative = presencesDate.length > 0 &&
                                         presencesDate.every(p => p.facultatif === true);

            if (!estSeanceFacultative) {
                // Séance normale obligatoire : compte au dénominateur (0 au numérateur)
                totalHeuresDonnees += 2;
            }
            // Si séance facultative : on ne fait rien (ni numérateur ni dénominateur)
        }
    });

    if (totalHeuresDonnees === 0) {
        console.warn(`   ⚠️ Aucune heure donnée pour ${da} (alternatif)`);
        return 1; // Par défaut 100%
    }

    const indice = totalHeuresPresentes / totalHeuresDonnees;

    console.log(`   Alternatif ${da}: ${totalHeuresPresentes}h / ${totalHeuresDonnees}h = ${(indice * 100).toFixed(1)}%`);

    // Retourner l'indice (entre 0 et 1, plafonné à 1)
    return Math.min(indice, 1);
}

/**
 * Fonction utilitaire : Obtenir la configuration de notation
 * Utilisée par d'autres modules pour lire les paramètres PAN
 * 
 * @returns {Object} Configuration complète de notation
 */
function obtenirConfigurationNotation() {
    return db.getSync('modalitesEvaluation', {});
}

function initialiserModuleSaisiePresences() {
    console.log('⚡ Initialisation du module Saisie des Présences');

    const sectionSaisie = document.getElementById('presences-saisie');
    if (!sectionSaisie) {
        console.log('⚠️ Section saisie non active, initialisation reportée');
        return;
    }

    chargerGroupesPresences();
    verifierConfigurationFormatHoraire();

    const dateInput = document.getElementById('date-cours');
    if (dateInput && dateInput.value) {
        initialiserSaisiePresences();
        calculerEtSauvegarderIndicesAssiduite();

        console.log('✅ Module Saisie des Présences initialisé');
    }
}

/* ===============================
   GESTION DES GROUPES
   =============================== */

/**
 * Charge la liste des groupes dans le select
 */
function chargerGroupesPresences() {
    const selectGroupe = document.getElementById('selectGroupePresences');
    if (!selectGroupe) {
        console.log('⚠️ Element selectGroupePresences non trouvé');
        return;
    }

    // Obtenir les étudiants selon le mode actif
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe && e.groupe.trim() !== '') {
            groupesSet.add(e.groupe);
        }
    });

    const groupes = Array.from(groupesSet).sort();

    // Remplir le select
    selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';
    groupes.forEach(groupe => {
        const option = document.createElement('option');
        option.value = groupe;
        option.textContent = groupe;
        selectGroupe.appendChild(option);
    });

    console.log(`✅ ${groupes.length} groupes chargés dans le select`);
    calculerEtSauvegarderIndicesAssiduite();
}

/* ===============================
   FONCTIONS DE CALENDRIER
   Utilisent les sources uniques

   NOTE: obtenirDonneesSelonMode() est fournie par modes.js (fonction globale)
   Ne PAS redéfinir localement pour éviter les conflits!
   =============================== */

/**
 * Obtient les informations d'un jour depuis le calendrier
 */
function obtenirInfosJourCalendrier(dateStr) {
    // Vérifier d'abord si les fonctions existent
    if (typeof obtenirInfosJour === 'function') {
        return obtenirInfosJour(dateStr);
    }

    if (typeof obtenirCalendrierComplet === 'function') {
        const calendrier = obtenirCalendrierComplet();
        return calendrier ? calendrier[dateStr] : null;
    }

    // Fallback : lire directement depuis localStorage
    console.warn('⚠️ Fonctions trimestre.js non disponibles, lecture directe');
    const calendrier = db.getSync(cle('calendrierComplet'), {});
    return calendrier[dateStr] || null;
}

/**
 * Vérifie si une date est un jour de cours réel
 */
function estJourDeCoursReel(dateStr) {
    // Vérifier si la fonction existe
    if (typeof obtenirCalendrierComplet === 'function') {
        const calendrier = obtenirCalendrierComplet();
        if (!calendrier || !calendrier[dateStr]) {
            return false;
        }
        const jour = calendrier[dateStr];
        return jour.statut === 'cours' || jour.statut === 'reprise';
    }

    // Fallback : lire directement
    console.warn('⚠️ obtenirCalendrierComplet non disponible, lecture directe');
    const calendrier = db.getSync(cle('calendrierComplet'), {});

    if (!calendrier[dateStr]) {
        return false;
    }

    const jour = calendrier[dateStr];
    return jour.statut === 'cours' || jour.statut === 'reprise';
}

/**
 * Obtient toutes les dates de cours du trimestre
 * VERSION CORRIGÉE : Ne retourne que les jours avec des séances réelles
 */
function obtenirToutesDatesCours() {
    // Option 1: Utiliser seancesCompletes (jours avec séances uniquement)
    let seancesCompletes;

    if (typeof obtenirSeancesCompletes === 'function') {
        seancesCompletes = obtenirSeancesCompletes();
    } else {
        // 🆕 BETA 95 : Utiliser clé multi-cours si disponible
        console.warn('⚠️ obtenirSeancesCompletes non disponible, lecture directe');
        const cleCours = typeof cleSeancesCompletes === 'function' ? cleSeancesCompletes() : cle('seancesCompletes');
        seancesCompletes = db.getSync(cleCours, {});
    }

    // Si on a des séances, utiliser ces dates
    if (seancesCompletes && Object.keys(seancesCompletes).length > 0) {
        const datesAvecSeances = Object.keys(seancesCompletes).filter(date => {
            const seances = seancesCompletes[date];
            return seances && seances.length > 0;
        });

        datesAvecSeances.sort();
        console.log(`✅ ${datesAvecSeances.length} dates avec séances trouvées`);

        if (datesAvecSeances.length > 0) {
            console.log('Exemples:', datesAvecSeances.slice(0, 5));
            return datesAvecSeances;
        }
    }

    // Option 2: Fallback - utiliser calendrierComplet mais filtrer par jour de semaine
    console.warn('⚠️ Pas de séances complètes, utilisation du calendrier avec filtrage');

    let calendrier;
    if (typeof obtenirCalendrierComplet === 'function') {
        calendrier = obtenirCalendrierComplet();
    } else {
        calendrier = db.getSync(cle('calendrierComplet'), {});
    }

    if (!calendrier || Object.keys(calendrier).length === 0) {
        console.error('❌ Calendrier vide');
        return [];
    }

    // 🆕 BETA 95 : Obtenir les jours de séances depuis l'horaire du cours actif
    const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync('seancesHoraire', []);
    // 🆕 BETA 95.6 : Normaliser en minuscules pour éviter problèmes de casse
    const joursAvecSeances = new Set();
    seancesHoraire.forEach(seance => {
        if (seance.jour) {
            joursAvecSeances.add(seance.jour.toLowerCase());
        }
    });

    console.log('Jours configurés dans l\'horaire:', Array.from(joursAvecSeances));

    // Filtrer pour ne garder que les jours qui correspondent à l'horaire
    const datesCours = [];
    Object.keys(calendrier).forEach(date => {
        const jour = calendrier[date];
        if (jour && jour.statut) {
            // Cours normal : vérifier si c'est un jour de l'horaire
            // 🆕 BETA 95.6 : Comparer en minuscules (jourSemaine = "Lundi", seances stockent "Lundi" ou "lundi")
            const jourSemaineLower = jour.jourSemaine ? jour.jourSemaine.toLowerCase() : '';
            if (jour.statut === 'cours' && joursAvecSeances.has(jourSemaineLower)) {
                datesCours.push(date);
            }
            // Reprise : toujours inclure (utilise jourRemplace)
            else if (jour.statut === 'reprise') {
                datesCours.push(date);
            }
        }
    });

    datesCours.sort();
    console.log(`✅ ${datesCours.length} dates de cours filtrées (jours avec séances)`);

    return datesCours;
}

/* ===============================
   🕐 FONCTIONS DE SÉANCES
   =============================== */

/**
 * Obtient les heures totales d'une séance pour une date
 */
function obtenirHeuresSeance(dateStr) {
    let seances;

    // Essayer d'abord la fonction du module
    if (typeof obtenirSeancesJour === 'function') {
        seances = obtenirSeancesJour(dateStr);
    } else {
        // 🆕 BETA 95 : Fallback avec clé multi-cours
        const cleCours = typeof cleSeancesCompletes === 'function' ? cleSeancesCompletes() : cle('seancesCompletes');
        const seancesCompletes = db.getSync(cleCours, {});
        seances = seancesCompletes[dateStr] || [];
    }

    console.log(`📚 Séances pour ${dateStr}:`, seances);

    if (!seances || seances.length === 0) {
        // Pour les jours de cours sans séances définies, utiliser valeur par défaut
        const infoJour = obtenirInfosJourCalendrier(dateStr);
        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            const formatHoraire = db.getSync('formatHoraire', null);
            const heuresDefaut = formatHoraire === '1x4' ? 4 : 2;
            console.log(`⚠️ Pas de séances définies pour ce jour de cours, utilisation de ${heuresDefaut}h par défaut`);
            return heuresDefaut;
        }
        return 0;
    }

    let totalHeures = 0;
    seances.forEach(seance => {
        // Gérer différents formats de séance
        // Format nouveau (avec propriétés debut/fin)
        if (seance.debut && seance.fin) {
            const debut = seance.debut.split(':');
            const fin = seance.fin.split(':');

            const heureDebut = parseInt(debut[0]) + parseInt(debut[1]) / 60;
            const heureFin = parseInt(fin[0]) + parseInt(fin[1]) / 60;

            totalHeures += (heureFin - heureDebut);
        }
        // Format ancien (avec heureDebut/heureFin) 
        else if (seance.heureDebut && seance.heureFin) {
            const debut = seance.heureDebut.split(':');
            const fin = seance.heureFin.split(':');

            const heureDebut = parseInt(debut[0]) + parseInt(debut[1]) / 60;
            const heureFin = parseInt(fin[0]) + parseInt(fin[1]) / 60;

            totalHeures += (heureFin - heureDebut);
        }
        // Si format inconnu mais jour de cours valide
        else {
            console.warn('⚠️ Format de séance non reconnu:', seance);
            // Utiliser une valeur par défaut
            const formatHoraire = db.getSync('formatHoraire', null);
            totalHeures = formatHoraire === '1x4' ? 4 : 2;
        }
    });

    return 2;  // Simplification : toujours 2h par séance
}

/**
 * Formate les heures pour l'affichage
 */
function formaterHeuresAffichage(heures) {
    if (!heures || heures === 0) return '';

    const heuresInt = Math.floor(heures);
    const minutes = Math.round((heures - heuresInt) * 60);

    if (minutes === 0) {
        return `${heuresInt}h`;
    } else {
        return `${heuresInt}h${minutes.toString().padStart(2, '0')}`;
    }
}

/**
 * Calcule le nombre de séances jusqu'à une date
 */
function calculerNombreSeances(dateJusqua) {
    let seances;

    // Essayer d'abord la fonction du module
    if (typeof obtenirSeancesCompletes === 'function') {
        seances = obtenirSeancesCompletes();
    } else {
        // 🆕 BETA 95 : Fallback avec clé multi-cours
        console.warn('⚠️ obtenirSeancesCompletes non disponible, lecture directe');
        const cleCours = typeof cleSeancesCompletes === 'function' ? cleSeancesCompletes() : cle('seancesCompletes');
        seances = db.getSync(cleCours, {});
    }

    if (!seances || Object.keys(seances).length === 0) {
        console.warn('⚠️ Pas de séances disponibles');
        return 0;
    }

    let compteur = 0;
    Object.keys(seances).forEach(date => {
        if (date <= dateJusqua && seances[date] && seances[date].length > 0) {
            compteur++;
        }
    });

    return compteur;
}

/**
 * Obtient la durée maximale d'une séance
 */
function obtenirDureeMaxSeance() {
    // Simplification pédagogique : toujours 2h max par séance
    // (2 périodes de 60 minutes = 2 heures)
    return 2;
}

/**
 * 🆕 BETA 95.1 : Obtient le nombre de périodes d'une séance pour une date
 * Utilise les séances complètes si disponibles, sinon fallback sur 2 périodes
 */
function obtenirNombrePeriodesSeance(dateStr) {
    let seancesCompletes;

    if (typeof obtenirSeancesCompletes === 'function') {
        seancesCompletes = obtenirSeancesCompletes();
    } else {
        const cleCours = typeof cleSeancesCompletes === 'function' ? cleSeancesCompletes() : cle('seancesCompletes');
        seancesCompletes = db.getSync(cleCours, {});
    }

    const seancesDuJour = seancesCompletes[dateStr];

    if (seancesDuJour && seancesDuJour.length > 0) {
        // Prendre le nombre de périodes de la première séance du jour
        const seance = seancesDuJour[0];
        if (seance.nombrePeriodes) {
            return seance.nombrePeriodes;
        }
        // Rétrocompatibilité : convertir la durée en périodes
        if (seance.duree) {
            const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
            return Math.round((seance.duree * 60) / dureePeriode);
        }
    }

    // Fallback : 2 périodes par défaut
    return 2;
}

/**
 * 🆕 BETA 95.1 : Génère les options du select de périodes présentes
 * @param {number} nombrePeriodesMax - Nombre maximum de périodes pour cette séance
 * @param {number} valeurSelectionnee - Valeur actuellement sélectionnée
 */
function genererOptionsPeriodesPresentes(nombrePeriodesMax, valeurSelectionnee = null) {
    let options = '';
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    for (let p = 0; p <= nombrePeriodesMax; p++) {
        const selected = (valeurSelectionnee !== null && p === valeurSelectionnee) ? 'selected' : '';
        const dureeMinutes = p * dureePeriode;
        const heures = Math.floor(dureeMinutes / 60);
        const minutes = dureeMinutes % 60;
        let affichage;

        if (p === 0) {
            affichage = 'Absent';
        } else if (p === nombrePeriodesMax) {
            affichage = `${p} pér. (complet)`;
        } else {
            const tempsStr = minutes > 0 ? `${heures}h${String(minutes).padStart(2, '0')}` : `${heures}h`;
            affichage = `${p} pér. (${tempsStr})`;
        }

        options += `<option value="${p}" ${selected}>${affichage}</option>`;
    }

    return options;
}

/* ===============================
   🔍 VALIDATION ET VÉRIFICATION
   =============================== */

/**
 * Valide si une date peut être saisie
 */
function validerDateSaisie(dateStr) {
    if (!dateStr) {
        return { valide: false, raison: 'vide', verrouille: false };
    }

    const infoJour = obtenirInfosJourCalendrier(dateStr);

    if (!infoJour) {
        return { valide: false, raison: 'hors-calendrier', verrouille: false };
    }

    // Vérifier le statut - accepter cours ET reprise
    if (infoJour.statut !== 'cours' && infoJour.statut !== 'reprise') {
        return { valide: false, raison: 'pas-cours', verrouille: false };
    }

    // Vérifier si c'est un jour où il y a des séances
    const heuresSeance = obtenirHeuresSeance(dateStr);
    if (heuresSeance === 0) {
        console.warn(`⚠️ Jour de cours sans séances: ${dateStr}`);
        // On accepte quand même pour permettre la saisie manuelle
    }

    const dateSelectionnee = new Date(dateStr + 'T00:00:00');
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (dateSelectionnee > aujourdhui) {
        return { valide: false, raison: 'future', verrouille: false };
    }

    const verrouille = estDateVerrouillee(dateStr);

    return {
        valide: true,
        raison: '',
        verrouille: verrouille
    };
}

/**
 * Vérifie si une date est verrouillée
 */
function estDateVerrouillee(dateStr) {
    const datesVerrouillees = db.getSync('datesVerrouillees', []);
    return datesVerrouillees.includes(dateStr);
}

/**
 * Bascule le verrouillage d'une date
 */
function basculerVerrouillageDate(dateStr) {
    let datesVerrouillees = db.getSync('datesVerrouillees', []);

    const index = datesVerrouillees.indexOf(dateStr);
    if (index > -1) {
        datesVerrouillees.splice(index, 1);
        console.log('🔓 Date déverrouillée:', dateStr);
    } else {
        datesVerrouillees.push(dateStr);
        console.log('🔒 Date verrouillée:', dateStr);
    }

    db.setSync('datesVerrouillees', datesVerrouillees);
    initialiserSaisiePresences();
}

/**
 * Vérifie la configuration du format horaire
 */
function verifierConfigurationFormatHoraire() {
    const alerteDiv = document.getElementById('alerteFormatHoraire');
    if (!alerteDiv) return;

    const formatHoraire = db.getSync('formatHoraire', null);
    // 🆕 BETA 95 : Utiliser l'horaire du cours actif
    const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync('seancesHoraire', []);

    if (!formatHoraire || seancesHoraire.length === 0) {
        alerteDiv.style.display = 'block';
        alerteDiv.innerHTML = `
            <div class="alerte alerte-avertissement">
                <strong>⚠️ Configuration incomplète</strong><br>
                L'horaire des cours n'est pas configuré. 
                <a href="#" onclick="afficherSection('reglages'); afficherSousSection('reglages-horaire'); return false;">
                    Configurer l'horaire →
                </a>
            </div>`;
    } else {
        alerteDiv.style.display = 'none';
    }
}

/* ===============================
   📝 INTERFACE DE SAISIE
   =============================== */

/**
 * Initialise la saisie des présences pour la date sélectionnée
 */
function initialiserSaisiePresences() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        const tbody = document.getElementById('tbody-saisie-presences');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="u-text-center">Sélectionnez une date</td></tr>';
        }
        return;
    }

    const validation = validerDateSaisie(dateInput.value);

    if (!validation.valide) {
        let message = '';
        switch (validation.raison) {
            case 'vide':
                message = 'Veuillez sélectionner une date';
                break;
            case 'pas-cours':
                message = 'Ce jour n\'est pas un jour de cours';
                break;
            case 'future':
                message = 'Cette date est dans le futur';
                break;
            case 'hors-calendrier':
                message = 'Cette date est hors du calendrier scolaire';
                break;
            default:
                message = 'Date invalide';
        }

        const tbody = document.getElementById('tbody-saisie-presences');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="u-text-center-erreur">${message}</td></tr>`;
        }

        mettreAJourEnteteDateSeance('');
        return;
    }

    mettreAJourEnteteDateSeance(dateInput.value);
    chargerTableauPresences(dateInput.value, validation.verrouille);
    mettreAJourBoutonsNavigation();

    // Restaurer la valeur de recherche sauvegardée (persistance lors de la navigation)
    const recherche = document.getElementById('recherche-saisie-presences');
    const termeRecherche = db.getSync('recherchePresences', '');
    if (recherche && termeRecherche) {
        recherche.value = termeRecherche;
        filtrerTableauPresences();
    }
}

/**
 * Met à jour l'en-tête de la saisie avec tous les états visuels
 */
// Note: obtenirRangSeanceDansSemaine() est maintenant définie dans horaire.js (source unique)
// et exportée globalement via window.obtenirRangSeanceDansSemaine

function mettreAJourEnteteDateSeance(dateStr) {
    const entete = document.getElementById('enteteDateSeance');
    const texte = document.getElementById('texteDateSeance');

    if (!entete || !texte) return;

    if (!dateStr) {
        entete.style.display = 'none';
        return;
    }

    const infoJour = obtenirInfosJourCalendrier(dateStr);

    if (!infoJour) {
        entete.style.display = 'none';
        return;
    }

    const dateFr = formaterDateFrancais(dateStr);
    const heures = obtenirHeuresSeance(dateStr);
    const heuresFormatees = formaterHeuresAffichage(heures);
    const estVerrouille = estDateVerrouillee(dateStr);
    const rangSeance = obtenirRangSeanceDansSemaine(dateStr);

    // 🆕 BETA 95 : Récupérer le groupe depuis seancesCompletes du cours actif
    let seancesCompletes;
    if (typeof obtenirSeancesCompletes === 'function') {
        seancesCompletes = obtenirSeancesCompletes();
    } else {
        const cleCours = typeof cleSeancesCompletes === 'function' ? cleSeancesCompletes() : cle('seancesCompletes');
        seancesCompletes = db.getSync(cleCours, {});
    }
    const seancesDuJour = seancesCompletes[dateStr];
    let groupePrefix = '';
    if (seancesDuJour && seancesDuJour.length > 0 && seancesDuJour[0].groupe) {
        groupePrefix = `Groupe ${seancesDuJour[0].groupe} : `;
    }

    // Retirer toutes les classes d'état
    entete.classList.remove('etat-erreur', 'etat-valide', 'etat-verrouille');

    let message = '';

    if (infoJour.statut === 'cours') {
        message = `${groupePrefix}Présences au cours du ${dateFr}`;

        // Ajouter le rang de la séance
        if (rangSeance && infoJour.numeroSemaine) {
            message += ` - ${rangSeance.ordinal} séance de la semaine ${infoJour.numeroSemaine}`;
        } else if (infoJour.numeroSemaine) {
            message += ` - Semaine ${infoJour.numeroSemaine}`;
        }

        if (heuresFormatees) {
            message += ` (${heuresFormatees})`;
        }

        entete.classList.add(estVerrouille ? 'etat-verrouille' : 'etat-valide');

    } else if (infoJour.statut === 'reprise') {
        message = `${groupePrefix}Présences au cours du ${dateFr} - REPRISE`;

        // Ajouter le rang de la séance
        if (rangSeance && infoJour.numeroSemaine) {
            message += ` - ${rangSeance.ordinal} séance de la semaine ${infoJour.numeroSemaine}`;
        }

        if (infoJour.jourRemplace) {
            message += ` (horaire du ${infoJour.jourRemplace.toLowerCase()})`;
        }

        if (heuresFormatees) {
            message += ` - ${heuresFormatees}`;
        }

        entete.classList.add(estVerrouille ? 'etat-verrouille' : 'etat-valide');

    } else if (infoJour.statut === 'conge') {
        message = `${dateFr} - CONGÉ`;
        if (infoJour.motif) {
            message += ` (${infoJour.motif})`;
        }
        entete.classList.add('etat-erreur');
        entete.style.display = 'block';
        texte.innerHTML = message;
        return;
    }

    // Ajouter le contrôle de verrouillage pour les jours de cours/reprise
    if (infoJour.statut === 'cours' || infoJour.statut === 'reprise') {
        const controleVerrou = `
            <span class="controle-verrouillage">
                <input type="checkbox"
                       id="checkbox-verrouillage-${dateStr}"
                       ${estVerrouille ? 'checked' : ''}
                       onchange="basculerVerrouillageDate('${dateStr}')">
                <label for="checkbox-verrouillage-${dateStr}">
                    <span class="icone-cadenas">${estVerrouille ? '🔒' : '🔓'}</span>
                    ${estVerrouille ? 'Verrouillée' : 'Déverrouillée'}
                </label>
            </span>`;
        message += controleVerrou;
    }

    entete.style.display = 'block';
    texte.innerHTML = message;
}

/**
 * Charge et affiche le tableau des présences avec toutes les fonctionnalités
 */
function chargerTableauPresences(dateStr, estVerrouille) {
    const tbody = document.getElementById('tbody-saisie-presences');
    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    // ✅ CORRIGÉ (8 janvier 2026) : Utiliser obtenirDonneesSelonMode pour filtrer par coursId
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) {
        console.warn('⚠️ [chargerTableauPresences] presences n\'est pas un tableau, conversion en []');
        presences = [];
    }

    let etudiantsFiltres = etudiants;

    // ÉTAPE 1 : Filtrer par groupe (si un groupe est sélectionné)
    if (groupeFiltre) {
        etudiantsFiltres = etudiants.filter(e => e.groupe === groupeFiltre);
    }

    // ÉTAPE 2 : Trier selon le critère choisi
    const selectTri = document.getElementById('selectTriPresences');
    const criterieTri = selectTri ? selectTri.value : 'nom';

    if (criterieTri === 'nom') {
        // Tri alphabétique par nom de famille
        etudiantsFiltres.sort((a, b) => {
            const nomA = `${a.nom} ${a.prenom}`.toLowerCase();
            const nomB = `${b.nom} ${b.prenom}`.toLowerCase();
            return nomA.localeCompare(nomB);
        });
    } else if (criterieTri === 'assiduite-croissant') {
        // Tri par assiduité croissante (plus faible d'abord)
        etudiantsFiltres.sort((a, b) => {
            const tauxA = calculerTauxAssiduite(a.da, dateStr, 0);
            const tauxB = calculerTauxAssiduite(b.da, dateStr, 0);
            return tauxA - tauxB;
        });
    } else if (criterieTri === 'assiduite-decroissant') {
        // Tri par assiduité décroissante (plus élevé d'abord)
        etudiantsFiltres.sort((a, b) => {
            const tauxA = calculerTauxAssiduite(a.da, dateStr, 0);
            const tauxB = calculerTauxAssiduite(b.da, dateStr, 0);
            return tauxB - tauxA;
        });
    }

    const dureeSeance = obtenirHeuresSeance(dateStr);
    // 🆕 BETA 95.1 : Obtenir le nombre de périodes de la séance
    const nombrePeriodesSeance = obtenirNombrePeriodesSeance(dateStr);
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    tbody.innerHTML = '';

    etudiantsFiltres.forEach((etudiant, index) => {
        const presenceExistante = presences.find(p =>
            p.date === dateStr && p.da === etudiant.da
        );

        // 🆕 BETA 95.1 : Utiliser periodesPresentes si disponible, sinon calculer depuis heures
        let periodesPresence;
        if (presenceExistante) {
            if (presenceExistante.periodesPresentes !== undefined) {
                periodesPresence = presenceExistante.periodesPresentes;
            } else if (presenceExistante.heures !== undefined) {
                // Rétrocompatibilité : convertir les heures en périodes
                periodesPresence = Math.round((presenceExistante.heures * 60) / dureePeriode);
            } else {
                periodesPresence = nombrePeriodesSeance; // Présent par défaut
            }
        } else {
            periodesPresence = nombrePeriodesSeance; // Présent par défaut si nouvelle saisie
        }

        const heuresPresence = (periodesPresence * dureePeriode) / 60;
        const notes = presenceExistante ? (presenceExistante.notes || '') : '';
        const estFacultatif = presenceExistante ? (presenceExistante.facultatif === true) : false;

        const heuresHistorique = calculerTotalHeuresPresence(etudiant.da, dateStr);
        const tauxAssiduiteActuel = calculerTauxAssiduite(
            etudiant.da,
            dateStr,
            parseFloat(heuresPresence) || 0
        );

        const tr = document.createElement('tr');

        // 🆕 BETA 95.1 : Select de périodes au lieu d'input heures
        const selectPeriodesHTML = `
            <select class="controle-form select-periodes ${obtenirClasseSaisiePeriodes(periodesPresence, nombrePeriodesSeance, estFacultatif)}"
                    id="periodes_${etudiant.da}"
                    ${estVerrouille ? 'disabled' : ''}
                    onchange="mettreAJourLignePeriodes('${etudiant.da}', '${dateStr}', ${nombrePeriodesSeance})">
                ${genererOptionsPeriodesPresentes(nombrePeriodesSeance, periodesPresence)}
            </select>`;

        // Calculer le total incluant la séance actuelle
        const totalHeuresAvecSeanceActuelle = heuresHistorique + parseFloat(heuresPresence);

        // Structure : DA | Prénom | Nom | Présence | Notes | Total heures | Assiduité
        tr.innerHTML = `
            <td>${echapperHtml(etudiant.da)}</td>
            <td>${echapperHtml(etudiant.prenom)}</td>
            <td>${echapperHtml(etudiant.nom)}</td>
            <td class="u-w-100">${selectPeriodesHTML}</td>
            <td>
                <input type="text"
                       class="controle-form input-notes"
                       id="notes_${etudiant.da}"
                       value="${echapperHtml(notes)}"
                       placeholder="Notes..."
                       ${estVerrouille ? 'disabled' : ''}>
            </td>
            <td><span id="heuresHisto_${etudiant.da}">${totalHeuresAvecSeanceActuelle.toFixed(1)}h</span></td>
            <td>
                <span id="taux_${etudiant.da}" class="u-texte-medium">
                    ${tauxAssiduiteActuel}%
                </span>
            </td>`;

        tbody.appendChild(tr);
    });

    // Mettre à jour le compteur
    const nbEtudiants = document.getElementById('nbEtudiantsPresences');
    if (nbEtudiants) {
        nbEtudiants.textContent = etudiantsFiltres.length;
    }

    // Mettre à jour le titre de la colonne Présence avec bouton
    const colonnePresenceTitre = document.getElementById('colonneHeuresTitre');
    if (colonnePresenceTitre) {
        // 🆕 BETA 95.1 : Afficher en périodes
        colonnePresenceTitre.innerHTML = `
            Présence
            <div class="mt-8-flex-col-gap4">
                <button class="btn btn-principal btn-tres-compact"
                        onclick="tousPresents()"
                        ${estVerrouille ? 'disabled' : ''}
                        title="Mettre tous présents (${nombrePeriodesSeance} périodes)">
                    Tous ${nombrePeriodesSeance} pér.
                </button>
                <button class="btn btn-annuler btn-tres-compact"
                        onclick="reinitialiserSaisie()"
                        ${estVerrouille ? 'disabled' : ''}
                        title="Réinitialiser (tous absents)">
                    ↻
                </button>
            </div>
        `;
    }

    // Gérer l'état des boutons principaux
    const btnTousPresents = document.getElementById('btn-tous-presents');
    const btnReinit = document.getElementById('btn-reinit-saisie');
    const btnEnregistrer = document.querySelector('[onclick="enregistrerPresences()"]');

    if (btnTousPresents) btnTousPresents.disabled = estVerrouille;
    if (btnReinit) btnReinit.disabled = estVerrouille;
    if (btnEnregistrer) btnEnregistrer.disabled = estVerrouille;
    calculerEtSauvegarderIndicesAssiduite();

    // Mettre à jour le compteur présents/absents
    mettreAJourCompteurPresences();
}

/**
 * Obtient la classe CSS pour la saisie selon la valeur
 */
function obtenirClasseSaisie(heures, dureeMax, estFacultatif = false) {
    const valeur = parseFloat(heures) || 0;

    if (valeur === 0) {
        // Si c'est une absence facultative, utiliser une classe différente (couleur ambre)
        return estFacultatif ? 'saisie-absence-motivee' : 'saisie-absence';
    } else if (valeur < dureeMax) {
        return 'saisie-retard';
    } else if (valeur === dureeMax) {
        return 'saisie-present';
    }
    return 'saisie-vide';
}

/**
 * 🆕 BETA 95.1 : Obtient la classe CSS pour la saisie en périodes
 */
function obtenirClasseSaisiePeriodes(periodes, periodesMax, estFacultatif = false) {
    const valeur = parseInt(periodes) || 0;

    if (valeur === 0) {
        return estFacultatif ? 'saisie-absence-motivee' : 'saisie-absence';
    } else if (valeur < periodesMax) {
        return 'saisie-retard';
    } else if (valeur >= periodesMax) {
        return 'saisie-present';
    }
    return 'saisie-vide';
}

/**
 * 🆕 BETA 95.1 : Applique le code couleur à un select de périodes
 */
function appliquerCodeCouleurPeriodes(selectPeriodes, periodesMax) {
    if (!selectPeriodes) return;

    const valeur = parseInt(selectPeriodes.value) || 0;

    // Retirer toutes les classes
    selectPeriodes.classList.remove('saisie-absence', 'saisie-absence-motivee', 'saisie-retard', 'saisie-present', 'saisie-vide');

    // Appliquer la bonne classe
    if (valeur === 0) {
        selectPeriodes.classList.add('saisie-absence');
    } else if (valeur < periodesMax) {
        selectPeriodes.classList.add('saisie-retard');
    } else {
        selectPeriodes.classList.add('saisie-present');
    }
}

/**
 * 🆕 BETA 95.1 : Met à jour les statistiques d'une ligne (version périodes)
 */
function mettreAJourLignePeriodes(da, dateStr, nombrePeriodesMax) {
    const selectPeriodes = document.getElementById(`periodes_${da}`);
    const spanTaux = document.getElementById(`taux_${da}`);
    const spanHeuresHisto = document.getElementById(`heuresHisto_${da}`);

    if (!selectPeriodes || !spanTaux) return;

    const periodesSeance = parseInt(selectPeriodes.value) || 0;
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
    const heuresSeance = (periodesSeance * dureePeriode) / 60;

    // Appliquer le code couleur
    appliquerCodeCouleurPeriodes(selectPeriodes, nombrePeriodesMax);

    // Mettre à jour le total des heures (historique + séance actuelle)
    if (spanHeuresHisto) {
        const heuresHistorique = calculerTotalHeuresPresence(da, dateStr);
        const totalHeuresAvecSeanceActuelle = heuresHistorique + heuresSeance;
        spanHeuresHisto.textContent = totalHeuresAvecSeanceActuelle.toFixed(1) + 'h';
    }

    // Mettre à jour le taux
    const tauxAssiduiteActuel = calculerTauxAssiduite(da, dateStr, heuresSeance);

    spanTaux.textContent = tauxAssiduiteActuel + '%';
    spanTaux.style.fontWeight = '500';

    // Mettre à jour le compteur présents/absents
    mettreAJourCompteurPresences();
}

/**
 * Applique le code couleur à un input
 */
function appliquerCodeCouleurSaisie(inputHeures, dureeMax) {
    if (!inputHeures) return;

    const valeur = parseFloat(inputHeures.value) || 0;

    // Retirer toutes les classes (incluant saisie-absence-motivee)
    inputHeures.classList.remove('saisie-absence', 'saisie-absence-motivee', 'saisie-retard', 'saisie-present', 'saisie-vide');

    // Appliquer la bonne classe
    if (valeur === 0) {
        inputHeures.classList.add('saisie-absence');
    } else if (valeur < dureeMax) {
        inputHeures.classList.add('saisie-retard');
    } else if (valeur === dureeMax) {
        inputHeures.classList.add('saisie-present');
    } else {
        inputHeures.classList.add('saisie-vide');
    }
}

/**
 * Met à jour les statistiques d'une ligne
 */
function mettreAJourLigne(da, dateStr) {
    const inputHeures = document.getElementById(`heures_${da}`);
    const spanTaux = document.getElementById(`taux_${da}`);
    const spanHeuresHisto = document.getElementById(`heuresHisto_${da}`);

    if (!inputHeures || !spanTaux) return;

    const heuresSeance = parseFloat(inputHeures.value) || 0;
    const dureeMax = obtenirHeuresSeance(dateStr);

    // Appliquer le code couleur
    appliquerCodeCouleurSaisie(inputHeures, dureeMax);

    // Mettre à jour le total des heures (historique + séance actuelle)
    if (spanHeuresHisto) {
        const heuresHistorique = calculerTotalHeuresPresence(da, dateStr);
        const totalHeuresAvecSeanceActuelle = heuresHistorique + heuresSeance;
        spanHeuresHisto.textContent = totalHeuresAvecSeanceActuelle.toFixed(1) + 'h';
    }

    // Mettre à jour le taux
    const tauxAssiduiteActuel = calculerTauxAssiduite(da, dateStr, heuresSeance);

    spanTaux.textContent = tauxAssiduiteActuel + '%';
    // Format simple et uniforme pour tous
    spanTaux.style.fontWeight = '500';

    // Mettre à jour le compteur présents/absents
    mettreAJourCompteurPresences();
}

/* ===============================
   ENREGISTREMENT
   =============================== */

/**
 * Enregistre les présences saisies
 */
function enregistrerPresences() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        alert('Veuillez sélectionner une date');
        return;
    }

    const dateStr = dateInput.value;
    const validation = validerDateSaisie(dateStr);

    if (validation.verrouille) {
        alert('Cette date est verrouillée. Déverrouillez-la d\'abord pour modifier les présences.');
        return;
    }

    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée pour le trimestre actif
    const clePresences = (typeof cle === 'function') ? cle('presences') : 'presences';
    let presences = db.getSync(clePresences, []);
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    if (!Array.isArray(presences)) presences = [];

    // ✅ CORRIGÉ (8 janvier 2026) : Obtenir coursId en premier pour filtrer correctement
    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

    // Filtrer les étudiants si un groupe est sélectionné
    let etudiantsATraiter = etudiants;
    if (groupeFiltre) {
        etudiantsATraiter = etudiants.filter(e => e.groupe === groupeFiltre);
    }

    // IMPORTANT : Sauvegarder les flags facultatifs AVANT de supprimer les anciennes présences
    // ✅ CORRIGÉ (8 janvier 2026) : Vérifier aussi coursId pour ne pas mélanger les cours
    const flagsFacultatifs = {};
    presences.forEach(p => {
        const matchCoursId = !coursId || !p.coursId || p.coursId === coursId;
        if (p.date === dateStr && p.facultatif === true && matchCoursId) {
            flagsFacultatifs[p.da] = true;
        }
    });

    // Supprimer les anciennes présences pour cette date et ces étudiants
    // ✅ CORRIGÉ (8 janvier 2026) : Protéger les présences des autres cours
    presences = presences.filter(p => {
        if (p.date !== dateStr) return true;
        // Préserver les présences d'autres cours (coursId différent)
        if (coursId && p.coursId && p.coursId !== coursId) return true;
        return !etudiantsATraiter.some(e => e.da === p.da);
    });

    // Ajouter les nouvelles présences

    // 🆕 BETA 95.1 : Utiliser les périodes au lieu des heures
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    etudiantsATraiter.forEach(etudiant => {
        // 🆕 BETA 95.1 : Chercher le select de périodes au lieu de l'input heures
        const selectPeriodes = document.getElementById(`periodes_${etudiant.da}`);
        const inputNotes = document.getElementById(`notes_${etudiant.da}`);

        if (selectPeriodes) {
            const periodesPresentes = parseInt(selectPeriodes.value) || 0;
            // Calculer les heures pour rétrocompatibilité
            const heures = (periodesPresentes * dureePeriode) / 60;
            const notes = inputNotes ? inputNotes.value.trim() : '';

            // Créer l'objet de présence
            const presenceObj = {
                date: dateStr,
                da: etudiant.da,
                periodesPresentes: periodesPresentes,  // 🆕 BETA 95.1
                heures: heures,  // Rétrocompatibilité
                notes: notes,
                coursId: coursId  // ✅ Lier la présence au cours actif
            };

            // IMPORTANT : Préserver le flag facultatif s'il existait
            if (flagsFacultatifs[etudiant.da] === true) {
                presenceObj.facultatif = true;
            }

            presences.push(presenceObj);
        }
    });

    // Protection : bloquer en mode anonymisation, rediriger en mode simulation
    if (!sauvegarderDonneesSelonMode('presences', presences)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder les présences en mode anonymisation');
        return;
    }

    // Notification visuelle
    const message = document.createElement('div');
    message.className = 'notification notification-succes';
    message.innerHTML = '✅ Présences enregistrées avec succès';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4edda;
        color: #155724;
        padding: 12px 20px;
        border-radius: 6px;
        border: 1px solid #c3e6cb;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 3000);

    console.log(`✅ Présences enregistrées pour le ${dateStr}`);
    calculerEtSauvegarderIndicesAssiduite();

    // ========== NOUVEAU : Recharger le tableau de bord ==========
    // Si le tableau de bord est visible, le rafraîchir
    const sectionTableauBord = document.getElementById('tableau-bord');
    if (sectionTableauBord && sectionTableauBord.classList.contains('active')) {
        console.log('🔄 Rafraîchissement du tableau de bord après saisie...');

        // Recharger l'aperçu si c'est la sous-section active
        const apercu = document.getElementById('tableau-bord-apercu');
        if (apercu && apercu.classList.contains('active')) {
            if (typeof chargerTableauBordApercu === 'function') {
                setTimeout(() => chargerTableauBordApercu(), 300);
            }
        }
    }

    console.log(`✅ Présences enregistrées pour le ${dateStr}`);
}

/* ===============================
   🧮 CALCULS STATISTIQUES
   =============================== */

/**
 * Calcule le total des heures de présence d'un étudiant
 */
function calculerTotalHeuresPresence(da, dateActuelle) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    return presences
        .filter(p => p.da === da && (dateActuelle === null || p.date < dateActuelle))
        .reduce((total, p) => total + (p.heures || 0), 0);
}

/**
 * Calcule le taux d'assiduité d'un étudiant
 */
function calculerTauxAssiduite(da, dateActuelle, heuresSeanceActuelle) {
    // Utiliser les indices sauvegardés qui tiennent compte des séances facultatives
    // Utiliser cle() pour namespacing par trimestre
    const cleIndices = (typeof cle === 'function') ? cle('indicesAssiduite') : 'indicesAssiduite';
    const indices = db.getSync(cleIndices, {});

    if (indices.sommatif && indices.sommatif[da] !== undefined) {
        // Retourner l'indice sommatif sauvegardé (déjà calculé avec logique facultative)
        // IMPORTANT: indices.sommatif[da] est maintenant un objet {indice, heuresPresentes, heuresOffertes, nombreSeances}
        const assiduiteSommatif = indices.sommatif[da];
        const indice = (typeof assiduiteSommatif === 'object') ? assiduiteSommatif.indice : assiduiteSommatif;
        const taux = indice * 100;
        return Math.min(Math.round(taux), 100);
    }

    // Fallback : ancienne logique si les indices ne sont pas disponibles
    const nombreSeances = calculerNombreSeances(dateActuelle);

    if (nombreSeances === 0) {
        return 100; // Pas encore de cours, donc 100%
    }

    const dureeSeance = obtenirDureeMaxSeance();
    const heuresTheoriques = nombreSeances * dureeSeance;

    if (heuresTheoriques === 0) {
        return 100;
    }

    const heuresHistorique = calculerTotalHeuresPresence(da, dateActuelle);
    const heuresReelles = heuresHistorique + heuresSeanceActuelle;

    const taux = (heuresReelles / heuresTheoriques) * 100;
    return Math.min(Math.round(taux), 100);
}

/**
 * Obtient la classe CSS selon le taux d'assiduité
 * VERSION SIMPLIFIÉE - Sans badges, juste les couleurs
 */
function obtenirClasseTaux(taux) {
    if (taux >= 95) return 'taux-excellent';
    if (taux >= 85) return 'taux-bon';
    if (taux >= 75) return 'taux-moyen';
    if (taux >= 65) return 'taux-faible';
    return 'taux-critique';
}

/* ===============================
   🔄 ACTIONS RAPIDES
   =============================== */

/**
 * Met tous les étudiants présents (périodes complètes)
 * IMPORTANT : Préserve les absences motivées RàI (0 période avec facultatif=true)
 * 🆕 BETA 95.1 : Utilise les périodes au lieu des heures
 */
function tousPresents() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) return;

    const dateStr = dateInput.value;
    const nombrePeriodesSeance = obtenirNombrePeriodesSeance(dateStr);
    const selects = document.querySelectorAll('.select-periodes');

    // Obtenir les présences existantes pour cette date
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    let nbMisPresents = 0;
    let nbAbsencesMotiveesPreservees = 0;

    selects.forEach(select => {
        if (!select.disabled) {
            const da = select.id.replace('periodes_', '');

            // Vérifier si cet étudiant a une absence motivée RàI
            const presenceExistante = presences.find(p => p.date === dateStr && p.da === da);
            const estAbsenceMotivee = presenceExistante &&
                                      presenceExistante.facultatif === true &&
                                      (presenceExistante.periodesPresentes === 0 || presenceExistante.heures === 0);

            if (estAbsenceMotivee) {
                // Ne pas toucher aux absences motivées RàI
                console.log(`   ⚪ ${da}: Absence motivée RàI préservée (0 période)`);
                nbAbsencesMotiveesPreservees++;
            } else {
                // Mettre présent (toutes les périodes)
                select.value = nombrePeriodesSeance;

                // Appliquer le code couleur
                appliquerCodeCouleurPeriodes(select, nombrePeriodesSeance);

                // Mettre à jour les stats
                mettreAJourLignePeriodes(da, dateStr, nombrePeriodesSeance);

                nbMisPresents++;
            }
        }
    });

    console.log(`✅ ${nbMisPresents} étudiant(s) mis présents (${nombrePeriodesSeance} périodes)`);
    if (nbAbsencesMotiveesPreservees > 0) {
        console.log(`   ⚪ ${nbAbsencesMotiveesPreservees} absence(s) motivée(s) RàI préservée(s)`);
    }
}

/**
 * Réinitialise la saisie (met toutes les périodes à 0 = absent)
 * 🆕 BETA 95.1 : Utilise les périodes au lieu des heures
 */
function reinitialiserSaisie() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) return;

    const dateStr = dateInput.value;
    const nombrePeriodesSeance = obtenirNombrePeriodesSeance(dateStr);

    // Pas de confirmation pour être plus rapide
    document.querySelectorAll('.select-periodes').forEach(select => {
        if (!select.disabled) {
            select.value = 0;
            appliquerCodeCouleurPeriodes(select, nombrePeriodesSeance);

            const da = select.id.replace('periodes_', '');
            mettreAJourLignePeriodes(da, dateStr, nombrePeriodesSeance);
        }
    });

    document.querySelectorAll('.input-notes').forEach(input => {
        if (!input.disabled) {
            input.value = '';
        }
    });

    console.log('✅ Saisie réinitialisée');
}

/* ===============================
   🔀 NAVIGATION ENTRE DATES
   =============================== */

/**
 * Trouve la date du cours suivant
 */
function trouverCoursSuivant(dateActuelle) {
    const datesCours = obtenirToutesDatesCours();

    for (let i = 0; i < datesCours.length; i++) {
        if (datesCours[i] > dateActuelle) {
            return datesCours[i];
        }
    }

    return null;
}

/**
 * Trouve la date du cours précédent
 */
function trouverCoursPrecedent(dateActuelle) {
    const datesCours = obtenirToutesDatesCours();

    for (let i = datesCours.length - 1; i >= 0; i--) {
        if (datesCours[i] < dateActuelle) {
            return datesCours[i];
        }
    }

    return null;
}

/**
 * Navigate vers le cours suivant
 */
function allerCoursSuivant() {
    console.log('🔵 Navigation vers le cours suivant');

    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        console.log('❌ Aucune date sélectionnée');
        return;
    }

    const dateActuelle = dateInput.value;
    const datesCours = obtenirToutesDatesCours();

    console.log(`Date actuelle: ${dateActuelle}`);
    console.log(`📚 Nombre total de dates de cours: ${datesCours.length}`);

    // Trouver le prochain cours après la date actuelle
    let coursSuivant = null;
    for (let i = 0; i < datesCours.length; i++) {
        if (datesCours[i] > dateActuelle) {
            coursSuivant = datesCours[i];
            console.log(`✅ Prochain cours trouvé: ${coursSuivant}`);
            break;
        }
    }

    if (coursSuivant) {
        dateInput.value = coursSuivant;
        initialiserSaisiePresences();
        mettreAJourBoutonsNavigation();
    } else {
        console.log('⚠️ Aucun cours suivant disponible');
    }
}

/**
 * Navigate vers le cours précédent
 */
function allerCoursPrecedent() {
    console.log('🔵 Navigation vers le cours précédent');

    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        console.log('❌ Aucune date sélectionnée');
        return;
    }

    const dateActuelle = dateInput.value;
    const datesCours = obtenirToutesDatesCours();

    console.log(`Date actuelle: ${dateActuelle}`);
    console.log(`📚 Nombre total de dates de cours: ${datesCours.length}`);

    // Trouver le cours précédent avant la date actuelle
    let coursPrecedent = null;
    for (let i = datesCours.length - 1; i >= 0; i--) {
        if (datesCours[i] < dateActuelle) {
            coursPrecedent = datesCours[i];
            console.log(`✅ Cours précédent trouvé: ${coursPrecedent}`);
            break;
        }
    }

    if (coursPrecedent) {
        dateInput.value = coursPrecedent;
        initialiserSaisiePresences();
        mettreAJourBoutonsNavigation();
    } else {
        console.log('⚠️ Aucun cours précédent disponible');
    }
}

/**
 * Met à jour l'état des boutons de navigation
 */
function mettreAJourBoutonsNavigation() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        console.log('⚠️ Pas de date pour la navigation');
        return;
    }

    const btnPrecedent = document.querySelector('[onclick="allerCoursPrecedent()"]');
    const btnSuivant = document.querySelector('[onclick="allerCoursSuivant()"]');

    const coursPrecedent = trouverCoursPrecedent(dateInput.value);
    const coursSuivant = trouverCoursSuivant(dateInput.value);

    if (btnPrecedent) {
        btnPrecedent.disabled = !coursPrecedent;
        btnPrecedent.style.opacity = coursPrecedent ? '1' : '0.5';
        btnPrecedent.style.cursor = coursPrecedent ? 'pointer' : 'not-allowed';
        console.log('Bouton précédent:', coursPrecedent ? 'actif' : 'inactif');
    }

    if (btnSuivant) {
        btnSuivant.disabled = !coursSuivant;
        btnSuivant.style.opacity = coursSuivant ? '1' : '0.5';
        btnSuivant.style.cursor = coursSuivant ? 'pointer' : 'not-allowed';
        console.log('Bouton suivant:', coursSuivant ? 'actif' : 'inactif');
    }
}

/* ===============================
   UTILITAIRES
   =============================== */

/**
 * Formate une date en français
 */
function formaterDateFrancais(dateStr) {
    const date = new Date(dateStr + 'T12:00:00');
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('fr-CA', options);
}

/**
 * Échappe les caractères HTML
 */
function echapperHtml(str) {
    // Vérifier si la fonction existe dans config.js
    if (window.echapperHtml && window.echapperHtml !== echapperHtml) {
        return window.echapperHtml(str);
    }

    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

/**
 * Ouvre la saisie de présence depuis le calendrier
 */
function ouvrirSaisiePresence(date) {
    console.log('Ouverture saisie depuis calendrier pour:', date);

    // Naviguer vers la section présences
    if (typeof sectionActive !== 'undefined' && sectionActive !== 'presences') {
        if (typeof afficherSection === 'function') {
            afficherSection('presences');
        }
    }

    // Afficher la sous-section saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('presences-saisie');
    }

    // Mettre à jour les boutons de navigation
    setTimeout(() => {
        const boutonsNav = document.querySelectorAll('.sous-navigation button');
        boutonsNav.forEach(btn => {
            btn.classList.remove('actif');
            if (btn.getAttribute('data-sous-onglet') === 'presences-saisie') {
                btn.classList.add('actif');
            }
        });

        // Pré-remplir la date
        const dateInput = document.getElementById('date-cours');
        if (dateInput) {
            dateInput.value = date;
            initialiserSaisiePresences();
            mettreAJourBoutonsNavigation();
        }
    }, 100);
}

/**
 * Obtient la dernière date de saisie (pour statistiques)
 */
function obtenirDerniereDataSaisie(da = null) {
    // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée pour le trimestre actif
    const clePresences = (typeof cle === 'function') ? cle('presences') : 'presences';
    let presences = db.getSync(clePresences, []);
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    if (!Array.isArray(presences)) presences = [];

    if (presences.length === 0) {
        return null;
    }

    let presencesFiltrees = presences;
    if (da) {
        presencesFiltrees = presences.filter(p =>
            p.da === da && p.heures !== null && p.heures !== undefined
        );
    }

    if (presencesFiltrees.length === 0) {
        return null;
    }

    const dates = presencesFiltrees.map(p => p.date);
    dates.sort();

    return dates[dates.length - 1];
}



/* ===============================
   📌 EXPORT GLOBAL ET LOGS
   =============================== */

// Rendre les fonctions disponibles globalement
window.initialiserModuleSaisiePresences = initialiserModuleSaisiePresences;
window.chargerGroupesPresences = chargerGroupesPresences;
window.initialiserSaisiePresences = initialiserSaisiePresences;
window.enregistrerPresences = enregistrerPresences;
window.calculerAssiduiteJusquADate = calculerAssiduiteJusquADate; // ✨ NOUVEAU (Beta 93)
window.calculerEtSauvegarderIndicesAssiduite = calculerEtSauvegarderIndicesAssiduite; // ✅ Export pour recalcul global
/**
 * Filtre le tableau de saisie des présences selon la recherche
 */
function filtrerTableauPresences() {
    const recherche = document.getElementById('recherche-saisie-presences');
    if (!recherche) return;

    const terme = recherche.value.toLowerCase().trim();

    // Sauvegarder la valeur de recherche pour la persistance lors de la navigation
    db.setSync('recherchePresences', terme);

    const tbody = document.getElementById('tbody-saisie-presences');
    if (!tbody) return;

    const lignes = tbody.getElementsByTagName('tr');

    for (let ligne of lignes) {
        // Ne pas filtrer la ligne de message "Sélectionnez une date"
        if (ligne.cells.length < 3) {
            continue;
        }

        const da = ligne.cells[0]?.textContent.toLowerCase() || '';
        const prenom = ligne.cells[1]?.textContent.toLowerCase() || '';
        const nom = ligne.cells[2]?.textContent.toLowerCase() || '';

        if (terme === '' || da.includes(terme) || prenom.includes(terme) || nom.includes(terme)) {
            ligne.style.display = '';
        } else {
            ligne.style.display = 'none';
        }
    }

    // Mettre à jour le compteur après filtrage
    mettreAJourCompteurPresences();
}

/**
 * Met à jour le compteur de présents/absents en temps réel
 * 🆕 BETA 95.1 : Utilise les selects de périodes au lieu des inputs d'heures
 */
function mettreAJourCompteurPresences() {
    const tbody = document.getElementById('tbody-saisie-presences');
    if (!tbody) return;

    const lignes = tbody.getElementsByTagName('tr');
    let nbPresents = 0;
    let nbAbsents = 0;
    let nbTotal = 0;

    for (let ligne of lignes) {
        // Ignorer les lignes de message (pas assez de cellules)
        if (ligne.cells.length < 4) continue;

        // Ignorer les lignes cachées par le filtre de recherche
        if (ligne.style.display === 'none') continue;

        nbTotal++;

        // 🆕 BETA 95.1 : Récupérer le select de périodes (4ème cellule, index 3)
        const cellulePeriodes = ligne.cells[3];
        const selectPeriodes = cellulePeriodes?.querySelector('select.select-periodes');

        if (selectPeriodes) {
            const periodes = parseInt(selectPeriodes.value) || 0;
            if (periodes > 0) {
                nbPresents++;
            } else {
                nbAbsents++;
            }
        }
    }

    // Calculer l'assiduité aujourd'hui
    const tauxAssiduiteAujourdhui = nbTotal > 0 ? Math.round((nbPresents / nbTotal) * 100) : 0;

    // Mettre à jour les compteurs dans le DOM
    const spanPresents = document.getElementById('nb-presents');
    const spanAbsents = document.getElementById('nb-absents');
    const spanTotal = document.getElementById('nb-total');
    const spanAssiduiteAujourdhui = document.getElementById('assiduite-aujourdhui');

    if (spanPresents) spanPresents.textContent = nbPresents;
    if (spanAbsents) spanAbsents.textContent = nbAbsents;
    if (spanTotal) spanTotal.textContent = nbTotal;
    if (spanAssiduiteAujourdhui) spanAssiduiteAujourdhui.textContent = tauxAssiduiteAujourdhui + '%';
}

window.tousPresents = tousPresents;
window.reinitialiserSaisie = reinitialiserSaisie;
window.allerCoursSuivant = allerCoursSuivant;
window.allerCoursPrecedent = allerCoursPrecedent;
window.basculerVerrouillageDate = basculerVerrouillageDate;
window.ouvrirSaisiePresence = ouvrirSaisiePresence;
window.mettreAJourLigne = mettreAJourLigne;
window.appliquerCodeCouleurSaisie = appliquerCodeCouleurSaisie;
window.filtrerTableauPresences = filtrerTableauPresences;
// 🆕 BETA 95.1 : Exports pour le comptage en périodes
window.mettreAJourLignePeriodes = mettreAJourLignePeriodes;
window.appliquerCodeCouleurPeriodes = appliquerCodeCouleurPeriodes;
window.obtenirNombrePeriodesSeance = obtenirNombrePeriodesSeance;
window.genererOptionsPeriodesPresentes = genererOptionsPeriodesPresentes;

/* ===============================
   🔄 RECHARGEMENT AUTOMATIQUE
   =============================== */

/**
 * Surveille l'activation de la sous-section 'presences-saisie'
 * et recharge automatiquement le tableau pour refléter les changements
 * faits depuis d'autres sections (ex: modifications d'interventions RàI)
 */
document.addEventListener('DOMContentLoaded', function() {
    const sectionSaisie = document.getElementById('presences-saisie');
    if (!sectionSaisie) return;

    // Observer les changements de la classe 'active' sur la sous-section
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Si la sous-section vient de devenir active
                if (sectionSaisie.classList.contains('active')) {
                    const dateInput = document.getElementById('date-cours');
                    if (dateInput && dateInput.value) {
                        console.log('🔄 Rechargement automatique du tableau de présences');
                        initialiserSaisiePresences();
                    }
                }
            }
        });
    });

    // Commencer à observer
    observer.observe(sectionSaisie, {
        attributes: true,
        attributeFilter: ['class']
    });

    console.log('✅ Observer de rechargement automatique activé pour presences-saisie');
});

console.log('✅ Module saisie-presences.js chargé (version refondée complète)');