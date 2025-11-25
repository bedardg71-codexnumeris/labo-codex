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
    const seances = db.getSync('seancesHoraire', []);
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

    let html = '<div class="calendrier-conteneur">';
    html += '<h3 class="calendrier-titre-mois">';
    html += nomsMois[mois] + ' ' + annee;
    html += '</h3>';
    html += '<table class="calendrier-tableau">';
    html += '<thead><tr>';

    // En-tête des jours
    for (let i = 0; i < nomsJours.length; i++) {
        const jour = nomsJours[i];
        const estWeekendHeader = (jour === 'DIM' || jour === 'SAM');
        const couleur = estWeekendHeader ? 'var(--gris-moyen)' : 'var(--bleu-principal)';
        html += '<th class="calendrier-jour-header" style="color: ' + couleur + ';">' + jour + '</th>';
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
        // 🆕 BETA 91: Déterminer la classe CSS selon le statut
        let classeJour = 'calendrier-jour';
        let estCliquable = false;

        if (statut.type === 'weekend') {
            classeJour += ' calendrier-jour-weekend';
        } else if (statut.type === 'examens') {
            classeJour += ' calendrier-jour-examens';
        } else if (statut.type === 'planification') {
            classeJour += ' calendrier-jour-planification';
        } else if (statut.type === 'conge') {
            classeJour += ' calendrier-jour-conge';
        } else if (statut.type === 'reprise') {
            classeJour += ' calendrier-jour-reprise';
        } else if (statut.type === 'cours-reel') {
            classeJour += ' calendrier-jour-cours-reel';
            estCliquable = true;
        } else if (statut.type === 'cours') {
            classeJour += ' calendrier-jour-ouvrable';
        }

        const numSemaine = statut.numeroSemaine || '';
        const onclickAttr = estCliquable ? 'onclick="ouvrirSaisiePresence(\'' + dateStr + '\')"' : '';

        html += '<td class="' + classeJour + '" ';
        html += 'data-date="' + dateStr + '" ';
        html += 'data-semaine="' + numSemaine + '" ';
        html += 'data-type="' + statut.type + '" ';
        html += 'onmouseenter="illuminerSemaineAmelioree(\'' + dateStr + '\')" ';
        html += 'onmouseleave="desilluminerSemaines()" ';
        html += onclickAttr + '>';
        html += '<div class="cal-texte-moyen">' + jour + '</div>';

        if (statut.label) {
            html += '<div class="cal-texte-mini-fade">' + statut.label + '</div>';
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
    const tousLesJours = document.querySelectorAll('td[data-semaine]');
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

    // Récupérer les paramètres depuis db.getSync
    const cadreCalendrier = db.getSync('cadreCalendrier', {});
    const evenementsPrevus = db.getSync('evenementsPrevus', []);
    const evenementsImprevus = db.getSync('evenementsImprevus', []);

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
    let htmlCalendrier = '<div class="cal-grid-2col">';

    // Générer les mois
    for (let i = 0; i < moisAAfficher.length; i++) {
        htmlCalendrier += genererHtmlMois(annee, moisAAfficher[i], calendrierComplet);
    }

    // Ajouter la légende comme dernier élément de la grille (6ème position)
    htmlCalendrier += '<div class="calendrier-legende">';
    htmlCalendrier += '<h3 class="calendrier-titre-mois">- LÉGENDE -</h3>';
    htmlCalendrier += '<div class="calendrier-legende-grille">';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--jour-cours-reel-bg); border: 2px solid var(--bleu-moyen);"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label"><strong>Jour de cours régulier</strong></span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge cal-carte-blanche"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Jour ouvrable</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--weekend-bg);"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Weekend</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--conge-bg); border: 2px solid #ef5350;"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Congé prévu au calendrier</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--reprise-bg); border: 2px solid #ff9800;"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Reprise</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--examens-bg); border: 2px solid #f06292;"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Semaine d\'examens</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '<div class="calendrier-legende-item">';
    htmlCalendrier += '<div class="calendrier-legende-badge" style="background: var(--planification-bg); border: 2px solid #ba68c8;"></div>';
    htmlCalendrier += '<span class="calendrier-legende-label">Semaine de planification</span>';
    htmlCalendrier += '</div>';

    htmlCalendrier += '</div>';
    htmlCalendrier += '<p class="calendrier-legende-astuce">';
    htmlCalendrier += '<strong>Astuce :</strong> Survole un jour pour illuminer toute sa semaine.';
    htmlCalendrier += '</p>';
    htmlCalendrier += '</div>';

    // Fermer la grille
    htmlCalendrier += '</div>';

    // Statistiques - FORMAT HARMONISÉ (texte gauche / chiffre droite)
    let htmlStats = '<div class="u-mb-20">';
    htmlStats += '<div class="cal-grid-auto-200">';

    // Carte 1 : Semaines scolaires
    htmlStats += '<div class="cal-carte-importante">';
    htmlStats += '<div class="u-flex-between">';
    htmlStats += '<span class="cal-texte-gris">Semaines scolaires</span>';
    htmlStats += '<strong class="cal-valeur-grande-bleu">' + nombreSemainesReel + '</strong>';
    htmlStats += '</div>';
    htmlStats += '</div>';

    // Carte 2 : Jours de cours
    htmlStats += '<div class="cal-carte-importante">';
    htmlStats += '<div class="u-flex-between">';
    htmlStats += '<span class="cal-texte-gris">Jours de cours</span>';
    htmlStats += '<strong class="cal-valeur-grande-bleu">' + nombreJoursReel + '</strong>';
    htmlStats += '</div>';
    htmlStats += '</div>';

    // Compter uniquement les congés AVEC reprise
    const congesAvecReprise = tousEvenements.filter(function (evt) {
        return evt.dateReprise && evt.dateReprise !== '';
    }).length;

    // Carte 3 : Congés avec reprises
    htmlStats += '<div class="cal-carte-importante">';
    htmlStats += '<div class="u-flex-between">';
    htmlStats += '<span class="cal-texte-gris">Congés avec reprises</span>';
    htmlStats += '<strong class="cal-valeur-grande-bleu">' + congesAvecReprise + '</strong>';
    htmlStats += '</div>';
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