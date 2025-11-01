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

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initialisation du système de monitorage v3.0');
    console.log('📦 Modules chargés : 01-config, 02-navigation');

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

    // MODULE 08: Cours
    if (typeof initialiserModuleCours === 'function') {
        console.log('   → Module 08-cours détecté');
        initialiserModuleCours();
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

    // MODULE: Interventions RàI (Beta 0.85)
    if (typeof initialiserModuleInterventions === 'function') {
        console.log('   → Module Interventions RàI détecté');
        initialiserModuleInterventions();
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
    // 4. FIN D'INITIALISATION
    // ===============================
    console.log('✅ Système initialisé avec succès');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});