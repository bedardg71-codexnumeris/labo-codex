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
 * FONCTIONNEMENT:
 * 1. Lit seancesHoraire (séances hebdomadaires configurées)
 * 2. Lit calendrierComplet (tous les jours du trimestre)
 * 3. Pour chaque jour de cours, crée les séances correspondantes
 * 4. Stocke dans db.setSync('seancesCompletes')
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
 * RETOUR:
 * - Object avec toutes les séances datées
 */
function genererSeancesCompletes() {
    console.log('📚 Génération des séances complètes du trimestre...');

    // Migrer les anciennes données si nécessaire
    migrerDonneesSeances();

    // Lire les séances hebdomadaires configurées
    const seancesHoraire = db.getSync('seancesHoraire', []);

    if (seancesHoraire.length === 0) {
        console.log('   ⚠️  Aucune séance hebdomadaire configurée');
        db.setSync(cle('seancesCompletes'), {});
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
            return;
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

    // ÉTAPE 3 : Ajouter les jours de cours sans séances configurées
    Object.entries(calendrierComplet).forEach(([dateStr, infosJour]) => {
        if ((infosJour.statut === 'cours' || infosJour.statut === 'reprise') && !seancesCompletes[dateStr]) {
            seancesCompletes[dateStr] = [];
        }
    });

    // Stocker dans localStorage - LA SOURCE UNIQUE
    db.setSync(cle('seancesCompletes'), seancesCompletes);

    console.log(`✅ Séances complètes générées: ${compteurSeances} séances`);
    console.log(`   - Réparties sur ${Object.keys(seancesCompletes).length} jours de cours`);

    return seancesCompletes;
}

/**
 * API publique pour obtenir les séances complètes
 * @returns {Object} - Séances complètes du trimestre
 */
function obtenirSeancesCompletes() {
    // db.getSync retourne déjà l'objet parsé, pas besoin de JSON.parse
    const seancesCompletes = db.getSync(cle('seancesCompletes'), null);

    if (!seancesCompletes) {
        console.log('⚠️  seancesCompletes non trouvé, génération...');
        return genererSeancesCompletes();
    }

    return seancesCompletes;
}

/**
 * API publique pour obtenir les séances d'une date spécifique
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} - Séances de cette date (ou tableau vide)
 */
function obtenirSeancesJour(dateStr) {
    const seancesCompletes = obtenirSeancesCompletes();
    return seancesCompletes[dateStr] || [];
}

/**
 * API publique : Détermine le rang de la séance dans sa semaine (1ère, 2ème, etc.)
 * 🎯 SOURCE UNIQUE DE VÉRITÉ pour le calcul du rang
 *
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Object|null} - {rang: number, total: number, ordinal: string} ou null
 *
 * @example
 * const rang = obtenirRangSeanceDansSemaine('2025-11-12');
 * // => { rang: 1, total: 2, ordinal: '1ère' }
 */
function obtenirRangSeanceDansSemaine(dateStr) {
    try {
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        const seancesCompletes = db.getSync(cle('seancesCompletes'), {});

        const infoJour = calendrier[dateStr];
        if (!infoJour || !infoJour.numeroSemaine) return null;

        const numSemaine = infoJour.numeroSemaine;

        // Trouver tous les jours de cours de cette semaine qui ont des séances
        const joursAvecSeances = Object.entries(calendrier)
            .filter(([date, info]) =>
                info.numeroSemaine === numSemaine &&
                (info.statut === 'cours' || info.statut === 'reprise') &&
                seancesCompletes[date] &&
                seancesCompletes[date].length > 0
            )
            .map(([date]) => date)
            .sort();

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
    const etudiants = db.getSync('groupeEtudiants', []);

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
    // Charger les séances existantes ou initialiser avec une séance vide
    const seancesHoraire = db.getSync('seancesHoraire', []);

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
            duree: '',
            local: ''
        }];
    }

    // Afficher le formulaire
    document.getElementById('formAjoutSeance').style.display = 'block';

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
        <div class="seance-form-item" data-index="${index}" style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid var(--bleu-leger);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: var(--bleu-moyen); font-size: 1.05rem;">Séance ${lettre}</strong>
                ${seancesEnCours.length > 1 ? `
                    <button type="button" class="btn btn-supprimer btn-tres-compact" onclick="supprimerFormulaireSeance(${index})">
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
                    <select class="controle-form" id="debut_${index}" required>
                        ${genererOptionsHeureDebut()}
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; font-weight: 500;">Durée</label>
                    <select class="controle-form" id="duree_${index}" required>
                        ${genererOptionsDuree()}
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
            <button type="button" class="btn" onclick="ajouterFormulaireSeance()"
                    style="width: 100%; margin-top: 10px; background: var(--bleu-leger); color: var(--bleu-moyen);">
                Ajouter une séance
            </button>
        `;
    } else {
        html += `
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px; margin-top: 10px; text-align: center;">
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
        const dureeSelect = document.getElementById(`duree_${index}`);
        const localInput = document.getElementById(`local_${index}`);

        if (groupeSelect && seance.groupe) groupeSelect.value = seance.groupe;
        if (jourSelect && seance.jour) jourSelect.value = seance.jour;
        if (debutSelect && seance.debut) debutSelect.value = seance.debut;

        // Convertir la durée en string avec le bon format pour correspondre aux options
        if (dureeSelect && seance.duree) {
            const dureeStr = typeof seance.duree === 'number' ? seance.duree.toFixed(1) : seance.duree;
            dureeSelect.value = dureeStr;
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
        duree: '',
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
        alert('Vous devez conserver au moins une séance');
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
        formAjout.style.display = 'none';
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
 * NOUVELLE STRUCTURE DONNÉES:
 * Séance = {
 *   id: timestamp,
 *   lettre: 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
 *   groupe: string,
 *   jour: string,
 *   debut: string (HH:MM),
 *   duree: number (en heures, ex: 2.0, 1.5),
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
        const dureeSelect = document.getElementById(`duree_${i}`);
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

        if (!dureeSelect || !dureeSelect.value) {
            alert(`Séance ${seancesEnCours[i].lettre}: Veuillez sélectionner une durée`);
            return;
        }

        // Créer l'objet séance
        const seance = {
            id: Date.now() + i, // ID unique basé sur timestamp + index
            lettre: seancesEnCours[i].lettre,
            groupe: groupeSelect.value,
            jour: jourSelect.value,
            debut: debutSelect.value,
            duree: parseFloat(dureeSelect.value),
            local: localInput ? localInput.value : ''
        };

        seancesAEnregistrer.push(seance);
    }

    // Vérifier qu'au moins une séance est configurée
    if (seancesAEnregistrer.length === 0) {
        alert('Veuillez configurer au moins une séance');
        return;
    }

    // Sauvegarder dans localStorage
    db.setSync('seancesHoraire', seancesAEnregistrer);

    // Rafraîchir l'affichage des séances existantes
    afficherSeancesExistantes();

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();

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

    // Formater la durée pour affichage
    const dureeAffichage = seance.duree
        ? ` (${seance.duree % 1 === 0 ? seance.duree + 'h' : seance.duree.toString().replace('.', 'h')})`
        : '';

    return `
<div class="item-carte" id="carte-seance-${index}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">Séance ${nomSeance}${groupeEchappe ? ` - Groupe ${groupeEchappe}` : ''}</strong>
        <div class="item-carte-actions">
            <button onclick="modifierSeanceEnPlace(${index})"
                    class="btn btn-modifier btn-sm">Modifier</button>
            <button onclick="supprimerSeance(${index})"
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
            <button class="btn btn-annuler btn-sm" onclick="annulerEditionSeanceEnPlace()">Annuler</button>
            <button class="btn btn-confirmer btn-sm" onclick="sauvegarderEditionSeanceEnPlace(${index})">Sauvegarder</button>
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
            <select class="controle-form controle-form-compact" id="edit-debut-${index}">
                ${genererOptionsHeureDebut()}
            </select>
        </div>
        <div class="groupe-form">
            <label>Durée</label>
            <select class="controle-form controle-form-compact" id="edit-duree-${index}">
                ${genererOptionsDuree()}
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
    const seances = db.getSync('seancesHoraire', []);
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
        const dureeSelect = document.getElementById(`edit-duree-${index}`);

        if (debutSelect && seance.debut) {
            debutSelect.value = seance.debut;
        }

        if (dureeSelect && seance.duree) {
            const dureeStr = typeof seance.duree === 'number' ? seance.duree.toFixed(1) : seance.duree;
            dureeSelect.value = dureeStr;
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
    const duree = document.getElementById(`edit-duree-${index}`)?.value;
    const local = document.getElementById(`edit-local-${index}`)?.value;
    const lettre = document.getElementById(`edit-lettre-${index}`)?.value;
    const groupe = document.getElementById(`edit-groupe-${index}`)?.value;

    if (!jour || !debut || !duree) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    const seances = db.getSync('seancesHoraire', []);

    if (index < 0 || index >= seances.length) {
        alert('Index de séance invalide');
        return;
    }

    // Mettre à jour la séance
    seances[index] = {
        lettre: lettre || seances[index].lettre,
        groupe: groupe || seances[index].groupe || '',
        jour: jour,
        debut: debut,
        duree: parseFloat(duree),
        local: local || ''
    };

    db.setSync('seancesHoraire', seances);

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();

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
    if (!confirm('Voulez-vous vraiment supprimer cette séance ?')) {
        return;
    }

    const seances = db.getSync('seancesHoraire', []);

    // Supprimer la séance
    seances.splice(index, 1);

    // Recalculer les lettres pour les séances restantes
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    seances.forEach((seance, i) => {
        seance.lettre = lettres[i] || `S${i + 1}`;
    });

    db.setSync('seancesHoraire', seances);

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();

    // Recharger l'affichage
    afficherSeancesExistantes();

    afficherNotificationSucces('Séance supprimée');
}

/**
 * Affiche les séances existantes
 *
 * FONCTIONNEMENT:
 * 1. Récupère les séances depuis localStorage
 * 2. Si vide: affiche message
 * 3. Sinon: génère le HTML des séances
 * 4. Affiche les informations (jour, heures, local)
 * 5. Ajoute les boutons d'action (modifier, dupliquer, verrouiller, supprimer)
 * 6. Met à jour l'interface
 */
function afficherSeancesExistantes() {
    const container = document.getElementById('seancesContainer');
    if (!container) return;

    const seances = db.getSync('seancesHoraire', []);

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
        form.style.display = 'block';
        btn.style.display = 'none';
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
    document.getElementById('dureeSeance').value = '';
    document.getElementById('localSeance').value = '';

    // Cacher le formulaire et réafficher le bouton
    const form = document.getElementById('formAjoutSeance');
    const btn = document.getElementById('btnAjouterSeance');

    if (form && btn) {
        form.style.display = 'none';
        btn.style.display = 'block';
    }
}

/**
 * Confirme l'ajout d'une nouvelle séance
 * Valide les champs, ajoute la séance à localStorage et régénère tout
 */
function confirmerAjoutSeance() {
    const jour = document.getElementById('jourSeance')?.value;
    const debut = document.getElementById('debutSeance')?.value;
    const duree = document.getElementById('dureeSeance')?.value;
    const local = document.getElementById('localSeance')?.value;

    // Validation
    if (!jour || !debut || !duree) {
        alert('Veuillez remplir tous les champs obligatoires (jour, heure début, durée)');
        return;
    }

    // Récupérer les séances existantes
    const seances = db.getSync('seancesHoraire', []);

    // Vérifier le nombre maximum de séances
    if (seances.length >= 6) {
        alert('Maximum de 6 séances atteint');
        return;
    }

    // ✅ VALIDATION: Vérifier si une séance identique existe déjà
    const seanceExistante = seances.find(s =>
        s.jour === jour &&
        s.debut === debut &&
        s.duree === parseFloat(duree)
    );

    if (seanceExistante) {
        alert(`Une séance identique existe déjà (${seanceExistante.lettre} : ${jour} ${debut}, ${duree}h).\nUtilisez le bouton "Supprimer" pour retirer les doublons.`);
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
        duree: parseFloat(duree),
        local: local || ''
    };

    // Ajouter la séance
    seances.push(nouvelleSeance);
    db.setSync('seancesHoraire', seances);

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();

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
    const seances = db.getSync('seancesHoraire', []);

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
        `Voulez-vous les supprimer ?`
    );

    if (!confirmation) {
        return;
    }

    // Recalculer les lettres pour les séances uniques
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F'];
    seancesUniques.forEach((seance, i) => {
        seance.lettre = lettres[i] || `S${i + 1}`;
    });

    // Sauvegarder
    db.setSync('seancesHoraire', seancesUniques);

    // Régénérer
    genererSeancesCompletes();

    // Recharger
    afficherSeancesExistantes();

    afficherNotificationSucces(`${doublonsTrouves.length} doublon(s) supprimé(s)`);
}

/* ===============================
   NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 *
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec la classe notification-succes
 * 3. Supprime après 3 secondes
 *
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 *
 * STYLE:
 * - Classe CSS: notification-succes
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

// Fonctions utilitaires
window.calculerHeureFin = calculerHeureFin;

// Fonctions appelées depuis le HTML (onclick, onchange)
window.afficherFormulaireSeancesDynamique = afficherFormulaireSeancesDynamique;
window.ajouterFormulaireSeance = ajouterFormulaireSeance;
window.supprimerFormulaireSeance = supprimerFormulaireSeance;
window.confirmerSeances = confirmerSeances;
window.annulerAjoutSeance = annulerAjoutSeance;
window.afficherSeancesExistantes = afficherSeancesExistantes;
window.supprimerSeance = supprimerSeance;
window.nettoyerDoublons = nettoyerDoublons;