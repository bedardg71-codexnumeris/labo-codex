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
 * @date 3 décembre 2025
 * @version 1.0.0
 */

/* ===============================
   CONFIGURATION GLOBALE
   =============================== */

/**
 * Couleurs standardisées pour les indices
 * ✨ AMÉLIORATION (Beta 93) : Couleurs plus contrastées et épaisseurs différenciées
 */
const COULEURS_INDICES = {
    A: '#1976D2',      // Bleu foncé (Assiduité)
    C: '#FF6B35',      // Orange vif (Complétion)
    P: '#4CAF50',      // Vert émeraude (Performance)
    E: '#9C27B0'       // Violet (Engagement)
};

/**
 * Épaisseurs de ligne pour différencier visuellement les indices
 */
const EPAISSEURS_INDICES = {
    A: 3,   // Assiduité : ligne épaisse
    C: 2,   // Complétion : ligne moyenne
    P: 4,   // Performance : ligne très épaisse (indice principal)
    E: 2.5  // Engagement : ligne moyenne-épaisse
};

/**
 * Styles de pointillés pour différencier encore plus
 */
const STYLES_LIGNE = {
    A: [],          // Ligne pleine
    C: [5, 3],      // Tirets moyens
    P: [],          // Ligne pleine
    E: [2, 2]       // Petits pointillés
};

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
        // ✅ CORRECTION (Beta 93) : Gérer null pour P et E (pas encore d'évaluation)
        // ✨ AMÉLIORATION (Beta 93) : Offset vertical léger pour éviter superposition des courbes
        const OFFSET_VISUEL = {
            A: 0.000,   // Baseline (pas de décalage)
            C: 0.005,   // +0.5% (~2px sur graphique 400px)
            P: 0.010,   // +1.0% (~4px)
            E: 0.015    // +1.5% (~6px)
        };

        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);
        const donneesA = snapshots.map(s => (s.A / 100) + OFFSET_VISUEL.A);
        // ✅ CORRECTION (7 déc 2025) : C doit être null si pas encore d'évaluation (comme P et E)
        const donneesC = snapshots.map(s => s.C !== null && s.C !== 0 ? (s.C / 100) + OFFSET_VISUEL.C : null);
        const donneesP = snapshots.map(s => s.P !== null ? (s.P / 100) + OFFSET_VISUEL.P : null);
        const donneesE = snapshots.map(s => s.E !== null ? s.E + OFFSET_VISUEL.E : null);

        // Calculer min/max pour ajuster l'échelle Y
        // ✅ CORRECTION (Beta 93) : Filtrer les valeurs null avant calcul min/max
        // ✨ AMÉLIORATION (Beta 93) : Échelle fixe 60-100% pour meilleure lisibilité
        const toutesValeurs = [...donneesA, ...donneesC, ...donneesP, ...donneesE].filter(v => v !== null);
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
                        borderWidth: EPAISSEURS_INDICES.A,
                        borderDash: STYLES_LIGNE.A,
                        tension: 0.4, // Courbes lisses
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
                        borderWidth: EPAISSEURS_INDICES.C,
                        borderDash: STYLES_LIGNE.C,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COULEURS_INDICES.C,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    },
                    {
                        label: 'Performance (P)',
                        data: donneesP,
                        borderColor: COULEURS_INDICES.P,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEURS_INDICES.P,
                        borderDash: STYLES_LIGNE.P,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: COULEURS_INDICES.P,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    },
                    {
                        label: 'Engagement (E)',
                        data: donneesE,
                        borderColor: COULEURS_INDICES.E,
                        backgroundColor: 'transparent',
                        borderWidth: EPAISSEURS_INDICES.E,
                        borderDash: STYLES_LIGNE.E,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COULEURS_INDICES.E,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des indices A-C-P-E',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
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
        // Récupérer tous les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();

        if (snapshots.length === 0) {
            console.warn('Aucun snapshot hebdomadaire disponible');
            return null;
        }

        // Trier par semaine
        snapshots.sort((a, b) => a.numSemaine - b.numSemaine);

        // Préparer les données
        // ✅ CORRECTION (Beta 93) : Gérer null pour P et E (pas encore d'évaluation)
        // ✨ AMÉLIORATION (Beta 93) : Offset vertical léger pour éviter superposition des courbes
        const OFFSET_VISUEL = {
            A: 0.000,   // Baseline (pas de décalage)
            C: 0.005,   // +0.5% (~2px sur graphique 400px)
            P: 0.010,   // +1.0% (~4px)
            E: 0.015    // +1.5% (~6px)
        };

        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);
        const donneesA = snapshots.map(s => (s.groupe.moyenneA / 100) + OFFSET_VISUEL.A);
        // ✅ CORRECTION (7 déc 2025) : C doit être null si pas encore d'évaluation (comme P et E)
        const donneesC = snapshots.map(s => s.groupe.moyenneC !== null && s.groupe.moyenneC !== 0 ? (s.groupe.moyenneC / 100) + OFFSET_VISUEL.C : null);
        const donneesP = snapshots.map(s => s.groupe.moyenneP !== null ? (s.groupe.moyenneP / 100) + OFFSET_VISUEL.P : null);
        const donneesE = snapshots.map(s => s.groupe.moyenneE !== null ? s.groupe.moyenneE + OFFSET_VISUEL.E : null);

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
                labels: labels,
                datasets: [
                    {
                        label: 'Assiduité (A)',
                        data: donneesA,
                        borderColor: COULEURS_INDICES.A,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Complétion (C)',
                        data: donneesC,
                        borderColor: COULEURS_INDICES.C,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    },
                    {
                        label: 'Performance (P)',
                        data: donneesP,
                        borderColor: COULEURS_INDICES.P,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    },
                    {
                        label: 'Engagement (E)',
                        data: donneesE,
                        borderColor: COULEURS_INDICES.E,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: false  // ✅ CORRECTION (7 déc 2025) : Ne pas connecter les points si données manquantes
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution du groupe - Moyennes A-C-P-E',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
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
 * Crée un graphique "spaghetti" avec tous les étudiants
 * Affiche toutes les trajectoires individuelles avec zones colorées
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {string} indice - 'A', 'C', 'P' ou 'E' (quel indice afficher)
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueGroupeSpaghetti(canvasId, indice = 'P') {
    try {
        // Récupérer tous les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();

        if (snapshots.length === 0) {
            console.warn('Aucun snapshot hebdomadaire disponible');
            return null;
        }

        // Trier par semaine
        snapshots.sort((a, b) => a.numSemaine - b.numSemaine);

        // Extraire la liste unique des étudiants
        const premiereSnap = snapshots[0];
        const etudiants = premiereSnap.etudiants;

        // Préparer les labels (semaines)
        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);

        // Créer un dataset par étudiant
        const datasets = etudiants.map(etudiant => {
            const da = etudiant.da;

            // Extraire les valeurs de cet étudiant pour chaque semaine
            const donnees = snapshots.map(snap => {
                const etud = snap.etudiants.find(e => e.da === da);
                if (!etud) return null;

                // Retourner la valeur de l'indice demandé (en 0-1)
                if (indice === 'E') {
                    return etud.E;
                } else {
                    return etud[indice] / 100;
                }
            });

            return {
                label: `${etudiant.nom}`,
                data: donnees,
                borderColor: 'rgba(0, 0, 0, 0.6)', // Noir semi-transparent
                backgroundColor: 'transparent',
                borderWidth: 1,
                tension: 0.4,
                pointRadius: 0, // Pas de points (spaghetti pur)
                pointHoverRadius: 3
            };
        });

        // Obtenir le canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Nom de l'indice pour le titre
        const nomsIndices = {
            'A': 'Assiduité',
            'C': 'Complétion',
            'P': 'Performance',
            'E': 'Engagement'
        };

        // Configuration du graphique
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution de la ${nomsIndices[indice]} - Tous les étudiants`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false // Trop d'étudiants pour afficher la légende
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            label: function(context) {
                                const nom = context.dataset.label || '';
                                const value = (context.parsed.y * 100).toFixed(0);
                                return `${nom}: ${value}%`;
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
                        min: 0,
                        max: 1,
                        title: {
                            display: true,
                            text: `${nomsIndices[indice]} (0.00 à 1.00)`
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
                    intersect: true
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);
        console.log(`✅ Graphique spaghetti créé (${indice})`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique spaghetti:', error);
        return null;
    }
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
                            // Comportement par défaut : cliquer pour masquer/afficher
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
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

        return new Chart(ctx, config);
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
window.creerGraphiqueCriteres = creerGraphiqueCriteres;
window.detruireGraphique = detruireGraphique;

console.log('📊 Module graphiques-progression.js chargé');
