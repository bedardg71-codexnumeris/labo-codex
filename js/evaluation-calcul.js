/* ===============================
   MODULE EVALUATION-CALCUL — Calcul des notes (algorithmique + simple + catégories)

   Extrait de js/evaluation.js (zone L61-L720 Calcul de notes + Gestion des
   couleurs, session B étape 3 refactor evaluation, 2026-05-18 — beta 99.48).

   6 fonctions migrées :
     · calculerNoteAlgorithmique (privée à l'IIFE — pas d'export)
     · genererRetroactionEUF (privée à l'IIFE — helper texte EUF appelé uniquement
       par les 3 fns calcul algorithmique)
     · calculerNoteAlgorithmiqueAvecCategories (cyc 42 — héritage Cat-B accepté,
       sous le seuil proposé N=50)
     · calculerNoteAlgorithmiqueSimple
     · calculerNote (note finale pondérée — appelée 6× depuis le résidu via
       window.calculerNote après extraction)
     · obtenirCouleurNiveau (appelée 2× depuis evaluation-chargement.js via
       window.obtenirCouleurNiveau après extraction)

   Variables module-scope encapsulées (anti-pattern §5.10) : aucune
   (toutes les locals sont à l'intérieur des function bodies).

   4 exports window.X :
     · window.calculerNoteAlgorithmiqueAvecCategories (déjà exporté en session A
       pour evaluation-handlers.js — préservé)
     · window.calculerNoteAlgorithmiqueSimple (déjà exporté en session A pour
       evaluation-handlers.js — préservé)
     · window.calculerNote (PROMOTION §5.6 — appelée depuis le résidu zones
       Sauvegarde + Modification : changerStatutIntegrite, changerEchelleEvaluation,
       verifierEtChargerEvaluationExistante, modifierEvaluation × 2)
     · window.obtenirCouleurNiveau (PROMOTION §5.6 — appelée depuis
       evaluation-chargement.js : chargerGrilleSelectionnee, niveauSelectionne)

   NON exportées (préservation comportementale stricte) :
     · calculerNoteAlgorithmique : pas d'export d'origine, appelée uniquement
       via HTML inline handlers résolus par le dispatcher data-action (cherche
       dans window) — non, en réalité elle N'EST PAS exportée et n'est appelée
       que depuis evaluation-handlers.js via... ah non, handlers appelle
       window.calculerNoteAlgorithmiqueSimple et window.calculerNoteAlgorithmique
       AvecCategories — PAS calculerNoteAlgorithmique sans suffixe. Donc cette
       fonction est apparemment dead code (préservation Cat-B post-merge).
     · genererRetroactionEUF : helper interne uniquement utilisé par les 3
       fonctions algorithmiques au sein du même IIFE.

   Patches §5.6 appliqués DANS ce sous-module :
     · 3 sites `genererRetroaction(1)` → `window.genererRetroaction(1)` aux
       lignes correspondantes (calculerNoteAlgorithmique fin de fonction,
       calculerNoteAlgorithmiqueAvecCategories fin, calculerNoteAlgorithmiqueSimple
       fin). Raison : `genererRetroaction` reste dans le résidu (zone Rétroaction
       L741), exporté via window.genererRetroaction depuis le résidu.

   Helpers cross-module consommés (script-scope globaux, donc bare access OK) :
     · evaluationEnCours (let global config.js L145)
     · db.getSync (db.js global)
     · document.getElementById, Math.*, parseInt, console.warn/error (natifs)

   Chargé AVANT evaluation.js dans index.html (entre evaluation-chargement.js
   et evaluation.js) — le résidu evaluation.js consomme window.calculerNote
   et evaluation-chargement.js consomme window.obtenirCouleurNiveau via
   promotion §5.6.
   =============================== */

(function() {
'use strict';

/**
 * Colore le bloc résultat (.eval-resultat-algo) selon le niveau calculé,
 * pour aligner visuellement les critères algorithmiques sur les autres
 * critères (qui ont un select dropdown coloré). Passer `null`/`'--'` pour
 * retirer le style (état pas-encore-calculé).
 */
function _appliquerStyleResultatAlgo(critereId, niveau) {
    const bloc = document.getElementById(`resultat_algo_${critereId}`);
    const nivAlgo = document.getElementById(`niveau_algo_${critereId}`);
    if (!bloc) return;
    if (niveau && niveau !== '--' && typeof obtenirCouleurNiveau === 'function') {
        const couleur = obtenirCouleurNiveau(niveau);
        bloc.style.borderLeft = `4px solid ${couleur}`;
        bloc.style.background = couleur + '20';
        if (nivAlgo) { nivAlgo.style.color = couleur; nivAlgo.style.fontWeight = '700'; }
    } else {
        bloc.style.borderLeft = '';
        bloc.style.background = '';
        if (nivAlgo) { nivAlgo.style.color = ''; nivAlgo.style.fontWeight = ''; }
    }
}

/**
 * Calcule automatiquement la note pour un critère algorithmique
 * Formule: Note = Pondération − (Erreurs ÷ Mots × Facteur)
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmique(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    if (mots === 0) {
        // Réinitialiser l'affichage
        document.getElementById(`note_algo_${critereId}`).textContent = '--';
        document.getElementById(`pct_algo_${critereId}`).textContent = '--';
        document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
        _appliquerStyleResultatAlgo(critereId, null);
        return;
    }

    // Calcul selon la formule: Pondération − (Erreurs ÷ Mots × Facteur)
    const noteCalculee = ponderation - (erreurs / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;

    // Limiter entre 0 et 100%
    const pctFinal = Math.max(0, Math.min(100, pourcentage));

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        // Exclure le niveau "0" (Non recevable) — réservé à l'intégrité académique
        const niveau = echelleSelectionnee.niveaux.find(n => {
            if (n.code === '0' || n.code === 0) return false;
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.criteres[critereId] = niveauIDME;

    // Sauvegarder les données algorithmiques séparément pour pouvoir les recharger
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }
    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal
    };

    // Calculer la note globale et générer la rétroaction
    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/**
 * Génère une rétroaction sur le ratio d'erreurs en prévision de l'EUF
 * Formule: motsParErreur = Mots ÷ Erreurs
 * Interprétation: 1 erreur à chaque X mots
 * Seuil EUF: minimum 1 erreur à chaque 30 mots pour réussir
 *
 * @param {number} erreurs - Nombre total d'erreurs
 * @param {number} mots - Nombre de mots
 * @returns {string} Rétroaction EUF
 */
function genererRetroactionEUF(erreurs, mots) {
    if (erreurs === 0) {
        return ' En prévision de l\'EUF, l\'absence d\'erreur est exceptionnelle.';
    }
    if (mots === 0) return '';

    // Calcul: 1 erreur à chaque X mots
    const motsParErreur = mots / erreurs;

    let retroactionEUF = ` Tu fais en moyenne 1 erreur à chaque ${Math.round(motsParErreur)} mots.`;

    // Seuil EUF: minimum 30 mots par erreur pour réussir
    if (motsParErreur >= 100) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est excellent.';
    } else if (motsParErreur >= 75) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est très bien.';
    } else if (motsParErreur >= 60) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est bien.';
    } else if (motsParErreur >= 30) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec. Il est recommandé de t\'inscrire au Centre d\'aide en français (CAF).';
    } else {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t\'inscrire au Centre d\'aide en français (CAF).';
    }

    return retroactionEUF;
}

/**
 * Calcule la note algorithmique AVEC catégorisation des erreurs
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * + Calcul du mode (catégorie dominante) pour rétroaction différenciée
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 * @param {string} critereGrilleId - ID du critère dans la grille (pour récupérer les catégories)
 */
function _parserCodesAlgoCategories(critereId) {
    const categoriesInput = document.getElementById(`eval_categories_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);
    const categoriesTexte = categoriesInput?.value.trim() || '';
    const mots = parseInt(motsInput?.value) || 0;
    let codesSousCriteres = [];
    if (categoriesTexte) {
        codesSousCriteres = categoriesTexte.split(';').map(c => c.trim()).filter(c => c !== '');
    }
    return { codesSousCriteres, mots, totalErreurs: codesSousCriteres.length };
}

function _resetAffichageAlgoCategories(critereId) {
    document.getElementById(`note_algo_${critereId}`).textContent = '--';
    document.getElementById(`pct_algo_${critereId}`).textContent = '--';
    document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
    document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
    _appliquerStyleResultatAlgo(critereId, null);
    const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
    if (retroDiv) retroDiv.classList.add('u-hide');
}

function _obtenirSousCriteresGrille(critereId) {
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grilleId = evaluationEnCours?.grilleId;
    const grille = grilles.find(g => g.id === grilleId);
    if (grille && grille.criteres) {
        const critereGrille = grille.criteres.find(c => c.id === critereId);
        if (critereGrille && critereGrille.sousCriteres) {
            return critereGrille.sousCriteres;
        }
    }
    return [];
}

function _calculerScoreAlgoCategories(codesSousCriteres, sousCriteres, ponderation, mots, facteur) {
    let sommePonderee = 0;
    codesSousCriteres.forEach(code => {
        const sc = sousCriteres.find(s => s.code === code);
        sommePonderee += sc && sc.ponderation !== undefined ? sc.ponderation : 1.0;
    });
    const noteCalculee = ponderation - (sommePonderee / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;
    return { sommePonderee, noteCalculee, pctFinal: Math.max(0, Math.min(100, pourcentage)) };
}

function _determinerNiveauIDMEAlgo(pctFinal) {
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) return '--';
    const niveau = echelleSelectionnee.niveaux.find(n => {
        if (n.code === '0' || n.code === 0) return false;
        return pctFinal >= n.min && pctFinal <= n.max;
    });
    return niveau ? niveau.code : '--';
}

function _appliquerResultatsAlgoCategories(critereId, noteCalculee, pctFinal, niveauIDME) {
    const noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    const pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    const nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);
    evaluationEnCours.criteres[critereId] = niveauIDME;
    const selectAlgoCat = document.getElementById(`eval_${critereId}`);
    if (selectAlgoCat && selectAlgoCat.value) {
        selectAlgoCat.value = '';
        selectAlgoCat.style.backgroundColor = 'transparent';
        selectAlgoCat.style.borderColor = 'var(--bordure-claire)';
    }
}

function _trouverCodeDominant(codesSousCriteres) {
    const frequences = {};
    let maxFreq = 0;
    let codeDominant = null;
    codesSousCriteres.forEach(code => {
        frequences[code] = (frequences[code] || 0) + 1;
        if (frequences[code] > maxFreq) {
            maxFreq = frequences[code];
            codeDominant = code;
        }
    });
    return { codeDominant, maxFreq };
}

function _construireRetroactionAlgoCategories(totalErreurs, sommePonderee, mots, scDominant) {
    let retroaction = `Ta rédaction contient ${totalErreurs} erreur${totalErreurs > 1 ? 's' : ''} de français`;
    if (scDominant && scDominant.retroaction && Math.abs(sommePonderee - totalErreurs) > 0.01) {
        retroaction += ` (${sommePonderee.toFixed(1)} points)`;
    }
    retroaction += ` pour ${mots} mots.`;
    const retroactionEUF = genererRetroactionEUF(totalErreurs, mots);
    if (retroactionEUF) retroaction += retroactionEUF;
    if (scDominant && scDominant.retroaction) retroaction += ` ${scDominant.retroaction}`;
    return retroaction;
}

function _sauvegarderDonneesAlgo(critereId, donnees) {
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }
    evaluationEnCours.donneesAlgorithmiques[critereId] = donnees;
}

function calculerNoteAlgorithmiqueAvecCategories(critereId, ponderation, facteur, critereGrilleId) {
    if (!evaluationEnCours) return;

    const { codesSousCriteres, mots, totalErreurs } = _parserCodesAlgoCategories(critereId);
    document.getElementById(`total_erreurs_${critereId}`).textContent = totalErreurs;
    document.getElementById(`mots_formule_${critereId}`).textContent = mots;

    if (mots === 0 || totalErreurs === 0) {
        _resetAffichageAlgoCategories(critereId);
        // Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
        // préserver mots+codes+totalErreurs même quand le calcul ne tourne pas,
        // sinon la sauvegarde persiste l'ancienne valeur de donneesAlgorithmiques.
        if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
        evaluationEnCours.donneesAlgorithmiques[critereId] = Object.assign(
            evaluationEnCours.donneesAlgorithmiques[critereId] || {},
            { codes: codesSousCriteres, mots: mots, totalErreurs: totalErreurs }
        );
        return;
    }

    const sousCriteres = _obtenirSousCriteresGrille(critereId);
    const { sommePonderee, noteCalculee, pctFinal } = _calculerScoreAlgoCategories(
        codesSousCriteres, sousCriteres, ponderation, mots, facteur
    );
    const niveauIDME = _determinerNiveauIDMEAlgo(pctFinal);
    _appliquerResultatsAlgoCategories(critereId, noteCalculee, pctFinal, niveauIDME);

    const { codeDominant, maxFreq } = _trouverCodeDominant(codesSousCriteres);

    if (codeDominant === null) {
        document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) commDiv.textContent = 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)';
    } else {
        const scDominant = sousCriteres.find(s => s.code === codeDominant);
        const nomDominant = scDominant ? scDominant.nom : `Code ${codeDominant}`;
        document.getElementById(`cat_dominante_${critereId}`).textContent =
            `${nomDominant} (${maxFreq} occurrence${maxFreq > 1 ? 's' : ''} du code ${codeDominant})`;

        const retroaction = _construireRetroactionAlgoCategories(totalErreurs, sommePonderee, mots, scDominant);
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) commDiv.textContent = retroaction;

        _sauvegarderDonneesAlgo(critereId, {
            codes: codesSousCriteres, mots, totalErreurs, sommePonderee,
            noteCalculee, pourcentage: pctFinal, niveau: niveauIDME, retroaction
        });

        if (scDominant && scDominant.retroaction) {
            const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
            if (retroDiv) retroDiv.classList.add('u-hide');
        }
    }

    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/**
 * Calcule la note algorithmique SIMPLE (sans catégorisation des erreurs)
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * Rétroaction générique: "Ta rédaction contient X erreurs de français pour Y mots."
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmiqueSimple(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    // Mettre à jour l'affichage du résumé
    const totalErreursElem = document.getElementById(`total_erreurs_simple_${critereId}`);
    const motsElem = document.getElementById(`mots_simple_${critereId}`);
    if (totalErreursElem) totalErreursElem.textContent = erreurs;
    if (motsElem) motsElem.textContent = mots;

    if (mots === 0) {
        // Réinitialiser l'affichage (guards si éléments pas encore dans le DOM)
        var noteEl = document.getElementById(`note_algo_${critereId}`);
        var pctEl = document.getElementById(`pct_algo_${critereId}`);
        var nivEl = document.getElementById(`niveau_algo_${critereId}`);
        if (noteEl) noteEl.textContent = '--';
        if (pctEl) pctEl.textContent = '--';
        if (nivEl) nivEl.textContent = '--';
        if (totalErreursElem) totalErreursElem.textContent = '--';
        if (motsElem) motsElem.textContent = '--';
        _appliquerStyleResultatAlgo(critereId, null);
        // Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
        // préserver erreurs+mots même quand le calcul ne tourne pas, sinon la
        // sauvegarde persiste l'ancienne valeur de donneesAlgorithmiques.
        if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
        evaluationEnCours.donneesAlgorithmiques[critereId] = Object.assign(
            evaluationEnCours.donneesAlgorithmiques[critereId] || {},
            { erreurs: erreurs, mots: mots }
        );
        return;
    }

    // Calcul selon la formule: Pondération − (Total Erreurs ÷ Mots × Facteur)
    const noteCalculee = ponderation - (erreurs / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;

    // Limiter entre 0 et 100%
    const pctFinal = Math.max(0, Math.min(100, pourcentage));

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        // Exclure le niveau "0" (Non recevable) — réservé à l'intégrité académique
        const niveau = echelleSelectionnee.niveaux.find(n => {
            if (n.code === '0' || n.code === 0) return false;
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Construire la rétroaction générique simple
    let retroactionGenerique = `Ta rédaction contient ${erreurs} erreur${erreurs > 1 ? 's' : ''} de français pour ${mots} mots.`;

    // Ajouter la rétroaction EUF (Épreuve Uniforme de Français)
    const retroactionEUF = genererRetroactionEUF(erreurs, mots);
    if (retroactionEUF) {
        retroactionGenerique += retroactionEUF;
    }

    // Afficher dans le champ commentaire standard
    const champCommentaire = document.getElementById(`comm_${critereId}`);
    if (champCommentaire) {
        champCommentaire.value = retroactionGenerique;
    }

    // === SAUVEGARDE DANS evaluationEnCours ===
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }

    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal,  // Sauvegarder comme nombre, pas string
        niveau: niveauIDME,
        retroaction: retroactionGenerique
    };

    // Sauvegarder le critère dans evaluationEnCours.criteres avec le niveau
    evaluationEnCours.criteres[critereId] = niveauIDME;

    // Réinitialiser le sélecteur manuel pour que calculerNote() utilise le % exact algorithmique
    const selectAlgo = document.getElementById(`eval_${critereId}`);
    if (selectAlgo && selectAlgo.value) {
        selectAlgo.value = '';
        selectAlgo.style.backgroundColor = 'transparent';
        selectAlgo.style.borderColor = 'var(--bordure-claire)';
    }

    // Déclencher le recalcul et la régénération de rétroaction
    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/* ===============================
   🧮 CALCUL DE LA NOTE
   =============================== */

/**
 * Calcule la note finale basée sur les critères évalués
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les niveaux sélectionnés
 * 2. Calcule la moyenne pondérée en pourcentage
 * 3. Détermine le niveau global
 * 4. Met à jour l'affichage
 */
function calculerNote() {
    if (!evaluationEnCours) return;

    const grilleId = evaluationEnCours.grilleId;
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    // NOUVEAU (Beta 92): Support échelles de pratiques configurables
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    let echelleSelectionnee = null;

    // Vérifier si c'est une échelle de pratique configurable
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
            echelleSelectionnee = {
                id: echelleId,
                niveaux: pratiqueData.config.echelle.niveaux || [],
                type: pratiqueData.config.echelle.type || 'niveaux'
            };
        }
    } else {
        // Échelle personnalisée classique
        const echelles = db.getSync(cle('echellesTemplates'), []);
        echelleSelectionnee = echelles.find(e => e.id === echelleId);
    }

    // SÉCURITÉ: Vérifier que l'échelle existe. Si non résolue (consultation d'un
    // trimestre archivé sans copie d'échelle = pilote A25 pas posé, ou échelle pas
    // encore sélectionnée), on dégrade SILENCIEUSEMENT (note « -- ») — comme le cas
    // « grille manquante » plus haut. Le problème de fond est déjà signalé une fois par
    // l'avertissement « Grille introuvable » ; crier ❌ à chaque recalcul en cascade au
    // chargement ne fait que polluer la console (4× à l'ouverture d'une éval A25). (#348-résiduel)
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux || echelleSelectionnee.niveaux.length === 0) {
        const elNote = document.getElementById('noteProduction1');
        const elNiveau = document.getElementById('niveauProduction1');
        if (elNote) elNote.textContent = '--';
        if (elNiveau) elNiveau.textContent = '--';
        return;
    }

    const niveaux = echelleSelectionnee.niveaux;

    // Utiliser les valeurs ponctuelles configurées par l'utilisateur
    const valeurs = {};
    // #525 — UNE SEULE RÈGLE, celle de `echelles.js`. Ce site repliait la valeur
    // ponctuelle sur le milieu de plage par un OU-logique : celui-ci traitait une
    // valeur ponctuelle de ZÉRO comme absente et la remplaçait par le milieu. Sur un
    // niveau 0 dont la plage irait de 0 à 59, la note valait 29,5 au lieu de 0.
    // `consolidation.js` appliquait déjà la bonne règle — deux lecteurs, deux
    // résultats pour la même échelle.
    niveaux.forEach(niveau => {
        const valeur = (typeof valeurNumeriqueDuNiveau === 'function')
            ? valeurNumeriqueDuNiveau(niveau)
            : (niveau.valeurCalcul != null ? Number(niveau.valeurCalcul) : (Number(niveau.min) + Number(niveau.max)) / 2);
        // ⚠ `null` = « je ne sais pas calculer » (ni valeur ponctuelle, ni bornes
        // exploitables). On ne pose PAS 0 à la place : un zéro inventé se
        // propagerait dans la note sans que rien ne le distingue d'un vrai zéro.
        if (valeur !== null && !isNaN(valeur)) valeurs[niveau.code] = valeur;
    });

    let noteTotal = 0;
    let ponderationTotal = 0;
    const notesCriteres = []; // Pour collecter les notes à copier-coller

    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        if (niveau) {
            const ponderation = (critere.ponderation || 0) / 100;

            // IMPORTANT: Pour les critères algorithmiques, utiliser le pourcentage exact calculé
            // au lieu de la valeur par défaut du niveau (ex: 61.5% au lieu de 32% pour I)
            // SAUF si l'utilisateur a manuellement sélectionné un niveau différent (jeton de reprise ciblée)
            let valeurCritere = valeurs[niveau];
            let sourceValeur = 'niveau défaut';

            // Vérifier si le select du critère est en mode manuel (valeur non vide)
            const selectCritere = document.getElementById(`eval_${critere.id}`);
            const niveauManuel = selectCritere?.value; // Niveau sélectionné manuellement (vide si "-- Utiliser le niveau calculé --")

            if (evaluationEnCours.donneesAlgorithmiques &&
                evaluationEnCours.donneesAlgorithmiques[critere.id] &&
                evaluationEnCours.donneesAlgorithmiques[critere.id].pourcentage !== undefined &&
                !niveauManuel) { // Utiliser l'algorithme SEULEMENT si pas de sélection manuelle
                // Utiliser le pourcentage exact du calcul algorithmique
                valeurCritere = evaluationEnCours.donneesAlgorithmiques[critere.id].pourcentage;
                sourceValeur = 'algorithme exact';
            } else if (niveauManuel) {
                // Niveau sélectionné manuellement : utiliser la valeur par défaut du niveau
                sourceValeur = 'manuel (jeton)';
            }

            if (valeurCritere !== undefined) {
                const contribution = valeurCritere * ponderation;
                noteTotal += contribution;
                ponderationTotal += ponderation;

                // Collecter le niveau IDME du critère pour l'export (ex: M, D, E, I)
                notesCriteres.push(niveau);

            }
        }
    });

    let pourcentage = 0;
    let niveauGlobal = '--';

    if (ponderationTotal > 0) {
        // La moyenne pondérée est directement en pourcentage
        pourcentage = noteTotal / ponderationTotal;

        // APPLIQUER LE PLAFOND (CEILING) si c'est une reprise ciblée
        if (evaluationEnCours.plafondNoteCiblee) {
            const niveauPlafond = niveaux.find(n => n.code === evaluationEnCours.plafondNoteCiblee);
            if (niveauPlafond && pourcentage > niveauPlafond.max) {
                pourcentage = niveauPlafond.max;
            }
        }

        // Déterminer le niveau global selon l'échelle
        const niveauFinal = niveaux.find(n => {
            return pourcentage >= n.min && pourcentage <= n.max;
        });

        if (niveauFinal) {
            niveauGlobal = niveauFinal.code;
        } else if (niveaux.length > 0) {
            // Fallback : si le pourcentage ne tombe dans aucune plage exacte
            // (bornes non contiguës ou arrondis), prendre le niveau le plus proche
            var plusProche = niveaux[0];
            var distMin = Infinity;
            niveaux.forEach(function(n) {
                var mid = (n.min + n.max) / 2;
                var dist = Math.abs(pourcentage - mid);
                if (dist < distMin) { distMin = dist; plusProche = n; }
            });
            niveauGlobal = plusProche.code;
            console.warn('[calculerNote] Fallback niveau : ' + pourcentage.toFixed(1) + '% → ' + plusProche.code + ' (aucune plage exacte, plus proche de [' + plusProche.min + '-' + plusProche.max + '])');
        }

    }

    // Mettre à jour l'affichage
    document.getElementById('noteProduction1').textContent = pourcentage.toFixed(1) + ' %';
    document.getElementById('niveauProduction1').textContent = niveauGlobal;

    // Afficher les notes des critères pour copier-coller
    const criteresCopierElement = document.getElementById('criteresCopier');
    if (criteresCopierElement) {
        if (notesCriteres.length > 0) {
            criteresCopierElement.textContent = notesCriteres.join('\t');
        } else {
            criteresCopierElement.textContent = '--';
        }
    }

    // Colorer l'encadré de la note finale selon le niveau
    const noteContainer = document.getElementById('noteProduction1').closest('div[style*="background"]');
    if (noteContainer && niveauGlobal !== '--') {
        const couleur = obtenirCouleurNiveau(niveauGlobal);
        if (couleur && couleur !== 'transparent') {
            noteContainer.style.background = couleur + '20'; // 20% opacité
            noteContainer.style.borderLeft = `4px solid ${couleur}`;
            noteContainer.style.transition = 'all 0.3s ease';
        }
    } else if (noteContainer) {
        // Réinitialiser si pas de niveau
        noteContainer.style.background = 'var(--gris-tres-pale)';
        noteContainer.style.borderLeft = '4px solid var(--bordure-claire)';
    }

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.noteMoyenne = pourcentage;
    evaluationEnCours.niveauFinal = niveauGlobal;
}

/* ===============================
   🎨 GESTION DES COULEURS
   =============================== */

/**
 * Récupère la couleur associée à un niveau de performance
 *
 * PARAMÈTRES:
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, 0, etc.)
 *
 * RETOUR:
 * @returns {string} - Couleur CSS (var(--...) ou #...)
 */
function obtenirCouleurNiveau(codeNiveau) {
    if (!codeNiveau) return 'transparent';

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) {
        return 'transparent';
    }

    const niveau = echelleSelectionnee.niveaux.find(n => n.code === codeNiveau);

    return niveau ? niveau.couleur : 'transparent';
}

/**
 * Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
 * force un dernier recalcul algorithmique pour chaque critère algo de la grille
 * avant la sauvegarde. Garantit que `evaluationEnCours.donneesAlgorithmiques`
 * reflète les valeurs DOM courantes — défense contre les états désynchronisés
 * (race condition au chargement, re-render, focus/blur, navigation entre élèves).
 *
 * Renforcement v3.1 (24 mai 2026) : déclenche d'abord `mettreAJourCompteursErreurs`
 * qui propage le comptage live des tampons errfr_* de l'annotation vers le champ
 * eval_erreurs_*. Sans ça, si l'utilisateur clique Sauvegarder dans les ~2 secondes
 * après navigation (avant que le setTimeout 2000ms d'afficherPalettesEval ne fire),
 * le DOM affiche encore la valeur DB héritée d'avant — et la sauvegarde la persiste,
 * propageant la corruption. Bug historique de toute la session a2025.
 *
 * À appeler depuis sauvegarderEvaluation et sauvegarderEvaluationModifiee,
 * AVANT la collecte des critères.
 */
function _forcerRecalculAlgorithmiqueAvantSauvegarde(grille) {
    if (!grille || !grille.criteres) return;

    // v3.1 : propager le comptage live des tampons errfr_* AVANT le recalcul
    // (sinon le DOM peut afficher une valeur stale héritée du chargement DB).
    if (typeof travauxOutils !== 'undefined'
        && typeof travauxOutils.mettreAJourCompteursErreurs === 'function') {
        try { travauxOutils.mettreAJourCompteursErreurs(); }
        catch (e) { console.warn('[_forcerRecalculAlgorithmiqueAvantSauvegarde] mettreAJour échec', e); }
    }

    grille.criteres.forEach(function(critere) {
        if (critere.type !== 'algorithmique') return;
        const ponderation = critere.ponderation || 20;
        const facteur = critere.facteurNormalisation || 500;
        const aCategories = critere.sousCriteres
            && Array.isArray(critere.sousCriteres)
            && critere.sousCriteres.length > 0;
        try {
            if (aCategories && typeof calculerNoteAlgorithmiqueAvecCategories === 'function') {
                // Guard : si le DOM input n'existe pas (hors mode Évaluer), skip
                if (!document.getElementById('eval_categories_' + critere.id)) return;
                calculerNoteAlgorithmiqueAvecCategories(critere.id, ponderation, facteur, critere.id);
            } else if (typeof calculerNoteAlgorithmiqueSimple === 'function') {
                if (!document.getElementById('eval_erreurs_' + critere.id)) return;
                calculerNoteAlgorithmiqueSimple(critere.id, ponderation, facteur);
            }
        } catch (e) {
            console.warn('[_forcerRecalculAlgorithmiqueAvantSauvegarde] échec critère', critere.id, e);
        }
    });
}

// =====================================================================
// Exports window.X (5) — voir en-tête pour détails
// =====================================================================

// Préservés depuis bloc principal evaluation.js (session A) :
window.calculerNoteAlgorithmiqueAvecCategories = calculerNoteAlgorithmiqueAvecCategories;
window.calculerNoteAlgorithmiqueSimple = calculerNoteAlgorithmiqueSimple;

// Promotions §5.6 nouvelles (session B) :
window.calculerNote = calculerNote;
window.obtenirCouleurNiveau = obtenirCouleurNiveau;

// Restauration fix #110 v3 (24 mai 2026) — appelé par sauvegarderEvaluation
// (evaluation-sauvegarde.js) et sauvegarderEvaluationModifiee (evaluation.js) :
window._forcerRecalculAlgorithmiqueAvantSauvegarde = _forcerRecalculAlgorithmiqueAvantSauvegarde;

})();
