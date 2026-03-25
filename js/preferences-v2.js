/**
 * preferences-v2.js
 * Module de gestion de l'onglet Préférences (Beta 95)
 *
 * Gère les options d'affichage et de personnalisation :
 * - Outils à exploiter (A-C-P, patterns, RàI, mode comparatif)
 * - Affichage des ressources (SOLO, snapshots, graphiques, détails)
 * - Configuration du dépistage (grille de référence)
 * - Seuils d'interprétation (fragile, acceptable, bon)
 *
 * Ces préférences sont globales (pas par groupe-cours) et affectent
 * l'affichage dans toute l'application.
 */

(function() {
    'use strict';

    console.log('[preferences-v2] Chargement du module...');

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Préférences v2
     */
    function initialiserPreferencesV2() {
        console.log('[preferences-v2] Initialisation...');

        // Charger le dropdown des grilles
        chargerDropdownGrillesPreferencesV2();

        // Charger les valeurs depuis le storage
        chargerPreferencesDepuisStorage();

        console.log('[preferences-v2] Initialisation terminée');
    }

    // =========================================================================
    // DROPDOWN GRILLES
    // =========================================================================

    /**
     * Charge la liste des grilles dans le dropdown de référence
     */
    function chargerDropdownGrillesPreferencesV2() {
        const dropdown = document.getElementById('v2-pref-grille-reference');
        if (!dropdown) return;

        let grilles = [];
        try {
            grilles = db.getSync('grillesTemplates') || [];
        } catch (e) {
            console.error('[preferences-v2] Erreur lecture grilles:', e);
        }

        // Garder la première option
        dropdown.innerHTML = '<option value="">-- Sélectionner une grille --</option>';

        // Ajouter les grilles
        grilles.forEach(g => {
            if (!g || !g.id) return;
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.nom || g.id;
            dropdown.appendChild(option);
        });
    }

    // =========================================================================
    // CHARGEMENT DEPUIS STORAGE
    // =========================================================================

    /**
     * Charge les préférences depuis le storage
     */
    function chargerPreferencesDepuisStorage() {
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        let preferences = {};
        try {
            preferences = db.getSync('preferencesAffichage') || {};
        } catch (e) {
            preferences = {};
        }

        // Outils à exploiter
        const depistageAcp = document.getElementById('v2-pref-depistage-acp');
        if (depistageAcp) {
            depistageAcp.checked = preferences.depistageAcp !== false;
        }

        const patterns = document.getElementById('v2-pref-patterns');
        if (patterns) {
            patterns.checked = preferences.patterns !== false;
        }

        const rai = document.getElementById('v2-pref-rai');
        if (rai) {
            rai.checked = modalites.activerRai !== false;
        }

        const comparatif = document.getElementById('v2-pref-comparatif');
        if (comparatif) {
            comparatif.checked = modalites.afficherSommatif && modalites.afficherAlternatif;
        }

        // Affichage des ressources
        const solo = document.getElementById('v2-pref-solo');
        if (solo) {
            solo.checked = modalites.afficherDescriptionsSOLO !== false;
        }

        const snapshots = document.getElementById('v2-pref-snapshots');
        if (snapshots) {
            snapshots.checked = preferences.afficherSnapshots !== false;
        }

        const graphiques = document.getElementById('v2-pref-graphiques');
        if (graphiques) {
            graphiques.checked = preferences.afficherGraphiques !== false;
        }

        const seuilsVisuels = document.getElementById('v2-pref-seuils-visuels');
        if (seuilsVisuels) {
            seuilsVisuels.checked = preferences.afficherSeuilsVisuels !== false;
        }

        const detailsTechniques = document.getElementById('v2-pref-details-techniques');
        if (detailsTechniques) {
            detailsTechniques.checked = preferences.afficherDetailsTechniques === true;
        }

        // 🆕 BETA 96.1 : Animation des points du tableau de bord
        const animationPoints = document.getElementById('v2-pref-animation-points');
        if (animationPoints) {
            animationPoints.checked = preferences.animationPoints !== false;
        }
        // Appliquer immédiatement l'état de l'animation
        appliquerAnimationPoints(preferences.animationPoints !== false);

        // Métadonnées contextuelles (graphiques)
        const contexteGraphiques = document.getElementById('v2-pref-contexte-graphiques');
        if (contexteGraphiques) {
            contexteGraphiques.checked = preferences.afficherContexteGraphiques !== false;
        }

        // Chrono évaluation
        const chronoEval = document.getElementById('v2-pref-chrono-eval');
        if (chronoEval) {
            chronoEval.checked = preferences.chronoEvaluation === true;
        }

        // 🆕 BETA 95.1 : Unité d'affichage de l'assiduité (périodes/heures)
        const uniteAffichage = document.getElementById('v2-pref-unite-affichage');
        if (uniteAffichage) {
            uniteAffichage.value = preferences.uniteAffichageAssiduite || 'periodes';
        }

        // SIS par défaut
        const sisSelect = document.getElementById('v2-pref-sis');
        if (sisSelect) {
            sisSelect.value = preferences.sisDefaut || 'lea';
        }

        // Grille de référence
        const grilleReference = document.getElementById('v2-pref-grille-reference');
        if (grilleReference && modalites.grilleReferenceDepistage) {
            grilleReference.value = modalites.grilleReferenceDepistage;
        }

        // Découpler Performance et Risque
        const decouplerPR = document.getElementById('v2-pref-decoupler-pr');
        if (decouplerPR) {
            decouplerPR.checked = modalites.decouplerPR === true;
        }

        // Fenêtre d'analyse des patterns
        const fenetrePatterns = document.getElementById('v2-pref-fenetre-patterns');
        if (fenetrePatterns) {
            fenetrePatterns.value = modalites.fenetrePatterns || 3;
        }

        // Seuils d'interprétation
        let seuils = {};
        try {
            seuils = db.getSync('seuilsInterpretation') || {};
        } catch (e) {
            seuils = {};
        }

        const seuilFragile = document.getElementById('v2-seuil-fragile');
        if (seuilFragile) {
            seuilFragile.value = Math.round((seuils.fragile || 0.70) * 100);
        }

        const seuilAcceptable = document.getElementById('v2-seuil-acceptable');
        if (seuilAcceptable) {
            seuilAcceptable.value = Math.round((seuils.acceptable || 0.80) * 100);
        }

        const seuilBon = document.getElementById('v2-seuil-bon');
        if (seuilBon) {
            seuilBon.value = Math.round((seuils.bon || 0.85) * 100);
        }

        // Seuils avancés de détection
        const seuilProgression = document.getElementById('v2-seuil-progression');
        if (seuilProgression) {
            seuilProgression.value = seuils.progressionArtefacts || 0.10;
            mettreAJourAffichageSeuilV2('progression', seuilProgression.value);
        }

        const seuilRisque = document.getElementById('v2-seuil-risque');
        if (seuilRisque) {
            seuilRisque.value = seuils.directionRisque || 0.05;
            mettreAJourAffichageSeuilV2('risque', seuilRisque.value);
        }

        const seuilDefi = document.getElementById('v2-seuil-defi');
        if (seuilDefi) {
            seuilDefi.value = seuils.defiSpecifique || 0.70;
            mettreAJourAffichageSeuilV2('defi', seuilDefi.value);
        }
    }

    // =========================================================================
    // SAUVEGARDE
    // =========================================================================

    /**
     * Sauvegarde les préférences
     */
    function sauvegarderPreferencesV2() {
        // Sauvegarder dans modalitesEvaluation pour compatibilité
        let modalites = {};
        try {
            modalites = db.getSync('modalitesEvaluation') || {};
        } catch (e) {
            modalites = {};
        }

        // Mode comparatif
        const comparatif = document.getElementById('v2-pref-comparatif')?.checked || false;
        if (comparatif) {
            modalites.afficherSommatif = true;
            modalites.afficherAlternatif = true;
        } else {
            // Mode normal selon la pratique
            if (modalites.pratique === 'sommative') {
                modalites.afficherSommatif = true;
                modalites.afficherAlternatif = false;
            } else {
                modalites.afficherSommatif = false;
                modalites.afficherAlternatif = true;
            }
        }

        // RàI et SOLO
        modalites.activerRai = document.getElementById('v2-pref-rai')?.checked !== false;
        modalites.afficherDescriptionsSOLO = document.getElementById('v2-pref-solo')?.checked !== false;

        // Grille de référence
        modalites.grilleReferenceDepistage = document.getElementById('v2-pref-grille-reference')?.value || '';

        // Découpler Performance et Risque
        modalites.decouplerPR = document.getElementById('v2-pref-decoupler-pr')?.checked === true;

        // Fenêtre d'analyse des patterns
        modalites.fenetrePatterns = parseInt(document.getElementById('v2-pref-fenetre-patterns')?.value) || 3;

        db.setSync('modalitesEvaluation', modalites);

        // Sauvegarder dans preferencesAffichage
        let preferences = {};
        try {
            preferences = db.getSync('preferencesAffichage') || {};
        } catch (e) {
            preferences = {};
        }

        preferences.depistageAcp = document.getElementById('v2-pref-depistage-acp')?.checked !== false;
        preferences.patterns = document.getElementById('v2-pref-patterns')?.checked !== false;
        preferences.afficherSnapshots = document.getElementById('v2-pref-snapshots')?.checked !== false;
        preferences.afficherGraphiques = document.getElementById('v2-pref-graphiques')?.checked !== false;
        preferences.afficherSeuilsVisuels = document.getElementById('v2-pref-seuils-visuels')?.checked !== false;
        preferences.afficherDetailsTechniques = document.getElementById('v2-pref-details-techniques')?.checked === true;
        // 🆕 BETA 95.1 : Unité d'affichage de l'assiduité
        preferences.uniteAffichageAssiduite = document.getElementById('v2-pref-unite-affichage')?.value || 'periodes';
        // 🆕 BETA 96.1 : Animation des points
        preferences.animationPoints = document.getElementById('v2-pref-animation-points')?.checked !== false;
        appliquerAnimationPoints(preferences.animationPoints);
        // Métadonnées contextuelles (graphiques)
        preferences.afficherContexteGraphiques = document.getElementById('v2-pref-contexte-graphiques')?.checked !== false;
        // Chrono évaluation
        preferences.chronoEvaluation = document.getElementById('v2-pref-chrono-eval')?.checked === true;
        // SIS par défaut
        preferences.sisDefaut = document.getElementById('v2-pref-sis')?.value || 'lea';

        db.setSync('preferencesAffichage', preferences);

        console.log('[preferences-v2] Préférences sauvegardées');
    }

    /**
     * Sauvegarde les seuils d'interprétation
     */
    function sauvegarderSeuilsV2() {
        let seuils = {};
        try {
            seuils = db.getSync('seuilsInterpretation') || {};
        } catch (e) {
            seuils = {};
        }

        const fragile = parseInt(document.getElementById('v2-seuil-fragile')?.value) || 70;
        const acceptable = parseInt(document.getElementById('v2-seuil-acceptable')?.value) || 80;
        const bon = parseInt(document.getElementById('v2-seuil-bon')?.value) || 85;

        // Validation : fragile < acceptable < bon
        if (fragile >= acceptable || acceptable >= bon) {
            alert('Erreur : Les seuils doivent être ordonnés (Fragile < Acceptable < Bon)');
            return;
        }

        seuils.fragile = fragile / 100;
        seuils.acceptable = acceptable / 100;
        seuils.bon = bon / 100;

        // Seuils avancés de détection
        const seuilProgression = document.getElementById('v2-seuil-progression');
        if (seuilProgression) {
            seuils.progressionArtefacts = parseFloat(seuilProgression.value) || 0.10;
        }

        const seuilRisque = document.getElementById('v2-seuil-risque');
        if (seuilRisque) {
            seuils.directionRisque = parseFloat(seuilRisque.value) || 0.05;
        }

        const seuilDefi = document.getElementById('v2-seuil-defi');
        if (seuilDefi) {
            seuils.defiSpecifique = parseFloat(seuilDefi.value) || 0.70;
        }

        db.setSync('seuilsInterpretation', seuils);
        console.log('[preferences-v2] Seuils sauvegardés');
    }

    /**
     * Restaure les seuils d'interprétation par défaut (Fragile/Acceptable/Bon)
     */
    function restaurerSeuilsInterpretationDefautV2() {
        const seuilFragile = document.getElementById('v2-seuil-fragile');
        const seuilAcceptable = document.getElementById('v2-seuil-acceptable');
        const seuilBon = document.getElementById('v2-seuil-bon');

        if (seuilFragile) seuilFragile.value = 70;
        if (seuilAcceptable) seuilAcceptable.value = 80;
        if (seuilBon) seuilBon.value = 85;

        sauvegarderSeuilsV2();
        afficherNotificationSuccesV2('Seuils d\'interprétation restaurés');
    }

    /**
     * Restaure les seuils de détection avancés par défaut
     */
    function restaurerSeuilsDetectionDefautV2() {
        const fenetrePatterns = document.getElementById('v2-pref-fenetre-patterns');
        const seuilProgression = document.getElementById('v2-seuil-progression');
        const seuilRisque = document.getElementById('v2-seuil-risque');
        const seuilDefi = document.getElementById('v2-seuil-defi');

        if (fenetrePatterns) fenetrePatterns.value = 3;

        if (seuilProgression) {
            seuilProgression.value = 0.10;
            mettreAJourAffichageSeuilV2('progression', 0.10);
        }
        if (seuilRisque) {
            seuilRisque.value = 0.05;
            mettreAJourAffichageSeuilV2('risque', 0.05);
        }
        if (seuilDefi) {
            seuilDefi.value = 0.70;
            mettreAJourAffichageSeuilV2('defi', 0.70);
        }

        sauvegarderSeuilsV2();
        sauvegarderPreferencesV2(); // Pour sauvegarder fenetrePatterns dans modalitesEvaluation
        afficherNotificationSuccesV2('Seuils de détection restaurés');
    }

    /**
     * Met à jour l'affichage de la valeur d'un seuil slider
     * @param {string} type - Type de seuil ('progression', 'risque', 'defi')
     * @param {number} valeur - Valeur du seuil (0-1)
     */
    function mettreAJourAffichageSeuilV2(type, valeur) {
        var v = (typeof valeur === 'object' && valeur && valeur.value !== undefined) ? valeur.value : valeur;
        const valeurNum = parseFloat(v);

        if (type === 'progression') {
            const elem = document.getElementById('v2-valeur-progression');
            if (elem) elem.textContent = `${Math.round(valeurNum * 100)} points (%)`;
        } else if (type === 'risque') {
            const elem = document.getElementById('v2-valeur-risque');
            if (elem) elem.textContent = `${Math.round(valeurNum * 100)} points (%)`;
        } else if (type === 'defi') {
            const elem = document.getElementById('v2-valeur-defi');
            if (elem) elem.textContent = `${Math.round(valeurNum * 100)}%`;
        }
    }

    /**
     * Sauvegarde toutes les préférences
     */
    function sauvegarderToutesPreferencesV2() {
        sauvegarderPreferencesV2();
        sauvegarderSeuilsV2();
        afficherNotificationSuccesV2('Préférences sauvegardées avec succès');
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================

    /**
     * Affiche une notification de succès
     */
    function afficherNotificationSuccesV2(message) {
        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(message);
        } else if (typeof window.afficherMessage === 'function') {
            window.afficherMessage(message, 'succes');
        } else {
            console.log('[preferences-v2]', message);
        }
    }

    // =========================================================================
    // 🆕 BETA 95.1 : FORMATAGE DE L'ASSIDUITÉ SELON PRÉFÉRENCE
    // =========================================================================

    /**
     * Obtient la préférence d'unité d'affichage
     * @returns {string} - 'periodes' | 'heures' | 'les-deux'
     */
    function obtenirUniteAffichageAssiduite() {
        try {
            const preferences = db.getSync('preferencesAffichage') || {};
            return preferences.uniteAffichageAssiduite || 'periodes';
        } catch (e) {
            return 'periodes';
        }
    }

    /**
     * Formate l'assiduité selon la préférence d'affichage
     * @param {Object} assiduite - Objet avec heuresPresentes, heuresOffertes, periodesPresentes, periodesOffertes
     * @param {string} modeForce - Mode forcé (optionnel) : 'periodes' | 'heures' | 'les-deux'
     * @returns {string} - Texte formaté
     */
    function formaterAssiduiteAvecUnite(assiduite, modeForce = null) {
        const mode = modeForce || obtenirUniteAffichageAssiduite();

        const heuresP = assiduite.heuresPresentes || 0;
        const heuresO = assiduite.heuresOffertes || 0;
        const periodesP = assiduite.periodesPresentes || 0;
        const periodesO = assiduite.periodesOffertes || 0;

        switch (mode) {
            case 'heures':
                return `${heuresP.toFixed(1)}h / ${heuresO.toFixed(1)}h`;

            case 'les-deux':
                return `${periodesP} / ${periodesO} pér. (${heuresP.toFixed(1)}h / ${heuresO.toFixed(1)}h)`;

            case 'periodes':
            default:
                return `${periodesP} / ${periodesO} périodes`;
        }
    }

    /**
     * Formate un total de présence selon la préférence d'affichage
     * @param {number} heures - Heures totales
     * @param {string} modeForce - Mode forcé (optionnel)
     * @returns {string} - Texte formaté
     */
    function formaterTotalPresence(heures, modeForce = null) {
        const mode = modeForce || obtenirUniteAffichageAssiduite();
        const dureePeriode = typeof window.obtenirDureePeriode === 'function' ? window.obtenirDureePeriode() : 55;
        const periodes = Math.round((heures * 60) / dureePeriode);

        switch (mode) {
            case 'heures':
                return `${heures.toFixed(1)}h`;

            case 'les-deux':
                return `${periodes} pér. (${heures.toFixed(1)}h)`;

            case 'periodes':
            default:
                return `${periodes} période${periodes > 1 ? 's' : ''}`;
        }
    }

    // =========================================================================
    // 🆕 BETA 96.1 : ANIMATION DES POINTS DU TABLEAU DE BORD
    // =========================================================================

    /**
     * Active ou désactive l'animation des points dans les barres du tableau de bord
     * @param {boolean} activer - true pour activer, false pour désactiver
     */
    function appliquerAnimationPoints(activer) {
        if (activer) {
            document.body.classList.remove('animation-points-desactivee');
        } else {
            document.body.classList.add('animation-points-desactivee');
        }
        console.log('[preferences-v2] Animation des points:', activer ? 'activée' : 'désactivée');
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserPreferencesV2 = initialiserPreferencesV2;
    window.sauvegarderPreferencesV2 = sauvegarderPreferencesV2;
    window.sauvegarderSeuilsV2 = sauvegarderSeuilsV2;
    window.restaurerSeuilsInterpretationDefautV2 = restaurerSeuilsInterpretationDefautV2;
    window.restaurerSeuilsDetectionDefautV2 = restaurerSeuilsDetectionDefautV2;
    window.sauvegarderToutesPreferencesV2 = sauvegarderToutesPreferencesV2;
    window.mettreAJourAffichageSeuilV2 = mettreAJourAffichageSeuilV2;
    // 🆕 BETA 95.1 : Fonctions de formatage selon l'unité
    window.obtenirUniteAffichageAssiduite = obtenirUniteAffichageAssiduite;
    window.formaterAssiduiteAvecUnite = formaterAssiduiteAvecUnite;
    window.formaterTotalPresence = formaterTotalPresence;
    // 🆕 BETA 96.1 : Animation des points
    window.appliquerAnimationPoints = appliquerAnimationPoints;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof db !== 'undefined' && db.isReady) {
                initialiserPreferencesV2();
            } else {
                document.addEventListener('db-ready', initialiserPreferencesV2);
            }
        });
    } else {
        if (typeof db !== 'undefined' && db.isReady) {
            initialiserPreferencesV2();
        } else {
            document.addEventListener('db-ready', initialiserPreferencesV2);
        }
    }

    console.log('[preferences-v2] Module chargé');

})();
