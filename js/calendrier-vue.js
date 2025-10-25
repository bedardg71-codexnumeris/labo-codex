/* ===============================
   MODULE 09-VUE: VUE CALENDAIRE DES PRÉSENCES
   Index: 60 17-10-2025 → Refonte après modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'affichage du calendrier scolaire dans
   la section Présences › Vue calendaire.
   
   Contenu de ce module:
   - Génération des semaines scolaires
   - Génération du calendrier visuel mensuel
   - Affichage des jours de cours, congés, reprises
   - Légende et statistiques
   - Illumination interactive des semaines
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - config.js : Variables globales
   - trimestre.js : Données du trimestre (localStorage)
   
   Fonctions utilisées:
   - echapperHtml() (depuis config.js)
   
   Éléments HTML requis:
   - #presences-calendrier : Section calendaire
   - #conteneur-calendrier : Conteneur du calendrier (dans la carte)
   
   LocalStorage utilisé:
   - 'cadreCalendrier' : Object avec dates clés du trimestre
   - 'evenementsPrevus' : Array des congés officiels
   - 'evenementsImprevus' : Array des congés ajoutés
   - 'seancesHoraire' : Array des séances (pour déterminer jours de cours)
   
   MODULES DÉPENDANTS:
   - Module présences/saisie : Utilisera le calendrier pour saisie
   
   ÉVÉNEMENTS:
   - mouseover/mouseout sur les jours : illumination de semaine
   - click sur les jours : sélection de date (à implémenter si nécessaire)
   
   COMPATIBILITÉ:
   - ES6+ requis
   - Navigateurs modernes
   - Pas de dépendances externes
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de vue calendaire
 * Appelée automatiquement par main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Génère et affiche le calendrier scolaire
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleVueCalendaire() {
    console.log('Initialisation du module Vue Calendaire');

    // Vérifier que nous sommes dans la bonne section
    const conteneurCalendrier = document.getElementById('presences-calendrier');
    if (!conteneurCalendrier) {
        console.log('   ⚠️  Section calendrier non active, initialisation reportée');
        return;
    }

    // Afficher le calendrier scolaire
    afficherCalendrierScolaire();

    console.log('   ✅ Module Vue Calendaire initialisé');
}

/* ===============================
   FONCTIONS UTILITAIRES DATES
   =============================== */

/**
 * Crée une date locale (évite les problèmes de timezone)
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Date} - Objet Date en heure locale
 */
function creerDateLocale(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
        console.warn('⚠️  creerDateLocale appelée avec une valeur invalide:', dateStr);
        return new Date();
    }

    const parties = dateStr.split('-');
    const annee = parseInt(parties[0], 10);
    const mois = parseInt(parties[1], 10);
    const jour = parseInt(parties[2], 10);
    return new Date(annee, mois - 1, jour);
}

/**
 * Formate une date en YYYY-MM-DD
 * @param {Date} date - Objet Date
 * @returns {string} - Date formatée
 */
function calendrierVue_formaterDate(date) {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return annee + '-' + mois + '-' + jour;
}

/**
 * Obtient le nom du jour
 * @param {Date} date - Objet Date
 * @returns {string} - Nom du jour
 */
function obtenirNomJour(date) {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[date.getDay()];
}


/* ===============================
   🎨 GÉNÉRATION HTML DU CALENDRIER
   =============================== */

/**
 * Détermine le statut d'un jour (type, classe CSS, label)
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {Object} config - Configuration du calendrier
 * @param {Object} mapSemaines - Map date -> numéro de semaine
 * @returns {Object} - {type, classe, label}
 */
function obtenirStatutJour(dateStr, calendrierComplet) {
    // Lire les infos depuis le calendrier complet (source unique)
    const infosJour = calendrierComplet[dateStr];
    
    // Si la date n'existe pas dans le calendrier, retourner vide
    if (!infosJour) {
        return { type: 'vide', classe: '', label: '', numeroSemaine: null };
    }
    
    // Déterminer le label selon le type de jour
    let label = '';
    if (infosJour.numeroSemaine) {
        label = 'Sem. ' + infosJour.numeroSemaine;
    }
    
    if (infosJour.statut === 'semaine-examens') {
        label = 'Examen';
    } else if (infosJour.statut === 'semaine-planification') {
        label = 'Planif.';
    }
    
    // Mapper les statuts aux types utilisés par l'affichage
    const mapStatuts = {
        'weekend': 'weekend',
        'conge': 'conge',
        'reprise': 'reprise',
        'cours': 'cours',
        'semaine-examens': 'examens',
        'semaine-planification': 'planification',
        'hors-cours': 'vide'
    };
    
    const type = mapStatuts[infosJour.statut] || 'cours';
    
    // Vérifier si c'est un jour de cours avec horaire (cours-reel)
    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const estCoursReel = seances.some(function(seance) {
        return seance.jour === infosJour.jourSemaine;
    });
    
    const typeFinal = (type === 'cours' && estCoursReel) ? 'cours-reel' : type;
    
    return {
        type: typeFinal,
        classe: 'cal-' + typeFinal,
        label: label,
        numeroSemaine: infosJour.numeroSemaine || null
    };
}

/**
 * Génère le HTML d'un mois de calendrier
 * @param {number} annee - Année
 * @param {number} mois - Mois (1-12)
 * @param {Object} config - Configuration du calendrier
 * @param {Object} mapSemaines - Map date -> numéro de semaine
 * @returns {string} - HTML du calendrier mensuel
 */
function genererHtmlMois(annee, mois, calendrierComplet) {
    console.log('🔍 genererHtmlMois appelé avec:', { annee, mois });
    const nomsJours = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    const nomsMois = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const premierJour = new Date(annee, mois - 1, 1);
    const dernierJour = new Date(annee, mois, 0);
    const jourSemaineDebut = premierJour.getDay();
    const nombreJours = dernierJour.getDate();

    let html = '<div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">';
    html += '<h3 style="text-align: center; color: var(--bleu-principal); margin: 0 0 15px 0; font-size: 1.1rem; font-weight: 600;">';
    html += nomsMois[mois] + ' ' + annee;
    html += '</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr>';

    // En-tête des jours
    for (let i = 0; i < nomsJours.length; i++) {
        const jour = nomsJours[i];
        const estWeekendHeader = (jour === 'DIM' || jour === 'SAM');
        const couleur = estWeekendHeader ? 'var(--gris-moyen)' : 'var(--bleu-principal)';
        html += '<th style="padding: 8px; color: ' + couleur + '; font-size: 0.85rem; font-weight: 600;">' + jour + '</th>';
    }

    html += '</tr></thead><tbody><tr>';

    // Cellules vides avant le premier jour
    for (let i = 0; i < jourSemaineDebut; i++) {
        html += '<td></td>';
    }

    // Jours du mois
    for (let jour = 1; jour <= nombreJours; jour++) {
        const dateStr = calendrierVue_formaterDate(new Date(annee, mois - 1, jour));

        if (jour <= 2) {
            console.log('Jour', jour, 'du mois', mois, '→ dateStr:', dateStr);
        }
        
        const statut = obtenirStatutJour(dateStr, calendrierComplet);
        const jourSemaine = (jourSemaineDebut + jour - 1) % 7;

        // Couleurs selon le statut
        let bgColor = 'white';
        let textColor = 'var(--bleu-principal)';
        let borderColor = '#e8e8e8';
        let fontWeight = '400';
        let estCliquable = false;

        if (statut.type === 'weekend') {
            bgColor = 'var(--weekend-bg)';
            textColor = '#757575';
        } else if (statut.type === 'examens') {
            bgColor = 'var(--examens-bg)';
            textColor = 'var(--bleu-principal)';
            borderColor = '#f06292';
        } else if (statut.type === 'planification') {
            bgColor = 'var(--planification-bg)';
            textColor = 'var(--bleu-principal)';
            borderColor = '#ba68c8';
        } else if (statut.type === 'conge') {
            bgColor = 'var(--conge-bg)';
            textColor = '#c62828';
            borderColor = '#ef5350';
            fontWeight = '600';
        } else if (statut.type === 'reprise') {
            bgColor = 'var(--reprise-bg)';
            textColor = '#e65100';
            borderColor = '#ff9800';
            fontWeight = '600';
        } else if (statut.type === 'cours-reel') {
            bgColor = 'var(--jour-cours-reel-bg)';
            textColor = 'var(--bleu-principal)';
            borderColor = 'var(--bleu-moyen)';
            fontWeight = '600';
            estCliquable = true;
        } else if (statut.type === 'cours') {
            bgColor = 'white';
            borderColor = 'var(--bleu-carte)';
        }

        const numSemaine = statut.numeroSemaine || '';
        const cursorStyle = estCliquable ? 'pointer' : 'default';
        const onclickAttr = estCliquable ? 'onclick="ouvrirSaisiePresence(\'' + dateStr + '\')"' : '';
        const hoverStyle = estCliquable ? 'onmouseover="this.style.opacity=\'0.8\'" onmouseout="this.style.opacity=\'1\'"' : '';

        html += '<td class="jour-calendrier" ';
        html += 'data-date="' + dateStr + '" ';
        html += 'data-semaine="' + numSemaine + '" ';
        html += 'data-type="' + statut.type + '" ';
        html += 'onmouseenter="illuminerSemaineAmelioree(\'' + dateStr + '\')" ';
        html += 'onmouseleave="desilluminerSemaines()" ';
        html += onclickAttr + ' ';
        html += hoverStyle + ' ';
        html += 'style="background: ' + bgColor + '; color: ' + textColor + '; ';
        html += 'border: 2px solid ' + borderColor + '; text-align: center; padding: 8px 4px; ';
        html += 'position: relative; cursor: ' + cursorStyle + '; transition: opacity 0.15s ease; ';
        html += 'min-height: 50px; vertical-align: top; font-weight: ' + fontWeight + ';">';
        html += '<div style="font-size: 0.95rem;">' + jour + '</div>';

        if (statut.label) {
            html += '<div style="font-size: 0.7rem; margin-top: 2px; opacity: 0.9;">' + statut.label + '</div>';
        }

        html += '</td>';

        // Nouvelle ligne chaque dimanche
        if (jourSemaine === 6 && jour < nombreJours) {
            html += '</tr><tr>';
        }
    }

    // Cellules vides après le dernier jour
    const jourSemaineFin = dernierJour.getDay();
    for (let i = jourSemaineFin; i < 6; i++) {
        html += '<td></td>';
    }

    html += '</tr></tbody></table></div>';

    return html;
}

/* ===============================
   ✨ INTERACTIONS VISUELLES
   =============================== */

/**
 * Illumine tous les jours d'une semaine au survol
 * @param {string} dateStr - Date au format YYYY-MM-DD
 */
function illuminerSemaineAmelioree(dateStr) {
    const cellule = document.querySelector('[data-date="' + dateStr + '"]');
    if (!cellule) {
        return;
    }

    const numSemaine = cellule.getAttribute('data-semaine');
    if (!numSemaine) {
        return;
    }

    const joursSemaine = document.querySelectorAll('[data-semaine="' + numSemaine + '"]');
    joursSemaine.forEach(function (jour) {
        jour.style.outline = '3px solid var(--orange-accent)';
        jour.style.outlineOffset = '-3px';
        jour.style.zIndex = '10';
    });
}

/**
 * Désillumne toutes les semaines
 */
function desilluminerSemaines() {
    const tousLesJours = document.querySelectorAll('.jour-calendrier');
    tousLesJours.forEach(function (jour) {
        jour.style.outline = '';
        jour.style.outlineOffset = '';
        jour.style.zIndex = '';
    });
}

/* ===============================
   AFFICHAGE PRINCIPAL DU CALENDRIER
   =============================== */

/**
 * Affiche le calendrier scolaire complet
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la configuration du calendrier depuis localStorage
 * 2. Génère les semaines scolaires
 * 3. Crée une map date -> numéro de semaine
 * 4. Génère le HTML des mois à afficher
 * 5. Ajoute les statistiques et la légende
 * 6. Injecte le tout dans le DOM
 */
function afficherCalendrierScolaire() {
    console.log('🔵 Génération du calendrier scolaire...');

    // Récupérer les paramètres depuis localStorage
    const cadreCalendrier = JSON.parse(localStorage.getItem('cadreCalendrier') || '{}');
    const evenementsPrevus = JSON.parse(localStorage.getItem('evenementsPrevus') || '[]');
    const evenementsImprevus = JSON.parse(localStorage.getItem('evenementsImprevus') || '[]');

    // Configuration du calendrier
    const config = {
        debutTrimestre: cadreCalendrier.dateDebut || '2025-08-21',
        finCours: cadreCalendrier.finCours || '2025-12-12',
        semainePlanification: {
            debut: cadreCalendrier.semainePlanificationDebut || '2025-10-13',
            fin: cadreCalendrier.semainePlanificationFin || '2025-10-17'
        },
        semaineExamens: {
            debut: cadreCalendrier.semaineExamensDebut || '2025-12-15',
            fin: cadreCalendrier.semaineExamensFin || '2025-12-22'
        },
        conges: []
    };

    // Fusionner tous les événements (prévus + imprévus)
    const tousEvenements = [...evenementsPrevus, ...evenementsImprevus];

    // Convertir au format attendu par genererSemainesScolaires()
    config.conges = tousEvenements.map(function (evt) {
        return {
            date: evt.dateEvenement,
            reprise: evt.dateReprise || '',
            motif: evt.description
        };
    });

    // ✅ UTILISER LES STATISTIQUES DÉJÀ CALCULÉES PAR TRIMESTRE.JS
    // Au lieu de recalculer, on lit directement depuis localStorage
    let nombreSemainesReel = 15; // Valeur par défaut
    let nombreJoursReel = 75;    // Valeur par défaut

    // Lire les valeurs calculées par trimestre.js
    if (document.getElementById('nombreSemaines')) {
        nombreSemainesReel = parseInt(document.getElementById('nombreSemaines').textContent) || 15;
    }
    if (document.getElementById('nombreJoursCours')) {
        nombreJoursReel = parseInt(document.getElementById('nombreJoursCours').textContent) || 75;
    }

    // Utiliser le calendrier complet (source unique)
    const calendrierComplet = obtenirCalendrierComplet();

    // Déterminer les mois à afficher selon la session
    const session = cadreCalendrier.session || 'A';
    const annee = parseInt((cadreCalendrier.dateDebut || '2025-08-21').split('-')[0], 10);
    const moisAAfficher = (session === 'A') ? [8, 9, 10, 11, 12] : [1, 2, 3, 4, 5];

    // Générer le HTML du calendrier complet
    let htmlCalendrier = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0;">';

    for (let i = 0; i < moisAAfficher.length; i++) {
        htmlCalendrier += genererHtmlMois(annee, moisAAfficher[i], calendrierComplet);
    }

    htmlCalendrier += '</div>';

    // Ajouter la légende
    htmlCalendrier += '<div style="margin-top: 30px; padding: 20px; background: var(--bleu-tres-pale); border-radius: 8px; border: 2px solid var(--bleu-pale);">';
    htmlCalendrier += '<h4 style="margin: 0 0 15px 0; color: var(--bleu-principal);">📍 Légende</h4>';
    htmlCalendrier += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">';

    htmlCalendrier += '<div style="display: flex; align-items: center; gap: 10px;">';
    htmlCalendrier += '<div style="width: 28px; height: 28px; background: var(--bleu-leger); border-radius: 4px;"></div>';
    htmlCalendrier += '<span style="color: var(--bleu-principal);"><strong>Jour de cours régulier</strong></span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div style="display: flex; align-items: center; gap: 10px;">';
    htmlCalendrier += '<div style="width: 28px; height: 28px; background: white; border-radius: 4px; border: 2px solid #e8e8e8;"></div>';
    htmlCalendrier += '<span style="color: var(--bleu-principal);">Jour ouvrable</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div style="display: flex; align-items: center; gap: 10px;">';
    htmlCalendrier += '<div style="width: 28px; height: 28px; background: #9370DB; border-radius: 4px;"></div>';
    htmlCalendrier += '<span style="color: var(--bleu-principal);">Reprise</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div style="display: flex; align-items: center; gap: 10px;">';
    htmlCalendrier += '<div style="width: 28px; height: 28px; background: #dc3545; border-radius: 4px;"></div>';
    htmlCalendrier += '<span style="color: var(--bleu-principal);">Congé prévu au calendrier</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '</div>';
    htmlCalendrier += '<p style="margin-top: 15px; color: var(--bleu-moyen); font-size: 0.9rem; font-style: italic;">';
    htmlCalendrier += '💡 <strong>Astuce :</strong> Survole un jour pour illuminer toute sa semaine.';
    htmlCalendrier += '</p>';
    htmlCalendrier += '</div>';

    // Statistiques - UTILISER LES VALEURS DÉJÀ CALCULÉES
    let htmlStats = '<div style="margin-bottom: 20px;">';
    htmlStats += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">';

    htmlStats += '<div style="background: var(--bleu-pale); padding: 20px; border-radius: 8px; text-align: center; border: 2px solid var(--bleu-carte);">';
    htmlStats += '<div style="font-size: 2rem; font-weight: 600; color: var(--bleu-principal);">' + nombreSemainesReel + '</div>';
    htmlStats += '<div style="color: var(--bleu-moyen); font-size: 0.9rem; margin-top: 5px;">Semaines scolaires</div>';
    htmlStats += '</div>';

    htmlStats += '<div style="background: var(--bleu-pale); padding: 20px; border-radius: 8px; text-align: center; border: 2px solid var(--bleu-carte);">';
    htmlStats += '<div style="font-size: 2rem; font-weight: 600; color: var(--bleu-principal);">' + nombreJoursReel + '</div>';
    htmlStats += '<div style="color: var(--bleu-moyen); font-size: 0.9rem; margin-top: 5px;">Jours de cours</div>';
    htmlStats += '</div>';

    // Compter uniquement les congés AVEC reprise
    const congesAvecReprise = tousEvenements.filter(function (evt) {
        return evt.dateReprise && evt.dateReprise !== '';
    }).length;

    htmlStats += '<div style="background: var(--bleu-pale); padding: 20px; border-radius: 8px; text-align: center; border: 2px solid var(--bleu-carte);">';
    htmlStats += '<div style="font-size: 2rem; font-weight: 600; color: var(--bleu-principal);">' + congesAvecReprise + '</div>';
    htmlStats += '<div style="color: var(--bleu-moyen); font-size: 0.9rem; margin-top: 5px;">Congés avec reprises</div>';
    htmlStats += '</div>';

    htmlStats += '</div></div>';

    htmlCalendrier = htmlStats + htmlCalendrier;

    // Injecter dans le DOM
    const conteneurCalendrier = document.getElementById('presences-calendrier');
    if (conteneurCalendrier) {
        const carteCalendrier = conteneurCalendrier.querySelector('.carte') || conteneurCalendrier;
        const conteneur = carteCalendrier.querySelector('#conteneur-calendrier');

        if (conteneur) {
            conteneur.innerHTML = htmlCalendrier;
            console.log('✅ Calendrier scolaire affiché avec succès');
            console.log('   - ' + nombreSemainesReel + ' semaines | ' + nombreJoursReel + ' jours (depuis trimestre.js)');
        } else {
            console.error('❌ Élément #conteneur-calendrier introuvable');
        }
    } else {
        console.error('❌ Section #presences-calendrier introuvable');
    }
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module config.js
 * 2. Charger le module trimestre.js (anciennement calendrier.js)
 * 3. Charger ce module calendrier-vue.js
 * 4. Appeler initialiserModuleVueCalendaire() depuis main.js
 * 
 * LOCALSTORAGE:
 * - 'cadreCalendrier' : Object avec dates clés
 * - 'evenementsPrevus' : Array des congés officiels
 * - 'evenementsImprevus' : Array des congés ajoutés
 * - 'seancesHoraire' : Array des séances (jours de cours)
 * 
 * MODULES DÉPENDANTS:
 * - calendrier-saisie.js : Utilisera le calendrier pour saisir présences
 * 
 * COMPATIBILITÉ:
 * - ES6+ requis
 * - Navigateurs modernes
 * - Pas de dépendances externes
 */