/* ===============================
   MODULE: SAISIE DES PRÉSENCES
   Version refondée complète avec toutes les fonctionnalités
   
   ⚠️ ARCHITECTURE ⚠️
   Ce module LIT les données depuis :
   - trimestre.js : obtenirCalendrierComplet()
   - horaire.js : obtenirSeancesJour(dateStr)
   
   Il ne doit JAMAIS recalculer les dates ou séances.
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de saisie des présences
 * Appelée par main.js au chargement
 */
function calculerEtSauvegarderIndicesAssiduite() {
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const indicesAssiduite = {};

    etudiants.filter(e => e.statut !== 'décrochage' && e.statut !== 'abandon')
        .forEach(etudiant => {
            // Chercher l'élément dans le DOM qui contient le taux
            const elementTaux = document.getElementById(`taux_${etudiant.da}`);

            if (elementTaux) {
                // Lire le taux directement depuis le DOM (ex: "73%")
                const tauxTexte = elementTaux.textContent.replace('%', '');
                const taux = parseFloat(tauxTexte) || 0;
                indicesAssiduite[etudiant.da] = taux / 100;
            } else {
                // Si l'élément n'existe pas, mettre 1 par défaut
                indicesAssiduite[etudiant.da] = 1;
            }
        });

    localStorage.setItem('indicesAssiduite', JSON.stringify(indicesAssiduite));
    console.log('📊 Indices d\'assiduité sauvegardés:', indicesAssiduite);
    return indicesAssiduite;
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
   📊 GESTION DES GROUPES
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
    const mode = localStorage.getItem('modeActif') || 'reel';
    const cleComplete = mode === 'demo' ? 'demo_groupeEtudiants' : 'groupeEtudiants';
    const etudiants = JSON.parse(localStorage.getItem(cleComplete) || '[]');

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

/**
 * Obtient les données selon le mode actif
 */
function obtenirDonneesSelonMode(cle) {
    const mode = localStorage.getItem('modeActif') || 'reel';
    const cleComplete = mode === 'demo' ? `demo_${cle}` : cle;
    return JSON.parse(localStorage.getItem(cleComplete) || '[]');
}

/* ===============================
   📅 FONCTIONS DE CALENDRIER
   Utilisent les sources uniques
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
    const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
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
    const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');

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
        console.warn('⚠️ obtenirSeancesCompletes non disponible, lecture directe');
        seancesCompletes = JSON.parse(localStorage.getItem('seancesCompletes') || '{}');
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
        calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
    }

    if (!calendrier || Object.keys(calendrier).length === 0) {
        console.error('❌ Calendrier vide');
        return [];
    }

    // Obtenir les jours de séances depuis l'horaire
    const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const joursAvecSeances = new Set();
    seancesHoraire.forEach(seance => {
        if (seance.jour) {
            joursAvecSeances.add(seance.jour);
        }
    });

    console.log('Jours configurés dans l\'horaire:', Array.from(joursAvecSeances));

    // Filtrer pour ne garder que les jours qui correspondent à l'horaire
    const datesCours = [];
    Object.keys(calendrier).forEach(date => {
        const jour = calendrier[date];
        if (jour && jour.statut) {
            // Cours normal : vérifier si c'est un jour de l'horaire
            if (jour.statut === 'cours' && joursAvecSeances.has(jour.jourSemaine)) {
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
        // Fallback : lecture directe
        const seancesCompletes = JSON.parse(localStorage.getItem('seancesCompletes') || '{}');
        seances = seancesCompletes[dateStr] || [];
    }

    console.log(`📚 Séances pour ${dateStr}:`, seances);

    if (!seances || seances.length === 0) {
        // Pour les jours de cours sans séances définies, utiliser valeur par défaut
        const infoJour = obtenirInfosJourCalendrier(dateStr);
        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            const formatHoraire = localStorage.getItem('formatHoraire');
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
            const formatHoraire = localStorage.getItem('formatHoraire');
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
        // Fallback : lecture directe
        console.warn('⚠️ obtenirSeancesCompletes non disponible, lecture directe');
        seances = JSON.parse(localStorage.getItem('seancesCompletes') || '{}');
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
    const datesVerrouillees = JSON.parse(localStorage.getItem('datesVerrouillees') || '[]');
    return datesVerrouillees.includes(dateStr);
}

/**
 * Bascule le verrouillage d'une date
 */
function basculerVerrouillageDate(dateStr) {
    let datesVerrouillees = JSON.parse(localStorage.getItem('datesVerrouillees') || '[]');

    const index = datesVerrouillees.indexOf(dateStr);
    if (index > -1) {
        datesVerrouillees.splice(index, 1);
        console.log('🔓 Date déverrouillée:', dateStr);
    } else {
        datesVerrouillees.push(dateStr);
        console.log('🔒 Date verrouillée:', dateStr);
    }

    localStorage.setItem('datesVerrouillees', JSON.stringify(datesVerrouillees));
    initialiserSaisiePresences();
}

/**
 * Vérifie la configuration du format horaire
 */
function verifierConfigurationFormatHoraire() {
    const alerteDiv = document.getElementById('alerteFormatHoraire');
    if (!alerteDiv) return;

    const formatHoraire = localStorage.getItem('formatHoraire');
    const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

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
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Sélectionnez une date</td></tr>';
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
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--rouge-erreur);">${message}</td></tr>`;
        }

        mettreAJourEnteteDateSeance('');
        return;
    }

    mettreAJourEnteteDateSeance(dateInput.value);
    chargerTableauPresences(dateInput.value, validation.verrouille);
    mettreAJourBoutonsNavigation();
}

/**
 * Met à jour l'en-tête de la saisie avec tous les états visuels
 */
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

    // Retirer toutes les classes d'état
    entete.classList.remove('etat-erreur', 'etat-valide', 'etat-verrouille');

    let message = '';

    if (infoJour.statut === 'cours') {
        message = `Présences au cours du ${dateFr}`;
        if (heuresFormatees) {
            message += ` (${heuresFormatees})`;
        }
        if (infoJour.numeroSemaine) {
            message += ` - Semaine ${infoJour.numeroSemaine}`;
        }
        entete.classList.add(estVerrouille ? 'etat-verrouille' : 'etat-valide');

    } else if (infoJour.statut === 'reprise') {
        message = `Présences au cours du ${dateFr} - REPRISE`;
        if (infoJour.jourRemplace) {
            message += ` (horaire du ${infoJour.jourRemplace})`;
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
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

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

    tbody.innerHTML = '';

    etudiantsFiltres.forEach((etudiant, index) => {
        const presenceExistante = presences.find(p =>
            p.date === dateStr && p.da === etudiant.da
        );

        const heuresPresence = presenceExistante ? (presenceExistante.heures || 0) : dureeSeance;
        const notes = presenceExistante ? (presenceExistante.notes || '') : '';

        const heuresHistorique = calculerTotalHeuresPresence(etudiant.da, dateStr);
        const tauxAssiduiteActuel = calculerTauxAssiduite(
            etudiant.da,
            dateStr,
            parseFloat(heuresPresence) || 0
        );

        const tr = document.createElement('tr');

        // Créer l'input des heures avec les bonnes classes CSS
        const inputHeuresHTML = `
            <input type="number" 
                   class="controle-form input-heures ${obtenirClasseSaisie(heuresPresence, dureeSeance)}"
                   id="heures_${etudiant.da}"
                   value="${heuresPresence}" 
                   min="0" 
                   max="${dureeSeance}" 
                   step="0.5"
                   ${estVerrouille ? 'disabled' : ''}
                   onchange="mettreAJourLigne('${etudiant.da}', '${dateStr}')"
                   oninput="appliquerCodeCouleurSaisie(this, ${dureeSeance})">`;

        // Structure : DA | Prénom | Nom | Présence | Notes | Total heures | Assiduité
        tr.innerHTML = `
            <td>${echapperHtml(etudiant.da)}</td>
            <td>${echapperHtml(etudiant.prenom)}</td>
            <td>${echapperHtml(etudiant.nom)}</td>
            <td style="width: 80px;">${inputHeuresHTML}</td>
            <td>
                <input type="text" 
                       class="controle-form input-notes" 
                       id="notes_${etudiant.da}"
                       value="${echapperHtml(notes)}" 
                       placeholder="Notes..."
                       ${estVerrouille ? 'disabled' : ''}>
            </td>
            <td><span id="heuresHisto_${etudiant.da}">${heuresHistorique.toFixed(1)}h</span></td>
            <td>
                <span id="taux_${etudiant.da}" style="font-weight: 500;">
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
        // Toujours afficher 2h peu importe la durée réelle
        colonnePresenceTitre.innerHTML = `
            Présence (max. 2h)
            <button class="btn-mini btn-tous-presents" 
                    onclick="tousPresents()" 
                    ${estVerrouille ? 'disabled' : ''}
                    title="Mettre tous présents">
                Tous 2h
            </button>
            <button class="btn-mini btn-reinit" 
                    onclick="reinitialiserSaisie()" 
                    ${estVerrouille ? 'disabled' : ''}
                    title="Réinitialiser">
                ↻
            </button>
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
}

/**
 * Obtient la classe CSS pour la saisie selon la valeur
 */
function obtenirClasseSaisie(heures, dureeMax) {
    const valeur = parseFloat(heures) || 0;

    if (valeur === 0) {
        return 'saisie-absence';
    } else if (valeur < dureeMax) {
        return 'saisie-retard';
    } else if (valeur === dureeMax) {
        return 'saisie-present';
    }
    return 'saisie-vide';
}

/**
 * Applique le code couleur à un input
 */
function appliquerCodeCouleurSaisie(inputHeures, dureeMax) {
    if (!inputHeures) return;

    const valeur = parseFloat(inputHeures.value) || 0;

    // Retirer toutes les classes
    inputHeures.classList.remove('saisie-absence', 'saisie-retard', 'saisie-present', 'saisie-vide');

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

    if (!inputHeures || !spanTaux) return;

    const heuresSeance = parseFloat(inputHeures.value) || 0;
    const dureeMax = obtenirHeuresSeance(dateStr);

    // Appliquer le code couleur
    appliquerCodeCouleurSaisie(inputHeures, dureeMax);

    // Mettre à jour le taux
    const tauxAssiduiteActuel = calculerTauxAssiduite(da, dateStr, heuresSeance);

    spanTaux.textContent = tauxAssiduiteActuel + '%';
    // Format simple et uniforme pour tous
    spanTaux.style.fontWeight = '500';
}

/* ===============================
   💾 ENREGISTREMENT
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
    let presences = JSON.parse(localStorage.getItem('presences') || '[]');

    // Filtrer les étudiants si un groupe est sélectionné
    let etudiantsATraiter = etudiants;
    if (groupeFiltre) {
        etudiantsATraiter = etudiants.filter(e => e.groupe === groupeFiltre);
    }

    // Supprimer les anciennes présences pour cette date et ces étudiants
    presences = presences.filter(p => {
        if (p.date !== dateStr) return true;
        return !etudiantsATraiter.some(e => e.da === p.da);
    });

    // Ajouter les nouvelles présences
    etudiantsATraiter.forEach(etudiant => {
        const inputHeures = document.getElementById(`heures_${etudiant.da}`);
        const inputNotes = document.getElementById(`notes_${etudiant.da}`);

        if (inputHeures) {
            const heures = parseFloat(inputHeures.value) || 0;
            const notes = inputNotes ? inputNotes.value.trim() : '';

            presences.push({
                date: dateStr,
                da: etudiant.da,
                heures: heures,
                notes: notes
            });
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
}

/* ===============================
   🧮 CALCULS STATISTIQUES
   =============================== */

/**
 * Calcule le total des heures de présence d'un étudiant
 */
function calculerTotalHeuresPresence(da, dateActuelle) {
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

    return presences
        .filter(p => p.da === da && p.date < dateActuelle)
        .reduce((total, p) => total + (p.heures || 0), 0);
}

/**
 * Calcule le taux d'assiduité d'un étudiant
 */
function calculerTauxAssiduite(da, dateActuelle, heuresSeanceActuelle) {
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
 * Met tous les étudiants présents (heures complètes)
 */
function tousPresents() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) return;

    const dureeSeance = obtenirHeuresSeance(dateInput.value);
    const inputs = document.querySelectorAll('.input-heures');

    inputs.forEach(input => {
        if (!input.disabled) {
            input.value = dureeSeance;
            const da = input.id.replace('heures_', '');

            // Appliquer le code couleur
            appliquerCodeCouleurSaisie(input, dureeSeance);

            // Mettre à jour les stats
            mettreAJourLigne(da, dateInput.value);
        }
    });

    console.log(`✅ Tous les étudiants mis présents (${dureeSeance}h)`);
}

/**
 * Réinitialise la saisie (met toutes les heures à 0)
 */
function reinitialiserSaisie() {
    const dateInput = document.getElementById('date-cours');
    if (!dateInput || !dateInput.value) return;

    const dureeSeance = obtenirHeuresSeance(dateInput.value);

    // Pas de confirmation pour être plus rapide
    document.querySelectorAll('.input-heures').forEach(input => {
        if (!input.disabled) {
            input.value = 0;
            appliquerCodeCouleurSaisie(input, dureeSeance);

            const da = input.id.replace('heures_', '');
            mettreAJourLigne(da, dateInput.value);
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

    console.log(`📅 Date actuelle: ${dateActuelle}`);
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

    console.log(`📅 Date actuelle: ${dateActuelle}`);
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
        console.log('⬅️ Bouton précédent:', coursPrecedent ? 'actif' : 'inactif');
    }

    if (btnSuivant) {
        btnSuivant.disabled = !coursSuivant;
        btnSuivant.style.opacity = coursSuivant ? '1' : '0.5';
        btnSuivant.style.cursor = coursSuivant ? 'pointer' : 'not-allowed';
        console.log('➡️ Bouton suivant:', coursSuivant ? 'actif' : 'inactif');
    }
}

/* ===============================
   🔧 UTILITAIRES
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
    console.log('📅 Ouverture saisie depuis calendrier pour:', date);

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
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

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
window.tousPresents = tousPresents;
window.reinitialiserSaisie = reinitialiserSaisie;
window.allerCoursSuivant = allerCoursSuivant;
window.allerCoursPrecedent = allerCoursPrecedent;
window.basculerVerrouillageDate = basculerVerrouillageDate;
window.ouvrirSaisiePresence = ouvrirSaisiePresence;
window.mettreAJourLigne = mettreAJourLigne;
window.appliquerCodeCouleurSaisie = appliquerCodeCouleurSaisie;

console.log('✅ Module saisie-presences.js chargé (version refondée complète)');