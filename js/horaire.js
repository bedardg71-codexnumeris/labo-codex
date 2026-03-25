/* ===============================
   MODULE 10: GESTION DE L'HORAIRE DES COURS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration de l'horaire hebdomadaire :
   format des séances (2×2h ou 1×4h), jours, heures et locaux.
   
   Contenu de ce module:
   - Sélection du format horaire
   - Configuration des séances (jour, heures, local)
   - Affichage des séances configurées
   - Modification et suppression de séances
   - Sauvegarde dans localStorage
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - input[name="formatHoraire"] : Radio buttons pour le format
   - #seancesContainer : Conteneur des séances existantes
   - #formAjoutSeance : Formulaire d'ajout
   - #seancesFormContainer : Conteneur du formulaire dynamique
   - #btnConfirmerSeances : Bouton de confirmation
   - Champs du formulaire : voir afficherFormulaireSeances()
   
   LocalStorage utilisé:
   - 'formatHoraire' : Format sélectionné ('2x2' ou '1x4')
   - 'seancesHoraire' : Array des séances configurées
   =============================== */

/* ===============================
   🆕 BETA 95 : HORAIRES PAR COURS-GROUPE
   =============================== */

/**
 * Génère la clé de stockage pour l'horaire d'un cours
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {string} - Clé de stockage (ex: "seancesHoraire_601-101-h2026-94")
 */
function cleHoraire(coursId) {
    const id = coursId || (typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null);
    if (id) {
        return `seancesHoraire_${id}`;
    }
    // Fallback sur clé globale namespacée par trimestre
    return cle('seancesHoraire');
}

/**
 * Génère la clé de stockage pour les séances complètes d'un cours
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {string} - Clé de stockage (ex: "seancesCompletes_601-101-h2026-94")
 */
function cleSeancesCompletes(coursId) {
    // 🆕 FIX (3 fév 2026) : Utiliser groupeCoursId pour différencier les groupes
    // Chaque groupe-cours a son propre horaire et donc ses propres dates de séances
    const groupeCoursActif = db.getSync('groupeCoursActif', null);
    const groupeCoursId = groupeCoursActif?.id || '';

    if (groupeCoursId) {
        // Clé unique par groupe-cours
        return `seancesCompletes_gc_${groupeCoursId}`;
    }

    // Fallback sur coursId si pas de groupe-cours actif
    const id = coursId || (typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null);
    if (id) {
        return `seancesCompletes_${id}`;
    }

    // Fallback sur clé globale namespacée par trimestre
    return cle('seancesCompletes');
}

/**
 * Obtient les séances horaire d'un cours spécifique
 * 🆕 BETA 95.6 : Priorité à l'entité Horaire du groupe-cours actif
 *
 * Ordre de recherche (MODIFIÉ Beta 95.6) :
 * 1. Entité Horaire via groupe-cours actif (PRIORITAIRE - chaque groupe a son horaire)
 * 2. seancesHoraire_{coursId} (clé par cours, fallback)
 * 3. {trimestre}_horaireHebdo (clé V2 namespacée)
 * 4. {trimestre}_seancesHoraire (clé legacy namespacée)
 * 5. seancesHoraire (clé legacy non namespacée)
 *
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {Array} - Séances horaire du cours
 */
function obtenirSeancesHoraire(coursId) {
    // 1. 🆕 BETA 95.6 : PRIORITÉ à l'entité Horaire du groupe-cours actif
    // Chaque groupe-cours peut avoir son propre horaire (Lun-Jeu vs Mar-Ven)
    try {
        const groupeCoursActif = db.getSync('groupeCoursActif', null);

        if (groupeCoursActif) {
            // 1a. Utiliser horaireId direct
            if (groupeCoursActif.horaireId) {
                const cleHoraires = cle('horaires');
                const horaires = db.getSync(cleHoraires, []);
                const horaire = horaires.find(h => h.id === groupeCoursActif.horaireId);
                if (horaire && horaire.seances && horaire.seances.length > 0) {
                    console.log('[Horaire] Séances depuis entité horaire:', horaire.nom, horaire.seances.map(s => s.jour));
                    return horaire.seances;
                }
            }

            // 1b. 🆕 FIX #220 (3 mars 2026) : Si pas de horaireId direct, chercher
            // dans la liste des groupes-cours pour récupérer le horaireId
            const cleGC = cle('groupesCours');
            const groupesCours = db.getSync(cleGC, []);
            const gc = groupesCours.find(g => g.id === groupeCoursActif.id);
            if (gc && gc.horaireId) {
                const cleHoraires = cle('horaires');
                const horaires = db.getSync(cleHoraires, []);
                const horaire = horaires.find(h => h.id === gc.horaireId);
                if (horaire && horaire.seances && horaire.seances.length > 0) {
                    console.log('[Horaire] Séances depuis entité horaire (via GC):', horaire.nom, horaire.seances.map(s => s.jour));
                    return horaire.seances;
                }
            }
        }
    } catch (e) {
        console.warn('[Horaire] Lecture entité horaire échouée:', e);
    }

    // 2. Fallback sur clé spécifique au cours
    const cleCours = cleHoraire(coursId);
    let seances = db.getSync(cleCours, null);
    if (seances && seances.length > 0) {
        console.log('[Horaire] Séances depuis clé cours:', cleCours);
        return seances;
    }

    // 3. Fallback sur horaireHebdo (format V2)
    seances = db.getSync(cle('horaireHebdo'), null);
    if (seances && seances.length > 0) {
        console.log('[Horaire] Séances depuis horaireHebdo namespacé');
        return seances;
    }

    // 4. Fallback sur seancesHoraire namespacé par trimestre
    seances = db.getSync(cle('seancesHoraire'), null);
    if (seances && seances.length > 0) {
        console.log('[Horaire] Séances depuis seancesHoraire namespacé');
        return seances;
    }

    // 5. Fallback sur clé legacy non namespacée
    seances = db.getSync('seancesHoraire', []);
    console.log('[Horaire] Séances depuis clé legacy seancesHoraire');
    return seances || [];
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de gestion de l'horaire
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Affiche les séances existantes
 * 3. Génère les séances complètes du trimestre
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleHoraire() {
    console.log('🕐 Initialisation du module Horaire');

    // Vérifier que nous sommes dans la bonne section
    const container = document.getElementById('seancesContainer');
    if (!container) {
        console.log('   ⚠️  Section horaire non active, initialisation reportée');
        return;
    }

    // Afficher les séances existantes
    afficherSeancesExistantes();

    // Générer les séances complètes du trimestre
    genererSeancesCompletes();

    console.log('   ✅ Module Horaire initialisé');
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

/**
 * Génère les options pour le select d'heure de début
 * De 8h00 à 22h00
 * 
 * RETOUR:
 * - HTML string avec les options
 */
function genererOptionsHeureDebut() {
    let options = '<option value="">Choisir...</option>';
    for (let h = 8; h <= 22; h++) {
        const heure = h < 10 ? `0${h}:00` : `${h}:00`;
        const affichage = `${h}h00`;
        options += `<option value="${heure}">${affichage}</option>`;
    }
    return options;
}

/**
 * Génère les options pour le select d'heure de fin
 * De 8h50 à 22h50
 *
 * RETOUR:
 * - HTML string avec les options
 */
function genererOptionsHeureFin() {
    let options = '<option value="">Choisir...</option>';
    for (let h = 8; h <= 22; h++) {
        const heure = h < 10 ? `0${h}:50` : `${h}:50`;
        const affichage = `${h}h50`;
        options += `<option value="${heure}">${affichage}</option>`;
    }
    return options;
}

/**
 * Génère les options pour le select de durée
 * De 1h à 6h par paliers de 0.5h
 *
 * RETOUR:
 * - HTML string avec les options
 */
function genererOptionsDuree() {
    let options = '<option value="">Choisir...</option>';

    // Générer de 1h à 6h par paliers de 0.5h
    for (let h = 1.0; h <= 6.0; h += 0.5) {
        const valeur = h.toFixed(1);
        const affichage = h % 1 === 0 ? `${h}h` : `${Math.floor(h)}h30`;
        options += `<option value="${valeur}">${affichage}</option>`;
    }

    return options;
}

/**
 * Calcule l'heure de fin à partir d'une heure de début et d'une durée
 *
 * @param {string} debut - Heure de début au format "HH:MM" (ex: "13:00", "14:30")
 * @param {number} duree - Durée en heures (ex: 2.0, 1.5, 3.5)
 * @returns {string} Heure de fin au format "HH:MM" (ex: "15:00", "16:00")
 */
function calculerHeureFin(debut, duree) {
    if (!debut || !duree) return '';

    // Parser l'heure de début
    const [heures, minutes] = debut.split(':').map(Number);

    // Calculer les minutes totales
    const minutesDebut = heures * 60 + minutes;
    const minutesFin = minutesDebut + (duree * 60);

    // Convertir en heures et minutes
    const heuresFin = Math.floor(minutesFin / 60);
    const minutesRestantes = minutesFin % 60;

    // Formater en HH:MM
    const heuresStr = String(heuresFin).padStart(2, '0');
    const minutesStr = String(minutesRestantes).padStart(2, '0');

    return `${heuresStr}:${minutesStr}`;
}

/* ===============================
   🆕 BETA 95.1 : GESTION DES PÉRIODES
   =============================== */

/**
 * Obtient la durée d'une période en minutes
 * Source unique : modalitesEvaluation.dureePeriodeMinutes
 * @returns {number} Durée en minutes (défaut: 55)
 */
function obtenirDureePeriode() {
    const modalites = db.getSync(cle('modalitesEvaluation'), {});
    return modalites.dureePeriodeMinutes || 55; // Défaut: 55 minutes
}

/**
 * Définit la durée d'une période en minutes
 * @param {number} minutes - Durée en minutes (50, 55, 60...)
 */
function definirDureePeriode(minutes) {
    const modalites = db.getSync(cle('modalitesEvaluation'), {});
    modalites.dureePeriodeMinutes = parseInt(minutes) || 55;
    db.setSync(cle('modalitesEvaluation'), modalites);
    console.log(`[Horaire] Durée de période définie: ${minutes} minutes`);
}

/**
 * Convertit un nombre de périodes en heures décimales
 * @param {number} nombrePeriodes - Nombre de périodes
 * @param {number} [dureePeriodeMinutes] - Durée d'une période (optionnel, utilise config si omis)
 * @returns {number} Heures décimales (ex: 2.75)
 */
function periodesVersHeures(nombrePeriodes, dureePeriodeMinutes = null) {
    const duree = dureePeriodeMinutes || obtenirDureePeriode();
    return (nombrePeriodes * duree) / 60;
}

/**
 * Convertit des heures décimales en nombre de périodes (arrondi)
 * @param {number} heures - Heures décimales
 * @param {number} [dureePeriodeMinutes] - Durée d'une période (optionnel)
 * @returns {number} Nombre de périodes (arrondi au plus proche)
 */
function heuresVersPeriodes(heures, dureePeriodeMinutes = null) {
    const duree = dureePeriodeMinutes || obtenirDureePeriode();
    const minutesTotales = heures * 60;
    return Math.round(minutesTotales / duree);
}

/**
 * Convertit un nombre de périodes en minutes
 * @param {number} nombrePeriodes - Nombre de périodes
 * @param {number} [dureePeriodeMinutes] - Durée d'une période (optionnel)
 * @returns {number} Durée en minutes
 */
function periodesVersMinutes(nombrePeriodes, dureePeriodeMinutes = null) {
    const duree = dureePeriodeMinutes || obtenirDureePeriode();
    return nombrePeriodes * duree;
}

/**
 * Calcule l'heure de fin à partir d'une heure de début et d'un nombre de périodes
 * @param {string} debut - Heure de début "HH:MM"
 * @param {number} nombrePeriodes - Nombre de périodes
 * @param {number} [dureePeriodeMinutes] - Durée d'une période (optionnel)
 * @returns {string} Heure de fin "HH:MM"
 */
function calculerHeureFinPeriodes(debut, nombrePeriodes, dureePeriodeMinutes = null) {
    if (!debut || !nombrePeriodes) return '';
    const dureeHeures = periodesVersHeures(nombrePeriodes, dureePeriodeMinutes);
    return calculerHeureFin(debut, dureeHeures);
}

/**
 * Génère les options pour le select du nombre de périodes
 * De 1 à 8 périodes
 * @returns {string} HTML des options
 */
function genererOptionsNombrePeriodes() {
    let options = '<option value="">Choisir...</option>';
    for (let p = 1; p <= 8; p++) {
        const dureeMinutes = periodesVersMinutes(p);
        const heures = Math.floor(dureeMinutes / 60);
        const minutes = dureeMinutes % 60;
        const affichageTemps = minutes > 0 ? `${heures}h${String(minutes).padStart(2, '0')}` : `${heures}h`;
        options += `<option value="${p}">${p} période${p > 1 ? 's' : ''} (${affichageTemps})</option>`;
    }
    return options;
}

/**
 * Formate une durée en affichage lisible selon la préférence
 * @param {number} nombrePeriodes - Nombre de périodes
 * @param {string} [mode='periodes'] - 'periodes', 'heures', 'les-deux'
 * @returns {string} Affichage formaté
 */
function formaterDuree(nombrePeriodes, mode = 'periodes') {
    const dureePeriode = obtenirDureePeriode();
    const heures = periodesVersHeures(nombrePeriodes, dureePeriode);
    const heuresInt = Math.floor(heures);
    const minutes = Math.round((heures - heuresInt) * 60);
    const heuresStr = minutes > 0 ? `${heuresInt}h${String(minutes).padStart(2, '0')}` : `${heuresInt}h`;

    switch (mode) {
        case 'heures':
            return heuresStr;
        case 'les-deux':
            return `${nombrePeriodes} pér. (${heuresStr})`;
        default: // 'periodes'
            return `${nombrePeriodes} période${nombrePeriodes > 1 ? 's' : ''}`;
    }
}

/* ===============================
   MIGRATION DES DONNÉES
   =============================== */

/**
 * Migre les anciennes séances vers le nouveau format
 * ANCIEN: {nom: 'A', debut: '13:00', fin: '15:00'}
 * NOUVEAU: {lettre: 'A', debut: '13:00', duree: 2.0}
 *
 * FONCTIONNEMENT:
 * 1. Lit seancesHoraire depuis localStorage
 * 2. Pour chaque séance:
 *    - Ajoute 'lettre' si manquant (copie depuis 'nom')
 *    - Calcule 'duree' depuis 'debut' et 'fin' si manquant
 *    - Supprime 'fin' si 'duree' existe
 * 3. Sauvegarde le nouveau format
 *
 * RETOUR:
 * - true si migration effectuée, false sinon
 */
function migrerDonneesSeances() {
    const seancesHoraire = db.getSync('seancesHoraire', []);

    if (seancesHoraire.length === 0) {
        return false;
    }

    let migrationNecessaire = false;

    seancesHoraire.forEach(seance => {
        // Ajouter 'lettre' si manquant (copier depuis 'nom')
        if (!seance.lettre && seance.nom) {
            seance.lettre = seance.nom;
            migrationNecessaire = true;
        }

        // Calculer 'duree' si manquant mais 'fin' présent
        if (!seance.duree && seance.debut && seance.fin) {
            // Convertir heures en format numérique (ex: "13:00" -> 13.0)
            const debutParts = seance.debut.split(':');
            const finParts = seance.fin.split(':');

            const debutHeures = parseInt(debutParts[0]) + parseInt(debutParts[1]) / 60;
            const finHeures = parseInt(finParts[0]) + parseInt(finParts[1]) / 60;

            seance.duree = parseFloat((finHeures - debutHeures).toFixed(1));
            migrationNecessaire = true;
        }

        // Supprimer 'fin' si 'duree' existe (nettoyage)
        if (seance.duree && seance.fin) {
            delete seance.fin;
            migrationNecessaire = true;
        }
    });

    if (migrationNecessaire) {
        db.setSync('seancesHoraire', seancesHoraire);
        console.log('   ✅ Migration des données séances effectuée');
    }

    return migrationNecessaire;
}

/* ===============================
   GÉNÉRATION DES SÉANCES COMPLÈTES
   =============================== */

/**
 * Génère toutes les séances du trimestre avec leurs dates
 * SOURCE UNIQUE pour calendrier-saisie.js et calcul d'assiduité
 *
 * 🆕 BETA 95 : Support multi-cours avec coursId optionnel
 *
 * FONCTIONNEMENT:
 * 1. Lit seancesHoraire (séances hebdomadaires configurées) du cours
 * 2. Lit calendrierComplet (tous les jours du trimestre)
 * 3. Pour chaque jour de cours, crée les séances correspondantes
 * 4. Stocke dans clé spécifique au cours
 *
 * FORMAT DE SORTIE:
 * {
 *   "2025-08-25": [
 *     {
 *       id: "SEANCE-2025-08-25-A",
 *       seanceHoraireId: 123456,
 *       nom: "A",
 *       date: "2025-08-25",
 *       jour: "Lundi",
 *       debut: "13:00",
 *       fin: "14:50",
 *       local: "1709",
 *       numeroSemaine: 1
 *     }
 *   ],
 *   ...
 * }
 *
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {Object} - Séances complètes du cours
 */
function genererSeancesCompletes(coursId = null) {
    const idCours = coursId || (typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null);
    console.log('📚 Génération des séances complètes...', idCours ? `(cours: ${idCours})` : '(global)');

    // Migrer les anciennes données si nécessaire
    migrerDonneesSeances();

    // 🆕 BETA 95 : Lire les séances horaire du cours spécifique
    const seancesHoraire = obtenirSeancesHoraire(idCours);

    // 🔍 FIX #220 : Log diagnostic pour vérifier le bon nombre de séances
    const joursUniques = [...new Set(seancesHoraire.map(s => s.jour))];
    console.log(`📚 Horaire retourné: ${seancesHoraire.length} séance(s) sur ${joursUniques.length} jour(s):`, joursUniques);

    // Clé de sortie spécifique au cours
    const cleOutput = cleSeancesCompletes(idCours);

    if (seancesHoraire.length === 0) {
        console.log('   ⚠️  Aucune séance hebdomadaire configurée');
        db.setSync(cleOutput, {});
        return {};
    }

    // Lire le calendrier complet (source unique)
    const calendrierComplet = db.getSync(cle('calendrierComplet'), {});

    if (Object.keys(calendrierComplet).length === 0) {
        console.warn('   ⚠️  Calendrier complet non disponible');
        db.setSync(cle('seancesCompletes'), {});
        return {};
    }

    // Créer un index des séances par jour de semaine
    const seancesParJour = {};
    seancesHoraire.forEach(seance => {
        if (!seancesParJour[seance.jour]) {
            seancesParJour[seance.jour] = [];
        }
        seancesParJour[seance.jour].push(seance);
    });

    // ÉTAPE 1 : Grouper les jours de cours par semaine
    const joursParSemaine = {};
    Object.entries(calendrierComplet).forEach(([dateStr, infosJour]) => {
        // Ne traiter QUE les jours de cours ou reprises
        if (infosJour.statut !== 'cours' && infosJour.statut !== 'reprise') {
            // 🆕 FIX (19 fév 2026) : En multi-cours, le calendrier partagé peut marquer
            // un jour comme 'jour-ouvrable' alors que le cours actif a une séance ce jour.
            // Vérifier l'horaire spécifique avant de rejeter (aligné avec saisie-presences.js).
            if (infosJour.statut === 'jour-ouvrable') {
                const jourPourVerif = infosJour.jourSemaine;
                if (!jourPourVerif || !seancesParJour[jourPourVerif] || seancesParJour[jourPourVerif].length === 0) {
                    return;
                }
                // Le cours actif a bien une séance ce jour → continuer le traitement
            } else {
                return;
            }
        }

        const numSemaine = infosJour.numeroSemaine;
        if (!joursParSemaine[numSemaine]) {
            joursParSemaine[numSemaine] = [];
        }

        // Pour les reprises, utiliser le jour remplacé si disponible
        let jourPourSeances = infosJour.jourSemaine;
        if (infosJour.statut === 'reprise' && infosJour.jourRemplace) {
            jourPourSeances = infosJour.jourRemplace;
        }

        // Vérifier si ce jour a des séances configurées dans l'horaire
        const seancesDuJour = seancesParJour[jourPourSeances] || [];
        if (seancesDuJour.length > 0) {
            joursParSemaine[numSemaine].push({
                date: dateStr,
                jourSemaine: infosJour.jourSemaine,
                jourRemplace: jourPourSeances,
                seancesHoraire: seancesDuJour
            });
        }
    });

    // ÉTAPE 2 : Pour chaque semaine, trier chronologiquement et assigner A, B, etc.
    const seancesCompletes = {};
    let compteurSeances = 0;
    const nomsSeances = ['A', 'B', 'C', 'D', 'E']; // Support jusqu'à 5 séances/semaine

    Object.entries(joursParSemaine).forEach(([numSemaine, jours]) => {
        // Trier les jours chronologiquement
        jours.sort((a, b) => a.date.localeCompare(b.date));

        // Assigner A, B, C, etc. selon l'ordre chronologique
        jours.forEach((jour, index) => {
            const nomSeanceChronologique = nomsSeances[index] || `S${index + 1}`;

            seancesCompletes[jour.date] = jour.seancesHoraire.map(seance => {
                compteurSeances++;
                return {
                    id: `SEANCE-${jour.date}-${nomSeanceChronologique}`,
                    seanceHoraireId: seance.id,
                    nom: nomSeanceChronologique, // Nom basé sur l'ordre chronologique, pas le jour fixe
                    nomOriginal: seance.nom || seance.lettre, // Conserver le nom/lettre original pour référence
                    groupe: seance.groupe || '', // Groupe associé à la séance
                    date: jour.date,
                    jour: jour.jourSemaine,
                    jourRemplace: jour.jourRemplace !== jour.jourSemaine ? jour.jourRemplace : null,
                    debut: seance.debut,
                    fin: seance.fin || calculerHeureFin(seance.debut, seance.duree), // Calculer fin si manquant
                    duree: seance.duree, // Ajouter durée pour compatibilité
                    local: seance.local,
                    numeroSemaine: parseInt(numSemaine)
                };
            });
        });
    });

    // ÉTAPE 3 supprimée (FIX #220, 3 mars 2026).
    // L'ancien code ajoutait des entrées vides ([]) pour TOUS les jours 'cours' du calendrier
    // partagé, y compris ceux d'autres groupes-cours. Ces entrées parasites gonflaient
    // le dénominateur d'assiduité (obtenirNombrePeriodesSeance retourne 2 par défaut
    // pour un tableau vide). seancesCompletes ne doit contenir que les dates où le
    // groupe-cours actif a effectivement une séance configurée dans son horaire.

    // 🆕 BETA 95 : Stocker dans clé spécifique au cours
    db.setSync(cleOutput, seancesCompletes);

    console.log(`✅ Séances complètes générées: ${compteurSeances} séances`);
    console.log(`   - Réparties sur ${Object.keys(seancesCompletes).length} jours de cours`);
    if (idCours) {
        console.log(`   - Clé de stockage: ${cleOutput}`);
    }

    return seancesCompletes;
}

/**
 * API publique pour obtenir les séances complètes
 *
 * 🆕 BETA 95 : Support multi-cours avec coursId optionnel
 *
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {Object} - Séances complètes du cours
 */
function obtenirSeancesCompletes(coursId = null) {
    const cleCours = cleSeancesCompletes(coursId);

    // db.getSync retourne déjà l'objet parsé, pas besoin de JSON.parse
    const seancesCompletes = db.getSync(cleCours, null);

    if (!seancesCompletes) {
        console.log('⚠️  seancesCompletes non trouvé, génération...');
        return genererSeancesCompletes(coursId);
    }

    return seancesCompletes;
}

/**
 * API publique pour obtenir les séances d'une date spécifique
 *
 * 🆕 BETA 95 : Support multi-cours avec coursId optionnel
 *
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {Array} - Séances de cette date (ou tableau vide)
 */
function obtenirSeancesJour(dateStr, coursId = null) {
    const seancesCompletes = obtenirSeancesCompletes(coursId);
    return seancesCompletes[dateStr] || [];
}

/**
 * API publique : Détermine le rang de la séance dans sa semaine (1ère, 2ème, etc.)
 * 🎯 SOURCE UNIQUE DE VÉRITÉ pour le calcul du rang
 *
 * 🆕 BETA 95 : Support multi-cours avec coursId optionnel
 *
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @returns {Object|null} - {rang: number, total: number, ordinal: string} ou null
 *
 * @example
 * const rang = obtenirRangSeanceDansSemaine('2025-11-12');
 * // => { rang: 1, total: 2, ordinal: '1ère' }
 */
function obtenirRangSeanceDansSemaine(dateStr, coursId = null) {
    try {
        const calendrier = db.getSync(cle('calendrierComplet'), {});

        const infoJour = calendrier[dateStr];

        // 🆕 FIX (16 fév 2026) : Si le jour n'a pas de numeroSemaine (ex: 'jour-ouvrable'
        // en multi-cours), tenter de le déduire du voisinage calendaire
        let numSemaine = infoJour ? infoJour.numeroSemaine : null;

        if (!numSemaine && infoJour) {
            // Chercher le numéro de semaine d'un jour 'cours' dans la même semaine calendaire
            const dateObj = new Date(dateStr + 'T00:00:00');
            const jourDeSemaine = dateObj.getDay(); // 0=dim, 1=lun...
            // Parcourir les jours autour (lun-ven de la même semaine)
            for (let delta = -6; delta <= 6; delta++) {
                if (delta === 0) continue;
                const voisin = new Date(dateObj);
                voisin.setDate(voisin.getDate() + delta);
                const voisinStr = voisin.toISOString().split('T')[0];
                const infoVoisin = calendrier[voisinStr];
                if (infoVoisin && infoVoisin.numeroSemaine &&
                    (infoVoisin.statut === 'cours' || infoVoisin.statut === 'reprise')) {
                    // Vérifier que c'est la même semaine calendaire (même lundi)
                    const lundiDate = new Date(dateObj);
                    lundiDate.setDate(lundiDate.getDate() - ((jourDeSemaine + 6) % 7));
                    const lundiVoisin = new Date(voisin);
                    const jourVoisin = voisin.getDay();
                    lundiVoisin.setDate(lundiVoisin.getDate() - ((jourVoisin + 6) % 7));
                    if (lundiDate.toISOString().split('T')[0] === lundiVoisin.toISOString().split('T')[0]) {
                        numSemaine = infoVoisin.numeroSemaine;
                        break;
                    }
                }
            }
        }

        if (!numSemaine) return null;

        // 🆕 FIX #220 (3 mars 2026) : Utiliser seancesCompletes du groupe-cours actif
        // au lieu du calendrierComplet partagé. Le calendrier marque comme 'cours' les jours
        // de TOUS les groupes-cours, ce qui gonflait le rang (ex: "3ème séance" au lieu de "2ème").
        const seancesCompletesGC = typeof obtenirSeancesCompletes === 'function'
            ? obtenirSeancesCompletes(coursId) : {};

        // Filtrer les dates de seancesCompletes qui appartiennent à cette semaine
        const joursAvecSeances = Object.keys(seancesCompletesGC)
            .filter(date => {
                const info = calendrier[date];
                if (!info) return false;
                // Vérifier le numéro de semaine (en tenant compte des jours-ouvrables sans numéro)
                let numSemaineDate = info.numeroSemaine;
                if (!numSemaineDate) {
                    // Déduire du voisinage (même semaine calendaire)
                    const dateObj2 = new Date(date + 'T00:00:00');
                    const jour2 = dateObj2.getDay();
                    const lundiDate2 = new Date(dateObj2);
                    lundiDate2.setDate(lundiDate2.getDate() - ((jour2 + 6) % 7));
                    // Comparer avec le lundi de dateStr
                    const dateStrObj = new Date(dateStr + 'T00:00:00');
                    const jourStr = dateStrObj.getDay();
                    const lundiStr = new Date(dateStrObj);
                    lundiStr.setDate(lundiStr.getDate() - ((jourStr + 6) % 7));
                    return lundiDate2.toISOString().split('T')[0] === lundiStr.toISOString().split('T')[0];
                }
                return numSemaineDate === numSemaine;
            })
            .sort();

        // Si dateStr n'est pas dans la liste (jour-ouvrable), l'insérer
        if (!joursAvecSeances.includes(dateStr)) {
            joursAvecSeances.push(dateStr);
            joursAvecSeances.sort();
        }

        const rang = joursAvecSeances.indexOf(dateStr) + 1;
        const total = joursAvecSeances.length;

        // Générer l'ordinal en français
        const ordinaux = ['', '1ère', '2ème', '3ème', '4ème', '5ème'];
        const ordinal = ordinaux[rang] || `${rang}ème`;

        return { rang, total, ordinal };
    } catch (error) {
        console.warn('⚠️ Erreur calcul rang séance:', error);
        return null;
    }
}

/* ===============================
   📝 GESTION DU FORMULAIRE
   =============================== */

/**
 * Génère les options du select pour les groupes
 * @returns {string} HTML des options
 */
function genererOptionsGroupes() {
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    // Extraire les groupes uniques et les trier
    const groupes = [...new Set(etudiants.map(e => e.groupe))].filter(g => g).sort();

    let html = '<option value="">Sélectionner un groupe...</option>';
    groupes.forEach(groupe => {
        html += `<option value="${echapperHtml(groupe)}">${echapperHtml(groupe)}</option>`;
    });

    return html;
}

/**
 * Variable temporaire pour stocker les séances en cours de configuration
 * Utilisée pendant l'édition avant la sauvegarde finale
 */
let seancesEnCours = [];

/**
 * Affiche le formulaire dynamique de configuration des séances
 * Système flexible permettant d'ajouter de 1 à 6 séances
 *
 * FONCTIONNEMENT:
 * 1. Charge les séances existantes depuis localStorage (si édition)
 * 2. Si nouveau, initialise avec 1 séance vide
 * 3. Génère et affiche les formulaires
 * 4. Active le bouton "+ Ajouter une séance" si < 6 séances
 */
function afficherFormulaireSeancesDynamique() {
    // 🆕 BETA 95 : Charger les séances du cours actif
    const seancesHoraire = obtenirSeancesHoraire(null);

    if (seancesHoraire.length > 0) {
        // Mode édition : charger les séances existantes
        seancesEnCours = JSON.parse(JSON.stringify(seancesHoraire)); // Deep copy
    } else {
        // Mode création : initialiser avec une séance vide
        seancesEnCours = [{
            lettre: 'A',
            groupe: '',
            jour: '',
            debut: '',
            nombrePeriodes: '',
            local: ''
        }];
    }

    // Afficher le formulaire
    document.getElementById('formAjoutSeance').classList.remove('u-hide');

    // Générer l'affichage
    rafraichirFormulairesSeances();
}

/**
 * Génère le HTML pour le formulaire d'UNE séance
 *
 * @param {number} index - Index de la séance dans le tableau
 * @param {object} seance - Objet séance avec ses propriétés
 * @returns {string} HTML du formulaire de séance
 */
function genererFormulaireSeance(index, seance) {
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    const lettre = lettres[index] || `S${index + 1}`;

    return `
        <div class="seance-form-item" data-index="${index}" style="background: var(--surface-conteneur, #162c36); padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid var(--bleu-leger);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: var(--texte-secondaire); font-size: 1.05rem;">Séance ${lettre}</strong>
                ${seancesEnCours.length > 1 ? `
                    <button type="button" class="btn btn-supprimer btn-tres-compact" data-action="supprimerFormulaireSeance" data-param="${index}">
                        Supprimer
                    </button>
                ` : ''}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 0.8fr; gap: 10px; align-items: end;">
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Groupe</label>
                    <select class="controle-form" id="groupe_${index}" required>
                        ${genererOptionsGroupes()}
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Jour de la semaine</label>
                    <select class="controle-form" id="jour_${index}" required>
                        <option value="">Choisir...</option>
                        <option value="Lundi">Lundi</option>
                        <option value="Mardi">Mardi</option>
                        <option value="Mercredi">Mercredi</option>
                        <option value="Jeudi">Jeudi</option>
                        <option value="Vendredi">Vendredi</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Heure début</label>
                    <input type="time" class="controle-form" id="debut_${index}" required>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Périodes</label>
                    <select class="controle-form" id="periodes_${index}" required>
                        ${genererOptionsNombrePeriodes()}
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Local</label>
                    <input type="text" class="controle-form" id="local_${index}" placeholder="Ex: 1709">
                </div>
            </div>
        </div>
    `;
}

/**
 * Rafraîchit l'affichage de tous les formulaires de séances
 * Génère le HTML, remplit les valeurs et active/désactive le bouton d'ajout
 */
function rafraichirFormulairesSeances() {
    const container = document.getElementById('seancesFormContainer');

    let html = '';

    // Générer tous les formulaires
    seancesEnCours.forEach((seance, index) => {
        html += genererFormulaireSeance(index, seance);
    });

    // Ajouter le bouton "+ Ajouter une séance" si < 6 séances
    if (seancesEnCours.length < 6) {
        html += `
            <button type="button" class="btn" data-action="ajouterFormulaireSeance"
                    style="width: 100%; margin-top: 10px; background: var(--bleu-leger); color: var(--texte-secondaire);">
                Ajouter une séance
            </button>
        `;
    } else {
        html += `
            <div style="background: var(--alerte-fond-attention); border: 1px solid var(--btn-annuler); border-radius: 6px; padding: 10px; margin-top: 10px; text-align: center;">
                Maximum de 6 séances atteint
            </div>
        `;
    }

    container.innerHTML = html;

    // Remplir les valeurs des champs depuis seancesEnCours
    seancesEnCours.forEach((seance, index) => {
        const groupeSelect = document.getElementById(`groupe_${index}`);
        const jourSelect = document.getElementById(`jour_${index}`);
        const debutSelect = document.getElementById(`debut_${index}`);
        const periodesSelect = document.getElementById(`periodes_${index}`);
        const localInput = document.getElementById(`local_${index}`);

        if (groupeSelect && seance.groupe) groupeSelect.value = seance.groupe;
        if (jourSelect && seance.jour) jourSelect.value = seance.jour;
        if (debutSelect && seance.debut) debutSelect.value = seance.debut;

        // 🆕 BETA 95.1 : Lire nombrePeriodes, avec fallback sur conversion depuis duree
        if (periodesSelect) {
            if (seance.nombrePeriodes) {
                periodesSelect.value = seance.nombrePeriodes;
            } else if (seance.duree) {
                // Rétrocompatibilité : convertir heures → périodes
                const periodes = heuresVersPeriodes(seance.duree);
                periodesSelect.value = periodes;
            }
        }

        if (localInput && seance.local) localInput.value = seance.local;
    });
}

/**
 * Ajoute un nouveau formulaire de séance vide
 * Maximum 6 séances autorisées
 */
function ajouterFormulaireSeance() {
    if (seancesEnCours.length >= 6) {
        alert('Maximum de 6 séances atteint');
        return;
    }

    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nouvelleLettre = lettres[seancesEnCours.length];

    seancesEnCours.push({
        lettre: nouvelleLettre,
        groupe: '',
        jour: '',
        debut: '',
        nombrePeriodes: '',
        local: ''
    });

    rafraichirFormulairesSeances();
}

/**
 * Supprime un formulaire de séance
 *
 * @param {number} index - Index de la séance à supprimer
 */
function supprimerFormulaireSeance(index) {
    if (seancesEnCours.length <= 1) {
        alert('Tu dois conserver au moins une séance');
        return;
    }

    if (!confirm(`Supprimer la séance ${seancesEnCours[index].lettre} ?`)) {
        return;
    }

    seancesEnCours.splice(index, 1);

    // Réassigner les lettres A, B, C, etc.
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    seancesEnCours.forEach((seance, i) => {
        seance.lettre = lettres[i];
    });

    rafraichirFormulairesSeances();
}

/**
 * Annule l'ajout de séances
 * Masque le formulaire et réinitialise le mode édition
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans le formulaire
 */
function annulerAjoutSeance() {
    const formAjout = document.getElementById('formAjoutSeance');
    const btnConfirmer = document.getElementById('btnConfirmerSeances');

    if (formAjout) {
        formAjout.classList.add('u-hide');
    }

    // Réinitialiser le bouton
    if (btnConfirmer) {
        const formatChecked = document.querySelector('input[name="formatHoraire"]:checked');
        if (formatChecked) {
            btnConfirmer.textContent = formatChecked.value === '2x2' ? 'Ajouter les séances' : 'Ajouter la séance';
        }
        btnConfirmer.removeAttribute('data-mode-edition');
    }
}

/**
 * Confirme et enregistre toutes les séances configurées
 * Appelée par le bouton «Sauvegarder l'horaire»
 *
 * FONCTIONNEMENT:
 * 1. Lit les valeurs depuis tous les formulaires dynamiques
 * 2. Valide les données obligatoires
 * 3. Crée les objets séance avec IDs uniques
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 * 6. Masque le formulaire
 *
 * NOUVELLE STRUCTURE DONNÉES (Beta 95.1):
 * Séance = {
 *   id: timestamp,
 *   lettre: 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
 *   groupe: string,
 *   jour: string,
 *   debut: string (HH:MM),
 *   nombrePeriodes: number (ex: 3, 4),
 *   duree: number (calculé, heures décimales pour rétrocompat),
 *   local: string,
 *   verrouille: boolean
 * }
 */
function confirmerSeances() {
    // Lire les valeurs depuis les champs dynamiques
    const seancesAEnregistrer = [];

    for (let i = 0; i < seancesEnCours.length; i++) {
        const groupeSelect = document.getElementById(`groupe_${i}`);
        const jourSelect = document.getElementById(`jour_${i}`);
        const debutSelect = document.getElementById(`debut_${i}`);
        const periodesSelect = document.getElementById(`periodes_${i}`);
        const localInput = document.getElementById(`local_${i}`);

        // Validation
        if (!groupeSelect || !groupeSelect.value) {
            alert(`Séance ${seancesEnCours[i].lettre}: Veuillez sélectionner un groupe`);
            return;
        }

        if (!jourSelect || !jourSelect.value) {
            alert(`Séance ${seancesEnCours[i].lettre}: Veuillez sélectionner un jour`);
            return;
        }

        if (!debutSelect || !debutSelect.value) {
            alert(`Séance ${seancesEnCours[i].lettre}: Veuillez sélectionner une heure de début`);
            return;
        }

        if (!periodesSelect || !periodesSelect.value) {
            alert(`Séance ${seancesEnCours[i].lettre}: Veuillez sélectionner le nombre de périodes`);
            return;
        }

        // 🆕 BETA 95.1 : Stocker nombrePeriodes + duree calculée pour rétrocompat
        const nombrePeriodes = parseInt(periodesSelect.value);
        const dureeHeures = periodesVersHeures(nombrePeriodes);

        // Créer l'objet séance
        const seance = {
            id: genererIdUnique('SEANCE_'),
            lettre: seancesEnCours[i].lettre,
            groupe: groupeSelect.value,
            jour: jourSelect.value,
            debut: debutSelect.value,
            nombrePeriodes: nombrePeriodes,
            duree: dureeHeures, // Rétrocompatibilité
            local: localInput ? localInput.value : ''
        };

        seancesAEnregistrer.push(seance);
    }

    // Vérifier qu'au moins une séance est configurée
    if (seancesAEnregistrer.length === 0) {
        alert('Veuillez configurer au moins une séance');
        return;
    }

    // 🆕 BETA 95 : Sauvegarder dans la clé spécifique au cours actif
    const cleCours = cleHoraire(null);
    db.setSync(cleCours, seancesAEnregistrer);
    console.log(`[Horaire] Séances sauvegardées dans: ${cleCours}`);

    // Rafraîchir l'affichage des séances existantes
    afficherSeancesExistantes();

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Masquer le formulaire
    annulerAjoutSeance();

    // Notification
    const nbSeances = seancesAEnregistrer.length;
    const message = nbSeances === 1
        ? 'Séance sauvegardée avec succès'
        : `${nbSeances} séances sauvegardées avec succès`;
    afficherNotificationSucces(message);

    // Réinitialiser seancesEnCours
    seancesEnCours = [];
}

/* ===============================
   AFFICHAGE DES SÉANCES
   =============================== */

/* ===============================
   GÉNÉRATION DE CARTES (LECTURE ET ÉDITION)
   =============================== */

/**
 * Génère le HTML d'une carte de séance en MODE LECTURE
 * Affiche les informations avec boutons Modifier/Supprimer
 *
 * @param {object} seance - Objet séance
 * @param {number} index - Index dans le tableau seancesHoraire
 * @returns {string} HTML de la carte en mode lecture
 */
function genererCarteSeance(seance, index) {
    const jourEchappe = echapperHtml(seance.jour);
    const groupeEchappe = echapperHtml(seance.groupe || '');
    const debutEchappe = echapperHtml(seance.debut);

    // Calculer heure de fin (nouveau format avec durée OU ancien format avec fin)
    const fin = seance.fin || calculerHeureFin(seance.debut, seance.duree);
    const finEchappe = echapperHtml(fin);

    const localEchappe = echapperHtml(seance.local || '');

    // Afficher la lettre (nouveau format) ou le nom (ancien format)
    const nomSeance = seance.lettre || seance.nom || '?';

    // 🆕 BETA 95.1 : Afficher périodes si disponible, sinon durée
    let dureeAffichage = '';
    if (seance.nombrePeriodes) {
        dureeAffichage = ` (${seance.nombrePeriodes} pér.)`;
    } else if (seance.duree) {
        dureeAffichage = ` (${seance.duree % 1 === 0 ? seance.duree + 'h' : seance.duree.toString().replace('.', 'h')})`;
    }

    return `
<div class="item-carte" id="carte-seance-${index}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">Séance ${nomSeance}${groupeEchappe ? ` - Groupe ${groupeEchappe}` : ''}</strong>
        <div class="item-carte-actions">
            <button data-action="modifierSeanceEnPlace" data-param="${index}"
                    class="btn btn-modifier btn-sm">Modifier</button>
            <button data-action="supprimerSeance" data-param="${index}"
                    class="btn btn-supprimer btn-sm">Supprimer</button>
        </div>
    </div>
    <div style="padding: 15px 20px; color: var(--texte-principal); font-size: 0.95rem;">
        ${jourEchappe} • ${debutEchappe} à ${finEchappe}${dureeAffichage}${localEchappe ? ` • Local ${localEchappe}` : ''}
    </div>
</div>
`;
}

/**
 * Génère le HTML d'une carte de séance en MODE ÉDITION
 * Affiche les champs éditables avec boutons Annuler/Sauvegarder
 *
 * @param {object} seance - Objet séance
 * @param {number} index - Index dans le tableau seancesHoraire
 * @returns {string} HTML de la carte en mode édition
 */
function genererCarteSeanceEdition(seance, index) {
    const nomSeance = seance.lettre || seance.nom || '?';
    const groupeEchappe = echapperHtml(seance.groupe || '');

    return `
<div class="item-carte" id="carte-seance-${index}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">Séance ${nomSeance}${groupeEchappe ? ` - Groupe ${groupeEchappe}` : ''}</strong>
        <div class="item-carte-actions">
            <button class="btn btn-annuler btn-sm" data-action="annulerEditionSeanceEnPlace">Annuler</button>
            <button class="btn btn-confirmer btn-sm" data-action="sauvegarderEditionSeanceEnPlace" data-param="${index}">Sauvegarder</button>
        </div>
    </div>
    <div class="grille-4col-form">
        <div class="groupe-form">
            <label>Jour</label>
            <select class="controle-form controle-form-compact" id="edit-jour-${index}">
                <option value="">Choisir...</option>
                <option value="Lundi" ${seance.jour === 'Lundi' ? 'selected' : ''}>Lundi</option>
                <option value="Mardi" ${seance.jour === 'Mardi' ? 'selected' : ''}>Mardi</option>
                <option value="Mercredi" ${seance.jour === 'Mercredi' ? 'selected' : ''}>Mercredi</option>
                <option value="Jeudi" ${seance.jour === 'Jeudi' ? 'selected' : ''}>Jeudi</option>
                <option value="Vendredi" ${seance.jour === 'Vendredi' ? 'selected' : ''}>Vendredi</option>
            </select>
        </div>
        <div class="groupe-form">
            <label>Heure début</label>
            <input type="time" class="controle-form controle-form-compact" id="edit-debut-${index}"
                   value="${echapperHtml(seance.debut || '')}">
        </div>
        <div class="groupe-form">
            <label>Périodes</label>
            <select class="controle-form controle-form-compact" id="edit-periodes-${index}">
                ${genererOptionsNombrePeriodes()}
            </select>
        </div>
        <div class="groupe-form">
            <label>Local</label>
            <input type="text" class="controle-form controle-form-compact" id="edit-local-${index}"
                   value="${echapperHtml(seance.local || '')}" placeholder="Ex: 1709">
        </div>
    </div>
    <input type="hidden" id="edit-lettre-${index}" value="${seance.lettre || ''}">
    <input type="hidden" id="edit-groupe-${index}" value="${seance.groupe || ''}">
    <input type="hidden" id="edit-nombrePeriodes-${index}" value="${seance.nombrePeriodes || ''}">
</div>
`;
}

/* ===============================
   GESTION DE L'ÉDITION EN PLACE
   =============================== */

/**
 * Bascule une carte de séance en mode édition
 * Remplace l'affichage par un formulaire éditable
 *
 * @param {number} index - Index de la séance dans seancesHoraire
 */
function modifierSeanceEnPlace(index) {
    // 🆕 BETA 95 : Lire depuis la clé du cours actif
    const seances = obtenirSeancesHoraire(null);
    const seance = seances[index];

    if (!seance) {
        alert('Séance introuvable');
        return;
    }

    // Remplacer la carte par sa version éditable
    const carte = document.getElementById(`carte-seance-${index}`);
    if (carte) {
        carte.outerHTML = genererCarteSeanceEdition(seance, index);

        // Sélectionner les valeurs après insertion dans le DOM
        const debutSelect = document.getElementById(`edit-debut-${index}`);
        const periodesSelect = document.getElementById(`edit-periodes-${index}`);

        if (debutSelect && seance.debut) {
            debutSelect.value = seance.debut;
        }

        // 🆕 BETA 95.1 : Remplir périodes avec fallback depuis duree
        if (periodesSelect) {
            if (seance.nombrePeriodes) {
                periodesSelect.value = seance.nombrePeriodes;
            } else if (seance.duree) {
                // Rétrocompatibilité : convertir heures → périodes
                const periodes = heuresVersPeriodes(seance.duree);
                periodesSelect.value = periodes;
            }
        }
    }
}

/**
 * Annule l'édition et revient au mode lecture
 * Recharge toutes les séances depuis localStorage
 */
function annulerEditionSeanceEnPlace() {
    afficherSeancesExistantes();
}

/**
 * Sauvegarde les modifications d'une séance
 * Valide les champs, met à jour localStorage et régénère tout
 *
 * @param {number} index - Index de la séance dans seancesHoraire
 */
function sauvegarderEditionSeanceEnPlace(index) {
    const jour = document.getElementById(`edit-jour-${index}`)?.value;
    const debut = document.getElementById(`edit-debut-${index}`)?.value;
    const periodes = document.getElementById(`edit-periodes-${index}`)?.value;
    const local = document.getElementById(`edit-local-${index}`)?.value;
    const lettre = document.getElementById(`edit-lettre-${index}`)?.value;
    const groupe = document.getElementById(`edit-groupe-${index}`)?.value;

    if (!jour || !debut || !periodes) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // 🆕 BETA 95.1 : Lire et sauvegarder dans la clé du cours actif
    const cleCours = cleHoraire(null);
    const seances = obtenirSeancesHoraire(null);

    if (index < 0 || index >= seances.length) {
        alert('Index de séance invalide');
        return;
    }

    // 🆕 BETA 95.1 : Stocker nombrePeriodes + duree calculée
    const nombrePeriodes = parseInt(periodes);
    const dureeHeures = periodesVersHeures(nombrePeriodes);

    // Mettre à jour la séance
    seances[index] = {
        lettre: lettre || seances[index].lettre,
        groupe: groupe || seances[index].groupe || '',
        jour: jour,
        debut: debut,
        nombrePeriodes: nombrePeriodes,
        duree: dureeHeures, // Rétrocompatibilité
        local: local || ''
    };

    // 🆕 BETA 95 : Sauvegarder dans la clé du cours actif
    db.setSync(cleCours, seances);

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Recharger l'affichage
    afficherSeancesExistantes();

    afficherNotificationSucces('Séance modifiée');
}

/**
 * Supprime une séance de l'horaire
 *
 * @param {number} index - Index de la séance à supprimer
 */
function supprimerSeance(index) {
    if (!confirm('Veux-tu vraiment supprimer cette séance ?')) {
        return;
    }

    // 🆕 BETA 95 : Lire et sauvegarder dans la clé du cours actif
    const cleCours = cleHoraire(null);
    const seances = obtenirSeancesHoraire(null);

    // Supprimer la séance
    seances.splice(index, 1);

    // Recalculer les lettres pour les séances restantes
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    seances.forEach((seance, i) => {
        seance.lettre = lettres[i] || `S${i + 1}`;
    });

    db.setSync(cleCours, seances);

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Recharger l'affichage
    afficherSeancesExistantes();

    afficherNotificationSucces('Séance supprimée');
}

/**
 * Affiche les séances existantes du cours actif
 *
 * 🆕 BETA 95 : Affiche les séances spécifiques au cours actif
 *
 * FONCTIONNEMENT:
 * 1. Récupère les séances depuis la clé spécifique au cours
 * 2. Si vide: affiche message
 * 3. Sinon: génère le HTML des séances
 * 4. Affiche les informations (jour, heures, local)
 * 5. Ajoute les boutons d'action (modifier, dupliquer, verrouiller, supprimer)
 * 6. Met à jour l'interface
 */
function afficherSeancesExistantes() {
    const container = document.getElementById('seancesContainer');
    if (!container) return;

    // 🆕 BETA 95 : Afficher le cours actif dans le titre
    const titreCoursElement = document.getElementById('titreHoraireCours');
    if (titreCoursElement) {
        const infoCours = db.getSync('infoCours', null);
        if (infoCours) {
            // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
            const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
            const groupe = infoCours.groupe || '';
            titreCoursElement.textContent = sigle && groupe ? `— ${sigle} (${groupe})` : sigle ? `— ${sigle}` : '';
        } else {
            titreCoursElement.textContent = '';
        }
    }

    // 🆕 BETA 95 : Utiliser la clé spécifique au cours actif
    const seances = obtenirSeancesHoraire(null);

    if (seances.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic">Aucune séance configurée.</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

    seances.forEach((seance, index) => {
        html += genererCarteSeance(seance, index);
    });

    html += '</div>';

    container.innerHTML = html;
}

/* ===============================
   FORMULAIRE D'AJOUT SIMPLE
   =============================== */

/**
 * Affiche le formulaire d'ajout d'une nouvelle séance
 * Cache le bouton d'ajout et affiche le formulaire
 */
function afficherFormAjoutSeance() {
    const form = document.getElementById('formAjoutSeance');
    const btn = document.getElementById('btnAjouterSeance');

    if (form && btn) {
        form.classList.remove('u-hide');
        btn.classList.add('u-hide');
    }
}

/**
 * Annule l'ajout d'une séance
 * Réinitialise le formulaire, le cache et réaffiche le bouton
 */
function annulerFormAjoutSeance() {
    // Réinitialiser les champs
    document.getElementById('jourSeance').value = '';
    document.getElementById('debutSeance').value = '';
    document.getElementById('periodesSeance').value = '';  // 🆕 BETA 95.1
    document.getElementById('localSeance').value = '';

    // Cacher le formulaire et réafficher le bouton
    const form = document.getElementById('formAjoutSeance');
    const btn = document.getElementById('btnAjouterSeance');

    if (form && btn) {
        form.classList.add('u-hide');
        btn.classList.remove('u-hide');
    }
}

/**
 * Confirme l'ajout d'une nouvelle séance
 * Valide les champs, ajoute la séance à localStorage et régénère tout
 * 🆕 BETA 95.1 : Utilise les périodes au lieu des heures
 */
function confirmerAjoutSeance() {
    const jour = document.getElementById('jourSeance')?.value;
    const debut = document.getElementById('debutSeance')?.value;
    const periodes = document.getElementById('periodesSeance')?.value;  // 🆕 BETA 95.1
    const local = document.getElementById('localSeance')?.value;

    // Validation
    if (!jour || !debut || !periodes) {
        alert('Veuillez remplir tous les champs obligatoires (jour, heure début, périodes)');
        return;
    }

    // 🆕 BETA 95 : Récupérer les séances du cours actif
    const cleCours = cleHoraire(null);
    const seances = obtenirSeancesHoraire(null);

    // Vérifier le nombre maximum de séances
    if (seances.length >= 6) {
        alert('Maximum de 6 séances atteint');
        return;
    }

    // 🆕 BETA 95.1 : Convertir périodes en heures pour rétrocompatibilité
    const nombrePeriodes = parseInt(periodes);
    const dureeHeures = periodesVersHeures(nombrePeriodes);

    // ✅ VALIDATION: Vérifier si une séance identique existe déjà
    const seanceExistante = seances.find(s =>
        s.jour === jour &&
        s.debut === debut &&
        (s.nombrePeriodes === nombrePeriodes || s.duree === dureeHeures)
    );

    if (seanceExistante) {
        alert(`Une séance identique existe déjà (${seanceExistante.lettre} : ${jour} ${debut}, ${nombrePeriodes} périodes).\nUtilisez le bouton "Supprimer" pour retirer les doublons.`);
        return;
    }

    // Calculer la lettre pour la nouvelle séance
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    const lettre = lettres[seances.length] || `S${seances.length + 1}`;

    // Créer la nouvelle séance
    const nouvelleSeance = {
        lettre: lettre,
        groupe: '', // Vide par défaut, peut être configuré plus tard
        jour: jour,
        debut: debut,
        nombrePeriodes: nombrePeriodes,  // 🆕 BETA 95.1
        duree: dureeHeures,              // Rétrocompatibilité
        local: local || ''
    };

    // Ajouter la séance
    seances.push(nouvelleSeance);

    // 🆕 BETA 95 : Sauvegarder dans la clé du cours actif
    db.setSync(cleCours, seances);

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Réinitialiser et cacher le formulaire
    annulerFormAjoutSeance();

    // Recharger l'affichage
    afficherSeancesExistantes();

    afficherNotificationSucces('Séance ajoutée');
}

/**
 * ✅ UTILITAIRE: Nettoie les doublons dans seancesHoraire
 * Garde la première occurrence de chaque séance unique (jour+debut+duree)
 * et supprime les duplicatas
 */
function nettoyerDoublons() {
    // 🆕 BETA 95 : Lire depuis la clé du cours actif
    const cleCours = cleHoraire(null);
    const seances = obtenirSeancesHoraire(null);

    if (seances.length === 0) {
        alert('Aucune séance à nettoyer');
        return;
    }

    const seancesUniques = [];
    const doublonsTrouves = [];

    seances.forEach((seance, index) => {
        // Vérifier si une séance identique existe déjà dans seancesUniques
        const existe = seancesUniques.find(s =>
            s.jour === seance.jour &&
            s.debut === seance.debut &&
            s.duree === seance.duree
        );

        if (!existe) {
            seancesUniques.push(seance);
        } else {
            doublonsTrouves.push(`${seance.lettre} (${seance.jour} ${seance.debut})`);
        }
    });

    if (doublonsTrouves.length === 0) {
        alert('Aucun doublon détecté');
        return;
    }

    const confirmation = confirm(
        `${doublonsTrouves.length} doublon(s) détecté(s):\n` +
        `${doublonsTrouves.join('\n')}\n\n` +
        `Veux-tu les supprimer ?`
    );

    if (!confirmation) {
        return;
    }

    // Recalculer les lettres pour les séances uniques
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    seancesUniques.forEach((seance, i) => {
        seance.lettre = lettres[i] || `S${i + 1}`;
    });

    // 🆕 BETA 95 : Sauvegarder dans la clé du cours actif
    db.setSync(cleCours, seancesUniques);

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Recharger
    afficherSeancesExistantes();

    afficherNotificationSucces(`${doublonsTrouves.length} doublon(s) supprimé(s)`);
}

/* ===============================
   NOTIFICATIONS
   =============================== */

/* ===============================
   📚 DOCUMENTATION DU MODULE
   
   ORDRE DE CHARGEMENT:
   1. Charger le module 01-config.js (variables globales)
   2. Charger ce module 10-horaire.js
   3. Appeler initialiserModuleHoraire() depuis 99-main.js
   
   DÉPENDANCES:
   - echapperHtml() depuis 01-config.js
   - Classes CSS depuis styles.css
   
   LOCALSTORAGE:
   - 'formatHoraire' : Format sélectionné ('2x2' ou '1x4')
   - 'seancesHoraire' : Array des séances configurées
   
   MODULES DÉPENDANTS:
   - 11-pratiques.js : Utilisera l'horaire pour calculer les présences
   
   ÉVÉNEMENTS:
   Tous les événements sont gérés via attributs HTML (onchange, onclick)
   sauf les radio buttons qui sont attachés dans initialiserModuleHoraire()
   
   COMPATIBILITÉ:
   - Nécessite ES6+ pour les arrow functions et template literals
   - Fonctionne avec tous les navigateurs modernes
   - Pas de dépendances externes
   ===============================*/

/* ===============================
   EXPORTS GLOBAUX
   =============================== */
// API publiques (lecture seule)
window.genererSeancesCompletes = genererSeancesCompletes;
window.obtenirSeancesCompletes = obtenirSeancesCompletes;
window.obtenirSeancesJour = obtenirSeancesJour;
window.obtenirRangSeanceDansSemaine = obtenirRangSeanceDansSemaine;

// 🆕 BETA 95 : Helpers pour clés multi-cours
window.cleSeancesCompletes = cleSeancesCompletes;
window.cleHoraire = cleHoraire;
window.obtenirSeancesHoraire = obtenirSeancesHoraire;

// Fonctions utilitaires
window.calculerHeureFin = calculerHeureFin;

// 🆕 BETA 95.1 : Gestion des périodes
window.obtenirDureePeriode = obtenirDureePeriode;
window.definirDureePeriode = definirDureePeriode;
window.periodesVersHeures = periodesVersHeures;
window.heuresVersPeriodes = heuresVersPeriodes;
window.periodesVersMinutes = periodesVersMinutes;
window.calculerHeureFinPeriodes = calculerHeureFinPeriodes;
window.genererOptionsNombrePeriodes = genererOptionsNombrePeriodes;
window.formaterDuree = formaterDuree;

/**
 * 🆕 BETA 95.1 : Handler UI pour modifier la durée de période
 * Appelé depuis le select #v2-dureePeriode dans index.html
 */
function modifierDureePeriodeV2(minutes) {
    if (typeof minutes === 'object' && minutes && minutes.value !== undefined) minutes = minutes.value;
    definirDureePeriode(parseInt(minutes));
    console.log(`[Horaire] Durée de période modifiée via UI: ${minutes} minutes`);

    // Afficher confirmation visuelle
    const select = document.getElementById('v2-dureePeriode');
    if (select) {
        select.style.transition = 'background-color 0.3s';
        select.style.backgroundColor = 'var(--alerte-fond-succes, #d4edda)';
        setTimeout(() => {
            select.style.backgroundColor = '';
        }, 1000);
    }
}
window.modifierDureePeriodeV2 = modifierDureePeriodeV2;

/**
 * 🆕 BETA 95.1 : Charger la durée de période sauvegardée dans l'UI
 * Appelé lors de l'initialisation de la page Trimestre
 */
function chargerDureePeriodeUI() {
    const select = document.getElementById('v2-dureePeriode');
    if (select) {
        const dureeSauvegardee = obtenirDureePeriode();
        select.value = dureeSauvegardee.toString();
        console.log(`[Horaire] Durée de période chargée: ${dureeSauvegardee} minutes`);
    }
}
window.chargerDureePeriodeUI = chargerDureePeriodeUI;

// Fonctions appelées depuis le HTML (onclick, onchange)
window.afficherFormulaireSeancesDynamique = afficherFormulaireSeancesDynamique;
window.ajouterFormulaireSeance = ajouterFormulaireSeance;
window.supprimerFormulaireSeance = supprimerFormulaireSeance;
window.confirmerSeances = confirmerSeances;
window.annulerAjoutSeance = annulerAjoutSeance;
window.afficherSeancesExistantes = afficherSeancesExistantes;
window.supprimerSeance = supprimerSeance;
window.modifierSeanceEnPlace = modifierSeanceEnPlace;
window.annulerEditionSeanceEnPlace = annulerEditionSeanceEnPlace;
window.sauvegarderEditionSeanceEnPlace = sauvegarderEditionSeanceEnPlace;
window.nettoyerDoublons = nettoyerDoublons;
window.afficherFormAjoutSeance = afficherFormAjoutSeance;
window.annulerFormAjoutSeance = annulerFormAjoutSeance;
window.confirmerAjoutSeance = confirmerAjoutSeance;

})();
