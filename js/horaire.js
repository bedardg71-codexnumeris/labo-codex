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
 *
 * ⚠ LE COURS NE SUFFIT PAS À DÉSIGNER DES SÉANCES. Les dates vivent par
 * GROUPE-COURS, jamais par cours : deux groupes du même cours ont deux
 * horaires, donc deux calendriers de séances. Le paramètre `coursId` n'est
 * qu'un dernier recours, quand aucun groupe n'est déterminé.
 *
 * @param {string|null} coursId - ID du cours (null = cours actif)
 * @param {string|null} groupeCoursId - Groupe-cours EXPLICITE (#416 lot C).
 *   Absent = le groupe ACTIF, comportement historique inchangé. Fourni = ce
 *   groupe-là, sans lire l'état global. Un export doit pouvoir désigner un
 *   groupe qui n'est pas celui qu'on a sous les yeux : un cours à plusieurs
 *   groupes est le cas fréquent, et le groupe est choisi au moment de
 *   l'export (D9, tranchée le 12 août 2026).
 * @returns {string} - Clé de stockage (ex: "seancesCompletes_gc_GC_1786…")
 */
function cleSeancesCompletes(coursId, groupeCoursId = null) {
    // Groupe explicite : il commande, et on ne consulte pas l'état global.
    if (groupeCoursId) {
        return `seancesCompletes_gc_${groupeCoursId}`;
    }

    // 🆕 FIX (3 fév 2026) : Utiliser groupeCoursId pour différencier les groupes
    // Chaque groupe-cours a son propre horaire et donc ses propres dates de séances
    const groupeCoursActif = db.getSync('groupeCoursActif', null);
    const groupeCoursIdActif = groupeCoursActif?.id || '';

    if (groupeCoursIdActif) {
        // Clé unique par groupe-cours
        return `seancesCompletes_gc_${groupeCoursIdActif}`;
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
/**
 * #830 (11 sept. 2026) — LES SÉANCES D'UN HORAIRE D'AVANT #540 HÉRITENT DU
 * FORMAT DE L'HORAIRE.
 *
 * L'INCIDENT, mesuré sur les données de Grégoire : la barre « Assiduité (A) »
 * du Suivi du groupe était VIDE pour ses deux groupes d'Hiver 2026. Depuis
 * #540 lot E2 (26 août), le nombre de périodes d'une séance est une donnée
 * SAISIE (`seance.nombrePeriodes`) — il ne se déduit plus des heures, par
 * décision. Ses trois horaires H2026 (janvier) ne portent que `heureDebut`,
 * `heureFin`, `local` : zéro période offerte, zéro séance comptée, barre vide,
 * sans un mot. Le stock d'avant le lot n'avait jamais reçu ses périodes.
 *
 * Or l'horaire lui-même porte `periodesParSeance` (ici 2) : le FORMAT que
 * l'utilisateur a saisi à la création (« N séances de P périodes »), que
 * l'éditeur d'horaire reprend déjà comme repli d'affichage
 * (trimestre-v2-horaires.js, « reprises »). Ce n'est pas une déduction depuis
 * les heures — c'est une saisie de niveau horaire. On la projette sur toute
 * séance qui n'a pas la sienne, EN LECTURE : l'entité n'est pas réécrite (les
 * séances qui ont leur `nombrePeriodes` le gardent ; un horaire sans
 * `periodesParSeance` rend ses séances telles quelles, donc 0 — le refus de
 * répondre de #540 tient).
 *
 * Point unique : tout ce qui lit l'horaire résolu (génération des séances
 * complètes, repli `obtenirPeriodesPrevuesParHoraire`, heures prévues) passe
 * par obtenirSeancesHoraire, donc hérite ici.
 */
function projeterPeriodesParSeance(horaire) {
    const parDefaut = parseInt(horaire && horaire.periodesParSeance, 10);
    if (!(parDefaut > 0)) return horaire.seances;
    return horaire.seances.map(s => {
        if (!s || typeof s !== 'object') return s;
        if (parseInt(s.nombrePeriodes, 10) > 0) return s;
        return Object.assign({}, s, { nombrePeriodes: parDefaut });
    });
}

function obtenirSeancesHoraire(coursId) {
    // 1. PRIORITÉ à l'entité Horaire du groupe-cours actif
    // Chaque groupe-cours peut avoir son propre horaire (Lun-Jeu vs Mar-Ven).
    // 🔧 FIX #332 (11 juin 2026) : la SSOT `groupesCours[].horaireId` fait foi.
    // L'ancien ordre lisait d'abord la COPIE `groupeCoursActif.horaireId`
    // (pointeur dénormalisé) — toute désync copie/SSOT servait silencieusement
    // le mauvais horaire (cas réel GC 00008, cache régénéré Lun-Jeu malgré
    // l'intention Mar-Jeu). La copie ne sert plus que si le groupe-cours est
    // INTROUVABLE dans la SSOT (état transitoire) — jamais pour la contredire.
    try {
        const groupeCoursActif = db.getSync('groupeCoursActif', null);

        if (groupeCoursActif) {
            const groupesCours = db.getSync(cle('groupesCours'), []);
            const gc = Array.isArray(groupesCours)
                ? groupesCours.find(g => g && g.id === groupeCoursActif.id)
                : null;
            // SSOT si le GC y figure ; copie en dernier recours sinon
            const horaireId = gc ? gc.horaireId : groupeCoursActif.horaireId;
            // Cadrage « Rencontres » (12 sept. 2026) — un groupe-cours de SERVICE peut n'avoir
            // aucun horaire (mesure 2 du 11 sept. : la présence se note dans la rencontre).
            // Sans ce retour, les replis 2-4 ci-dessous lui serviraient l'horaire du DERNIER
            // groupe-cours activé dans le même trimestre (miroirs `horaireHebdo` /
            // `seancesHoraire`, écrits par l'activation) : un calendrier étranger, en silence.
            // Un service sans horaire rend vide, et les écrans le disent. Un groupe-cours
            // ORDINAIRE sans horaireId garde ses replis : rien ne bouge pour l'enseignant.
            if (gc && !horaireId && typeof contexteActifEstService === 'function' && contexteActifEstService()) {
                return [];
            }
            if (horaireId) {
                const horaires = db.getSync(cle('horaires'), []);
                const horaire = horaires.find(h => h.id === horaireId);
                if (horaire && horaire.seances && horaire.seances.length > 0) {
                    return projeterPeriodesParSeance(horaire);
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
        return seances;
    }

    // 3. Fallback sur horaireHebdo (format V2)
    seances = db.getSync(cle('horaireHebdo'), null);
    if (seances && seances.length > 0) {
        return seances;
    }

    // 4. Fallback sur seancesHoraire namespacé par trimestre
    seances = db.getSync(cle('seancesHoraire'), null);
    if (seances && seances.length > 0) {
        return seances;
    }

    // #464/CT-11 (21 août 2026) : le fallback n°5 (clé legacy NUE) est RETIRÉ —
    // sur un trimestre neuf sans horaire, il resservait les séances du trimestre
    // PRÉCÉDENT restées dans le résidu nu. Le résidu est rapatrié une fois par
    // migrerResidusClesNues() ; un trimestre sans horaire rend désormais vide.
    return [];
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

    // Vérifier que nous sommes dans la bonne section
    const container = document.getElementById('seancesContainer');
    if (!container) {
        return;
    }

    // Afficher les séances existantes
    afficherSeancesExistantes();

    // Générer les séances complètes du trimestre
    genererSeancesCompletes();

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
 * Source unique : clé namespacée `dureePeriode` (domaine horaire — SSOT Lot 0).
 * Le rapatriement depuis l'ancien emplacement legacy est assuré au boot par
 * purgerLegacy() du module propriétaire des modalités (Lot 3 #328) — plus de
 * migration paresseuse ici.
 * @returns {number} Durée en minutes (défaut: 55)
 */
/**
 * Duree d'une periode d'enseignement, en minutes, quand le trimestre courant
 * n'en declare aucune.
 *
 * SOURCE UNIQUE du defaut. Il vivait auparavant en litteral `55` dans quatorze
 * sites de calcul et une option `selected` d'index.html : le meme defaut ecrit
 * quinze fois, donc quinze occasions de diverger.
 *
 * Porte a 50 le 22 aout 2026, a la demande de Gregoire (ses periodes durent
 * 50 minutes). Le repli ne s'applique QU'A defaut de valeur enregistree : un
 * trimestre qui declare la sienne n'est pas touche.
 *
 * ⚠ NE PAS confondre avec les `55` de la notation (plafondVerrou,
 * grande_difficulte, seuils d'echelle) : ce sont des NOTES, pas des minutes.
 */
const DUREE_PERIODE_DEFAUT = 50;

/**
 * ⚠ #540 lot E3 (26 août 2026) — CECI N'EST PLUS UN RÉGLAGE. NE PAS LE REMETTRE À L'ÉCRAN.
 *
 * Le select « Durée d'une période » a été RETIRÉ, et avec lui `definirDureePeriode` et
 * les deux handlers qui le servaient. Décision de Grégoire, après un audit qui a montré
 * que ce champ n'existait que comme PONT entre deux unités — l'horaire se saisissait en
 * heures d'horloge, la présence en périodes. Or un ratio est invariant par unité : cette
 * valeur ne servait pas à CALCULER l'assiduité, seulement à réconcilier deux modes de
 * saisie. Et elle ne pouvait pas bien le faire : une période comprend sa PAUSE (50 + 10
 * ici, 55 + 5 ailleurs), donc aucune durée d'horloge ne rend un nombre de périodes.
 * Depuis E1, chaque séance PORTE son nombre de périodes ; plus rien ne se déduit.
 *
 * CE QUI SUBSISTE, ET POURQUOI. Onze sites lisent encore cette valeur — tous pour relire
 * le champ `heures` d'anciennes présences, que la saisie n'écrit plus (E3). C'est un
 * paramètre de DÉSÉRIALISATION d'un format historique, pas une donnée métier : `heures`
 * y était écrit comme `periodesPresentes × dureePeriode / 60`, on refait l'aller-retour
 * avec le même diviseur et on retombe sur la valeur d'origine. Rien de neuf ne s'y
 * calcule.
 *
 * ⮕ Si un besoin de « durée d'une période » réapparaît, ce n'est PAS cette clé qu'il faut
 * ressusciter : c'est une donnée par séance, comme `nombrePeriodes`.
 */
function obtenirDureePeriode() {
    return db.getSync(cle('dureePeriode'), null) || DUREE_PERIODE_DEFAUT;
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

    // Migrer les anciennes données si nécessaire
    migrerDonneesSeances();

    // 🆕 BETA 95 : Lire les séances horaire du cours spécifique
    const seancesHoraire = obtenirSeancesHoraire(idCours);

    // 🔍 FIX #220 : Log diagnostic pour vérifier le bon nombre de séances
    const joursUniques = [...new Set(seancesHoraire.map(s => s.jour))];

    // Clé de sortie spécifique au cours
    const cleOutput = cleSeancesCompletes(idCours);

    if (seancesHoraire.length === 0) {
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
                    // #540 lot E1 (26 août 2026) — LES HEURES SE PERDAIENT ICI.
                    // Les séances du formulaire d'horaire portent `heureDebut`/`heureFin`,
                    // jamais `debut`/`fin` : cette projection écrivait donc `debut:
                    // undefined` et une `fin` calculée à partir de rien. Le cache ne
                    // contenait plus rien d'exploitable, et `obtenirNombrePeriodesSeance`
                    // repartait interroger l'horaire par un détour — d'où le repli à 2 qui
                    // se déclenchait si souvent (lot C). On accepte les deux nommages.
                    debut: seance.debut || seance.heureDebut,
                    fin: seance.fin || seance.heureFin
                        || calculerHeureFin(seance.debut || seance.heureDebut, seance.duree),
                    duree: seance.duree, // Ajouter durée pour compatibilité
                    // #540 lot E1 : le nombre de périodes SAISI suit la séance jusqu'au
                    // cache. Sans lui, le dénominateur de l'assiduité ne verrait jamais ce
                    // que l'utilisateur a déclaré à l'écran Horaire.
                    nombrePeriodes: seance.nombrePeriodes,
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
    db.setSyncSiChange(cleOutput, seancesCompletes);   // #1040 : rien si inchangé

    if (idCours) {
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
        return genererSeancesCompletes(coursId);
    }

    return seancesCompletes;
}

/**
 * Séances d'un groupe-cours DÉSIGNÉ, en lecture stricte (#416 lot C).
 *
 * ⚠ POURQUOI UNE PORTE SÉPARÉE, ET PAS UN PARAMÈTRE DE PLUS SUR
 * `obtenirSeancesCompletes`. Cette dernière n'est pas une lecture : quand le
 * cache manque, elle appelle `genererSeancesCompletes`, qui ÉCRIT. Et ce qu'elle
 * régénère vient de l'horaire du groupe ACTIF. Lui passer un groupe étranger
 * reviendrait à écrire les séances de l'un sous la clé de l'autre — un vecteur
 * de corruption qu'aucun appelant n'atteint aujourd'hui, mais que la colonne
 * Date rendrait atteignable dès le premier export.
 *
 * Ici : on lit, ou on rend vide. Jamais de génération, jamais d'écriture. Une
 * colonne Date vide est un état dégradé prévu ; une clé écrasée n'en est pas un.
 *
 * @param {string} groupeCoursId - Groupe-cours dont on veut les séances
 * @returns {Object} - Table `date -> [séances]`, ou {} si rien n'est en cache
 */
function obtenirSeancesCompletesDuGroupe(groupeCoursId) {
    if (!groupeCoursId || typeof groupeCoursId !== 'string') return {};

    const seances = db.getSync(cleSeancesCompletes(null, groupeCoursId), null);

    // Un objet non nul mais d'un autre type serait une donnée corrompue : on ne
    // la propage pas au générateur d'export, qui itérerait dans le vide.
    if (!seances || typeof seances !== 'object' || Array.isArray(seances)) return {};

    return seances;
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
 * API publique : Détermine le rang de la séance dans sa semaine (1re, 2e, etc.)
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
 * // => { rang: 1, total: 2, ordinal: '1re' }
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
        const ordinaux = ['', '1re', '2e', '3e', '4e', '5e'];
        const ordinal = ordinaux[rang] || `${rang}e`;

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

    // Rafraîchir l'affichage des séances existantes
    afficherSeancesExistantes();

    // Régénérer les séances complètes du cours
    genererSeancesCompletes(null);

    // Masquer le formulaire
    annulerAjoutSeance();

    // Notification
    const nbSeances = seancesAEnregistrer.length;
    const message = nbSeances === 1
        ? 'Séance enregistrée'
        : `${nbSeances} séances enregistrées`;
    notifications.succes(message);

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
    // CT-09 : jour/début/fin/local étaient échappés, pas la lettre ni le nom.
    const nomSeance = echapperHtml(seance.lettre || seance.nom || '?');

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
    // CT-09 : `nom` est le repli des données antérieures et n'était pas échappé.
    const nomSeance = echapperHtml(seance.lettre || seance.nom || '?');
    const groupeEchappe = echapperHtml(seance.groupe || '');

    return `
<div class="item-carte" id="carte-seance-${index}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">Séance ${nomSeance}${groupeEchappe ? ` - Groupe ${groupeEchappe}` : ''}</strong>
        <div class="item-carte-actions">
            <button class="btn btn-annuler btn-sm" data-action="annulerEditionSeanceEnPlace">Annuler</button>
            <button class="btn btn-confirmer btn-sm" data-action="sauvegarderEditionSeanceEnPlace" data-param="${index}">Enregistrer</button>
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
                   value="${echapperAttribut(seance.debut || '')}">
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
                   value="${echapperAttribut(seance.local || '')}" placeholder="Ex: 1709">
        </div>
    </div>
    <input type="hidden" id="edit-lettre-${index}" value="${echapperAttribut(seance.lettre || '')}">
    <input type="hidden" id="edit-groupe-${index}" value="${echapperAttribut(seance.groupe || '')}">
    <input type="hidden" id="edit-nombrePeriodes-${index}" value="${echapperAttribut(seance.nombrePeriodes || '')}">
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

    notifications.succes('Séance modifiée');
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

    notifications.succes('Séance supprimée');
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
window.obtenirSeancesCompletesDuGroupe = obtenirSeancesCompletesDuGroupe;
window.obtenirSeancesJour = obtenirSeancesJour;
window.obtenirRangSeanceDansSemaine = obtenirRangSeanceDansSemaine;

// 🆕 BETA 95 : Helpers pour clés multi-cours
window.cleSeancesCompletes = cleSeancesCompletes;
window.cleHoraire = cleHoraire;
window.obtenirSeancesHoraire = obtenirSeancesHoraire;

// Fonctions utilitaires
window.calculerHeureFin = calculerHeureFin;

// 🆕 BETA 95.1 : Gestion des périodes
window.DUREE_PERIODE_DEFAUT = DUREE_PERIODE_DEFAUT;
window.obtenirDureePeriode = obtenirDureePeriode;
window.periodesVersHeures = periodesVersHeures;
window.heuresVersPeriodes = heuresVersPeriodes;
window.periodesVersMinutes = periodesVersMinutes;
window.calculerHeureFinPeriodes = calculerHeureFinPeriodes;
window.genererOptionsNombrePeriodes = genererOptionsNombrePeriodes;
window.formaterDuree = formaterDuree;



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

})();
