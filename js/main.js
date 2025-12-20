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
        // PAN : Identifier la pratique spécifique
        if (typePAN === 'maitrise') {
            texte = 'PAN-Maîtrise';
        } else if (typePAN === 'specifications') {
            texte = 'PAN-Spécifications';
        } else if (typePAN === 'denotation') {
            texte = 'PAN-Dénotation';
        } else {
            texte = 'PAN';
        }
        classe += ' pan';
    }

    return `<span class="${classe}">${texte}</span>`;
};

// ✅ Fonction reactiverGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre

// ✅ Fonction prechargerGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre
// L'import s'effectue uniquement quand l'utilisateur coche la checkbox

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initialisation du système de monitorage v3.0');
    console.log('📦 Modules chargés : 01-config, 02-navigation');

    // ===============================
    // 0. ÉCOUTER LA SYNCHRONISATION IndexedDB
    // ===============================
    // Recharger les données quand la synchronisation IndexedDB → localStorage est terminée
    window.addEventListener('db-ready', async function(event) {
        console.log('🔄 [Main] Données synchronisées, rechargement...');

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
    });

    // ===============================
    // 1. GÉNÉRATION DYNAMIQUE DES BULLES D'APPRENTISSAGE
    // ===============================
    console.log('🎨 Génération des bulles d\'apprentissage...');

    function creerUneBulle(couleurs, tailles, durees) {
        const bulle = document.createElement('div');

        // Classes aléatoires
        const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
        const taille = tailles[Math.floor(Math.random() * tailles.length)];
        bulle.className = `bulle ${taille} ${couleur}`;

        // Position de départ randomisée - PARTOUT sur l'écran
        const left = `${Math.random() * 100}%`; // 0% à 100% de la largeur
        const bottom = `${Math.random() * 100}%`; // 0% à 100% de la hauteur

        // Variables CSS pour trajectoire unique
        const startX = `${(Math.random() - 0.5) * 60}px`; // -30px à +30px
        const startY = `${(Math.random() - 0.5) * 60}px`; // -30px à +30px

        // Dérive verticale avec possibilité de descente (apprentissage non-linéaire)
        // 70% chance de monter, 30% chance de descendre
        const directionY = Math.random() < 0.7 ? -1 : 1;
        const amplitudeY = 30 + Math.random() * 40; // 30px à 70px
        const driftY = `${directionY * amplitudeY}px`;

        const duree = durees[Math.floor(Math.random() * durees.length)];

        bulle.style.cssText = `
            left: ${left};
            bottom: ${bottom};
            --start-x: ${startX};
            --start-y: ${startY};
            --drift-y: ${driftY};
            animation-duration: ${duree}s;
            animation-delay: 0s;
        `;

        // Écouter la fin de l'animation pour régénérer la bulle
        bulle.addEventListener('animationiteration', function() {
            // Régénérer position et propriétés aléatoires
            const newLeft = `${Math.random() * 100}%`;
            const newBottom = `${Math.random() * 100}%`;
            const newStartX = `${(Math.random() - 0.5) * 60}px`;
            const newStartY = `${(Math.random() - 0.5) * 60}px`;
            const newDirectionY = Math.random() < 0.7 ? -1 : 1;
            const newAmplitudeY = 30 + Math.random() * 40;
            const newDriftY = `${newDirectionY * newAmplitudeY}px`;
            const newDuree = durees[Math.floor(Math.random() * durees.length)];

            // Forcer la réinitialisation de l'animation pour avoir le fade in
            this.style.animation = 'none';
            this.offsetHeight; // Force reflow

            this.style.left = newLeft;
            this.style.bottom = newBottom;
            this.style.setProperty('--start-x', newStartX);
            this.style.setProperty('--start-y', newStartY);
            this.style.setProperty('--drift-y', newDriftY);
            this.style.animation = `floatUp ${newDuree}s infinite linear`;
        });

        return bulle;
    }

    function genererBullesApprentissage() {
        const container = document.getElementById('bulles-container');
        if (!container) return;

        // Récupérer le nombre d'étudiants (groupeEtudiants est la clé correcte)
        const listeEtudiants = db.getSync('groupeEtudiants', []);
        const nbEtudiants = listeEtudiants.length || 10; // Par défaut 10 si pas d'étudiants

        console.log(`   → Création de ${nbEtudiants} bulles (1 par étudiant)`);

        // Couleurs des pratiques
        const couleurs = ['som', 'pan-maitrise', 'pan-spec', 'pan-denotation'];
        const tailles = ['petite', 'moyenne', 'grande'];

        // Durées d'animation variées (35s à 60s) - ralenti pour moins de distraction
        const durees = [35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60];

        // Générer les bulles - toutes présentes dès le début
        for (let i = 0; i < nbEtudiants; i++) {
            const bulle = creerUneBulle(couleurs, tailles, durees);

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
        if (e.key === 'groupeEtudiants') {
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

    afficherSection('tableau-bord');
    console.log('✅ Navigation initialisée - Section par défaut: tableau-bord');

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

    // MODULE DONNÉES DEMO: Chargement données demo en mode Assisté (9 déc 2025)
    if (typeof initialiserModuleDonneesDemo === 'function') {
        console.log('   → Module Données Demo détecté');
        initialiserModuleDonneesDemo();
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

    // ===============================
    // 3.5 EXÉCUTION DES MIGRATIONS (Beta 93.5)
    // ===============================
    // Ajouter coursId aux données existantes si nécessaire
    if (typeof executerMigrationsBeta935 === 'function') {
        executerMigrationsBeta935();
    }

    // ===============================
    // 3.6 GROUPE DÉMO (Beta 93.5)
    // ===============================
    // ✅ Préchargement automatique supprimé
    // Le groupe démo est maintenant géré via checkbox dans Réglages → Trimestre
    // Voir fonction basculerDonneesDemo() dans trimestre.js

    // ===============================
    // 4. FIN D'INITIALISATION
    // ===============================
    console.log('✅ Système initialisé avec succès');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});