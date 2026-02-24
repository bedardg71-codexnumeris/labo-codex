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
 * - L'indice E (engagement) est EXCLU des snapshots (trop peu informatif en ponctuel)
 * - E reste disponible dans le profil étudiant comme indicateur LONGITUDINAL/CUMULATIF
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
    const infoCours = db.getSync('infoCours', null);
    if (!infoCours) return null;
    // _groupeCoursId est fiable : unique par groupe-cours dans les deux chemins
    // (changerGroupeCoursActifV2 et synchroniserInfoCours)
    // infoCours.id peut être le coursId (partagé entre groupes) dans changerGroupeCoursActifV2
    return infoCours._groupeCoursId || infoCours.id || null;
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
    console.log('🔄 Initialisation module snapshots...');

    const cleSnap = cleSnapshots();
    if (!cleSnap) {
        console.log('⚠️ Aucun cours actif – module snapshots en attente');
        return;
    }

    // Créer structure si première utilisation
    const snapshots = db.getSync(cleSnap, null);
    if (!snapshots) {
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
        db.setSync(cleSnap, structure);
        console.log('✅ Structure snapshots créée');
    }

    // Vérifier si nouveau snapshot hebdomadaire nécessaire
    verifierEtCapturerSnapshotHebdomadaire();

    console.log('✅ Module snapshots initialisé');
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
 * @param {boolean} usePonctualA - Si true, utilise assiduité ponctuelle de la séance au lieu de cumulative
 * @returns {Object} - {A: number, C: number, P: number}
 */
function calculerIndicesHistoriques(da, dateLimite, evaluationsCache = null, usePonctualA = false) {
    // 🐛 DEBUG - Désactivé pour performance (30 snapshots × 30 étudiants = 900 appels)
    // console.log(`[calculerIndicesHistoriques] DA: ${da}, Date: ${dateLimite}, Cache: ${evaluationsCache ? evaluationsCache.length : 'null'}, Ponctuel: ${usePonctualA}`);

    // Assiduité (A) : Ponctuelle (séance uniquement) OU cumulative (depuis le début)
    let indiceA = 100;

    if (usePonctualA && typeof calculerAssiduiteSeance === 'function') {
        // ✨ NOUVEAU (Beta 93) : Assiduité PONCTUELLE pour cette séance uniquement
        const resultA = calculerAssiduiteSeance(da, dateLimite);
        indiceA = Math.round(resultA.indice * 100);
        // console.log(`[calculerIndicesHistoriques] A ponctuel (séance ${dateLimite}): ${indiceA}%`);
    } else if (typeof calculerAssiduiteJusquADate === 'function') {
        // Assiduité CUMULATIVE jusqu'à cette date
        const resultA = calculerAssiduiteJusquADate(da, dateLimite);
        indiceA = Math.round(resultA.indice * 100);
        // console.log(`[calculerIndicesHistoriques] A cumulatif (jusqu'à ${dateLimite}): ${indiceA}%`);
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
    // Les jetons servent uniquement à comptabiliser, pas à modifier l'échéance
    const obtenirDateEcheance = (evaluation) => {
        const production = productions.find(p => p.id === evaluation.productionId);
        if (!production || !production.dateEcheance) {
            // Fallback: utiliser dateEvaluation si pas de dateEcheance configurée
            return evaluation.dateEvaluation;
        }
        return production.dateEcheance;
    };

    // Filtrer les évaluations complétées avant la date limite
    const evaluationsFiltrees = evaluations.filter(e => {
        if (!e.productionId || e.remplaceeParId) return false;

        // ✅ NOUVEAU : Vérifier que l'évaluation a bien une note ET n'est pas "non remis"
        if (e.statutRemise === 'non-remis') return false;
        if (e.noteFinale === null || e.noteFinale === undefined) return false;

        // ✅ NOUVEAU (Beta 94): Utiliser dateEcheance de la production (jetons = compteur seulement)
        const dateEcheance = obtenirDateEcheance(e);
        if (!dateEcheance) return false;

        return dateEcheance <= dateLimite;
    });

    // ✅ CORRECTION (10 déc 2025): Identifier les productions DUES jusqu'à cette date (dateEcheance)
    // Au lieu de "productions évaluées", on regarde les productions dont l'échéance est passée
    const productionsDues = productions.filter(production => {
        // Exclure les productions facultatives
        if (production.facultatif) return false;

        // ✅ CORRECTIF (17 déc 2025): Exclure les portfolios (conteneurs, pas des productions individuelles)
        if (production.type === 'portfolio') return false;

        // Vérifier que la production a une dateEcheance passée
        return production.dateEcheance && production.dateEcheance <= dateLimite;
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
                e.statutRemise !== 'non-remis' &&
                !e.remplaceeParId &&
                e.noteFinale !== null &&
                e.noteFinale !== undefined
            );
        });

        indiceC = Math.round((productionsRemises.length / productionsDues.length) * 100);
    }

    // Calculer P : Déléguer à la pratique de notation configurée
    // ✅ CORRECTION (Beta 93) : Respect de l'architecture modulaire
    let indiceP = null;

    if (typeof obtenirPratiqueActuelle === 'function') {
        try {
            const pratique = obtenirPratiqueActuelle();
            if (pratique && typeof pratique.calculerPerformanceHistorique === 'function') {
                // Déléguer le calcul historique à la pratique
                const indiceP_decimal = pratique.calculerPerformanceHistorique(da, dateLimite, evaluations);
                // Convertir de 0-1 vers 0-100 (arrondi)
                if (indiceP_decimal !== null) {
                    indiceP = Math.round(indiceP_decimal * 100);
                }
            }

            // ✅ CORRECTION (7 déc): Fallback si méthode manquante OU retourne null
            if (indiceP === null) {
                // ⚡ FALLBACK: Si méthode manquante, calculer moyenne simple des évaluations
                // (désactivation warning pour éviter 870 logs: 29 snapshots × 30 étudiants)
                // console.warn('[calculerIndicesHistoriques] Pratique ou méthode calculerPerformanceHistorique() manquante');

                // Calcul fallback simple: moyenne de toutes les évaluations jusqu'à cette date
                if (evaluationsFiltrees.length > 0) {
                    const notesValides = evaluationsFiltrees
                        .filter(e => e.niveauFinal !== null && e.niveauFinal !== undefined && e.niveauFinal !== '--')
                        .map(e => {
                            // ✅ CORRECTION (7 déc): Gérer échelle IDME (lettres) et nombres
                            const niveau = String(e.niveauFinal).trim().toUpperCase();

                            // Si c'est une lettre IDME, utiliser valeurs configurées
                            // (40% pour I, 65% pour D, 75% pour M, 100% pour E selon l'échelle utilisateur)
                            if (niveau === '0') return 0;       // Aucun/Plagiat
                            if (niveau === 'I') return 40;      // Incomplet
                            if (niveau === 'D') return 65;      // en Développement
                            if (niveau === 'M') return 75;      // Maîtrisé
                            if (niveau === 'E') return 100;     // Étendu

                            // Sinon, nombre: convertir 0-4 → 0-100, ou garder si déjà 0-100
                            const note = parseFloat(e.niveauFinal);
                            if (isNaN(note)) return null;
                            return note <= 4 ? (note / 4) * 100 : note;
                        })
                        .filter(note => note !== null && !isNaN(note));

                    if (notesValides.length > 0) {
                        const somme = notesValides.reduce((acc, val) => acc + val, 0);
                        indiceP = Math.round(somme / notesValides.length);
                    }
                }
            }
        } catch (error) {
            // console.error('[calculerIndicesHistoriques] Erreur lors du calcul de P:', error);
            indiceP = null;
        }
    } else {
        // console.warn('[calculerIndicesHistoriques] obtenirPratiqueActuelle() non disponible');

        // Même fallback si fonction pas disponible
        if (evaluationsFiltrees.length > 0) {
            const notesValides = evaluationsFiltrees
                .filter(e => e.niveauFinal !== null && e.niveauFinal !== undefined && e.niveauFinal !== '--')
                .map(e => {
                    // ✅ CORRECTION (7 déc): Gérer échelle IDME (lettres) et nombres
                    const niveau = String(e.niveauFinal).trim().toUpperCase();

                    // Si c'est une lettre IDME, utiliser valeurs configurées
                    if (niveau === '0') return 0;       // Aucun/Plagiat
                    if (niveau === 'I') return 40;      // Incomplet
                    if (niveau === 'D') return 65;      // en Développement
                    if (niveau === 'M') return 75;      // Maîtrisé
                    if (niveau === 'E') return 100;     // Étendu

                    // Sinon, nombre: convertir 0-4 → 0-100, ou garder si déjà 0-100
                    const note = parseFloat(e.niveauFinal);
                    if (isNaN(note)) return null;
                    return note <= 4 ? (note / 4) * 100 : note;
                })
                .filter(note => note !== null && !isNaN(note));

            if (notesValides.length > 0) {
                const somme = notesValides.reduce((acc, val) => acc + val, 0);
                indiceP = Math.round(somme / notesValides.length);
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
    // console.log(`[calculerIndicesHistoriques] RETOUR: A=${resultat.A}, C=${resultat.C}, P=${resultat.P}`);

    return resultat;
}

/* ===============================
   SNAPSHOTS HEBDOMADAIRES
   =============================== */

/**
 * Vérifie si un nouveau snapshot hebdomadaire est nécessaire
 * Appelé automatiquement au chargement de l'application
 */
async function verifierEtCapturerSnapshotHebdomadaire() {
    const snapshots = db.getSync(cleSnapshots(), null);
    if (!snapshots) return;

    const calendrier = obtenirCalendrierComplet();
    if (!calendrier) return;

    const aujourdhui = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Trouver la semaine actuelle
    const jourActuel = calendrier[aujourdhui];
    if (!jourActuel || !jourActuel.numeroSemaine) return;

    const numSemaineActuelle = jourActuel.numeroSemaine;

    // Vérifier si snapshot déjà capturé pour cette semaine
    const snapshotExiste = snapshots.hebdomadaires.some(s => s.numSemaine === numSemaineActuelle);

    if (!snapshotExiste) {
        console.log(`📸 Capture snapshot hebdomadaire semaine ${numSemaineActuelle}...`);
        await capturerSnapshotHebdomadaire(numSemaineActuelle);
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
        const aujourdhui = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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

        console.log(`📸 Capture snapshot pour séance du ${dateSeance} (semaine ${numeroSemaine})`);

        // Calculer indices pour chaque étudiant
        // ✅ CORRECTIF (13 fév 2026): Utiliser obtenirEtudiantsCoursActif() qui filtre par
        // coursId ET par groupe (obtenirDonneesSelonMode ne filtre que par coursId, ce qui
        // retourne les étudiants de TOUS les groupes du même cours)
        // Fallback vers [] (pas obtenirDonneesSelonMode) pour éviter de mélanger les groupes
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : [];
        const snapshotsEtudiants = [];

        // ✅ Compteurs séparés pour gérer les valeurs null
        // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Retrait de E (snapshots ponctuals A-C-P uniquement)
        let sommeA_ponctuel = 0, sommeC_cumul = 0, sommeP_cumul = 0;
        let nbAvecC = 0, nbAvecP = 0;
        const valeursA = [], valeursC = [], valeursP = [];

        // ✅ NOUVEAU (11 déc 2025): Charger productions pour calculer C global
        const productions = obtenirDonneesSelonMode('productions') || [];

        // ✅ NOUVEAU (11 déc 2025): C global = taux de remise du DERNIER artefact dû
        // Identifier le dernier travail dont l'échéance est passée
        const productionsDues = productions.filter(p => !p.facultatif && p.dateEcheance && p.dateEcheance <= dateSeance);
        const dernierTravail = productionsDues.sort((a, b) => b.dateEcheance.localeCompare(a.dateEcheance))[0];

        // ⚡ Charger depuis IndexedDB par défaut (évite QuotaExceededError localStorage)
        let evaluationsCache = evaluationsCacheParam;

        if (!evaluationsCache) {
            try {
                console.log('⚡ Chargement évaluations depuis IndexedDB...');
                // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
                // 🆕 FIX (9 jan 2026): Namespacing par trimestre via cle()
                evaluationsCache = await db.get(cle('evaluationsSauvegardees'));
                console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées depuis IndexedDB`);
            } catch (e) {
                console.warn('Impossible de charger depuis IndexedDB:', e.message);
                evaluationsCache = [];
            }
        }

        etudiants.forEach(etudiant => {
            const da = etudiant.da;

            // ✅ NOUVEAU (Beta 94 - 10 déc 2025) : Calculer A ponctuel ET cumulatif
            // - A ponctuel : Pour le graphique de groupe (taux de présence à cette séance)
            // - A cumulatif : Pour le graphique individuel (assiduité depuis le début)
            // - C et P : Toujours cumulatifs
            const indicesPonctuel = calculerIndicesHistoriques(da, dateSeance, evaluationsCache, true);
            const indicesCumulatif = calculerIndicesHistoriques(da, dateSeance, evaluationsCache, false);

            // ⚡ OPTIMISATION PERFORMANCE: Désactivé pendant reconstruction
            // Patterns et RàI génèrent beaucoup de logs console (× 900 étudiants = saturation Safari)
            // Ces valeurs peuvent être recalculées à la volée lors de la consultation d'un profil
            // Si besoin de ces données dans les snapshots, réactiver après avoir désactivé les logs
            let pattern = 'Non calculé';
            let rai = 'Non calculé';

            /* DÉSACTIVÉ TEMPORAIREMENT POUR PERFORMANCE
            if (typeof obtenirPratiqueActuelle === 'function') {
                const pratique = obtenirPratiqueActuelle();
                if (typeof calculerDirectionsCriteres === 'function') {
                    const directions = calculerDirectionsCriteres(da, pratique);
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
                A: indicesPonctuel.A, // ✅ A ponctuel (pour graphique groupe)
                A_cumulatif: indicesCumulatif.A, // ✅ A cumulatif (pour graphique individuel)
                C: indicesPonctuel.C, // ✅ C cumulatif
                P: indicesPonctuel.P, // ✅ P cumulatif
                pattern: pattern,
                rai: rai
            });

            // Accumuler pour moyennes (gérer null)
            sommeA_ponctuel += indicesPonctuel.A;

            // C et P peuvent être null si aucune évaluation
            if (indicesPonctuel.C !== null) {
                sommeC_cumul += indicesPonctuel.C;
                nbAvecC++;
            }
            if (indicesPonctuel.P !== null) {
                sommeP_cumul += indicesPonctuel.P;
                nbAvecP++;
            }

            valeursA.push(indicesPonctuel.A);
            if (indicesPonctuel.C !== null) {
                valeursC.push(indicesPonctuel.C);
            }
            if (indicesPonctuel.P !== null) {
                valeursP.push(indicesPonctuel.P);
            }

        });

        const nbEtudiants = etudiants.length;

        // ✅ NOUVEAU (11 déc 2025): Calculer C global = taux de remise du dernier travail
        let cGlobal = null;
        if (dernierTravail) {
            const nbRemis = evaluationsCache.filter(e =>
                e.productionId === dernierTravail.id &&
                e.statutRemise !== 'non-remis' &&
                !e.remplaceeParId &&
                e.noteFinale !== null &&
                e.noteFinale !== undefined
            ).length;
            cGlobal = Math.round((nbRemis / nbEtudiants) * 100);
        }

        // Calculer statistiques groupe (gérer null)
        // ✅ CLARIFICATION (Beta 94 - 10 déc 2025): Distinction ponctuel vs cumulatif
        const groupe = {
            moyenneA: Math.round(sommeA_ponctuel / nbEtudiants), // ✅ A ponctuel (taux de présence à cette séance)
            moyenneC: cGlobal, // ✅ C ponctuel (taux de remise du dernier artefact dû)
            moyenneP: nbAvecP > 0 ? Math.round(sommeP_cumul / nbAvecP) : null, // ✅ P cumulatif (moyenne jusqu'à cette date)
            nbEtudiants: nbEtudiants,
            dispersionA: calculerEcartType(valeursA),
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
        // Lire depuis IndexedDB (async)
        let snapshots = await db.get(cleSnapshots());

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

        snapshots.hebdomadaires.push(snapshot);
        snapshots.metadata.dernierSnapshotHebdo = snapshot.timestamp;

        // ⚡ Sauvegarder dans IndexedDB (plusieurs GB disponibles)
        await db.set(cleSnapshots(), snapshots);

        console.log(`✅ Snapshot séance ${dateSeance} capturé (${nbEtudiants} étudiants)`);
        return snapshot;

    } catch (error) {
        console.error('❌ Erreur capture snapshot séance:', error);
        return null;
    }
}

/**
 * [LEGACY] Capture un snapshot hebdomadaire pour une semaine donnée
 * ⚠️ OBSOLÈTE : Utilisez capturerSnapshotSeance() à la place
 * Conservé pour compatibilité avec ancien code
 */
async function capturerSnapshotHebdomadaire(numSemaine, evaluationsCacheParam = null) {
    console.warn('⚠️ capturerSnapshotHebdomadaire() est obsolète. Utilisez capturerSnapshotSeance().');

    // Trouver les dates de cette semaine
    const calendrier = obtenirCalendrierComplet();
    const datesSemaine = Object.keys(calendrier).filter(date => {
        const jour = calendrier[date];
        return jour.numeroSemaine === numSemaine && jour.statut === 'cours';
    }).sort();

    if (datesSemaine.length === 0) return null;

    // Capturer un snapshot pour chaque date de cours de cette semaine
    const snapshots = [];
    for (const date of datesSemaine) {
        const snapshot = await capturerSnapshotSeance(date, evaluationsCacheParam);
        if (snapshot) snapshots.push(snapshot);
    }

    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
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

        console.log(`✅ Snapshot intervention "${titre}" capturé (avant) - ${etudiantsDA.length} étudiants`);
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

        console.log(`✅ Snapshot intervention "${snapshotIntervention.titre}" mis à jour (après)`);
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
    console.log('🔄 Début reconstruction snapshots historiques (PAR SÉANCE)...');

    try {
        // ✅ CORRECTIF (16 fév 2026): Régénérer le calendrier avec l'union de tous les horaires.
        // genererCalendrierComplet() synchronise désormais horaireHebdo automatiquement
        // depuis toutes les entités horaire (couvre tous les groupes-cours).
        console.log('🔄 Régénération calendrier...');
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
            console.log('✅ Calendrier régénéré');
        }

        // ⚡ Charger les évaluations depuis IndexedDB (évite QuotaExceededError)
        console.log('⚡ Chargement évaluations depuis IndexedDB...');
        // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
        // 🆕 FIX (9 jan 2026): Namespacing par trimestre via cle()
        const evaluationsCache = await db.get(cle('evaluationsSauvegardees'));
        console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées`);

        // ✅ CORRECTIF (13 fév 2026): Forcer la régénération des séancesCompletes
        // depuis le calendrier fraîchement régénéré (évite données périmées d'un autre trimestre)
        let seancesCompletes;
        if (typeof genererSeancesCompletes === 'function') {
            console.log('🔄 Régénération séancesCompletes pour le groupe actif...');
            seancesCompletes = genererSeancesCompletes();
        } else {
            seancesCompletes = obtenirSeancesCompletes();
        }
        if (!seancesCompletes || Object.keys(seancesCompletes).length === 0) {
            console.error('❌ Aucune séance configurée dans l\'horaire');
            return {
                succes: false,
                nbSnapshots: 0,
                message: 'Aucune séance configurée. Configure d\'abord l\'horaire du groupe dans Réglages → Horaire.'
            };
        }

        // ✨ CORRECTIF CRITIQUE (7 déc 2025): Filtrer SEULEMENT les dates avec séances configurées
        // seancesCompletes contient aussi des dates VIDES (tableaux vides []) pour tous les jours
        // de cours du calendrier. On ne veut PAS créer de snapshots pour ces jours vides.
        // Avant: 75 dates (tous les jours de cours) → Après: ~30 dates (seulement jours avec séances)

        // ✨ NOUVEAU (8 déc 2025) : Ne créer des snapshots QUE pour les séances passées
        // Empêche l'affichage de données futures dans les graphiques
        const aujourdhui = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

        console.log(`✓ Séances du groupe détectées: ${datesCours.length}`);
        if (datesCours.length > 0) {
            console.log(`  Première séance: ${datesCours[0]}`);
            console.log(`  Dernière séance: ${datesCours[datesCours.length - 1]}`);
            console.log(`  📊 Estimation: ${datesCours.length} snapshots × ${nbEtudiants} étudiants × ~2 KB = ~${Math.round(datesCours.length * nbEtudiants * 2 / 1024)} MB`);
        }

        // Effacer snapshots existants (reconstruction complète)
        // ⚡ Utiliser IndexedDB (pas localStorage - trop grand!)
        await db.set(cleSnapshots(), {
            hebdomadaires: [],
            interventions: [],
            metadata: {
                version: '1.0.0',
                dateCreation: new Date().toISOString(),
                dernierSnapshotHebdo: null,
                dernierSnapshotIntervention: null
            }
        });
        console.log('✓ Snapshots existants effacés (IndexedDB)');

        // ✨ NOUVEAU : Capturer snapshot pour CHAQUE SÉANCE
        let nbSnapshots = 0;
        let nbEchecs = 0;
        const nbSeancesTotal = datesCours.length;

        for (let index = 0; index < datesCours.length; index++) {
            const dateSeance = datesCours[index];
            const progression = Math.round(((index + 1) / nbSeancesTotal) * 100);
            console.log(`📸 [${index + 1}/${nbSeancesTotal}] Séance ${dateSeance} (${progression}%)...`);

            // Obtenir le numéro de semaine depuis seancesCompletes (group-specific)
            // Ceci court-circuite la validation calendrierComplet qui est partagé par trimestre
            // et peut ne pas refléter les jours de cours du groupe actif
            const seancesDuJour = seancesCompletes[dateSeance];
            const numSemaine = seancesDuJour && seancesDuJour[0] ? seancesDuJour[0].numeroSemaine : null;

            // Capturer snapshot pour cette séance
            const snapshot = await capturerSnapshotSeance(dateSeance, evaluationsCache, { numeroSemaine: numSemaine });
            if (snapshot) {
                nbSnapshots++;
                console.log(`  ✅ Séance ${dateSeance} capturée (${snapshot.etudiants.length} étudiants)`);
            } else {
                nbEchecs++;
                console.warn(`  ⚠️ Séance ${dateSeance} échec`);
            }
        }

        console.log(`✅ Reconstruction terminée : ${nbSnapshots} captures par séance créées, ${nbEchecs} échecs`);

        // ✅ CORRECTIF CRITIQUE (10 déc 2025): Synchroniser IndexedDB → localStorage cache
        // Les graphiques lisent via db.getSync() qui utilise le cache localStorage
        console.log('🔄 Synchronisation du cache localStorage...');
        await db.syncToLocalStorageCache();
        console.log('✅ Cache synchronisé');

        return {
            succes: true,
            nbSnapshots: nbSnapshots,
            message: `${nbSnapshots} captures par séance reconstruites avec succès${nbEchecs > 0 ? ` (${nbEchecs} échecs)` : ''}`
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
        console.log('✅ Snapshots importés avec succès');
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
   FONCTIONS UI (Réglages → Snapshots)
   =============================== */

/**
 * Affiche les statistiques des captures dans l'interface Réglages
 * ✅ CORRECTIF (13 fév 2026): Lecture async depuis IndexedDB car les snapshots
 * peuvent être trop volumineux pour le cache localStorage (db.getSync)
 */
function afficherStatutSnapshots() {
    const snapshots = db.getSync(cleSnapshots(), { hebdomadaires: [], interventions: [] });

    const nbHebdo = snapshots.hebdomadaires?.length || 0;
    const nbInterventions = snapshots.interventions?.length || 0;

    // Trouver la dernière capture
    let derniereCapture = '—';
    if (nbHebdo > 0) {
        const dernier = snapshots.hebdomadaires[snapshots.hebdomadaires.length - 1];
        derniereCapture = dernier.id || '—';
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
 * Capture manuelle (déclenchée par bouton UI)
 */
async function capturerSnapshotManuel() {
    try {
        const semaine = obtenirNumeroSemaineActuelle();
        if (!semaine) {
            alert('Impossible de déterminer la semaine actuelle. Vérifie la configuration du trimestre.');
            return;
        }

        await capturerSnapshotHebdomadaire(semaine);

        alert(`Capture manuelle réussie pour la semaine ${semaine}!`);
        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors de la capture manuelle:', error);
        alert('Erreur lors de la capture: ' + error.message);
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
        console.log('🔄 Lancement de la reconstruction rétroactive...');
        // ⚡ NOUVEAU : Appel asynchrone (charge depuis IndexedDB)
        const resultats = await reconstruireSnapshotsHistoriques();

        if (resultats.succes) {
            alert(`Reconstruction terminée!\n\n` +
                  `${resultats.nbSnapshots} captures reconstruites avec succès\n\n` +
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

/**
 * Fonction utilitaire pour obtenir le numéro de semaine actuelle
 */
function obtenirNumeroSemaineActuelle() {
    const calendrier = db.getSync(cle('calendrierComplet'), {});
    if (!calendrier || Object.keys(calendrier).length === 0) {
        return null;
    }

    // Chercher le jour le plus récent
    const aujourdhui = new Date().toISOString().split('T')[0];
    const jours = Object.keys(calendrier).sort();

    // Trouver le jour le plus proche
    let jourLePlusProche = jours[0];
    for (const jour of jours) {
        if (jour <= aujourdhui) {
            jourLePlusProche = jour;
        } else {
            break;
        }
    }

    const infoJour = calendrier[jourLePlusProche];
    return infoJour?.numeroSemaine || 1;
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions pour utilisation globale
window.initialiserModuleSnapshots = initialiserModuleSnapshots;
window.verifierEtCapturerSnapshotHebdomadaire = verifierEtCapturerSnapshotHebdomadaire;
window.capturerSnapshotHebdomadaire = capturerSnapshotHebdomadaire;
window.capturerSnapshotIntervention = capturerSnapshotIntervention;
window.mettreAJourSnapshotIntervention = mettreAJourSnapshotIntervention;
window.reconstruireSnapshotsHistoriques = reconstruireSnapshotsHistoriques;
window.exporterSnapshots = exporterSnapshots;
window.importerSnapshots = importerSnapshots;
window.obtenirSnapshotsHebdomadaires = obtenirSnapshotsHebdomadaires;
window.obtenirSnapshotsEtudiant = obtenirSnapshotsEtudiant;
window.obtenirSnapshotsInterventions = obtenirSnapshotsInterventions;
window.calculerIndicesHistoriques = calculerIndicesHistoriques; // Export pour tests

// Fonctions UI
window.afficherStatutSnapshots = afficherStatutSnapshots;
window.capturerSnapshotManuel = capturerSnapshotManuel;
window.lancerReconstructionRetroactive = lancerReconstructionRetroactive;
window.confirmerNettoyageSnapshots = confirmerNettoyageSnapshots;

console.log('📦 Module snapshots.js chargé');


})();
