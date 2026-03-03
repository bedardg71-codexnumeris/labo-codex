/* ===============================
   MODULE: INDICES A-C-P-E (CENTRALISÉ)
   Beta 98.4 - Refacto indice A (#224)

   Regroupe les fonctions de LECTURE, CALCUL et UTILITAIRES
   des indices A-C-P-E, précédemment dispersées dans :
   - profil-etudiant.js (calculerTousLesIndices, calculerPerformancePAN)
   - tableau-bord-apercu.js (calculerIndicesEtudiant, calculerCorrelationPearson, determinerNiveauEngagement)
   - etudiants.js (calculerCorrelationPearson - doublon)
   - portfolio.js (obtenirIndicesCP, obtenirHistoriqueIndicesCP)

   PRODUCTEURS :
   - calculerEtSauvegarderIndicesAssiduite() → ici (déplacé depuis saisie-presences.js)
   - calculerAssiduite(da, dateLimite) → ici (fonction canonique unique)
   - calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle) → ici
   - calculerEtStockerIndicesCP() → portfolio.js

   DÉPENDANCES (chargées avant) :
   - db.js → db.getSync(), db.setSync()
   - modes.js → obtenirDonneesSelonMode(), sauvegarderDonneesSelonMode(), cle()
   - trimestre.js → obtenirSeancesCompletes()
   - saisie-presences.js → obtenirNombrePeriodesSeance(), obtenirDureePeriode()

   =============================== */
(function() {
'use strict';

/* ===============================
   UTILITAIRES PURS
   =============================== */

/**
 * Calcule le coefficient de corrélation de Pearson entre deux séries de données
 * @param {Array<number>} x - Première série de valeurs
 * @param {Array<number>} y - Deuxième série de valeurs
 * @returns {number|null} - Coefficient r entre -1 et 1, ou null si calcul impossible
 *
 * FORMULE: r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
 * INTERPRÉTATION (Cohen, 1988):
 * - |r| < 0.3 : Très faible
 * - 0.3 ≤ |r| < 0.5 : Faible
 * - 0.5 ≤ |r| < 0.7 : Modérée
 * - 0.7 ≤ |r| < 0.9 : Forte
 * - |r| ≥ 0.9 : Très forte
 */
function calculerCorrelationPearson(x, y) {
    const n = x.length;

    // Vérifications de base
    if (n === 0 || n !== y.length) {
        return null;
    }

    // Calculer les moyennes
    const moyX = x.reduce((a, b) => a + b, 0) / n;
    const moyY = y.reduce((a, b) => a + b, 0) / n;

    // Calculer les écarts et produits
    let numerateur = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - moyX;
        const diffY = y[i] - moyY;
        numerateur += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }

    // Vérifier variance nulle (tous identiques)
    if (denomX === 0 || denomY === 0) {
        return null;
    }

    // Calculer r
    return numerateur / Math.sqrt(denomX * denomY);
}

/**
 * Détermine le niveau d'engagement selon les seuils
 *
 * Seuils (échelle positive, inversée par rapport au risque):
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 *
 * @param {number} engagement - Indice d'engagement (0-1)
 * @returns {string} Niveau d'engagement
 */
function determinerNiveauEngagement(engagement) {
    if (engagement >= 0.80) return 'très favorable';
    if (engagement >= 0.65) return 'favorable';
    if (engagement >= 0.50) return 'modéré';
    if (engagement >= 0.30) return 'fragile';
    return 'insuffisant';
}

/* ===============================
   PRODUCTEUR : INDICE A (ASSIDUITÉ)
   Fonction canonique unique — #224
   =============================== */

/**
 * Calcule l'assiduité sommative d'un étudiant.
 * Source de vérité : seancesCompletes du groupe-cours × datesSaisies du groupe.
 *
 * Formule : A = Σ periodesPresentes / Σ periodesOffertes
 * - Séances facultatives (RàI) : présent → compte aux deux ; absent → ni l'un ni l'autre
 * - Chaque séance = obtenirNombrePeriodesSeance(date) périodes
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string|null} dateLimite - Date max incluse (YYYY-MM-DD), null = aujourd'hui
 * @returns {Object} { indice, periodesPresentes, periodesOffertes, nombreSeances }
 */
function calculerAssiduite(da, dateLimite) {
    var presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    var presencesEtudiant = presences.filter(function(p) { return p.da === da; });

    var seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};

    var aujourdhui = dateLimite || new Date().toISOString().split('T')[0];

    // Construire datesSaisies depuis le GROUPE (pas juste l'étudiant) — FIX #220
    var etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    var dasGroupe = new Set();
    if (Array.isArray(etudiantsGroupe)) {
        etudiantsGroupe.forEach(function(e) { if (e.da) dasGroupe.add(String(e.da)); });
    }
    var datesSaisies = new Set();
    presences.forEach(function(p) {
        if (p.date && dasGroupe.has(String(p.da))) datesSaisies.add(p.date);
    });

    var dates = Object.keys(seancesCompletes).filter(function(d) {
        if (d > aujourdhui) return false;
        // Pour aujourd'hui (ou dateLimite) : inclure seulement si saisie existe pour cet étudiant
        if (d === aujourdhui && !dateLimite) {
            return presencesEtudiant.some(function(p) { return p.date === d; });
        }
        return datesSaisies.has(d);
    }).sort();

    if (dates.length === 0) {
        return { indice: 1, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 };
    }

    var totalPeriodesOffertes = 0;
    var totalPeriodesPresentes = 0;
    var nombreSeances = 0;
    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    dates.forEach(function(date) {
        var nombrePeriodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(date) : 2;

        // Présence régulière (non-facultative)
        var presenceReguliere = presencesEtudiant.find(function(p) {
            return p.date === date && !p.facultatif;
        });

        // Présences facultatives (interventions RàI)
        var presencesFacultatives = presencesEtudiant.filter(function(p) {
            return p.date === date && p.facultatif === true;
        });

        // Périodes régulières
        var periodesRegulieres = 0;
        if (presenceReguliere) {
            if (presenceReguliere.periodesPresentes !== undefined && presenceReguliere.periodesPresentes !== null) {
                periodesRegulieres = presenceReguliere.periodesPresentes;
            } else if (presenceReguliere.heures !== undefined && presenceReguliere.heures !== null) {
                periodesRegulieres = (presenceReguliere.heures * 60) / dureePeriode;
            }
        }

        // Périodes d'interventions RàI
        var periodesInterventions = 0;
        presencesFacultatives.forEach(function(pf) {
            var pPeriodes = 0;
            if (pf.periodesPresentes !== undefined && pf.periodesPresentes !== null) {
                pPeriodes = pf.periodesPresentes;
            } else if (pf.heures !== undefined && pf.heures !== null) {
                pPeriodes = pf.heures;
            }
            if (pPeriodes > 0) periodesInterventions += pPeriodes;
        });

        if (presenceReguliere) {
            totalPeriodesOffertes += nombrePeriodesSeance;
            nombreSeances++;
            totalPeriodesPresentes += Math.min(periodesRegulieres + periodesInterventions, nombrePeriodesSeance);
        } else if (presencesFacultatives.length > 0) {
            if (periodesInterventions > 0) {
                totalPeriodesOffertes += nombrePeriodesSeance;
                totalPeriodesPresentes += Math.min(periodesInterventions, nombrePeriodesSeance);
                nombreSeances++;
            }
            // Absent de l'intervention → ne compte ni au num ni au dén
        } else {
            // Aucun record → séance saisie mais étudiant absent
            totalPeriodesOffertes += nombrePeriodesSeance;
            nombreSeances++;
        }
    });

    if (totalPeriodesOffertes === 0) {
        return { indice: 1, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 };
    }

    var indice = totalPeriodesPresentes / totalPeriodesOffertes;
    return {
        indice: Math.min(indice, 1),
        periodesPresentes: totalPeriodesPresentes,
        periodesOffertes: totalPeriodesOffertes,
        nombreSeances: nombreSeances
    };
}

/**
 * Orchestre le calcul et la sauvegarde de l'indice A pour tous les étudiants actifs.
 * Appelée après chaque enregistrement de présences.
 * Chaîne calculerEtStockerIndicesCP() pour recalculer E.
 *
 * @returns {Object} Structure { sommatif: { da: {...} }, dateCalcul }
 */
function calculerEtSauvegarderIndicesAssiduite() {
    console.log('📊 [Assiduité] Calcul des indices d\'assiduité...');

    var etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    var indices = {
        sommatif: {},
        dateCalcul: new Date().toISOString()
    };

    var etudiantsActifs = (etudiants || []).filter(function(e) {
        return e.statut !== 'décrochage' && e.statut !== 'abandon';
    });

    etudiantsActifs.forEach(function(etudiant) {
        indices.sommatif[etudiant.da] = calculerAssiduite(etudiant.da, null);
    });

    sauvegarderDonneesSelonMode('indicesAssiduite', indices);

    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    console.log('📊 [Assiduité] ✅ Indices sauvegardés (' + Object.keys(indices.sommatif).length + ' étudiants)');
    return indices;
}

/**
 * Calcule l'assiduité en temps réel pour l'affichage dans le tableau de saisie.
 * Inclut la séance en cours de saisie (pas encore enregistrée).
 *
 * @param {string} da - Numéro DA
 * @param {string} dateStr - Date de la séance en cours (YYYY-MM-DD)
 * @param {number} periodesSeanceActuelle - Périodes saisies pour la séance en cours
 * @returns {Object} { taux, totalPeriodesPresentes }
 */
function calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle) {
    var presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    var seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};

    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    // Construire datesSaisies depuis le GROUPE — FIX #220
    var etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    var dasGroupe = new Set();
    if (Array.isArray(etudiantsGroupe)) {
        etudiantsGroupe.forEach(function(e) { if (e.da) dasGroupe.add(String(e.da)); });
    }
    var datesSaisies = new Set();
    presences.forEach(function(p) {
        if (p.date && dasGroupe.has(String(p.da))) datesSaisies.add(p.date);
    });

    var presencesEtudiant = presences.filter(function(p) { return p.da === da; });

    var periodesPresentes = 0;
    var periodesOffertes = 0;

    // Parcourir toutes les dates du calendrier AVANT dateStr
    var dates = Object.keys(seancesCompletes).sort();
    for (var i = 0; i < dates.length; i++) {
        var dateSeance = dates[i];
        if (dateSeance >= dateStr) continue;
        if (!datesSaisies.has(dateSeance)) continue;

        var nbPeriodes = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(dateSeance) : 2;

        var presenceReguliere = null;
        var presencesFacultatives = [];
        for (var j = 0; j < presencesEtudiant.length; j++) {
            if (presencesEtudiant[j].date === dateSeance) {
                if (presencesEtudiant[j].facultatif === true) {
                    presencesFacultatives.push(presencesEtudiant[j]);
                } else if (!presenceReguliere) {
                    presenceReguliere = presencesEtudiant[j];
                }
            }
        }

        var periodesReg = 0;
        if (presenceReguliere) {
            if (presenceReguliere.periodesPresentes !== undefined && presenceReguliere.periodesPresentes !== null) {
                periodesReg = presenceReguliere.periodesPresentes;
            } else if (presenceReguliere.heures !== undefined && presenceReguliere.heures !== null) {
                periodesReg = (presenceReguliere.heures * 60) / dureePeriode;
            }
        }

        var periodesIntervention = 0;
        for (var k = 0; k < presencesFacultatives.length; k++) {
            var pf = presencesFacultatives[k];
            var pfPer = 0;
            if (pf.periodesPresentes !== undefined && pf.periodesPresentes !== null) {
                pfPer = pf.periodesPresentes;
            } else if (pf.heures !== undefined && pf.heures !== null) {
                pfPer = pf.heures;
            }
            if (pfPer > 0) periodesIntervention += pfPer;
        }

        if (presenceReguliere) {
            periodesOffertes += nbPeriodes;
            periodesPresentes += Math.min(periodesReg + periodesIntervention, nbPeriodes);
        } else if (presencesFacultatives.length > 0 && periodesIntervention > 0) {
            periodesOffertes += nbPeriodes;
            periodesPresentes += Math.min(periodesIntervention, nbPeriodes);
        } else {
            periodesOffertes += nbPeriodes;
        }
    }

    // Ajouter la séance actuelle
    var nombrePeriodesSeanceActuelle = typeof obtenirNombrePeriodesSeance === 'function'
        ? obtenirNombrePeriodesSeance(dateStr) : 2;

    var periodesOffertesTotal = periodesOffertes + nombrePeriodesSeanceActuelle;
    var periodesPresentesTotal = periodesPresentes + periodesSeanceActuelle;

    var taux = periodesOffertesTotal === 0 ? 100 : Math.min(Math.round((periodesPresentesTotal / periodesOffertesTotal) * 100), 100);

    return {
        taux: taux,
        totalPeriodesPresentes: Math.round(periodesPresentes + periodesSeanceActuelle)
    };
}

/* ===============================
   GETTERS SST (Single Source of Truth)
   =============================== */

/**
 * Récupère les indices C et P actuels pour un étudiant (synchrone)
 *
 * NOUVELLE STRUCTURE (Beta 95.5) :
 * { date, pratique, C, P, E, details }
 *
 * RÉTROCOMPATIBILITÉ : Si paramètre 'pratique' fourni (ancienne API),
 * retourne { C, P, E, details } directement.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} pratique - (Déprécié) Ignoré en Beta 95.5
 * @returns {Object} - Structure actuelle ou null
 */
function obtenirIndicesCP(da, pratique = null) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const actuel = indicesCP[da]?.actuel;

    if (!actuel) return null;

    // Rétrocompatibilité : si pratique demandée, retourner le format attendu
    if (pratique === 'SOM' || pratique === 'PAN') {
        return {
            C: actuel.C || 0,
            P: actuel.P || 0,
            E: actuel.E || 0,
            details: actuel.details || {}
        };
    }

    // Sinon retourner la structure complète
    return actuel;
}

/**
 * Récupère l'historique des indices C et P pour un étudiant
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} pratique - (Déprécié) Ignoré en Beta 95.5
 * @returns {Array} - [{ date, pratique, C, P, E, details }, ...]
 */
function obtenirHistoriqueIndicesCP(da, pratique = null) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const historique = indicesCP[da]?.historique || [];

    // Rétrocompatibilité : si pratique demandée, adapter le format
    if (pratique === 'SOM' || pratique === 'PAN') {
        return historique.map(entree => ({
            date: entree.date,
            C: entree.C || 0,
            P: entree.P || 0,
            E: entree.E || 0,
            details: entree.details || {}
        }));
    }

    return historique;
}

/* ===============================
   FALLBACK PERFORMANCE
   =============================== */

/**
 * Calcule la performance PAN basée sur les artefacts SÉLECTIONNÉS dans le portfolio
 * @param {string} da - Numéro de DA
 * @returns {number} - Performance en proportion 0-1
 */
function calculerPerformancePAN(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.noteFinale);

    if (evaluationsEleve.length === 0) {
        return 0;
    }

    // PRIORITÉ 1 : Utiliser les artefacts SÉLECTIONNÉS dans le portfolio
    const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves') || {};
    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');

    if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
        const selectionEleve = selectionsPortfolios[da][portfolio.id];
        const artefactsRetenus = selectionEleve.artefactsRetenus;

        if (artefactsRetenus.length > 0) {
            const evaluationsRetenues = evaluationsEleve.filter(e =>
                artefactsRetenus.includes(e.productionId)
            );

            if (evaluationsRetenues.length > 0) {
                const moyenne = evaluationsRetenues.reduce((sum, e) => sum + e.noteFinale, 0) / evaluationsRetenues.length;
                console.log(`Indice P calculé depuis ${evaluationsRetenues.length} artefact(s) sélectionné(s): ${moyenne.toFixed(1)}%`);
                return moyenne / 100;
            }
        }
    }

    // FALLBACK : Si pas de sélection, prendre les 3 meilleures notes
    const meilleuresNotes = evaluationsEleve
        .map(e => e.noteFinale)
        .sort((a, b) => b - a)
        .slice(0, 3);

    if (meilleuresNotes.length === 0) return 0;

    const moyenne = meilleuresNotes.reduce((sum, note) => sum + note, 0) / meilleuresNotes.length;
    console.log(`Indice P calculé depuis les ${meilleuresNotes.length} meilleure(s) note(s): ${moyenne.toFixed(1)}%`);
    return moyenne / 100;
}

/* ===============================
   LECTEURS COMPOSITES
   =============================== */

/**
 * Calcule tous les indices pour un étudiant
 *
 * @param {string} da - Numéro de DA
 * @param {string} pratique - (Optionnel) 'SOM' ou 'PAN' pour forcer une pratique
 *                            Si non spécifié, détecte depuis modalitesEvaluation
 * @returns {Object} - Objet avec tous les indices
 *
 * STRUCTURE DE RETOUR :
 * {
 *   A: 85,              // % assiduité
 *   C: 67,              // % complétion (selon pratique)
 *   P: 72,              // % performance (selon pratique)
 *   M: 0.760,           // Mobilisation (composite)
 *   E: 0.781,           // Engagement (composite, racine cubique)
 *   pratique: 'SOM'     // Pratique utilisée pour le calcul
 * }
 */
function calculerTousLesIndices(da, pratique = null) {
    // ========================================
    // INDICE A : SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') (calculé par calculerEtSauvegarderIndicesAssiduite ci-dessus)
    // ========================================
    const indicesAssiduite = db.getSync(cle('indicesAssiduite'), {});
    const assiduiteSommatif = indicesAssiduite.sommatif?.[da];

    // Extraire l'indice (gérer ancien format nombre et nouveau format objet)
    let A = 0;
    if (typeof assiduiteSommatif === 'object' && assiduiteSommatif.indice !== undefined) {
        A = assiduiteSommatif.indice;
    } else if (typeof assiduiteSommatif === 'number') {
        A = assiduiteSommatif;
    }

    // DÉTERMINER LA PRATIQUE À UTILISER
    if (!pratique) {
        const config = db.getSync('modalitesEvaluation', {});
        pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';
    }

    // INDICES C, P, E : Lire depuis indicesCP (Single Source of Truth)
    let C = 0;
    let P = 0;
    let E = 0;

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da, pratique);
        if (indicesCP) {
            C = indicesCP.C / 100;
            P = indicesCP.P / 100;
            E = indicesCP.E !== undefined ? indicesCP.E : 0;
        } else {
            // Fallback : calculer à la volée si pas encore généré
            console.warn(`⚠️ indicesCP non trouvé pour ${da} (${pratique}) - Calcul à la volée`);
            if (typeof calculerTauxCompletion === 'function') {
                C = calculerTauxCompletion(da) / 100;
            }
            P = calculerPerformancePAN(da);
            const E_brut = A * C * P;
            E = Math.cbrt(E_brut);
        }
    } else {
        // Fallback : fonctions anciennes si module pas chargé
        console.warn('⚠️ obtenirIndicesCP non disponible - Calcul à la volée');
        if (typeof calculerTauxCompletion === 'function') {
            C = calculerTauxCompletion(da) / 100;
        }
        P = calculerPerformancePAN(da);
        const E_brut = A * C * P;
        E = Math.pow(E_brut, 1/3);
    }

    // INDICES COMPOSITES
    const M = (A + C) / 2;

    return {
        A: Math.round(A * 100),
        C: Math.round(C * 100),
        P: Math.round(P * 100),
        M: parseFloat(M.toFixed(3)),
        E: parseFloat(E.toFixed(3)),
        pratique: pratique
    };
}

/**
 * Récupère les indices calculés pour un étudiant
 * #224 : Plus de branche alternatif — sommatif uniquement
 *
 * @param {string} da - DA de l'étudiant
 * @param {Object} _cacheIndicesA - Cache optionnel indicesAssiduite
 * @param {Object} _cacheIndicesCP - Cache optionnel indicesCP
 * @returns {Object} Indices complets { sommatif: {...}, alternatif: {...} }
 */
function calculerIndicesEtudiant(da, _cacheIndicesA, _cacheIndicesCP) {
    const indicesA = _cacheIndicesA || obtenirDonneesSelonMode('indicesAssiduite') || {};

    const indicesCPEtudiant = _cacheIndicesCP
        ? (_cacheIndicesCP[da]?.actuel || null)
        : (typeof obtenirIndicesCP === 'function' ? obtenirIndicesCP(da) : null);

    // Détecter le format des données
    const estNouveauFormat = indicesCPEtudiant && !indicesCPEtudiant.SOM && indicesCPEtudiant.C !== undefined;

    let indicesSOM = null;

    if (estNouveauFormat) {
        indicesSOM = { C: indicesCPEtudiant.C, P: indicesCPEtudiant.P, E: indicesCPEtudiant.E };
    } else if (indicesCPEtudiant) {
        indicesSOM = indicesCPEtudiant.SOM || null;
    }

    const assiduiteSommatif = indicesA.sommatif?.[da];
    const nombreSeances = (typeof assiduiteSommatif === 'object') ? (assiduiteSommatif.nombreSeances || 0) : 0;
    const nombreEvals = indicesSOM?.details?.nbArtefactsRemis || indicesSOM?.details?.nbProductionsRemises || 0;

    const sommatif = {
        assiduite: (typeof assiduiteSommatif === 'object') ? assiduiteSommatif.indice : (assiduiteSommatif || 0),
        completion: indicesSOM ? indicesSOM.C / 100 : 0,
        performance: indicesSOM ? indicesSOM.P / 100 : 0,
        engagement: indicesSOM && indicesSOM.E !== undefined ? indicesSOM.E : 0,
        nombreSeances: nombreSeances,
        nombreEvaluations: nombreEvals
    };
    sommatif.niveauEngagement = determinerNiveauEngagement(sommatif.engagement);

    // Rétrocompat : alternatif pointe vers sommatif
    return { sommatif: sommatif, alternatif: sommatif };
}

/* ===============================
   EXPORTS WINDOW
   =============================== */
window.calculerCorrelationPearson = calculerCorrelationPearson;
window.determinerNiveauEngagement = determinerNiveauEngagement;
window.obtenirIndicesCP = obtenirIndicesCP;
window.obtenirHistoriqueIndicesCP = obtenirHistoriqueIndicesCP;
window.calculerPerformancePAN = calculerPerformancePAN;
window.calculerTousLesIndices = calculerTousLesIndices;
window.calculerIndicesEtudiant = calculerIndicesEtudiant;
// Producteurs indice A (#224)
window.calculerAssiduite = calculerAssiduite;
window.calculerEtSauvegarderIndicesAssiduite = calculerEtSauvegarderIndicesAssiduite;
window.calculerAssiduitePourAffichage = calculerAssiduitePourAffichage;

console.log('✅ Module indices.js chargé (Beta 98.4 - refacto indice A #224)');

})();
