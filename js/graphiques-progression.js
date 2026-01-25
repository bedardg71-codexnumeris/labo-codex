/**
 * MODULE GRAPHIQUES PROGRESSION - Visualisations Chart.js (Beta 93)
 *
 * Crée des graphiques d'évolution temporelle des indices A-C-P-E
 * Inspiré des modèles de graphiques du tableur Numbers
 *
 * Types de graphiques :
 * 1. Graphique individuel : Courbes A-C-P-E d'un étudiant avec zones colorées
 * 2. Graphique groupe moyennes : Moyennes A-C-P-E du groupe
 * 3. Graphique groupe spaghetti : Tous les étudiants avec zones colorées
 *
 * @author Grégoire Bédard
 * @date 8 décembre 2025
 * @version 1.1.0 - Uniformisation visuelle + persistance légende
 */

/* ===============================
   CONFIGURATION GLOBALE
   =============================== */

/**
 * Couleurs standardisées pour les indices
 */
const COULEURS_INDICES = {
    A: '#1976D2',      // Bleu foncé (Assiduité)
    C: '#FF6B35',      // Orange vif (Complétion)
    P: '#4CAF50',      // Vert émeraude (Performance)
    E: '#9C27B0'       // Violet (Engagement)
};

/**
 * ✨ UNIFORMISATION (8 déc 2025) : Épaisseur unique pour toutes les courbes
 * Style simple et professionnel (comme graphique critères)
 */
const EPAISSEUR_LIGNE_STANDARD = 2;

/**
 * ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Persistance de l'état de la légende
 * Permet de comparer le même critère/indice entre plusieurs élèves
 */
let etatLegendeGraphiqueACPE = {}; // { 'A': true, 'C': false, 'P': true, 'E': true }
let etatLegendeGraphiqueCriteres = {}; // { 'Structure': true, 'Rigueur': false, ... }

/**
 * Zones colorées selon échelle IDME (0.00 à 1.00)
 */
const ZONES_IDME = [
    {
        yMin: 0.00,
        yMax: 0.40,
        backgroundColor: 'rgba(244, 67, 54, 0.15)',  // Rouge pâle
        borderColor: 'rgba(244, 67, 54, 0.3)',
        label: 'Insuffisant ou Incomplet'
    },
    {
        yMin: 0.40,
        yMax: 0.65,
        backgroundColor: 'rgba(255, 152, 0, 0.15)',  // Orange pâle
        borderColor: 'rgba(255, 152, 0, 0.3)',
        label: 'Réussite (limite inférieure)'
    },
    {
        yMin: 0.65,
        yMax: 0.75,
        backgroundColor: 'rgba(255, 235, 59, 0.15)', // Jaune pâle
        borderColor: 'rgba(255, 235, 59, 0.3)',
        label: 'En développement'
    },
    {
        yMin: 0.75,
        yMax: 0.85,
        backgroundColor: 'rgba(139, 195, 74, 0.15)', // Vert clair pâle
        borderColor: 'rgba(139, 195, 74, 0.3)',
        label: 'Maîtrisé'
    },
    {
        yMin: 0.85,
        yMax: 1.00,
        backgroundColor: 'rgba(100, 181, 246, 0.15)', // Bleu clair pâle
        borderColor: 'rgba(100, 181, 246, 0.3)',
        label: 'Étendu ou enrichi'
    }
];

/* ===============================
   ✨ NOUVEAU (17 déc 2025) : MARQUEURS JETONS ET RÀI
   Détecte les événements pédagogiques pour affichage sur le graphique
   =============================== */

/**
 * Styles de points pour les événements spéciaux
 * Note: color = null signifie utiliser la couleur de base de la courbe
 */
const STYLES_EVENEMENTS = {
    normal: { style: 'circle', radius: 5, color: null },
    jetonDelai: { style: 'star', radius: 9, color: null },      // Étoile (même couleur que P)
    jetonReprise: { style: 'rectRot', radius: 9, color: null }, // Losange (même couleur que P)
    raiNiveau2: { style: 'triangle', radius: 9, color: null },  // Triangle (même couleur que A)
    raiNiveau3: { style: 'rect', radius: 9, color: null }       // Carré (même couleur que A)
};

/**
 * Obtient les événements jetons pour un étudiant, groupés par date de séance
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Array} snapshots - Snapshots de l'étudiant (pour les dates de référence)
 * @returns {Object} - { dateSeance: { type: 'jetonDelai'|'jetonReprise', production: '...' } }
 */
function obtenirJetonsParDate(da, snapshots) {
    const jetonsParDate = {};

    try {
        // ✨ CORRECTION (17 déc 2025) : Utiliser obtenirDonneesSelonMode pour compatibilité IndexedDB
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const productions = obtenirDonneesSelonMode('productions') || [];

        // Filtrer les évaluations de cet étudiant avec jetons
        const evalsAvecJetons = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            (e.jetonDelaiApplique || e.jetonRepriseApplique || e.repriseDeId)
        );

        console.log(`🎫 Jetons pour DA ${da}: ${evalsAvecJetons.length} évaluations avec jetons trouvées`);

        evalsAvecJetons.forEach(evaluation => {
            // Trouver la production pour obtenir le titre et la date d'échéance
            const production = productions.find(p => p.id === evaluation.productionId);
            const titreProduction = production?.description || production?.titre || production?.nom || 'Production';
            const dateEcheance = production?.dateEcheance;

            if (!dateEcheance) {
                console.warn(`  ⚠️ Production ${evaluation.productionId} sans dateEcheance`);
                return;
            }

            // Trouver le snapshot dont la dateSeance correspond ou est la plus proche après l'échéance
            const snapshotCorrespondant = snapshots.find(s => s.dateSeance >= dateEcheance);
            if (!snapshotCorrespondant) {
                console.warn(`  ⚠️ Pas de snapshot après ${dateEcheance}`);
                return;
            }

            const dateSeance = snapshotCorrespondant.dateSeance;

            // Déterminer le type de jeton
            let typeJeton = null;
            if (evaluation.jetonDelaiApplique) {
                typeJeton = 'jetonDelai';
            } else if (evaluation.jetonRepriseApplique || evaluation.repriseDeId) {
                typeJeton = 'jetonReprise';
            }

            if (typeJeton) {
                console.log(`  ✅ Jeton ${typeJeton} sur "${titreProduction}" → séance ${dateSeance}`);
                // Stocker (prioriser reprise sur délai)
                if (!jetonsParDate[dateSeance] || typeJeton === 'jetonReprise') {
                    jetonsParDate[dateSeance] = {
                        type: typeJeton,
                        production: titreProduction
                    };
                }
            }
        });
    } catch (e) {
        console.warn('Erreur lors de la récupération des jetons:', e);
    }

    return jetonsParDate;
}

/**
 * Obtient les interventions RàI pour un étudiant, groupées par date de séance
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Array} snapshots - Snapshots de l'étudiant (pour les dates de référence)
 * @returns {Object} - { dateSeance: { niveau: 2|3, titre: '...' } }
 */
function obtenirRaiParDate(da, snapshots) {
    const raiParDate = {};

    try {
        // Utiliser la fonction globale si disponible
        const interventions = typeof obtenirInterventionsEtudiant === 'function'
            ? obtenirInterventionsEtudiant(da)
            : [];

        // Filtrer les interventions complétées
        const interventionsCompletees = interventions.filter(i => i.statut === 'completee');

        interventionsCompletees.forEach(intervention => {
            const dateIntervention = intervention.date;
            if (!dateIntervention) return;

            // Trouver le snapshot dont la dateSeance correspond exactement ou est la plus proche
            // On cherche d'abord une correspondance exacte
            let snapshotCorrespondant = snapshots.find(s => s.dateSeance === dateIntervention);

            // Si pas de correspondance exacte, prendre le snapshot le plus proche après
            if (!snapshotCorrespondant) {
                snapshotCorrespondant = snapshots.find(s => s.dateSeance >= dateIntervention);
            }

            if (!snapshotCorrespondant) return;

            const dateSeance = snapshotCorrespondant.dateSeance;

            // Stocker (prioriser niveau 3 sur niveau 2)
            const niveauActuel = raiParDate[dateSeance]?.niveau || 0;
            if (intervention.niveauRai > niveauActuel) {
                raiParDate[dateSeance] = {
                    niveau: intervention.niveauRai,
                    titre: intervention.titre || `Intervention niveau ${intervention.niveauRai}`
                };
            }
        });
    } catch (e) {
        console.warn('Erreur lors de la récupération des interventions RàI:', e);
    }

    return raiParDate;
}

/**
 * Génère les tableaux de styles de points pour un dataset
 * @param {Array} snapshots - Snapshots avec dateSeance
 * @param {Object} evenementsParDate - { dateSeance: { type, ... } }
 * @param {string} typeEvenement - 'jeton' ou 'rai' ou 'none'
 * @param {string} couleurBase - Couleur par défaut de la courbe
 * @returns {Object} - { pointStyle: [], pointRadius: [], pointBackgroundColor: [] }
 */
function genererStylesPoints(snapshots, evenementsParDate, typeEvenement, couleurBase) {
    const pointStyle = [];
    const pointRadius = [];
    const pointBackgroundColor = [];

    snapshots.forEach(snapshot => {
        const dateSeance = snapshot.dateSeance;
        const evenement = evenementsParDate[dateSeance];

        if (evenement && typeEvenement !== 'none') {
            let style;
            if (typeEvenement === 'jeton') {
                style = STYLES_EVENEMENTS[evenement.type] || STYLES_EVENEMENTS.normal;
            } else if (typeEvenement === 'rai') {
                style = evenement.niveau === 3
                    ? STYLES_EVENEMENTS.raiNiveau3
                    : STYLES_EVENEMENTS.raiNiveau2;
            } else {
                style = STYLES_EVENEMENTS.normal;
            }

            pointStyle.push(style.style);
            pointRadius.push(style.radius);
            pointBackgroundColor.push(couleurBase); // Toujours la couleur de la courbe
        } else {
            pointStyle.push(STYLES_EVENEMENTS.normal.style);
            pointRadius.push(STYLES_EVENEMENTS.normal.radius);
            pointBackgroundColor.push(couleurBase);
        }
    });

    return { pointStyle, pointRadius, pointBackgroundColor };
}

/* ===============================
   PLUGIN ÉTIQUETTES DE COURBES
   =============================== */

/**
 * ✨ NOUVEAU (Beta 93) : Plugin pour afficher les étiquettes "A", "C", "P", "E" sur les courbes
 * Affiche l'étiquette à la fin de chaque ligne pour identifier visuellement les indices
 */
const pluginEtiquettesCourbes = {
    id: 'etiquettesCourbes',
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            if (!meta.hidden && dataset.data.length > 0) {
                // Obtenir le dernier point de la courbe
                const dernierIndex = dataset.data.length - 1;
                const dernierPoint = meta.data[dernierIndex];

                if (dernierPoint) {
                    // Extraire la lettre de l'étiquette (ex: "Assiduité (A)" → "A")
                    const match = dataset.label.match(/\(([A-Z])\)/);
                    const lettre = match ? match[1] : dataset.label.charAt(0);

                    // Position du texte (légèrement à droite du dernier point)
                    const x = dernierPoint.x + 15;
                    const y = dernierPoint.y;

                    // Style du texte
                    ctx.save();
                    ctx.font = 'bold 14px Arial';
                    ctx.fillStyle = dataset.borderColor;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';

                    // Dessiner un cercle blanc derrière pour contraste
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.beginPath();
                    ctx.arc(x + 8, y, 12, 0, Math.PI * 2);
                    ctx.fill();

                    // Dessiner la lettre
                    ctx.fillStyle = dataset.borderColor;
                    ctx.fillText(lettre, x + 2, y);
                    ctx.restore();
                }
            }
        });
    }
};

/* ===============================
   GRAPHIQUE INDIVIDUEL
   =============================== */

/**
 * Crée un graphique d'évolution pour un étudiant spécifique
 * Affiche les courbes A-C-P-E avec zones colorées en arrière-plan
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueIndividuel(canvasId, da) {
    try {
        // Récupérer les snapshots de l'étudiant
        const snapshots = obtenirSnapshotsEtudiant(da);

        if (snapshots.length === 0) {
            console.warn(`Aucun snapshot disponible pour DA ${da}`);
            return null;
        }

        // Préparer les données
        // ✅ NOUVEAU (Beta 94 - 10 déc 2025) : Snapshots ponctuals A-C-P uniquement (E retiré)
        // ✅ CORRECTION (Beta 93) : Gérer null pour P (pas encore d'évaluation)
        // ✨ AMÉLIORATION (Beta 93) : Offset vertical léger pour éviter superposition des courbes
        const OFFSET_VISUEL = {
            A: 0.000,   // Baseline (pas de décalage)
            C: 0.005,   // +0.5% (~2px sur graphique 400px)
            P: 0.010    // +1.0% (~4px)
        };

        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);
        // ✅ NOUVEAU (Beta 94 - 10 déc 2025) : Utiliser A_cumulatif pour le graphique individuel
        // A_cumulatif = assiduité depuis le début (cohérent avec C et P cumulatifs)
        const donneesA = snapshots.map(s => {
            const valeur = s.A_cumulatif !== undefined ? s.A_cumulatif : s.A; // Fallback si ancien snapshot
            return valeur !== null && valeur !== 0 ? (valeur / 100) + OFFSET_VISUEL.A : null;
        });
        const donneesC = snapshots.map(s => s.C !== null && s.C !== 0 ? (s.C / 100) + OFFSET_VISUEL.C : null);
        const donneesP = snapshots.map(s => s.P !== null && s.P !== 0 ? (s.P / 100) + OFFSET_VISUEL.P : null);

        // ✨ NOUVEAU (17 déc 2025) : Récupérer les événements pédagogiques pour marqueurs visuels
        // Indexés par dateSeance pour éviter les doublons sur les semaines à 2 séances
        const jetonsParDate = obtenirJetonsParDate(da, snapshots);
        const raiParDate = obtenirRaiParDate(da, snapshots);

        // Générer les styles de points personnalisés
        // - Courbe A : marqueurs RàI (triangle niveau 2, carré niveau 3)
        // - Courbe P : marqueurs jetons (étoile délai, losange reprise)
        const stylesA = genererStylesPoints(snapshots, raiParDate, 'rai', COULEURS_INDICES.A);
        const stylesC = genererStylesPoints(snapshots, {}, 'none', COULEURS_INDICES.C); // Pas de marqueurs sur C
        const stylesP = genererStylesPoints(snapshots, jetonsParDate, 'jeton', COULEURS_INDICES.P);

        // Stocker les infos pour les tooltips enrichis
        const infosEvenements = { jetonsParDate, raiParDate, snapshots };

        // Calculer min/max pour ajuster l'échelle Y
        // ✅ CORRECTION (Beta 93) : Filtrer les valeurs null avant calcul min/max
        // ✨ AMÉLIORATION (Beta 93) : Échelle fixe 60-100% pour meilleure lisibilité
        const toutesValeurs = [...donneesA, ...donneesC, ...donneesP].filter(v => v !== null);
        const valeurMin = Math.min(...toutesValeurs);
        const valeurMax = Math.max(...toutesValeurs);

        // Échelle fixe pour contexte pédagogique (60-105%)
        // La plupart des étudiants se situent dans cette plage
        // Max à 105% pour accommoder l'offset visuel (+0.5-1.5%)
        let yMin = 0.60;  // 60%
        let yMax = 1.05;  // 105% (permet affichage avec offset)

        // Si des valeurs descendent sous 60%, ajuster yMin dynamiquement
        if (valeurMin < 0.60) {
            yMin = Math.max(0, Math.floor(valeurMin * 10) / 10); // Arrondir vers le bas (ex: 0.53 → 0.50)
        }

        // Obtenir le canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginEtiquettesCourbes], // ✨ Activer le plugin d'étiquettes
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Assiduité (A)',
                        data: donneesA,
                        borderColor: COULEURS_INDICES.A,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4, // Courbes lisses
                        // ✨ NOUVEAU (17 déc 2025) : Styles personnalisés pour marqueurs RàI
                        pointStyle: stylesA.pointStyle,
                        pointRadius: stylesA.pointRadius,
                        pointHoverRadius: 9,
                        pointBackgroundColor: stylesA.pointBackgroundColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Complétion (C)',
                        data: donneesC,
                        borderColor: COULEURS_INDICES.C,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4,
                        pointStyle: stylesC.pointStyle,
                        pointRadius: stylesC.pointRadius,
                        pointHoverRadius: 7,
                        pointBackgroundColor: stylesC.pointBackgroundColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false
                    },
                    {
                        label: 'Performance (P)',
                        data: donneesP,
                        borderColor: COULEURS_INDICES.P,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4,
                        // ✨ NOUVEAU (17 déc 2025) : Styles personnalisés pour marqueurs jetons
                        pointStyle: stylesP.pointStyle,
                        pointRadius: stylesP.pointRadius,
                        pointHoverRadius: 9,
                        pointBackgroundColor: stylesP.pointBackgroundColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: ['Évolution des indices A-C-P (par séance)', 'Indices cumulatifs depuis le début du trimestre'],
                        font: [
                            { size: 16, weight: 'bold' },
                            { size: 11, weight: 'normal', style: 'italic' }
                        ],
                        color: ['#333', '#777'],
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                        },
                        onClick: function(e, legendItem, legend) {
                            // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Persistance de la légende
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);

                            // Toggle visibilité
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;

                            // Sauvegarder l'état (extraire la lettre de l'étiquette)
                            const match = legendItem.text.match(/\(([A-Z])\)/);
                            const indice = match ? match[1] : legendItem.text;
                            etatLegendeGraphiqueACPE[indice] = meta.hidden === null ? true : false;

                            chart.update();
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            // ✨ NOUVEAU (17 déc 2025) : Afficher la date de la séance dans le titre
                            title: function(tooltipItems) {
                                if (!tooltipItems.length) return '';
                                const index = tooltipItems[0].dataIndex;
                                const snapshot = infosEvenements.snapshots[index];
                                if (!snapshot) return tooltipItems[0].label;

                                // Formater la date (YYYY-MM-DD → JJ mois AAAA)
                                const dateSeance = snapshot.dateSeance;
                                if (dateSeance) {
                                    const date = new Date(dateSeance + 'T12:00:00');
                                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                                    return `Sem. ${snapshot.numSemaine} (${dateFormatee})`;
                                }
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                const label = context.dataset.label || '';
                                // ✨ Soustraire l'offset visuel pour afficher la valeur réelle
                                const offsets = [0.000, 0.005, 0.010, 0.015]; // A, C, P, E
                                const offset = offsets[context.datasetIndex] || 0;
                                const valeurReelle = context.parsed.y - offset;
                                const value = (valeurReelle * 100).toFixed(0);
                                return `${label}: ${value}%`;
                            },
                            // ✨ NOUVEAU (17 déc 2025) : Afficher les détails des événements pédagogiques
                            afterBody: function(tooltipItems) {
                                if (!tooltipItems.length) return [];

                                const index = tooltipItems[0].dataIndex;
                                const snapshot = infosEvenements.snapshots[index];
                                if (!snapshot) return [];

                                const dateSeance = snapshot.dateSeance;
                                const lignes = [];

                                // Vérifier s'il y a un jeton à cette date
                                const jeton = infosEvenements.jetonsParDate[dateSeance];
                                if (jeton) {
                                    const typeLabel = jeton.type === 'jetonDelai' ? '⭐ Jeton délai' : '◆ Jeton reprise';
                                    lignes.push('');
                                    lignes.push(`${typeLabel} sur "${jeton.production}"`);
                                }

                                // Vérifier s'il y a une intervention RàI à cette date
                                const rai = infosEvenements.raiParDate[dateSeance];
                                if (rai) {
                                    const niveauLabel = rai.niveau === 3 ? '■ RàI Niveau 3' : '▲ RàI Niveau 2';
                                    lignes.push('');
                                    lignes.push(`${niveauLabel}: ${rai.titre}`);
                                }

                                return lignes;
                            }
                        }
                    },
                    annotation: {
                        annotations: creerAnnotationsZones()
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Semaines'
                        }
                    },
                    y: {
                        min: yMin,
                        max: yMax,
                        title: {
                            display: true,
                            text: 'Indices (0.60 à 1.05)'  // ✨ Échelle étendue pour offset visuel
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Restaurer l'état de la légende
        // Permet de comparer le même indice entre plusieurs élèves
        const indices = ['A', 'C', 'P', 'E'];
        indices.forEach((indice, index) => {
            if (etatLegendeGraphiqueACPE[indice] === false) {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = true;
            }
        });
        chart.update();

        console.log(`✅ Graphique individuel créé pour DA ${da}`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique individuel:', error);
        return null;
    }
}

/**
 * Crée les annotations pour les zones colorées IDME
 * @returns {Object} - Configuration des annotations
 */
function creerAnnotationsZones() {
    const annotations = {};

    ZONES_IDME.forEach((zone, index) => {
        annotations[`zone${index}`] = {
            type: 'box',
            yMin: zone.yMin,
            yMax: zone.yMax,
            backgroundColor: zone.backgroundColor,
            borderColor: zone.borderColor,
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw' // Dessiner derrière les courbes
        };
    });

    return annotations;
}

/* ===============================
   GRAPHIQUE GROUPE - MOYENNES
   =============================== */

/**
 * Crée un graphique des moyennes du groupe
 * Affiche les moyennes A-C-P-E avec zones colorées
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueGroupeMoyennes(canvasId) {
    try {
        // Détruire le graphique existant si présent (évite l'erreur "Canvas already in use")
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
                console.log('🗑️ Graphique existant détruit');
            }
        }

        // Récupérer tous les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();

        if (snapshots.length === 0) {
            console.warn('Aucun snapshot hebdomadaire disponible');
            return null;
        }

        // Trier par semaine
        snapshots.sort((a, b) => a.numSemaine - b.numSemaine);

        // Préparer les données
        // ✅ NOUVEAU (Beta 94 - 10 déc 2025) : Snapshots ponctuals A-C-P uniquement (E retiré)
        // ✅ CORRECTION (Beta 93) : Gérer null pour P (pas encore d'évaluation)
        // ✨ AMÉLIORATION (Beta 93) : Offset vertical léger pour éviter superposition des courbes
        const OFFSET_VISUEL = {
            A: 0.000,   // Baseline (pas de décalage)
            C: 0.005,   // +0.5% (~2px sur graphique 400px)
            P: 0.010    // +1.0% (~4px)
        };

        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);
        // ✅ CORRECTION (8 déc 2025) : Ne pas afficher les valeurs à 0 ou null (semaines sans données ou futures)
        const donneesA = snapshots.map(s => s.groupe.moyenneA !== null && s.groupe.moyenneA !== 0 ? (s.groupe.moyenneA / 100) + OFFSET_VISUEL.A : null);
        const donneesC = snapshots.map(s => s.groupe.moyenneC !== null && s.groupe.moyenneC !== 0 ? (s.groupe.moyenneC / 100) + OFFSET_VISUEL.C : null);
        const donneesP = snapshots.map(s => s.groupe.moyenneP !== null && s.groupe.moyenneP !== 0 ? (s.groupe.moyenneP / 100) + OFFSET_VISUEL.P : null);

        // Vérifier que le canvas existe toujours (déjà récupéré en haut de la fonction)
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Assiduité (A)',
                        data: donneesA,
                        borderColor: COULEURS_INDICES.A,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COULEURS_INDICES.A,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Complétion (C)',
                        data: donneesC,
                        borderColor: COULEURS_INDICES.C,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COULEURS_INDICES.C,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false
                    },
                    {
                        label: 'Performance (P)',
                        data: donneesP,
                        borderColor: COULEURS_INDICES.P,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEUR_LIGNE_STANDARD,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COULEURS_INDICES.P,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: ['Évolution du groupe - Moyennes A-C-P (par séance)', 'A et C : ponctuals (cette séance) • P : cumulatif (depuis le début)'],
                        font: [
                            { size: 16, weight: 'bold' },
                            { size: 11, weight: 'normal', style: 'italic' }
                        ],
                        color: ['#333', '#777'],
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                        },
                        onClick: function(e, legendItem, legend) {
                            // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Persistance de la légende
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);

                            // Toggle visibilité
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;

                            // Sauvegarder l'état (extraire la lettre de l'étiquette)
                            const match = legendItem.text.match(/\(([A-Z])\)/);
                            const indice = match ? match[1] : legendItem.text;
                            etatLegendeGraphiqueACPE[indice] = meta.hidden === null ? true : false;

                            chart.update();
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                // ✨ Soustraire l'offset visuel pour afficher la valeur réelle
                                const offsets = [0.000, 0.005, 0.010, 0.015]; // A, C, P, E
                                const offset = offsets[context.datasetIndex] || 0;
                                const valeurReelle = context.parsed.y - offset;
                                const value = (valeurReelle * 100).toFixed(0);
                                return `${label}: ${value}%`;
                            }
                        }
                    },
                    annotation: {
                        annotations: creerAnnotationsZones()
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Semaines'
                        }
                    },
                    y: {
                        min: 0.60,  // ✨ AMÉLIORATION (Beta 93) : Échelle 60-105% pour meilleure lisibilité
                        max: 1.05,  // 105% pour accommoder l'offset visuel (+0.5-1.5%)
                        title: {
                            display: true,
                            text: 'Indices (0.60 à 1.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Restaurer l'état de la légende
        // Permet de comparer le même indice entre plusieurs vues
        const indices = ['A', 'C', 'P', 'E'];
        indices.forEach((indice, index) => {
            if (etatLegendeGraphiqueACPE[indice] === false) {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = true;
            }
        });
        chart.update();

        console.log('✅ Graphique groupe moyennes créé');
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique groupe moyennes:', error);
        return null;
    }
}

/* ===============================
   GRAPHIQUE GROUPE - SPAGHETTI
   =============================== */

/**
 * Instance globale du graphique spaghetti (pour pouvoir le détruire/recréer)
 */
let graphiqueSpaghettiInstance = null;

/**
 * Plugin pour afficher les étiquettes de zones IDME sur le côté droit
 * Comme dans l'image de référence (Étendu ou enrichi, Réussite, etc.)
 */
const pluginEtiquettesZones = {
    id: 'etiquettesZones',
    afterDraw(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const yScale = chart.scales.y;

        // Configuration des étiquettes de zones
        const zones = [
            { yMin: 0.85, yMax: 1.00, label: 'Étendu ou enrichi', color: '#1565C0' },
            { yMin: 0.65, yMax: 0.75, label: 'Réussite', color: '#2E7D32' },
            { yMin: 0.00, yMax: 0.40, label: 'Insuffisant ou incomplet', color: '#C62828' }
        ];

        ctx.save();
        ctx.font = 'italic 11px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        zones.forEach(zone => {
            const yCenter = (zone.yMin + zone.yMax) / 2;
            const yPixel = yScale.getPixelForValue(yCenter);

            // Vérifier que la position est dans la zone du graphique
            if (yPixel >= chartArea.top && yPixel <= chartArea.bottom) {
                ctx.fillStyle = zone.color;
                ctx.fillText(zone.label, chartArea.right - 5, yPixel);
            }
        });

        ctx.restore();
    }
};

/**
 * Crée un graphique "spaghetti" avec tous les étudiants
 * Affiche toutes les trajectoires individuelles avec zones colorées IDME
 * Inspiré du graphique "Évolution de la performance littéracique PAN semaines 2 à 15"
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {string} indice - 'A', 'C', 'P' ou 'E' (quel indice afficher)
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueGroupeSpaghetti(canvasId, indice = 'P') {
    try {
        // Détruire le graphique existant si présent (évite l'erreur "Canvas already in use")
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
                console.log('🗑️ Graphique spaghetti existant détruit');
            }
        }

        // Récupérer tous les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();

        if (snapshots.length === 0) {
            console.warn('Aucun snapshot hebdomadaire disponible pour le graphique spaghetti');
            // Afficher un message dans le canvas
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.font = '14px Arial';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.fillText('En attente de données...', canvas.width / 2, canvas.height / 2);
                ctx.font = '12px Arial';
                ctx.fillText('Les snapshots hebdomadaires seront générés automatiquement.', canvas.width / 2, canvas.height / 2 + 25);
            }
            return null;
        }

        // Trier par semaine
        snapshots.sort((a, b) => a.numSemaine - b.numSemaine);

        // Extraire la liste unique des étudiants (depuis le snapshot le plus récent pour avoir tous)
        const dernierSnap = snapshots[snapshots.length - 1];
        const etudiants = dernierSnap.etudiants || [];

        if (etudiants.length === 0) {
            console.warn('Aucun étudiant dans les snapshots');
            return null;
        }

        // Préparer les labels (semaines) - Format "Semaine X" comme l'image
        const labels = snapshots.map(s => `Semaine ${s.numSemaine}`);

        // Créer un dataset par étudiant
        const datasets = etudiants.map(etudiant => {
            const da = etudiant.da;

            // Extraire les valeurs de cet étudiant pour chaque semaine
            const donnees = snapshots.map(snap => {
                const etud = snap.etudiants.find(e => e.da === da);
                if (!etud) return null;

                // Retourner la valeur de l'indice demandé (en 0-1)
                const valeur = etud[indice];
                if (valeur === null || valeur === undefined) return null;

                // Convertir en décimal si nécessaire (les indices A, C, P sont en %)
                return valeur > 1 ? valeur / 100 : valeur;
            });

            // Vérifier si l'étudiant a des données valides
            const aDonnees = donnees.some(v => v !== null);
            if (!aDonnees) return null;

            return {
                label: etudiant.nom || `DA ${da}`,
                data: donnees,
                borderColor: 'rgba(30, 30, 30, 0.5)', // Noir semi-transparent
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.3, // Courbes légèrement lissées
                pointRadius: 0, // Pas de points (spaghetti pur)
                pointHoverRadius: 4,
                pointHoverBackgroundColor: 'rgba(30, 30, 30, 0.8)',
                spanGaps: true // Connecter les points même s'il y a des trous
            };
        }).filter(d => d !== null); // Filtrer les étudiants sans données

        if (datasets.length === 0) {
            console.warn('Aucune donnée valide pour le graphique spaghetti');
            return null;
        }

        // Obtenir le canvas (déjà récupéré en haut)
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Nom de l'indice pour le titre
        const nomsIndices = {
            'A': 'l\'Assiduité',
            'C': 'la Complétion',
            'P': 'la Performance',
            'E': 'l\'Engagement'
        };

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginEtiquettesZones], // Plugin pour étiquettes de zones
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 120 // Espace pour les étiquettes de zones à droite
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution de ${nomsIndices[indice]} - Tous les étudiants`,
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: false // Trop d'étudiants pour afficher la légende
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0]?.label || '';
                            },
                            label: function(context) {
                                const nom = context.dataset.label || '';
                                const value = context.parsed.y !== null ? (context.parsed.y * 100).toFixed(0) : '—';
                                return `${nom}: ${value}%`;
                            }
                        }
                    },
                    annotation: {
                        annotations: creerAnnotationsZonesIDME()
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: false // Les labels sont suffisamment explicites
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        title: {
                            display: false // Simplifié comme l'image
                        },
                        ticks: {
                            callback: function(value) {
                                // Format décimal avec 3 chiffres comme l'image (0,000 à 1,000)
                                return value.toFixed(3).replace('.', ',');
                            },
                            stepSize: 0.25,
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.08)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: true
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);
        graphiqueSpaghettiInstance = chart;

        console.log(`✅ Graphique spaghetti créé (${indice}) avec ${datasets.length} étudiants`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique spaghetti:', error);
        return null;
    }
}

/**
 * Crée les annotations pour les zones colorées IDME (version améliorée pour spaghetti)
 * Couleurs plus saturées pour meilleure visibilité avec les lignes noires
 * @returns {Object} - Configuration des annotations
 */
function creerAnnotationsZonesIDME() {
    return {
        zoneInsuffisant: {
            type: 'box',
            yMin: 0.00,
            yMax: 0.40,
            backgroundColor: 'rgba(239, 154, 154, 0.5)',  // Rouge plus visible
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        },
        zoneReussite: {
            type: 'box',
            yMin: 0.40,
            yMax: 0.65,
            backgroundColor: 'rgba(255, 224, 178, 0.5)',  // Orange clair
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        },
        zoneDeveloppement: {
            type: 'box',
            yMin: 0.65,
            yMax: 0.75,
            backgroundColor: 'rgba(255, 245, 157, 0.5)',  // Jaune
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        },
        zoneMaitrise: {
            type: 'box',
            yMin: 0.75,
            yMax: 0.85,
            backgroundColor: 'rgba(200, 230, 201, 0.5)',  // Vert clair
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        },
        zoneEtendu: {
            type: 'box',
            yMin: 0.85,
            yMax: 1.00,
            backgroundColor: 'rgba(144, 202, 249, 0.5)',  // Bleu clair
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        }
    };
}

/**
 * Rafraîchit le graphique spaghetti avec un nouvel indice
 * Appelé depuis le dropdown de sélection
 */
function rafraichirGraphiqueSpaghetti() {
    const select = document.getElementById('select-indice-spaghetti');
    const indice = select ? select.value : 'P';
    creerGraphiqueGroupeSpaghetti('graphique-groupe-spaghetti', indice);
}

/* ===============================
   UTILITAIRES
   =============================== */

/**
 * Détruit un graphique Chart.js existant
 * @param {Chart} chart - Instance Chart.js à détruire
 */
function detruireGraphique(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

/* ===============================
   GRAPHIQUE ÉVOLUTION DES CRITÈRES
   =============================== */

/**
 * Récupère les données d'évolution des critères pour un étudiant
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - { labels: [], datasets: [] } ou null si erreur
 */
function obtenirDonneesCriteres(da) {
    try {
        // Récupérer les évaluations de l'étudiant
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const evaluationsEtudiant = evaluations.filter(e =>
            e.etudiantDA === da &&
            e.criteres &&
            Array.isArray(e.criteres) &&
            e.criteres.length > 0
        );

        if (evaluationsEtudiant.length === 0) {
            console.warn(`Aucune évaluation avec détails critères pour DA ${da}`);
            return null;
        }

        // Trier par date d'évaluation
        evaluationsEtudiant.sort((a, b) => {
            const dateA = a.dateEvaluation || '';
            const dateB = b.dateEvaluation || '';
            return dateA.localeCompare(dateB);
        });

        // Récupérer les productions pour les noms
        const productions = obtenirDonneesSelonMode('productions') || [];

        // Extraire les critères uniques depuis toutes les évaluations
        const criteresSet = new Set();
        evaluationsEtudiant.forEach(e => {
            if (e.criteres && Array.isArray(e.criteres)) {
                e.criteres.forEach(c => {
                    if (c.critereNom) {
                        criteresSet.add(c.critereNom);
                    }
                });
            }
        });
        const criteresUniques = Array.from(criteresSet).sort();

        if (criteresUniques.length === 0) {
            console.warn(`Aucun critère trouvé dans les évaluations pour DA ${da}`);
            return null;
        }

        // Préparer les labels (noms des productions)
        const labels = evaluationsEtudiant.map(e => {
            const production = productions.find(p => p.id === e.productionId);
            return production?.description || production?.nom || `Prod. ${e.productionId}`;
        });

        // Préparer les données par critère
        const donneesCriteres = {};

        criteresUniques.forEach(nomCritere => {
            donneesCriteres[nomCritere] = evaluationsEtudiant.map(e => {
                // Trouver le critère dans l'array
                const critere = e.criteres.find(c => c.critereNom === nomCritere);
                if (!critere || !critere.niveauSelectionne) return null;

                const niveau = critere.niveauSelectionne;

                // Si c'est une lettre IDME, convertir en pourcentage
                if (typeof niveau === 'string') {
                    const niveauUpper = niveau.trim().toUpperCase();
                    if (niveauUpper === '0') return 0;
                    if (niveauUpper === 'I') return 40;
                    if (niveauUpper === 'D') return 65;
                    if (niveauUpper === 'M') return 75;
                    if (niveauUpper === 'E') return 100;
                }

                // Si c'est un nombre sur 4, convertir en pourcentage
                const noteNum = parseFloat(niveau);
                if (isNaN(noteNum)) return null;
                return noteNum <= 4 ? (noteNum / 4) * 100 : noteNum;
            });
        });

        return {
            labels,
            criteres: donneesCriteres,
            criteresUniques
        };
    } catch (error) {
        console.error('[obtenirDonneesCriteres] Erreur:', error);
        return null;
    }
}

/**
 * Crée un graphique d'évolution des critères pour un étudiant
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueCriteres(canvasId, da) {
    try {
        // Récupérer les données
        const donnees = obtenirDonneesCriteres(da);

        if (!donnees) {
            console.warn(`Impossible de créer le graphique critères pour DA ${da}`);
            return null;
        }

        // Palette de couleurs pour les critères (distinctes et contrastées)
        const COULEURS_CRITERES = [
            '#E91E63',  // Rose foncé
            '#9C27B0',  // Violet
            '#3F51B5',  // Indigo
            '#00BCD4',  // Cyan
            '#4CAF50',  // Vert
            '#FF9800',  // Orange
            '#795548',  // Brun
            '#607D8B'   // Bleu-gris
        ];

        // Créer les datasets (une courbe par critère)
        const datasets = donnees.criteresUniques.map((critere, index) => {
            const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];

            return {
                label: critere,
                data: donnees.criteres[critere],
                borderColor: couleur,
                backgroundColor: couleur + '20', // Transparence 20%
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: couleur,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                spanGaps: false
            };
        });

        // Obtenir le canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const config = {
            type: 'line',
            data: {
                labels: donnees.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des critères au fil des productions',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                        },
                        onClick: function(e, legendItem, legend) {
                            // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Persistance de la légende
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);

                            // Toggle visibilité
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;

                            // Sauvegarder l'état (nom du critère)
                            const nomCritere = legendItem.text;
                            etatLegendeGraphiqueCriteres[nomCritere] = meta.hidden === null ? true : false;

                            chart.update();
                        }
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: function(context) {
                                const critere = context.dataset.label;
                                const valeur = context.parsed.y;
                                return valeur !== null ? `${critere}: ${valeur.toFixed(1)}%` : `${critere}: —`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            // ✨ NOUVEAU (8 déc 2025) : Zones colorées IDME en arrière-plan
                            zone0: {
                                type: 'box',
                                yMin: 0,
                                yMax: 40,
                                backgroundColor: 'rgba(244, 67, 54, 0.15)',  // Rouge pâle
                                borderColor: 'rgba(244, 67, 54, 0.3)',
                                borderWidth: 0,
                                drawTime: 'beforeDatasetsDraw'
                            },
                            zone1: {
                                type: 'box',
                                yMin: 40,
                                yMax: 65,
                                backgroundColor: 'rgba(255, 152, 0, 0.15)',  // Orange pâle
                                borderColor: 'rgba(255, 152, 0, 0.3)',
                                borderWidth: 0,
                                drawTime: 'beforeDatasetsDraw'
                            },
                            zone2: {
                                type: 'box',
                                yMin: 65,
                                yMax: 75,
                                backgroundColor: 'rgba(255, 235, 59, 0.15)', // Jaune pâle
                                borderColor: 'rgba(255, 235, 59, 0.3)',
                                borderWidth: 0,
                                drawTime: 'beforeDatasetsDraw'
                            },
                            zone3: {
                                type: 'box',
                                yMin: 75,
                                yMax: 85,
                                backgroundColor: 'rgba(139, 195, 74, 0.15)', // Vert clair pâle
                                borderColor: 'rgba(139, 195, 74, 0.3)',
                                borderWidth: 0,
                                drawTime: 'beforeDatasetsDraw'
                            },
                            zone4: {
                                type: 'box',
                                yMin: 85,
                                yMax: 100,
                                backgroundColor: 'rgba(100, 181, 246, 0.15)', // Bleu clair pâle
                                borderColor: 'rgba(100, 181, 246, 0.3)',
                                borderWidth: 0,
                                drawTime: 'beforeDatasetsDraw'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Productions',
                            font: { size: 13, weight: 'bold' }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11 }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Performance (%)',
                            font: { size: 13, weight: 'bold' }
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: function(context) {
                                // Lignes de grille aux seuils clés
                                if (context.tick.value === 40) return 'rgba(255, 0, 0, 0.2)'; // Insuffisant
                                if (context.tick.value === 65) return 'rgba(255, 152, 0, 0.2)'; // Développement
                                if (context.tick.value === 75) return 'rgba(76, 175, 80, 0.2)'; // Maîtrisé
                                return 'rgba(0, 0, 0, 0.1)';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Restaurer l'état de la légende
        // Permet de comparer le même critère entre plusieurs élèves
        donnees.criteresUniques.forEach((critere, index) => {
            if (etatLegendeGraphiqueCriteres[critere] === false) {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = true;
            }
        });
        chart.update();

        console.log(`✅ Graphique critères créé avec ${donnees.criteresUniques.length} critères`);
        return chart;

    } catch (error) {
        console.error('[creerGraphiqueCriteres] Erreur:', error);
        return null;
    }
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions pour utilisation globale
window.creerGraphiqueIndividuel = creerGraphiqueIndividuel;
window.creerGraphiqueGroupeMoyennes = creerGraphiqueGroupeMoyennes;
window.creerGraphiqueGroupeSpaghetti = creerGraphiqueGroupeSpaghetti;
window.rafraichirGraphiqueSpaghetti = rafraichirGraphiqueSpaghetti;
window.creerGraphiqueCriteres = creerGraphiqueCriteres;
window.detruireGraphique = detruireGraphique;

console.log('📊 Module graphiques-progression.js chargé');
