/* ===============================
   MODULE: INDICES A-C-P (CENTRALISÉ)
   Beta 98.4 - Refacto indice A (#224)

   Regroupe les fonctions de LECTURE, CALCUL et UTILITAIRES
   des indices A-C-P, précédemment dispersées dans :
   - profil-etudiant.js (calculerTousLesIndices, calculerPerformancePAN)
   - apercu-contenu.js (calculerIndicesEtudiant, calculerCorrelationPearson)
   - etudiants.js (calculerCorrelationPearson - doublon)
   - portfolio.js (obtenirIndicesCP)

   PRODUCTEURS :
   - calculerEtSauvegarderIndicesAssiduite() → ici (déplacé depuis saisie-presences.js)
   - calculerAssiduite(da, dateLimite) → ici (fonction canonique unique)
   - calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle) → ici
   - calculerEtStockerIndicesCP() → portfolio.js

   STRATÉGIE CACHE (audit 26 mars 2026) :
   - Les indices sont recalculés à la demande par les modules lecteurs
     (profil-etudiant, apercu-contenu) via calculerTousLesIndices().
   - Les valeurs sont aussi persistées (cle('indicesAssiduite'), cle('indicesCP'))
     et lues par evaluation.js et portfolio.js sans recalcul.
   - Pas d'invalidation automatique : si des présences/évaluations changent,
     les indices stockés peuvent être stale jusqu'au prochain recalcul.
   - Ce compromis est accepté : les modules qui affichent les indices
     recalculent toujours (SSoT respecté en lecture), et les modules qui
     lisent le cache (portfolio, évaluation) tolèrent un léger décalage.

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

/* ===============================
   PRODUCTEUR : INDICE A (ASSIDUITÉ)
   Fonction canonique unique — #224
   =============================== */

/**
 * Construit l'ensemble des dates de séances saisies pour le GROUPE de l'étudiant·e.
 * FIX #220 : depuis le groupe (pas juste l'étudiant·e), pour que les absences comptent.
 * FIX #330 : restreint aux étudiant·es du MÊME groupe — depuis la consolidation
 * multi-groupes (chantier D), groupeEtudiants peut contenir le roster du cours
 * ENTIER ; sans ce filtre, chaque séance saisie de l'autre groupe compte comme
 * une absence complète pour tout le groupe affiché. Si le groupe de l'étudiant·e
 * est introuvable (fiche absente ou champ groupe vide), on retombe sur le roster
 * complet (comportement antérieur, correct pour un roster mono-groupe).
 *
 * @param {string} da - Numéro DA de l'étudiant·e dont on calcule l'assiduité
 * @param {Array} presences - Tableau des fiches de présence
 * @returns {Set} Dates (YYYY-MM-DD) ayant une saisie pour le groupe
 */
function construireDatesSaisiesGroupe(da, presences) {
    var etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    if (!Array.isArray(etudiantsGroupe)) etudiantsGroupe = [];

    var fiche = null;
    for (var i = 0; i < etudiantsGroupe.length; i++) {
        if (String(etudiantsGroupe[i].da) === String(da)) { fiche = etudiantsGroupe[i]; break; }
    }
    var groupeEleve = fiche ? (fiche.groupeReel || fiche.groupe || null) : null;

    var dasGroupe = new Set();
    etudiantsGroupe.forEach(function(e) {
        if (!e.da) return;
        if (groupeEleve !== null && (e.groupeReel || e.groupe || null) !== groupeEleve) return;
        dasGroupe.add(String(e.da));
    });

    var datesSaisies = new Set();
    presences.forEach(function(p) {
        if (p.date && dasGroupe.has(String(p.da))) datesSaisies.add(p.date);
    });
    return datesSaisies;
}

/**
 * Calcule l'assiduité sommative d'un étudiant.
 * Source de vérité : seancesCompletes du groupe-cours × datesSaisies du groupe
 * de l'étudiant·e (FIX #330 : jamais celles de l'autre groupe du même cours).
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

    // #398 : date LOCALE (l'UTC basculait « aujourd'hui » à demain dès 20 h EDT)
    var aujourdhui = dateLimite || window.dateLocaleYMD();

    // FIX #220 + #330 : dates saisies du groupe de l'étudiant·e (helper partagé)
    var datesSaisies = construireDatesSaisiesGroupe(da, presences);

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
    // #397 : pipeline sur N étudiants — cache de lecture pour la durée du lot
    // (calculerAssiduite relisait presences + groupeEtudiants PAR étudiant :
    // ~113 ms de parses répétés à 75 étudiants, mesuré à l'audit).
    if (typeof demarrerCacheLecture === 'function') demarrerCacheLecture();
    try {
        var etudiants = obtenirDonneesSelonMode('groupeEtudiants');

        var indices = {
            sommatif: {},
            dateCalcul: new Date().toISOString()
        };

        var etudiantsActifs = (etudiants || []).filter(function(e) {
            return !estEtudiantExclu(e);
        });

        etudiantsActifs.forEach(function(etudiant) {
            indices.sommatif[etudiant.da] = calculerAssiduite(etudiant.da, null);
        });

        sauvegarderDonneesSelonMode('indicesAssiduite', indices);

        if (typeof calculerEtStockerIndicesCP === 'function') {
            calculerEtStockerIndicesCP();
        }

        return indices;
    } finally {
        if (typeof terminerCacheLecture === 'function') terminerCacheLecture();
    }
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

    // FIX #220 + #330 : dates saisies du groupe de l'étudiant·e (helper partagé)
    var datesSaisies = construireDatesSaisiesGroupe(da, presences);

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
 * STRUCTURE (Beta 95.5, structure unifiée plate) :
 * { date, pratique, C, P, details }
 *
 * Session C (Lot 3) : le jeton déprécié `pratique` (SOM|PAN) a été retiré —
 * il était ignoré au calcul (indices identiques quelle que soit la valeur).
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object} - Structure actuelle { date, pratique, C, P, details } ou null
 */
function obtenirIndicesCP(da) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const actuel = indicesCP[da]?.actuel;

    if (!actuel) return null;

    return actuel;
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
    // #399 (L7) : filtre aligné sur le motif standard du moteur — un 0 est une
    // note VALIDE (le filtre truthy l'excluait du corpus : repli « 3 meilleures »
    // rendait 0,70 au lieu de 0,467 sur [0, 80, 60]).
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da && e.noteFinale !== null && e.noteFinale !== undefined);

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
    return moyenne / 100;
}

/* ===============================
   LECTEURS COMPOSITES
   =============================== */

/**
 * Calcule tous les indices pour un étudiant
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - Objet avec tous les indices
 *
 * STRUCTURE DE RETOUR :
 * {
 *   A: 85,              // % assiduité
 *   C: 67,              // % complétion (selon pratique)
 *   P: 72,              // % performance (selon pratique)
 *   M: 0.760,           // Mobilisation (composite, (A+C)/2)
 *   pratique: 'SOM'     // Pratique utilisée pour le calcul
 * }
 */
function calculerTousLesIndices(da, _cacheIndicesA, _cacheIndicesCP) {
    // ========================================
    // INDICE A : SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') (calculé par calculerEtSauvegarderIndicesAssiduite ci-dessus)
    // #397 : caches optionnels (patron calculerIndicesEtudiant) — un rendu qui
    // boucle sur N étudiants lit les deux clés UNE fois et les passe ici.
    // ========================================
    const indicesAssiduite = _cacheIndicesA || db.getSync(cle('indicesAssiduite'), {});
    const assiduiteSommatif = indicesAssiduite.sommatif?.[da];

    // Extraire l'indice (gérer ancien format nombre et nouveau format objet)
    let A = 0;
    if (typeof assiduiteSommatif === 'object' && assiduiteSommatif.indice !== undefined) {
        A = assiduiteSommatif.indice;
    } else if (typeof assiduiteSommatif === 'number') {
        A = assiduiteSommatif;
    }

    // Étiquette de la pratique active (Session C, Lot 3 : jeton SOM|PAN retiré de
    // la signature ; dérivé en interne pour le champ `.pratique` du retour).
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const typeActif = (typeof obtenirTypePratiqueActive === 'function') ? obtenirTypePratiqueActive() : null;
    const pratique = typeActif === 'sommative' ? 'SOM' : 'PAN';

    // INDICES C, P : Lire depuis indicesCP (Single Source of Truth)
    let C = 0;
    let P = 0;
    // #394 (règle 4) : une note stockée « non constructible » se propage aux
    // affichages (qui montrent « — » au lieu d'un 0 trompeur). Champ additif :
    // absent (entrées antérieures) ⇒ constructible.
    let noteConstructible = true;

    if (_cacheIndicesCP || typeof obtenirIndicesCP === 'function') {
        // #397 : cache fourni → entrée lue dedans ; sinon lecture SSOT historique.
        const indicesCP = _cacheIndicesCP
            ? (_cacheIndicesCP[da]?.actuel || null)
            : obtenirIndicesCP(da);
        if (indicesCP) {
            C = (indicesCP.C || 0) / 100;
            P = (indicesCP.P || 0) / 100;
            noteConstructible = indicesCP.noteConstructible !== false;
        } else {
            // Fallback : calculer à la volée si pas encore généré
            console.warn(`⚠️ indicesCP non trouvé pour ${da} (${pratique}) - Calcul à la volée`);
            if (typeof calculerTauxCompletion === 'function') {
                const taux = calculerTauxCompletion(da);
                C = taux !== null ? taux / 100 : 0;
            }
            P = calculerPerformancePAN(da);
        }
    } else {
        // Fallback : fonctions anciennes si module pas chargé
        console.warn('⚠️ obtenirIndicesCP non disponible - Calcul à la volée');
        if (typeof calculerTauxCompletion === 'function') {
            const taux = calculerTauxCompletion(da);
            C = taux !== null ? taux / 100 : 0;
        }
        P = calculerPerformancePAN(da);
    }

    // INDICES COMPOSITES
    const M = (A + C) / 2;

    return {
        A: Math.round(A * 100),
        C: Math.round(C * 100),
        P: Math.round(P * 100),
        M: parseFloat(M.toFixed(3)),
        pratique: pratique,
        noteConstructible: noteConstructible
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
        indicesSOM = { C: indicesCPEtudiant.C, P: indicesCPEtudiant.P };
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
        nombreSeances: nombreSeances,
        nombreEvaluations: nombreEvals,
        // #394 (règle 4) : additif — absent sur les entrées antérieures ⇒ constructible
        noteConstructible: !indicesCPEtudiant || indicesCPEtudiant.noteConstructible !== false
    };

    // Rétrocompat : alternatif pointe vers sommatif
    return { sommatif: sommatif, alternatif: sommatif };
}

/* ===============================
   EXPORTS WINDOW
   =============================== */
window.calculerCorrelationPearson = calculerCorrelationPearson;
window.obtenirIndicesCP = obtenirIndicesCP;
window.calculerPerformancePAN = calculerPerformancePAN;
window.calculerTousLesIndices = calculerTousLesIndices;
window.calculerIndicesEtudiant = calculerIndicesEtudiant;
// Producteurs indice A (#224)
window.calculerAssiduite = calculerAssiduite;
window.calculerEtSauvegarderIndicesAssiduite = calculerEtSauvegarderIndicesAssiduite;
window.calculerAssiduitePourAffichage = calculerAssiduitePourAffichage;


})();
