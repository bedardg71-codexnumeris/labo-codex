/**
 * preferences-v2.js
 * Module de gestion de l'onglet Préférences (Beta 95, refactoré Beta 99.16)
 *
 * Gère l'UI des préférences (checkboxes, sliders, dropdowns) :
 * - Outils à exploiter (A-C-P, patterns, RàI, mode comparatif)
 * - Affichage des ressources (SOLO, snapshots, graphiques, détails)
 * - Configuration du dépistage (grille de référence)
 * - Seuils d'interprétation (fragile, acceptable, bon)
 *
 * Source de vérité : API preferences.js (obtenirPreference / definirPreference).
 * Ce module n'écrit JAMAIS dans modalitesEvaluation (SSOT Lot 0).
 */

(function() {
    'use strict';


    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Préférences v2
     */
    function initialiserPreferencesV2() {

        // Charger le dropdown des grilles
        chargerDropdownGrillesPreferencesV2();

        // Charger les valeurs depuis le storage
        chargerPreferencesDepuisStorage();

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
            grilles = db.getSync(cle('grillesTemplates')) || [];
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
     * Charge les préférences depuis le storage via l'API centralisée.
     */
    function chargerPreferencesDepuisStorage() {
        // Outils à exploiter
        const depistageAcp = document.getElementById('v2-pref-depistage-acp');
        if (depistageAcp) {
            depistageAcp.checked = obtenirPreference('depistageAcp') !== false;
        }

        const rai = document.getElementById('v2-pref-rai');
        if (rai) {
            rai.checked = obtenirPreference('activerRai') !== false;
        }

        // Session C (#303) : mode comparatif SOM/PAN retiré (plus de checkbox).

        // Affichage des ressources
        const solo = document.getElementById('v2-pref-solo');
        if (solo) {
            solo.checked = obtenirPreference('afficherDescriptionsSOLO') !== false;
        }

        const actionsRlo = document.getElementById('v2-pref-actions-rlo');
        if (actionsRlo) {
            actionsRlo.checked = obtenirPreference('activerActionsRLO') === true;
        }

        const graphiques = document.getElementById('v2-pref-graphiques');
        if (graphiques) {
            graphiques.checked = obtenirPreference('afficherGraphiques') !== false;
        }

        // #321 note différée (défaut false = case décochée)
        const noteDifferee = document.getElementById('v2-pref-note-differee');
        if (noteDifferee) {
            noteDifferee.checked = obtenirPreference('noteDifferee') === true;
        }

        const seuilsVisuels = document.getElementById('v2-pref-seuils-visuels');
        if (seuilsVisuels) {
            seuilsVisuels.checked = obtenirPreference('afficherSeuilsVisuels') !== false;
        }

        const developpementHabiletes = document.getElementById('v2-pref-developpement-habiletes');
        if (developpementHabiletes) {
            developpementHabiletes.checked = obtenirPreference('afficherDeveloppementHabiletes') !== false;
        }

        // 🆕 BETA 96.1 : Animation des points du tableau de bord
        const animationPoints = document.getElementById('v2-pref-animation-points');
        const animationActive = obtenirPreference('animationPoints') !== false;
        if (animationPoints) {
            animationPoints.checked = animationActive;
        }
        // Appliquer immédiatement l'état de l'animation
        appliquerAnimationPoints(animationActive);

        // Métadonnées contextuelles (graphiques)
        const contexteGraphiques = document.getElementById('v2-pref-contexte-graphiques');
        if (contexteGraphiques) {
            contexteGraphiques.checked = obtenirPreference('afficherContexteGraphiques') !== false;
        }

        // Chrono évaluation
        const chronoEval = document.getElementById('v2-pref-chrono-eval');
        if (chronoEval) {
            chronoEval.checked = obtenirPreference('chronoEvaluation') === true;
        }

        // 🆕 BETA 95.1 : Unité d'affichage de l'assiduité (périodes/heures)
        const uniteAffichage = document.getElementById('v2-pref-unite-affichage');
        if (uniteAffichage) {
            uniteAffichage.value = obtenirPreference('uniteAffichageAssiduite') || 'periodes';
        }

        // SIS par défaut
        const sisSelect = document.getElementById('v2-pref-sis');
        if (sisSelect) {
            sisSelect.value = obtenirPreference('sisDefaut') || 'lea';
        }

        // Grille de référence
        //
        // ⚠ #806 — L'ÉCRAN NE DOIT PAS MENTIR. `select.value = id` échoue en
        // silence quand aucune option ne porte cet id : le sélecteur retombe sur
        // « — Sélectionner une grille — », et Grégoire lit « je n'ai rien choisi »
        // alors qu'il a bien choisi et que sa préférence est intacte. C'est ce qui
        // le faisait re-sélectionner sa grille « régulièrement ».
        //
        // ⮕ On rend visible ce qui est réellement enregistré, en nommant la cause
        // dans l'option elle-même. Effet de bord voulu : le sélecteur redevient
        // synchronisé, donc `_sauvegarderGrilleReferenceSiFiable` réécrira cette
        // même valeur au lieu de s'abstenir — jamais un `''`.
        const grilleReference = document.getElementById('v2-pref-grille-reference');
        const grilleRefId = obtenirPreference('grilleReferenceDepistage');
        if (grilleReference && grilleRefId) {
            const offerte = Array.from(grilleReference.options || []).some(o => o.value === grilleRefId);
            if (!offerte) {
                const fantome = document.createElement('option');
                fantome.value = grilleRefId;
                fantome.textContent = 'Grille enregistrée, introuvable dans ce trimestre';
                fantome.dataset.grilleIntrouvable = 'true';
                grilleReference.appendChild(fantome);
            }
            grilleReference.value = grilleRefId;
        }

        // Découpler Performance et Risque
        const decouplerPN = document.getElementById('v2-pref-decoupler-pn');
        if (decouplerPN) {
            decouplerPN.checked = obtenirPreference('decouplerPN') === true;
        }

        // Fenêtre d'analyse des patterns
        const fenetrePatterns = document.getElementById('v2-pref-fenetre-patterns');
        if (fenetrePatterns) {
            fenetrePatterns.value = obtenirPreference('fenetrePatterns') || 3;
        }

        // Seuils d'interprétation — lus directement depuis seuilsInterpretation
        // (objet à structure mixte non migré vers l'API, voir preferences.js)
        const seuils = db.getSync('seuilsInterpretation') || {};

        // #818 suite — les trois curseurs lisent LA branche que les
        // consommateurs lisent, via l'accesseur de la SSOT. Ils lisaient des
        // clés plates que personne d'autre ne regardait : le panneau se
        // relisait lui-même. Pas de repli local ici — `obtenirSeuil` rend
        // toujours une valeur, et un second repli serait une seconde
        // convention (c'est la leçon de #555).
        // ⚠ La table de correspondance nomme la même borne par l'autre côté :
        // « Fragile 70 » (sous 70 c'est fragile) = `acceptable: 0.70`.
        const seuilFragile = document.getElementById('v2-seuil-fragile');
        if (seuilFragile) {
            seuilFragile.value = Math.round(obtenirSeuil('interpretation.acceptable') * 100);
        }

        const seuilAcceptable = document.getElementById('v2-seuil-acceptable');
        if (seuilAcceptable) {
            seuilAcceptable.value = Math.round(obtenirSeuil('interpretation.bon') * 100);
        }

        const seuilBon = document.getElementById('v2-seuil-bon');
        if (seuilBon) {
            seuilBon.value = Math.round(obtenirSeuil('interpretation.excellent') * 100);
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
     * Écrit `grilleReferenceDepistage` — mais SEULEMENT quand le sélecteur est en
     * état de représenter le choix de l'utilisateur (#806).
     *
     * ⚠ LE PIÈGE QU'ELLE FERME : un `<select>` dont l'option n'existe pas rend
     * `''`. Silencieusement. Il n'y a AUCUNE différence, à la lecture de `.value`,
     * entre « l'utilisateur a choisi de ne plus rien désigner » et « le dropdown
     * n'a pas encore été peuplé ». Le premier est un geste, le second un accident,
     * et les traiter pareil coûtait son réglage à Grégoire à répétition.
     *
     * ⮕ Le départage se fait sur les OPTIONS, pas sur la valeur : si la grille
     * actuellement désignée figure dans la liste offerte, alors le sélecteur est
     * synchronisé et son `''` est un vrai retrait. Sinon, on s'abstient.
     */
    function _sauvegarderGrilleReferenceSiFiable() {
        const select = document.getElementById('v2-pref-grille-reference');
        if (!select) return;

        const choisie = select.value || '';
        if (choisie) {
            definirPreference('grilleReferenceDepistage', choisie);
            return;
        }

        const actuelle = obtenirPreference('grilleReferenceDepistage') || '';
        if (!actuelle) return;  // rien à perdre

        const offerte = Array.from(select.options || []).some(o => o.value === actuelle);
        if (offerte) {
            definirPreference('grilleReferenceDepistage', '');
        } else {
            console.warn('[preferences-v2] Sélecteur de grille désynchronisé — la préférence "'
                + actuelle + '" est CONSERVÉE plutôt qu\'effacée (#806)');
        }
    }

    /**
     * Sauvegarde les préférences via l'API.
     */
    function sauvegarderPreferencesV2() {
        // SSOT Lot 0 : l'écriture des toggles afficherSommatif/afficherAlternatif
        // est retirée — plus aucun lecteur ne les honorait depuis Session C (#303),
        // l'affichage dérive de la pratique active (determinerModeAffichageTableauBord).

        // Préférences utilisateur : via l'API centralisée
        definirPreference('activerRai', document.getElementById('v2-pref-rai')?.checked !== false);
        definirPreference('afficherDescriptionsSOLO', document.getElementById('v2-pref-solo')?.checked !== false);
        definirPreference('activerActionsRLO', document.getElementById('v2-pref-actions-rlo')?.checked === true);
        // ⛔ #806 — LE DEUXIÈME CHEMIN QUI EFFAÇAIT LE CHOIX DE GRÉGOIRE.
        // `sauvegarderPreferencesV2` écrit TOUT le panneau à chaque `change` de
        // N'IMPORTE LEQUEL de ses contrôles. Le `|| ''` transformait donc un
        // sélecteur mal synchronisé — dropdown pas encore peuplé, ou grille
        // désignée absente de la liste du trimestre — en un effacement de la
        // préférence, au premier clic sur une case voisine.
        // ⮕ On n'écrit '' que si c'est un GESTE : le dropdown propose bien la
        // grille actuellement désignée, et l'utilisateur a quand même choisi de
        // la retirer. Sinon on ne touche pas à ce qu'il a réglé.
        _sauvegarderGrilleReferenceSiFiable();
        definirPreference('decouplerPN', document.getElementById('v2-pref-decoupler-pn')?.checked === true);
        definirPreference('fenetrePatterns', parseInt(document.getElementById('v2-pref-fenetre-patterns')?.value) || 3);

        definirPreference('depistageAcp', document.getElementById('v2-pref-depistage-acp')?.checked !== false);
        definirPreference('afficherGraphiques', document.getElementById('v2-pref-graphiques')?.checked !== false);
        // #321 note différée : true seulement si la case est cochée (défaut false)
        definirPreference('noteDifferee', document.getElementById('v2-pref-note-differee')?.checked === true);
        definirPreference('afficherSeuilsVisuels', document.getElementById('v2-pref-seuils-visuels')?.checked !== false);
        definirPreference('afficherDeveloppementHabiletes', document.getElementById('v2-pref-developpement-habiletes')?.checked !== false);
        definirPreference('uniteAffichageAssiduite', document.getElementById('v2-pref-unite-affichage')?.value || 'periodes');

        const animationActive = document.getElementById('v2-pref-animation-points')?.checked !== false;
        definirPreference('animationPoints', animationActive);
        appliquerAnimationPoints(animationActive);

        definirPreference('afficherContexteGraphiques', document.getElementById('v2-pref-contexte-graphiques')?.checked !== false);
        definirPreference('chronoEvaluation', document.getElementById('v2-pref-chrono-eval')?.checked === true);
        definirPreference('sisDefaut', document.getElementById('v2-pref-sis')?.value || 'lea');

        // Les toggles `activerActionsRLO` (catégorie `action`) et
        // `afficherDescriptionsSOLO` (catégorie `comprehension`) régissent
        // l'affichage de catégories dans la palette de tampons. Rafraîchir la
        // palette si elle est ouverte (no-op si la palette n'est pas rendue — DOM-safe).
        if (typeof travauxOutils !== 'undefined' && travauxOutils.rafraichirPalettesApresPersonnalisation) {
            travauxOutils.rafraichirPalettesApresPersonnalisation();
        }
    }

    /**
     * Sauvegarde les seuils d'interprétation.
     * Écrit directement dans seuilsInterpretation (non migré vers l'API)
     * pour préserver la structure mixte (champs plats + sous-objets idme/risque/interpretation).
     */
    function sauvegarderSeuilsV2() {
        const seuils = db.getSync('seuilsInterpretation') || {};

        const fragile = parseInt(document.getElementById('v2-seuil-fragile')?.value) || 70;
        const acceptable = parseInt(document.getElementById('v2-seuil-acceptable')?.value) || 80;
        const bon = parseInt(document.getElementById('v2-seuil-bon')?.value) || 85;

        // Validation : fragile < acceptable < bon
        if (fragile >= acceptable || acceptable >= bon) {
            alert('Erreur : Les seuils doivent être ordonnés (Fragile < Acceptable < Bon)');
            return;
        }

        // #818 suite — ÉCRIRE DANS LA BRANCHE QUE LES CONSOMMATEURS LISENT.
        // Ces trois lignes posaient `fragile`/`acceptable`/`bon` à la racine :
        // aucun calcul ne les lisait, et `fusionnerAvecDefauts` les faisait
        // disparaître de l'objet rendu, puisqu'elles n'existent pas au modèle.
        if (!seuils.interpretation || typeof seuils.interpretation !== 'object') {
            seuils.interpretation = {};
        }
        seuils.interpretation.acceptable = fragile / 100;
        seuils.interpretation.bon = acceptable / 100;
        seuils.interpretation.excellent = bon / 100;
        // Les clés plates ne doivent pas survivre à côté : deux vérités pour un
        // même réglage, c'est le défaut qu'on retire, pas celui qu'on déplace.
        delete seuils.fragile;
        delete seuils.acceptable;
        delete seuils.bon;

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
        notifications.succes('Seuils d\'interprétation restaurés');
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
        sauvegarderPreferencesV2(); // Pour sauvegarder fenetrePatterns
        notifications.succes('Seuils de détection restaurés');
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
        notifications.succes('Préférences enregistrées');
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================

    // =========================================================================
    // 🆕 BETA 95.1 : FORMATAGE DE L'ASSIDUITÉ SELON PRÉFÉRENCE
    // =========================================================================

    /**
     * Obtient la préférence d'unité d'affichage
     * @returns {string} - 'periodes' | 'heures' | 'les-deux'
     */
    function obtenirUniteAffichageAssiduite() {
        return obtenirPreference('uniteAffichageAssiduite') || 'periodes';
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
        const dureePeriode = typeof window.obtenirDureePeriode === 'function' ? window.obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);
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

    // Beta 99.30 : db-ready est dispatché sur window (db.js), pas sur document.
    // Et le flag global est window.dbReady (pas db.isReady). Sans ce fix,
    // initialiserPreferencesV2 n'était jamais appelée au démarrage et la pref
    // animationPoints=false n'était pas appliquée jusqu'à l'ouverture du panneau.
    // #414 (8 août 2026) : site déjà correct, passé au portillon commun sans
    // changement de sémantique. Le commentaire ci-dessus a d'ailleurs documenté
    // dès la Beta 99.30 les DEUX pièges que l'audit a retrouvés ailleurs
    // (cible `document`, drapeau `db.isReady`) — mais dans un commentaire local,
    // que ni `preferences.js` ni `donnees-v2.js` n'ont jamais lu. Un portillon
    // partagé porte la connaissance là où elle s'applique.
    function _initSiPret() {
        window.auDbPret(initialiserPreferencesV2);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initSiPret);
    } else {
        _initSiPret();
    }


})();
