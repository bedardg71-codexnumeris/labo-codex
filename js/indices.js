/* ===============================
   MODULE: INDICES A-C-P (CENTRALISÉ)
   Beta 98.4 - Refacto indice A (#224)

   Regroupe les fonctions de LECTURE, CALCUL et UTILITAIRES
   des indices A-C-P, précédemment dispersées dans :
   - profil-etudiant.js (calculerTousLesIndices)
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
 * #735 (lot D du cadrage du dépistage, 19 sept. 2026) — LA DATE D'ARRIVÉE D'UN·E ÉLÈVE.
 * Champ FACULTATIF de sa fiche (`dateArrivee`, « AAAA-MM-JJ », même format que les dates de
 * présences) : pour un·e étudiant·e arrivé·e en cours de trimestre, l'assiduité se compte à
 * partir de cette date. Absent, vide ou mal formé : `null`, et rien ne change au calcul.
 * Lecteur UNIQUE : les trois parcours de séances (calcul, saisie en direct, liste des absences
 * du profil) passent par lui.
 *
 * @param {string} da - Numéro DA
 * @returns {string|null} « AAAA-MM-JJ » ou null
 */
function obtenirDateArrivee(da) {
    var etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    if (!Array.isArray(etudiantsGroupe)) return null;
    for (var i = 0; i < etudiantsGroupe.length; i++) {
        if (String(etudiantsGroupe[i].da) === String(da)) {
            var d = etudiantsGroupe[i].dateArrivee;
            return (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) ? d : null;
        }
    }
    return null;
}

/**
 * #743 (lot D, 19 sept. 2026) — L'ASSIDUITÉ INCONNUE A UNE SEULE FORME : `null`.
 * Tant qu'aucune séance saisie ne compte pour un·e élève, son assiduité n'existe pas : ni 100 %
 * (l'ancien `indice: 1`), ni 0 %. Ce lecteur rend la proportion 0-1 d'une entrée du magasin
 * `indicesAssiduite.sommatif[da]`, ou `null` :
 *   - entrée absente, ou `indice` qui n'est pas un nombre → null ;
 *   - objet qui DIT n'avoir aucune séance (`nombreSeances` ou `periodesOffertes` à 0) → null — y
 *     compris le STOCK écrit avant ce lot (`indice: 1, nombreSeances: 0`), lu comme inconnu sans
 *     être réécrit ; un objet qui ne porte pas ces compteurs est cru sur son `indice` ;
 *   - ancien format « nombre » → le nombre.
 * Tout lecteur du magasin passe par ici ; aucun ne transforme l'inconnu en 0 ni en 100.
 *
 * @param {Object|number|null|undefined} entree
 * @returns {number|null} proportion 0-1, ou null si inconnue
 */
function lireIndiceAssiduite(entree) {
    if (typeof entree === 'number') return Number.isFinite(entree) ? entree : null;
    if (!entree || typeof entree !== 'object') return null;
    if (typeof entree.indice !== 'number' || !Number.isFinite(entree.indice)) return null;
    if (entree.nombreSeances === 0 || entree.periodesOffertes === 0) return null;
    return entree.indice;
}

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
 *
 * #743 : sans aucune séance qui compte, `indice` vaut `null` (assiduité INCONNUE), jamais 1.
 * #735 : les séances antérieures à `dateArrivee` (fiche de l'élève) ne comptent pas.
 *
 * @returns {Object} { indice (0-1 ou null), periodesPresentes, periodesOffertes, nombreSeances }
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

    // #735 : les séances d'AVANT l'arrivée ne sont pas des absences — elles ne comptent pas.
    var dateArrivee = obtenirDateArrivee(da);

    var dates = Object.keys(seancesCompletes).filter(function(d) {
        if (d > aujourdhui) return false;
        if (dateArrivee && d < dateArrivee) return false;
        // Pour aujourd'hui (ou dateLimite) : inclure seulement si saisie existe pour cet étudiant
        if (d === aujourdhui && !dateLimite) {
            return presencesEtudiant.some(function(p) { return p.date === d; });
        }
        return datesSaisies.has(d);
    }).sort();

    if (dates.length === 0) {
        return { indice: null, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 };   // #743 : inconnue, pas 100 %
    }

    var totalPeriodesOffertes = 0;
    var totalPeriodesPresentes = 0;
    var nombreSeances = 0;
    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

    dates.forEach(function(date) {
        // #540 lot C : 0, pas 2. Cette garde ne se déclenche que si le module de saisie
        // n'est pas chargé — inerte aujourd'hui, mais un changement d'ordre de chargement
        // la réveillerait EN SILENCE, avec un dénominateur de 2 périodes par séance.
        var nombrePeriodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(date) : 0;

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
        return { indice: null, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 };   // #743 : inconnue, pas 100 %
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
 * Orchestre le calcul et la sauvegarde de l'indice A pour tous les élèves du groupe.
 * Appelée après chaque enregistrement de présences.
 * Chaîne calculerEtStockerIndicesCP() pour recalculer E.
 *
 * #745 (lot E du cadrage du dépistage, 17 sept. 2026) — UN ÉLÈVE EXCLU PAR STATUT EST CALCULÉ
 * COMME LES AUTRES. Tranché par Grégoire le 16 sept. : son profil se calcule avec la règle de sa
 * pratique, affiche son statut, et reste hors des moyennes du groupe. Avant, ce producteur
 * l'écartait : son A se lisait 0 malgré ses présences. « Hors des moyennes » se tient à la
 * LECTURE : chaque moyenne, statistique ou courbe du groupe part d'une liste filtrée par
 * `estEtudiantExclu` et lit ce magasin DA par DA ; aucune ne le parcourt par ses clés
 * (sentinelle-lot-E-745-eleve-exclu).
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

        (etudiants || []).forEach(function(etudiant) {
            indices.sommatif[etudiant.da] = calculerAssiduite(etudiant.da, null);
        });

        sauvegarderDonneesSelonMode('indicesAssiduite', indices, { discret: true });   // recalcul : l'usager n'a rien écrit

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
 * @returns {Object} { taux (0-100, ou null si inconnu — #743), totalPeriodesPresentes }
 */
function calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle) {
    var presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    var seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};

    var dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

    // FIX #220 + #330 : dates saisies du groupe de l'étudiant·e (helper partagé)
    var datesSaisies = construireDatesSaisiesGroupe(da, presences);

    var presencesEtudiant = presences.filter(function(p) { return p.da === da; });

    var periodesPresentes = 0;
    var periodesOffertes = 0;

    // Parcourir toutes les dates du calendrier AVANT dateStr
    var dateArrivee = obtenirDateArrivee(da);   // #735
    var dates = Object.keys(seancesCompletes).sort();
    for (var i = 0; i < dates.length; i++) {
        var dateSeance = dates[i];
        if (dateSeance >= dateStr) continue;
        if (dateArrivee && dateSeance < dateArrivee) continue;
        if (!datesSaisies.has(dateSeance)) continue;

        var nbPeriodes = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(dateSeance) : 0;   // #540 lot C

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
        ? obtenirNombrePeriodesSeance(dateStr) : 0;   // #540 lot C

    // #735 : une séance d'AVANT l'arrivée ne compte pas non plus quand c'est elle qu'on saisit.
    var seanceActuelleCompte = !(dateArrivee && dateStr < dateArrivee);
    var periodesOffertesTotal = periodesOffertes + (seanceActuelleCompte ? nombrePeriodesSeanceActuelle : 0);
    var periodesPresentesTotal = periodesPresentes + (seanceActuelleCompte ? periodesSeanceActuelle : 0);

    // #743 : rien d'offert → taux INCONNU (`null`), plus 100. Les sites d'affichage écrivent un tiret.
    var taux = periodesOffertesTotal === 0 ? null : Math.min(Math.round((periodesPresentesTotal / periodesOffertesTotal) * 100), 100);

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
 *   A: 85,              // % assiduité — `null` si INCONNUE (#743 : aucune séance saisie ne compte)
 *   C: 67,              // % complétion (selon pratique)
 *   P: 72,              // % performance (selon pratique)
 *   M: 0.760,           // Mobilisation (composite, (A+C)/2)
 *   pratique: 'SOM'     // Pratique utilisée pour le calcul
 * }
 *
 * #745 (17 sept. 2026) — UNE SEULE RÈGLE, CELLE DE LA PRATIQUE. Avant, un DA sans entrée stockée
 * tombait dans un repli « à la volée » : A = 0 et P = « les 3 meilleures notes », quelle que soit
 * la pratique (un exclu à P 70 là où sa pratique dit 62,5). Le repli est retiré :
 *   - un élève du groupe, exclu par statut compris, a ses entrées (les deux producteurs le
 *     calculent) ; s'il n'en a pas ENCORE (lecture avant le premier recalcul), ses indices sont
 *     calculés ici par les mêmes fonctions que les producteurs, en lecture seule ;
 *   - un DA qui n'est plus dans le groupe n'est PAS calculé : { A, C, P, M : null,
 *     horsGroupe: true, noteConstructible: false }.
 */
function calculerTousLesIndices(da, _cacheIndicesA, _cacheIndicesCP) {
    // ========================================
    // INDICE A : SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') (calculé par calculerEtSauvegarderIndicesAssiduite ci-dessus)
    // #397 : caches optionnels (patron calculerIndicesEtudiant) — un rendu qui
    // boucle sur N étudiants lit les deux clés UNE fois et les passe ici.
    // ========================================
    const indicesAssiduite = _cacheIndicesA || db.getSync(cle('indicesAssiduite'), {});
    let assiduiteSommatif = indicesAssiduite.sommatif?.[da];

    // Étiquette de la pratique active (Session C, Lot 3 : jeton SOM|PAN retiré de
    // la signature ; dérivé en interne pour le champ `.pratique` du retour).
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const typeActif = (typeof obtenirTypePratiqueActive === 'function') ? obtenirTypePratiqueActive() : null;
    const pratique = typeActif === 'sommative' ? 'SOM' : 'PAN';

    // INDICES C, P : Lire depuis indicesCP (Single Source of Truth)
    // #397 : cache fourni → entrée lue dedans ; sinon lecture SSOT historique.
    let indicesCP = _cacheIndicesCP
        ? (_cacheIndicesCP[da]?.actuel || null)
        : obtenirIndicesCP(da);

    // #745 : sans entrée stockée, le DA est-il dans le groupe ? Même liste que les producteurs.
    if (assiduiteSommatif === undefined || !indicesCP) {
        const dansLeGroupe = (obtenirDonneesSelonMode('groupeEtudiants') || []).some(e => e.da === da);
        if (!dansLeGroupe) {
            return { A: null, C: null, P: null, M: null, pratique: pratique, noteConstructible: false, horsGroupe: true };
        }
        if (assiduiteSommatif === undefined) assiduiteSommatif = calculerAssiduite(da, null);
        // Lot N1b (21 sept. 2026) : l'id que rend LA désignation. Sans pratique assignée, rien à simuler.
        const idActif = (typeof obtenirIdPratiqueActive === 'function') ? obtenirIdPratiqueActive() : null;
        if (!indicesCP && idActif && typeof simulerIndices === 'function') {
            indicesCP = simulerIndices(da, idActif);
        }
    }

    // #743 : lecteur unique du magasin — `null` quand l'assiduité est inconnue (jamais 0, jamais 100).
    const A = lireIndiceAssiduite(assiduiteSommatif);

    // #394 (règle 4) : une note stockée « non constructible » se propage aux
    // affichages (qui montrent « — » au lieu d'un 0 trompeur). Champ additif :
    // absent (entrées antérieures) ⇒ constructible.
    // Lot N1b (21 sept. 2026) : SANS PRATIQUE, C EST INCONNU — `null`, la forme de l'assiduité inconnue
    // (#743). L'écrivain le dit par `completionConstructible: false` (portfolio.js) ; sans entrée du tout
    // (rien d'assigné, rien à simuler) c'est la même ignorance. Avant : 0, que le filtre « A ou C sous
    // la borne », la mobilisation et la carte RàI lisaient comme un vrai zéro — tout le groupe signalé.
    let C = 0;
    let P = 0;
    let noteConstructible = true;
    let completionConstructible = true;
    if (indicesCP) {
        C = (indicesCP.C || 0) / 100;
        P = (indicesCP.P || 0) / 100;
        noteConstructible = indicesCP.noteConstructible !== false;
        completionConstructible = indicesCP.completionConstructible !== false;
    } else {
        // Pratique introuvable au registre : rien à calculer, et pas de nombre inventé.
        noteConstructible = false;
        completionConstructible = false;
    }

    // INDICES COMPOSITES — #743 : sans A, pas de M (une moyenne avec un inconnu n'existe pas). Sans C non plus.
    const M = (A === null || !completionConstructible) ? null : (A + C) / 2;

    return {
        A: (A === null) ? null : Math.round(A * 100),
        C: completionConstructible ? Math.round(C * 100) : null,
        P: Math.round(P * 100),
        M: (M === null) ? null : parseFloat(M.toFixed(3)),
        pratique: pratique,
        noteConstructible: noteConstructible,
        completionConstructible: completionConstructible
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
    // (#902, mesuré le 17 sept. 2026 : plus aucun producteur n'écrit `.SOM` depuis Beta 95.5 ; la
    // branche `else` ne sert qu'à un stock antérieur et rend 0 sinon — sans conséquence observable.)
    const estNouveauFormat = indicesCPEtudiant && !indicesCPEtudiant.SOM && indicesCPEtudiant.C !== undefined;

    let indicesSOM = null;

    if (estNouveauFormat) {
        indicesSOM = { C: indicesCPEtudiant.C, P: indicesCPEtudiant.P };
    } else if (indicesCPEtudiant) {
        indicesSOM = indicesCPEtudiant.SOM || null;
    }

    const assiduiteSommatif = indicesA.sommatif?.[da];
    const nombreSeances = (assiduiteSommatif && typeof assiduiteSommatif === 'object') ? (assiduiteSommatif.nombreSeances || 0) : 0;
    const nombreEvals = indicesSOM?.details?.nbArtefactsRemis || indicesSOM?.details?.nbProductionsRemises || 0;

    const sommatif = {
        assiduite: lireIndiceAssiduite(assiduiteSommatif),   // #743 : null si inconnue
        // Lot N1b : `null` quand la complétion n'est pas constructible (sans pratique) — jamais un 0.
        completion: (indicesCPEtudiant && indicesCPEtudiant.completionConstructible === false) ? null
            : (indicesSOM ? indicesSOM.C / 100 : 0),
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
window.calculerTousLesIndices = calculerTousLesIndices;
window.calculerIndicesEtudiant = calculerIndicesEtudiant;
// Producteurs indice A (#224)
window.calculerAssiduite = calculerAssiduite;
window.calculerEtSauvegarderIndicesAssiduite = calculerEtSauvegarderIndicesAssiduite;
window.calculerAssiduitePourAffichage = calculerAssiduitePourAffichage;
// Lot D (#735, #743) : la date d'arrivée et la forme unique de l'assiduité inconnue
window.obtenirDateArrivee = obtenirDateArrivee;
window.lireIndiceAssiduite = lireIndiceAssiduite;


})();
