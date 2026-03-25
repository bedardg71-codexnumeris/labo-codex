/* ===============================
   MODULE 99: POINT D'ENTRÉE ET INITIALISATION
   Index: 50 10-10-2025a → Modularisation

   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   Ce module doit être chargé EN DERNIER après tous les autres modules.
   Il initialise l'application et attache tous les événements globaux.

   Contenu de ce module:
   - Initialisation au chargement du DOM
   - Événements de navigation principale
   - Démarrage de la section par défaut
   - Initialisations conditionnelles des modules
   =============================== */

(function() {
'use strict';

/* ===============================
   FONCTION GLOBALE: Génération d'ID uniques
   =============================== */
/**
 * Génère un ID unique avec préfixe, résistant aux collisions même en boucle
 * @param {string} prefix - Préfixe (ex: 'EVAL_', 'PROD_', 'CR')
 * @returns {string} - ID unique (ex: 'EVAL_1707123456789_k7x2m')
 */
window.genererIdUnique = (function() {
    let compteur = 0;
    return function(prefix) {
        prefix = prefix || '';
        compteur = (compteur + 1) % 0xFFFF;
        const ts = Date.now();
        const rnd = crypto.getRandomValues(new Uint8Array(6));
        const hex = Array.from(rnd, b => b.toString(16).padStart(2, '0')).join('');
        return prefix + ts + '_' + compteur.toString(16) + '_' + hex;
    };
})();

/* ===============================
   FONCTION GLOBALE: Toggle visibilité (Beta 97.1)
   =============================== */
/**
 * Toggle la visibilité d'un élément via la classe CSS .u-hide.
 * Remplace element.style.display = 'none'/'block'/'flex'/etc.
 * @param {HTMLElement|null} element - L'élément à montrer/cacher
 * @param {boolean} show - true pour montrer, false pour cacher
 */
window.toggleDisplay = function(element, show) {
    if (!element) return;
    if (show) {
        element.classList.remove('u-hide');
        element.style.display = '';
    } else {
        element.classList.add('u-hide');
        element.style.display = 'none';
    }
};

/**
 * Vérifie si un étudiant est exclu des calculs du groupe.
 * Inactivité (registrariat) et décrochage (enseignant) : résultats affichés
 * jusqu'à la dernière présence, mais exclus des moyennes et statistiques.
 * @param {Object} etudiant - Objet étudiant avec propriété .statut
 * @returns {boolean}
 */
window.estEtudiantExclu = function(etudiant) {
    if (!etudiant || !etudiant.statut) return false;
    return etudiant.statut === 'inactif' || etudiant.statut === 'décrochage' || etudiant.statut === 'abandon';
};

/* ===============================
   FONCTIONS GLOBALES: Ressources supprimées volontairement (Beta 98.7)
   Empêche les fonctions assurer*() de réinjecter des gabarits
   que l'utilisateur a supprimés.
   =============================== */
window.estRessourceSupprimee = function(id) {
    const supprimees = db.getSync('ressourcesSupprimees', []);
    return supprimees.includes(id);
};

window.marquerRessourceSupprimee = function(id) {
    const supprimees = db.getSync('ressourcesSupprimees', []);
    if (!supprimees.includes(id)) {
        supprimees.push(id);
        db.setSync('ressourcesSupprimees', supprimees);
    }
};

// IDs des gabarits hardcodés (réinjectés par assurer*() si absents)
window.IDS_GABARITS_HARDCODES = [
    'ECHELLE_GENERIQUE', 'ECHELLE_BRUNO_CHIMIE', 'ECHELLE_XAVIER_INFO',
    'ECHELLE_ISABELLE_BIO', 'ECHELLE_HELENE_PHILO', 'ECHELLE_MARIEHELENE_LITT',
    'ECHELLE_ETIENNE_ADMIN', 'ECHELLE_OLIVIER_GEO', 'ECHELLE_JORDAN_PHILO',
    'GRILLE_GENERIQUE', 'CART_GENERIQUE'
];

/* ===============================
   FONCTIONS GLOBALES: Formatage de dates (Beta 97.1 - #68)
   3 formats canoniques, tous acceptent ISO string, tous avec TZ fix
   =============================== */
/** "6 février 2026" */
window.formaterDate = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** "6 fév." */
window.formaterDateCourte = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
};

/** "jeudi 6 février 2026" */
window.formaterDateComplete = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/* ===============================
   FONCTION GLOBALE: Badge de pratique de notation
   =============================== */
/**
 * Génère un badge HTML indiquant la pratique de notation
 * Fonction globale unique utilisée partout dans l'application
 * @param {string} type - 'SOM' ou 'PAN' (fourni par calculerTousLesIndices)
 * @param {boolean} compact - true pour version compacte (profil), false pour version normale
 * @returns {string} - HTML du badge avec classes CSS
 */
window.genererBadgePratique = function(type, compact = false) {
    const config = db.getSync('modalitesEvaluation', {});
    const typePAN = config.typePAN || 'maitrise';

    let texte = '';
    let classe = compact ? 'badge-pratique-compact' : 'badge-pratique';

    if (type === 'SOM') {
        texte = 'SOM';
        classe += ' som';
    } else {
        // PAN : Identifier la pratique spécifique avec classe correspondante
        if (typePAN === 'maitrise' || typePAN === 'standards') {
            texte = 'STD';
            classe += ' std';
        } else if (typePAN === 'specifications') {
            texte = 'SPE';
            classe += ' spe';
        } else if (typePAN === 'denotation') {
            texte = 'DEN';
            classe += ' den';
        } else {
            texte = 'STD';
            classe += ' std';
        }
    }

    return `<span class="${classe}">${texte}</span>`;
};

// ✅ Fonction reactiverGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre

// ✅ Fonction prechargerGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre
// L'import s'effectue uniquement quand l'utilisateur coche la checkbox

// ===============================
// WRAPPERS — Fonctions extraites des onclick complexes (Phase 4)
// ===============================
window.naviguerVersReglagesTrimestre = function() {
    window.location.href = '#reglages-trimestre';
    if (typeof afficherSousSectionActuelle === 'function') {
        afficherSousSectionActuelle('sous-section-trimestre');
    }
};
window.naviguerVersReglagesTrimestreDepuisPresences = function() {
    if (typeof afficherSection === 'function') afficherSection('reglages');
    if (typeof afficherSousSection === 'function') afficherSousSection('reglages-trimestre');
};
window.rechargerPage = function() { window.location.reload(); };
window.ouvrirImportEchellesLocal = function() {
    var el = document.getElementById('fichier-import-echelles-local');
    if (el) el.click();
};
window.ouvrirImportTxtCartouche = function() {
    var el = document.getElementById('fichier-import-txt-cartouche');
    if (el) el.click();
};
window.reinitialiserParcoursAvecConfirm = function() {
    if (confirm('Réinitialiser le parcours ? La progression sera effacée.')) {
        if (window.parcours) {
            window.parcours.reinitialiser();
            if (typeof window.parcours.initialiserPreferencesParcours === 'function') {
                window.parcours.initialiserPreferencesParcours();
            }
        }
    }
};
window.dupliquerPratiqueMaterielActive = function() {
    if (typeof dupliquerPratiqueMateriel === 'function' && typeof pratiqueEnEditionMateriel !== 'undefined') {
        dupliquerPratiqueMateriel(pratiqueEnEditionMateriel);
    }
};
window.supprimerPratiqueMaterielActive = function() {
    if (typeof supprimerPratiqueMateriel === 'function' && typeof pratiqueEnEditionMateriel !== 'undefined') {
        supprimerPratiqueMateriel(pratiqueEnEditionMateriel);
    }
};
window.appliquerPratiqueAuCoursActive = function() {
    if (typeof appliquerPratiqueAuCours === 'function' && typeof pratiqueEnEditionMateriel !== 'undefined') {
        appliquerPratiqueAuCours(pratiqueEnEditionMateriel);
    }
};
window.demarrerCreationMaterielSafe = function() {
    if (typeof demarrerCreationMateriel === 'function') demarrerCreationMateriel();
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initialisation du système de monitorage v3.0');
    console.log('📦 Modules chargés : 01-config, 02-navigation');

    // ===============================
    // FONCTION UTILITAIRE : Recalcul indices C-P
    // ===============================
    function recalculerIndicesSiDemande() {
        if (db.getSync('recalculerIndicesCP', null) === 'true') {
            console.log('🔄 [Main] Recalcul des indices C et P demandé...');
            db.setSync('recalculerIndicesCP', null); // Effacer le flag immédiatement
            if (typeof calculerEtStockerIndicesCP === 'function') {
                try {
                    calculerEtStockerIndicesCP();
                    console.log('✅ [Main] Indices C et P recalculés');
                } catch (e) {
                    console.error('❌ [Main] Erreur lors du recalcul:', e);
                }
            } else {
                console.warn('⚠️ [Main] Fonction calculerEtStockerIndicesCP non disponible');
            }
        }
    }

    // ===============================
    // 0. ÉCOUTER LA SYNCHRONISATION IndexedDB
    // ===============================
    // Recharger les données quand la synchronisation IndexedDB → localStorage est terminée
    window.addEventListener('db-ready', async function(event) {
        console.log('🔄 [Main] Données synchronisées, rechargement...');

        // 🆕 BETA 95.1 (5 jan 2026): Vérifier si migration legacy nécessaire
        if (typeof verifierEtProposerMigrationLegacy === 'function') {
            verifierEtProposerMigrationLegacy();
        }

        // ✅ NOUVEAU (30 déc 2025): Recalculer les indices C et P si demandé (après chargement démo)
        recalculerIndicesSiDemande();

        // Recharger les données de toutes les sections affichées
        if (typeof chargerInfosCours === 'function') {
            chargerInfosCours();
        }
        if (typeof chargerListeEtudiants === 'function') {
            chargerListeEtudiants();
        }
        if (typeof afficherTableauProductions === 'function') {
            await afficherTableauProductions();
        }
        // ✅ NOUVEAU (29 déc 2025): Recharger le tableau de bord après synchronisation IndexedDB
        if (typeof chargerTableauBordApercu === 'function') {
            chargerTableauBordApercu();
        }

        // [Chantier 1] chargerEtatCheckboxDemo supprimée
    });

    // ===============================
    // 1. GÉNÉRATION DYNAMIQUE DES BULLES D'APPRENTISSAGE
    // ===============================
    console.log('🎨 Génération des bulles d\'apprentissage...');

    // BETA 96.2: Durées selon taille pour effet parallaxe
    // Grande = proche = rapide, Petite = loin = lente
    const dureesParTaille = {
        grande: [30, 35, 40, 45, 50],      // Rapide (proche de l'observateur)
        moyenne: [55, 60, 65, 70, 75],     // Normal (distance moyenne)
        petite: [80, 90, 100, 110, 120]    // Lent (loin de l'observateur)
    };

    function creerUneBulle(tailles) {
        // BETA 97.1: Structure imbriquée pour mouvement hélicoïdal
        // Enveloppe = dérive horizontale (floatUp)
        // Bulle intérieure = spin vertical + scale (bulle-helice)
        const trajectoire = document.createElement('div');
        const taille = tailles[Math.floor(Math.random() * tailles.length)];
        trajectoire.className = `bulle-trajectoire ${taille}`;

        // Bulle intérieure (apparence + spin hélicoïdal)
        const bulle = document.createElement('div');
        bulle.className = 'bulle';
        // Délai négatif = chaque bulle démarre à une phase différente du spin
        bulle.style.setProperty('--spin-delay', `-${(Math.random() * 7).toFixed(1)}s`);
        trajectoire.appendChild(bulle);

        // Position de départ randomisée - PARTOUT sur l'écran
        const left = `${Math.random() * 100}%`;
        const bottom = `${Math.random() * 100}%`;

        // Variables CSS pour trajectoire unique
        const startX = `${(Math.random() - 0.5) * 60}px`;
        const startY = `${(Math.random() - 0.5) * 60}px`;

        // Pente subtile de l'axe hélicoïdal (le spin fournit le mouvement vertical)
        const directionY = Math.random() < 0.5 ? -1 : 1;
        const amplitudeY = 5 + Math.random() * 15; // 5-20px sur toute la traversée
        const driftY = `${directionY * amplitudeY}px`;

        // BETA 96.2: Durée selon la taille (effet parallaxe)
        const dureesTaille = dureesParTaille[taille] || dureesParTaille.moyenne;
        const duree = dureesTaille[Math.floor(Math.random() * dureesTaille.length)];

        trajectoire.style.cssText = `
            left: ${left};
            bottom: ${bottom};
            --start-x: ${startX};
            --start-y: ${startY};
            --drift-y: ${driftY};
            animation-duration: ${duree}s;
            animation-delay: 0s;
        `;

        // Régénérer à chaque itération de la dérive (ignorer les événements du spin)
        trajectoire.addEventListener('animationiteration', function(event) {
            if (event.animationName !== 'floatUp') return;

            const newLeft = `${Math.random() * 100}%`;
            const newBottom = `${Math.random() * 100}%`;
            const newStartX = `${(Math.random() - 0.5) * 60}px`;
            const newStartY = `${(Math.random() - 0.5) * 60}px`;
            const newDirectionY = Math.random() < 0.5 ? -1 : 1;
            const newAmplitudeY = 5 + Math.random() * 15;
            const newDriftY = `${newDirectionY * newAmplitudeY}px`;

            const tailleBulle = this.classList.contains('grande') ? 'grande' :
                               this.classList.contains('petite') ? 'petite' : 'moyenne';
            const dureesTaille = dureesParTaille[tailleBulle];
            const newDuree = dureesTaille[Math.floor(Math.random() * dureesTaille.length)];

            // Forcer la réinitialisation de l'animation pour avoir le fade in
            this.style.animation = 'none';
            this.offsetHeight; // Force reflow

            this.style.left = newLeft;
            this.style.bottom = newBottom;
            this.style.setProperty('--start-x', newStartX);
            this.style.setProperty('--start-y', newStartY);
            this.style.setProperty('--drift-y', newDriftY);
            this.style.animation = `floatUp ${newDuree}s infinite linear`;

            // Désynchroniser le spin pour le prochain cycle
            this.querySelector('.bulle').style.setProperty('--spin-delay', `-${(Math.random() * 7).toFixed(1)}s`);
        });

        return trajectoire;
    }

    function genererBullesApprentissage() {
        const container = document.getElementById('bulles-container');
        if (!container) return;

        // Récupérer le nombre d'étudiants (groupeEtudiants est la clé correcte)
        // ✅ NAMESPACING (Beta 95.5)
        const listeEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const nbEtudiants = listeEtudiants.length || 10; // Par défaut 10 si pas d'étudiants

        console.log(`   → Création de ${nbEtudiants} bulles (1 par étudiant)`);

        // BETA 96.2: Toutes les bulles blanches, tailles variées pour effet parallaxe
        const tailles = ['petite', 'moyenne', 'grande'];

        // Générer les bulles - toutes présentes dès le début
        for (let i = 0; i < nbEtudiants; i++) {
            const bulle = creerUneBulle(tailles);

            // Délai négatif pour que les bulles commencent à différents points de leur parcours
            // Si durée = 30s et 30 étudiants, chaque bulle commence à -1s, -2s, -3s...
            // Cela les place à des positions différentes dans leur animation
            const dureeAnimation = parseFloat(bulle.style.animationDuration);
            const delaiNegatif = -(i / nbEtudiants) * dureeAnimation;
            bulle.style.animationDelay = `${delaiNegatif}s`;

            container.appendChild(bulle);
        }

        console.log(`   ✅ ${nbEtudiants} bulles créées (toutes visibles immédiatement, cycle continu)`);
    }

    // Générer les bulles au chargement
    genererBullesApprentissage();

    // Régénérer si la liste d'étudiants change
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.includes('groupeEtudiants')) {
            console.log('   → Mise à jour du nombre de bulles');
            const container = document.getElementById('bulles-container');
            if (container) {
                container.innerHTML = '';
                genererBullesApprentissage();
            }
        }
    });

    // ===============================
    // 1. NAVIGATION PRINCIPALE
    // ===============================
    console.log(' Initialisation de la navigation...');

    document.querySelectorAll('.navigation-principale button').forEach(bouton => {
        bouton.addEventListener('click', function () {
            const onglet = this.getAttribute('data-onglet');
            console.log(`   → Navigation vers: ${onglet}`);
            afficherSection(onglet);
        });
    });

    // Chantier 3 : Section par défaut selon contexte
    const _modeExpert = db.getSync('preferencesAffichage', {}).modeExpert || false;
    const _demoActif = db.getSync('demo-actif', null) === 'true';
    if (_demoActif) {
        afficherSection('tableau-bord');
    } else if (_modeExpert) {
        afficherSection('tableau-bord');
    } else {
        afficherSection('accueil');
    }
    console.log('✅ Navigation initialisée - Section par défaut:', _demoActif ? 'tableau-bord (démo)' : _modeExpert ? 'tableau-bord (expert)' : 'accueil');

// ===============================
    // 2. CHARGEMENTS CONDITIONNELS
    // ===============================
    console.log(' Vérification des modules additionnels...');

    console.log('✅ Application initialisée');

    // ===============================
    // PRIORITÉ 0 : MULTI-TRIMESTRES (Beta 95)
    // Doit s'exécuter EN PREMIER pour la migration et le namespacing
    // ===============================

    if (typeof initialiserModuleTrimestres === 'function') {
        console.log('   → Module Multi-Trimestres détecté');
        initialiserModuleTrimestres();
    }

    // ===============================
    // PRIORITÉ 1 : MODULES GÉNÉRATEURS DE DONNÉES
    // Ces modules créent les sources uniques de vérité
    // ===============================

    // MODULE TRIMESTRE: Génère calendrierComplet (source unique)
    if (typeof initialiserModuleTrimestre === 'function') {
        console.log('   → Module Trimestre détecté');
        initialiserModuleTrimestre();
    }

    // MODULE HORAIRE: Génère seancesCompletes (source unique)
    if (typeof initialiserModuleHoraire === 'function') {
        console.log('   → Module 10-horaire détecté');
        initialiserModuleHoraire();
    }

    // ===============================
    // PRIORITÉ 2 : DONNÉES DE BASE
    // ===============================

    // MODULE 03: Liste des étudiants
    if (typeof initialiserModuleListeEtudiants === 'function') {
        console.log('   → Module 03-liste-etudiants détecté');
        initialiserModuleListeEtudiants();
    }

    // MODULE 04: Productions et évaluations
    if (typeof initialiserModuleProductions === 'function') {
        console.log('   → Module 04-productions détecté');
        initialiserModuleProductions();
    }

    // MODULE 05: Grilles de critères
    if (typeof initialiserModuleGrilles === 'function') {
        console.log('   → Module 05-grilles détecté');
        initialiserModuleGrilles();
    }

    // MODULE 06: Échelles de performance
    if (typeof initialiserModuleEchelles === 'function') {
        console.log('   → Module 06-echelles détecté');
        initialiserModuleEchelles();
    }

    // MODULE 07: Cartouches de rétroaction
    if (typeof initialiserModuleCartouches === 'function') {
        console.log('   → Module 07-cartouches détecté');
        initialiserModuleCartouches();
    }

    // MODULE 07B: Objectifs d'apprentissage
    if (typeof initialiserModuleObjectifs === 'function') {
        console.log('   → Module 07b-objectifs détecté');
        initialiserModuleObjectifs();
    }

    // MODULE 08: Cours
    if (typeof initialiserModuleCours === 'function') {
        console.log('   → Module 08-cours détecté');
        initialiserModuleCours();
    }

    // MODULE CONTEXTE: Affichage informations contextuelles dans l'en-tête
    if (typeof initialiserModuleContexte === 'function') {
        console.log('   → Module Contexte détecté');
        initialiserModuleContexte();
    }

    // MODULE DONNÉES DEMO: Initialisation + nettoyage résidus (Chantier 2)
    if (typeof initialiserModuleDonneesDemo === 'function') {
        console.log('   → Module Données Demo détecté');
        initialiserModuleDonneesDemo();
    }
    // Filet de sécurité : nettoyer les résidus de démo si crash pendant la démo
    if (typeof nettoyerResiduDemo === 'function') {
        nettoyerResiduDemo().then(cleaned => {
            if (cleaned) console.log('[Main] Résidus démo nettoyés');
        });
    }

    // MODULE ACCUEIL: Page d'accueil (Chantier 3)
    if (typeof initialiserAccueil === 'function') {
        console.log('   → Module Accueil détecté');
        initialiserAccueil();
    }

    // MODULE 11: Gestion du groupe
    if (typeof initialiserModuleGroupe === 'function') {
        console.log('   → Module 11-groupe détecté');
        initialiserModuleGroupe();
    }

    // MODULE 12: Pratiques de notation
    if (typeof initialiserModulePratiques === 'function') {
        console.log('   → Module 12-pratiques détecté');
        initialiserModulePratiques();
    }

    // REGISTRE DES PRATIQUES: Initialiser et vérifier les pratiques enregistrées
    if (typeof initialiserRegistrePratiques === 'function') {
        console.log('   → Registre de pratiques détecté');
        initialiserRegistrePratiques();
    }

    // ===============================
    // PRIORITÉ 3 : MODULES LECTEURS
    // Ces modules lisent les données générées par les modules sources
    // ===============================

    // MODULE 09-1: Vue calendaire (lit calendrierComplet)
    if (typeof initialiserModuleVueCalendaire === 'function') {
        console.log('   → Module 09-1-vue-calendaire détecté');
        initialiserModuleVueCalendaire();
    }

    // MODULE 09-2: Saisie des présences (lit seancesCompletes)
    if (typeof initialiserModuleSaisiePresences === 'function') {
        console.log('   → Module 09-2-saisie-presences détecté');
        initialiserModuleSaisiePresences();
    }

    // ===============================
    // PRIORITÉ 4 : MODULES AVANCÉS
    // ===============================

    // MODULE EVALUATION: Évaluations
    if (typeof initialiserModuleEvaluation === 'function') {
        console.log('   → Module Evaluation détecté');
        initialiserModuleEvaluation();
    }

    // MODULE 14: Statistiques
    if (typeof initialiserModuleStatistiques === 'function') {
        console.log('   → Module 14-statistiques détecté');
        initialiserModuleStatistiques();
    }

    // MODULE 15: Profil étudiant
    if (typeof initialiserModuleProfilEtudiant === 'function') {
        console.log('   → Module 15-profil-etudiant détecté');
        initialiserModuleProfilEtudiant();
    }

    // MODULE 16: Liste des évaluations
    if (typeof initialiserListeEvaluations === 'function') {
        console.log('   → Module 16-liste-evaluations détecté');
        // Note: Initialisation différée lors de l'affichage de la sous-section
    }

    // MODULE 17: Gestion des modes
    if (typeof initialiserSystemeModes === 'function') {
        console.log('   → Module 17-modes détecté (déjà initialisé automatiquement)');
        // Note: initialiserSystemeModes() est appelé automatiquement à la fin de modes.js
        // pour garantir que le système est prêt AVANT les autres modules
    }

    // MODULE: Interventions RàI (Beta 85)
    if (typeof initialiserModuleInterventions === 'function') {
        console.log('   → Module Interventions RàI détecté');
        initialiserModuleInterventions();
    }

    // MODULE: Snapshots progression longitudinale (Beta 93)
    if (typeof initialiserModuleSnapshots === 'function') {
        console.log('   → Module Snapshots détecté');
        initialiserModuleSnapshots();
    }

    // ===============================
    // PRIORITÉ 5 : UTILITAIRES
    // ===============================

    // MODULE : Utilitaires
    if (typeof initialiserModuleUtilitaires === 'function') {
        console.log('   → Module-utilitaires détecté');
        initialiserModuleUtilitaires();
    }

    // MODULE : Import/Export
    if (typeof initialiserModuleImportExport === 'function') {
        console.log('   → Module import-export détecté');
        initialiserModuleImportExport();
    }

    // ===============================
    // PRIORITÉ 6 : TABLEAU DE BORD (SYNTHÈSE)
    // Doit être initialisé en dernier car il lit toutes les sources
    // ===============================
    
    if (typeof initialiserModuleTableauBordApercu === 'function') {
        console.log('   → Module Tableau de bord (aperçu) détecté');
        initialiserModuleTableauBordApercu();
    }

    if (typeof initialiserModulePresencesApercu === 'function') {
        console.log('   → Module Présences (aperçu) détecté');
        initialiserModulePresencesApercu();
    }

    if (typeof initialiserModuleEvaluationsApercu === 'function') {
        console.log('   → Module Évaluations (aperçu) détecté');
        initialiserModuleEvaluationsApercu();
    }

    // ===============================
    // 3. ÉVÉNEMENTS GLOBAUX
    // ===============================
    console.log(' Initialisation des événements globaux...');

    // Sélecteur d'étudiant dans le détail individuel
    const selectEtudiant = document.getElementById('select-etudiant');
    if (selectEtudiant) {
        selectEtudiant.addEventListener('change', function () {
            if (typeof chargerDetailEtudiant === 'function') {
                chargerDetailEtudiant(this.value);
                console.log(`   → Chargement détail étudiant: ${this.value}`);
            }
        });
        console.log('   ✅ Événement select-etudiant attaché');
    }

    // Affichage du tableau des cours
    document.addEventListener('click', function (e) {
        if (e.target.matches('[data-sous-onglet="reglages-cours"]')) {
            setTimeout(() => {
                if (typeof afficherTableauCours === 'function') {
                    afficherTableauCours();
                    console.log('   → Affichage tableau des cours');
                }
            }, 50);
        }
    });
    console.log('   ✅ Événement affichage cours attaché');

    // Délégation des accordéons (remplace 78+ onclick inline)
    document.addEventListener('click', function (e) {
        var header = e.target.closest('.accordeon-header');
        if (header) {
            e.stopPropagation();
            if (typeof toggleAccordeonV2 === 'function') {
                toggleAccordeonV2(header);
            }
        }
    });

    // Délégation générique des actions (remplace onclick inline dans index.html)
    document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-action]');
        if (!el) return;

        var action = el.dataset.action;

        // Confirmation optionnelle
        if (el.dataset.confirm && !confirm(el.dataset.confirm)) return;

        // stopPropagation optionnel
        if (el.hasAttribute('data-stop')) e.stopPropagation();

        // preventDefault optionnel (liens <a> avec data-action)
        if (el.hasAttribute('data-prevent')) e.preventDefault();

        // Résoudre la fonction (supporte dot notation : Codex.actionOuvrir)
        var fn = action.split('.').reduce(function(obj, key) {
            return obj ? obj[key] : undefined;
        }, window);

        if (typeof fn === 'function') {
            var param = el.dataset.param;
            var param2 = el.dataset.param2;
            var param3 = el.dataset.param3;
            if (param !== undefined) {
                if (param !== '' && !isNaN(param)) param = Number(param);
                if (param2 !== undefined) {
                    if (param2 !== '' && !isNaN(param2)) param2 = Number(param2);
                    if (param3 !== undefined) {
                        if (param3 !== '' && !isNaN(param3)) param3 = Number(param3);
                        fn(param, param2, param3);
                    } else {
                        fn(param, param2);
                    }
                } else {
                    fn(param);
                }
            } else {
                fn();
            }
        }
    });

    // Délégation change / input / keyup / mousedown (Phase 5 — remplace on* inline)
    ['change', 'input', 'keyup', 'mousedown', 'focusin'].forEach(function(eventType) {
        document.addEventListener(eventType, function(e) {
            var attr = 'data-on-' + eventType;
            var el = e.target.closest('[' + attr + ']');
            if (!el) return;

            var action = el.getAttribute(attr);
            var fn = action.split('.').reduce(function(obj, key) {
                return obj ? obj[key] : undefined;
            }, window);

            if (typeof fn !== 'function') return;

            var param = el.dataset.param;
            var param2 = el.dataset.param2;
            if (param !== undefined && param !== '' && !isNaN(param)) param = Number(param);

            if (param !== undefined && param2 !== undefined) {
                fn(param, param2);
            } else if (param !== undefined) {
                fn(param, el);
            } else {
                fn(el);
            }
        });
    });

    // Délégation fermeture overlay (click sur le fond = fermer la modale)
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-close-on-bg')) {
            var action = e.target.getAttribute('data-close-on-bg');
            var fn = action.split('.').reduce(function(obj, key) {
                return obj ? obj[key] : undefined;
            }, window);
            if (typeof fn === 'function') fn();
        }
    });

    // Délégation dragstart (remplace ondragstart inline)
    document.addEventListener('dragstart', function(e) {
        var el = e.target.closest('[data-drag-data]');
        if (!el) return;
        var data = el.getAttribute('data-drag-data');
        var idx = data.indexOf(':');
        if (idx > -1) {
            e.dataTransfer.setData(data.substring(0, idx), data.substring(idx + 1));
        }
    });

    // ===============================
    // 3.5 EXÉCUTION DES MIGRATIONS (Beta 93.5)
    // ===============================
    // Ajouter coursId aux données existantes si nécessaire
    if (typeof executerMigrationsBeta935 === 'function') {
        executerMigrationsBeta935();
    }

    // ===============================
    // 3.6 EXÉCUTION DES MIGRATIONS (Beta 95)
    // ===============================
    // Migrer horaires globaux vers horaires par cours
    if (typeof executerMigrationsBeta95 === 'function') {
        executerMigrationsBeta95();
    }

    // ===============================
    // 3.6b MIGRATION CLÉ PRODUCTIONS (Beta 97)
    // ===============================
    // Copier productionsPedagogiques → productions (clé canonique)
    if (typeof migrerCleProductionsPedagogiques === 'function') {
        migrerCleProductionsPedagogiques();
    }

    // ===============================
    // 3.7 GROUPE DÉMO (Beta 93.5)
    // ===============================
    // ✅ Préchargement automatique supprimé
    // Le groupe démo est maintenant géré via checkbox dans Réglages → Trimestre
    // Voir fonction basculerDonneesDemo() dans trimestre.js

    // ===============================
    // 3.8 RECALCUL INDICES C-P (FALLBACK)
    // ===============================
    // Si db-ready n'a pas été capturé, recalculer après un délai
    setTimeout(() => {
        recalculerIndicesSiDemande();
    }, 1500); // Attendre 1.5s pour s'assurer que tout est chargé

    // ===============================
    // 4. FIN D'INITIALISATION
    // ===============================
    console.log('✅ Système initialisé avec succès');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

})();
