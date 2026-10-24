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

        // #1149, lot 3a : les chaînes d'étapes (la case, puis l'affichage).
        chargerChainesEtapes();

        // Chrono évaluation
        const chronoEval = document.getElementById('v2-pref-chrono-eval');
        if (chronoEval) {
            chronoEval.checked = obtenirPreference('chronoEvaluation') === true;
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
        let grilleRefId = obtenirPreference('grilleReferenceDepistage');
        // #829 (9 oct. 2026) — EN DÉMO, le sélecteur montre la grille avec laquelle le profil
        // calcule (résolue à la lecture, #749), pas « introuvable dans ce trimestre » : la
        // préférence porte l'id d'une grille du trimestre réel, absente du pack.
        if (_estEnDemo() && typeof diagnostiquerGrilleReferenceDepistage === 'function') {
            const resolue = diagnostiquerGrilleReferenceDepistage().grille;
            if (resolue && resolue.id) grilleRefId = resolue.id;
        }
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

        // Fenêtre d'analyse des patterns.
        // #823 (10 sept. 2026) — LE CHAMP LISAIT UNE PRÉFÉRENCE QUE PERSONNE NE
        // LISAIT. Il écrivait `fenetrePatterns` ; les douze calculs de patterns
        // lisent `seuilsInterpretation.nombreProductionsAnalyse` par
        // `obtenirNombreProductionsPourPatterns`, une clé que rien n'écrivait :
        // la fenêtre valait 3 quoi qu'on tape. Même défaut de branchement que
        // les trois curseurs de #818. Le champ lit et écrit désormais la clé
        // des calculs ; la préférence est retirée, pas migrée — sa valeur n'a
        // jamais eu d'effet, la récupérer changerait des profils sans que
        // personne l'ait demandé (décision Cowork, confirmée par Grégoire).
        const fenetreAnalyse = document.getElementById('v2-pref-fenetre-patterns');
        if (fenetreAnalyse) {
            fenetreAnalyse.value = obtenirSeuil('nombreProductionsAnalyse');
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

        // Seuils de détection — forme du 11 sept. 2026 : trois CHAMPS chiffrés
        // en POINTS (10, 5, 70), là où les calculs lisent des FRACTIONS (0,10,
        // 0,05, 0,70). La conversion se fait ici à la lecture et dans
        // `sauvegarderSeuilsV2` à l'écriture — jamais ailleurs. Un champ qui
        // afficherait « 10 » et l'écrirait tel quel poserait 10 là où le calcul
        // attend 0,10 : flèches et défis faux pour tout le monde.
        const seuilProgression = document.getElementById('v2-seuil-progression');
        if (seuilProgression) {
            seuilProgression.value = _fractionEnPoints(seuils.progressionArtefacts, 0.10);
        }

        const seuilRisque = document.getElementById('v2-seuil-risque');
        if (seuilRisque) {
            seuilRisque.value = _fractionEnPoints(seuils.directionRisque, 0.05);
        }

        const seuilDefi = document.getElementById('v2-seuil-defi');
        if (seuilDefi) {
            seuilDefi.value = _fractionEnPoints(seuils.defiSpecifique, 0.70);
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
        // #829 (9 oct. 2026) — EN DÉMO, RIEN N'EST ÉCRIT. La préférence est globale
        // (`preferencesUtilisateur`) : choisir une grille du pack écrasait le choix RÉEL de
        // l'enseignant (classe #806). La démo résout sa grille à la lecture (#749).
        if (_estEnDemo()) return;
        // Lot E3 : rend le résultat de l'écriture (undefined quand rien n'est écrit).

        const choisie = select.value || '';
        if (choisie) {
            return definirPreference('grilleReferenceDepistage', choisie);
        }

        const actuelle = obtenirPreference('grilleReferenceDepistage') || '';
        if (!actuelle) return;  // rien à perdre

        const offerte = Array.from(select.options || []).some(o => o.value === actuelle);
        if (offerte) {
            return definirPreference('grilleReferenceDepistage', '');
        } else {
            console.warn('[preferences-v2] Sélecteur de grille désynchronisé — la préférence "'
                + actuelle + '" est CONSERVÉE plutôt qu\'effacée (#806)');
        }
    }

    function _estEnDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    // Lot E3 (D0 point 2) : les gestes nommés par le témoin commun.
    const GESTE_PREFERENCES = 'Préférences';
    const GESTE_SEUILS = 'Seuils';

    /**
     * Sauvegarde les préférences via l'API.
     * Lot E3 (D3, D0) : appelée à chaque changement (le bouton « Enregistrer » est parti) ; le témoin
     * commun dit « Enregistré », ou « Non enregistré – Préférences : … » si une écriture a échoué.
     * `definirPreference` écrit ; `ecrireEtAnnoncer` fait parler le témoin après (patron du lot E2).
     * @returns {Promise<boolean>}
     */
    async function sauvegarderPreferencesV2() {
        const resultats = [];
        const definir = (cle, valeur) => { resultats.push(definirPreference(cle, valeur) !== false); };
        // SSOT Lot 0 : l'écriture des toggles afficherSommatif/afficherAlternatif
        // est retirée — plus aucun lecteur ne les honorait depuis Session C (#303),
        // l'affichage dérive de la pratique active (determinerModeAffichageTableauBord).

        // Préférences utilisateur : via l'API centralisée
        definir('activerRai', document.getElementById('v2-pref-rai')?.checked !== false);
        definir('afficherDescriptionsSOLO', document.getElementById('v2-pref-solo')?.checked !== false);
        definir('activerActionsRLO', document.getElementById('v2-pref-actions-rlo')?.checked === true);
        // ⛔ #806 — LE DEUXIÈME CHEMIN QUI EFFAÇAIT LE CHOIX DE GRÉGOIRE.
        // `sauvegarderPreferencesV2` écrit TOUT le panneau à chaque `change` de
        // N'IMPORTE LEQUEL de ses contrôles. Le `|| ''` transformait donc un
        // sélecteur mal synchronisé — dropdown pas encore peuplé, ou grille
        // désignée absente de la liste du trimestre — en un effacement de la
        // préférence, au premier clic sur une case voisine.
        // ⮕ On n'écrit '' que si c'est un GESTE : le dropdown propose bien la
        // grille actuellement désignée, et l'utilisateur a quand même choisi de
        // la retirer. Sinon on ne touche pas à ce qu'il a réglé.
        resultats.push(_sauvegarderGrilleReferenceSiFiable() !== false);

        definir('depistageAcp', document.getElementById('v2-pref-depistage-acp')?.checked !== false);
        definir('afficherGraphiques', document.getElementById('v2-pref-graphiques')?.checked !== false);
        // #321 note différée : true seulement si la case est cochée (défaut false)
        definir('noteDifferee', document.getElementById('v2-pref-note-differee')?.checked === true);
        definir('afficherSeuilsVisuels', document.getElementById('v2-pref-seuils-visuels')?.checked !== false);
        definir('afficherDeveloppementHabiletes', document.getElementById('v2-pref-developpement-habiletes')?.checked !== false);

        const animationActive = document.getElementById('v2-pref-animation-points')?.checked !== false;
        definir('animationPoints', animationActive);
        appliquerAnimationPoints(animationActive);

        definir('afficherContexteGraphiques', document.getElementById('v2-pref-contexte-graphiques')?.checked !== false);
        const afficherChaines = document.getElementById('v2-pref-chaines-etapes')?.checked !== false;   // #1149, lot 3a
        definir('afficherChainesEtapes', afficherChaines);
        appliquerChainesEtapes(afficherChaines);
        definir('chronoEvaluation', document.getElementById('v2-pref-chrono-eval')?.checked === true);
        definir('sisDefaut', document.getElementById('v2-pref-sis')?.value || 'lea');

        // Les toggles `activerActionsRLO` (catégorie `action`) et
        // `afficherDescriptionsSOLO` (catégorie `comprehension`) régissent
        // l'affichage de catégories dans la palette de tampons. Rafraîchir la
        // palette si elle est ouverte (no-op si la palette n'est pas rendue — DOM-safe).
        if (typeof travauxOutils !== 'undefined' && travauxOutils.rafraichirPalettesApresPersonnalisation) {
            travauxOutils.rafraichirPalettesApresPersonnalisation();
        }

        const ecrit = resultats.every(Boolean);
        await ecrireEtAnnoncer('preferencesUtilisateur', async () => ecrit, { geste: GESTE_PREFERENCES });
        if (!ecrit && window.temoinEnregistrement) {
            window.temoinEnregistrement.nonEnregistre('le navigateur a refusé l\'écriture.', GESTE_PREFERENCES, 'preferencesUtilisateur');
        }
        return ecrit;
    }

    /**
     * Sauvegarde les seuils d'interprétation — et la fenêtre d'analyse des
     * patterns, qui vit dans le même objet (#823).
     * Écrit directement dans seuilsInterpretation (non migré vers l'API)
     * pour préserver la structure mixte (champs plats + sous-objets idme/risque/interpretation).
     */
    function sauvegarderSeuilsV2() {
        // Lot E3 : la collection lue est COPIÉE avant d'être modifiée (lot E2, R1).
        const seuils = JSON.parse(JSON.stringify(db.getSync('seuilsInterpretation') || {}));

        const fragile = parseInt(document.getElementById('v2-seuil-fragile')?.value) || 70;
        const acceptable = parseInt(document.getElementById('v2-seuil-acceptable')?.value) || 80;
        const bon = parseInt(document.getElementById('v2-seuil-bon')?.value) || 85;

        // Validation : fragile < acceptable < bon.
        // Lot E3 (D0, D3) : le refus parle par le témoin — une alerte PUIS « Préférences enregistrées »
        // disaient le contraire l'une de l'autre (inventaire du 26 sept.). Les trois champs reviennent à
        // ce qui est enregistré ; rien n'est écrit, aucun succès.
        if (fragile >= acceptable || acceptable >= bon) {
            _remettreSeuilsInterpretationEnregistres();
            if (window.temoinEnregistrement) {
                window.temoinEnregistrement.nonEnregistre('les seuils doivent aller du plus bas au plus haut (Fragile < Acceptable < Bon).', GESTE_SEUILS, 'seuilsInterpretation');
            }
            return false;
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

        // Fenêtre d'analyse des patterns — #823 : dans la clé que
        // `obtenirNombreProductionsPourPatterns` lit, et nulle part ailleurs.
        const fenetreAnalyse = document.getElementById('v2-pref-fenetre-patterns');
        if (fenetreAnalyse) {
            seuils.nombreProductionsAnalyse = parseInt(fenetreAnalyse.value) || 3;
        }

        // Seuils de détection — les champs sont en POINTS, la clé en FRACTION
        // (voir le chargement). Une valeur vide ou absurde retombe sur le défaut.
        const seuilProgression = document.getElementById('v2-seuil-progression');
        if (seuilProgression) {
            seuils.progressionArtefacts = _pointsEnFraction(seuilProgression.value, 0.10);
        }

        const seuilRisque = document.getElementById('v2-seuil-risque');
        if (seuilRisque) {
            seuils.directionRisque = _pointsEnFraction(seuilRisque.value, 0.05);
        }

        const seuilDefi = document.getElementById('v2-seuil-defi');
        if (seuilDefi) {
            seuils.defiSpecifique = _pointsEnFraction(seuilDefi.value, 0.70);
        }

        // Lot E3 (D0 point 2) : par le témoin commun (clé globale, inscrite à CLES_GLOBALES).
        return sauvegarderDonneesSelonMode('seuilsInterpretation', seuils, { geste: GESTE_SEUILS });
    }

    /** Lot E3 : les trois seuils d'interprétation reprennent ce qui est enregistré (le chargement le fait pareil). */
    function _remettreSeuilsInterpretationEnregistres() {
        const poser = (id, chemin) => {
            const champ = document.getElementById(id);
            if (champ) champ.value = Math.round(obtenirSeuil(chemin) * 100);
        };
        poser('v2-seuil-fragile', 'interpretation.acceptable');
        poser('v2-seuil-acceptable', 'interpretation.bon');
        poser('v2-seuil-bon', 'interpretation.excellent');
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

        // Lot E3 : le message du geste ne suit qu'une écriture réussie.
        if (sauvegarderSeuilsV2()) notifications.succes('Seuils d\'interprétation restaurés');
    }

    /**
     * Restaure les seuils de détection avancés par défaut
     */
    function restaurerSeuilsDetectionDefautV2() {
        const fenetreAnalyse = document.getElementById('v2-pref-fenetre-patterns');
        const seuilProgression = document.getElementById('v2-seuil-progression');
        const seuilRisque = document.getElementById('v2-seuil-risque');
        const seuilDefi = document.getElementById('v2-seuil-defi');

        if (fenetreAnalyse) fenetreAnalyse.value = 3;

        // En points, comme les champs (10 · 5 · 70) ; la fraction est posée à l'écriture.
        if (seuilProgression) seuilProgression.value = 10;
        if (seuilRisque) seuilRisque.value = 5;
        if (seuilDefi) seuilDefi.value = 70;

        // #823 : la fenêtre y passe aussi. Lot E3 : le message ne suit qu'une écriture réussie.
        if (sauvegarderSeuilsV2()) notifications.succes('Seuils de détection restaurés');
    }

    /**
     * Fraction stockée (0,10) → points affichés (10). Repli sur le défaut quand la
     * clé est absente ou illisible. Point unique de conversion à la lecture.
     */
    function _fractionEnPoints(fraction, defaut) {
        const f = parseFloat(fraction);
        return Math.round((f > 0 ? f : defaut) * 100);
    }

    /**
     * Points tapés (« 10 ») → fraction stockée (0,10). Point unique de conversion
     * à l'écriture. Arrondi à deux décimales : 7 / 100 rend 0.07, pas 0.07000000000000001.
     */
    function _pointsEnFraction(points, defaut) {
        const p = parseInt(points, 10);
        return p > 0 ? Math.round(p) / 100 : defaut;
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================

    // =========================================================================
    // #1149, LOT 3a (24 oct. 2026) : LES CHAÎNES D'ÉTAPES
    // =========================================================================

    /**
     * La case suit la préférence AVANT toute écriture (#806 : `sauvegarderPreferencesV2` écrit tout le
     * panneau à chaque changement), puis les chaînes s'affichent ou non. Préférence absente : true.
     */
    function chargerChainesEtapes() {
        const afficher = obtenirPreference('afficherChainesEtapes') !== false;
        const caseChaines = document.getElementById('v2-pref-chaines-etapes');
        if (caseChaines) caseChaines.checked = afficher;
        appliquerChainesEtapes(afficher);
    }

    function appliquerChainesEtapes(afficher) {
        if (typeof ChaineEtapes !== 'undefined') ChaineEtapes.afficherToutes(afficher);
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
