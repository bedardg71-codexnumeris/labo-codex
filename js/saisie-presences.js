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

(function() {
'use strict';

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de saisie des présences
 * Appelée par main.js au chargement
 */
/* ===============================
   CALCUL DES INDICES D'ASSIDUITÉ
   #224 : Fonctions déplacées vers indices.js
   - calculerAssiduite(da, dateLimite) — canonique unique
   - calculerEtSauvegarderIndicesAssiduite() — orchestrateur
   - calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle) — preview temps réel
   =============================== */

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

    // 🆕 FIX (16 fév 2026) : Régénérer le calendrier pour s'assurer qu'il reflète
    // tous les groupes-cours (synchronisation horaireHebdo incluse)
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    chargerGroupesPresences();
    verifierConfigurationFormatHoraire();

    // 🆕 BETA 95.7 (22 jan) : Restaurer les paramètres persistés
    const dateInput = document.getElementById('date-cours');
    const selectGroupe = document.getElementById('selectGroupePresences');
    const selectTri = document.getElementById('selectTriPresences');

    const dateSauvegardee = db.getSync('presences_date', '');
    const groupeSauvegarde = db.getSync('presences_groupe', '');
    const triSauvegarde = db.getSync('presences_tri', 'nom');

    // Restaurer la date (seulement si valide et pas dans le futur)
    if (dateInput && dateSauvegardee) {
        const aujourdhui = new Date().toISOString().split('T')[0];
        if (dateSauvegardee <= aujourdhui) {
            dateInput.value = dateSauvegardee;
        }
    }

    // Restaurer le groupe
    if (selectGroupe && groupeSauvegarde) {
        selectGroupe.value = groupeSauvegarde;
    }

    // Restaurer le tri
    if (selectTri && triSauvegarde) {
        selectTri.value = triSauvegarde;
    }

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
 * 🆕 BETA 95.7 (23 jan) : Utiliser uniquement les étudiants du groupe-cours ACTIF
 */
function chargerGroupesPresences() {
    const selectGroupe = document.getElementById('selectGroupePresences');
    if (!selectGroupe) {
        console.log('⚠️ Element selectGroupePresences non trouvé');
        return;
    }

    // 🆕 BETA 95.7 : Utiliser UNIQUEMENT les étudiants du groupe-cours actif
    // Évite la confusion entre les groupes-cours différents
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants') || [];

    // Extraire les groupes uniques (sous-groupes à l'intérieur du groupe-cours)
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe && e.groupe.trim() !== '') {
            groupesSet.add(e.groupe);
        }
    });

    const groupes = Array.from(groupesSet).sort();

    // Remplir le select
    // 🆕 BETA 95.7 : Si un seul groupe, ne pas afficher le filtre "Tous les groupes"
    if (groupes.length <= 1) {
        selectGroupe.innerHTML = '<option value="">Tous</option>';
        selectGroupe.classList.add('u-hide'); // Masquer si inutile
    } else {
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';
        groupes.forEach(groupe => {
            const option = document.createElement('option');
            option.value = groupe;
            option.textContent = groupe;
            selectGroupe.appendChild(option);
        });
        selectGroupe.classList.remove('u-hide');
    }

    console.log(`✅ ${groupes.length} groupes chargés (groupe-cours actif: ${etudiants.length} étudiants)`);
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
            if ((jour.statut === 'cours' || jour.statut === 'jour-ouvrable') && joursAvecSeances.has(jourSemaineLower)) {
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

    return totalHeures || 2;
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
        // 🆕 FIX (16 fév 2026) : En multi-cours, le calendrier partagé peut ne pas
        // refléter l'horaire de tous les groupes-cours. Si le jour est ouvrable,
        // vérifier l'horaire spécifique du cours actif avant de rejeter.
        if (infoJour.statut === 'jour-ouvrable' && typeof obtenirSeancesHoraire === 'function') {
            const seancesHoraire = obtenirSeancesHoraire();
            if (seancesHoraire && seancesHoraire.length > 0) {
                const joursNoms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
                const jourSemaine = joursNoms[new Date(dateStr + 'T00:00:00').getDay()];
                const aCoursAujourdhui = seancesHoraire.some(s => s.jour && s.jour.toLowerCase() === jourSemaine);
                if (aCoursAujourdhui) {
                    console.log(`✅ [validerDateSaisie] ${dateStr} (${jourSemaine}) : jour-ouvrable dans le calendrier mais cours confirmé par l'horaire du cours actif`);
                    // Continuer la validation normalement
                } else {
                    return { valide: false, raison: 'pas-cours', verrouille: false };
                }
            } else {
                return { valide: false, raison: 'pas-cours', verrouille: false };
            }
        } else {
            return { valide: false, raison: 'pas-cours', verrouille: false };
        }
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
        // Déverrouillage
        datesVerrouillees.splice(index, 1);
        console.log('🔓 Date déverrouillée:', dateStr);
    } else {
        // 🆕 FIX (3 fév 2026) : Sauvegarder les présences AVANT de verrouiller
        sauvegarderPresencesSansValidation(dateStr);
        datesVerrouillees.push(dateStr);
        console.log('🔒 Date verrouillée:', dateStr);
    }

    db.setSync('datesVerrouillees', datesVerrouillees);
    initialiserSaisiePresences();
}

/**
 * Bascule le verrouillage de la date actuellement affichée (appelé par le checkbox HTML)
 */
function basculerVerrouillageDateActive() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) return;
    basculerVerrouillageDate(dateInput.value);
}

/**
 * Met à jour l'affichage du contrôle de verrouillage
 */
function mettreAJourControleVerrouillage(dateStr, estVerrouille) {
    const conteneur = document.getElementById('controle-verrouillage-presences');
    const checkbox = document.getElementById('checkbox-verrouillage-presences');
    const icone = document.getElementById('icone-verrouillage-presences');
    const texte = document.getElementById('texte-verrouillage-presences');
    if (!conteneur) return;

    if (!dateStr) {
        conteneur.classList.add('u-hide');
        return;
    }

    checkbox.checked = estVerrouille;
    icone.textContent = estVerrouille ? '🔒' : '🔓';
    texte.textContent = estVerrouille ? 'Verrouillée' : 'Verrouiller';

    conteneur.classList.remove('u-hide');

    // Refléter l'état de verrouillage sur la bordure du compteur
    const compteur = document.getElementById('compteur-presences');
    if (compteur) {
        compteur.style.borderLeftColor = estVerrouille
            ? 'var(--texte-muted, #5a7a88)'
            : 'var(--accent-primaire)';
    }
}

window.basculerVerrouillageDateActive = basculerVerrouillageDateActive;

/**
 * 🆕 FIX (3 fév 2026) : Sauvegarde les présences sans validation
 * Utilisé lors du verrouillage pour ne pas perdre les données saisies
 */
function sauvegarderPresencesSansValidation(dateStr) {
    console.log('💾 Sauvegarde des présences avant verrouillage pour:', dateStr);

    // Obtenir les étudiants du cours actif
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');

    if (!etudiants || etudiants.length === 0) {
        console.warn('⚠️ Aucun étudiant à sauvegarder');
        return;
    }

    // Lire TOUTES les présences existantes
    const clePresences = cle('presences');
    let presences = db.getSync(clePresences, []);
    if (!Array.isArray(presences)) presences = [];

    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    // Filtrer par sous-groupe si sélectionné
    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';
    let etudiantsATraiter = groupeFiltre
        ? etudiants.filter(e => e.groupe === groupeFiltre)
        : etudiants;

    // Préserver les flags facultatifs
    const flagsFacultatifs = {};
    presences.forEach(p => {
        const matchCoursId = !coursId || !p.coursId || p.coursId === coursId;
        if (p.date === dateStr && p.facultatif === true && matchCoursId) {
            flagsFacultatifs[p.da] = true;
        }
    });

    // Supprimer les anciennes présences pour cette date et ce cours
    presences = presences.filter(p => {
        if (p.date !== dateStr) return true;
        if (coursId && p.coursId && p.coursId !== coursId) return true;
        return !etudiantsATraiter.some(e => e.da === p.da);
    });

    // Ajouter les nouvelles présences depuis le formulaire
    let compteur = 0;
    etudiantsATraiter.forEach(etudiant => {
        const inputPeriodes = document.getElementById(`periodes_${etudiant.da}`);
        const inputNotes = document.getElementById(`notes_${etudiant.da}`);

        if (inputPeriodes) {
            const periodesPresentes = parseFloat(inputPeriodes.value) || 0;
            const heures = (periodesPresentes * dureePeriode) / 60;
            const notes = inputNotes ? inputNotes.value.trim() : '';

            const presenceObj = {
                date: dateStr,
                da: etudiant.da,
                periodesPresentes: periodesPresentes,
                heures: heures,
                notes: notes,
                coursId: coursId
            };

            if (flagsFacultatifs[etudiant.da] === true) {
                presenceObj.facultatif = true;
            }

            presences.push(presenceObj);
            compteur++;
        }
    });

    // Sauvegarder
    db.setSync(clePresences, presences);
    console.log(`✅ ${compteur} présences sauvegardées pour ${dateStr}`);
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
        alerteDiv.classList.remove('u-hide');
        alerteDiv.innerHTML = `
            <div class="alerte alerte-avertissement">
                <strong>⚠️ Configuration incomplète</strong><br>
                L'horaire des cours n'est pas configuré. 
                <a href="#" data-prevent data-action="naviguerVersReglagesTrimestre">
                    Configurer l'horaire →
                </a>
            </div>`;
    } else {
        alerteDiv.classList.add('u-hide');
    }
}

/* ===============================
   📝 INTERFACE DE SAISIE
   =============================== */

/**
 * Initialise la saisie des présences pour la date sélectionnée
 * 🆕 BETA 95.7 (22 jan) : Persistance des paramètres (date, groupe, tri)
 */
function initialiserSaisiePresences() {
    // 🆕 FIX #220 (3 mars 2026) : Régénérer les séances complètes du groupe-cours actif
    // pour s'assurer que le cache reflète l'horaire spécifique au groupe-cours.
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes(null);
    }

    const dateInput = document.getElementById('date-cours');
    const selectGroupe = document.getElementById('selectGroupePresences');
    const selectTri = document.getElementById('selectTriPresences');

    // 🆕 Sauvegarder les paramètres actuels pour persistance
    if (dateInput && dateInput.value) {
        db.setSync('presences_date', dateInput.value);
    }
    if (selectGroupe) {
        db.setSync('presences_groupe', selectGroupe.value);
    }
    if (selectTri) {
        db.setSync('presences_tri', selectTri.value);
    }

    if (!dateInput || !dateInput.value) {
        const tbody = document.getElementById('tbody-saisie-presences');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="u-text-center">Sélectionne une date</td></tr>';
        }
        return;
    }

    const validation = validerDateSaisie(dateInput.value);

    if (!validation.valide) {
        let messageTableau = '';
        let messageCompteur = '';
        switch (validation.raison) {
            case 'vide':
                messageTableau = 'Veuillez sélectionner une date';
                messageCompteur = 'Sélectionne une date';
                break;
            case 'pas-cours':
                messageTableau = ''; // Message affiché uniquement dans la carte de statistiques
                messageCompteur = 'Pas de cours pour ce groupe à cette date';
                break;
            case 'future':
                messageTableau = 'Cette date est dans le futur';
                messageCompteur = 'Date future';
                break;
            case 'hors-calendrier':
                messageTableau = 'Cette date est hors du calendrier scolaire';
                messageCompteur = 'Hors calendrier';
                break;
            default:
                messageTableau = 'Date invalide';
                messageCompteur = 'Date invalide';
        }

        const tbody = document.getElementById('tbody-saisie-presences');
        if (tbody) {
            if (messageTableau) {
                tbody.innerHTML = `<tr><td colspan="8" class="u-text-center-erreur">${messageTableau}</td></tr>`;
            } else {
                tbody.innerHTML = '';
            }
        }

        // 🆕 FIX (3 fév 2026) : Afficher message explicite dans la carte de statistiques
        afficherMessageCompteurPresences(messageCompteur);

        mettreAJourEnteteDateSeance('');
        mettreAJourControleVerrouillage(null, false);
        return;
    }

    chargerTableauPresences(dateInput.value, validation.verrouille);
    mettreAJourEnteteDateSeance(dateInput.value);
    mettreAJourControleVerrouillage(dateInput.value, validation.verrouille);
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
    const infoSeance = document.getElementById('info-seance');
    if (!infoSeance) return;

    if (!dateStr) {
        infoSeance.classList.add('u-hide');
        infoSeance.textContent = '';
        return;
    }

    const infoJour = obtenirInfosJourCalendrier(dateStr);

    if (!infoJour) {
        infoSeance.classList.add('u-hide');
        infoSeance.textContent = '';
        return;
    }

    const heures = obtenirHeuresSeance(dateStr);
    const heuresFormatees = formaterHeuresAffichage(heures);
    const rangSeance = obtenirRangSeanceDansSemaine(dateStr);

    let message = '';

    // 🆕 FIX (16 fév 2026) : Traiter 'jour-ouvrable' comme 'cours' si le cours actif
    // a effectivement une séance ce jour (calendrier périmé en multi-cours)
    let statutEffectif = infoJour.statut;
    if (statutEffectif === 'jour-ouvrable' && typeof obtenirSeancesHoraire === 'function') {
        const seancesHoraire = obtenirSeancesHoraire();
        const joursNoms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const jourSemaine = joursNoms[new Date(dateStr + 'T00:00:00').getDay()];
        if (seancesHoraire && seancesHoraire.some(s => s.jour && s.jour.toLowerCase() === jourSemaine)) {
            statutEffectif = 'cours';
        }
    }

    if (statutEffectif === 'cours') {
        if (rangSeance && infoJour.numeroSemaine) {
            message = `${rangSeance.ordinal} séance de la semaine ${infoJour.numeroSemaine}`;
        } else if (infoJour.numeroSemaine) {
            message = `Semaine ${infoJour.numeroSemaine}`;
        }

        if (heuresFormatees) {
            message += message ? ` (${heuresFormatees})` : heuresFormatees;
        }

    } else if (statutEffectif === 'reprise') {
        if (rangSeance && infoJour.numeroSemaine) {
            message = `REPRISE — ${rangSeance.ordinal} séance de la semaine ${infoJour.numeroSemaine}`;
        } else {
            message = 'REPRISE';
        }

        if (infoJour.jourRemplace) {
            message += ` (horaire du ${infoJour.jourRemplace.toLowerCase()})`;
        }

        if (heuresFormatees) {
            message += ` — ${heuresFormatees}`;
        }

    } else if (infoJour.statut === 'conge') {
        message = 'CONGÉ';
        if (infoJour.motif) {
            message += ` (${infoJour.motif})`;
        }
    }

    if (message) {
        // Préfixer la date formatée (ex: "23 février 2026 — 2ème séance...")
        const dateObj = new Date(dateStr + 'T12:00:00');
        const dateFR = dateObj.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
        infoSeance.textContent = `${dateFR} — ${message}`;
        infoSeance.classList.remove('u-hide');
    } else {
        infoSeance.classList.add('u-hide');
        infoSeance.textContent = '';
    }
}

/**
 * Charge et affiche le tableau des présences avec toutes les fonctionnalités
 */
function chargerTableauPresences(dateStr, estVerrouille) {
    // 🆕 FIX (3 fév 2026) : Restaurer le compteur si un message était affiché
    restaurerCompteurPresences();

    const tbody = document.getElementById('tbody-saisie-presences');
    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';

    // 🆕 BETA 95.7 (23 jan) : Utiliser UNIQUEMENT les étudiants du groupe-cours actif
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
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
            const tauxA = calculerAssiduitePourAffichage(a.da, dateStr, 0).taux;
            const tauxB = calculerAssiduitePourAffichage(b.da, dateStr, 0).taux;
            return tauxA - tauxB;
        });
    } else if (criterieTri === 'assiduite-decroissant') {
        // Tri par assiduité décroissante (plus élevé d'abord)
        etudiantsFiltres.sort((a, b) => {
            const tauxA = calculerAssiduitePourAffichage(a.da, dateStr, 0).taux;
            const tauxB = calculerAssiduitePourAffichage(b.da, dateStr, 0).taux;
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

        const notes = presenceExistante ? (presenceExistante.notes || '') : '';
        const estFacultatif = presenceExistante ? (presenceExistante.facultatif === true) : false;

        // #224 : Calcul via fonction canonique dans indices.js
        const resultatAffichage = calculerAssiduitePourAffichage(etudiant.da, dateStr, periodesPresence);
        const totalPeriodesPresentes = resultatAffichage.totalPeriodesPresentes;
        const tauxAssiduiteActuel = resultatAffichage.taux;

        const tr = document.createElement('tr');
        if (typeof estEtudiantExclu === 'function' && estEtudiantExclu(etudiant)) {
            tr.classList.add('etudiant-inactif');
        }

        // 🆕 BETA 95.7 : Input numérique pour périodes (permet fractions comme 1.5)
        const inputPeriodesHTML = `
            <input type="number"
                   class="controle-form input-periodes ${obtenirClasseSaisiePeriodes(periodesPresence, nombrePeriodesSeance, estFacultatif)}"
                   id="periodes_${etudiant.da}"
                   value="${periodesPresence}"
                   min="0"
                   max="${nombrePeriodesSeance}"
                   step="0.5"
                   style="width: 70px; text-align: center;"
                   ${estVerrouille ? 'disabled' : ''}
                   data-on-change="mettreAJourLignePeriodesHandler" data-da="${etudiant.da}" data-date-str="${dateStr}" data-nb-periodes="${nombrePeriodesSeance}"
            >/<span class="max-periodes">${nombrePeriodesSeance}</span>`;

        // Structure : DA | Prénom | Nom | Présence | Notes | Total pér. | Assiduité
        tr.innerHTML = `
            <td>${echapperHtml(etudiant.da)}</td>
            <td>${echapperHtml(etudiant.prenom)}</td>
            <td>${echapperHtml(etudiant.nom)}</td>
            <td style="white-space: nowrap;">${inputPeriodesHTML}</td>
            <td>
                <input type="text"
                       class="controle-form input-notes"
                       id="notes_${etudiant.da}"
                       value="${echapperHtml(notes)}"
                       placeholder="Notes..."
                       ${estVerrouille ? 'disabled' : ''}>
            </td>
            <td><span id="heuresHisto_${etudiant.da}">${Math.round(totalPeriodesPresentes)} pér.</span></td>
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
                        data-action="tousPresents"
                        ${estVerrouille ? 'disabled' : ''}
                        title="Mettre tous présents (${nombrePeriodesSeance} périodes)">
                    Tous ${nombrePeriodesSeance} pér.
                </button>
                <button class="btn btn-annuler btn-tres-compact"
                        data-action="reinitialiserSaisie"
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
    const btnEnregistrer = document.querySelector('[data-action="enregistrerPresences"]');
    const btnAnnuler = document.querySelector('#actions-presences-bar .btn-annuler');

    if (btnTousPresents) btnTousPresents.disabled = estVerrouille;
    if (btnReinit) btnReinit.disabled = estVerrouille;
    if (btnEnregistrer) btnEnregistrer.disabled = estVerrouille;
    if (btnAnnuler) btnAnnuler.disabled = estVerrouille;
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
 * 🆕 BETA 95.7 : Applique le code couleur à un input de périodes
 */
function appliquerCodeCouleurPeriodes(inputPeriodes, periodesMax) {
    if (!inputPeriodes) return;

    // parseFloat pour supporter les fractions
    const valeur = parseFloat(inputPeriodes.value) || 0;

    // Retirer toutes les classes
    inputPeriodes.classList.remove('saisie-absence', 'saisie-absence-motivee', 'saisie-retard', 'saisie-present', 'saisie-vide');

    // Appliquer la bonne classe
    if (valeur === 0) {
        inputPeriodes.classList.add('saisie-absence');
    } else if (valeur < periodesMax) {
        inputPeriodes.classList.add('saisie-retard');
    } else {
        inputPeriodes.classList.add('saisie-present');
    }
}

/**
 * 🆕 BETA 95.1 : Met à jour les statistiques d'une ligne (version périodes)
 */
function mettreAJourLignePeriodes(da, dateStr, nombrePeriodesMax) {
    const inputPeriodes = document.getElementById(`periodes_${da}`);
    const spanTaux = document.getElementById(`taux_${da}`);
    const spanHeuresHisto = document.getElementById(`heuresHisto_${da}`);

    if (!inputPeriodes || !spanTaux) return;

    // 🆕 BETA 95.7 : parseFloat pour supporter les fractions (1.5, etc.)
    let periodesSeance = parseFloat(inputPeriodes.value) || 0;

    // Limiter aux bornes valides
    if (periodesSeance < 0) periodesSeance = 0;
    if (periodesSeance > nombrePeriodesMax) periodesSeance = nombrePeriodesMax;
    inputPeriodes.value = periodesSeance;

    // Appliquer le code couleur
    appliquerCodeCouleurPeriodes(inputPeriodes, nombrePeriodesMax);

    // #224 : Calcul via fonction canonique dans indices.js
    var resultatAff = calculerAssiduitePourAffichage(da, dateStr, periodesSeance);

    if (spanHeuresHisto) {
        spanHeuresHisto.textContent = resultatAff.totalPeriodesPresentes + ' pér.';
    }

    spanTaux.textContent = resultatAff.taux + '%';
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

    // #224 : Convertir heures → périodes pour la fonction canonique
    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
    var periodesSeance = (heuresSeance * 60) / dureePeriode;
    var resultatAff = calculerAssiduitePourAffichage(da, dateStr, periodesSeance);

    if (spanHeuresHisto) {
        spanHeuresHisto.textContent = resultatAff.totalPeriodesPresentes + ' pér.';
    }

    spanTaux.textContent = resultatAff.taux + '%';
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

    // 🆕 BETA 95.7 (23 jan) : Utiliser UNIQUEMENT les étudiants du groupe-cours actif
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée pour le trimestre actif
    const clePresences = cle('presences');
    let presences = db.getSync(clePresences, []);
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    if (!Array.isArray(presences)) presences = [];

    // ✅ CORRIGÉ (8 janvier 2026) : Obtenir coursId en premier pour filtrer correctement
    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

    // Filtrer les étudiants si un sous-groupe est sélectionné (à l'intérieur du groupe-cours)
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
        // 🆕 BETA 95.7 : Chercher l'input de périodes
        const inputPeriodes = document.getElementById(`periodes_${etudiant.da}`);
        const inputNotes = document.getElementById(`notes_${etudiant.da}`);

        if (inputPeriodes) {
            // parseFloat pour supporter les fractions (1.5, etc.)
            const periodesPresentes = parseFloat(inputPeriodes.value) || 0;
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
        background: var(--alerte-fond-succes, #d4edda);
        color: var(--alerte-texte-succes);
        padding: 12px 20px;
        border-radius: 6px;
        border: 1px solid var(--alerte-fond-succes, #c3e6cb);
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

/* #224 : calculerTotalPeriodesAvecCalendrier, calculerTotalHeuresPresence,
   calculerTauxAssiduite supprimées — remplacées par calculerAssiduitePourAffichage() dans indices.js */

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
    // 🆕 BETA 95.7 : Utiliser .input-periodes au lieu de .select-periodes
    const inputs = document.querySelectorAll('.input-periodes');

    // Obtenir les présences existantes pour cette date
    // ✅ CORRIGÉ (22 janvier 2026) : S'assurer que presences est un tableau
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    let nbMisPresents = 0;
    let nbAbsencesMotiveesPreservees = 0;

    inputs.forEach(input => {
        if (!input.disabled) {
            const da = input.id.replace('periodes_', '');

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
                input.value = nombrePeriodesSeance;

                // Appliquer le code couleur
                appliquerCodeCouleurPeriodes(input, nombrePeriodesSeance);

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
    // 🆕 BETA 95.7 : Utiliser .input-periodes au lieu de .select-periodes
    document.querySelectorAll('.input-periodes').forEach(input => {
        if (!input.disabled) {
            input.value = 0;
            appliquerCodeCouleurPeriodes(input, nombrePeriodesSeance);

            const da = input.id.replace('periodes_', '');
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

    const btnPrecedent = document.querySelector('[data-action="allerCoursPrecedent"]');
    const btnSuivant = document.querySelector('[data-action="allerCoursSuivant"]');

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

// formaterDateFrancais() — supprimée, utilise formaterDateComplete() de main.js (Beta 97.1 #68)

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
    const clePresences = cle('presences');
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
   🔗 WRAPPERS DÉLÉGATION (Phase 5 — Lot 5.14c)
   =============================== */

function naviguerVersReglagesTrimestre(el) {
    if (typeof afficherSection === 'function') afficherSection('reglages');
    if (typeof afficherSousSection === 'function') afficherSousSection('reglages-trimestre');
}

function mettreAJourLignePeriodesHandler(el) {
    mettreAJourLignePeriodes(el.dataset.da, el.dataset.dateStr, parseInt(el.dataset.nbPeriodes));
}

/* ===============================
   📌 EXPORT GLOBAL ET LOGS
   =============================== */

// Rendre les fonctions disponibles globalement
window.naviguerVersReglagesTrimestre = naviguerVersReglagesTrimestre;
window.mettreAJourLignePeriodesHandler = mettreAJourLignePeriodesHandler;
window.initialiserModuleSaisiePresences = initialiserModuleSaisiePresences;
window.chargerGroupesPresences = chargerGroupesPresences;
window.initialiserSaisiePresences = initialiserSaisiePresences;
window.enregistrerPresences = enregistrerPresences;
// #224 : calculerAssiduiteJusquADate et calculerEtSauvegarderIndicesAssiduite déplacées vers indices.js
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
        // Ne pas filtrer la ligne de message "Sélectionne une date"
        if (ligne.cells.length < 3) {
            continue;
        }

        const da = ligne.cells[0]?.textContent.toLowerCase() || '';
        const prenom = ligne.cells[1]?.textContent.toLowerCase() || '';
        const nom = ligne.cells[2]?.textContent.toLowerCase() || '';

        if (terme === '' || da.includes(terme) || prenom.includes(terme) || nom.includes(terme)) {
            ligne.classList.remove('u-hide');
        } else {
            ligne.classList.add('u-hide');
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
        if (ligne.classList.contains('u-hide')) continue;

        nbTotal++;

        // 🆕 BETA 95.7 : Récupérer l'input de périodes (4ème cellule, index 3)
        const cellulePeriodes = ligne.cells[3];
        const inputPeriodes = cellulePeriodes?.querySelector('input.input-periodes');

        if (inputPeriodes) {
            const periodes = parseFloat(inputPeriodes.value) || 0;
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

    // Restaurer l'affichage normal du compteur (au cas où un message était affiché)
    const compteur = document.getElementById('compteur-presences');
    if (compteur) {
        compteur.style.borderLeftColor = 'var(--accent-primaire)';
        compteur.style.background = 'var(--bleu-tres-pale)';
    }
}

/**
 * 🆕 FIX (3 fév 2026) : Affiche un message dans la carte de statistiques
 * Utilisé quand il n'y a pas de cours pour ce groupe à cette date
 */
function afficherMessageCompteurPresences(message) {
    const compteur = document.getElementById('compteur-presences');
    if (!compteur) return;

    // Changer le style pour indiquer un état spécial
    compteur.style.borderLeftColor = 'var(--jaune-principal, #f0ad4e)';
    compteur.style.background = 'var(--jaune-tres-pale, #fff8e1)';

    // Remplacer le contenu par le message (sans le contrôle de verrouillage)
    compteur.innerHTML = `
        <span style="color: var(--texte-secondaire); font-style: italic;">
            ${message}
        </span>
    `;
}

/**
 * Restaure l'affichage normal de la carte de statistiques
 */
function restaurerCompteurPresences() {
    const compteur = document.getElementById('compteur-presences');
    if (!compteur) return;

    compteur.style.borderLeftColor = 'var(--accent-primaire)';
    compteur.style.background = 'var(--bleu-tres-pale)';

    compteur.innerHTML = `
        <div id="info-seance" class="u-hide" style="font-size: 0.85rem; opacity: 0.8;"></div>
        <div style="display: flex; align-items: center; gap: 30px; flex-wrap: wrap;">
            <span>Présents : <span id="nb-presents">0</span></span>
            <span>Absents : <span id="nb-absents">0</span></span>
            <span>Total : <span id="nb-total">0</span></span>
            <span>Assiduité aujourd'hui : <span id="assiduite-aujourdhui">0%</span></span>
            <span id="actions-presences-bar" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
                <button class="btn btn-confirmer btn-compact" data-action="enregistrerPresences">Enregistrer</button>
                <button class="btn btn-annuler btn-compact" data-action="afficherSousSection" data-param="presences-apercu">Annuler</button>
                <span id="controle-verrouillage-presences" class="u-hide" style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
                    <input type="checkbox" id="checkbox-verrouillage-presences"
                           style="width: 16px; height: 16px; accent-color: var(--bleu-principal, #1a73e8); cursor: pointer;"
                           data-on-change="basculerVerrouillageDateActive">
                    <label for="checkbox-verrouillage-presences" style="cursor: pointer; user-select: none; white-space: nowrap;">
                        <span id="icone-verrouillage-presences">🔓</span>
                        <span id="texte-verrouillage-presences">Verrouiller</span>
                    </label>
                </span>
            </span>
        </div>
    `;
}

window.tousPresents = tousPresents;
window.reinitialiserSaisie = reinitialiserSaisie;
window.allerCoursSuivant = allerCoursSuivant;
window.allerCoursPrecedent = allerCoursPrecedent;
window.mettreAJourBoutonsNavigation = mettreAJourBoutonsNavigation;
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

})();
