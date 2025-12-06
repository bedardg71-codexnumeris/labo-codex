/**
 * MODULE SNAPSHOTS - Capture longitudinale progression étudiants (Beta 93)
 *
 * Fonctionnalités :
 * 1. Snapshots hebdomadaires : Portrait complet du groupe chaque semaine
 * 2. Snapshots interventions : Capture avant/après interventions RàI
 * 3. Reconstruction rétroactive : Recalcul des semaines passées
 * 4. Export/Import : Sauvegarde et restauration des snapshots
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
 *         { da: "1234567", A: 85, C: 90, P: 75, E: 0.82, pattern: "Stable", rai: "Niveau 1" }
 *       ],
 *       groupe: {
 *         moyenneA: 82, moyenneC: 88, moyenneP: 71, moyenneE: 0.77,
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
 *       avant: { "1234567": { A: 75, C: 60, P: 65, E: 0.66 } },
 *       apres: null  // Sera rempli 2-3 semaines plus tard
 *     }
 *   ]
 * }
 *
 * @author Grégoire Bédard
 * @date 3 décembre 2025
 * @version 1.0.0
 */

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise le module snapshots au chargement
 */
function initialiserModuleSnapshots() {
    console.log('🔄 Initialisation module snapshots...');

    // Créer structure si première utilisation
    const snapshots = db.getSync('snapshots', null);
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
        db.setSync('snapshots', structure);
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
 * ✨ NOUVEAU (Beta 93) : Calcule les indices A-C-P-E jusqu'à une date limite
 * Permet la reconstruction rétroactive fidèle à l'historique
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
 * @param {Array} evaluationsCache - Cache optionnel des évaluations (pour performance)
 * @returns {Object} - {A: number, C: number, P: number, E: number}
 */
function calculerIndicesHistoriques(da, dateLimite, evaluationsCache = null) {
    // 🐛 DEBUG
    console.log(`[calculerIndicesHistoriques] DA: ${da}, Date: ${dateLimite}, Cache: ${evaluationsCache ? evaluationsCache.length : 'null'}`);

    // Assiduité (A) : Utilise la nouvelle fonction de filtrage temporel
    let indiceA = 100;
    if (typeof calculerAssiduiteJusquADate === 'function') {
        const resultA = calculerAssiduiteJusquADate(da, dateLimite);
        indiceA = Math.round(resultA.indice * 100);
    }

    // Complétion (C) et Performance (P) : Filtrer les évaluations jusqu'à dateLimite
    let indiceC = 100;
    let indiceP = 100;

    // ⚡ OPTIMISATION : Utiliser le cache si fourni
    const evaluations = evaluationsCache || obtenirDonneesSelonMode('evaluationsEtudiants') || [];
    const evaluationsEtudiant = evaluations.filter(e => e.da === da);
    console.log(`[calculerIndicesHistoriques] Évaluations étudiant: ${evaluationsEtudiant.length}`);

    // Filtrer seulement les évaluations JUSQU'À la date limite
    const evaluationsFiltrees = evaluationsEtudiant.filter(e => {
        if (!e.dateEvaluation) return false;
        return e.dateEvaluation <= dateLimite;
    });

    // Calculer C : Proportion de travaux remis (parmi ceux attendus jusqu'à maintenant)
    if (evaluationsFiltrees.length === 0) {
        // Aucune évaluation attendue = 100% (début de session)
        indiceC = 100;
    } else {
        const nbTotal = evaluationsFiltrees.length;
        const nbRemis = evaluationsFiltrees.filter(e =>
            e.statutRemise === 'remis' || e.statut === 'evalue'
        ).length;
        indiceC = Math.round((nbRemis / nbTotal) * 100);
    }

    // Calculer P : Moyenne cumulative des notes (persiste entre les évaluations)
    // ⚠️ IMPORTANT : On calcule la moyenne de TOUTES les évaluations notées jusqu'à maintenant
    // P ne retombe jamais à 100% entre deux artefacts, il garde la moyenne historique
    const evaluationsEvaluees = evaluationsFiltrees.filter(e => e.statut === 'evalue' && e.note !== null);
    if (evaluationsEvaluees.length > 0) {
        const sommeNotes = evaluationsEvaluees.reduce((sum, e) => sum + parseFloat(e.note || 0), 0);
        indiceP = Math.round(sommeNotes / evaluationsEvaluees.length);
    } else {
        // ✅ CORRECTION (Beta 93) : null au lieu de 100% quand aucune évaluation
        // Évite d'afficher une fausse "chute" dans les graphiques (ex: 100% → 76%)
        indiceP = null;
    }

    // Engagement (E) : Moyenne géométrique de A, C, P
    // ✅ CORRECTION (Beta 93) : Si P est null, E est aussi null
    let indiceE;
    if (indiceP === null) {
        indiceE = null;
    } else {
        const A_decimal = indiceA / 100;
        const C_decimal = indiceC / 100;
        const P_decimal = indiceP / 100;
        const E_brut = A_decimal * C_decimal * P_decimal;
        const E = Math.pow(E_brut, 1/3); // Racine cubique
        indiceE = parseFloat(E.toFixed(3));
    }

    const resultat = {
        A: indiceA,
        C: indiceC,
        P: indiceP,
        E: indiceE
    };

    // 🐛 DEBUG
    console.log(`[calculerIndicesHistoriques] RETOUR: A=${resultat.A}, C=${resultat.C}, P=${resultat.P}, E=${resultat.E}`);

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
    const snapshots = db.getSync('snapshots', null);
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
 * Capture un snapshot hebdomadaire pour une semaine donnée
 * @param {number} numSemaine - Numéro de la semaine à capturer
 * @param {Array} evaluationsCacheParam - Cache optionnel des évaluations (pour éviter QuotaExceededError)
 * @returns {Object|null} - Snapshot créé ou null si erreur
 */
async function capturerSnapshotHebdomadaire(numSemaine, evaluationsCacheParam = null) {
    try {
        // Récupérer la date de fin de semaine depuis le calendrier
        const calendrier = obtenirCalendrierComplet();

        // ✨ CORRECTION (Beta 93) : Les dates sont les CLÉS du calendrier, pas une propriété
        // Filtrer les dates (clés) dont l'objet correspond à la semaine demandée
        const datesSemaine = Object.keys(calendrier).filter(date => {
            const jour = calendrier[date];
            return jour.numeroSemaine === numSemaine && jour.statut === 'cours';
        });

        if (datesSemaine.length === 0) {
            console.warn(`⚠️ Aucun jour de cours trouvé pour semaine ${numSemaine}`);
            return null;
        }

        // Trier les dates et prendre première et dernière
        datesSemaine.sort();
        const dateDebut = datesSemaine[0];
        const dateFin = datesSemaine[datesSemaine.length - 1];

        // Calculer indices pour chaque étudiant JUSQU'À LA DATE DE FIN DE SEMAINE
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const snapshotsEtudiants = [];
        // ✅ CORRECTION (Beta 93) : Compteurs séparés pour gérer les valeurs null
        let sommeA = 0, sommeC = 0, sommeP = 0, sommeE = 0;
        let nbAvecP = 0, nbAvecE = 0; // Compter étudiants avec valeurs non-null
        const valeursA = [], valeursC = [], valeursP = [];

        // ⚡ CORRECTION (Beta 93) : Charger depuis IndexedDB par défaut (évite QuotaExceededError localStorage)
        // Note: Le cache fourni vient d'IndexedDB lors de la reconstruction
        let evaluationsCache = evaluationsCacheParam;

        if (!evaluationsCache) {
            // Charger depuis IndexedDB au lieu de localStorage (194 évaluations > quota localStorage)
            try {
                console.log('⚡ Chargement évaluations depuis IndexedDB...');
                evaluationsCache = await db.get('evaluationsEtudiants');
                console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées depuis IndexedDB`);
            } catch (e) {
                console.warn('Impossible de charger depuis IndexedDB:', e.message);
                evaluationsCache = [];
            }
        }

        etudiants.forEach(etudiant => {
            const da = etudiant.da;

            // ✨ NOUVEAU (Beta 93) : Calcul historique avec filtrage temporel + cache
            const indices = calculerIndicesHistoriques(da, dateFin, evaluationsCache);

            // Obtenir pattern et niveau RàI (si module disponible)
            let pattern = 'Non calculé';
            let rai = 'Non calculé';

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

            snapshotsEtudiants.push({
                da: da,
                nom: `${etudiant.prenom} ${etudiant.nom}`,
                A: indices.A,
                C: indices.C,
                P: indices.P,
                E: indices.E, // ✅ Ne plus parser, déjà géré dans calculerIndicesHistoriques
                pattern: pattern,
                rai: rai
            });

            // ✅ CORRECTION (Beta 93) : Accumuler pour moyennes (gérer null)
            sommeA += indices.A;
            sommeC += indices.C;

            // P et E peuvent être null si aucune évaluation
            if (indices.P !== null) {
                sommeP += indices.P;
                nbAvecP++;
            }
            if (indices.E !== null) {
                sommeE += indices.E;
                nbAvecE++;
            }

            valeursA.push(indices.A);
            valeursC.push(indices.C);
            if (indices.P !== null) {
                valeursP.push(indices.P);
            }
        });

        const nbEtudiants = etudiants.length;

        // ✅ CORRECTION (Beta 93) : Calculer statistiques groupe (gérer null)
        const groupe = {
            moyenneA: Math.round(sommeA / nbEtudiants),
            moyenneC: Math.round(sommeC / nbEtudiants),
            // P et E = null si aucun étudiant n'a de valeur (pas encore d'évaluation)
            moyenneP: nbAvecP > 0 ? Math.round(sommeP / nbAvecP) : null,
            moyenneE: nbAvecE > 0 ? parseFloat((sommeE / nbAvecE).toFixed(2)) : null,
            nbEtudiants: nbEtudiants,
            dispersionA: calculerEcartType(valeursA),
            dispersionC: calculerEcartType(valeursC),
            dispersionP: valeursP.length > 0 ? calculerEcartType(valeursP) : null
        };

        // Créer snapshot
        const snapshot = {
            id: `2025-S${String(numSemaine).padStart(2, '0')}`,
            numSemaine: numSemaine,
            dateDebut: dateDebut,
            dateFin: dateFin,
            timestamp: new Date().toISOString(),
            etudiants: snapshotsEtudiants,
            groupe: groupe
        };

        // Sauvegarder
        const snapshots = db.getSync('snapshots');
        snapshots.hebdomadaires.push(snapshot);
        snapshots.metadata.dernierSnapshotHebdo = snapshot.timestamp;
        db.setSync('snapshots', snapshots);

        console.log(`✅ Snapshot semaine ${numSemaine} capturé (${nbEtudiants} étudiants)`);
        return snapshot;

    } catch (error) {
        console.error('❌ Erreur capture snapshot hebdomadaire:', error);
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
                P: indices.P,
                E: parseFloat(indices.E)
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
        const snapshots = db.getSync('snapshots');
        snapshots.interventions.push(snapshotIntervention);
        snapshots.metadata.dernierSnapshotIntervention = snapshotIntervention.date;
        db.setSync('snapshots', snapshots);

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
 * @param {string} interventionId - ID de l'intervention
 * @returns {boolean} - true si succès, false sinon
 */
function mettreAJourSnapshotIntervention(interventionId) {
    try {
        const snapshots = db.getSync('snapshots');
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
                P: indices.P,
                E: parseFloat(indices.E)
            };
        });

        snapshotIntervention.apres = apres;
        snapshotIntervention.dateApres = new Date().toISOString().split('T')[0];

        db.setSync('snapshots', snapshots);

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
 * Reconstruit tous les snapshots hebdomadaires depuis le début du trimestre
 * ATTENTION : Opération coûteuse, à n'exécuter qu'une seule fois au début
 *
 * @returns {Object} - { succes: boolean, nbSnapshots: number, message: string }
 */
async function reconstruireSnapshotsHistoriques() {
    console.log('🔄 Début reconstruction snapshots historiques...');

    try {
        // ⚡ NOUVEAU : Charger les évaluations depuis IndexedDB (évite QuotaExceededError)
        console.log('⚡ Chargement évaluations depuis IndexedDB...');
        const evaluationsCache = await db.get('evaluationsEtudiants');
        console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées`);
        const calendrier = obtenirCalendrierComplet();
        if (!calendrier) {
            console.error('❌ Calendrier non disponible');
            return { succes: false, nbSnapshots: 0, message: 'Calendrier non disponible' };
        }

        console.log(`✓ Calendrier chargé: ${Object.keys(calendrier).length} jours`);

        // Extraire toutes les semaines du calendrier
        const semaines = new Set();
        Object.values(calendrier).forEach(jour => {
            if (jour.statut === 'cours' && jour.numeroSemaine) {
                semaines.add(jour.numeroSemaine);
            }
        });

        const semainesSortees = Array.from(semaines).sort((a, b) => a - b);
        console.log(`✓ Semaines détectées: ${semainesSortees.join(', ')}`);

        if (semainesSortees.length === 0) {
            console.warn('⚠️ Aucune semaine de cours trouvée dans le calendrier');
            return {
                succes: false,
                nbSnapshots: 0,
                message: 'Aucune semaine de cours trouvée dans le calendrier. Vérifiez la configuration du trimestre.'
            };
        }

        // Effacer snapshots existants (reconstruction complète)
        const snapshots = db.getSync('snapshots', { hebdomadaires: [], interventions: [], metadata: {} });
        snapshots.hebdomadaires = [];
        db.setSync('snapshots', snapshots); // ⚡ CORRECTION : Sauvegarder le vidage AVANT la boucle
        console.log('✓ Snapshots existants effacés');

        // Capturer snapshot pour chaque semaine
        let nbSnapshots = 0;
        let nbEchecs = 0;
        const nbSemainesTotal = semainesSortees.length;

        // ⚡ CORRECTION (Beta 93) : Utiliser for...of au lieu de forEach pour supporter async/await
        for (let index = 0; index < semainesSortees.length; index++) {
            const numSemaine = semainesSortees[index];
            const progression = Math.round(((index + 1) / nbSemainesTotal) * 100);
            console.log(`📸 [${index + 1}/${nbSemainesTotal}] Semaine ${numSemaine} (${progression}%)...`);

            // ⚡ NOUVEAU : Passer le cache d'évaluations IndexedDB + AWAIT car fonction async
            const snapshot = await capturerSnapshotHebdomadaire(numSemaine, evaluationsCache);
            if (snapshot) {
                nbSnapshots++;
                console.log(`  ✅ Semaine ${numSemaine} capturée (${snapshot.etudiants.length} étudiants)`);
            } else {
                nbEchecs++;
                console.warn(`  ⚠️ Semaine ${numSemaine} échec`);
            }
        }

        console.log(`✅ Reconstruction terminée : ${nbSnapshots} captures créées, ${nbEchecs} échecs`);
        return {
            succes: true,
            nbSnapshots: nbSnapshots,
            message: `${nbSnapshots} captures hebdomadaires reconstruites avec succès${nbEchecs > 0 ? ` (${nbEchecs} échecs)` : ''}`
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
    const snapshots = db.getSync('snapshots');
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
        db.setSync('snapshots', snapshots);
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
    const snapshots = db.getSync('snapshots', { hebdomadaires: [] });
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
    const snapshots = db.getSync('snapshots', { interventions: [] });
    return snapshots.interventions || [];
}

/* ===============================
   FONCTIONS UI (Réglages → Snapshots)
   =============================== */

/**
 * Affiche les statistiques des captures dans l'interface Réglages
 */
function afficherStatutSnapshots() {
    const snapshots = db.getSync('snapshots', { hebdomadaires: [], interventions: [] });

    const nbHebdo = snapshots.hebdomadaires?.length || 0;
    const nbInterventions = snapshots.interventions?.length || 0;

    // Trouver la dernière capture
    let derniereCapture = '—';
    if (nbHebdo > 0) {
        const dernier = snapshots.hebdomadaires[snapshots.hebdomadaires.length - 1];
        derniereCapture = dernier.id || '—';
    }

    // Mettre à jour les cartes métriques
    const elemHebdo = document.getElementById('stat-snapshots-hebdo');
    const elemInterventions = document.getElementById('stat-snapshots-interventions');
    const elemDerniere = document.getElementById('stat-derniere-capture');

    if (elemHebdo) elemHebdo.textContent = nbHebdo;
    if (elemInterventions) elemInterventions.textContent = nbInterventions;
    if (elemDerniere) elemDerniere.textContent = derniereCapture;

    // Message de statut
    const elemStatus = document.getElementById('info-snapshots-status');
    if (elemStatus) {
        if (nbHebdo === 0 && nbInterventions === 0) {
            elemStatus.innerHTML = `
                <p style="color: #ff9800;">
                    ⚠️ Aucune capture disponible. Utilisez la reconstruction rétroactive pour créer des captures historiques,
                    ou attendez la prochaine capture hebdomadaire automatique.
                </p>
            `;
        } else {
            elemStatus.innerHTML = `
                <p style="color: #4caf50;">
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
            alert('Impossible de déterminer la semaine actuelle. Vérifiez la configuration du trimestre.');
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
        'Voulez-vous vraiment continuer?'
    );

    if (!confirmation1) return;

    const confirmation2 = confirm(
        'Confirmation finale\n\n' +
        'Êtes-vous absolument certain de vouloir supprimer toutes les captures?\n\n' +
        'Cliquez sur OK pour confirmer la suppression.'
    );

    if (!confirmation2) return;

    try {
        // Supprimer toutes les données
        db.setSync('snapshots', { hebdomadaires: [], interventions: [] });

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
    const calendrier = db.getSync('calendrierComplet', {});
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

// Fonctions UI
window.afficherStatutSnapshots = afficherStatutSnapshots;
window.capturerSnapshotManuel = capturerSnapshotManuel;
window.lancerReconstructionRetroactive = lancerReconstructionRetroactive;
window.confirmerNettoyageSnapshots = confirmerNettoyageSnapshots;

console.log('📦 Module snapshots.js chargé');
