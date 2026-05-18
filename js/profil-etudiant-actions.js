/**
 * profil-etudiant-actions.js
 *
 * Sous-module extrait de profil-etudiant.js (session C refactor, 18 mai 2026).
 *
 * Périmètre : zone HIGH partie 1 — orchestrateur cascade `consulterEvaluation`
 * (multi-timeouts T+200/500/300ms avec race guard `window._consulterEvalTimerId`
 * et callback `window._apresOuvertureFichier`), CRUD évaluations, calcul détails
 * note finale, jetons personnalisés, patterns de groupe (Beta 91).
 *
 * 8 fonctions, 8 exports window.X.
 *
 * Cyc > 30 hérité : `calculerDetailsNoteFinale` 57 (à éclater étape 4 session D).
 *
 * Timers cascade globaux préservés (`window._consulterEvalTimerId`,
 * `window._apresOuvertureFichier`) — atomicité critique pour les clics rapides.
 *
 * Consommé par d'autres modules (4 exports critiques) :
 * - consulterEvaluation : evaluation.js, travaux-ui.js
 * - evaluerProduction : evaluation.js, liste-evaluations.js
 * - calculerDetailsNoteFinale : portfolio.js, synthese-retroaction-data.js (FIX #37 Beta 96)
 * - calculerEtStockerPatternsGroupe + obtenirPatternEtudiant : tableau-bord-apercu.js
 *
 * @see SESSION.md — Récap session C
 * @see audit/refactoring-prep/MODULES-MAP.md §2.3
 */
(function () {
    'use strict';

// ============================================
// FONCTIONS HELPER POUR SECTION PRODUCTIONS
// ============================================

/**
 * Consulte une évaluation existante (ouvre le fichier dans la visionneuse en mode évaluer)
 */
function consulterEvaluation(da, productionId) {
    // 🔧 FIX (6 mars 2026) : Annuler tout timer d'ouverture précédent (même protection
    // que consulterEvaluationDepuisListe pour éviter les courses sur clics rapides)
    if (window._consulterEvalTimerId) {
        clearTimeout(window._consulterEvalTimerId);
        window._consulterEvalTimerId = null;
    }
    window._apresOuvertureFichier = null;

    // Trouver l'évaluation (résolution centralisée + fallback)
    let evaluation = null;
    if (typeof travauxResolution !== 'undefined') {
        evaluation = travauxResolution.trouverEvaluationPourFichier({ id: null, etudiantDA: da, productionId });
    }
    if (!evaluation) {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        evaluation = evaluations.find(e => e.etudiantDA === da && e.productionId === productionId && !e.remplaceeParId);
    }

    if (!evaluation) {
        alert('Évaluation non trouvée');
        return;
    }

    // Trouver le fichier importé (résolution centralisée)
    let fichierId = null;
    if (typeof travauxResolution !== 'undefined') {
        const fichierTrouve = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (fichierTrouve) fichierId = fichierTrouve.id;
    }

    // Naviguer vers la section Évaluations d'abord (on vient du profil étudiant)
    afficherSection('evaluations');

    if (fichierId && typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
        // Mettre le filtre production sur la bonne production AVANT d'ouvrir le fichier
        if (productionId) {
            sessionStorage.setItem('travaux-filtre-production', productionId);
        }
        // Workflow visionneuse : naviguer vers Annoter, attendre l'init du module,
        // puis ouvrir le fichier. Le callback _apresOuvertureFichier est appelé
        // par ouvrirFichier APRÈS que le fichier soit complètement chargé dans le canvas.
        window._apresOuvertureFichier = function() {
            // Basculer en mode évaluer (affiche les palettes eval par-dessus le canvas)
            if (typeof travauxUI.basculerMode === 'function') {
                travauxUI.basculerMode('evaluer');
            }
            // Charger l'évaluation sauvegardée dans le formulaire
            setTimeout(function() {
                if (typeof window.modifierEvaluationParId === 'function') {
                    window.modifierEvaluationParId(evaluation.id);
                }
            }, 200);
        };
        // Naviguer vers evaluations-annoter (déclenche initialiserModuleTravaux à +100ms)
        afficherSousSection('evaluations-annoter');
        // Attendre que initialiserModuleTravaux soit terminé (+300ms de marge),
        // puis ouvrir le fichier dans la visionneuse
        window._consulterEvalTimerId = setTimeout(function() {
            window._consulterEvalTimerId = null;
            // Synchroniser le dropdown filtre avec la production cible
            // 🔧 FIX (5 mars 2026) : Synchroniser le dropdown SANS passer le select
            // en argument — passer le select déclenche l'auto-navigation (estChangementManuel)
            // qui ouvre un fichier parasite AVANT ouvrirFichier(fichierId), créant une course.
            const selectFiltre = document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (selectFiltre && productionId) {
                selectFiltre.value = productionId;
                if (typeof travauxUI.filtrerBadgesParProduction === 'function') {
                    travauxUI.filtrerBadgesParProduction();
                }
            }
            travauxUI.ouvrirFichier(fichierId);
        }, 500);
    } else {
        // Fallback : pas de fichier importé, ouvrir le formulaire en standalone
        setTimeout(function() {
            if (typeof window.modifierEvaluationParId === 'function') {
                window.modifierEvaluationParId(evaluation.id);
            }
        }, 300);
    }
}

/**
 * Évalue une production (ouvre le formulaire d'évaluation pour création)
 */
function evaluerProduction(da, productionId) {
    // Naviguer vers Évaluations avec préselection de l'élève et de la production
    afficherSection('evaluations');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Présélectionner l'élève dans le formulaire
        const selectEleve = document.getElementById('select-eleve-evaluation');
        if (selectEleve) {
            selectEleve.value = da;
            if (typeof selectEleve.onchange === 'function') {
                selectEleve.onchange();
            }
        }

        // Présélectionner la production
        setTimeout(() => {
            const selectProduction = document.getElementById('select-production-evaluation');
            if (selectProduction) {
                selectProduction.value = productionId;
                if (typeof selectProduction.onchange === 'function') {
                    selectProduction.onchange();
                }
            }
        }, 100);
    }, 200);
}

/**
 * Supprime une évaluation depuis le profil élève
 */
function supprimerEvaluationDepuisProfil(evaluationId) {
    // Appeler la fonction de suppression du module liste-evaluations.js
    if (typeof supprimerEvaluation === 'function') {
        supprimerEvaluation(evaluationId);

        // Recharger la section Productions après suppression
        setTimeout(() => {
            if (profilActuelDA) {
                changerSectionProfil('productions');
            }
        }, 500);
    } else {
        alert('Fonction de suppression non disponible');
    }
}

/**
 * Calcule les détails de la note finale de session pour un étudiant (pratique PAN-Standards)
 * Retourne les informations nécessaires pour afficher la construction de la note
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Détails de la note finale ou null si pas de données
 */
function calculerDetailsNoteFinale(da) {
    const modalites = db.getSync('modalitesEvaluation', {});
    const pratique = modalites.pratique || 'pan-maitrise';

    // Pour l'instant, on gère seulement PAN-Standards (accepter toutes les variantes qui contiennent "pan")
    const pratiqueLower = pratique.toLowerCase();
    if (!pratiqueLower.includes('pan') && pratiqueLower !== 'alternative') {
        return null;
    }

    // Source de vérité : pratiquesConfigurables, fallback sur modalitesEvaluation
    const configPratiqueActiveNote = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configPAN = modalites.configPAN || {};
    const configPortfolio = configPratiqueActiveNote?.portfolio || configPAN.portfolio || {};
    const nombreARetenir = configPortfolio.nombreARetenir || 4;
    const minimumRequis = configPortfolio.minimumCompletion || 7;
    let methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    if (methodeSelection === 'derniers') methodeSelection = 'recents';
    const reglesConformite = configPortfolio.reglesConformite || configPAN.portfolio?.reglesConformite || { actif: false };

    // Détecter Hybride : catégories actives dans pratiquesConfigurables
    const configCategoriesNote = configPratiqueActiveNote?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybrideNote = !!(configCategoriesNote && configCategoriesNote.actif);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Trouver la production portfolio (conteneur)
    const productionPortfolio = productions.find(p => p.type === 'portfolio');

    // Trouver la production terminale EN PREMIER (pour l'exclure des artefacts)
    // La production terminale est celle qui :
    // 1. A un type contenant 'terminal' ou 'examen' ou 'final'
    // 2. OU a un titre/description contenant 'terminal' ou 'finale'
    // 3. OU a une pondération > 0 (et n'est pas portfolio)
    const productionTerminale = productions.find(p => {
        // Exclure portfolio et artefacts explicites
        if (p.type === 'portfolio' || p.type === 'artefact-portfolio') return false;

        // Chercher par type explicite
        const typeLC = (p.type || '').toLowerCase();
        if (typeLC.includes('terminal') || typeLC.includes('examen') || typeLC.includes('final')) {
            return true;
        }

        // Chercher par titre/description
        const titreLC = (p.titre || '').toLowerCase();
        const descLC = (p.description || '').toLowerCase();
        if (titreLC.includes('terminal') || titreLC.includes('finale') ||
            descLC.includes('terminal') || descLC.includes('finale')) {
            return true;
        }

        // Sinon, prendre la première production avec pondération > 0
        return p.ponderation > 0;
    });

    // ID de la production terminale (pour l'exclure des artefacts)
    const terminalId = productionTerminale?.id || null;

    // Trouver les artefacts portfolio (type 'artefact-portfolio')
    // EXCLURE la production terminale
    let artefactsIds = productions
        .filter(p => p.type === 'artefact-portfolio' && p.id !== terminalId)
        .map(p => p.id);

    // Si pas d'artefacts explicites, chercher toutes les productions à pondération 0
    // qui ne sont pas le portfolio conteneur NI la production terminale
    if (artefactsIds.length === 0) {
        artefactsIds = productions
            .filter(p =>
                p.type !== 'portfolio' &&
                p.id !== terminalId &&
                (p.ponderation === 0 || p.ponderation === undefined || p.ponderation === null)
            )
            .map(p => p.id);
    }

    // Filtrer les évaluations de l'étudiant sur les artefacts
    // EXCLURE : évaluation terminale, remplacées, non-recevables (plagiat, IA)
    const evaluationsArtefacts = evaluations.filter(e => {
        if (e.etudiantDA !== da) return false;
        if (!artefactsIds.includes(e.productionId)) return false;
        if (e.productionId === terminalId) return false;
        if (e.remplaceeParId) return false;
        if (e.noteFinale === null || e.noteFinale === undefined) return false;

        // Exclure les évaluations non-recevables (plagiat, IA)
        const statutIntegrite = e.statutIntegrite || 'recevable';
        if (statutIntegrite === 'plagiat' || statutIntegrite === 'ia') return false;

        return true;
    });

    // Sélectionner les artefacts selon la méthode
    let artefactsRetenus = [...evaluationsArtefacts];
    let moyennePortfolio = null;

    // Helper: obtenir le numéro de production pour une évaluation
    const getNumeroProduction = (ev) => {
        const prod = productions.find(p => p.id === ev.productionId);
        return prod?.numero || parseInt(ev.productionId.match(/(\d+)$/)?.[1]) || 0;
    };

    if (modeHybrideNote) {
        // MODE HYBRIDE : N meilleures Sélection (pondérées) + Obligatoires (pondérées)
        const { nombreARetenir: nSelection, ponderation: pondSel } = configCategoriesNote.selection || { nombreARetenir: 4, ponderation: 65 };
        const { ponderation: pondObl } = configCategoriesNote.obligatoires || { ponderation: 35 };
        const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');

        const evalsSelection = evaluationsArtefacts.filter(ev => {
            const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
            return prod && prod.categorie === 'selection';
        });
        const evalsObligatoires = evaluationsArtefacts.filter(ev => {
            const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
            return prod && prod.categorie === 'obligatoire';
        });

        // N meilleures du pool Sélection
        const meilleuresSelection = [...evalsSelection]
            .sort((a, b) => (b.noteFinale || 0) - (a.noteFinale || 0))
            .slice(0, nSelection);

        artefactsRetenus = [...meilleuresSelection, ...evalsObligatoires];

        // Moyenne pondérée Hybride
        if (meilleuresSelection.length > 0 || evalsObligatoires.length > 0) {
            const moySel = meilleuresSelection.length > 0
                ? meilleuresSelection.reduce((s, e) => s + e.noteFinale, 0) / meilleuresSelection.length : 0;
            const moyObl = evalsObligatoires.length > 0
                ? evalsObligatoires.reduce((s, e) => s + e.noteFinale, 0) / evalsObligatoires.length : 0;

            if (meilleuresSelection.length > 0 && evalsObligatoires.length > 0) {
                moyennePortfolio = (moySel * pondSel + moyObl * pondObl) / (pondSel + pondObl);
            } else if (meilleuresSelection.length > 0) {
                moyennePortfolio = moySel;
            } else {
                moyennePortfolio = moyObl;
            }
        }
    } else {
        // Méthodes legacy : meilleurs, recents, recents-meilleurs, tous
        if (methodeSelection === 'meilleurs' || methodeSelection === 'hybride') {
            artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
        } else if (methodeSelection === 'recents') {
            artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
        } else if (methodeSelection === 'recents-meilleurs') {
            const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRetenus.length * 0.5));
            artefactsRetenus.sort((a, b) => b.noteFinale - a.noteFinale);
            artefactsRetenus = artefactsRetenus.slice(0, nombreMeilleurs);
            artefactsRetenus.sort((a, b) => getNumeroProduction(b) - getNumeroProduction(a));
        }

        artefactsRetenus = artefactsRetenus.slice(0, nombreARetenir);

        if (artefactsRetenus.length > 0) {
            const somme = artefactsRetenus.reduce((acc, e) => acc + e.noteFinale, 0);
            moyennePortfolio = somme / artefactsRetenus.length;
        }
    }

    // ========================================
    // RÈGLES DE CONFORMITÉ - Plafonnement
    // ========================================
    let plafonnement = null;
    const nombreEvalues = evaluationsArtefacts.length;
    const deficit = minimumRequis - nombreEvalues;

    if (reglesConformite.actif && deficit > 0 && moyennePortfolio !== null) {

        // Trouver le plafond applicable selon le déficit
        const plafonds = reglesConformite.plafonds || [];
        let plafondApplicable = null;

        if (deficit >= 3) {
            // Déficit 3+
            plafondApplicable = plafonds.find(p => p.deficit === 3);
        } else {
            // Déficit 1 ou 2
            plafondApplicable = plafonds.find(p => p.deficit === deficit);
        }

        if (plafondApplicable) {
            if (plafondApplicable.echec) {
                // Échec automatique
                plafonnement = {
                    actif: true,
                    deficit: deficit,
                    niveauCode: null,
                    seuilMax: 0,
                    echec: true,
                    moyenneOriginale: moyennePortfolio
                };
                moyennePortfolio = 0;
            } else if (plafondApplicable.seuilMax !== null && moyennePortfolio > plafondApplicable.seuilMax) {
                // Plafonnement au niveau
                plafonnement = {
                    actif: true,
                    deficit: deficit,
                    niveauCode: plafondApplicable.niveauCode,
                    seuilMax: plafondApplicable.seuilMax,
                    echec: false,
                    moyenneOriginale: moyennePortfolio
                };
                moyennePortfolio = plafondApplicable.seuilMax;
            }
        }
    }

    // Pondérations
    const ponderationPortfolio = productionPortfolio?.ponderation || 60;
    const ponderationTerminale = productionTerminale?.ponderation || 40;
    const totalPonderation = ponderationPortfolio + ponderationTerminale;

    // Trouver l'évaluation terminale de l'étudiant
    let noteTerminale = null;
    let evaluationTerminale = null;
    if (productionTerminale) {
        evaluationTerminale = evaluations.find(e =>
            e.etudiantDA === da &&
            e.productionId === productionTerminale.id &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );
        if (evaluationTerminale) {
            noteTerminale = evaluationTerminale.noteFinale;
        }
    }

    // Calculer la note finale pondérée
    let noteFinale = null;
    if (moyennePortfolio !== null) {
        if (noteTerminale !== null) {
            // Les deux composantes sont disponibles
            noteFinale = (
                (moyennePortfolio * ponderationPortfolio / totalPonderation) +
                (noteTerminale * ponderationTerminale / totalPonderation)
            );
        } else {
            // Seulement le portfolio (provisoire)
            noteFinale = moyennePortfolio;
        }
    }

    // Méthode de sélection en français
    const methodesLabels = {
        'meilleurs': 'meilleurs',
        'recents': 'plus récents',
        'recents-meilleurs': 'récents parmi les meilleurs',
        'tous': 'tous',
        'hybride': 'hybride (catégories)'
    };
    // Si Hybride actif, forcer le label
    if (modeHybrideNote) methodeSelection = 'hybride';

    return {
        pratique: 'PAN-Standards',
        portfolio: {
            nombreARetenir: nombreARetenir,
            nombreEvalues: evaluationsArtefacts.length,
            nombreRetenus: artefactsRetenus.length,
            minimumRequis: minimumRequis,
            methodeSelection: methodesLabels[methodeSelection] || methodeSelection,
            moyenne: moyennePortfolio,
            ponderation: ponderationPortfolio,
            ponderationNormalisee: (ponderationPortfolio / totalPonderation * 100).toFixed(0),
            artefactsRetenus: artefactsRetenus.map(e => ({
                productionId: e.productionId,
                note: e.noteFinale,
                niveau: e.niveauFinal
            })),
            plafonnement: plafonnement
        },
        terminal: {
            nom: productionTerminale?.titre || productionTerminale?.activiteApprentissage || productionTerminale?.description || 'Évaluation terminale',
            note: noteTerminale,
            niveau: evaluationTerminale?.niveauFinal || null,
            ponderation: ponderationTerminale,
            ponderationNormalisee: (ponderationTerminale / totalPonderation * 100).toFixed(0)
        },
        noteFinale: noteFinale,
        estProvisoire: noteTerminale === null
    };
}

/* ===============================
   GESTION DES JETONS PERSONNALISÉS
   =============================== */

/**
 * Attribue un jeton personnalisé avec demande de motif
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @param {string} nomJeton - Nom du jeton (pour affichage)
 */
function attribuerJetonPersonnaliseAvecPrompt(da, jetonId, nomJeton) {
    const motif = prompt(`Motif d'utilisation du jeton "${nomJeton}" (optionnel) :`);

    if (motif === null) {
        // L'utilisateur a annulé
        return;
    }

    if (typeof attribuerJetonPersonnalise === 'function') {
        const succes = attribuerJetonPersonnalise(da, jetonId, motif || '');

        if (succes) {
            // Recharger la section Mobilisation pour mettre à jour l'affichage
            changerSectionProfil('mobilisation');
        }
    } else {
        console.error('Fonction attribuerJetonPersonnalise non disponible');
        alert('Erreur : La fonction de gestion des jetons n\'est pas disponible.');
    }
}

/**
 * Retire un jeton personnalisé avec confirmation
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} jetonId - ID du type de jeton
 * @param {string} nomJeton - Nom du jeton (pour affichage)
 */
function retirerJetonPersonnaliseAvecConfirmation(da, jetonId, nomJeton) {
    if (!confirm(`Es-tu sûr de vouloir retirer un jeton "${nomJeton}" à cet·te étudiant·e ?`)) {
        return;
    }

    if (typeof retirerJetonPersonnalise === 'function') {
        const succes = retirerJetonPersonnalise(da, jetonId);

        if (succes) {
            // Recharger la section Mobilisation pour mettre à jour l'affichage
            changerSectionProfil('mobilisation');
        }
    } else {
        console.error('Fonction retirerJetonPersonnalise non disponible');
        alert('Erreur : La fonction de gestion des jetons n\'est pas disponible.');
    }
}

// Exporter les fonctions vers window

// 🆕 Exporter les nouvelles fonctions de niveau RàI (Beta 90+)
// window.determinerNiveauRaiPedagogique → profil-etudiant-calculs.js
// window.determinerAlerteContextuelle → profil-etudiant-calculs.js
// window.determinerCibleIntervention → profil-etudiant-calculs.js (FIX Beta 97.4 : utilisé par afficherPatternsApprentissage)
// window.calculerMoyennesCriteres → profil-etudiant-calculs.js
// window.calculerIPB → profil-etudiant-calculs.js
// window.obtenirGrilleReferenceDepistage → profil-etudiant-helpers.js

/**
 * 🆕 BETA 91: Calcule et stocke les patterns + RàI pour TOUT le groupe
 * Cette fonction est appelée par apercu-contenu.js au chargement
 * pour avoir des données à jour pour tous les étudiants
 *
 * @returns {Object} - Patterns et RàI de tous les étudiants
 */
function calculerEtStockerPatternsGroupe() {
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const patternsGroupe = {};


    etudiants.forEach(etudiant => {
        const da = etudiant.da;

        try {
            // Récupérer le modèle RàI (contient pattern et niveau)
            const modelRai = determinerNiveauRaiPedagogique(da);

            // Récupérer les indices pour avoir la performance
            const indices = calculerTousLesIndices(da);

            // Stocker les informations essentielles
            patternsGroupe[da] = {
                pattern: modelRai.pattern,
                niveauRai: modelRai.niveau,
                defi: modelRai.defi,
                performancePct: indices.P, // 0-100
                dateCalcul: new Date().toISOString()
            };
        } catch (error) {
            console.warn('⚠️ Erreur calcul pattern pour DA', da, error);
            patternsGroupe[da] = {
                pattern: 'Inconnu',
                niveauRai: null,
                defi: null,
                performancePct: 0,
                dateCalcul: new Date().toISOString()
            };
        }
    });

    // Stocker avec namespace trimestre
    db.setSync(cle('indicesPatternsRaI'), patternsGroupe);


    return patternsGroupe;
}

/**
 * 🆕 BETA 91: Récupère les patterns stockés pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - Pattern et RàI de l'étudiant, ou null si non trouvé
 */
function obtenirPatternEtudiant(da) {
    const patterns = db.getSync(cle('indicesPatternsRaI'), null) || db.getSync('indicesPatternsRaI', {});
    return patterns[da] || null;
}


    // === EXPORTS window.X (convention systématique session A décision b) ===
    window.consulterEvaluation                       = consulterEvaluation;
    window.evaluerProduction                         = evaluerProduction;
    window.supprimerEvaluationDepuisProfil           = supprimerEvaluationDepuisProfil;
    window.calculerDetailsNoteFinale                 = calculerDetailsNoteFinale;
    window.attribuerJetonPersonnaliseAvecPrompt      = attribuerJetonPersonnaliseAvecPrompt;
    window.retirerJetonPersonnaliseAvecConfirmation  = retirerJetonPersonnaliseAvecConfirmation;
    window.calculerEtStockerPatternsGroupe           = calculerEtStockerPatternsGroupe;
    window.obtenirPatternEtudiant                    = obtenirPatternEtudiant;
})();
