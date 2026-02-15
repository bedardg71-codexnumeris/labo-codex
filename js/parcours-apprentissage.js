/**
 * ============================================
 * MODULE PARCOURS D'APPRENTISSAGE
 * ============================================
 * Orchestre les mécanismes d'aide existants en un parcours unifié.
 * Deux modes : 🗺️ Explicite (étape par étape) / 🧭 Découverte (exploration libre)
 *
 * VERSION : 1.0
 * DATE : 15 février 2026
 *
 * DÉPENDANCES : db.js (getSync/setSync)
 * CONSOMMATEURS : modal-bienvenue.js, accueil.js, navigation.js
 */

(function() {
'use strict';

// ============================================
// CONFIGURATION DES JALONS
// ============================================

const CHAPITRES = [
    {
        id: 'configurer',
        titre: 'Configurer',
        description: 'Préparer ton cours',
        icone: '⚙️',
        obligatoire: true,
        jalons: ['creer-trimestre', 'configurer-cours', 'creer-groupe']
    },
    {
        id: 'construire',
        titre: 'Construire',
        description: 'Bâtir ta note',
        icone: '🧱',
        obligatoire: true,
        jalons: ['creer-pratique', 'creer-grille', 'creer-echelle', 'creer-production']
    },
    {
        id: 'planifier',
        titre: 'Planifier',
        description: 'Aligner ton cours',
        icone: '🧩',
        obligatoire: false,
        jalons: ['creer-alignement', 'organiser-seances']
    },
    {
        id: 'enseigner',
        titre: 'Enseigner',
        description: 'Au quotidien',
        icone: '📋',
        obligatoire: true,
        jalons: ['prendre-presences', 'evaluer-production', 'consulter-tdb']
    }
];

const JALONS = {
    'creer-trimestre': {
        numero: '①',
        titre: 'Créer un trimestre',
        description: 'Définir les dates et la session du trimestre.',
        chapitre: 'configurer',
        navigation: { section: 'reglages', sousSection: 'reglages-trimestre' }
    },
    'configurer-cours': {
        numero: '②',
        titre: 'Configurer un cours',
        description: 'Entrer le sigle, le titre et la compétence du cours.',
        chapitre: 'configurer',
        navigation: { section: 'reglages', sousSection: 'reglages-cours-actif' }
    },
    'creer-groupe': {
        numero: '③',
        titre: 'Créer un groupe-cours',
        description: 'Ajouter les étudiants dans ton groupe.',
        chapitre: 'configurer',
        navigation: { section: 'reglages', sousSection: 'reglages-groupe' }
    },
    'creer-pratique': {
        numero: '④',
        titre: 'Créer une pratique de notation',
        description: 'Définir comment tu évalues tes étudiants.',
        chapitre: 'construire',
        navigation: { section: 'construction', sousSection: 'construction-pratiques-notation' }
    },
    'creer-grille': {
        numero: '⑤',
        titre: 'Créer une grille de critères',
        description: 'Définir les critères d\'évaluation et leur pondération.',
        chapitre: 'construire',
        navigation: { section: 'construction', sousSection: 'construction-grille-criteres' }
    },
    'creer-echelle': {
        numero: '⑥',
        titre: 'Créer une échelle de niveaux',
        description: 'Définir les niveaux de performance (ex: A, B, C, D, E).',
        chapitre: 'construire',
        navigation: { section: 'construction', sousSection: 'construction-echelle-performance' }
    },
    'creer-production': {
        numero: '⑦',
        titre: 'Créer une production',
        description: 'Définir un travail à évaluer.',
        chapitre: 'construire',
        navigation: { section: 'construction', sousSection: 'construction-productions' }
    },
    'creer-alignement': {
        numero: '⑧',
        titre: 'Créer un alignement pédagogique',
        description: 'Relier les compétences aux activités et évaluations.',
        chapitre: 'planifier',
        navigation: { section: 'planification', sousSection: 'planification-carte' }
    },
    'organiser-seances': {
        numero: '⑨',
        titre: 'Organiser les séances',
        description: 'Placer les leçons dans le calendrier du trimestre.',
        chapitre: 'planifier',
        navigation: { section: 'planification', sousSection: 'planification-organisateur' }
    },
    'prendre-presences': {
        numero: '⑩',
        titre: 'Prendre les présences',
        description: 'Saisir les présences d\'une séance de cours.',
        chapitre: 'enseigner',
        navigation: { section: 'presences', sousSection: 'presences-saisie' }
    },
    'evaluer-production': {
        numero: '⑪',
        titre: 'Évaluer une production',
        description: 'Appliquer une grille et attribuer des niveaux.',
        chapitre: 'enseigner',
        navigation: { section: 'evaluations', sousSection: 'evaluations-liste' }
    },
    'consulter-tdb': {
        numero: '⑫',
        titre: 'Consulter le tableau de bord',
        description: 'Voir l\'état des lieux de ton groupe.',
        chapitre: 'enseigner',
        navigation: { section: 'tableau-bord', sousSection: 'tableau-bord-apercu' }
    }
};

// Clé de stockage (globale, pas namespacée par trimestre)
const CLE_PARCOURS = 'parcours_progression';

// ============================================
// CRITÈRES DE DÉTECTION AUTOMATIQUE
// ============================================

/**
 * Vérifie si un jalon est atteint en consultant les données.
 * Chaque critère retourne true si la condition est remplie.
 */
const CRITERES = {
    'creer-trimestre': function() {
        const info = db.getSync('informationsTrimestre', {});
        return !!(info.dateDebut || info.session);
    },

    'configurer-cours': function() {
        const cours = db.getSync('listeCours', []);
        return cours.some(function(c) { return !c.isDemo && !c.estDemo; });
    },

    'creer-groupe': function() {
        // Vérifier s'il existe un groupe avec au moins 1 étudiant (non-démo)
        try {
            var etudiants = [];
            if (typeof obtenirDonneesSelonMode === 'function') {
                etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
            } else if (typeof window.cle === 'function') {
                etudiants = db.getSync(window.cle('groupeEtudiants'), []);
            }
            return etudiants.length > 0;
        } catch(e) {
            return false;
        }
    },

    'creer-pratique': function() {
        try {
            // Vérifier via le registre des pratiques ou les données directes
            if (typeof window.cle === 'function') {
                var pratiques = db.getSync(window.cle('pratiquesNotation'), []);
                if (pratiques.length > 0) return true;
            }
            // Fallback : clé générique
            var pratiquesGen = db.getSync('pratiquesNotation', []);
            return pratiquesGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'creer-grille': function() {
        try {
            if (typeof window.cle === 'function') {
                var grilles = db.getSync(window.cle('grillesCriteres'), []);
                if (grilles.length > 0) return true;
            }
            var grillesGen = db.getSync('grillesCriteres', []);
            return grillesGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'creer-echelle': function() {
        try {
            if (typeof window.cle === 'function') {
                var echelles = db.getSync(window.cle('echellesPerformance'), []);
                if (echelles.length > 0) return true;
            }
            var echellesGen = db.getSync('echellesPerformance', []);
            return echellesGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'creer-production': function() {
        try {
            if (typeof window.cle === 'function') {
                var productions = db.getSync(window.cle('productions'), []);
                if (productions.length > 0) return true;
            }
            var productionsGen = db.getSync('productions', []);
            return productionsGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'creer-alignement': function() {
        try {
            if (typeof window.cle === 'function') {
                var noeuds = db.getSync(window.cle('planification_noeuds'), []);
                if (noeuds.length > 0) return true;
            }
            var noeudsGen = db.getSync('planification_noeuds', []);
            return noeudsGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'organiser-seances': function() {
        try {
            if (typeof window.cle === 'function') {
                var seances = db.getSync(window.cle('organisateur_seances'), {});
                if (Object.keys(seances).length > 0) return true;
            }
            return false;
        } catch(e) {
            return false;
        }
    },

    'prendre-presences': function() {
        try {
            if (typeof window.cle === 'function') {
                var presences = db.getSync(window.cle('presences'), []);
                if (presences.length > 0) return true;
            }
            var presencesGen = db.getSync('presences', []);
            return presencesGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'evaluer-production': function() {
        try {
            if (typeof window.cle === 'function') {
                var evals = db.getSync(window.cle('evaluationsSauvegardees'), []);
                if (evals.length > 0) return true;
            }
            var evalsGen = db.getSync('evaluationsSauvegardees', []);
            return evalsGen.length > 0;
        } catch(e) {
            return false;
        }
    },

    'consulter-tdb': function() {
        // Ce jalon est validé quand l'utilisateur visite le tableau de bord
        // avec des données existantes. On le détecte via le registre.
        var progression = chargerProgression();
        return !!(progression.jalons && progression.jalons['consulter-tdb'] &&
                  progression.jalons['consulter-tdb'].fait);
    }
};

// ============================================
// GESTION DU REGISTRE
// ============================================

/**
 * Charge la progression depuis le stockage
 */
function chargerProgression() {
    var defaut = {
        mode: null,  // null = pas encore choisi
        dateDebut: null,
        jalons: {},
        autonome: false,
        dateAutonomie: null
    };

    try {
        var data = db.getSync(CLE_PARCOURS, null);
        if (!data) return defaut;
        if (typeof data === 'string') data = JSON.parse(data);
        return data;
    } catch(e) {
        return defaut;
    }
}

/**
 * Sauvegarde la progression
 */
function sauvegarderProgression(progression) {
    db.setSync(CLE_PARCOURS, progression);
}

/**
 * Retourne le mode actuel ('explicite', 'decouverte', 'autonome', ou null)
 */
function getMode() {
    return chargerProgression().mode;
}

/**
 * Définit le mode d'apprentissage
 */
function setMode(mode) {
    var progression = chargerProgression();
    progression.mode = mode;
    if (!progression.dateDebut) {
        progression.dateDebut = new Date().toISOString().split('T')[0];
    }
    sauvegarderProgression(progression);
    mettreAJourUI();
}

/**
 * Vérifie si le parcours a été initialisé (mode choisi)
 */
function estInitialise() {
    return getMode() !== null;
}

/**
 * Vérifie si l'utilisateur est en mode autonome
 */
function estAutonome() {
    return chargerProgression().autonome;
}

// ============================================
// VÉRIFICATION DES JALONS
// ============================================

/**
 * Vérifie tous les jalons et met à jour le registre.
 * Appelé à chaque changement de section et après chaque sauvegarde.
 * @returns {Array} Liste des jalons nouvellement complétés
 */
function verifierJalons() {
    var progression = chargerProgression();
    if (!progression.mode) return [];

    if (!progression.jalons) progression.jalons = {};

    var nouveaux = [];

    Object.keys(CRITERES).forEach(function(jalonId) {
        var etat = progression.jalons[jalonId] || { fait: false, date: null };

        // Ne pas revérifier un jalon déjà fait
        if (etat.fait) return;

        // Vérifier le critère
        if (CRITERES[jalonId]()) {
            etat.fait = true;
            etat.date = new Date().toISOString().split('T')[0];
            progression.jalons[jalonId] = etat;
            nouveaux.push(jalonId);
        }
    });

    if (nouveaux.length > 0) {
        sauvegarderProgression(progression);

        // Vérifier l'autonomie
        verifierAutonomie(progression);

        // Notifier
        nouveaux.forEach(function(jalonId) {
            notifierJalonComplete(jalonId);
        });

        // Mettre à jour l'UI
        mettreAJourUI();
    }

    return nouveaux;
}

/**
 * Marque manuellement un jalon comme complété.
 * Pour les jalons non détectables automatiquement (ex: consulter-tdb).
 */
function marquerJalon(jalonId) {
    var progression = chargerProgression();
    if (!progression.jalons) progression.jalons = {};

    var etat = progression.jalons[jalonId] || { fait: false, date: null };
    if (etat.fait) return; // Déjà fait

    etat.fait = true;
    etat.date = new Date().toISOString().split('T')[0];
    progression.jalons[jalonId] = etat;
    sauvegarderProgression(progression);

    verifierAutonomie(progression);
    notifierJalonComplete(jalonId);
    mettreAJourUI();
}

/**
 * Vérifie si l'autonomie est atteinte (chapitres 1 + 2 + 4 complétés)
 */
function verifierAutonomie(progression) {
    if (progression.autonome) return;

    var chapitresRequis = ['configurer', 'construire', 'enseigner'];
    var toutComplet = chapitresRequis.every(function(chapId) {
        var chapitre = CHAPITRES.find(function(c) { return c.id === chapId; });
        if (!chapitre) return false;
        return chapitre.jalons.every(function(jalonId) {
            var etat = progression.jalons[jalonId];
            return etat && etat.fait;
        });
    });

    if (toutComplet) {
        progression.autonome = true;
        progression.dateAutonomie = new Date().toISOString().split('T')[0];
        progression.mode = 'autonome';
        sauvegarderProgression(progression);

        // Nettoyer tous les mécanismes actifs
        nettoyerMecanismesActifs();

        // Afficher le modal de certification
        afficherCertificationAutonomie();
    }
}

// ============================================
// CALCUL DE LA PROGRESSION
// ============================================

/**
 * Retourne un objet décrivant la progression complète
 */
function getProgression() {
    var progression = chargerProgression();
    var jalonsMap = progression.jalons || {};

    var totalJalons = Object.keys(JALONS).length;
    var jalonsFaits = 0;

    var chapitresDetail = CHAPITRES.map(function(chapitre) {
        var jalonsChap = chapitre.jalons.map(function(jalonId) {
            var config = JALONS[jalonId];
            var etat = jalonsMap[jalonId] || { fait: false, date: null };
            if (etat.fait) jalonsFaits++;

            return {
                id: jalonId,
                numero: config.numero,
                titre: config.titre,
                description: config.description,
                fait: etat.fait,
                date: etat.date,
                navigation: config.navigation
            };
        });

        var complete = jalonsChap.every(function(j) { return j.fait; });
        var enCours = !complete && jalonsChap.some(function(j) { return j.fait; });

        return {
            id: chapitre.id,
            titre: chapitre.titre,
            description: chapitre.description,
            icone: chapitre.icone,
            obligatoire: chapitre.obligatoire,
            jalons: jalonsChap,
            complete: complete,
            enCours: enCours
        };
    });

    // Trouver le prochain jalon à faire
    var prochainJalon = null;
    for (var i = 0; i < CHAPITRES.length; i++) {
        var chap = CHAPITRES[i];
        for (var j = 0; j < chap.jalons.length; j++) {
            var jId = chap.jalons[j];
            var etat = jalonsMap[jId] || { fait: false };
            if (!etat.fait) {
                prochainJalon = JALONS[jId];
                prochainJalon.id = jId;
                break;
            }
        }
        if (prochainJalon) break;
    }

    return {
        mode: progression.mode,
        autonome: progression.autonome,
        chapitres: chapitresDetail,
        totalJalons: totalJalons,
        jalonsFaits: jalonsFaits,
        pourcentage: Math.round((jalonsFaits / totalJalons) * 100),
        prochainJalon: prochainJalon
    };
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Notifie la complétion d'un jalon
 */
function notifierJalonComplete(jalonId) {
    var jalon = JALONS[jalonId];
    if (!jalon) return;

    var progression = getProgression();
    var mode = progression.mode;

    if (mode === 'explicite') {
        // Mode explicite : notification riche avec prochaine étape
        afficherNotificationJalon(jalon, progression);
    } else if (mode === 'decouverte') {
        // Mode découverte : toast discret
        if (typeof afficherNotification === 'function') {
            afficherNotification(
                '✅ ' + jalon.numero + ' ' + jalon.titre + ' — ' + progression.jalonsFaits + '/' + progression.totalJalons,
                'succes',
                3000
            );
        }
    }
    // Mode autonome : aucune notification
}

/**
 * Affiche une notification riche pour le mode explicite
 */
function afficherNotificationJalon(jalon, progression) {
    // Retirer notification existante
    var existante = document.getElementById('notification-jalon');
    if (existante) existante.remove();

    var prochain = progression.prochainJalon;
    var prochainHTML = prochain
        ? '<p style="margin: 8px 0 0; font-size: 0.9rem;">Prochaine étape :<br><strong>' +
          prochain.numero + ' ' + prochain.titre + '</strong></p>' +
          '<div style="margin-top: 12px; display: flex; gap: 8px;">' +
          '<button class="btn btn-principal btn-sm" onclick="window.parcours.naviguerVersJalon(\'' + prochain.id + '\'); this.closest(\'#notification-jalon\').remove();">Continuer →</button>' +
          '<button class="btn btn-secondaire btn-sm" onclick="this.closest(\'#notification-jalon\').remove();">Plus tard</button>' +
          '</div>'
        : '<p style="margin: 8px 0 0; font-size: 0.9rem;">Chapitre complété !</p>';

    var notif = document.createElement('div');
    notif.id = 'notification-jalon';
    notif.className = 'parcours-notification';
    notif.innerHTML =
        '<div class="parcours-notification-contenu">' +
            '<div style="display: flex; justify-content: space-between; align-items: start;">' +
                '<strong>✅ Étape ' + jalon.numero + ' complétée !</strong>' +
                '<button onclick="this.closest(\'#notification-jalon\').remove();" style="background:none; border:none; color:var(--gris-clair); cursor:pointer; font-size:1.2rem; padding:0; line-height:1;">×</button>' +
            '</div>' +
            '<p style="margin: 4px 0 0; color: var(--gris-moyen);">' + jalon.titre + '</p>' +
            prochainHTML +
        '</div>';

    document.body.appendChild(notif);

    // Auto-fermeture après 15 secondes
    setTimeout(function() {
        if (notif.parentNode) {
            notif.classList.add('parcours-notification--sortie');
            setTimeout(function() { if (notif.parentNode) notif.remove(); }, 300);
        }
    }, 15000);
}

/**
 * Nettoie tous les mécanismes d'aide actifs.
 * Appelé lors du passage en mode autonome.
 */
function nettoyerMecanismesActifs() {
    // Arrêter le guidage configuration s'il est actif
    if (typeof arreterGuidage === 'function') {
        arreterGuidage();
    }

    // Retirer la suggestion proactive
    var suggestion = document.getElementById('suggestion-parcours');
    if (suggestion) suggestion.remove();

    // Retirer la notification de jalon
    var notifJalon = document.getElementById('notification-jalon');
    if (notifJalon) notifJalon.remove();

    // Retirer le message de guidage
    var msgGuidage = document.getElementById('message-guidage');
    if (msgGuidage) msgGuidage.remove();

    // Retirer le bouton étape suivante
    var btnEtape = document.getElementById('bouton-etape-suivante');
    if (btnEtape) btnEtape.remove();

    // Masquer l'indicateur header
    mettreAJourIndicateurHeader();
}

/**
 * Affiche le modal de certification d'autonomie
 */
function afficherCertificationAutonomie() {
    var existant = document.getElementById('modal-autonomie');
    if (existant) existant.remove();

    var modal = document.createElement('div');
    modal.id = 'modal-autonomie';
    modal.className = 'modal-bienvenue-overlay';

    modal.innerHTML =
        '<div class="modal-bienvenue-contenu">' +
            '<div class="modal-bienvenue-header">' +
                '<h2>🧭 Tu as ta boussole !</h2>' +
            '</div>' +
            '<div class="modal-bienvenue-body">' +
                '<p>Tu maîtrises les fonctions essentielles de Monitorage. ' +
                'Tu peux maintenant naviguer de façon autonome.</p>' +
                '<div class="modal-bienvenue-reperes">' +
                    '<div class="modal-bienvenue-repere">' +
                        '<span class="repere-icone">💬</span>' +
                        '<span class="repere-texte">Survole un élément pour voir son info-bulle</span>' +
                    '</div>' +
                    '<div class="modal-bienvenue-repere">' +
                        '<span class="repere-icone">🧭</span>' +
                        '<span class="repere-texte">Clique sur 🧭 pour relancer un tour guidé</span>' +
                    '</div>' +
                    '<div class="modal-bienvenue-repere">' +
                        '<span class="repere-icone">📚</span>' +
                        '<span class="repere-texte">Consulte la section Aide pour la référence</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="modal-bienvenue-actions">' +
                '<button class="btn-bienvenue btn-bienvenue-principal" onclick="' +
                    'document.getElementById(\'modal-autonomie\').remove(); ' +
                    'if (window.parcours) window.parcours.mettreAJourUI(); ' +
                    'if (typeof afficherSection === \'function\') afficherSection(\'accueil\'); ' +
                '">' +
                    '<span class="btn-bienvenue-icone">🧭</span>' +
                    '<span class="btn-bienvenue-texte">' +
                        '<strong>C\'est parti !</strong>' +
                    '</span>' +
                '</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);
    requestAnimationFrame(function() {
        modal.classList.add('modal-bienvenue-visible');
    });
}

// ============================================
// NAVIGATION VERS JALONS
// ============================================

/**
 * Navigue vers la section/sous-section associée à un jalon
 */
function naviguerVersJalon(jalonId) {
    var jalon = JALONS[jalonId];
    if (!jalon || !jalon.navigation) return;

    if (typeof afficherSection === 'function') {
        afficherSection(jalon.navigation.section);
        setTimeout(function() {
            if (typeof afficherSousSection === 'function') {
                afficherSousSection(jalon.navigation.sousSection);
            }
        }, 200);
    }
}

// ============================================
// INTERFACE UTILISATEUR — PANNEAU DE PARCOURS
// ============================================

/**
 * Génère le HTML du panneau de parcours pour la page d'accueil
 */
function genererPanneauParcours() {
    var progression = getProgression();
    if (!progression.mode) return '';

    var html = '<div class="parcours-panneau" id="panneau-parcours">';

    // === MODE AUTONOME : panneau compact de félicitation ===
    if (progression.autonome) {
        var dateAuto = chargerProgression().dateAutonomie || '';
        html += '<div class="parcours-header">';
        html += '<h3 class="parcours-titre">🧭 Parcours complété</h3>';
        html += '<span class="parcours-compteur">' + progression.jalonsFaits + '/' + progression.totalJalons + '</span>';
        html += '</div>';
        html += '<div class="parcours-barre-conteneur">';
        html += '<div class="parcours-barre-remplie" style="width: 100%;"></div>';
        html += '</div>';
        html += '<p style="color: var(--gris-moyen); font-size: 0.9rem; margin: 12px 0 4px;">';
        html += 'Tu maîtrises les bases de Monitorage.';
        if (dateAuto) html += ' Autonomie obtenue le ' + dateAuto + '.';
        html += '</p>';
        html += '<p style="margin: 4px 0 0;">';
        html += '<button class="btn btn-secondaire btn-sm" onclick="window.parcours.reinitialiser(); if(typeof afficherAccueil===\'function\') afficherAccueil();">Relancer le parcours</button>';
        html += '</p>';
        html += '</div>';
        return html;
    }

    // === MODE NORMAL : panneau détaillé ===
    html += '<div class="parcours-header">';
    html += '<h3 class="parcours-titre">📍 Ton parcours</h3>';
    html += '<span class="parcours-compteur">' + progression.jalonsFaits + '/' + progression.totalJalons + '</span>';
    html += '</div>';

    // Barre de progression
    html += '<div class="parcours-barre-conteneur">';
    html += '<div class="parcours-barre-remplie" style="width: ' + progression.pourcentage + '%;"></div>';
    html += '</div>';

    // Chapitres et jalons
    progression.chapitres.forEach(function(chapitre) {
        var statut = chapitre.complete ? 'complete' : (chapitre.enCours ? 'en-cours' : 'a-faire');
        var statutLabel = chapitre.complete ? '✅' : (chapitre.enCours ? '▶' : (chapitre.obligatoire ? '' : 'Optionnel'));

        html += '<div class="parcours-chapitre parcours-chapitre--' + statut + '">';
        html += '<div class="parcours-chapitre-header">';
        html += '<span class="parcours-chapitre-titre">' + chapitre.icone + ' ' + chapitre.titre + '</span>';
        html += '<span class="parcours-chapitre-statut">' + statutLabel + '</span>';
        html += '</div>';

        chapitre.jalons.forEach(function(jalon) {
            var classeJalon = jalon.fait ? 'parcours-jalon--fait' : 'parcours-jalon--a-faire';
            var clicAction = jalon.fait ? '' : ' onclick="window.parcours.naviguerVersJalon(\'' + jalon.id + '\')" style="cursor:pointer;"';
            var iconeJalon = jalon.fait ? '✅' : jalon.numero;

            html += '<div class="parcours-jalon ' + classeJalon + '"' + clicAction + '>';
            html += '<span class="parcours-jalon-icone">' + iconeJalon + '</span>';
            html += '<span class="parcours-jalon-titre">' + jalon.titre + '</span>';
            if (jalon.fait && jalon.date) {
                html += '<span class="parcours-jalon-date">' + jalon.date + '</span>';
            }
            html += '</div>';
        });

        html += '</div>';
    });

    html += '</div>';
    return html;
}

/**
 * Met à jour le panneau de parcours si présent dans le DOM
 */
function mettreAJourUI() {
    // Mettre à jour le panneau sur la page d'accueil
    var panneau = document.getElementById('panneau-parcours');
    if (panneau) {
        var parent = panneau.parentNode;
        panneau.remove();
        var temp = document.createElement('div');
        temp.innerHTML = genererPanneauParcours();
        if (temp.firstChild) {
            parent.appendChild(temp.firstChild);
        }
    }

    // Mettre à jour l'indicateur compact dans l'en-tête
    mettreAJourIndicateurHeader();
}

/**
 * Met à jour l'indicateur compact dans l'en-tête
 */
function mettreAJourIndicateurHeader() {
    var indicateur = document.getElementById('parcours-indicateur-header');
    if (!indicateur) return;

    var progression = getProgression();
    if (!progression.mode || progression.autonome) {
        indicateur.style.display = 'none';
        return;
    }

    if (progression.mode === 'explicite') {
        indicateur.style.display = 'flex';
        var prochain = progression.prochainJalon;
        indicateur.innerHTML =
            '<span class="parcours-indicateur-texte">' +
            (prochain ? prochain.numero + ' ' + prochain.titre : 'Parcours complété') +
            '</span>' +
            '<span class="parcours-indicateur-compteur">' +
            progression.jalonsFaits + '/' + progression.totalJalons +
            '</span>';
    } else if (progression.mode === 'decouverte') {
        // Mode découverte : indicateur compact et cliquable
        indicateur.style.display = 'flex';
        indicateur.style.cursor = 'pointer';
        indicateur.title = 'Voir ton parcours';
        indicateur.onclick = function() {
            if (typeof afficherSection === 'function') {
                afficherSection('accueil');
            }
        };
        indicateur.innerHTML =
            '<span class="parcours-indicateur-texte">🧭 Parcours</span>' +
            '<span class="parcours-indicateur-compteur">' +
            progression.jalonsFaits + '/' + progression.totalJalons +
            '</span>';
    } else {
        indicateur.style.display = 'none';
    }
}

// ============================================
// RÉINITIALISATION
// ============================================

/**
 * Réinitialise le parcours (pour les réglages)
 */
function reinitialiser() {
    db.removeSync(CLE_PARCOURS);
    mettreAJourUI();
}

// ============================================
// HOOK DE NAVIGATION
// ============================================

// Cooldown pour éviter les suggestions répétitives
var _derniereSuggestion = 0;
var _derniereSuggestionJalon = '';

/**
 * Appelé par navigation.js à chaque changement de sous-section.
 * Vérifie les jalons, déclenche les modules et affiche les suggestions.
 */
function onNavigationChange(idSousSection) {
    var progression = chargerProgression();
    if (!progression.mode || progression.autonome) return;

    // Jalon spécial : consulter le TDB avec des données
    if (idSousSection === 'tableau-bord-apercu') {
        try {
            var etudiants = [];
            if (typeof obtenirDonneesSelonMode === 'function') {
                etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
            }
            if (etudiants.length > 0) {
                marquerJalon('consulter-tdb');
            }
        } catch(e) { /* ignore */ }
    }

    // Vérifier tous les jalons détectables automatiquement
    var nouveauxJalons = verifierJalons();

    // === MODE DÉCOUVERTE : pulse discret sur l'indicateur header ===
    if (progression.mode === 'decouverte') {
        if (nouveauxJalons.length > 0) {
            pulserIndicateurHeader();
        }
        return; // Pas de suggestions proactives en découverte
    }

    // === MODE EXPLICITE : suggestions proactives ===
    if (progression.mode !== 'explicite') return;

    var prog = getProgression();
    var prochain = prog.prochainJalon;
    if (!prochain) return;

    // Déclencher le tutoriel interactif au jalon ⑩ (presences-saisie)
    if (prochain.id === 'prendre-presences' && idSousSection === 'presences-saisie') {
        if (typeof demarrerTutorielParcours === 'function') {
            setTimeout(function() { demarrerTutorielParcours(); }, 1000);
        }
        return; // Le tutoriel prend le relais
    }

    // Proposer le guidage configuration si jalons ①②③ non faits
    // et que l'utilisateur vient d'arriver dans Réglages
    if (prochain.chapitre === 'configurer' && idSousSection.indexOf('reglages') === 0) {
        var guidageDejaActif = typeof guidageActif !== 'undefined' && guidageActif;
        if (!guidageDejaActif && typeof demarrerGuidageConfiguration === 'function') {
            afficherSuggestionProactive(
                prochain,
                'Lancer la configuration guidée ?',
                function() { demarrerGuidageConfiguration(); }
            );
        }
        return;
    }

    // Suggestion générique : rappeler le prochain jalon
    // Seulement si la section actuelle n'est pas celle du prochain jalon
    if (prochain.navigation) {
        var sectionProchain = prochain.navigation.sousSection;
        if (sectionProchain && idSousSection !== sectionProchain) {
            afficherSuggestionProactive(prochain);
        }
    }
}

/**
 * Affiche une suggestion proactive discrète en bas de l'écran
 * Avec cooldown pour ne pas harceler l'utilisateur
 */
function afficherSuggestionProactive(jalon, texteAction, callback) {
    // Cooldown : pas plus d'une suggestion toutes les 60 secondes pour le même jalon
    var maintenant = Date.now();
    if (jalon.id === _derniereSuggestionJalon && maintenant - _derniereSuggestion < 60000) return;
    _derniereSuggestion = maintenant;
    _derniereSuggestionJalon = jalon.id;

    // Retirer suggestion existante
    var existante = document.getElementById('suggestion-parcours');
    if (existante) existante.remove();

    var suggestion = document.createElement('div');
    suggestion.id = 'suggestion-parcours';
    suggestion.className = 'parcours-suggestion';

    var contenu = '<span class="parcours-suggestion-texte">' +
        '📍 Prochaine étape : <strong>' + jalon.numero + ' ' + jalon.titre + '</strong>' +
        '</span>';

    if (texteAction && callback) {
        // Suggestion avec bouton d'action
        suggestion._callback = callback;
        contenu += '<button class="btn btn-principal btn-sm" onclick="' +
            'var s = document.getElementById(\'suggestion-parcours\'); ' +
            'if (s && s._callback) s._callback(); ' +
            's.remove();">' + texteAction + '</button>';
    } else {
        // Suggestion avec lien de navigation
        contenu += '<button class="btn btn-secondaire btn-sm" onclick="' +
            'window.parcours.naviguerVersJalon(\'' + jalon.id + '\'); ' +
            'this.closest(\'#suggestion-parcours\').remove();">Y aller →</button>';
    }

    contenu += '<button class="parcours-suggestion-fermer" onclick="' +
        'this.closest(\'#suggestion-parcours\').remove();">×</button>';

    suggestion.innerHTML = contenu;
    document.body.appendChild(suggestion);

    // Auto-fermeture après 10 secondes
    setTimeout(function() {
        if (suggestion.parentNode) {
            suggestion.classList.add('parcours-suggestion--sortie');
            setTimeout(function() { if (suggestion.parentNode) suggestion.remove(); }, 300);
        }
    }, 10000);
}

// ============================================
// PULSE INDICATEUR (MODE DÉCOUVERTE)
// ============================================

/**
 * Fait pulser brièvement l'indicateur header pour attirer l'attention
 * sans être intrusif. Utilisé en mode découverte quand un jalon est complété.
 */
function pulserIndicateurHeader() {
    var indicateur = document.getElementById('parcours-indicateur-header');
    if (!indicateur) return;

    indicateur.classList.add('parcours-indicateur--pulse');
    setTimeout(function() {
        indicateur.classList.remove('parcours-indicateur--pulse');
    }, 2000);
}

// ============================================
// EXPORTS
// ============================================

window.parcours = {
    // API principale
    getMode: getMode,
    setMode: setMode,
    estInitialise: estInitialise,
    estAutonome: estAutonome,
    getProgression: getProgression,

    // Gestion des jalons
    verifierJalons: verifierJalons,
    marquerJalon: marquerJalon,
    naviguerVersJalon: naviguerVersJalon,

    // UI
    genererPanneauParcours: genererPanneauParcours,
    mettreAJourUI: mettreAJourUI,

    // Navigation hook
    onNavigationChange: onNavigationChange,

    // Configuration
    reinitialiser: reinitialiser,

    // Données (pour les autres modules)
    CHAPITRES: CHAPITRES,
    JALONS: JALONS
};

})();
