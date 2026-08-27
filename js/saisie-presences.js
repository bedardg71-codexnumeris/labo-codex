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
    return db.getSync(cle('modalitesEvaluation'), null) || {};
}

function initialiserModuleSaisiePresences() {

    const sectionSaisie = document.getElementById('suivi-saisie');
    if (!sectionSaisie) {
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
        const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE
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

        if (datesAvecSeances.length > 0) {
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

    return datesCours;
}

/* ===============================
   🕐 FONCTIONS DE SÉANCES
   =============================== */

/**
 * Ce que l'en-tête de saisie affiche quand l'horaire ne prévoit AUCUNE durée
 * pour ce jour de cours (#538). Le trou est nommé plutôt que comblé.
 */
const MENTION_DUREE_INCONNUE = 'durée inconnue : horaire à configurer';

/**
 * Durée en heures que l'HORAIRE du groupe-cours prévoit pour cette date.
 *
 * ⮕ #538 (26 août 2026, décision de Grégoire) — remplace les trois `2` en dur
 * qui vivaient dans `obtenirHeuresSeance`. La durée d'une séance n'est pas une
 * valeur métier à inventer : elle se DÉRIVE de l'horaire que l'utilisateur a
 * configuré, ou elle n'existe pas. Rien de codé en dur, et 0 quand l'horaire
 * ne dit rien — c'est `mettreAJourEnteteDateSeance` qui le DIT alors à l'écran.
 *
 * ⚠ LA CLÉ MORTE QUE CE HELPER REMPLACE. `db.getSync('formatHoraire')` : trois
 * lectures dans le dépôt, ZÉRO écriture depuis que le format vit dans l'entité
 * Horaire (même prémisse que #532, verrouillée par sa sentinelle cas B.b). La
 * comparaison `=== '1x4'` était donc TOUJOURS fausse : la branche « 4 heures »
 * n'a jamais été atteinte, et le repli valait toujours 2 heures — un nombre qui
 * entrait dans le calcul d'assiduité sans que rien ne l'ait jamais dit.
 *
 * ⚠ LE JOUR VISÉ N'EST PAS TOUJOURS LE JOUR RÉEL. Pour une reprise, c'est le
 * jour REMPLACÉ qui porte l'horaire — même règle que `genererSeancesCompletes`
 * (`horaire.js`). Diverger ici ferait lire le mauvais jour aux seules dates de
 * reprise, c'est-à-dire exactement là où personne ne regarde.
 *
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {number} Heures décimales prévues ce jour-là, ou 0 si l'horaire est muet
 */
/**
 * Périodes prévues par l'HORAIRE pour une date — somme des `nombrePeriodes` des séances
 * du jour visé. 0 si l'horaire ne dit rien.
 *
 * #540 lot E2 (26 août 2026). Sœur d'`obtenirHeuresPrevuesParHoraire`, qui rend des
 * heures d'HORLOGE. Les deux mesurent la même journée, mais pas la même grandeur — et
 * c'est précisément la confusion que ce lot ferme : on ne passe plus de l'une à l'autre
 * par une division.
 *
 * ⮕ POURQUOI AUCUNE DIVISION N'EST POSSIBLE ICI. Une période de cégep comprend sa pause :
 * 50 minutes d'enseignement plus 10 de pause ici, 55 plus 5 ailleurs. Diviser une durée
 * d'horloge par la durée d'ENSEIGNEMENT donnait 4 périodes pour un bloc de 08:00 à 11:00,
 * qui en fait trois — et 5 pour un bloc de quatre heures, qui en fait quatre. L'erreur
 * croissait avec la durée, et ce nombre est le dénominateur de l'assiduité.
 *
 * La règle de la reprise est celle de `genererSeancesCompletes` et
 * d'`obtenirHeuresPrevuesParHoraire` : c'est le jour REMPLACÉ qui porte l'horaire.
 *
 * @param {string} dateStr - Date (YYYY-MM-DD)
 * @returns {number} périodes, ou 0 — jamais un nombre inventé.
 */
function obtenirPeriodesPrevuesParHoraire(dateStr) {
    if (!dateStr) return 0;

    const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync('seancesHoraire', []);

    if (!Array.isArray(seancesHoraire) || seancesHoraire.length === 0) return 0;

    const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const infoJour = obtenirInfosJourCalendrier(dateStr);
    let jourVise = null;
    if (infoJour) {
        jourVise = (infoJour.statut === 'reprise' && infoJour.jourRemplace)
            ? infoJour.jourRemplace
            : infoJour.jourSemaine;
    }
    if (!jourVise) {
        const d = new Date(dateStr + 'T00:00:00');
        if (isNaN(d.getTime())) return 0;
        jourVise = JOURS[d.getDay()];
    }

    const cible = String(jourVise).toLowerCase();
    return seancesHoraire.reduce((total, seance) => {
        if (!seance || !seance.jour) return total;
        if (String(seance.jour).toLowerCase() !== cible) return total;
        const p = parseInt(seance.nombrePeriodes, 10);
        return total + (p > 0 ? p : 0);
    }, 0);
}

function obtenirHeuresPrevuesParHoraire(dateStr) {
    if (!dateStr) return 0;

    const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync('seancesHoraire', []);

    if (!Array.isArray(seancesHoraire) || seancesHoraire.length === 0) return 0;

    // Jour de semaine visé : le jour remplacé pour une reprise, le jour du
    // calendrier sinon, et à défaut celui que porte la date elle-même.
    const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const infoJour = obtenirInfosJourCalendrier(dateStr);
    let jourVise = null;
    if (infoJour) {
        jourVise = (infoJour.statut === 'reprise' && infoJour.jourRemplace)
            ? infoJour.jourRemplace
            : infoJour.jourSemaine;
    }
    if (!jourVise) {
        const d = new Date(dateStr + 'T00:00:00');
        if (isNaN(d.getTime())) return 0;
        jourVise = JOURS[d.getDay()];
    }

    const cible = String(jourVise).toLowerCase();
    return seancesHoraire.reduce((total, seance) => {
        if (!seance || !seance.jour) return total;
        if (String(seance.jour).toLowerCase() !== cible) return total;
        return total + mesurerDureeSeance(seance);
    }, 0);
}

/**
 * Durée en heures d'UNE séance, quelle que soit la forme sous laquelle elle est
 * écrite. Trois formes cohabitent dans les données réelles : `duree` en heures
 * décimales (entité Horaire), `debut`/`fin` (séances générées), et le couple
 * legacy `heureDebut`/`heureFin`.
 *
 * ⮕ #538 — rend 0 pour une séance illisible. Ne JAMAIS y remettre un défaut :
 * une séance dont on ne sait pas lire la durée ne dure pas 2 heures, elle dure
 * une durée inconnue, et c'est l'appelant qui doit le dire.
 *
 * @param {Object} seance
 * @returns {number} Heures décimales, ou 0 si la forme n'est pas lisible
 */
function mesurerDureeSeance(seance) {
    if (!seance) return 0;

    if (typeof seance.duree === 'number' && seance.duree > 0) return seance.duree;

    const paires = [[seance.debut, seance.fin], [seance.heureDebut, seance.heureFin]];
    for (const [debut, fin] of paires) {
        if (!debut || !fin) continue;
        const [hD, mD] = String(debut).split(':').map(Number);
        const [hF, mF] = String(fin).split(':').map(Number);
        if ([hD, mD, hF, mF].some(n => !Number.isFinite(n))) continue;
        const ecart = (hF + mF / 60) - (hD + mD / 60);
        if (ecart > 0) return ecart;
    }

    return 0;
}

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


    if (!seances || seances.length === 0) {
        // #538 : jour de cours sans séance datée — la durée se DÉRIVE de l'horaire
        // du groupe-cours, jamais d'un nombre écrit ici. 0 si l'horaire est muet.
        const infoJour = obtenirInfosJourCalendrier(dateStr);
        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            return obtenirHeuresPrevuesParHoraire(dateStr);
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
            // #538 : une séance illisible n'ajoute RIEN au total — d'où l'absence
            // d'instruction ici, qui est le comportement et non un oubli. L'ancien
            // code ajoutait 2 heures, un nombre inventé, autant de fois qu'il y
            // avait de séances mal formées : le dénominateur d'assiduité gonflait
            // d'autant. Si AUCUNE séance n'est lisible, la garde finale (plus bas)
            // retombe sur ce que l'horaire prévoit.
            // ⚠ Ne PAS y remettre un `totalHeures = ...` : l'invariant des trois
            // branches est l'accumulation (+=). L'ancien `=` wipait silencieusement
            // le total des séances précédentes — comportement order-dependent.
        }
    });

    // #538 : aucune séance lisible → on retombe sur ce que l'horaire prévoit,
    // et sur 0 s'il ne prévoit rien. Ce `|| 2` était la troisième valeur métier
    // en dur de cette fonction, et la plus discrète des trois.
    return totalHeures || obtenirHeuresPrevuesParHoraire(dateStr);
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

/*
 * #538 — `obtenirDureeMaxSeance()` RETIRÉE le 26 août 2026.
 *
 * Elle rendait `2` (« Simplification pédagogique : toujours 2h max par séance »)
 * — la CINQUIÈME valeur métier en dur de cette famille. Elle n'était appelée
 * NULLE PART : ni dans `js/`, ni dans `tests/`, ni dans `scripts/`, et jamais
 * exportée sur `window`. Ne subsistaient que trois mentions en commentaire
 * (deux dans l'en-tête de `etudiants.js`, une dans `obtenirNombrePeriodesSeance`
 * ci-dessous, corrigée en même temps).
 *
 * ⚠ Ne pas la ressusciter : un plafond de séance ne se décrète pas ici, il se
 * lit dans l'horaire du groupe-cours (`obtenirHeuresPrevuesParHoraire`).
 */

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

    // Garde null : obtenirSeancesCompletes peut retourner null/undefined.
    // Parite avec obtenirToutesDatesCours et calculerNombreSeances qui
    // verifient deja avec `if (seancesCompletes && Object.keys(...).length > 0)`.
    seancesCompletes = seancesCompletes || {};
    const seancesDuJour = seancesCompletes[dateStr];

    if (seancesDuJour && seancesDuJour.length > 0) {
        // Agreger toutes les seances du jour. (#538 : la phrase d'origine invoquait
        // `obtenirDureeMaxSeance()`, qui capait a 2 periodes -- retiree, elle
        // n'etait appelee nulle part.) Symetrie avec obtenirHeuresSeance qui agrege
        // deja avec forEach. Avant : seul seancesDuJour[0].nombrePeriodes etait
        // retourne, sous-comptant les jours multi-seances et polluant l'indice
        // d'assiduite.
        // #540 lot E2 (26 août 2026) : PLUS AUCUNE DIVISION. Le nombre de périodes est
        // une donnée SAISIE (lot E1), il se lit — il ne se déduit plus des heures.
        // Une séance qui ne le porte pas ne contribue pas : on ne la remplace par aucun
        // nombre, et le repli sur l'horaire ci-dessous prendra le relais s'il sait.
        const total = seancesDuJour.reduce((acc, s) => {
            const p = parseInt(s.nombrePeriodes, 10);
            return acc + (p > 0 ? p : 0);
        }, 0);
        if (total > 0) return total;
    }

    // #538 : le repli valait `2` en dur ; il lit l'horaire depuis. #540 lot E2 : il le lit
    // désormais en PÉRIODES, sans passer par les heures. Le détour heures → périodes était
    // la dernière division de cette chaîne, et la plus coûteuse : elle ignorait les pauses,
    // donc elle gonflait le dénominateur de l'assiduité dès qu'une séance dépassait deux
    // périodes. 0 si l'horaire ne prévoit rien ce jour-là — un refus de répondre.
    return obtenirPeriodesPrevuesParHoraire(dateStr);
}

/**
 * 🆕 BETA 95.1 : Génère les options du select de périodes présentes
 * @param {number} nombrePeriodesMax - Nombre maximum de périodes pour cette séance
 * @param {number} valeurSelectionnee - Valeur actuellement sélectionnée
 */
function genererOptionsPeriodesPresentes(nombrePeriodesMax, valeurSelectionnee = null) {
    let options = '';
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

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
                    // Continuer la validation normalement
                } else {
                    return { valide: false, raison: 'pas-cours', verrouille: false };
                }
            } else {
                return { valide: false, raison: 'pas-cours', verrouille: false };
            }
        } else if (infoJour.statut === 'conge' && infoJour.motif) {
            return { valide: false, raison: 'conge', motif: infoJour.motif, verrouille: false };
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
    } else {
        // 🆕 FIX (3 fév 2026) : Sauvegarder les présences AVANT de verrouiller
        sauvegarderPresencesSansValidation(dateStr);
        datesVerrouillees.push(dateStr);
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
    icone.innerHTML = estVerrouille ? '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon">';
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
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

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
}

/**
 * Vérifie que l'horaire du groupe-cours actif porte des séances
 *
 * FIX (26 août 2026, retour Jean-François) : la condition lisait AUSSI
 * `db.getSync('formatHoraire')` — une clé que PLUS PERSONNE N'ÉCRIT depuis que
 * le format vit dans l'entité Horaire du groupe-cours (`horaire.formatHoraire`,
 * js/entites/horaires.js). Grep exhaustif du dépôt : trois lectures, zéro
 * écriture. `!formatHoraire` était donc TOUJOURS vrai, et l'alerte « L'horaire
 * des cours n'est pas configuré » s'affichait quel que soit l'horaire réel —
 * invisible pour qui traîne un résidu de la Beta 95 dans son localStorage,
 * permanente pour tout nouvel utilisateur. Seule l'absence de séances compte.
 */
function verifierConfigurationFormatHoraire() {
    const alerteDiv = document.getElementById('alerteFormatHoraire');
    if (!alerteDiv) return;

    // 🆕 BETA 95 : Utiliser l'horaire du cours actif
    const seancesHoraire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync('seancesHoraire', []);

    // Le bandeau porte son propre texte (index.html, #alerteFormatHoraire) : on le
    // révèle ou on le masque, sans le réécrire. L'innerHTML retiré ici tenait un
    // SECOND message, divergent de celui du HTML, avec son propre lien.
    alerteDiv.classList.toggle('u-hide', seancesHoraire.length > 0);
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
                messageTableau = 'Sélectionne une date';
                messageCompteur = 'Sélectionne une date';
                break;
            case 'conge':
                messageTableau = '';
                messageCompteur = validation.motif + ' \u2014 pas de cours';
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
    // #538 : une durée à 0 sur un jour de cours n'est plus un blanc silencieux.
    // Avant, `formaterHeuresAffichage(0)` rendait '' et l'en-tête taisait le
    // trou ; le tableau se remplissait quand même, avec 2 heures inventées.
    // Désormais la durée vient de l'horaire — et quand l'horaire ne dit rien,
    // c'est CE message qui l'apprend à l'utilisateur, à l'endroit exact où il
    // s'apprête à saisir.
    const dureeInconnue = !heures;
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
        } else if (dureeInconnue) {
            message += message ? ` \u2014 ${MENTION_DUREE_INCONNUE}` : MENTION_DUREE_INCONNUE;
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
        } else if (dureeInconnue) {
            message += ` \u2014 ${MENTION_DUREE_INCONNUE}`;
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
    let etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    // Garde null (99.30) : install fraiche / cours sans etudiants -> sort()
    // crash. Parite avec sauvegarderPresencesSansValidation:616 et obtenir
    // DonneesSelonMode pattern dans le reste du module.
    etudiants = etudiants || [];
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
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

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
        // data-facultatif (99.30) : permet a appliquerCodeCouleurPeriodes
        // (live update) de re-appliquer 'saisie-absence-motivee' (jaune R∂I)
        // au lieu de degrader vers 'saisie-absence' (rouge) sur edition utilisateur.
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
                   data-facultatif="${estFacultatif ? 'true' : 'false'}"
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
                       placeholder="Notes…"
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
        nbEtudiants.textContent = '(' + etudiantsFiltres.length + ' ' + window.pluriel(etudiantsFiltres.length, 'étudiant·e', 'étudiant·es') + ')';
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

    // Lire le flag estFacultatif persiste sur le DOM par chargerTableauPresences.
    // Sans ce flag, l'edition live d'une absence motivee (jaune R∂I) la
    // degraderait silencieusement en absence simple (rouge).
    const estFacultatif = inputPeriodes.dataset.facultatif === 'true';

    // Retirer toutes les classes
    inputPeriodes.classList.remove('saisie-absence', 'saisie-absence-motivee', 'saisie-retard', 'saisie-present', 'saisie-vide');

    // Appliquer la bonne classe
    if (valeur === 0) {
        inputPeriodes.classList.add(estFacultatif ? 'saisie-absence-motivee' : 'saisie-absence');
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
    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);
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
        alert('Sélectionne une date');
        return;
    }

    const dateStr = dateInput.value;
    const validation = validerDateSaisie(dateStr);

    if (validation.verrouille) {
        alert('Cette date est verrouillée. Déverrouille-la d\'abord pour modifier les présences.');
        return;
    }

    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';

    // 🆕 BETA 95.7 (23 jan) : Utiliser UNIQUEMENT les étudiants du groupe-cours actif
    let etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    // Garde null (99.30) : evite crash filter() si install fraiche.
    etudiants = etudiants || [];
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
    const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

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

    // Protection : bloquer en mode anonymisation (lecture seule)
    if (!sauvegarderDonneesSelonMode('presences', presences)) {
        notifications.erreur('Modification impossible', 'Impossible de sauvegarder les présences en mode anonymisation');
        return;
    }

    notifications.succes('Présences enregistrées');

    calculerEtSauvegarderIndicesAssiduite();

    // ========== NOUVEAU : Recharger le tableau de bord ==========
    // Si le sous-onglet Suivi > Suivi du groupe est actif, le rafraîchir.
    const sousSectionGroupe = document.getElementById('suivi-groupe');
    if (sousSectionGroupe && sousSectionGroupe.classList.contains('active')) {
        if (typeof chargerTableauBordApercu === 'function') {
            setTimeout(() => chargerTableauBordApercu(), 300);
        }
    }

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

    if (nbAbsencesMotiveesPreservees > 0) {
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

    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        return;
    }

    const dateActuelle = dateInput.value;
    const datesCours = obtenirToutesDatesCours();


    // Trouver le prochain cours après la date actuelle
    let coursSuivant = null;
    for (let i = 0; i < datesCours.length; i++) {
        if (datesCours[i] > dateActuelle) {
            coursSuivant = datesCours[i];
            break;
        }
    }

    if (coursSuivant) {
        dateInput.value = coursSuivant;
        initialiserSaisiePresences();
        mettreAJourBoutonsNavigation();
    } else {
    }
}

/**
 * Navigate vers le cours précédent
 */
function allerCoursPrecedent() {

    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
        return;
    }

    const dateActuelle = dateInput.value;
    const datesCours = obtenirToutesDatesCours();


    // Trouver le cours précédent avant la date actuelle
    let coursPrecedent = null;
    for (let i = datesCours.length - 1; i >= 0; i--) {
        if (datesCours[i] < dateActuelle) {
            coursPrecedent = datesCours[i];
            break;
        }
    }

    if (coursPrecedent) {
        dateInput.value = coursPrecedent;
        initialiserSaisiePresences();
        mettreAJourBoutonsNavigation();
    } else {
    }
}

/**
 * Met à jour l'état des boutons de navigation
 */
function mettreAJourBoutonsNavigation() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) {
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
    }

    if (btnSuivant) {
        btnSuivant.disabled = !coursSuivant;
        btnSuivant.style.opacity = coursSuivant ? '1' : '0.5';
        btnSuivant.style.cursor = coursSuivant ? 'pointer' : 'not-allowed';
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

    // Naviguer vers la section suivi (saisie des présences)
    if (typeof sectionActive !== 'undefined' && sectionActive !== 'suivi') {
        if (typeof afficherSection === 'function') {
            afficherSection('suivi');
        }
    }

    // Afficher la sous-section saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('suivi-saisie');
    }

    // Mettre à jour les boutons de navigation
    setTimeout(() => {
        const boutonsNav = document.querySelectorAll('.sous-navigation button');
        boutonsNav.forEach(btn => {
            btn.classList.remove('actif');
            if (btn.getAttribute('data-sous-onglet') === 'suivi-saisie') {
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

// naviguerVersReglagesTrimestre() RETIRÉE d'ici le 26 août 2026 (retour
// Jean-François) : elle était définie DEUX FOIS — ici et dans main.js, que
// index.html charge APRÈS ce fichier. La définition de main.js gagnait donc
// toujours, et c'était la mauvaise. Une seule implémentation subsiste, dans main.js
// (wrappers de navigation globaux), et elle mène à Cadre, pas à Réglages.

function mettreAJourLignePeriodesHandler(el) {
    mettreAJourLignePeriodes(el.dataset.da, el.dataset.dateStr, parseInt(el.dataset.nbPeriodes));
}

/* ===============================
   📌 EXPORT GLOBAL ET LOGS
   =============================== */

// Rendre les fonctions disponibles globalement
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

    // Le message peut contenir validation.motif (texte libre saisi par
    // l'utilisateur en config calendrier). echapperHtml() obligatoire avant
    // injection dans innerHTML pour eviter XSS via motif crafte.
    compteur.innerHTML = `
        <span style="color: var(--texte-secondaire); font-style: italic;">
            ${echapperHtml(message)}
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
                <button class="btn btn-annuler btn-compact" data-action="afficherSousSection" data-param="suivi-apercu-legacy">Annuler</button>
                <span id="controle-verrouillage-presences" class="u-hide" style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
                    <input type="checkbox" id="checkbox-verrouillage-presences"
                           style="width: 16px; height: 16px; accent-color: var(--bleu-principal, #1a73e8); cursor: pointer;"
                           data-on-change="basculerVerrouillageDateActive">
                    <label for="checkbox-verrouillage-presences" style="cursor: pointer; user-select: none; white-space: nowrap;">
                        <span id="icone-verrouillage-presences"><img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon"></span>
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

// #540 lot C (26 août 2026) — SOURCE UNIQUE de la mesure d'une séance.
// `trimestre-v2-horaires.js` réinventait la sienne, en trois endroits et avec un
// repli à 2 périodes ; l'écran affichait donc une durée que le calcul d'assiduité
// ne reconnaissait pas. Une seule fonction mesure désormais, pour les deux.
window.mesurerDureeSeance = mesurerDureeSeance;
// #540 lot E2 — les périodes prévues par l'horaire, sans conversion.
window.obtenirPeriodesPrevuesParHoraire = obtenirPeriodesPrevuesParHoraire;
// Sa sœur en HEURES d'horloge — exportée pour que la sentinelle #538 puisse éprouver
// que les deux grandeurs restent distinctes et ne se déduisent plus l'une de l'autre.
window.obtenirHeuresPrevuesParHoraire = obtenirHeuresPrevuesParHoraire;
window.genererOptionsPeriodesPresentes = genererOptionsPeriodesPresentes;

/* ===============================
   🔄 RECHARGEMENT AUTOMATIQUE
   =============================== */

/**
 * Surveille l'activation de la sous-section 'suivi-saisie'
 * et recharge automatiquement le tableau pour refléter les changements
 * faits depuis d'autres sections (ex: modifications d'interventions RàI)
 */
document.addEventListener('DOMContentLoaded', function() {
    const sectionSaisie = document.getElementById('suivi-saisie');
    if (!sectionSaisie) return;

    // Observer les changements de la classe 'active' sur la sous-section
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Si la sous-section vient de devenir active
                if (sectionSaisie.classList.contains('active')) {
                    const dateInput = document.getElementById('date-cours');
                    if (dateInput && dateInput.value) {
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

});

// ================================================================
// API SSOT — Points d'écriture centralisés pour `presences`
// Tier 6.4 : Les modules externes doivent passer par ces fonctions
// au lieu d'écrire directement dans cle('presences').
// ================================================================

/**
 * Modifie les notes confidentielles d'une présence existante.
 * Utilisé par : profil-etudiant.js (modal confidentiel)
 *
 * @param {string} da - DA de l'étudiant
 * @param {string} date - Date de la séance (format ISO)
 * @param {string} notes - Nouvelles notes
 * @param {string} [coursId] - ID du cours (optionnel, defaut = cours actif).
 *   Empeche les fuites de notes confidentielles entre cours dans setups
 *   multi-cours (un meme etudiant peut etre enrole dans plusieurs cours
 *   le meme jour ; sans coursId, la 1ere entree (da, date) etait ecrasee
 *   au lieu de celle du cours en cours de consultation).
 * @returns {boolean} true si modifié
 */
window.modifierNotesPresence = function(da, date, notes, coursId) {
    if (coursId === undefined && typeof obtenirCoursActifId === 'function') {
        coursId = obtenirCoursActifId();
    }
    var clePresences = cle('presences');
    var presences = db.getSync(clePresences, []);
    var modifie = false;

    for (var i = 0; i < presences.length; i++) {
        // Match (da, date) ET coursId si dispos. Pattern aligne sur les autres
        // writers (enregistrerPresences, sauvegarderPresencesSansValidation,
        // ajouterPresencesIntervention) qui filtrent tous par coursId.
        var p = presences[i];
        var matchCoursId = !coursId || !p.coursId || p.coursId === coursId;
        if (p.da === da && p.date === date && matchCoursId) {
            p.notes = notes;
            modifie = true;
            break;
        }
    }

    if (modifie) {
        db.setSync(clePresences, presences);
        // Pas de recalcul d'indices nécessaire (les notes n'affectent pas l'assiduité)
    }
    return modifie;
};

/**
 * Ajoute des entrées de présence depuis une intervention RàI.
 * Utilisé par : interventions.js (transfererPresencesVersModule)
 *
 * @param {Array} entrees - Objets présence { da, date, periodesPresentes, heures, notes, coursId, facultatif }
 * @returns {number} nombre d'entrées ajoutées
 */
window.ajouterPresencesIntervention = function(entrees) {
    if (!entrees || entrees.length === 0) return 0;

    var clePresences = cle('presences');
    var presences = db.getSync(clePresences, []);
    var ajoutees = 0;

    for (var i = 0; i < entrees.length; i++) {
        var e = entrees[i];
        // Vérifier doublon (même da + même date + même coursId)
        var existe = presences.some(function(p) {
            return p.da === e.da && p.date === e.date && p.coursId === e.coursId;
        });
        if (!existe) {
            // Marquer comme facultatif (intervention RàI)
            e.facultatif = true;
            presences.push(e);
            ajoutees++;
        }
    }

    if (ajoutees > 0) {
        db.setSync(clePresences, presences);
        // Recalculer les indices d'assiduité (les présences facultatives comptent)
        if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
            calculerEtSauvegarderIndicesAssiduite();
        }
    }
    return ajoutees;
};

})();
