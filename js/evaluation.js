/* ===============================
   MODULE EVALUATION: ÉVALUATIONS ET RÉTROACTIONS
   Index: 50 10-10-2025a → Modularisation
   Version: 2025122905 (29 déc 2025 - Fix anonymisation)

   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'évaluation des productions étudiantes
   et la génération automatique de rétroactions.
   
   Contenu de ce module:
   - Sélection étudiant/production/grille/échelle/cartouche
   - Évaluation par critères avec niveaux
   - Génération automatique de rétroaction
   - Calcul de la note finale
   - Sauvegarde des évaluations
   - Navigation vers la liste des évaluations
   =============================== */

// PATTERN LECTURE ÉVALUATIONS :
// - obtenirDonneesSelonMode() → lectures read-only (affichage, stats) — filtré par coursId
// - db.getSync(cle()) → lectures read-modify-write (modification, suppression) — toutes les évals
// - sauvegarderDonneesSelonMode() → toutes les écritures

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, evaluationEnCours
   - 02-navigation.js : Pour navigation vers liste
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #selectGroupeEval : Select pour filtrer par groupe
   - #selectEtudiantEval : Select pour choisir l'étudiant
   - #selectProduction1 : Select pour choisir la production
   - #selectGrille1 : Select pour choisir la grille
   - #selectEchelle1 : Select pour choisir l'échelle
   - #selectCartoucheEval : Select pour choisir la cartouche
   - #remiseProduction1 : Select pour le statut de remise
   - #listeCriteresGrille1 : Conteneur des critères
   - #noteProduction1 : Affichage de la note
   - #niveauProduction1 : Affichage du niveau
   - #retroactionFinale1 : Textarea de la rétroaction
   - #afficherDescription1, #afficherObjectif1, etc. : Checkboxes options
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'productions' : Array des productions (nom historique)
   - 'grillesTemplates' : Array des grilles de critères
   - 'niveauxEchelle' : Array des niveaux de performance
   - 'cartouches_{grilleId}' : Array des cartouches par grille
   - 'evaluationsSauvegardees' : Array des évaluations complètes
   =============================== */

/**
 * Change l'échelle d'évaluation
 */
function changerEchelleEvaluation(num) {
    const selectEchelle = document.getElementById('selectEchelle1');
    const echelleId = selectEchelle.value;
    // #941 lot S1 — un choix fait au menu n'est plus celui de l'application (`_retirerEchelleDOffice`).
    delete selectEchelle.dataset.choixAuto;

    if (evaluationEnCours) {
        evaluationEnCours.echelleId = echelleId;
        // Recalculer la note et regénérer la rétroaction avec la nouvelle échelle
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
        window.calculerNote();
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
    }
}

/**
 * Coche toutes les options par défaut
 */
function cocherOptionsParDefaut() {
    const options = ['Description', 'Objectif', 'Tache', 'Adresse', 'Contexte'];
    options.forEach(option => {
        const checkbox = document.getElementById(`afficher${option}1`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Initialiser affichageNote depuis la pratique active du groupe-cours
    try {
        // Lot N1b (21 sept. 2026) : l'entrée de bibliothèque que rend LA désignation (id brut, puis
        // normalisé — un ancien pointeur « pan-standards » y mène), jamais « la première du même type ».
        var pratiqueActive = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive().donnees : null;
        if (pratiqueActive?.affichageNote === 'lettre') {
            document.getElementById('affichageNoteLettre1').checked = true;
        } else {
            document.getElementById('affichageNoteComplet1').checked = true;
        }
    } catch(e) {
        const radioComplet = document.getElementById('affichageNoteComplet1');
        if (radioComplet) radioComplet.checked = true;
    }
}

/**
 * Prépare une nouvelle évaluation (réinitialise le formulaire ET les sélections mémorisées)
 */
function nouvelleEvaluation() {
    // Réinitialiser tous les selects
    document.getElementById('selectGroupeEval').value = '';
    document.getElementById('selectEtudiantEval').value = '';
    document.getElementById('selectProduction1').value = '';
    document.getElementById('selectGrille1').value = '';
    document.getElementById('selectEchelle1').value = '';
    document.getElementById('selectCartoucheEval').value = '';
    document.getElementById('remiseProduction1').value = 'non-recu';
    window.mettreAJourPillStatut('non-recu');
    window.ecrireAttenteCriteres(window.MESSAGE_ATTENTE_CRITERES);
    document.getElementById('retroactionFinale1').value = '';
    if (typeof window.poserRetroactionReecrite === 'function') window.poserRetroactionReecrite(false);   // #961
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Masquer les badges de jetons et boutons de jetons
    const section = document.getElementById('gestionJetonsEvaluation');
    const boutonDelai = document.getElementById('boutonJetonDelai');
    const boutonReprise = document.getElementById('boutonJetonReprise');
    if (section) section.classList.add('u-hide');
    if (boutonDelai) boutonDelai.classList.add('u-hide');
    if (boutonReprise) boutonReprise.classList.add('u-hide');

    cocherOptionsParDefaut();

    // Annuler tout auto-save en attente (race condition) — Patch §5.6 fix #109 (étape 4)
    if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }

    // 🔄 Réinitialiser evaluationEnCours à un objet vide (pas null) pour permettre l'affichage des jetons
    window.evaluationEnCours = {
        criteres: {}
    };
    filtrerEtudiantsParGroupe();

    // 🔄 Effacer les sélections mémorisées du mode évaluation en série
    db.removeSync('dernieresSelectionsEvaluation');

    // Masquer l'indicateur de modification
    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.classList.add('u-hide');

    // Masquer le bouton de verrouillage et réactiver le formulaire
    afficherOuMasquerBoutonVerrouillage(false);
    desactiverFormulaireEvaluation(false);

    // Afficher les options de jetons pour nouvelle évaluation
    window.afficherGestionJetons(true);

    // Masquer le bouton Éditer (sera réaffiché au prochain chargement d'évaluation)
    var btnEditer = document.getElementById('btnEditerFichierEval');
    if (btnEditer) btnEditer.classList.add('u-hide');

    notifications.succes('Paramètres réinitialisés - Prêt pour une nouvelle série d\'évaluations');
}

/**
 * Réinitialise uniquement le formulaire (critères, notes) sans effacer les sélections
 */
function reinitialiserFormulaire() {
    // Réinitialiser uniquement les éléments du formulaire de notation
    window.ecrireAttenteCriteres(window.MESSAGE_ATTENTE_CRITERES);
    document.getElementById('retroactionFinale1').value = '';
    if (typeof window.poserRetroactionReecrite === 'function') window.poserRetroactionReecrite(false);   // #961
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Réinitialiser les checkboxes jetons
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    const checkboxReprise = document.getElementById('checkboxJetonReprise');
    if (checkboxDelai) checkboxDelai.checked = false;
    if (checkboxReprise) checkboxReprise.checked = false;

    // Réinitialiser la rétroaction finale
    const retroactionFinale = document.getElementById('retroactionFinale1');
    if (retroactionFinale) retroactionFinale.value = '';

    notifications.succes('Formulaire réinitialisé - Les sélections sont conservées');
}

/**
 * Navigation vers la liste des évaluations
 */
function naviguerVersListeEvaluations() {
    afficherSousSection('evaluations-liste');
}

/**
 * « Évaluer » une production d'un élève — LA définition unique (#868, 15 sept. 2026).
 *
 * Appelée par les boutons « Évaluer » du profil (data-action) et par le menu « Actions… »
 * de la liste des évaluations. Il en existait trois, et aucune ne présélectionnait rien,
 * en silence : celle du profil visait deux identifiants inexistants et était écrasée au
 * chargement par celle d'ici, qui remplissait des listes cachées encore vides (elles ne
 * se peuplent qu'à l'ouverture d'une copie) ; la liste avait sa propre copie.
 *
 * - Copie importée, annotée ou non : elle s'ouvre, en mode Évaluer (décision de Grégoire,
 *   15 sept.). `ouvrirFichier` fait lui-même l'arrivée dans Évaluations (#761).
 * - Aucune copie : le formulaire sans copie, élève et production choisis, avec les outils
 *   (Grégoire : « un enseignant pourrait évaluer une copie sans l'importer […] il devrait
 *   pouvoir utiliser les outils »).
 *
 * @param {string} da - DA de l'élève
 * @param {string} productionId - ID de la production à évaluer
 */
function evaluerProduction(da, productionId) {
    const fichier = (typeof travauxResolution !== 'undefined')
        ? travauxResolution.trouverFichierPourEvaluation({ etudiantDA: da, productionId: productionId })
        : null;

    if (fichier && typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
        if (productionId) sessionStorage.setItem('travaux-filtre-production', productionId);
        // Consommé par `ouvrirFichier` une fois la copie chargée — le protocole de « Consulter ».
        window._apresOuvertureFichier = function() { travauxUI.basculerMode('evaluer'); };
        travauxUI.ouvrirFichier(fichier.id);
        return;
    }
    _evaluerSansCopie(da, productionId);
}

/**
 * Le formulaire sans copie, élève et production présélectionnés (#868). Réutilise le
 * chemin autonome de `modifierEvaluation` : mêmes panneaux, mêmes listes, mêmes outils.
 */
function _evaluerSansCopie(da, productionId) {
    // Une copie ouverte en mode Évaluer tient les panneaux dans ses palettes : les rendre au formulaire.
    if (document.getElementById('travaux-palette-eval-gauche')
        && typeof travauxUI !== 'undefined' && typeof travauxUI.fermerModeEvaluation === 'function') {
        travauxUI.fermerModeEvaluation();
    }
    // Même drapeau que `modifierEvaluation` : `afficherFichiers`, relancé par l'arrivée sur
    // la sous-section, ne masque pas le formulaire qu'on s'apprête à montrer.
    window._modifierEvaluationEnCours = true;
    // Et l'arrivée ne rouvre aucune copie : ni celle encore dans la visionneuse (drapeau lu par
    // `initialiserModuleTravaux`), ni la dernière de la session (clé lue à la restauration).
    window._evaluerSansCopieEnCours = true;
    sessionStorage.removeItem('travaux-dernier-fichier');
    afficherSection('evaluations');
    afficherSousSection('evaluations-annoter');

    setTimeout(async () => {
        try {
            _setupAffichagePanneauxModif(false);
            // Sans copie, le travail est « Reçu » — remis, non importé (Grégoire, 15 sept.) — et les
            // critères s'ouvrent ; « Non reçu », le défaut du formulaire, les verrouillait. Posé AVANT
            // l'élève et la production : leur chargement lit ce statut. Une évaluation déjà
            // enregistrée pose ensuite le sien (`verifierEtChargerEvaluationExistante`).
            const selectRemise = document.getElementById('remiseProduction1');
            if (selectRemise) {
                selectRemise.value = 'recu';
                if (typeof window.mettreAJourPillStatut === 'function') window.mettreAJourPillStatut('recu');
            }
            // Sans copie, rien n'a peuplé la liste des élèves : seule l'ouverture d'une copie le fait.
            if (typeof chargerListeEtudiantsEval === 'function') chargerListeEtudiantsEval();
            const etudiant = (obtenirDonneesSelonMode('groupeEtudiants') || []).find(e => e.da === da);
            await _chargerSelectsStandalone(
                { etudiantDA: da, productionId: productionId },
                _attendreOptionSelect,
                () => (etudiant && etudiant.groupe) || null
            );
            mettreAJourNavigationSansCopie();   // #920
        } catch (erreur) {
            console.error('[Évaluer sans copie]', erreur);
        } finally {
            window._modifierEvaluationEnCours = false;
            window._evaluerSansCopieEnCours = false;
        }
    }, 200);
}


/* ===============================
   REFONTE MODULE EVALUATION: LISTE DES ÉVALUATIONS
   Nouvelles fonctions pour la liste avec calcul des indices
   =============================== */

// === VARIABLES GLOBALES ===
// #575 (28 août 2026) — `donneesEvaluationsFiltrees` est retirée avec la vue
// « accordéon » : elle n'alimentait qu'elle.

/* ===============================
   CALCUL DES INDICES
   =============================== */

// SUPPRIMÉ (Tier 6.2, 3 avril 2026) : calculerEtSauvegarderIndicesEvaluation()
// Écrivait dans cle('indicesEvaluation') avec une structure {DA: {completion, performance}}
// mais la clé n'est lue par aucun module. Les vrais indices C et P sont dans
// cle('indicesCP') (calculés par portfolio.js). Code mort supprimé.


/**
 * Obtient le nom réel d'une cartouche
 */
function obtenirNomCartouche(cartoucheId, grilleId) {
    if (!cartoucheId) return '—';

    // Si pas de grilleId, chercher dans toutes les cartouches
    if (!grilleId) {
        // #389 : keysSync (localStorage ∪ memoryCache) — une banque de cartouches
        // basculée hors localStorage (quota) disparaissait de l'évaluation.
        const cartouchesKeys = db.keysSync().filter(key => key.startsWith('cartouches_'));
        for (let key of cartouchesKeys) {
            const cartouches = db.getSync(key, []);
            const cartouche = cartouches.find(c => c.id === cartoucheId);
            if (cartouche) return cartouche.nom;
        }
        return cartoucheId; // Retourner l'ID si rien trouvé
    }

    // Chercher dans la grille spécifique
    const cartouchesKey = `cartouches_${grilleId}`;
    const cartouches = db.getSync(cle(cartouchesKey), []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : cartoucheId;
}

/**
 * Obtient la classe CSS ou le style pour une note selon l'échelle
 */
function obtenirClasseNote(note, echelleId) {
    // Si pas d'échelle spécifiée, utiliser les classes par défaut
    if (!echelleId) {
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Chercher l'échelle dans localStorage
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        // Fallback sur les classes par défaut si échelle non trouvée
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Trouver le niveau correspondant à la note
    const niveau = echelle.niveaux?.find(n => n.lettre === note || n.nom?.startsWith(note));

    // Si on a une couleur personnalisée, retourner un style inline
    if (niveau && niveau.couleur) {
        // Retourner comme attribut style au lieu de classe
        return `style="background: ${niveau.couleur}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"`;
    }

    // Sinon utiliser les classes par défaut
    const classes = {
        'M': 'note-maitrise',
        'I': 'note-intermediaire',
        'D': 'note-developpement',
        'B': 'note-base',
        'O': 'note-observation'
    };
    return classes[note] || '';
}

/* ===============================
   AFFICHAGE DE LA LISTE
   =============================== */






/* ===============================
   🔍 FILTRAGE
   =============================== */



/**
 * Réinitialise tous les filtres
 * OBSOLETE: Cette fonction est maintenant gérée par liste-evaluations.js
 * Ne pas redéfinir ici pour éviter d'écraser la fonction moderne
 */
// function reinitialiserFiltresEval() {
//     // FONCTION OBSOLÈTE - Voir liste-evaluations.js ligne 377
//     // La fonction moderne reinitialiserFiltres() est exportée comme window.reinitialiserFiltresEval
// }



/* ===============================
   STATISTIQUES
   =============================== */


/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

// ✅ Fonction obtenirNomCartouche() supprimée (doublon incorrect)
// La version correcte est définie ligne 1107



// #575 (28 août 2026) — la vue « accordéon » des évaluations est RETIRÉE, avec
// son initialisation restée en commentaire. La liste des évaluations est rendue
// par `liste-evaluations.js` (tableau), seul module dont le conteneur existe
// dans `index.html`.

/* ===============================
   🔄 MODE ÉVALUATION EN SÉRIE
   Mémorisation et navigation fluide pour évaluer plusieurs étudiants
   =============================== */

/**
 * Mémorise les sélections actuelles pour réutilisation
 * Appelée automatiquement lors des changements de select
 */
function memoriserSelectionsEvaluation() {
    // Ne pas mémoriser pendant le setup (afficherPalettesEval) pour éviter
    // d'écraser les bonnes valeurs avec des selects encore vides
    if (window._bloquerMemorisation) return;

    const selections = {
        production: document.getElementById('selectProduction1')?.value || '',
        grille: document.getElementById('selectGrille1')?.value || '',
        echelle: document.getElementById('selectEchelle1')?.value || '',
        cartouche: document.getElementById('selectCartoucheEval')?.value || '',
        remise: document.getElementById('remiseProduction1')?.value || 'evalue',
        // Options d'affichage
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };

    db.setSync('dernieresSelectionsEvaluation', selections);
}

/**
 * Sauvegarde les sélections actuelles pour les restaurer lors de la navigation
 * Appelée avant de changer d'étudiant (Précédent/Suivant)
 */
function sauvegarderSelectionsEvaluation() {
    const selectProduction = document.getElementById('selectProduction1');
    const selectGrille = document.getElementById('selectGrille1');
    const selectEchelle = document.getElementById('selectEchelle1');
    const selectCartouche = document.getElementById('selectCartoucheEval');
    const selectRemise = document.getElementById('remiseProduction1');

    const selections = {
        production: selectProduction?.value || '',
        grille: selectGrille?.value || '',
        echelle: selectEchelle?.value || '',
        cartouche: selectCartouche?.value || '',
        remise: selectRemise?.value || '',
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };

    db.setSync('dernieresSelectionsEvaluation', JSON.stringify(selections));
}

/**
 * Vérifie s'il existe une évaluation sauvegardée pour l'étudiant et la production actuels
 * et charge les niveaux de maîtrise si elle existe
 */
function verifierEtChargerEvaluationExistante() {
    // 🔧 FIX (20 mars 2026) : Ne pas interférer quand modifierEvaluation charge une évaluation spécifique
    if (window._modifierEvaluationEnCours) {
        return;
    }

    // Suspendre l'auto-save pendant la cascade de restauration (selects de
    // critères dispatch des events 'change' qui trigger niveauSelectionne →
    // _debouncerAutoSave). Sans cette suspension, un snapshot pris entre le
    // reset partiel et la restauration finale peut écraser les valeurs déjà
    // persistées en DB (criteres, donneesAlgorithmiques) par un état tronqué.
    if (typeof _suspendreAutoSaveTemporairement === 'function') {
        _suspendreAutoSaveTemporairement();
    }

    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    // Ne pas écraser si modifierEvaluation a déjà chargé une évaluation spécifique
    // pour ce même étudiant+production (protège originale remplacée ET reprise)
    if (window.evaluationEnCours?.idModification &&
        window.evaluationEnCours?.etudiantDA === etudiantDA &&
        window.evaluationEnCours?.productionId === productionId) {
        return;
    }

    if (!etudiantDA || !productionId) {
        return;
    }

    // Chercher une évaluation existante
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationExistante = evaluations.find(e =>
        e.etudiantDA === etudiantDA &&
        e.productionId === productionId &&
        !e.remplaceeParId // Exclure les évaluations remplacées par un jeton
    );

    if (!evaluationExistante) {

        // Masquer l'indicateur de verrouillage et réactiver le formulaire
        afficherOuMasquerBoutonVerrouillage(false);
        desactiverFormulaireEvaluation(false);

        // Réinitialiser l'ID de modification si présent
        if (window.evaluationEnCours?.idModification) {
            delete window.evaluationEnCours.idModification;
        }

        // Réinitialiser les données algorithmiques (codes d'erreurs, nombre de mots)
        if (window.evaluationEnCours) {
            window.evaluationEnCours.donneesAlgorithmiques = {};
            window.evaluationEnCours.pointsAnalytiques = {};   // lot 2
        }
        // Lot 2 — vider aussi les champs de points des critères analytiques
        document.querySelectorAll('input[id^="eval_pts_"]').forEach(champ => { champ.value = ''; });

        // Vider les champs algorithmiques dans le DOM
        // IDs: eval_categories_*, eval_erreurs_*, eval_mots_*, resultat_algo_*
        const champsCategories = document.querySelectorAll('input[id^="eval_categories_"]');
        const champsErreurs = document.querySelectorAll('input[id^="eval_erreurs_"]');
        const champsMots = document.querySelectorAll('input[id^="eval_mots_"]');
        const zonesResultat = document.querySelectorAll('div[id^="resultat_algo_"]');

        champsCategories.forEach(input => input.value = '');
        champsErreurs.forEach(input => input.value = '');
        champsMots.forEach(input => input.value = '');
        zonesResultat.forEach(div => {
            const spans = div.querySelectorAll('span');
            spans.forEach(span => span.textContent = '--');
        });

        // #959 — le statut d'intégrité de l'élève précédent (« IA », ses notes) ne passe pas à celui-ci :
        // rien d'autre ne remet ce menu à « recevable ». `changerStatutIntegrite` vide les notes.
        const selectIntegrite = document.getElementById('statutIntegrite');
        if (selectIntegrite && selectIntegrite.value !== 'recevable') {
            selectIntegrite.value = 'recevable';
            selectIntegrite.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Masquer les badges de jetons
        const section = document.getElementById('gestionJetonsEvaluation');
        if (section) section.classList.add('u-hide');

        // Régénérer la rétroaction avec les options d'affichage actuelles
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
        return;
    }

    // Charger la grille (AVANT la cartouche — nécessaire pour peupler les options cartouche)
    if (evaluationExistante.grilleId) {
        const selectGrille = document.getElementById('selectGrille1');
        if (selectGrille) {
            selectGrille.value = evaluationExistante.grilleId;
            // Peupler les cartouches pour cette grille
            chargerGrilleSelectionnee();
        }
    }

    // Charger la cartouche (les options existent maintenant grâce à chargerGrilleSelectionnee)
    if (evaluationExistante.cartoucheId) {
        const selectCartouche = document.getElementById('selectCartoucheEval');
        if (selectCartouche) {
            selectCartouche.value = evaluationExistante.cartoucheId;
        }
    }

    // Statut de remise et statut d'intégrité : le chargeur de « Modifier » (Liste des évaluations).
    // #959 — ce chemin posait la remise seule : une évaluation « IA » ouverte depuis sa copie
    // repassait à « recevable » et perdait ses notes d'intégrité à « Enregistrer ».
    _chargerStatutsEtBadgesModif(evaluationExistante);

    // Charger l'échelle (si elle existe)
    if (evaluationExistante.echelleId) {
        const selectEchelle = document.getElementById('selectEchelle1');
        if (selectEchelle) {
            selectEchelle.value = evaluationExistante.echelleId;
        }
    }

    // Déclencher l'affichage des critères maintenant que cartouche et statut sont chargés
    cartoucheSelectionnee();

    // Charger les niveaux de maîtrise dans les selects de critères
    // Attendre que les selects soient générés
    setTimeout(() => {
        let criteresCharges = 0;

        // Lot 2 (4 sept. 2026) — LES POINTS D'UN CRITÈRE ANALYTIQUE reviennent dans leur
        // champ, et le même événement que la frappe les remet en mémoire (`pointsSaisis`,
        // comme `change` remet les niveaux par `niveauSelectionne`).
        Object.entries(evaluationExistante.pointsAnalytiques || {}).forEach(([critereId, pts]) => {
            const champ = document.getElementById(`eval_pts_${critereId}`);
            if (!champ || typeof pts !== 'number') return;
            champ.value = pts;
            champ.dispatchEvent(new Event('input', { bubbles: true }));
            criteresCharges++;
        });

        evaluationExistante.criteres.forEach(critere => {
            const selectId = `eval_${critere.critereId}`;
            const selectCritere = document.getElementById(selectId);

            if (selectCritere) {
                // Vérifier si c'est un critère algorithmique avec données sauvegardées
                const estAlgorithmique = evaluationExistante.donneesAlgorithmiques &&
                                         evaluationExistante.donneesAlgorithmiques[critere.critereId] &&
                                         evaluationExistante.donneesAlgorithmiques[critere.critereId].pourcentage !== undefined;

                if (estAlgorithmique) {
                    // Pour les critères algorithmiques, laisser le select VIDE
                    // Le niveau sera calculé automatiquement à partir des données algorithmiques
                    selectCritere.value = '';
                } else {
                    // Pour les critères normaux, restaurer le niveau sélectionné
                    selectCritere.value = critere.niveauSelectionne;
                }
                selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
                criteresCharges++;
            }
        });

        // Charger la rétroaction finale
        // ✅ CORRECTION (30 déc 2025): Anonymiser le texte si en mode Anonymisé
        const retroaction = document.getElementById('retroactionFinale1');
        if (retroaction && evaluationExistante.retroactionFinale) {
            // Utiliser anonymiserTexteRetroaction() pour remplacer les prénoms réels
            const texteRetroaction = typeof anonymiserTexteRetroaction === 'function'
                ? anonymiserTexteRetroaction(evaluationExistante.retroactionFinale, evaluationExistante.etudiantDA)
                : evaluationExistante.retroactionFinale;
            retroaction.value = texteRetroaction;
        }
        // #961 (D7) — la marque enregistrée revient avec le texte ; sans clé (stock d'avant D7),
        // la question due au premier geste qui régénérerait (R2).
        if (typeof window.preparerRetroactionEnregistree === 'function') window.preparerRetroactionEnregistree(evaluationExistante);
        // Patch §5.6 — promotion mettreAJourCompteurMots vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.mettreAJourCompteurMots();

        // Mettre à jour evaluationEnCours pour indiquer qu'on modifie cette évaluation
        if (window.evaluationEnCours) {
            window.evaluationEnCours.idModification = evaluationExistante.id;
            window.evaluationEnCours.delaiAccorde = evaluationExistante.delaiAccorde || false;
            window.evaluationEnCours.grilleId = evaluationExistante.grilleId;
            window.evaluationEnCours.echelleId = evaluationExistante.echelleId;
            window.evaluationEnCours.cartoucheId = evaluationExistante.cartoucheId;
            window.evaluationEnCours.statutRemise = evaluationExistante.statutRemise;
            window.evaluationEnCours.criteres = {};
            evaluationExistante.criteres.forEach(c => {
                window.evaluationEnCours.criteres[c.critereId] = c.niveauSelectionne;
            });
            window.evaluationEnCours.pointsAnalytiques = evaluationExistante.pointsAnalytiques || {};   // lot 2

            // Restaurer les données algorithmiques (français écrit)
            if (evaluationExistante.donneesAlgorithmiques && Object.keys(evaluationExistante.donneesAlgorithmiques).length > 0) {

                // Sauvegarder dans evaluationEnCours
                window.evaluationEnCours.donneesAlgorithmiques = evaluationExistante.donneesAlgorithmiques;

                Object.keys(evaluationExistante.donneesAlgorithmiques).forEach(critereId => {
                    const donnees = evaluationExistante.donneesAlgorithmiques[critereId];

                    // Restaurer le champ des codes (si existant - catégories)
                    if (donnees.codes && Array.isArray(donnees.codes)) {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        if (inputCategories) {
                            inputCategories.value = donnees.codes.join(';');
                        }
                    }

                    // Restaurer le champ du nombre de mots
                    if (donnees.mots !== undefined) {
                        const inputMots = document.getElementById(`eval_mots_${critereId}`);
                        if (inputMots) {
                            inputMots.value = donnees.mots;
                        }
                    }

                    // Restaurer le champ d'erreurs (si mode simple - sans catégorisation)
                    // CORRECTION: Supporter aussi totalErreurs pour compatibilité avec anciennes évaluations
                    const nbErreurs = donnees.erreurs !== undefined ? donnees.erreurs : donnees.totalErreurs;
                    if (nbErreurs !== undefined) {
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
                        if (inputErreurs) {
                            inputErreurs.value = nbErreurs;
                        }
                    }

                    // Déclencher le recalcul pour afficher les résultats
                    setTimeout(() => {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);

                        // Lot C de l'enregistrement — ce `input` scripté n'est pas un geste : depuis que le
                        // nombre d'erreurs s'enregistre tout seul, il arme l'écriture, et il part après la
                        // suspension de 500 ms (mesuré : +560 ms). Le compteur de #960 le tait.
                        window._chargementsEvaluationEnCours = (window._chargementsEvaluationEnCours || 0) + 1;
                        try {
                            if (inputCategories) {
                                inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
                            } else if (inputErreurs) {
                                inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        } finally {
                            window._chargementsEvaluationEnCours = Math.max(0, window._chargementsEvaluationEnCours - 1);
                        }
                    }, 100);
                });

            }

            // Note: Jetons de délai sont maintenant gérés par les badges cliquables
            // Plus besoin de restaurer une checkbox

            // Afficher l'indicateur de verrouillage si l'évaluation existe
            afficherOuMasquerBoutonVerrouillage(true, evaluationExistante.verrouillee || false);

            // Désactiver le formulaire si l'évaluation est verrouillée
            if (evaluationExistante.verrouillee) {
                desactiverFormulaireEvaluation(true);
            } else {
                desactiverFormulaireEvaluation(false);
            }

            // Afficher les badges des jetons appliqués
            window.afficherBadgesJetons();
        }

        // Recalculer la note APRÈS restauration des données algorithmiques
        // IMPORTANT: Délai de 350ms pour s'assurer que les données algorithmiques
        // sont restaurées (100ms) et que leur recalcul est déclenché (100ms de plus)
        setTimeout(() => {
            // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
            if (typeof window.calculerNote === 'function') {
                window.calculerNote();
            }
            // Restaurer les options d'affichage sauvegardées dans l'évaluation
            if (evaluationExistante.optionsAffichage) {
                const opts = evaluationExistante.optionsAffichage;
                const checkboxMap = {
                    'afficherDescription1': opts.description,
                    'afficherObjectif1': opts.objectif,
                    'afficherTache1': opts.tache,
                    'afficherAdresse1': opts.adresse,
                    'afficherContexte1': opts.contexte
                };
                Object.entries(checkboxMap).forEach(([id, val]) => {
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = val ?? true;
                });
                if (opts.affichageNote === 'lettre') {
                    const r = document.getElementById('affichageNoteLettre1');
                    if (r) r.checked = true;
                } else {
                    const r = document.getElementById('affichageNoteComplet1');
                    if (r) r.checked = true;
                }
            }
            // Régénérer la rétroaction avec les options d'affichage restaurées — SEULEMENT si
            // l'évaluation n'en a pas. #960 : la rétroaction enregistrée fait foi ; régénérée ici,
            // elle remplaçait le texte réécrit à la main, après que « Modifier » l'eut remis.
            if (!evaluationExistante.retroactionFinale) window.genererRetroaction(1);
        }, 350);
    }, 300);
}

/**
 * D'un élève à l'autre sur le formulaire sans copie (#920). Avec une copie, c'est la bande des
 * élèves de la visionneuse qui fait ce geste ; sans copie, rien ne le permettait (rapport du
 * 18 sept. 2026, saisie des notes d'A2024). L'ordre est celui de `selectEtudiantEval`.
 * `chargerEvaluationsEtudiant` vide l'auto-save en attente AVANT de changer d'élève, garde la
 * production, la grille et l'échelle, puis recharge l'évaluation existante s'il y en a une.
 * @param {number} pas -1 ou +1
 */
function _naviguerEtudiant(pas) {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant || !selectEtudiant.value) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const cible = options[options.findIndex(opt => opt.value === selectEtudiant.value) + pas];
    if (!cible) return;

    // Lue AVANT le chargement : `chargerEvaluationsEtudiant` vide le sélecteur de production et ne le
    // repose qu'un instant plus tard — l'étiquette dirait « Non associée ».
    const productionId = document.getElementById('selectProduction1')?.value || '';
    // « Consulter » a posé `window.evaluationEnCours` avec l'élève et l'id de SON évaluation. Laissé tel quel, il
    // garderait cet élève pendant que l'id suit les suivants : au retour, la garde de
    // `verifierEtChargerEvaluationExistante` (même élève, même production, un id) sauterait le rechargement, et
    // « Enregistrer » écrirait ce formulaire dans l'évaluation d'un AUTRE élève. Même remise à zéro que
    // `demarrerEvaluationDepuisFichier` quand la copie change ; l'id est reposé par le rechargement.
    if (window.evaluationEnCours) {
        window.evaluationEnCours.etudiantDA = cible.value;
        window.evaluationEnCours.criteres = {};
        window.evaluationEnCours.donneesAlgorithmiques = {};
        window.evaluationEnCours.pointsAnalytiques = {};
        delete window.evaluationEnCours.idModification;
    }
    selectEtudiant.value = cible.value;
    chargerEvaluationsEtudiant();
    if (typeof travauxUI !== 'undefined' && typeof travauxUI.ecrireLabelsIdentite === 'function') {
        travauxUI.ecrireLabelsIdentite(cible.value, productionId);
    }
    mettreAJourNavigationSansCopie();
}

function naviguerEtudiantPrecedent() { _naviguerEtudiant(-1); }
function naviguerEtudiantSuivant() { _naviguerEtudiant(1); }

/**
 * La barre du formulaire sans copie : « Élève 3 de 54 », flèches éteintes aux deux bouts.
 * Cachée tant qu'aucun élève n'est choisi.
 */
function mettreAJourNavigationSansCopie() {
    const barre = document.getElementById('eval-navigation-sans-copie');
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!barre || !selectEtudiant) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const formulaire = document.getElementById('evaluations-contenu-evaluation');
    const sansCopie = !!formulaire && formulaire.contains(document.getElementById('travaux-eval-gauche'));
    const index = sansCopie ? options.findIndex(opt => opt.value === selectEtudiant.value) : -1;
    barre.classList.toggle('u-hide', index === -1);
    if (index === -1) return;

    const position = document.getElementById('eval-navigation-position');
    if (position) position.textContent = `Élève ${index + 1} de ${options.length}`;
    const precedent = barre.querySelector('[data-action="naviguerEtudiantPrecedent"]');
    const suivant = barre.querySelector('[data-action="naviguerEtudiantSuivant"]');
    if (precedent) precedent.disabled = index === 0;
    if (suivant) suivant.disabled = index === options.length - 1;
}

/**
 * Attache les événements de mémorisation aux selects
 * Appelée lors de l'initialisation du module
 */
function attacherEvenementsMemorisation() {
    const selectsAMemoriser = [
        'selectProduction1',
        'selectGrille1',
        'selectEchelle1',
        'selectCartoucheEval',
        'remiseProduction1'
    ];

    selectsAMemoriser.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.dataset.memoAttache) {
            select.addEventListener('change', memoriserSelectionsEvaluation);
            select.dataset.memoAttache = '1';
        }
    });

    // Mémoriser aussi les checkboxes
    const checkboxesAMemoriser = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    // #882 (16 sept. 2026) — ces options vivent dans l'évaluation (`optionsAffichage`) et le PDF
    // de l'élève les relit : les changer arme l'auto-save, comme un critère.
    // Par `window` : `_debouncerAutoSave` est privé à l'IIFE d'evaluation-chargement.js.
    const armerAutoSave = () => { if (typeof window._debouncerAutoSave === 'function') window._debouncerAutoSave(); };

    checkboxesAMemoriser.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && !checkbox.dataset.memoAttache) {
            checkbox.addEventListener('change', memoriserSelectionsEvaluation);
            checkbox.addEventListener('change', armerAutoSave);
            checkbox.dataset.memoAttache = '1';
        }
    });

    // Mémoriser aussi les radios affichageNote
    ['affichageNoteComplet1', 'affichageNoteLettre1'].forEach(id => {
        const radio = document.getElementById(id);
        if (radio && !radio.dataset.memoAttache) {
            radio.addEventListener('change', memoriserSelectionsEvaluation);
            radio.addEventListener('change', armerAutoSave);
            radio.dataset.memoAttache = '1';
        }
    });
}

/* ===============================
   🔄 REPRISE ET VERROUILLAGE D'ÉVALUATIONS
   =============================== */

/**
 * Charge une évaluation existante dans le formulaire pour modification
 * Utilisé notamment lors de l'application de jetons de reprise
 * @param {string} evaluationId - ID de l'évaluation à charger
 */

/**
 * ✨ FALLBACK: Extrait les niveaux des critères depuis la rétroaction
 * Utilisé quand evaluation.criteres est vide mais que la rétroaction contient les niveaux
 * Format attendu : "STRUCTURE (I) : commentaire..."
 */
function extraireNiveauxDepuisRetroaction(retroaction, grille) {
    if (!retroaction || !grille) return {};

    const niveauxExtrait = {};

    // Regex pour capturer : NOM_CRITERE (NIVEAU)
    // Ex: "STRUCTURE (I)" ou "PLAUSIBILITÉ (M)"
    const regex = /([A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ\s]+)\s*\(([IDMBE])\)/gi;
    let match;

    while ((match = regex.exec(retroaction)) !== null) {
        const nomCritere = match[1].trim();
        const niveau = match[2].toUpperCase();

        // Trouver le critère correspondant dans la grille
        const critere = grille.criteres.find(c =>
            c.nom.toUpperCase() === nomCritere.toUpperCase()
        );

        if (critere) {
            niveauxExtrait[critere.id] = niveau;
        } else {
            console.warn(`  ⚠️ Critère non trouvé dans la grille : ${nomCritere}`);
        }
    }

    return niveauxExtrait;
}

/**
 * Affiche les critères d'une évaluation quand la grille n'existe plus dans les templates.
 * Reconstruit un affichage en lecture seule depuis les données sauvegardées.
 */
function _afficherCriteresDepuisEvaluation(evaluation) {
    const conteneur = document.getElementById('listeCriteresGrille1');
    if (!conteneur) return;

    // Récupérer les niveaux de l'échelle pour afficher les noms
    let niveauxMap = {};
    const echelleId = evaluation.echelleId;
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const p = pratiques.find(pr => pr.id === pratiqueId);
        if (p?.config?.echelle?.niveaux) {
            p.config.echelle.niveaux.forEach(n => { niveauxMap[n.code] = n.nom || n.code; });
        }
    } else {
        const echelles = db.getSync(cle('echellesTemplates'), []);
        const echelle = echelles.find(e => e.id === echelleId);
        if (echelle?.niveaux) {
            echelle.niveaux.forEach(n => { niveauxMap[n.code] = n.nom || n.code; });
        }
    }
    // Fallback IDME
    if (Object.keys(niveauxMap).length === 0) {
        niveauxMap = { I: 'Incomplet', D: 'Développement', M: 'Maîtrise', E: 'Étendu' };
    }

    const html = evaluation.criteres.map(critere => {
        const nom = echapperHtml(critere.critereNom || critere.critereId);
        const niveau = critere.niveauSelectionne || '--';
        const niveauNom = niveauxMap[niveau] || niveau;
        // Générer un <select> avec le même ID que le flux normal pour que l'étape 10 puisse le remplir
        const selectId = `eval_${critere.critereId}`;
        const optionsHtml = Object.keys(niveauxMap).map(code =>
            `<option value="${code}"${code === niveau ? ' selected' : ''}>${code} — ${echapperHtml(niveauxMap[code])}</option>`
        ).join('');
        return `
        <div class="eval-critere-carte">
            <div class="eval-grid-critere">
                <div>
                    <strong class="u-texte-09">${nom}</strong>
                </div>
                <div>
                    <select id="${selectId}" class="eval-select-niveau" data-on-change="niveauSelectionne" data-param="${critere.critereId}">
                        <option value="">--</option>
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        </div>`;
    }).join('');

    conteneur.innerHTML = `
        <div class="alerte alerte-attention" style="margin-bottom: 1rem">
            Grille d'origine introuvable dans les modèles actuels : affichage depuis les données enregistrées.
        </div>
        ${html}`;
}

/**
 * Attend qu'une option précise apparaisse dans un select (polling actif, pas de délai
 * fixe). Sortie de `modifierEvaluation` le 15 sept. 2026 (#868) : le formulaire sans
 * copie s'en sert aussi.
 */
function _attendreOptionSelect(selectId, valeurCherchee, maxTentatives = 20, delai = 100) {
    return new Promise((resolve, reject) => {
        let tentatives = 0;
        const intervalle = setInterval(() => {
            tentatives++;
            const select = document.getElementById(selectId);
            const optionTrouvee = select ? Array.from(select.options).find(opt => opt.value === valeurCherchee) : null;

            if (optionTrouvee) {
                clearInterval(intervalle);
                resolve(select);
            } else if (tentatives >= maxTentatives) {
                clearInterval(intervalle);
                reject(new Error(`Timeout: option "${valeurCherchee}" introuvable dans #${selectId}`));
            }
        }, delai);
    });
}

/**
 * Charge une évaluation existante pour modification
 * Refactorisé le 16 novembre 2025 pour corriger bug timing chargement
 *
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
/** #960, B1 — au plus tard, le compteur de chargement est rendu à l'auto-save. */
const DELAI_BORNE_CHARGEMENT_EVALUATION = 15000;

function modifierEvaluation(evaluationId) {

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const estVerrouillee = evaluation.verrouillee || false;

    // Flag pour empêcher afficherFichiers() de masquer le formulaire d'évaluation
    // (afficherSousSection déclenche initialiserModuleTravaux → rafraichirUI → afficherFichiers
    // qui masquerait le formulaire avant qu'on ait le temps de le rendre visible)
    window._modifierEvaluationEnCours = true;

    // Naviguer vers la section d'évaluation (onglet Annoter et évaluer)
    // Ne pas re-naviguer si on y est déjà (sinon ça réinitialise le module et écrase le mode évaluer)
    if (typeof sousSectionActive === 'undefined' || sousSectionActive !== 'evaluations-annoter') {
        afficherSousSection('evaluations-annoter');
    }

    // ========== FONCTIONS HELPER ==========

    // L'attente d'une option vit au niveau du module : `_attendreOptionSelect` (#868 la
    // partage avec le formulaire sans copie).
    const attendreOption = _attendreOptionSelect;

    /**
     * Trouve le numéro de groupe d'un étudiant
     * Cherche d'abord dans les étudiants, puis en fallback dans l'évaluation elle-même
     */
    const trouverGroupeEtudiant = (da) => {
        // Méthode 1: Chercher dans la liste des étudiants
        // NOTE: La clé est 'groupeEtudiants', pas 'etudiants' (cohérence avec reste du code)
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && etudiant.groupe) {
            return etudiant.groupe;
        }

        // Méthode 2 (fallback): Si l'étudiant n'est pas trouvé, chercher le groupe
        // depuis l'évaluation elle-même (peut arriver si mode données différent)
        console.warn(`⚠️ Étudiant DA ${da} non trouvé dans liste étudiants, utilisation fallback`);

        // L'évaluation contient déjà le groupe via etudiantNom qui peut être parsé
        // OU on peut chercher dans d'autres évaluations du même étudiant
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const autreEval = evaluations.find(e => e.etudiantDA === da && e.id !== evaluationId);

        if (autreEval && autreEval.groupe) {
            return autreEval.groupe;
        }

        // Si l'évaluation actuelle contient le groupe, l'utiliser
        if (evaluation.groupe) {
            return evaluation.groupe;
        }

        return null;
    };

    // L'attente des critères rendus vit au niveau du module : `_attendreSaisiePremierCritereModif`
    // (retouche du 4 sept. 2026 — elle attendait un <select> que le critère analytique n'a pas).

    // ========== CHARGEMENT SÉQUENTIEL ==========

    // #960 — ouvrir n'écrit rien : l'auto-save ne s'arme pas pendant la restauration (compteur,
    // et non `_modifierEvaluationEnCours`, que `ouvrirFichier` remet à faux en chemin). Posé
    // juste avant le minuteur dont le `finally` le rend : aucune sortie ne le laisse armé.
    // B1 (contre-vérification de Cowork) — et une BORNE : la vue côte à côte attend PDF.js sans
    // délai maximal ; un `finally` qui n'arrive pas laisserait l'auto-save muet pour la séance.
    // Rendu une seule fois, par le premier des deux.
    window._chargementsEvaluationEnCours = (window._chargementsEvaluationEnCours || 0) + 1;
    let compteurRendu = false;
    const rendreCompteur = () => {
        if (compteurRendu) return;
        compteurRendu = true;
        window._chargementsEvaluationEnCours = Math.max(0, (window._chargementsEvaluationEnCours || 1) - 1);
    };
    const borneCompteur = setTimeout(() => {
        if (compteurRendu) return;
        console.warn('[Modifier] Chargement de l\'évaluation non terminé après 15 s : l\'enregistrement automatique reprend.');
        rendreCompteur();
    }, DELAI_BORNE_CHARGEMENT_EVALUATION);
    setTimeout(async () => {
        try {
            // 🔧 FIX (20 mars 2026) : _forceStandaloneEval permet à modifierEvaluationRemplacee()
            // de forcer le mode standalone pour éviter que preRemplirEvaluation charge la reprise
            const enModeEvaluer = !window._forceStandaloneEval && !!document.getElementById('travaux-palette-eval-gauche');
            if (window._forceStandaloneEval) {
                window._forceStandaloneEval = false;
            }
            _setupAffichagePanneauxModif(enModeEvaluer);

            // Chargement selects (deux branches : enModeEvaluer / standalone)
            if (enModeEvaluer) {
                _chargerSelectsModeEvaluer(evaluation);
            } else {
                await _chargerSelectsStandalone(evaluation, attendreOption, trouverGroupeEtudiant);
            }

            // Annuler tout auto-save en attente (race condition) — Patch §5.6 fix #109 (étape 4)
            if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }

            // ÉTAPE 5 : Initialiser evaluationEnCours + pré-remplir critères + fallback rétroaction
            _initEvaluationEnCoursPourModif(evaluation, evaluationId);

            // ÉTAPES 6+7 : Charger échelle + cartouche/fallback critères + fallback grille manquante
            _chargerEchelleEtCartoucheModif(evaluation);

            // ÉTAPE 8 : Charger statuts (remise + intégrité) + afficher badges jetons
            _chargerStatutsEtBadgesModif(evaluation);

            // ÉTAPES 9-10 : Attendre selects critères + charger valeurs + données algorithmiques
            await _chargerValeursEtAlgoModif(evaluation, _attendreSaisiePremierCritereModif);

            // ÉTAPES 11-12 : Options d'affichage + rétroaction finale (avec anonymisation)
            _chargerOptionsEtRetroactionModif(evaluation);

            // ÉTAPES 13-14 : Indicateur mode modification + verrouillage
            _gererIndicateurEtVerrouillageModif(evaluation, estVerrouillee);
            mettreAJourNavigationSansCopie();   // #920 — « Consulter » est le seul geste offert pour un élève déjà noté

            // ÉTAPES 15-16 : Gestion jetons + bouton Éditer
            window.afficherGestionJetons(true);
            _afficherBoutonEditerFichierModif();

            // ÉTAPE 17 : Ouvrir le travail de l'étudiant en vue côte à côte (si disponible)
            await _ouvrirVueCoteACoteModif(evaluation, enModeEvaluer);

        } catch (erreur) {
            console.error('❌ Erreur lors du chargement de l\'évaluation:', erreur);
            notifications.erreur(
                'Erreur de chargement',
                `Impossible de charger l'évaluation: ${erreur.message}`
            );
        } finally {
            window._modifierEvaluationEnCours = false;
            clearTimeout(borneCompteur);
            rendreCompteur();
        }
    }, 200);
}

// ========== HELPERS PRIVÉS _Modif* (extraction étape 4 — éclatement async arrow cyc 78 → cyc ≤ 30) ==========

function _setupAffichagePanneauxModif(enModeEvaluer) {
    // Si on est en mode évaluer (visionneuse avec fichier ouvert), les panneaux sont déjà
    // visibles via afficherPalettesEval. Sinon (standalone), afficher le formulaire directement.
    if (enModeEvaluer) return;
    const evalDiv = document.getElementById('evaluations-contenu-evaluation');
    const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
    const visDiv3 = document.getElementById('evaluations-contenu-visionneuse');
    if (evalDiv) evalDiv.classList.remove('u-hide');
    if (fichiersDiv) fichiersDiv.classList.add('u-hide');
    if (visDiv3) visDiv3.classList.add('u-hide');

    // Rendre visibles les panneaux enfants du formulaire (u-hide par défaut)
    ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'].forEach(id => {
        const panneau = document.getElementById(id);
        if (panneau) panneau.classList.remove('u-hide');
    });

    // #868 — sans copie, les mêmes outils que les palettes du mode Évaluer : le cadenas,
    // les vues de la rétroaction, « Copier tout » et « Copier ».
    if (typeof travauxUI !== 'undefined' && typeof travauxUI.equiperFormulaireSansCopie === 'function') {
        travauxUI.equiperFormulaireSansCopie();
    }
}

function _chargerSelectsModeEvaluer(evaluation) {
    // 🔧 FIX (5 mars 2026) : En mode évaluer, les selects groupe/étudiant/production sont
    // déjà peuplés par afficherPalettesEval(). Les reconfigurer provoque un timeout.
    if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
    if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();
    const selectGrille = document.getElementById('selectGrille1');
    if (selectGrille && evaluation.grilleId) {
        selectGrille.value = evaluation.grilleId;
        selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function _chargerSelectsStandalone(evaluation, attendreOption, trouverGroupeEtudiant) {
    // #868 — le nom de l'élève et de la production en tête, comme avec une copie
    // (ils restaient à « — » sur le formulaire sans copie).
    if (typeof travauxUI !== 'undefined' && typeof travauxUI.ecrireLabelsIdentite === 'function') {
        travauxUI.ecrireLabelsIdentite(evaluation.etudiantDA, evaluation.productionId);
    }

    // ÉTAPE 0 : selects de base (groupes, grilles, échelles)
    if (typeof chargerGroupesEval === 'function') chargerGroupesEval();
    if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
    if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();

    // ÉTAPES 1-3 : Charger groupe, étudiant, production (tolérantes aux données manquantes)
    const numeroGroupe = trouverGroupeEtudiant(evaluation.etudiantDA);
    if (numeroGroupe) {
        const selectGroupe = document.getElementById('selectGroupeEval');
        if (selectGroupe) {
            selectGroupe.value = numeroGroupe;
            selectGroupe.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else {
        console.warn('⚠️ Groupe introuvable pour DA', evaluation.etudiantDA, '— étapes étudiant/production ignorées');
    }

    // Étudiant
    try {
        await attendreOption('selectEtudiantEval', evaluation.etudiantDA);
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        selectEtudiant.value = evaluation.etudiantDA;
        selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errEtudiant) {
        console.warn('⚠️ Étudiant', evaluation.etudiantDA, 'introuvable dans les selects');
    }

    // Production
    try {
        await attendreOption('selectProduction1', evaluation.productionId);
        const selectProduction = document.getElementById('selectProduction1');
        selectProduction.value = evaluation.productionId;
        selectProduction.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errProd) {
        console.warn('⚠️ Production', evaluation.productionId, 'introuvable dans les selects');
    }

    // ÉTAPE 4 : Grille (peut ne plus exister dans les templates). Une évaluation NEUVE
    // (#868, sans copie) n'en porte pas : la production la pose elle-même (`chargerProduction`).
    if (!evaluation.grilleId) return;
    try {
        await attendreOption('selectGrille1', evaluation.grilleId);
        const selectGrille = document.getElementById('selectGrille1');
        selectGrille.value = evaluation.grilleId;
        selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errGrille) {
        console.warn('⚠️ Grille', evaluation.grilleId, 'introuvable dans les templates — affichage depuis les données sauvegardées');
    }
}

function _initEvaluationEnCoursPourModif(evaluation, evaluationId) {
    window.evaluationEnCours = {
        etudiantDA: evaluation.etudiantDA,
        productionId: evaluation.productionId,
        grilleId: evaluation.grilleId,
        echelleId: evaluation.echelleId,
        cartoucheId: evaluation.cartoucheId,
        statutRemise: evaluation.statutRemise,
        statutIntegrite: evaluation.statutIntegrite || 'recevable',
        notesIntegrite: evaluation.notesIntegrite || '',
        delaiAccorde: evaluation.delaiAccorde || false,
        jetonDelaiApplique: evaluation.jetonDelaiApplique || false,
        dateApplicationJetonDelai: evaluation.dateApplicationJetonDelai,
        jetonRepriseApplique: evaluation.jetonRepriseApplique || false,
        repriseDeId: evaluation.repriseDeId,
        dateApplicationJetonReprise: evaluation.dateApplicationJetonReprise,
        jetonRepriseCibleeApplique: evaluation.jetonRepriseCibleeApplique || false,
        repriseDeIdCiblee: evaluation.repriseDeIdCiblee,
        critereRepriseCiblee: evaluation.critereRepriseCiblee,
        plafondNoteCiblee: evaluation.plafondNoteCiblee,
        dateApplicationJetonRepriseCiblee: evaluation.dateApplicationJetonRepriseCiblee,
        criteres: {},
        // Retouche du 4 sept. 2026 — les points d'un critère analytique, sur l'objet `window`
        // aussi (#646) : le bilan les y lit (`_collecterCriteresBilan`), comme l'autre chemin de
        // réouverture (`verifierEtChargerEvaluationExistante`) les y remet déjà.
        pointsAnalytiques: (evaluation.pointsAnalytiques && typeof evaluation.pointsAnalytiques === 'object')
            ? JSON.parse(JSON.stringify(evaluation.pointsAnalytiques)) : {},
        // #1034 — posées AVANT le rendu des critères : la détection des codes
        // (`evaluation-chargement.js`) les lit pour faire naître le critère algorithmique en
        // mode catégories. Absentes, il naissait en mode simple, sans champ pour les codes, et
        // le premier geste écrivait 0 erreur en base (BUG_grégoire_2026-10-06_15-34-54).
        donneesAlgorithmiques: (evaluation.donneesAlgorithmiques && typeof evaluation.donneesAlgorithmiques === 'object')
            ? JSON.parse(JSON.stringify(evaluation.donneesAlgorithmiques)) : {},
        idModification: evaluationId
    };

    // Pré-remplir les critères depuis l'évaluation
    if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
        evaluation.criteres.forEach(critere => {
            window.evaluationEnCours.criteres[critere.critereId] = critere.niveauSelectionne;
        });
        return;
    }

    // FALLBACK : Extraire depuis rétroaction si criteres[] vide
    console.warn('⚠️ Extraction niveaux depuis rétroaction...');
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === evaluation.grilleId);
    if (!grille || !evaluation.retroactionFinale) return;
    const niveauxExtrait = extraireNiveauxDepuisRetroaction(evaluation.retroactionFinale, grille);
    if (Object.keys(niveauxExtrait).length === 0) return;
    window.evaluationEnCours.criteres = niveauxExtrait;
    evaluation.criteres = Object.keys(niveauxExtrait).map(critereId => ({
        critereId,
        critereNom: grille.criteres.find(c => c.id === critereId)?.nom || critereId,
        niveauSelectionne: niveauxExtrait[critereId]
    }));
}

function _chargerCartoucheDropdownModif(evaluation) {
    // Charger échelle
    const selectEchelle = document.getElementById('selectEchelle1');
    if (selectEchelle) {
        selectEchelle.value = evaluation.echelleId;
        selectEchelle.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // ÉTAPE 7 : Charger cartouche OU générer critères depuis grille (fallback)
    const selectCartouche = document.getElementById('selectCartoucheEval');
    if (!selectCartouche || !evaluation.grilleId) return false;

    // ✅ CORRIGÉ (31 déc 2025) : Peupler explicitement le dropdown avant de sélectionner
    const cartouches = db.getSync(cle(`cartouches_${evaluation.grilleId}`), []);
    selectCartouche.innerHTML = '<option value="">— Choisir une cartouche —</option>';
    cartouches.forEach(cartouche => {
        const option = document.createElement('option');
        option.value = cartouche.id;
        option.textContent = cartouche.nom || cartouche.id;
        selectCartouche.appendChild(option);
    });

    // Sélectionner la cartouche si elle existe dans l'évaluation
    if (!evaluation.cartoucheId) return false;
    const cartoucheExiste = cartouches.some(c => c.id === evaluation.cartoucheId);
    if (cartoucheExiste) {
        window.poserCartoucheParChargeur(selectCartouche, evaluation.cartoucheId);   // #944
        return true;
    }
    console.warn(`   ⚠️ Cartouche ${evaluation.cartoucheId} non trouvée dans les ${cartouches.length} cartouches`);
    return false;
}

function _appliquerFallbackGrilleManquanteModif(evaluation) {
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grilleExiste = grilles.some(g => g.id === evaluation.grilleId);
    if (grilleExiste) return;

    if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
        _afficherCriteresDepuisEvaluation(evaluation);
    }
    // Afficher la note et le niveau sauvegardés (calculerNote() ne peut pas fonctionner sans grille)
    const noteElem = document.getElementById('noteProduction1');
    const niveauElem = document.getElementById('niveauProduction1');
    if (noteElem && evaluation.noteFinale != null) {
        noteElem.textContent = Math.round(evaluation.noteFinale * 10) / 10 + ' %';
    }
    if (niveauElem && evaluation.niveauFinal) {
        niveauElem.textContent = evaluation.niveauFinal;
    }
}

function _chargerEchelleEtCartoucheModif(evaluation) {
    const cartoucheChargee = _chargerCartoucheDropdownModif(evaluation);

    // FALLBACK : Si pas de cartouche, générer les critères directement depuis la grille
    if (!cartoucheChargee) {
        // Patch §5.6 — promotion afficherCriteresDepuisGrille (session A étape 3)
        window.afficherCriteresDepuisGrille(evaluation.grilleId, evaluation.echelleId);
    }

    _appliquerFallbackGrilleManquanteModif(evaluation);
}

function _chargerStatutsEtBadgesModif(evaluation) {
    // ÉTAPE 8 : Charger statut de remise
    // Partagé avec le chemin de la copie (`verifierEtChargerEvaluationExistante`, #959).
    const selectRemise = document.getElementById('remiseProduction1');
    if (selectRemise) {
        // Les anciens statuts (le chemin de la copie les traduisait seul ; « Modifier » posait une
        // valeur absente du menu, qui se relisait vide à « Enregistrer »).
        const statutMap = { 'non-remis': 'non-recu', 'remis': 'evalue' };
        selectRemise.value = statutMap[evaluation.statutRemise] || evaluation.statutRemise;
        window.mettreAJourPillStatut(selectRemise.value);
        selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Charger statut d'intégrité académique
    const selectIntegrite = document.getElementById('statutIntegrite');
    const notesIntegrite = document.getElementById('notesIntegrite');
    if (selectIntegrite) {
        selectIntegrite.value = evaluation.statutIntegrite || 'recevable';
        // Lot A, R4 : texte libre, masqué en anonymisation (`poserChampTexteLibre`, modes.js).
        if (notesIntegrite) {
            if (typeof poserChampTexteLibre === 'function') poserChampTexteLibre(notesIntegrite, evaluation.notesIntegrite || '');
            else notesIntegrite.value = evaluation.notesIntegrite || '';
        }
        selectIntegrite.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Afficher badges jetons
    window.afficherBadgesJetons();
}

// Lot 2 — jumeau de `_restaurerDonneesAlgorithmiquesModif` pour les points analytiques.
function _restaurerPointsAnalytiquesModif(evaluation) {
    Object.entries((evaluation && evaluation.pointsAnalytiques) || {}).forEach(([critereId, pts]) => {
        const champ = document.getElementById(`eval_pts_${critereId}`);
        if (!champ || typeof pts !== 'number') return;
        champ.value = pts;
        champ.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function _restaurerDonneesAlgorithmiquesModif(evaluation) {
    if (!evaluation.donneesAlgorithmiques || Object.keys(evaluation.donneesAlgorithmiques).length === 0) return;

    Object.keys(evaluation.donneesAlgorithmiques).forEach(critereId => {
        const donnees = evaluation.donneesAlgorithmiques[critereId];

        // Restaurer le champ des codes (catégories)
        if (donnees.codes && Array.isArray(donnees.codes)) {
            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
            if (inputCategories) inputCategories.value = donnees.codes.join(';');
        }
        // Restaurer le champ du nombre de mots
        if (donnees.mots !== undefined) {
            const inputMots = document.getElementById(`eval_mots_${critereId}`);
            if (inputMots) inputMots.value = donnees.mots;
        }
        // Restaurer le champ d'erreurs (mode simple sans catégorisation). #1034 — repli sur
        // `totalErreurs`, comme le jumeau `verifierEtChargerEvaluationExistante` : le calcul en
        // mode catégories n'écrit pas `erreurs`.
        const nbErreurs = donnees.erreurs !== undefined ? donnees.erreurs : donnees.totalErreurs;
        if (nbErreurs !== undefined) {
            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
            if (inputErreurs) inputErreurs.value = nbErreurs;
        }

        // Déclencher le recalcul pour afficher les résultats (attendre que le DOM soit prêt)
        setTimeout(() => {
            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
            if (inputCategories) {
                inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (inputErreurs) {
                inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 100);
    });
}

/**
 * Attend que le PREMIER critère de l'évaluation soit rendu dans la palette — son élément de
 * saisie, QUEL QUE SOIT SON TYPE : le menu de niveaux (`#eval_<id>`, holistique ou
 * algorithmique) ou le champ de points (`#eval_pts_<id>`, analytique).
 *
 * ⚠ RÉGRESSION DU LOT 3, trouvée par Grégoire à l'écran le 4 septembre 2026 : cette attente
 * (alors une fermeture de `modifierEvaluation`, `attendreSelectsCriteres`) n'attendait que le
 * <select>. Avant le lot 3, un critère analytique n'entrait jamais dans `criteres[]`, le premier
 * était toujours holistique ou algorithmique, et le select existait. Depuis, sur une grille
 * entièrement analytique, le premier critère est analytique → 3 s → rejet → le `catch` de
 * `modifierEvaluation` affichait « Impossible de charger l'évaluation : Timeout génération
 * selects critères », et les étapes 13-14 (indicateur, verrouillage) ne s'exécutaient jamais :
 * c'est le cadenas absent. Deux symptômes, une cause.
 *
 * #652 (16 sept. 2026) — elle guettait le PREMIER critère enregistré. Si la grille a été modifiée
 * depuis et que ce critère en est sorti, les autres cartes étaient rendues mais l'attente expirait :
 * « Erreur de chargement », aucun niveau restauré (rapport de Grégoire du 31 août, 13 h 57 ; spec
 * WebKit evaluation-652). Elle guette maintenant N'IMPORTE LEQUEL des critères enregistrés ; et si
 * aucun n'est rendu mais que des cartes le sont au bout du délai, la grille est là : on continue.
 * Rend `true` quand l'élément est là, `false` sans critère, rejette après 3 secondes sans carte.
 */
function _attendreSaisiePremierCritereModif(evaluation) {
    return new Promise((resolve, reject) => {
        if (!evaluation.criteres || evaluation.criteres.length === 0) {
            console.warn('⚠️ Aucun critère à charger');
            resolve(false); // Pas de critères, mais pas une erreur
            return;
        }

        let tentatives = 0;
        const maxTentatives = 30; // 3 secondes max
        const ids = evaluation.criteres.map(c => c && c.critereId).filter(Boolean);

        const intervalle = setInterval(() => {
            tentatives++;
            const saisie = ids.some(id => document.getElementById(`eval_${id}`) || document.getElementById(`eval_pts_${id}`));

            if (saisie) {
                clearInterval(intervalle);
                resolve(true);
            } else if (tentatives >= maxTentatives && document.querySelector('#listeCriteresGrille1 .eval-critere-carte')) {
                clearInterval(intervalle);
                console.warn('⚠️ Aucun critère enregistré n\'est dans la grille rendue : ouverture sur la grille actuelle');
                resolve(true);
            } else if (tentatives >= maxTentatives) {
                clearInterval(intervalle);
                console.error('❌ Timeout : le premier critère n\'est pas rendu (ni menu de niveaux, ni champ de points)');
                console.error('Contenu listeCriteresGrille1:', document.getElementById('listeCriteresGrille1')?.innerHTML.substring(0, 200));
                reject(new Error('Timeout : les critères de la grille ne sont pas rendus'));
            }
        }, 100);
    });
}

async function _chargerValeursEtAlgoModif(evaluation, attendreSaisiePremierCritere) {
    // ÉTAPE 9 : Attendre que le premier critère soit rendu (menu OU champ de points)
    const criteresGeneres = await attendreSaisiePremierCritere(evaluation);

    if (!criteresGeneres || !evaluation.criteres || !Array.isArray(evaluation.criteres)) return;

    // ÉTAPE 10 : Charger les valeurs des critères
    evaluation.criteres.forEach(critere => {
        // Un critère analytique n'a pas de menu : ses points reviennent à l'étape 10.5
        // (`_restaurerPointsAnalytiquesModif`), et son niveau se redéduit au calcul.
        if (typeof critere.points === 'number') return;
        const selectId = `eval_${critere.critereId}`;
        const selectCritere = document.getElementById(selectId);
        if (selectCritere) {
            selectCritere.value = critere.niveauSelectionne;
            selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            console.warn(`  ⚠️ Select non trouvé pour critère ${critere.critereId}`);
        }
    });

    // ÉTAPE 10.5 : Restaurer les données algorithmiques (français écrit)
    _restaurerDonneesAlgorithmiquesModif(evaluation);
    _restaurerPointsAnalytiquesModif(evaluation);   // lot 2

    // Forcer le recalcul de la note après restauration données algorithmiques
    setTimeout(() => {
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3)
        if (typeof window.calculerNote === 'function') window.calculerNote();
    }, 200);
}

function _chargerOptionsEtRetroactionModif(evaluation) {
    // ÉTAPE 11 : Charger les options d'affichage
    // 🔧 FIX (24 fév 2026) : Les checkboxes sont toujours cochées par défaut au chargement.
    // L'utilisateur peut les décocher manuellement. cocherOptionsParDefaut() coche tout
    // ET applique la préférence de pratique pour le radio affichageNote.
    cocherOptionsParDefaut();

    // ÉTAPE 12 : Charger la rétroaction finale (anonymisation si mode Anonymisé)
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) {
        const texteRetroaction = typeof anonymiserTexteRetroaction === 'function'
            ? anonymiserTexteRetroaction(evaluation.retroactionFinale || '', evaluation.etudiantDA)
            : (evaluation.retroactionFinale || '');
        retroaction.value = texteRetroaction;
    }
    // #961 (D7) — la marque (ou la question due, R2) revient avec le texte (jumeau de la copie).
    if (typeof window.preparerRetroactionEnregistree === 'function') window.preparerRetroactionEnregistree(evaluation);
}

function _gererIndicateurEtVerrouillageModif(evaluation, estVerrouillee) {
    // ÉTAPE 13 : Afficher indicateur de mode modification
    afficherIndicateurModeModification(evaluation);

    // ÉTAPE 14 : Gérer le verrouillage
    afficherOuMasquerBoutonVerrouillage(true, estVerrouillee);
    if (estVerrouillee) {
        desactiverFormulaireEvaluation(true);
        notifications.succes('Évaluation chargée en lecture seule (verrouillée)');
    } else {
        // #926 (20 sept. 2026) — le panneau Paramètres est du HTML statique : il garde l'état du DERNIER chargement.
        // Après « Consulter » une verrouillée, « Consulter » une non verrouillée ouvrait le cadenas sur un
        // « Enregistrer » resté éteint — l'évaluation ne pouvait plus être enregistrée, donc jamais comptée.
        desactiverFormulaireEvaluation(false);
        notifications.succes('Évaluation chargée - Tu peux maintenant la modifier');
    }
}

function _afficherBoutonEditerFichierModif() {
    const btnEditer = document.getElementById('btnEditerFichierEval');
    if (!btnEditer) return;
    const fichierDispo = (typeof travauxVisionneuse !== 'undefined' && typeof travauxVisionneuse.getFichierActuel === 'function')
        ? travauxVisionneuse.getFichierActuel() : null;
    if (fichierDispo) {
        btnEditer.classList.remove('u-hide');
    } else {
        btnEditer.classList.add('u-hide');
    }
}

async function _ouvrirVueCoteACoteModif(evaluation, enModeEvaluer) {
    // ÉTAPE 17 : Seulement en standalone (pas quand le fichier est déjà dans la visionneuse en mode évaluer)
    if (enModeEvaluer || typeof travauxStockage === 'undefined' || typeof travauxUI === 'undefined') return;
    try {
        const fichierCote = (typeof travauxResolution !== 'undefined')
            ? travauxResolution.trouverFichierPourEvaluation(evaluation) : null;
        if (!fichierCote) return;
        const conteneurGrille = document.getElementById('listeCriteresGrille1')?.closest('.form-group') || document.getElementById('listeCriteresGrille1');
        if (conteneurGrille) {
            await travauxUI.ouvrirVueCoteACote(fichierCote.id, conteneurGrille);
        }
    } catch (e) {
        console.warn('⚠️ Ouverture du travail ignorée:', e.message);
    }
}

/**
 * Sauvegarde une évaluation modifiée (écrase l'ancienne)
 * Appelée à la place de sauvegarderEvaluation() si on modifie une évaluation existante
 */
// Helpers privés _Mod pour sauvegarderEvaluationModifiee (extraction étape 4 — éclatement cyc 58 → cyc ≤ 30)
// Note : helpers dupliqués depuis evaluation-sauvegarde.js _Sauv (pattern profil-etudiant —
// duplication intra-IIFE préférée à consolidation cross-IIFE qui exigerait promotion window.X).

function _lireEntreesFormulaireMod() {
    const ec = window.evaluationEnCours;
    return {
        etudiantDA: document.getElementById('selectEtudiantEval').value || (ec && ec.etudiantDA) || '',
        productionId: document.getElementById('selectProduction1').value || (ec && ec.productionId) || '',
        grilleId: document.getElementById('selectGrille1').value || (ec && ec.grilleId) || ''
    };
}

function _validerReferencesMod(etudiant, production, grille, etudiantDA, productionId, grilleId) {
    if (!etudiant) {
        notifications.erreur('Étudiant introuvable', `L'étudiant ${etudiantDA} n'existe pas dans le groupe actif.`);
        console.error('[Évaluation] ❌ Référence invalide: etudiantDA', etudiantDA);
        return false;
    }
    if (!production) {
        notifications.erreur('Production introuvable', `La production sélectionnée n'existe plus.`);
        console.error('[Évaluation] ❌ Référence invalide: productionId', productionId);
        return false;
    }
    if (!grille) {
        notifications.erreur('Grille introuvable', `La grille de critères sélectionnée n'existe plus.`);
        console.error('[Évaluation] ❌ Référence invalide: grilleId', grilleId);
        return false;
    }
    return true;
}

function _validerReferencesNonDemoMod(productionId, grilleId) {
    if (typeof BibliothequeUI === 'undefined' || !BibliothequeUI.verifierReferencesPasDemo) return true;
    const violationDemo = BibliothequeUI.verifierReferencesPasDemo([
        // T5 — la collection en nom NU : la garde la passe elle-même par cle() (getCleProductions()
        // la rendait déjà préfixée, d'où « demo_productions » passé une seconde fois à cle()).
        { id: productionId, collection: 'productions', labelType: 'production' },
        { id: grilleId, collection: 'grillesTemplates', labelType: 'grille' }
    ], { cible: cle('evaluationsSauvegardees') });   // T5 — écrire dans la démo n'est pas refusé
    if (violationDemo) {
        notifications.erreur('Référence démo non autorisée', violationDemo.message);
        return false;
    }
    return true;
}

/**
 * #674 — LA PORTE DE L'ENREGISTREMENT, côté modification : même patron que
 * `_validerReferencesMod`, même règle que `_validerPorteeSauv` (evaluation-sauvegarde.js).
 * La règle et le message vivent dans `evaluation-calcul.js` (`verifierPorteeAvantSauvegarde`).
 */
function _validerPorteeMod() {
    if (typeof window.verifierPorteeAvantSauvegarde !== 'function') return true;
    return window.verifierPorteeAvantSauvegarde();
}

function _collecterCriteresMod(grille) {
    const criteres = [];
    if (!grille || !grille.criteres) return criteres;
    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        // #941 lot S1 — sans échelle, un critère analytique n'a pas de niveau déduit : ses
        // points suffisent à le faire entrer (`niveauSelectionne` vide).
        const ptsSaisis = (evaluationEnCours.pointsAnalytiques || {})[critere.id];
        const aDesPoints = critere.type === 'analytique' && typeof ptsSaisis === 'number' && !isNaN(ptsSaisis);
        if (niveau || aDesPoints) {
            const commDiv = document.getElementById(`comm_${critere.id}`);
            const entree = {
                critereId: critere.id,
                critereNom: critere.nom,
                niveauSelectionne: niveau || '',
                retroaction: commDiv ? commDiv.textContent : '',
                ponderation: critere.ponderation || 0
            };
            // Lot 3 (4 sept. 2026) — un critère analytique entre avec ses POINTS et son
            // niveau DÉDUIT (`niveauSelectionne`, posé par `calculerNote`) : les seize
            // lecteurs de `criteres[]` voient le niveau, et le PDF de l'élève imprime
            // « points / pondération ». La source des points reste `pointsAnalytiques`.
            const pts = (evaluationEnCours.pointsAnalytiques || {})[critere.id];
            if (critere.type === 'analytique' && typeof pts === 'number' && !isNaN(pts)) entree.points = pts;
            criteres.push(entree);
        }
    });
    return criteres;
}

function _extraireProprietesJetons(evalExistante) {
    return {
        jetonRepriseCibleeApplique: evalExistante.jetonRepriseCibleeApplique,
        repriseDeIdCiblee: evalExistante.repriseDeIdCiblee,
        critereRepriseCiblee: evalExistante.critereRepriseCiblee,
        plafondNoteCiblee: evalExistante.plafondNoteCiblee,
        dateApplicationJetonRepriseCiblee: evalExistante.dateApplicationJetonRepriseCiblee,
        jetonDelaiApplique: evalExistante.jetonDelaiApplique,
        dateEcheanceOriginale: evalExistante.dateEcheanceOriginale,
        nombreJoursDelai: evalExistante.nombreJoursDelai,
        dateApplicationJetonDelai: evalExistante.dateApplicationJetonDelai,
        repriseDeId: evalExistante.repriseDeId,
        dateApplicationJetonReprise: evalExistante.dateApplicationJetonReprise,
        remplaceeParId: evalExistante.remplaceeParId,
        dateRemplacement: evalExistante.dateRemplacement,
        archivee: evalExistante.archivee,
        dateArchivage: evalExistante.dateArchivage
    };
}

function _lireChampsDOMMod(maintenant) {
    const champs = {
        echelleId: document.getElementById('selectEchelle1').value,
        cartoucheId: document.getElementById('selectCartoucheEval').value,
        dateModification: maintenant.toISOString(),
        heureModification: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        statutRemise: document.getElementById('remiseProduction1').value,
        statutIntegrite: document.getElementById('statutIntegrite').value || 'recevable',
        notesIntegrite: document.getElementById('notesIntegrite').value || '',
        // #572, quatrième site (2 sept. 2026) — LA VALEUR CALCULÉE EST LA SOURCE. Ce
        // chemin (modification d'une évaluation existante) relisait l'écran : un
        // rendu arrondi (`toFixed(1)`) redevenait la note stockée, et un affichage
        // « -- » (rendu différé, #321) écrivait 0 par-dessus une vraie note. Les deux
        // effets ont été reproduits avant correction. Même patron que les trois sœurs.
        noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,
        ponderationCouverte: (window.porteeCalculeeCourante && typeof window.porteeCalculeeCourante.ponderationCouverte === 'number') ? window.porteeCalculeeCourante.ponderationCouverte : null,   // #674 — la portée voyage avec la note
        niveauFinal: document.getElementById('niveauProduction1').textContent,
        retroactionFinale: document.getElementById('retroactionFinale1').value,
        retroactionReecrite: (typeof window.marqueRetroactionAEcrire === 'function') ? window.marqueRetroactionAEcrire() : false   // #961
    };
    // #961 R2 — question du stock sans réponse : la clé reste absente.
    if (champs.retroactionReecrite === undefined) delete champs.retroactionReecrite;
    // Lot A, R4 : notes d'intégrité masquées en anonymisation — la fusion garde celles de la base.
    if (typeof champMasqueAnonymisation === 'function'
        && champMasqueAnonymisation(document.getElementById('notesIntegrite'))) delete champs.notesIntegrite;
    return champs;
}

function _lireOptionsAffichageMod() {
    return {
        description: document.getElementById('afficherDescription1').checked,
        objectif: document.getElementById('afficherObjectif1').checked,
        tache: document.getElementById('afficherTache1').checked,
        adresse: document.getElementById('afficherAdresse1').checked,
        contexte: document.getElementById('afficherContexte1').checked,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };
}

function _appliquerProfilACOMod(evalModifiee) {
    if (typeof obtenirPreference === 'function' && obtenirPreference('activerActionsRLO') === true) {
        evalModifiee.actionsRLO = (typeof actionsRLO !== 'undefined' && actionsRLO.agregerActionsRLO)
            ? actionsRLO.agregerActionsRLO(evalModifiee)
            : null;
    }
}

function _marquerModificationJournalMod(evalModifiee, dureeMs) {
    if (typeof Journal === 'undefined') return;
    Journal.capturerFinEvaluation(evalModifiee, dureeMs);
    const jrnl = evalModifiee.journal;
    if (!jrnl || jrnl.length === 0) return;
    // Trouver la dernière entrée evaluation_fin et ajouter le flag modification
    for (let ji = jrnl.length - 1; ji >= 0; ji--) {
        if (jrnl[ji].action === Journal.ACTIONS.EVALUATION_FIN) {
            jrnl[ji].details.modification = true;
            break;
        }
    }
}

function _traiterPostRepriseMod(evaluations, indexEval, evaluationId) {
    if (!window._snapshotAvantModifRemplacee || window._snapshotAvantModifRemplacee.evalId !== evaluationId) return;
    const snapshot = window._snapshotAvantModifRemplacee;
    const apres = {
        statutIntegrite: evaluations[indexEval].statutIntegrite,
        noteFinale: evaluations[indexEval].noteFinale,
        niveauFinal: evaluations[indexEval].niveauFinal,
        criteres: (evaluations[indexEval].criteres || []).map(function(c) {
            return { critereId: c.critereId, niveau: c.niveauSelectionne };
        })
    };
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(evaluations[indexEval],
            Journal.ACTIONS.MODIFICATION_POST_REPRISE,
            { avant: snapshot.avant, apres: apres });
    }
    evaluations[indexEval].verrouillee = true;
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
    window._snapshotAvantModifRemplacee = null;
}

function _ajouterCadenasBadgesMod() {
    [
        document.querySelector('.annot-badge.actif'),
        document.querySelector('#travaux-badge-fichier-actif .annot-badge')
    ].forEach(badge => {
        if (!badge) return;
        let verrou = badge.querySelector('.travaux-badge-verrou');
        if (!verrou) {
            verrou = document.createElement('span');
            verrou.className = 'travaux-badge-verrou';
            verrou.title = 'Évaluation verrouillée';
            verrou.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
            badge.appendChild(verrou);
        }
    });
}

function _postSauvegardeMod(evalModifiee) {
    notifications.succes(messageVerrouEvaluation(evalModifiee, true));   // lot C — le seul message du geste

    if (typeof travauxUI !== 'undefined' && travauxUI.arreterChrono) {
        travauxUI.arreterChrono();
    }

    window.majBadgesApresEvaluation(evalModifiee);
    _ajouterCadenasBadgesMod();

    // L'évaluation est enregistrée ET verrouillée (verrouillee:true). On CONSERVE
    // idModification : le cadenas de la palette en a besoin pour (dé)verrouiller
    // (basculerVerrouillageEvaluationCourante), et un nouvel « Enregistrer »
    // repasse correctement par le chemin modification.
    if (window.evaluationEnCours) window.evaluationEnCours.verrouillee = true;

    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.classList.add('u-hide');

    // Refléter l'état verrouillé : cadenas FERMÉ + formulaire en lecture seule.
    // Avant, on masquait le cadenas (afficher=false), si bien qu'après une
    // sauvegarde le cadenas ouvert disparaissait sans cadenas fermé pour rouvrir.
    afficherOuMasquerBoutonVerrouillage(true, true);
    if (typeof desactiverFormulaireEvaluation === 'function') {
        desactiverFormulaireEvaluation(true);
    }

    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }
}

function sauvegarderEvaluationModifiee() {
    // Annuler le debounce auto-save (la sauvegarde manuelle prend le relais) — Patch §5.6 fix #109 (étape 4)
    if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }
    window._pendingAutoSaveSnapshot = null;

    const evaluationId = window.evaluationEnCours?.idModification;
    if (!evaluationId) {
        // Pas en mode modification, utiliser la sauvegarde normale
        window.sauvegarderEvaluation();
        return;
    }

    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const indexEval = evaluations.findIndex(e => e.id === evaluationId);
    if (indexEval === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier que l'évaluation n'est pas verrouillée
    // Exception : modification post-reprise autorisée via _snapshotAvantModifRemplacee
    if (evaluations[indexEval].verrouillee && !window._snapshotAvantModifRemplacee) {
        notifications.erreur('Évaluation verrouillée', 'Impossible de modifier une évaluation verrouillée');
        return;
    }

    const { etudiantDA, productionId, grilleId } = _lireEntreesFormulaireMod();
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === etudiantDA);
    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === productionId);
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!_validerReferencesMod(etudiant, production, grille, etudiantDA, productionId, grilleId)) return;
    if (!_validerReferencesNonDemoMod(productionId, grilleId)) return;

    // Fix #110 v3 (restauré 24 mai 2026) : forcer recalcul algo depuis le DOM
    // avant collecte, sinon donneesAlgorithmiques peut être stale.
    if (typeof window._forcerRecalculAlgorithmiqueAvantSauvegarde === 'function') {
        window._forcerRecalculAlgorithmiqueAvantSauvegarde(grille);
    }

    // #674 — après le recalcul algorithmique, avant toute collecte (cf. evaluation-sauvegarde.js).
    if (!_validerPorteeMod()) return;

    const criteres = _collecterCriteresMod(grille);
    const maintenant = new Date();
    const proprietesJetons = _extraireProprietesJetons(evaluations[indexEval]);
    const avantEcriture = evaluations[indexEval];   // lot C — rendu sur un échec (R4 du lot B)

    evaluations[indexEval] = Object.assign({},
        evaluations[indexEval], // Garder l'ID et la date originale
        {
            etudiantDA: etudiantDA,
            etudiantNom: etudiant ? `${etudiant.prenom} ${etudiant.nom}` : '',
            groupe: etudiant ? etudiant.groupe : '',
            productionId: productionId,
            productionNom: production ? (production.titre || production.nom) : '',
            grilleId: grilleId,
            grilleNom: grille ? grille.nom : '',
            criteres: criteres.concat(window.criteresHorsGrille(evaluations[indexEval], grille)),   // #652 — conservés
            optionsAffichage: _lireOptionsAffichageMod(),
            donneesAlgorithmiques: evaluationEnCours.donneesAlgorithmiques || {},
            pointsAnalytiques: evaluationEnCours.pointsAnalytiques || {},   // lot 2
            verrouillee: true
        },
        _lireChampsDOMMod(maintenant),
        proprietesJetons // Préserver toutes les propriétés de jetons en dernier
    );

    _appliquerProfilACOMod(evaluations[indexEval]);

    // Persister la durée d'évaluation (modification)
    const dureeMsModif = (typeof travauxUI !== 'undefined' && travauxUI.getDureeMs)
        ? travauxUI.getDureeMs() : null;
    if (dureeMsModif) evaluations[indexEval].dureeEvaluation = Math.round(dureeMsModif / 1000);

    _marquerModificationJournalMod(evaluations[indexEval], dureeMsModif);

    // Lot B de l'enregistrement (#618) : le message ne part que sur une écriture réelle ;
    // l'échec, c'est le témoin commun qui le dit. Lot C : ce geste est le verrouillage, et le
    // tableau lu — peut-être l'objet du cache mémoire de `db` — reprend l'évaluation d'avant :
    // l'enregistrement automatique suivant n'écrira pas un verrou que l'écran ne montre pas.
    if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations,
        { geste: 'Verrouillage de l\'évaluation' }) !== true) {
        evaluations[indexEval] = avantEcriture;
        return;
    }

    _traiterPostRepriseMod(evaluations, indexEval, evaluationId);
    _postSauvegardeMod(evaluations[indexEval]);
}

/**
 * Verrouille une évaluation individuelle (saisie de notes) pour empêcher sa modification
 * @param {string} evaluationId - ID de l'évaluation à verrouiller
 * NOTE: Fonction renommée pour éviter conflit avec verrouillerEvaluation de productions.js
 */
// ⚠ Lot C de l'enregistrement (27 sept. 2026) — SANS APPELANT VIVANT (inventaire A7) : ni bouton,
// ni data-action, ni appel. Pas branchée sur la porte unique (`basculerVerrouillageEvaluationCourante`).
function verrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = true;
    evaluations[index].dateVerrouillage = new Date().toISOString();

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    notifications.succes('Évaluation verrouillée');

}

/**
 * Déverrouille une évaluation individuelle (saisie de notes) pour permettre sa modification
 * @param {string} evaluationId - ID de l'évaluation à déverrouiller
 * NOTE: Fonction renommée pour cohérence avec verrouillerEvaluationIndividuelle
 */
// ⚠ Lot C de l'enregistrement (27 sept. 2026) — SANS APPELANT VIVANT (inventaire A7) : ni bouton,
// ni data-action, ni appel. Pas branchée sur la porte unique (`basculerVerrouillageEvaluationCourante`).
function deverrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = false;
    delete evaluations[index].dateVerrouillage;

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    notifications.succes('Évaluation déverrouillée');

}

/**
 * Affiche un indicateur visuel indiquant qu'on est en mode modification d'une évaluation
 * @param {Object} evaluation - L'évaluation en cours de modification
 */
function afficherIndicateurModeModification(evaluation) {
    // Chercher si l'indicateur existe déjà
    let indicateur = document.getElementById('indicateurModeModification');

    if (!indicateur) {
        // Créer l'indicateur
        indicateur = document.createElement('div');
        indicateur.id = 'indicateurModeModification';
        indicateur.style.cssText = `
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            padding: 15px 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 5px solid var(--orange-accent);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Insérer l'indicateur au début du formulaire d'évaluation
        const conteneurForm = document.querySelector('#evaluations-saisie .contenu');
        if (conteneurForm) {
            conteneurForm.insertBefore(indicateur, conteneurForm.firstChild);
        }
    }

    // Mettre à jour le contenu
    const dateEval = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleString('fr-CA') : 'Inconnue';
    indicateur.innerHTML = `
        <div class="u-flex-1">
            <strong>MODE MODIFICATION</strong><br>
            <span style="font-size: 0.9rem; opacity: 0.95;">
                Tu modifies l'évaluation de <strong>${echapperHtml(evaluation.etudiantNom)}</strong>
                pour <strong>${echapperHtml(evaluation.productionNom)}</strong><br>
                Évaluation initiale : ${dateEval}
            </span>
        </div>
    `;

    indicateur.classList.remove('u-hide');
}

/* #557 (28 août 2026) — `supprimerEvaluation` A ÉTÉ RETIRÉE D'ICI.
 *
 * Ce module en portait une seconde définition, sans la restauration de
 * l'originale d'une reprise (correctif du 8 juin) ni la tolérance aux
 * évaluations orphelines verrouillées (correctif du 16 mars). `evaluation.js`
 * étant chargé APRÈS `liste-evaluations.js`, c'est cette version-là qui gagnait
 * `window` : supprimer une reprise depuis le profil étudiant laissait son
 * originale « remplacée » à jamais.
 * ⮕ La définition unique vit dans `liste-evaluations.js`, et elle a absorbé les
 * deux apports de celle-ci : la garde « évaluation introuvable » et la
 * confirmation qui nomme l'étudiant·e et la production.
 * ⮕ Même mécanique que les doublons retirés par #575 (`trierListeEvaluations`,
 * `rechargerFiltreProduction`) : quand deux fichiers posent le même `window.X`,
 * c'est le dernier chargé qui gagne, en silence.
 * Les appels de ce fichier (`confirmerSuppressionEvaluationSidebar`) résolvent
 * désormais vers le global posé par `liste-evaluations.js`, chargé avant.
 */

/* ===============================
   📚 BANQUE D'ÉVALUATIONS
   Système de recherche et chargement d'évaluations
   =============================== */

/**
 * Ouvre le modal de la banque d'évaluations
 */
// ⚠ Lot C de l'enregistrement (27 sept. 2026) — LA BANQUE D'ÉVALUATIONS N'A PLUS D'ÉCRAN : la modale
// `modalBanqueEvaluations` n'existe pas dans index.html, et `ouvrirBanqueAvecRecherche` n'a aucun
// appelant. Son cadenas (`basculerVerrouillageEvaluation`) n'est donc pas branché sur la porte unique.
function ouvrirBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (!modal) return;

    // Charger les filtres
    chargerFiltresBanqueEvaluations();

    // Afficher les évaluations
    filtrerBanqueEvaluations();

    modal.classList.add('actif');
}

/**
 * Ferme le modal de la banque d'évaluations
 */
function fermerBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (modal) modal.classList.remove('actif');
}

/**
 * Charge les options de filtres
 */
function chargerFiltresBanqueEvaluations() {
    // ✅ NAMESPACING (Beta 95.5)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // Filtre étudiants
    const selectEtudiant = document.getElementById('filtreBanqueEtudiant');
    if (selectEtudiant) {
        const etudiantsAvecEval = [...new Set(evaluations.map(e => e.etudiantDA))];
        selectEtudiant.innerHTML = '<option value="">Tous les étudiant·es</option>';

        etudiantsAvecEval.forEach(da => {
            const etudiant = etudiants.find(e => e.da === da);
            if (etudiant) {
                const option = document.createElement('option');
                option.value = da;
                option.textContent = (typeof anonymiserNom === 'function' && anonymiserNom(da)) || `${etudiant.nom}, ${etudiant.prenom}`;
                selectEtudiant.appendChild(option);
            }
        });
    }

    // Filtre productions
    const selectProduction = document.getElementById('filtreBanqueProduction');
    if (selectProduction) {
        const productionsAvecEval = [...new Set(evaluations.map(e => e.productionId))];
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>';

        productionsAvecEval.forEach(id => {
            const production = productions.find(p => p.id === id);
            if (production) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = production.titre || production.nom;
                selectProduction.appendChild(option);
            }
        });
    }

    // Filtre groupes
    const selectGroupe = document.getElementById('filtreBanqueGroupe');
    if (selectGroupe) {
        const groupesAvecEval = [...new Set(evaluations.map(e => e.groupe).filter(g => g))].sort();
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';

        groupesAvecEval.forEach(groupe => {
            const option = document.createElement('option');
            option.value = groupe;
            option.textContent = groupe;
            selectGroupe.appendChild(option);
        });
    }
}

/**
 * Filtre et affiche les évaluations selon les critères sélectionnés
 */
function filtrerBanqueEvaluations() {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Récupérer les filtres dropdown
    const filtreGroupe = document.getElementById('filtreBanqueGroupe')?.value || '';
    const filtreEtudiant = document.getElementById('filtreBanqueEtudiant')?.value || '';
    const filtreProduction = document.getElementById('filtreBanqueProduction')?.value || '';
    const tri = document.getElementById('triBanqueEvaluation')?.value || 'date-desc';

    // Récupérer le terme de recherche textuelle
    const recherche = document.getElementById('recherche-banque-evaluations');
    const termeRecherche = recherche ? recherche.value.toLowerCase().trim() : '';

    // Filtrer
    let evaluationsFiltrees = evaluations.filter(evaluation => {
        // Filtres dropdown
        if (filtreGroupe && evaluation.groupe !== filtreGroupe) return false;
        if (filtreEtudiant && evaluation.etudiantDA !== filtreEtudiant) return false;
        if (filtreProduction && evaluation.productionId !== filtreProduction) return false;

        // Filtre de recherche textuelle
        if (termeRecherche) {
            const texteRecherche = [
                evaluation.etudiantNom || '',
                evaluation.etudiantDA || '',
                evaluation.productionNom || '',
                evaluation.grilleNom || '',
                evaluation.groupe || ''
            ].join(' ').toLowerCase();

            if (!texteRecherche.includes(termeRecherche)) return false;
        }

        return true;
    });

    // Trier
    evaluationsFiltrees.sort((a, b) => {
        switch (tri) {
            case 'date-desc':
                return new Date(b.dateEvaluation) - new Date(a.dateEvaluation);
            case 'date-asc':
                return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
            case 'groupe-asc':
                return (a.groupe || '').localeCompare(b.groupe || '');
            case 'etudiant-asc':
                // Trier par nom de famille (dernier mot)
                const nomA = a.etudiantNom.split(' ').pop();
                const nomB = b.etudiantNom.split(' ').pop();
                return nomA.localeCompare(nomB);
            case 'production-asc':
                return a.productionNom.localeCompare(b.productionNom);
            case 'note-desc':
                return b.noteFinale - a.noteFinale;
            case 'note-asc':
                return a.noteFinale - b.noteFinale;
            default:
                return 0;
        }
    });

    // Afficher
    afficherListeBanqueEvaluations(evaluationsFiltrees);
}

/**
 * Affiche la liste filtrée des évaluations
 */
function afficherListeBanqueEvaluations(evaluations) {
    const conteneur = document.getElementById('listeBanqueEvaluations');
    if (!conteneur) return;

    if (evaluations.length === 0) {
        conteneur.innerHTML = '<p style="text-align: center; color: var(--gris-clair); padding: 40px;">Aucune évaluation trouvée avec ces critères.</p>';
        return;
    }

    const html = evaluations.map(evaluation => {
        const dateEval = new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA');
        const heureEval = evaluation.heureEvaluation || new Date(evaluation.dateEvaluation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
        const estRemplacee = evaluation.remplaceeParId ? true : false;
        const estReprise = evaluation.repriseDeId ? true : false;
        const estDelai = evaluation.jetonDelaiApplique ? true : false;

        return `
            <div class="carte" style="margin-bottom: 15px; ${estRemplacee ? 'opacity: 0.6; border-left: 3px solid var(--gris-clair);' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="u-flex-1">
                        <h4 style="margin: 0 0 10px 0;">
                            ${echapperHtml(evaluation.etudiantNom)}
                            ${evaluation.verrouillee ? '<span style="color: var(--orange-accent); margin-left: 8px;">(Verrouillée)</span>' : ''}
                            ${estReprise ? '<span style="color: var(--violet-jeton, #9c27b0); margin-left: 8px;" title="Jeton de reprise appliqué">(Reprise)</span>' : ''}
                            ${estDelai ? '<span style="color: var(--orange-accent); margin-left: 8px;" title="Jeton de délai de remise appliqué">(Délai)</span>' : ''}
                            ${estRemplacee ? '<span style="color: var(--gris-clair); margin-left: 8px;" title="Évaluation remplacée">(Remplacée)</span>' : ''}
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: var(--gris-moyen); font-size: 0.9rem;">
                            <div><strong>Production:</strong> ${echapperHtml(evaluation.productionNom)}</div>
                            <div><strong>Grille:</strong> ${echapperHtml(evaluation.grilleNom)}</div>
                            <div><strong>Note:</strong> ${evaluation.niveauFinal} (${Math.round(evaluation.noteFinale)}%)</div>
                            <div><strong>Date:</strong> ${dateEval} à ${heureEval}</div>
                        </div>
                        ${estRemplacee ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--gris-tres-pale); border-radius: 4px; font-size: 0.85rem; color: var(--gris-moyen);">
                                Cette évaluation a été remplacée par un jeton de reprise et ne compte plus dans les indices
                            </div>
                        ` : ''}
                        ${estReprise ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--violet-pale, #f3e5f5); border-radius: 4px; font-size: 0.85rem; color: var(--violet-jeton, #7b1fa2); display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de reprise appliqué - Remplace l'évaluation précédente</span>
                                <button class="btn-jeton-retirer" data-action="retirerJeton" data-param="${evaluation.id}" data-param2="reprise"
                                        title="Retirer le jeton de reprise"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                            </div>
                        ` : ''}
                        ${estDelai ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--alerte-fond-attention); border-radius: 4px; font-size: 0.85rem; color: var(--orange-accent); display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de délai appliqué - Date limite étendue</span>
                                <button class="btn-jeton-retirer" data-action="retirerJeton" data-param="${evaluation.id}" data-param2="delai"
                                        title="Retirer le jeton de délai"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                            </div>
                        ` : ''}
                    </div>
                    <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <button class="btn btn-modifier btn-compact" data-action="chargerEvaluationDepuisBanque" data-param="${evaluation.id}">
                            Charger
                        </button>
                        <button class="btn btn-modifier btn-compact" data-action="appliquerJetonRepriseDepuisBanque" data-param="${evaluation.id}">
                            Jeton de reprise
                        </button>
                        <span data-action="basculerVerrouillageEvaluation" data-param="${evaluation.id}"
                              style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-right: 8px;"
                              title="${evaluation.verrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                            ${evaluation.verrouillee ? '<img src="icons/icon-lock.svg" alt="Verrouillée" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">'}
                        </span>
                        <button class="btn btn-supprimer btn-compact" data-action="supprimerEvaluationBanque" data-param="${evaluation.id}">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;
}

/**
 * Charge une évaluation depuis la banque dans le formulaire
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
function chargerEvaluationDepuisBanque(evaluationId) {
    // Utiliser la fonction existante modifierEvaluation
    fermerBanqueEvaluations();
    modifierEvaluation(evaluationId);
}

/**
 * Applique un jeton de reprise depuis la Banque d'évaluations
 * Crée un duplicata de l'évaluation, marque l'originale comme remplacée,
 * et charge le duplicata pour modification immédiate
 * @param {string} evaluationId - ID de l'évaluation originale
 */
async function appliquerJetonRepriseDepuisBanque(evaluationId) {
    // Utiliser le module evaluation-jetons.js pour appliquer le jeton
    if (typeof appliquerJetonReprise !== 'function') {
        notifications.erreur('Erreur', 'Module jetons non disponible');
        return;
    }

    // Appliquer le jeton (archiver l'originale par défaut)
    const nouvelleEvaluation = await appliquerJetonReprise(evaluationId, true);   // #1007 (2a-2) : async

    if (!nouvelleEvaluation) {
        // L'erreur a déjà été affichée par le module
        return;
    }

    // Fermer la banque
    if (typeof fermerBanqueEvaluations === 'function') {
        fermerBanqueEvaluations();
    }

    // Charger le duplicata pour modification immédiate
    setTimeout(() => {
        if (typeof modifierEvaluation === 'function') {
            modifierEvaluation(nouvelleEvaluation.id);
        }
    }, 500);
}

/**
 * Applique un jeton de reprise depuis la sidebar (pendant l'édition)
 * Transforme l'évaluation en cours en reprise de l'évaluation précédente
 */
/**
 * Applique un jeton de délai depuis la sidebar (pendant l'édition)
 */
function appliquerJetonDelaiDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        notifications.erreur('Erreur', 'Tu dois charger une évaluation existante pour appliquer un jeton de délai');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appliquer le jeton via le module evaluation-jetons.js
    if (typeof appliquerJetonDelai === 'function') {
        const succes = appliquerJetonDelai(evaluationId);
        if (succes) {
            // Masquer le bouton et afficher le badge
            const bouton = document.getElementById('boutonJetonDelai');
            if (bouton) bouton.classList.add('u-hide');
            window.afficherBadgesJetons();
        }
    } else {
        console.error('❌ Fonction appliquerJetonDelai non disponible');
        notifications.erreur('Erreur', 'Module jetons non disponible');
    }
}

function appliquerJetonRepriseDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        notifications.erreur('Erreur', 'Tu dois charger une évaluation existante pour appliquer un jeton de reprise');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Demander confirmation
    const confirmation = confirm(
        'Veux-tu vraiment appliquer un jeton de reprise ?\n\n' +
        'Cela va créer une nouvelle évaluation qui remplacera la précédente.\n' +
        'L\'ancienne évaluation sera archivée et ne comptera plus dans les indices.'
    );

    if (!confirmation) {
        return;
    }

    // Appliquer le jeton en utilisant la fonction existante
    appliquerJetonRepriseDepuisBanque(evaluationId);

    // Le bouton va disparaître car la nouvelle évaluation aura déjà le jeton appliqué
    const bouton = document.getElementById('boutonJetonReprise');
    if (bouton) bouton.classList.add('u-hide');
}

/**
 * Bascule le verrouillage d'une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function basculerVerrouillageEvaluation(evaluationId) {
    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Basculer le statut
    evaluations[index].verrouillee = !evaluations[index].verrouillee;
    const estVerrouillee = evaluations[index].verrouillee;

    // Sauvegarder
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    const message = estVerrouillee ? 'Évaluation verrouillée' : 'Évaluation déverrouillée';
    notifications.succes(message);

    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-${evaluationId}`);
    if (cadenasElement) {
        cadenasElement.innerHTML = estVerrouillee ? '<img src="icons/icon-lock.svg" alt="Verrouillée" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">';
        cadenasElement.title = estVerrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller';
    }

    // Rafraîchir la liste de la banque (sans reload de page)
    if (typeof filtrerBanqueEvaluations === 'function') {
        filtrerBanqueEvaluations();
    }

    // Rafraîchir le profil étudiant si affiché (sans reload de page)
    if (typeof afficherProfilComplet === 'function' && window.profilActuelDA) {
        setTimeout(() => afficherProfilComplet(window.profilActuelDA), 100);
    }
}

/**
 * Retire un jeton (reprise ou délai) d'une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @param {string} typeJeton - Type de jeton à retirer ('reprise' ou 'delai')
 */
function retirerJeton(evaluationId, typeJeton) {
    // Demander confirmation
    const typeTexte = typeJeton === 'reprise' ? 'de reprise' : 'de délai';
    const confirmation = confirm(`Veux-tu vraiment retirer ce jeton ${typeTexte} ?\n\nCette action est irréversible.`);

    if (!confirmation) {
        return; // Annulation
    }

    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const evaluation = evaluations[index];

    if (typeJeton === 'reprise') {
        // Retirer le jeton de reprise
        delete evaluation.jetonRepriseApplique;
        delete evaluation.dateApplicationJetonReprise;
        delete evaluation.repriseDeId;
        notifications.succes('Jeton de reprise retiré');
    } else if (typeJeton === 'delai') {
        // Retirer le jeton de délai
        delete evaluation.jetonDelaiApplique;
        delete evaluation.dateApplicationJetonDelai;
        delete evaluation.delaiAccorde;
        notifications.succes('Jeton de délai retiré');
    }

    // Sauvegarder
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    // Rafraîchir la liste
    filtrerBanqueEvaluations();

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/**
 * Supprime une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function supprimerEvaluationBanque(evaluationId) {
    if (!confirm('Es-tu sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    if (evaluation.verrouillee) {
        notifications.erreur('Suppression impossible', 'Déverrouillez l\'évaluation avant de la supprimer');
        return;
    }

    // Supprimer
    evaluations = evaluations.filter(e => e.id !== evaluationId);

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    notifications.succes('Évaluation supprimée');

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/**
 * Verrouille ou déverrouille toutes les évaluations
 * @param {boolean} verrouiller - true pour verrouiller, false pour déverrouiller
 */
// ⚠ Lot C de l'enregistrement (27 sept. 2026) — SANS APPELANT VIVANT (inventaire A7) : ni bouton,
// ni data-action, ni appel. Pas branchée sur la porte unique (`basculerVerrouillageEvaluationCourante`).
function verrouillerToutesEvaluations(verrouiller) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);

    if (evaluations.length === 0) {
        notifications.erreur('Aucune évaluation', 'Aucune évaluation à modifier');
        return;
    }

    const message = verrouiller
        ? 'Es-tu sûr de vouloir verrouiller TOUTES les évaluations ?'
        : 'Es-tu sûr de vouloir déverrouiller TOUTES les évaluations ?';

    if (!confirm(message)) {
        return;
    }

    // Modifier toutes les évaluations
    evaluations = evaluations.map(e => ({
        ...e,
        verrouillee: verrouiller
    }));

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    const resultat = verrouiller
        ? `${evaluations.length} évaluations verrouillées`
        : `${evaluations.length} évaluations déverrouillées`;

    notifications.succes(resultat);

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/* ===============================
   SYSTÈME DE VERROUILLAGE
   =============================== */

/**
 * Lot C de l'enregistrement (D1, Grégoire, 26 sept. 2026) — UNE SEULE PORTE POUR LE VERROU.
 * « Verrouiller l'évaluation » (le bouton du panneau Paramètres) et le cadenas (`btnVerrouPalette`,
 * en-tête de la palette ou du formulaire sans copie) appellent cette fonction, et elle seule :
 *   · évaluation non verrouillée, ou pas encore créée → `sauvegarderEvaluation`, qui fait les
 *     vérifications (références, échelle résolue #697, portée #674), crée l'évaluation au besoin
 *     et la verrouille. Le cadenas verrouillait sans rien vérifier : ce raccourci est fermé ;
 *   · évaluation verrouillée → la déverrouiller, sans vérification : elle ne compte plus dans la
 *     note jusqu'à ce qu'on la reverrouille (`evaluationEntreDansLaNote`, pratique-registre.js).
 * Les badges de la barre latérale et de la barre d'outils (`.travaux-badge-verrou`) montrent l'état
 * et ne se cliquent pas. La Liste n'a pas de cadenas. Les fonctions de la Banque et du
 * verrouillage en lot (plus bas) n'ont aucun appelant vivant : pas branchées.
 */
function basculerVerrouillageEvaluationCourante() {
    const evaluationId = window.evaluationEnCours?.idModification;

    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluationId ? evaluations.findIndex(e => e.id === evaluationId) : -1;

    // Verrouiller : la porte de l'enregistrement, avec ses vérifications. Pas d'évaluation connue
    // (copie neuve, id perdu) : elle retrouve l'existante par l'élève et la production.
    if (index === -1 || evaluations[index].verrouillee !== true) {
        window.sauvegarderEvaluation();
        return;
    }

    // Déverrouiller
    evaluations[index].verrouillee = false;
    const estVerrouillee = false;

    // Lot B de l'enregistrement (#618) : sur un échec, rien ne bascule à l'écran (cadenas,
    // formulaire, message) et le tableau lu reprend son état — il peut être l'objet du
    // cache mémoire de `db`. Le témoin commun dit l'échec.
    if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations, {
        geste: 'Déverrouillage de l\'évaluation'
    }) !== true) {
        evaluations[index].verrouillee = true;
        return;
    }

    // Mettre à jour evaluationEnCours pour refléter le changement
    if (window.evaluationEnCours) {
        window.evaluationEnCours.verrouillee = estVerrouillee;
    }

    // Mettre à jour l'icône de verrouillage
    if (typeof mettreAJourBoutonVerrouillage === 'function') {
        mettreAJourBoutonVerrouillage(estVerrouillee);
    }

    notifications.succes(messageVerrouEvaluation(evaluations[index], false));

    // Activer/désactiver tous les champs du formulaire (sans reload)
    if (typeof desactiverFormulaireEvaluation === 'function') {
        desactiverFormulaireEvaluation(estVerrouillee);
    }

    // Mettre à jour le cadenas sur le badge du fichier actuel (sans reconstruire la grille)
    const fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (fichierActuel) {
        const badge = document.querySelector(`.annot-badge[data-fichier-id="${fichierActuel.id}"]`);
        if (badge) {
            const verrouExistant = badge.querySelector('.travaux-badge-verrou');
            if (estVerrouillee && !verrouExistant) {
                // Ajouter le cadenas avant le bouton supprimer
                const btnSupp = badge.querySelector('.annot-badge-supprimer');
                const span = document.createElement('span');
                span.className = 'travaux-badge-verrou';
                span.title = 'Évaluation verrouillée';
                span.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
                if (btnSupp) badge.insertBefore(span, btnSupp);
                else badge.appendChild(span);
            } else if (!estVerrouillee && verrouExistant) {
                verrouExistant.remove();
            }
        }
    }
}

/**
 * Met à jour l'icône de verrouillage (style productions)
 */
function mettreAJourBoutonVerrouillage(estVerrouillee) {
    // Bouton cadenas dans la barre de palette Paramètres
    const btnVerrouPalette = document.getElementById('btnVerrouPalette');
    if (btnVerrouPalette) {
        btnVerrouPalette.style.display = '';
        btnVerrouPalette.innerHTML = estVerrouillee ? '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon">';
        btnVerrouPalette.title = estVerrouillee ? TITRE_CADENAS_VERROUILLE : TITRE_CADENAS_OUVERT;
        btnVerrouPalette.setAttribute('aria-label', btnVerrouPalette.title);
    }
    _libellerBoutonVerrouiller(estVerrouillee);

    // Cadenas sur les badges (sidebar actif + toolbar)
    const badgesActifs = [
        document.querySelector('.annot-badge.actif'),
        document.querySelector('#travaux-badge-fichier-actif .annot-badge')
    ];
    badgesActifs.forEach(badge => {
        if (!badge) return;
        let verrou = badge.querySelector('.travaux-badge-verrou');
        if (estVerrouillee) {
            if (!verrou) {
                verrou = document.createElement('span');
                verrou.className = 'travaux-badge-verrou';
                const pill = badge.querySelector('.travaux-badge-pill');
                if (pill) pill.after(verrou);
            }
            verrou.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
            verrou.title = 'Évaluation verrouillée';
        } else {
            if (verrou) verrou.remove();
        }
    });
}

/**
 * Affiche ou masque l'indicateur de verrouillage selon le contexte
 */
function afficherOuMasquerBoutonVerrouillage(afficher, estVerrouillee = false) {
    if (afficher) {
        mettreAJourBoutonVerrouillage(estVerrouillee);
    } else {
        // Masquer le bouton cadenas dans la barre de palette
        const btnVerrouPalette = document.getElementById('btnVerrouPalette');
        if (btnVerrouPalette) btnVerrouPalette.style.display = 'none';
        _libellerBoutonVerrouiller(false);   // lot C — copie neuve : « Verrouiller l'évaluation »
        // Retirer le cadenas des badges
        document.querySelectorAll('.travaux-badge-verrou').forEach(el => el.remove());
    }
}

/**
 * Désactive ou active les champs du formulaire d'évaluation
 */
function desactiverFormulaireEvaluation(desactiver) {

    // Désactiver les selects de paramètres principaux
    // 🔧 #355 (2 juillet 2026) : selectEtudiantEval RETIRÉ de la liste — c'est
    // de la NAVIGATION (passer à l'élève suivant·e), pas de l'édition. En
    // consultation/verrouillé, changer d'élève recharge son évaluation, qui
    // ré-applique elle-même l'état verrouillé au reste du formulaire.
    const selects = [
        'selectGroupeEval',
        'selectProduction1',
        'selectGrille1',
        'selectCartoucheEval',
        'selectEchelle1',
        'remiseProduction1',
        'statutIntegrite'  // Intégrité académique (recevabilité)
    ];

    selects.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.disabled = desactiver;
        }
    });

    // Désactiver tous les selects de critères dans listeCriteresGrille1
    const selectsCriteres = document.querySelectorAll('#listeCriteresGrille1 select');
    selectsCriteres.forEach(select => {
        select.disabled = desactiver;
    });

    // Désactiver tous les champs algorithmiques (codes d'erreurs, nombre de mots)
    const inputsAlgorithmiques = document.querySelectorAll('#listeCriteresGrille1 input[type="text"], #listeCriteresGrille1 input[type="number"]');
    inputsAlgorithmiques.forEach(input => {
        input.disabled = desactiver;
    });

    // Désactiver la zone de rétroaction finale
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) {
        retroaction.disabled = desactiver;
    }

    // Désactiver les checkboxes d'options d'affichage
    const checkboxes = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.disabled = desactiver;
    });

    // Lot C de l'enregistrement — « Verrouiller l'évaluation » n'est plus éteint sous le verrou :
    // il y devient « Déverrouiller l'évaluation » (`_libellerBoutonVerrouiller`). Toujours actif.
    const btnVerrouiller = document.getElementById('btnVerrouillerEvaluation');
    if (btnVerrouiller) btnVerrouiller.disabled = false;
}

/**
 * Lot C de l'enregistrement (D1) — les mots du verrou, proposés par Cowork le 27 sept. 2026
 * (plans de travail/CONSIGNE-DU-JOUR.md, § 3).
 */
const TITRE_CADENAS_VERROUILLE = 'Verrouillée – clique pour déverrouiller';
const TITRE_CADENAS_OUVERT = 'Non verrouillée – clique pour verrouiller';

function _libellerBoutonVerrouiller(estVerrouillee) {
    const btn = document.getElementById('btnVerrouillerEvaluation');
    if (!btn) return;
    btn.textContent = estVerrouillee ? 'Déverrouiller l\'évaluation' : 'Verrouiller l\'évaluation';
    btn.disabled = false;
}

/**
 * Lot C — « Évaluation verrouillée : ‹étudiant·e› – ‹production› », ou « déverrouillée ». Un seul
 * message par geste. En anonymisation, le nom est celui de l'anonymisation (règle du lot A).
 */
function messageVerrouEvaluation(evaluation, verrouillee) {
    const ev = evaluation || {};
    const anonyme = typeof estModeAnonymisation === 'function' && estModeAnonymisation();
    const nom = anonyme
        ? ((typeof anonymiserNom === 'function' && anonymiserNom(ev.etudiantDA)) || '---')
        : (ev.etudiantNom || '');
    return (verrouillee ? 'Évaluation verrouillée : ' : 'Évaluation déverrouillée : ')
        + nom + ' – ' + (ev.productionNom || '');
}

/**
 * Ouvre la banque d'évaluations avec le terme de recherche pré-rempli
 */
function ouvrirBanqueAvecRecherche() {
    // Récupérer le terme de recherche rapide
    const rechercheRapide = document.getElementById('recherche-rapide-evaluation');
    const terme = rechercheRapide ? rechercheRapide.value : '';

    // Ouvrir la banque
    ouvrirBanqueEvaluations();

    // Transférer le terme dans le champ de recherche de la banque
    setTimeout(() => {
        const rechercheBanque = document.getElementById('recherche-banque-evaluations');
        if (rechercheBanque) {
            rechercheBanque.value = terme;
            rechercheBanque.focus();
            // Appliquer le filtre si un terme est présent
            if (terme.trim()) {
                filtrerBanqueEvaluations();
            }
        }
    }, 100);
}

/**
 * Ouvre le profil de l'étudiant depuis le formulaire d'évaluation
 */
function ouvrirProfilDepuisEvaluation() {
    const etudiantDA = document.getElementById('selectEtudiantEval').value;

    if (!etudiantDA) {
        alert('Sélectionne un·e étudiant·e');
        return;
    }

    // Naviguer vers la section Suivi > Profil
    afficherSection('suivi');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Afficher la sous-section profil
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('suivi-profil');
        }

        // Attendre un peu puis charger le profil de l'étudiant
        setTimeout(() => {
            if (typeof afficherProfilComplet === 'function') {
                afficherProfilComplet(etudiantDA);

                // Attendre que le profil soit généré, puis scroller vers la section Productions
                setTimeout(() => {
                    const sectionProductions = document.querySelector('#contenuProfilEtudiant h3:contains("Productions")');
                    if (sectionProductions) {
                        sectionProductions.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        // Fallback: chercher par texte
                        const allH3 = document.querySelectorAll('#contenuProfilEtudiant h3');
                        for (let h3 of allH3) {
                            if (h3.textContent.includes('Productions')) {
                                h3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                break;
                            }
                        }
                    }
                }, 300);
            } else {
                console.error('❌ Fonction afficherProfilComplet non disponible');
            }
        }, 100);
    }, 200);
}

/**
 * #1010 (4 oct. 2026) — LE SIGNAL AU DÉBUT DE L'ÉVALUATION.
 *
 * Décision de Grégoire (1er oct.) : quand la case « Consignes transmises » d'une
 * production est décochée pour le groupe de l'élève et qu'il commence à évaluer,
 * l'application le lui signale. Un constat, pas un blocage ; pas de coche
 * automatique. Le bandeau paraît à CHAQUE ouverture tant que la case est décochée
 * (aucune mémoire « déjà vu » : tant qu'elle l'est, c'est vrai) et part dès qu'elle
 * est cochée.
 *
 * ▣ UN SEUL POINT D'APPEL : `travauxUI.ecrireLabelsIdentite`, l'en-tête élève /
 * production de l'écran. Mesuré le 4 oct. : tous les chemins qui ouvrent une
 * évaluation l'écrivent — la copie ouverte en mode Évaluer (première ouverture et
 * retour), la copie changée dans la visionneuse, la réassignation, le formulaire
 * sans copie (`_evaluerSansCopie`, « Évaluer » de la Liste), `modifierEvaluation`,
 * et les flèches élève précédent / suivant.
 *
 * ▣ UNE SEULE LECTURE : `obtenirEcheanceEffective` (`assignee !== false`), sur le
 * groupe-cours de l'ÉLÈVE (`groupeCoursIdDeLEleve`, celui de la synthèse), pas du
 * contexte affiché. Le bandeau ne nomme personne ; le titre passe par `textContent`.
 */
function mettreAJourSignalConsignes(etudiantDA, productionId) {
    const bandeau = document.getElementById('travaux-eval-signal-consignes');
    if (!bandeau) return;
    const masquer = () => {
        bandeau.classList.add('u-hide');
        delete bandeau.dataset.productionId;
        delete bandeau.dataset.gcId;
        delete bandeau.dataset.da;
    };
    if (!etudiantDA || !productionId || typeof obtenirEcheanceEffective !== 'function') return masquer();

    const production = (obtenirDonneesSelonMode('productions') || []).find(p => p && p.id === productionId);
    const synthese = window.syntheseRetroactionData;
    const gcId = (synthese && typeof synthese.groupeCoursIdDeLEleve === 'function')
        ? synthese.groupeCoursIdDeLEleve(etudiantDA) : null;
    if (!production || !gcId || obtenirEcheanceEffective(production, gcId).assignee !== false) return masquer();

    const titre = production.titre || production.nom || '';
    document.getElementById('travaux-eval-signal-consignes-texte').textContent =
        `Les consignes de «\u00a0${titre}\u00a0» ne semblent pas avoir été transmises à ce groupe\u00a0: ` +
        'la case «\u00a0Consignes transmises\u00a0» est décochée. Tant qu\u2019elle l\u2019est, cette production ' +
        'n\u2019apparaît pas au calendrier et ses copies ne comptent pas dans les courbes de progression.';
    bandeau.dataset.productionId = productionId;
    bandeau.dataset.gcId = gcId;
    bandeau.dataset.da = etudiantDA;
    bandeau.classList.remove('u-hide');
}

/** Le bouton du bandeau #1010 : coche la case pour ce groupe-cours, sur ce clic seulement. */
async function cocherConsignesDepuisEvaluation() {
    const bandeau = document.getElementById('travaux-eval-signal-consignes');
    if (!bandeau || !bandeau.dataset.productionId) return;
    const { productionId, gcId, da } = bandeau.dataset;
    const ecrit = await marquerConsignesTransmises(productionId, gcId);
    if (ecrit) mettreAJourSignalConsignes(da, productionId);
}

/**
 * Ouvre le travail de l'etudiant en vue cote-a-cote depuis l'evaluation
 * 🆕 BETA 96.3 : Integration module Travaux
 */
function ouvrirTravailDepuisEvaluation() {
    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    if (!etudiantDA) {
        alert('Sélectionne un·e étudiant·e');
        return;
    }

    if (typeof travauxStockage === 'undefined') {
        console.warn('[Evaluation] Module Travaux non disponible');
        return;
    }

    // Trouver le fichier associé via résolution centralisée
    let fichierTrouve = null;
    if (typeof travauxResolution !== 'undefined' && productionId) {
        fichierTrouve = travauxResolution.trouverFichierPourEvaluation({ etudiantDA, productionId });
    }
    // Fallback : recherche directe si la résolution centralisée échoue
    if (!fichierTrouve) {
        let fichiers = travauxStockage.obtenirFichiersEtudiant(etudiantDA);
        if (productionId) {
            fichiers = fichiers.filter(f => f.productionId === productionId);
        }
        if (fichiers.length > 0) fichierTrouve = fichiers[0];
    }

    if (!fichierTrouve) {
        alert('Aucun travail trouvé pour cet·te étudiant·e');
        return;
    }

    const fichierId = fichierTrouve.id;
    const conteneurGrille = document.getElementById('listeCriteresGrille1')?.closest('.form-group') || document.getElementById('listeCriteresGrille1');

    if (conteneurGrille && typeof travauxUI !== 'undefined') {
        travauxUI.ouvrirVueCoteACote(fichierId, conteneurGrille);
    }
}

/**
 * Met a jour la visibilite du bouton "Voir le travail"
 * Appele quand l'etudiant ou la production change
 * 🆕 BETA 96.3
 */
function mettreAJourBoutonVoirTravail() {
    const btn = document.getElementById('btnVoirTravailDepuisEval');
    if (!btn) return;

    if (typeof travauxStockage === 'undefined') {
        btn.classList.add('u-hide');
        return;
    }

    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    if (!etudiantDA) {
        btn.classList.add('u-hide');
        return;
    }

    let fichiers = travauxStockage.obtenirFichiersEtudiant(etudiantDA);
    if (productionId) {
        fichiers = fichiers.filter(f => f.productionId === productionId);
    }

    toggleDisplay(btn, fichiers.length > 0);
}

// Exporter les fonctions
// window.filtrerListeEvaluations = filtrerListeEvaluations; // DÉSACTIVÉ : Géré par liste-evaluations.js
window.filtrerBanqueEvaluations = filtrerBanqueEvaluations;
window.ouvrirBanqueAvecRecherche = ouvrirBanqueAvecRecherche;
window.modifierEvaluationParId = modifierEvaluation; // Export sous un nom différent pour éviter conflit avec liste-evaluations.js
window._attendreSaisiePremierCritereModif = _attendreSaisiePremierCritereModif;   // retouche du 4 sept. 2026 — exposée pour les bancs
window.ouvrirProfilDepuisEvaluation = ouvrirProfilDepuisEvaluation;
window.ouvrirTravailDepuisEvaluation = ouvrirTravailDepuisEvaluation;
window.mettreAJourBoutonVoirTravail = mettreAJourBoutonVoirTravail;

// ============================================
// FONCTIONS POUR JETONS PERSONNALISÉS
// ============================================

// #560 (29 août 2026) — `afficherJetonsPersonnalisesEvaluation` et
// `appliquerJetonPersonnalise` sont RETIRÉES : sans appelant, sans `data-action`,
// sans conteneur `jetonsPersonnalisesOptions` nulle part — mortes depuis juin.
// C'était pourtant le seul site des trois de l'audit qui LISAIT par
// `obtenirDonneesSelonMode` et ÉCRIVAIT en direct : un corpus de simulation
// aurait pu être reversé dans la clé réelle. Du code mort ne se corrige pas,
// il se retire.

/**
 * Confirme et supprime l'évaluation en cours depuis le sidebar
 */
function confirmerSuppressionEvaluationSidebar() {
    if (!window.evaluationEnCours?.idModification) {
        notifications.erreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appeler la fonction existante de suppression (qui inclut déjà la confirmation)
    supprimerEvaluation(evaluationId);

    // Si la suppression réussit, réinitialiser le formulaire
    setTimeout(() => {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const evalExiste = evaluations.find(e => e.id === evaluationId);

        if (!evalExiste) {
            // L'évaluation a été supprimée, réinitialiser le formulaire
            nouvelleEvaluation();
        }
    }, 100);
}

// Écouter les changements de mode pour régénérer la rétroaction avec les noms anonymisés/réels
window.addEventListener('modeChanged', (event) => {

    // Si une évaluation est en cours et que la checkbox d'adresse est cochée, régénérer la rétroaction
    if (window.evaluationEnCours && document.getElementById('afficherAdresse1')?.checked) {
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
    }
});

/**
 * Copie du texte en format TSV (Tab-Separated Values)
 * Utilise l'API Clipboard moderne avec le bon MIME type
 */
async function copierEnFormatTSV(texte) {
    try {
        const blob = new Blob([texte], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/plain': blob
        });
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie TSV:', err);
        return false;
    }
}

/**
 * Copie les 4 premiers critères (SRPN) dans le presse-papiers
 */
async function copierCriteresSRPN() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        notifications.erreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Extraire les 4 premiers critères (SRPN) avec tabulations
    const texte = element.textContent.trim();
    const criteres = texte.split('\t');
    const srpn = criteres.slice(0, 4).join('\t');

    // Copier en format TSV
    const succes = await copierEnFormatTSV(srpn);
    if (succes) {
        notifications.succes('Copié', 'SRPN copiés dans le presse-papiers');
    } else {
        notifications.erreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

/**
 * Copie les 5 critères (SRPNF) dans le presse-papiers
 */
async function copierCriteresSRPNF() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        notifications.erreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Copier tous les critères avec tabulations
    const texte = element.textContent.trim();

    // Copier en format TSV
    const succes = await copierEnFormatTSV(texte);
    if (succes) {
        notifications.succes('Copié', 'SRPNF copiés dans le presse-papiers');
    } else {
        notifications.erreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

// Exporter les fonctions
window.confirmerSuppressionEvaluationSidebar = confirmerSuppressionEvaluationSidebar;
window.reinitialiserFormulaire = reinitialiserFormulaire;
window.copierCriteresSRPN = copierCriteresSRPN;
window.copierCriteresSRPNF = copierCriteresSRPNF;

// Exports requis pour le mode evaluation depuis la visionneuse (travaux-ui.js)
window.changerEchelleEvaluation = changerEchelleEvaluation;
window.basculerVerrouillageEvaluationCourante = basculerVerrouillageEvaluationCourante;
window.messageVerrouEvaluation = messageVerrouEvaluation;   // lot C — evaluation-sauvegarde.js
window.nouvelleEvaluation = nouvelleEvaluation;

// Promotion §5.6 (session B 3e sous-module) — sauvegarderEvaluationModifiee
// reste résidu mais est appelée depuis evaluation-sauvegarde.js (2 sites internes).
window.sauvegarderEvaluationModifiee = sauvegarderEvaluationModifiee;

// Phase 5 — fonctions utilisées par data-action / data-on-change
window.modifierEvaluation = modifierEvaluation;
// #557 : `window.supprimerEvaluation` n'est plus posé ici — la définition unique
// est dans `liste-evaluations.js`, chargé avant. Réexporter depuis ce fichier
// écrasait la version corrigée par la version incomplète, en silence.
window.basculerVerrouillageEvaluation = basculerVerrouillageEvaluation;
window.chargerEvaluationDepuisBanque = chargerEvaluationDepuisBanque;
window.appliquerJetonRepriseDepuisBanque = appliquerJetonRepriseDepuisBanque;
window.supprimerEvaluationBanque = supprimerEvaluationBanque;
window.evaluerProduction = evaluerProduction;
window.naviguerEtudiantPrecedent = naviguerEtudiantPrecedent;
window.naviguerEtudiantSuivant = naviguerEtudiantSuivant;
window.mettreAJourNavigationSansCopie = mettreAJourNavigationSansCopie;
window.retirerJeton = retirerJeton;
window.mettreAJourSignalConsignes = mettreAJourSignalConsignes;     // #1010 : appelé par travauxUI.ecrireLabelsIdentite
window.cocherConsignesDepuisEvaluation = cocherConsignesDepuisEvaluation;

// Exports manqués lors de l'extraction de evaluation-chargement.js et autres
// sous-modules (refactor évaluation 18-21 mai 2026). Sans ces exports, les
// fonctions définies ici déclenchent ReferenceError ou échec silencieux quand
// appelées depuis evaluation-chargement.js, evaluation-calcul.js,
// evaluation-retroaction.js, evaluation-sauvegarde.js, modes.js, travaux-ui.js,
// liste-evaluations.js. Bug rapporté 21 mai 2026 (rien ne s'affiche au clic) :
// verifierEtChargerEvaluationExistante crashait au changement d'étudiant ou de
// production → l'éval existante n'était jamais pré-chargée.
window.verifierEtChargerEvaluationExistante = verifierEtChargerEvaluationExistante;
window.desactiverFormulaireEvaluation = desactiverFormulaireEvaluation;
window.appliquerJetonDelaiDepuisSidebar = appliquerJetonDelaiDepuisSidebar;
window.attacherEvenementsMemorisation = attacherEvenementsMemorisation;
window.cocherOptionsParDefaut = cocherOptionsParDefaut;
window.memoriserSelectionsEvaluation = memoriserSelectionsEvaluation;
window.obtenirNomCartouche = obtenirNomCartouche;
window.sauvegarderSelectionsEvaluation = sauvegarderSelectionsEvaluation;
// Exposé pour révéler le cadenas de (dé)verrouillage depuis le module de
// sauvegarde (evaluation-sauvegarde.js) après une première sauvegarde.
window.afficherOuMasquerBoutonVerrouillage = afficherOuMasquerBoutonVerrouillage;

})();
