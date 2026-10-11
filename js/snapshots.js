/**
 * MODULE SNAPSHOTS - Capture longitudinale progression étudiants (Beta 94)
 *
 * Fonctionnalités :
 * 1. Snapshots hebdomadaires : Portrait complet du groupe chaque semaine
 * 2. Snapshots interventions : Capture avant/après interventions RàI
 * 3. Reconstruction rétroactive : Recalcul des semaines passées
 * 4. Export/Import : Sauvegarde et restauration des snapshots
 *
 * IMPORTANT (10 décembre 2025) : Distinction ponctuel vs cumulatif
 *
 * GRAPHIQUE INDIVIDUEL (profil étudiant) :
 * - A : CUMULATIF (assiduité depuis le début du trimestre)
 * - C : CUMULATIF (travaux remis / travaux dus jusqu'à cette date)
 * - P : CUMULATIF (moyenne des évaluations jusqu'à cette date)
 * → Tous cumulatifs pour mieux dépister l'impact à long terme sur l'apprentissage
 *
 * GRAPHIQUE GROUPE (tableau de bord) :
 * - A : PONCTUEL (taux de présence à cette séance)
 * - C : PONCTUEL (taux de remise du dernier artefact dû)
 * - P : CUMULATIF (moyenne des évaluations jusqu'à cette date)
 *
 * - L'indice E (engagement) a été retiré du code (avril 2026) ; les snapshots
 *   historiques peuvent contenir un champ E qui n'est plus lu nulle part.
 *
 * Structure de données :
 * localStorage.snapshots = {
 *   hebdomadaires: [
 *     {
 *       id: "2025-S01",
 *       numSemaine: 1,
 *       dateDebut: "2025-01-06",
 *       dateFin: "2025-01-12",
 *       timestamp: "2025-01-12T23:59:59Z",
 *       etudiants: [
 *         { da: "1234567", A: 85, C: 90, P: 75, pattern: "Stable", rai: "Niveau 1" }
 *       ],
 *       groupe: {
 *         moyenneA: 82, moyenneC: 88, moyenneP: 71,
 *         nbEtudiants: 30, dispersionA: 15.2, dispersionC: 12.5, dispersionP: 18.3
 *       }
 *     }
 *   ],
 *   interventions: [
 *     {
 *       id: "rai-123",
 *       date: "2025-01-15",
 *       type: "niveau2",
 *       titre: "Soutien Structure",
 *       etudiantsDA: ["1234567", "2345678"],
 *       avant: { "1234567": { A: 75, C: 60, P: 65 } },
 *       apres: null  // Sera rempli 2-3 semaines plus tard
 *     }
 *   ]
 * }
 *
 * @author Grégoire Bédard
 * @date 10 décembre 2025
 * @version 1.1.0 (Beta 94 - Snapshots ponctuals A-C-P uniquement)
 */

(function() {
'use strict';

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise le module snapshots au chargement
 */
/**
 * Helper pour obtenir l'identifiant unique du groupe-cours actif
 * Priorité : _groupeCoursId (toujours unique par groupe-cours)
 * Fallback : id (peut être coursId partagé entre groupes selon le code path)
 */
function obtenirCoursIdPourSnapshots() {
    // Lot E du cadrage « Rencontres » (12 sept. 2026) : la règle vit dans modes.js
    // (`obtenirIdContexteActif`), ce helper n'est plus qu'un nom local pour ses trois appelants.
    return obtenirIdContexteActif();
}

/**
 * Helper pour obtenir la clé snapshots avec namespacing par trimestre ET par groupe-cours
 * Clé format : h2026_snapshots_GC123456789
 */
function cleSnapshots() {
    const coursId = obtenirCoursIdPourSnapshots();
    if (!coursId) {
        // Pas de cours actif : retourner null pour empêcher la création de snapshots orphelins
        return null;
    }
    return cle('snapshots') + '_' + coursId;
}

function initialiserModuleSnapshots() {

    const cleSnap = cleSnapshots();
    if (!cleSnap) {
        return;
    }

    // ✅ CORRECTIF (2 mars 2026): Race condition fatale corrigée
    // AVANT: getSync() → null (memoryCache vide au boot) → setSync() écrasait IndexedDB
    // avec une structure vide, détruisant les snapshots reconstruits.
    // MAINTENANT: toujours vérifier IndexedDB (async) avant de créer la structure initiale.
    if (db.useIndexedDB) {
        db.get(cleSnap).then(snapshotsFrais => {
            if (snapshotsFrais) {
                // IndexedDB a des données → peupler le memoryCache pour getSync()
                db.memoryCache.set(cleSnap, snapshotsFrais);
                // Aussi tenter localStorage (sera ignoré si trop grand)
                try {
                    localStorage.removeItem(cleSnap);
                    localStorage.setItem(cleSnap, JSON.stringify(snapshotsFrais));
                } catch (e) {
                    // QuotaExceeded — memoryCache suffit
                    try { localStorage.removeItem(cleSnap); } catch (ex) { console.warn('[Snapshots] localStorage.removeItem skipped:', cleSnap, ex.message || ex); }
                }
            } else {
                // Vraiment première utilisation — créer la structure
                const structure = {
                    hebdomadaires: [],
                    interventions: [],
                    metadata: {
                        version: '1.0.0',
                        dateCreation: new Date().toISOString(),
                        dernierSnapshotHebdo: null,
                        dernierSnapshotIntervention: null
                    }
                };
                // #353 Option C (W2) : setSync (tracké dans _pendingWrites, drainé
                // par Option B), pas db.set() fire-and-forget. Idem repli ligne ~146.
                db.setSync(cleSnap, structure);
            }
            // Rafraîchir l'affichage si on est dans Réglages → Données (bloc Captures)
            if (typeof afficherStatutSnapshots === 'function') {
                afficherStatutSnapshots();
            }
        }).catch(e => {
            console.warn('⚠️ Lecture IndexedDB snapshots échouée, fallback sync:', e.message);
            // Fallback : créer si pas dans localStorage non plus
            const snapshots = db.getSync(cleSnap, null);
            if (!snapshots) {
                db.setSync(cleSnap, {
                    hebdomadaires: [],
                    interventions: [],
                    metadata: { version: '1.0.0', dateCreation: new Date().toISOString(), dernierSnapshotHebdo: null, dernierSnapshotIntervention: null }
                });
            }
        });
    } else {
        // Pas d'IndexedDB — comportement synchrone d'origine
        const snapshots = db.getSync(cleSnap, null);
        if (!snapshots) {
            db.setSync(cleSnap, {
                hebdomadaires: [],
                interventions: [],
                metadata: { version: '1.0.0', dateCreation: new Date().toISOString(), dernierSnapshotHebdo: null, dernierSnapshotIntervention: null }
            });
        }
    }

    // Vérifier si nouveau snapshot hebdomadaire nécessaire
    verifierEtCapturerSnapshotHebdomadaire();

}

/* ===============================
   CALCUL HISTORIQUE DES INDICES
   =============================== */

// Cache global pour optimiser les performances
let _cacheEvaluations = null;

/**
 * ✨ NOUVEAU (Beta 94) : Calcule les indices A-C-P jusqu'à une date limite
 * Permet la reconstruction rétroactive fidèle à l'historique
 *
 * IMPORTANT (10 déc 2025) : L'indice E n'est PLUS calculé dans les snapshots
 * - Les snapshots sont PONCTUALS (photo à un moment précis)
 * - E reste disponible dans le profil étudiant comme indicateur LONGITUDINAL
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
 * @param {Array} evaluationsCache - Cache optionnel des évaluations (pour performance)
 * @param {boolean} usePonctualA - (Déprécié #224) Ignoré, toujours cumulatif
 * @returns {Object} - {A: number|null, C: number, P: number} — A `null` quand l'assiduité est inconnue (#743)
 */
function calculerIndicesHistoriques(da, dateLimite, evaluationsCache = null, usePonctualA = false) {
    // #224 : Utiliser la fonction canonique unique (toujours cumulatif)
    // #743 (lot D, 19 sept. 2026) : sans séance qui compte à cette date, A est INCONNU (`null`) — ni 100
    // (l'ancien défaut), ni 0 (`Math.round(null * 100)`). Les courbes lisent déjà `null` comme « pas de donnée ».
    let indiceA = null;

    if (typeof calculerAssiduite === 'function') {
        const resultA = calculerAssiduite(da, dateLimite);
        indiceA = (resultA.indice === null || resultA.indice === undefined) ? null : Math.round(resultA.indice * 100);
    }

    // Complétion (C) et Performance (P) : Filtrer les évaluations jusqu'à dateLimite
    let indiceC = 100;

    // ⚡ OPTIMISATION : Utiliser le cache si fourni
    // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
    const evaluations = evaluationsCache || obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Calculer C : Proportion de PRODUCTIONS remises (pas évaluations)
    // ✅ CORRECTION (7 déc 2025) : Aligner avec pratique-sommative.js
    // Compter PRODUCTIONS, pas ÉVALUATIONS (évite double comptage avec reprises)

    // Lire les productions
    const productions = obtenirDonneesSelonMode('productions') || [];

    // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Utiliser dateEcheance de la production
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
    // Lot N2 (#716) : c'est l'échéance qui décide si une évaluation entre dans le P historique (plus bas).
    const groupeCoursId = obtenirCoursIdPourSnapshots();
    const obtenirDateEcheance = (evaluation) => {
        const production = productions.find(p => p.id === evaluation.productionId);
        if (!production) {
            return evaluation.dateEvaluation;
        }
        const { date, assignee } = obtenirEcheanceEffective(production, groupeCoursId);
        if (!assignee) return null;
        return date || evaluation.dateEvaluation;
    };

    // ✅ CORRECTION (10 déc 2025): Identifier les productions DUES jusqu'à cette date (dateEcheance)
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe + assignee)
    // ✅ CORRECTIF (2 mars 2026): Exclure les productions d'un trimestre précédent.
    // Des productions avec des dates antérieures au semestre courant (ex: a2025 dans h2026)
    // faussaient le calcul en rendant productionsDues non-vide dès la semaine 1.
    let dateDebutTrimestreHist = '';
    try {
        const cadreHist = db.getSync(cle('cadreCalendrier'), null);
        if (cadreHist && cadreHist.dateDebut) dateDebutTrimestreHist = cadreHist.dateDebut;
    } catch (e) { console.warn('[Snapshots] cadreCalendrier read skipped:', e.message || e); }
    const productionsDues = productions.filter(production => {
        if (production.facultatif) return false;
        if (production.type === 'portfolio') return false;

        const { date, assignee } = obtenirEcheanceEffective(production, groupeCoursId);
        if (!assignee) return false;
        if (dateDebutTrimestreHist && date < dateDebutTrimestreHist) return false;
        return date && date <= dateLimite;
    });

    if (productionsDues.length === 0) {
        // ✅ CORRECTION (Beta 93) : null au lieu de 100% quand aucune production due
        indiceC = null;
    } else {
        // 2. Compter combien CET ÉTUDIANT a remis (évaluation certifiée) parmi les productions dues
        // ✅ IMPORTANT (Beta 94 - 10 déc): Option B - Considérer dateEcheance, pas dateEvaluation
        // Un travail remis en retard est compté rétroactivement dès son échéance
        // Cela rend C monotone croissant (jamais de baisse) et fidèle aux échéances
        const productionsRemises = productionsDues.filter(production => {
            return evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                window.evaluationEntreDansLaNote(e) &&   // lot A (16 sept. 2026) : les deux prédicats de pratique-registre.js
                !window.evaluationNonRemise(e) &&
                !window.evaluationNonRecevable(e)   // lot 30 (17 sept. 2026)
            );
        });

        indiceC = Math.round((productionsRemises.length / productionsDues.length) * 100);
    }

    // P : LA NOTE DU COURS TELLE QU'ELLE SE CALCULAIT À `dateLimite` (lot N2, #716, 22 sept. 2026).
    // La fonction qui écrit l'indice P d'aujourd'hui (`calculerNoteDuCours`, portfolio.js), appliquée aux
    // seules évaluations de l'élève dont la production est échue à cette date (échéance effective du
    // groupe-cours, comme C ci-dessus). Les évaluations passent par le contexte de simulation (modes.js) :
    // chaque famille les lit par son accesseur habituel, son moteur n'est pas touché.
    // Avant : deux copies de la sélection (une méthode historique propre à la standards et à la sommative —
    // cette dernière lisait `e.da` / `e.note` et ne trouvait jamais rien), puis un repli qui convertissait
    // les niveaux par une table I/D/M/E codée en dur. Aucun P n'est plus fabriqué : sans note, `null`.
    // Décisions de Grégoire (22 sept. 2026) :
    //   · à une date passée, la note est PROVISOIRE (`noteProvisoire`) — « notes finales » compterait 0
    //     pour des obligatoires pas encore dues ;
    //   · la DÉNOTATION n'a pas de P historique : sa note est un jugement saisi, pas un calcul sur des
    //     évaluations, et il n'en garde qu'une version.
    // Lot N1a (#710) : sans pratique assignée, aucun P non plus.
    // ⚠ TARIR N'EST PAS RÉPARER : les snapshots déjà écrits gardent leur P jusqu'à ce que l'enseignant
    // clique « Recalculer les captures » (Réglages › Captures et recherche). Rien n'est réécrit d'office.
    let indiceP = null;
    const resolutionP = (typeof resoudrePratiqueActive === 'function') ? resoudrePratiqueActive() : null;
    const pratiqueP = (resolutionP && resolutionP.etat === 'ok') ? resolutionP.pratique : null;
    const estDenotation = !!(pratiqueP && typeof pratiqueP.obtenirCode === 'function' && pratiqueP.obtenirCode() === 'DEN');

    if (pratiqueP && !estDenotation && typeof calculerNoteDuCours === 'function' && typeof definirContexteSimulation === 'function') {
        // Ce que la note lit aujourd'hui (même filtre de cours), réduit à l'élève et à la date.
        const evaluationsDeLaNote = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const echues = evaluationsDeLaNote.filter(e => {
            if (e.etudiantDA !== da) return false;
            const dateEcheance = obtenirDateEcheance(e);
            return !!dateEcheance && dateEcheance <= dateLimite;
        });
        if (echues.length > 0) {
            definirContexteSimulation({ evaluationsSauvegardees: echues, noteProvisoire: true });
            try {
                const noteDecimale = calculerNoteDuCours(da, pratiqueP);
                indiceP = (noteDecimale === null) ? null : arrondirIndiceSurCent(noteDecimale);
            } catch (error) {
                console.error('[calculerIndicesHistoriques] Note du cours non calculable :', error);
                indiceP = null;
            } finally {
                effacerContexteSimulation();
            }
        }
    }

    // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Engagement (E) n'est PLUS calculé dans les snapshots
    // Les snapshots sont PONCTUALS (A-C-P uniquement)
    // E reste disponible dans le profil étudiant comme indicateur LONGITUDINAL/CUMULATIF

    const resultat = {
        A: indiceA,
        C: indiceC,
        P: indiceP
    };

    // 🐛 DEBUG - Désactivé pour performance

    return resultat;
}

/* ===============================
   SNAPSHOTS HEBDOMADAIRES
   =============================== */

/**
 * Vérifie si un nouveau snapshot hebdomadaire est nécessaire
 * Appelé automatiquement au chargement de l'application
 *
 * 🔧 FIX #116-A (2 juillet 2026) : les dates capturées viennent des séances
 * du GROUPE-COURS ACTIF (obtenirSeancesCompletes, group-specific) et non plus
 * du calendrier partagé du trimestre (union des jours de cours de TOUS les
 * groupes-cours) qui créait des captures phantômes pour les jours où seul un
 * AUTRE groupe a cours. Le wrapper LEGACY capturerSnapshotHebdomadaire a été
 * retiré en même temps (zéro-dette).
 */
async function verifierEtCapturerSnapshotHebdomadaire() {
    const snapshots = db.getSync(cleSnapshots(), null);
    if (!snapshots) return;

    const calendrier = obtenirCalendrierComplet();
    if (!calendrier) return;

    const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE (YYYY-MM-DD)

    // Trouver la semaine actuelle
    const jourActuel = calendrier[aujourdhui];
    if (!jourActuel || !jourActuel.numeroSemaine) return;

    const numSemaineActuelle = jourActuel.numeroSemaine;

    // Vérifier si snapshot déjà capturé pour cette semaine
    const snapshotExiste = snapshots.hebdomadaires.some(s => s.numSemaine === numSemaineActuelle);
    if (snapshotExiste) return;

    // Dates de la semaine courante où le groupe-cours ACTIF a réellement
    // une séance (passées ou aujourd'hui — capturerSnapshotSeance refuse
    // de toute façon les dates futures)
    if (typeof obtenirSeancesCompletes !== 'function') return;
    const seancesCompletes = obtenirSeancesCompletes();
    if (!seancesCompletes) return;

    const datesSemaine = Object.keys(seancesCompletes)
        .filter(date => {
            const seances = seancesCompletes[date];
            return seances && seances.length > 0
                && seances[0].numeroSemaine === numSemaineActuelle
                && date <= aujourdhui;
        })
        .sort();

    for (const date of datesSemaine) {
        // numeroSemaine fourni par les séances group-specific : court-circuite
        // la validation contre le calendrier partagé (même patron que la
        // reconstruction rétroactive)
        await capturerSnapshotSeance(date, null, {
            numeroSemaine: seancesCompletes[date][0].numeroSemaine
        });
    }
}

/**
 * ✨ REFONTE (Beta 93) : Capture un snapshot pour UNE séance spécifique
 * @param {string} dateSeance - Date de la séance au format 'YYYY-MM-DD'
 * @param {Array} evaluationsCacheParam - Cache optionnel des évaluations (pour éviter QuotaExceededError)
 * @param {Object} options - Options supplémentaires
 * @param {number} options.numeroSemaine - Si fourni, court-circuite la validation calendrier (utilisé par reconstruction)
 * @returns {Object|null} - Snapshot créé ou null si erreur
 */
async function capturerSnapshotSeance(dateSeance, evaluationsCacheParam = null, options = {}) {
    try {
        // ✨ NOUVEAU (8 déc 2025) : Empêcher la capture de snapshots pour dates futures
        const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE (YYYY-MM-DD)
        if (dateSeance > aujourdhui) {
            console.warn(`⚠️ Date ${dateSeance} est dans le futur, impossible de capturer un snapshot`);
            return null;
        }

        let numeroSemaine;

        if (options.numeroSemaine) {
            // Mode reconstruction : le numéro de semaine vient de obtenirSeancesCompletes() (group-specific)
            // Pas besoin de valider contre calendrierComplet qui est partagé et peut ne pas
            // refléter les jours de cours du groupe actif
            numeroSemaine = options.numeroSemaine;
        } else {
            // Mode normal : valider contre le calendrier
            const calendrier = obtenirCalendrierComplet();
            const infoJour = calendrier[dateSeance];

            if (!infoJour) {
                console.warn(`⚠️ Date ${dateSeance} n'est pas dans le calendrier`);
                return null;
            }

            if (infoJour.statut !== 'cours' && infoJour.statut !== 'reprise') {
                // 🆕 FIX (19 fév 2026) : En multi-cours, 'jour-ouvrable' peut être un jour
                // de cours pour le groupe actif (aligné avec saisie-presences.js et horaire.js)
                if (infoJour.statut === 'jour-ouvrable' && typeof obtenirSeancesHoraire === 'function') {
                    const seancesHoraire = obtenirSeancesHoraire();
                    const joursNoms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
                    const jourSemaine = joursNoms[new Date(dateSeance + 'T00:00:00').getDay()];
                    if (!seancesHoraire || !seancesHoraire.some(s => s.jour && s.jour.toLowerCase() === jourSemaine)) {
                        console.warn(`⚠️ Date ${dateSeance} n'est pas un jour de cours`);
                        return null;
                    }
                } else {
                    console.warn(`⚠️ Date ${dateSeance} n'est pas un jour de cours`);
                    return null;
                }
            }

            numeroSemaine = infoJour.numeroSemaine;
        }

        // Calculer indices pour chaque étudiant
        // ✅ CORRECTIF (13 fév 2026): Utiliser obtenirEtudiantsCoursActif() qui filtre par
        // coursId ET par groupe (obtenirDonneesSelonMode ne filtre que par coursId, ce qui
        // retourne les étudiants de TOUS les groupes du même cours)
        // Fallback vers [] (pas obtenirDonneesSelonMode) pour éviter de mélanger les groupes
        const tousEtudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : [];
        const etudiants = tousEtudiants.filter(e => !estEtudiantExclu(e));
        const snapshotsEtudiants = [];

        // ✅ Compteurs séparés pour gérer les valeurs null
        // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Retrait de E (snapshots ponctuals A-C-P uniquement)
        let sommeA_ponctuel = 0, sommeC_cumul = 0, sommeP_cumul = 0;
        let nbAvecA = 0, nbAvecC = 0, nbAvecP = 0;   // #743 : A aussi peut être null
        const valeursA = [], valeursC = [], valeursP = [];

        // ✅ NOUVEAU (11 déc 2025): Charger productions pour calculer C global
        const productions = obtenirDonneesSelonMode('productions') || [];

        // ✅ NOUVEAU (11 déc 2025): C global = taux de remise du DERNIER artefact dû
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe + assignee)
        const gcIdSnapshot = obtenirCoursIdPourSnapshots();
        // ✅ CORRECTIF (2 mars 2026): Exclure les productions d'un trimestre précédent
        let dateDebutTrimestreSnap = '';
        try {
            const cadreSnap = db.getSync(cle('cadreCalendrier'), null);
            if (cadreSnap && cadreSnap.dateDebut) dateDebutTrimestreSnap = cadreSnap.dateDebut;
        } catch (e) { console.warn('[Snapshots] cadreCalendrier read skipped:', e.message || e); }
        const productionsDues = productions.filter(p => {
            if (p.facultatif || p.type === 'portfolio') return false;
            const { date, assignee } = obtenirEcheanceEffective(p, gcIdSnapshot);
            if (!assignee) return false;
            if (dateDebutTrimestreSnap && date < dateDebutTrimestreSnap) return false;
            return date && date <= dateSeance;
        });
        const dernierTravail = productionsDues.length > 0
            ? productionsDues.sort((a, b) => {
                const dateA = obtenirEcheanceEffective(a, gcIdSnapshot).date || '';
                const dateB = obtenirEcheanceEffective(b, gcIdSnapshot).date || '';
                return dateB.localeCompare(dateA);
            })[0]
            : undefined;

        // ⚡ Charger depuis IndexedDB par défaut (évite QuotaExceededError localStorage)
        let evaluationsCache = evaluationsCacheParam;

        if (!evaluationsCache) {
            try {
                // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
                // 🆕 FIX (9 jan 2026): Namespacing par trimestre via cle()
                evaluationsCache = await db.get(cle('evaluationsSauvegardees'));
            } catch (e) {
                console.warn('Impossible de charger depuis IndexedDB:', e.message);
                evaluationsCache = [];
            }
        }

        etudiants.forEach(etudiant => {
            const da = etudiant.da;

            // #224 : Une seule passe cumulatif (plus de ponctuel)
            const indicesCumulatif = calculerIndicesHistoriques(da, dateSeance, evaluationsCache);

            // ⚡ OPTIMISATION PERFORMANCE: Désactivé pendant reconstruction
            // Patterns et RàI génèrent beaucoup de logs console (× 900 étudiants = saturation Safari)
            // Ces valeurs peuvent être recalculées à la volée lors de la consultation d'un profil
            // Si besoin de ces données dans les snapshots, réactiver après avoir désactivé les logs
            let pattern = 'Non calculé';
            let rai = 'Non calculé';

            /* DÉSACTIVÉ TEMPORAIREMENT POUR PERFORMANCE
            {
                if (typeof calculerDirectionsCriteres === 'function') {
                    const directions = calculerDirectionsCriteres(da);
                    // Déterminer pattern majoritaire
                    const symboles = Object.values(directions).map(d => d.symbole);
                    const nbAmelioration = symboles.filter(s => s === '→').length;
                    const nbBaisse = symboles.filter(s => s === '←').length;
                    if (nbAmelioration > nbBaisse) pattern = 'Progression';
                    else if (nbBaisse > nbAmelioration) pattern = 'Régression';
                    else pattern = 'Stable';
                }
            }

            // Déterminer niveau RàI
            if (typeof determinerNiveauRaiPedagogique === 'function') {
                const niveauRaiObj = determinerNiveauRaiPedagogique(da);
                rai = niveauRaiObj.niveau || 'Niveau 1';
            }
            */

            snapshotsEtudiants.push({
                da: da,
                nom: `${etudiant.prenom} ${etudiant.nom}`,
                A: indicesCumulatif.A, // #224 : toujours cumulatif
                A_cumulatif: indicesCumulatif.A,
                C: indicesCumulatif.C,
                P: indicesCumulatif.P,
                pattern: pattern,
                rai: rai
            });

            // Accumuler pour moyennes (gérer null)
            // #743 / #750 : un A inconnu n'entre ni dans la moyenne ni dans la dispersion (même règle que les écrans)
            if (indicesCumulatif.A !== null) {
                sommeA_ponctuel += indicesCumulatif.A;
                nbAvecA++;
            }

            // C et P peuvent être null si aucune évaluation
            if (indicesCumulatif.C !== null) {
                sommeC_cumul += indicesCumulatif.C;
                nbAvecC++;
            }
            if (indicesCumulatif.P !== null) {
                sommeP_cumul += indicesCumulatif.P;
                nbAvecP++;
            }

            if (indicesCumulatif.A !== null) {
                valeursA.push(indicesCumulatif.A);
            }
            if (indicesCumulatif.C !== null) {
                valeursC.push(indicesCumulatif.C);
            }
            if (indicesCumulatif.P !== null) {
                valeursP.push(indicesCumulatif.P);
            }

        });

        const nbEtudiants = etudiants.length;

        // ✅ NOUVEAU (11 déc 2025): Calculer C global = taux de remise du dernier travail
        let cGlobal = null;
        if (dernierTravail) {
            // #726 (lot 6, 11 oct. 2026) : le numérateur compte les seuls élèves du dénominateur
            // (actifs du groupe, non exclus), chacun une fois. Avant, il comptait les évaluations de
            // tout le trimestre (l'autre groupe du cours, les exclus, une reprise en double) : le C
            // global pouvait dépasser 100 %. Stock : les snapshots déjà capturés gardent leur nombre.
            const dasDuGroupe = new Set(etudiants.map(e => String(e.da)));
            const dasRemis = new Set();
            evaluationsCache.forEach(e => {
                if (e.productionId === dernierTravail.id &&
                    dasDuGroupe.has(String(e.etudiantDA)) &&
                    window.evaluationEntreDansLaNote(e) &&   // lot A (16 sept. 2026) : les deux prédicats de pratique-registre.js
                    !window.evaluationNonRemise(e) &&
                    !window.evaluationNonRecevable(e)) {   // lot 30 (17 sept. 2026)
                    dasRemis.add(String(e.etudiantDA));
                }
            });
            cGlobal = Math.round((dasRemis.size / nbEtudiants) * 100);
        }

        // Calculer statistiques groupe (gérer null)
        // ✅ CLARIFICATION (Beta 94 - 10 déc 2025): Distinction ponctuel vs cumulatif
        const groupe = {
            moyenneA: nbAvecA > 0 ? Math.round(sommeA_ponctuel / nbAvecA) : null, // ✅ A ponctuel (taux de présence à cette séance)
            moyenneC: cGlobal, // ✅ C ponctuel (taux de remise du dernier artefact dû)
            moyenneP: nbAvecP > 0 ? Math.round(sommeP_cumul / nbAvecP) : null, // ✅ P cumulatif (moyenne jusqu'à cette date)
            nbEtudiants: nbEtudiants,
            dispersionA: valeursA.length > 0 ? calculerEcartType(valeursA) : null,
            dispersionC: valeursC.length > 0 ? calculerEcartType(valeursC) : null,
            dispersionP: valeursP.length > 0 ? calculerEcartType(valeursP) : null
        };

        // Créer snapshot (ID basé sur la date de la séance)
        // ✨ CORRECTION (7 déc 2025): Ajouter propriétés pour compatibilité avec graphiques
        const snapshot = {
            id: `SEANCE-${dateSeance}`,
            dateSeance: dateSeance,
            numeroSemaine: numeroSemaine, // Conservé pour référence (horaire.js)
            numSemaine: numeroSemaine,    // ✨ Pour compatibilité graphiques
            dateDebut: dateSeance,         // ✨ Pour compatibilité obtenirSnapshotsEtudiant()
            dateFin: dateSeance,           // ✨ Pour compatibilité obtenirSnapshotsEtudiant()
            timestamp: new Date().toISOString(),
            etudiants: snapshotsEtudiants,
            groupe: groupe
        };

        // ⚡ SAUVEGARDE DANS INDEXEDDB (pas localStorage - trop grand!)
        // #522 lot 5 : lire, modifier, écrire dans la file de la clé (db.modifier) —
        // deux captures rapprochées (deux séances) ne s'écrasent plus l'une l'autre.
        await db.modifier(cleSnapshots(), (lus) => {
            let snapshots = lus;

            // Initialiser structure si première utilisation
            if (!snapshots) {
                snapshots = {
                    hebdomadaires: [],
                    interventions: [],
                    metadata: {
                        version: '1.0.0',
                        dateCreation: new Date().toISOString(),
                        dernierSnapshotHebdo: null,
                        dernierSnapshotIntervention: null
                    }
                };
            }

            // Vérifier que la structure metadata existe (compatibilité anciennes versions)
            if (!snapshots.metadata) {
                snapshots.metadata = {
                    version: '1.0.0',
                    dateCreation: new Date().toISOString(),
                    dernierSnapshotHebdo: null,
                    dernierSnapshotIntervention: null
                };
            }

            // 🔧 FIX #116-B (2 juillet 2026) : dédoublonnage par séance — un snapshot
            // existant pour la même dateSeance est REMPLACÉ (recapture = rafraîchir),
            // jamais empilé. Le coursId fait déjà partie de la clé de stockage
            // (cleSnapshots est scopée par groupe-cours), la dateSeance suffit ici.
            const idxExistant = snapshots.hebdomadaires.findIndex(s =>
                s.dateSeance === dateSeance || s.id === `SEANCE-${dateSeance}`
            );
            if (idxExistant >= 0) {
                snapshots.hebdomadaires[idxExistant] = snapshot;
            } else {
                snapshots.hebdomadaires.push(snapshot);
            }
            snapshots.metadata.dernierSnapshotHebdo = snapshot.timestamp;

            // ⚡ Sauvegarder dans IndexedDB (plusieurs GB disponibles)
            return snapshots;
        }, null);

        return snapshot;

    } catch (error) {
        console.error('❌ Erreur capture snapshot séance:', error);
        return null;
    }
}

/**
 * Calcule l'écart-type d'un tableau de valeurs
 * @param {number[]} valeurs - Tableau de valeurs
 * @returns {number} - Écart-type arrondi à 1 décimale
 */
function calculerEcartType(valeurs) {
    if (valeurs.length === 0) return 0;
    const moyenne = valeurs.reduce((sum, v) => sum + v, 0) / valeurs.length;
    const variance = valeurs.reduce((sum, v) => sum + Math.pow(v - moyenne, 2), 0) / valeurs.length;
    return parseFloat(Math.sqrt(variance).toFixed(1));
}

/* ===============================
   SNAPSHOTS INTERVENTIONS
   =============================== */

/**
 * Capture un snapshot "avant intervention" pour un groupe d'étudiants
 * Appelé lors de la planification d'une intervention RàI
 *
 * ✅ NOUVEAU (Beta 94 - 10 déc 2025): Snapshots ponctuals A-C-P uniquement (E retiré)
 *
 * @param {string} interventionId - ID de l'intervention
 * @param {string[]} etudiantsDA - Liste des DA des étudiants concernés
 * @param {string} type - Type d'intervention (niveau1/niveau2/niveau3)
 * @param {string} titre - Titre de l'intervention
 * @returns {Object|null} - Snapshot créé ou null si erreur
 */
function capturerSnapshotIntervention(interventionId, etudiantsDA, type, titre) {
    try {
        const avant = {};

        etudiantsDA.forEach(da => {
            const indices = calculerTousLesIndices(da);
            avant[da] = {
                A: indices.A,
                C: indices.C,
                P: indices.P
            };
        });

        const snapshotIntervention = {
            id: interventionId,
            date: new Date().toISOString().split('T')[0],
            type: type,
            titre: titre || 'Intervention RàI',
            etudiantsDA: etudiantsDA,
            avant: avant,
            apres: null
        };

        // Sauvegarder
        const snapshots = db.getSync(cleSnapshots());
        snapshots.interventions.push(snapshotIntervention);
        snapshots.metadata.dernierSnapshotIntervention = snapshotIntervention.date;
        db.setSync(cleSnapshots(), snapshots);

        return snapshotIntervention;

    } catch (error) {
        console.error('❌ Erreur capture snapshot intervention:', error);
        return null;
    }
}

/**
 * Met à jour un snapshot intervention avec les données "après"
 * Appelé 2-3 semaines après l'intervention (manuel ou automatique)
 *
 * ✅ NOUVEAU (Beta 94 - 10 déc 2025): Snapshots ponctuals A-C-P uniquement (E retiré)
 *
 * @param {string} interventionId - ID de l'intervention
 * @returns {boolean} - true si succès, false sinon
 */
function mettreAJourSnapshotIntervention(interventionId) {
    try {
        const snapshots = db.getSync(cleSnapshots());
        const snapshotIntervention = snapshots.interventions.find(s => s.id === interventionId);

        if (!snapshotIntervention) {
            console.warn(`⚠️ Snapshot intervention ${interventionId} introuvable`);
            return false;
        }

        if (snapshotIntervention.apres !== null) {
            console.warn(`⚠️ Snapshot intervention ${interventionId} déjà complété`);
            return false;
        }

        const apres = {};

        snapshotIntervention.etudiantsDA.forEach(da => {
            const indices = calculerTousLesIndices(da);
            apres[da] = {
                A: indices.A,
                C: indices.C,
                P: indices.P
            };
        });

        snapshotIntervention.apres = apres;
        snapshotIntervention.dateApres = new Date().toISOString().split('T')[0];

        db.setSync(cleSnapshots(), snapshots);

        return true;

    } catch (error) {
        console.error('❌ Erreur mise à jour snapshot intervention:', error);
        return false;
    }
}

/* ===============================
   RECONSTRUCTION RÉTROACTIVE
   =============================== */

/**
 * ✨ REFONTE (Beta 93) : Reconstruit tous les snapshots PAR SÉANCE depuis le début du trimestre
 * ATTENTION : Opération coûteuse, à n'exécuter qu'une seule fois au début
 *
 * @returns {Object} - { succes: boolean, nbSnapshots: number, message: string }
 */
async function reconstruireSnapshotsHistoriques() {

    try {
        // ✅ CORRECTIF (16 fév 2026): Régénérer le calendrier avec l'union de tous les horaires.
        // genererCalendrierComplet() synchronise désormais horaireHebdo automatiquement
        // depuis toutes les entités horaire (couvre tous les groupes-cours).
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
        }

        // ⚡ Charger les évaluations depuis IndexedDB (évite QuotaExceededError)
        // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
        // 🆕 FIX (9 jan 2026): Namespacing par trimestre via cle()
        const evaluationsCache = await db.get(cle('evaluationsSauvegardees'));

        // ✅ CORRECTIF (13 fév 2026): Forcer la régénération des séancesCompletes
        // depuis le calendrier fraîchement régénéré (évite données périmées d'un autre trimestre)
        let seancesCompletes;
        if (typeof genererSeancesCompletes === 'function') {
            seancesCompletes = genererSeancesCompletes();
        } else {
            seancesCompletes = obtenirSeancesCompletes();
        }
        if (!seancesCompletes || Object.keys(seancesCompletes).length === 0) {
            console.error('❌ Aucune séance configurée dans l\'horaire');
            return {
                succes: false,
                nbSnapshots: 0,
                message: 'Aucune séance configurée. Configure d\'abord l\'horaire du groupe dans Cadre → Trimestre → Horaire.'
            };
        }

        // ✨ CORRECTIF CRITIQUE (7 déc 2025): Filtrer SEULEMENT les dates avec séances configurées
        // seancesCompletes contient aussi des dates VIDES (tableaux vides []) pour tous les jours
        // de cours du calendrier. On ne veut PAS créer de snapshots pour ces jours vides.
        // Avant: 75 dates (tous les jours de cours) → Après: ~30 dates (seulement jours avec séances)

        // ✨ NOUVEAU (8 déc 2025) : Ne créer des snapshots QUE pour les séances passées
        // Empêche l'affichage de données futures dans les graphiques
        const aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE (YYYY-MM-DD)

        const datesCours = Object.keys(seancesCompletes)
            .filter(date => seancesCompletes[date] && seancesCompletes[date].length > 0)
            .filter(date => date <= aujourdhui)  // ✨ NOUVEAU : Ne garder que les dates passées
            .sort();

        // ✨ Charger les étudiants pour estimation précise (universel, pas codé en dur)
        // ✅ CORRECTIF (13 fév 2026): Utiliser obtenirEtudiantsCoursActif() pour filtrer par groupe
        // Fallback vers [] (pas obtenirDonneesSelonMode) pour éviter de mélanger les groupes
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : [];
        const nbEtudiants = etudiants.length;

        if (datesCours.length > 0) {
        }

        // Vider les seules captures HEBDOMADAIRES (celles que la boucle ci-dessous refait).
        // #1049 (11 oct. 2026, fiche urgente) : les captures d'INTERVENTION (avant/après d'une
        // intervention RàI) sont prises au moment de l'intervention et rien ne les reconstruit ;
        // la reconstruction les remettait à `[]`, un clic les effaçait pour de bon. Elles restent
        // en place, avec `dernierSnapshotIntervention`. Ce qui a déjà été effacé chez les
        // utilisateurs ne se récupère pas.
        // ⚡ IndexedDB, dans la file de la clé (#522).
        await db.modifier(cleSnapshots(), (lus) => {
            const avant = lus && typeof lus === 'object' ? lus : {};
            const meta = avant.metadata && typeof avant.metadata === 'object' ? avant.metadata : {};
            return {
                ...avant,
                hebdomadaires: [],
                interventions: Array.isArray(avant.interventions) ? avant.interventions : [],
                metadata: {
                    ...meta,
                    version: meta.version || '1.0.0',
                    dateCreation: meta.dateCreation || new Date().toISOString(),
                    dernierSnapshotHebdo: null,
                    dernierSnapshotIntervention: meta.dernierSnapshotIntervention || null
                }
            };
        }, null);

        // ✨ NOUVEAU : Capturer snapshot pour CHAQUE SÉANCE
        let nbSnapshots = 0;
        let nbEchecs = 0;
        const nbSeancesTotal = datesCours.length;

        for (let index = 0; index < datesCours.length; index++) {
            const dateSeance = datesCours[index];
            const progression = Math.round(((index + 1) / nbSeancesTotal) * 100);

            // Obtenir le numéro de semaine depuis seancesCompletes (group-specific)
            // Ceci court-circuite la validation calendrierComplet qui est partagé par trimestre
            // et peut ne pas refléter les jours de cours du groupe actif
            const seancesDuJour = seancesCompletes[dateSeance];
            const numSemaine = seancesDuJour && seancesDuJour[0] ? seancesDuJour[0].numeroSemaine : null;

            // Capturer snapshot pour cette séance
            const snapshot = await capturerSnapshotSeance(dateSeance, evaluationsCache, { numeroSemaine: numSemaine });
            if (snapshot) {
                nbSnapshots++;
            } else {
                nbEchecs++;
                console.warn(`  ⚠️ Séance ${dateSeance} échec`);
            }
        }

        // ✅ CORRECTIF CRITIQUE (2 mars 2026): Forcer la synchro du cache pour les snapshots
        // Problème : après reconstruction, les snapshots sont dans IndexedDB (11 captures)
        // mais le cache localStorage peut contenir une version périmée (4 captures).
        // db.getSync() lit memoryCache puis localStorage → peut rendre les anciennes
        // données tant qu'on ne rafraîchit pas le cache ici (cette reconstruction
        // ne passe pas par syncToLocalStorageCache, qui ne tourne qu'au boot/import).
        // Solution : supprimer la clé périmée de localStorage et forcer le memoryCache.
        const cleSnap = cleSnapshots();
        if (cleSnap) {
            try {
                // 1. Relire les données fraîches depuis IndexedDB
                const snapshotsFrais = await db.get(cleSnap);
                // 2. TOUJOURS peupler memoryCache (getSync y accède si localStorage échoue)
                if (db.memoryCache) {
                    db.memoryCache.set(cleSnap, snapshotsFrais);
                }
                // 3. Supprimer la version périmée dans localStorage
                try { localStorage.removeItem(cleSnap); } catch (ex) { console.warn('[Snapshots] localStorage.removeItem skipped:', cleSnap, ex.message || ex); }
                // 4. Essayer de mettre à jour localStorage aussi
                try {
                    localStorage.setItem(cleSnap, JSON.stringify(snapshotsFrais));
                } catch (e) {
                    // QuotaExceeded — memoryCache déjà peuplé au step 2
                }
            } catch (e) {
                console.warn('⚠️ Impossible de forcer le cache snapshots:', e.message);
            }
        }

        return {
            succes: true,
            nbSnapshots: nbSnapshots,
            message: `${nbSnapshots} captures par séance reconstruites${nbEchecs > 0 ? ` (${nbEchecs} échecs)` : ''}`
        };

    } catch (error) {
        console.error('❌ Erreur reconstruction snapshots:', error);
        return {
            succes: false,
            nbSnapshots: 0,
            message: `Erreur: ${error.message}`
        };
    }
}

/* ===============================
   EXPORT / IMPORT
   =============================== */

/**
 * Exporte tous les snapshots en JSON
 * @returns {string} - JSON des snapshots
 */
function exporterSnapshots() {
    const snapshots = db.getSync(cleSnapshots());
    return JSON.stringify(snapshots, null, 2);
}

/**
 * Importe des snapshots depuis JSON
 * @param {string} json - JSON des snapshots
 * @returns {boolean} - true si succès
 */
function importerSnapshots(json) {
    try {
        const snapshots = JSON.parse(json);
        db.setSync(cleSnapshots(), snapshots);
        return true;
    } catch (error) {
        console.error('❌ Erreur import snapshots:', error);
        return false;
    }
}

/* ===============================
   GETTERS / UTILITAIRES
   =============================== */

/**
 * Obtient tous les snapshots hebdomadaires
 * @returns {Array} - Liste des snapshots
 */
function obtenirSnapshotsHebdomadaires() {
    const snapshots = db.getSync(cleSnapshots(), { hebdomadaires: [] });
    return snapshots.hebdomadaires || [];
}

/**
 * Obtient tous les snapshots d'un étudiant
 * @param {string} da - Numéro DA
 * @returns {Array} - Liste des snapshots pour cet étudiant
 */
function obtenirSnapshotsEtudiant(da) {
    const snapshots = obtenirSnapshotsHebdomadaires();
    return snapshots
        .map(s => {
            const etudiant = s.etudiants.find(e => e.da === da);
            if (!etudiant) return null;
            return {
                numSemaine: s.numSemaine,
                dateSeance: s.dateSeance || s.dateDebut, // ✨ AJOUT pour marqueurs jetons/RàI
                dateDebut: s.dateDebut,
                dateFin: s.dateFin,
                ...etudiant
            };
        })
        .filter(s => s !== null)
        .sort((a, b) => a.numSemaine - b.numSemaine);
}

/**
 * Obtient tous les snapshots d'interventions
 * @returns {Array} - Liste des snapshots interventions
 */
function obtenirSnapshotsInterventions() {
    const snapshots = db.getSync(cleSnapshots(), { interventions: [] });
    return snapshots.interventions || [];
}

/* ===============================
   FONCTIONS UI (Réglages → Données — bloc « Captures de progression »)
   =============================== */

/**
 * Affiche les statistiques des captures dans Réglages → Données
 * ✅ CORRECTIF (2 mars 2026): Lecture async depuis IndexedDB pour éviter
 * le cache localStorage périmé (db.getSync lit localStorage en premier)
 */
async function afficherStatutSnapshots() {
    const cleSnap = cleSnapshots();
    let snapshots;
    let source = 'aucune';
    if (db.useIndexedDB && cleSnap) {
        try {
            snapshots = await db.get(cleSnap);
            source = 'IndexedDB';
        } catch (e) { console.warn('[Snapshots] IndexedDB read failed, fallback getSync:', e.message || e); }
    }
    if (!snapshots) {
        snapshots = db.getSync(cleSnap, { hebdomadaires: [], interventions: [] });
        source = 'getSync';
    }

    const nbHebdo = snapshots.hebdomadaires?.length || 0;
    const nbInterventions = snapshots.interventions?.length || 0;

    // Trouver la dernière capture
    let derniereCapture = '—';
    if (nbHebdo > 0) {
        const dernier = snapshots.hebdomadaires[snapshots.hebdomadaires.length - 1];
        derniereCapture = dernier.id || '—';
    }

    // Bandeau contextuel : groupe-cours actif (V2 uniquement) — évite l'ambiguïté entre groupes-cours du même trimestre
    const elemContexteGC = document.getElementById('v2-snapshots-contexte-groupe-cours');
    if (elemContexteGC) {
        const infoCours = db.getSync('infoCours', null);
        if (!infoCours) {
            elemContexteGC.textContent = 'Aucun groupe-cours actif';
            elemContexteGC.style.color = 'var(--orange-attention, #ff9800)';
        } else {
            const sigle = infoCours.codeCours || infoCours.sigle || '';
            const groupeNumBrut = infoCours.groupe;
            const groupeNum = groupeNumBrut ? parseInt(groupeNumBrut, 10) : null;
            const groupeLabel = (groupeNum && !isNaN(groupeNum)) ? 'Groupe ' + groupeNum : '';
            const label = [sigle, groupeLabel].filter(Boolean).join(' — ');
            elemContexteGC.textContent = label || '—';
            elemContexteGC.style.color = '';
        }
    }

    // Mettre à jour les cartes métriques (V1 + V2)
    const elemHebdo = document.getElementById('stat-snapshots-hebdo');
    const elemInterventions = document.getElementById('stat-snapshots-interventions');
    const elemDerniere = document.getElementById('stat-derniere-capture');

    if (elemHebdo) elemHebdo.textContent = nbHebdo;
    if (elemInterventions) elemInterventions.textContent = nbInterventions;
    if (elemDerniere) elemDerniere.textContent = derniereCapture;

    // ✅ CORRECTIF (13 fév 2026): Mettre à jour aussi les éléments V2
    const elemHebdoV2 = document.getElementById('v2-stat-snapshots-hebdo');
    const elemInterventionsV2 = document.getElementById('v2-stat-snapshots-interventions');
    const elemDerniereV2 = document.getElementById('v2-stat-derniere-capture');

    if (elemHebdoV2) elemHebdoV2.textContent = nbHebdo;
    if (elemInterventionsV2) elemInterventionsV2.textContent = nbInterventions;
    if (elemDerniereV2) {
        if (nbHebdo > 0) {
            const dernier = snapshots.hebdomadaires[snapshots.hebdomadaires.length - 1];
            if (dernier.dateSeance) {
                const options = { day: 'numeric', month: 'short' };
                elemDerniereV2.textContent = new Date(dernier.dateSeance).toLocaleDateString('fr-CA', options);
            } else {
                elemDerniereV2.textContent = derniereCapture;
            }
        } else {
            elemDerniereV2.textContent = '—';
        }
    }

    // Message de statut (V1 uniquement)
    const elemStatus = document.getElementById('info-snapshots-status');
    if (elemStatus) {
        if (nbHebdo === 0 && nbInterventions === 0) {
            elemStatus.innerHTML = `
                <p style="color: #ff9800;">
                    ⚠️ Aucune capture disponible. Utilise la reconstruction rétroactive pour créer des captures historiques,
                    ou attendez la prochaine capture hebdomadaire automatique.
                </p>
            `;
        } else {
            elemStatus.innerHTML = `
                <p style="color: var(--vert-succes);">
                    ✅ Le système de captures est actif. ${nbHebdo} capture(s) hebdomadaire(s) et ${nbInterventions} capture(s) d'intervention(s) enregistrées.
                </p>
            `;
        }
    }
}

/**
 * Lance la reconstruction rétroactive (déclenchée par bouton UI)
 */
async function lancerReconstructionRetroactive() {
    if (!confirm('Cette action va recalculer toutes les captures hebdomadaires depuis le début du trimestre. Continuer?')) {
        return;
    }

    try {
        // ⚡ NOUVEAU : Appel asynchrone (charge depuis IndexedDB)
        const resultats = await reconstruireSnapshotsHistoriques();

        if (resultats.succes) {
            alert(`Reconstruction terminée!\n\n` +
                  `${resultats.nbSnapshots} captures reconstruites\n\n` +
                  `${resultats.message}`);
        } else {
            alert(`Erreur lors de la reconstruction:\n\n${resultats.message}`);
        }

        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors de la reconstruction:', error);
        alert('Erreur lors de la reconstruction: ' + error.message);
    }
}

/**
 * Confirme et supprime toutes les captures
 */
function confirmerNettoyageSnapshots() {
    const confirmation1 = confirm(
        '⚠️ ATTENTION ⚠️\n\n' +
        'Cette action va supprimer TOUTES les captures enregistrées (hebdomadaires et interventions).\n\n' +
        'Les graphiques de progression seront vides après cette opération.\n\n' +
        'Cette action est IRRÉVERSIBLE.\n\n' +
        'Veux-tu vraiment continuer?'
    );

    if (!confirmation1) return;

    const confirmation2 = confirm(
        'Confirmation finale\n\n' +
        'Es-tu absolument certain de vouloir supprimer toutes les captures?\n\n' +
        'Clique sur OK pour confirmer la suppression.'
    );

    if (!confirmation2) return;

    try {
        // Supprimer toutes les données
        db.setSync(cleSnapshots(), { hebdomadaires: [], interventions: [] });

        alert('✅ Toutes les captures ont été supprimées.');
        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions pour utilisation globale
window.initialiserModuleSnapshots = initialiserModuleSnapshots;
window.verifierEtCapturerSnapshotHebdomadaire = verifierEtCapturerSnapshotHebdomadaire;
window.capturerSnapshotSeance = capturerSnapshotSeance;
window.capturerSnapshotIntervention = capturerSnapshotIntervention;
window.mettreAJourSnapshotIntervention = mettreAJourSnapshotIntervention;
window.reconstruireSnapshotsHistoriques = reconstruireSnapshotsHistoriques;
window.exporterSnapshots = exporterSnapshots;
window.importerSnapshots = importerSnapshots;
window.obtenirSnapshotsHebdomadaires = obtenirSnapshotsHebdomadaires;
window.obtenirSnapshotsEtudiant = obtenirSnapshotsEtudiant;
window.obtenirSnapshotsInterventions = obtenirSnapshotsInterventions;
window.calculerIndicesHistoriques = calculerIndicesHistoriques; // Export pour tests
window.cleSnapshots = cleSnapshots;

// Fonctions UI
window.afficherStatutSnapshots = afficherStatutSnapshots;
window.lancerReconstructionRetroactive = lancerReconstructionRetroactive;
window.confirmerNettoyageSnapshots = confirmerNettoyageSnapshots;

})();
