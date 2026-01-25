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

/**
 * Récupère l'échelle de performance de l'utilisateur (première disponible)
 * @returns {Object|null} - Échelle avec ses niveaux ou null
 */
function obtenirEchelleUtilisateur() {
    try {
        const echelles = db.getSync('echellesTemplates', []);
        if (echelles && echelles.length > 0) {
            // Prendre la première échelle (ou celle par défaut si définie)
            return echelles.find(e => e.parDefaut) || echelles[0];
        }
    } catch (e) {
        console.warn('[Graphiques] Erreur lecture échelles:', e);
    }
    return null;
}

/**
 * Convertit une couleur hex en rgba
 * @param {string} hex - Couleur hex (#RRGGBB ou #RGB)
 * @param {number} alpha - Opacité (0-1)
 * @returns {string} - Couleur rgba
 */
function hexVersRgba(hex, alpha = 0.5) {
    if (!hex) return `rgba(128, 128, 128, ${alpha})`;

    // Gérer les variables CSS
    if (hex.startsWith('var(')) {
        // Couleurs par défaut pour les variables connues
        const variablesDefaut = {
            'var(--risque-critique)': '#dc3545',
            'var(--risque-modere)': '#fd7e14',
            'var(--risque-minimal)': '#28a745',
            'var(--risque-nul)': '#007bff'
        };
        hex = variablesDefaut[hex] || '#888888';
    }

    // Nettoyer le hex
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Génère les zones colorées à partir de l'échelle utilisateur
 * @returns {Array} - Tableau de zones pour les annotations
 */
function genererZonesDepuisEchelle() {
    const echelle = obtenirEchelleUtilisateur();

    if (!echelle || !echelle.niveaux || echelle.niveaux.length === 0) {
        // Fallback: retourner ZONES_IDME par défaut
        return ZONES_IDME;
    }

    // Trier les niveaux par min croissant
    const niveauxTries = [...echelle.niveaux].sort((a, b) => a.min - b.min);

    return niveauxTries.map(niveau => ({
        yMin: niveau.min / 100,
        yMax: (niveau.max + 1) / 100, // +1 pour inclure le max
        backgroundColor: hexVersRgba(niveau.couleur, 0.35),
        borderColor: hexVersRgba(niveau.couleur, 0.5),
        label: niveau.nom,
        code: niveau.code
    }));
}

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
        const productions = obtenirDonneesSelonMode('productionsPedagogiques') || [];

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
   GRAPHIQUE GROUPE - SPAGHETTI ACP
   Évolution temporelle par étudiant (Beta 96)
   =============================== */

/**
 * Instance globale du graphique spaghetti ACP
 */
let graphiqueSpaghettiACPInstance = null;

/**
 * Variables de suivi pour le graphique spaghetti ACP
 */
let dernierDatasetSurvoleACP = -1;
let datasetVerrouilleACP = -1;
let zonesNomsEtudiantsACP = [];

/**
 * Plugin pour afficher le nom de l'étudiant au bout de la courbe (version ACP)
 */
const pluginNomEtudiantSurvolACP = {
    id: 'nomEtudiantSurvolACP',
    afterDraw(chart) {
        const datasetIndexActif = datasetVerrouilleACP >= 0 ? datasetVerrouilleACP : dernierDatasetSurvoleACP;
        if (datasetIndexActif === -1) {
            zonesNomsEtudiantsACP = [];
            return;
        }

        const ctx = chart.ctx;
        const dataset = chart.data.datasets[datasetIndexActif];
        if (!dataset) return;

        const meta = chart.getDatasetMeta(datasetIndexActif);
        if (!meta || !meta.data || meta.data.length === 0) return;

        // Trouver le dernier point visible
        let dernierPoint = null;
        for (let i = meta.data.length - 1; i >= 0; i--) {
            const point = meta.data[i];
            if (point && dataset.data[i] !== null) {
                dernierPoint = point;
                break;
            }
        }

        if (!dernierPoint) return;

        const estVerrouille = datasetVerrouilleACP >= 0;
        const nom = dataset.label || '';
        const texteAffiche = estVerrouille ? `🔒 ${nom}` : nom;
        const x = dernierPoint.x + 10;
        const y = dernierPoint.y;

        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const textWidth = ctx.measureText(texteAffiche).width;
        const rectX = x - 3;
        const rectY = y - 10;
        const rectW = textWidth + 10;
        const rectH = 20;

        ctx.fillStyle = estVerrouille ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(rectX, rectY, rectW, rectH);

        if (estVerrouille) {
            ctx.strokeStyle = '#E91E63';
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX, rectY, rectW, rectH);
        }

        ctx.fillStyle = estVerrouille ? '#C2185B' : '#1976D2';
        ctx.fillText(texteAffiche, x, y);
        ctx.restore();

        zonesNomsEtudiantsACP = [{
            datasetIndex: datasetIndexActif,
            x: rectX,
            y: rectY,
            width: rectW,
            height: rectH
        }];
    }
};

/**
 * Crée un graphique spaghetti pour l'évolution temporelle d'un indice ACP
 * Montre les courbes individuelles de tous les étudiants par semaine
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {string} indice - L'indice à afficher ('A', 'C' ou 'P')
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueGroupeSpaghettiACP(canvasId, indice = 'A') {
    try {
        // Détruire le graphique existant
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }

        // Réinitialiser les variables de suivi
        dernierDatasetSurvoleACP = -1;
        datasetVerrouilleACP = -1;
        zonesNomsEtudiantsACP = [];

        // Récupérer les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();
        if (snapshots.length === 0) {
            console.warn('Aucun snapshot hebdomadaire disponible');
            afficherMessageAttente(canvas, 'Aucune donnée disponible', 'Capturez des snapshots hebdomadaires.');
            return null;
        }

        // Trier par semaine
        snapshots.sort((a, b) => a.numSemaine - b.numSemaine);

        // Labels (semaines)
        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);

        // Collecter tous les étudiants uniques
        const etudiantsMap = new Map();
        snapshots.forEach(snapshot => {
            if (snapshot.etudiants) {
                snapshot.etudiants.forEach(etudiant => {
                    if (!etudiantsMap.has(etudiant.da)) {
                        // Le nom est au format "Prénom Nom" dans les snapshots
                        const nomComplet = etudiant.nom || etudiant.da;
                        const parties = nomComplet.split(' ');
                        const prenom = parties[0] || '';
                        const nomFamille = parties.slice(1).join(' ') || '';

                        etudiantsMap.set(etudiant.da, {
                            da: etudiant.da,
                            nomComplet: nomComplet,
                            nomAffiche: nomFamille ? `${prenom} ${nomFamille.charAt(0)}.` : prenom
                        });
                    }
                });
            }
        });

        const etudiants = Array.from(etudiantsMap.values());
        if (etudiants.length === 0) {
            afficherMessageAttente(canvas, 'Aucun étudiant', 'Les snapshots ne contiennent pas de données étudiants.');
            return null;
        }

        // Noms des indices
        const nomsIndices = {
            'A': 'Assiduité',
            'C': 'Complétion',
            'P': 'Performance'
        };

        // Couleurs des indices
        const couleursIndices = {
            'A': '#1976D2',
            'C': '#FF6B35',
            'P': '#4CAF50'
        };

        // Créer un dataset par étudiant
        const datasets = etudiants.map(etudiant => {
            const data = snapshots.map(snapshot => {
                const etudiantSnapshot = snapshot.etudiants?.find(e => e.da === etudiant.da);
                if (!etudiantSnapshot) return null;

                // Récupérer la valeur selon l'indice (toutes cumulatives pour historique)
                let valeur = null;
                if (indice === 'A') {
                    // A_cumulatif pour voir l'évolution historique
                    valeur = etudiantSnapshot.A_cumulatif ?? etudiantSnapshot.A;
                } else if (indice === 'C') {
                    // C est déjà cumulatif
                    valeur = etudiantSnapshot.C;
                } else if (indice === 'P') {
                    // P est déjà cumulatif
                    valeur = etudiantSnapshot.P;
                }

                // Convertir en 0-1 si en pourcentage (valeurs > 1)
                if (valeur !== null && valeur !== undefined && valeur > 1) {
                    valeur = valeur / 100;
                }

                return valeur;
            });

            // Vérifier qu'il y a au moins une valeur non-null
            if (data.every(v => v === null || v === undefined)) return null;

            return {
                label: etudiant.nomAffiche,
                data: data,
                da: etudiant.da,
                borderColor: 'rgba(50, 50, 50, 0.4)',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.2,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: 'rgba(50, 50, 50, 0.5)',
                pointHoverBackgroundColor: 'rgba(50, 50, 50, 0.9)',
                spanGaps: false,
                hoverBorderWidth: 3,
                hoverBorderColor: couleursIndices[indice]
            };
        }).filter(d => d !== null);

        if (datasets.length === 0) {
            afficherMessageAttente(canvas, 'Aucune donnée', 'Pas de données pour cet indice.');
            return null;
        }

        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration
        const config = {
            type: 'line',
            plugins: [pluginEtiquettesZones, pluginNomEtudiantSurvolACP],
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { right: 120 }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution temporelle - ${nomsIndices[indice]} (${indice})`,
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: true,
                        filter: function(tooltipItem) {
                            const datasetActif = datasetVerrouilleACP >= 0 ? datasetVerrouilleACP : dernierDatasetSurvoleACP;
                            return tooltipItem.datasetIndex === datasetActif;
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                if (tooltipItems.length === 0) return '';
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                const valeur = context.parsed.y;
                                if (valeur === null) return '';
                                const pourcent = (valeur * 100).toFixed(0);
                                return `${pourcent}%`;
                            }
                        }
                    },
                    annotation: {
                        annotations: creerAnnotationsZonesIDME()
                    }
                },
                scales: {
                    x: {
                        grid: { display: true, color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { size: 10 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        grid: { display: true, color: 'rgba(0,0,0,0.08)' },
                        ticks: {
                            callback: value => (value * 100).toFixed(0) + '%',
                            stepSize: 0.1
                        },
                        title: {
                            display: true,
                            text: nomsIndices[indice],
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                onHover: function(event, activeElements, chart) {
                    let datasetIndex = -1;
                    let dataIndex = -1;

                    if (activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                        dataIndex = activeElements[0].index;
                    }

                    const datasetActif = datasetVerrouilleACP >= 0 ? datasetVerrouilleACP : datasetIndex;

                    if (datasetActif === dernierDatasetSurvoleACP && dataIndex === -1) return;

                    dernierDatasetSurvoleACP = datasetActif;

                    chart.data.datasets.forEach((dataset, idx) => {
                        const nbPoints = dataset.data.length;

                        if (datasetActif === -1) {
                            dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
                            dataset.borderWidth = 1.5;
                            dataset.pointRadius = Array(nbPoints).fill(2);
                            dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(50, 50, 50, 0.5)');
                        } else if (idx === datasetActif) {
                            dataset.borderColor = datasetVerrouilleACP >= 0 ? '#E91E63' : couleursIndices[indice];
                            dataset.borderWidth = 3;
                            dataset.pointRadius = Array(nbPoints).fill(4);
                            dataset.pointBackgroundColor = Array(nbPoints).fill(datasetVerrouilleACP >= 0 ? '#E91E63' : couleursIndices[indice]);

                            if (dataIndex >= 0 && dataIndex < nbPoints && dataset.data[dataIndex] !== null) {
                                dataset.pointRadius[dataIndex] = 8;
                            }
                        } else {
                            dataset.borderColor = 'rgba(80, 80, 80, 0.35)';
                            dataset.borderWidth = 1;
                            dataset.pointRadius = Array(nbPoints).fill(1);
                            dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(80, 80, 80, 0.3)');
                            if (datasetVerrouilleACP >= 0) {
                                dataset.pointHoverRadius = 1;
                                dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                            } else {
                                dataset.pointHoverRadius = 5;
                                dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                            }
                        }
                    });

                    chart.update('none');
                }
            }
        };

        const chart = new Chart(ctx, config);
        graphiqueSpaghettiACPInstance = chart;

        // Gestionnaire mouseleave
        canvas.addEventListener('mouseleave', function() {
            if (datasetVerrouilleACP >= 0) {
                dernierDatasetSurvoleACP = datasetVerrouilleACP;
                chart.data.datasets.forEach((dataset, idx) => {
                    const nbPoints = dataset.data.length;
                    if (idx === datasetVerrouilleACP) {
                        dataset.borderColor = '#E91E63';
                        dataset.borderWidth = 3;
                        dataset.pointRadius = Array(nbPoints).fill(4);
                        dataset.pointBackgroundColor = Array(nbPoints).fill('#E91E63');
                        dataset.pointHoverRadius = 5;
                        dataset.pointHoverBackgroundColor = '#E91E63';
                    } else {
                        dataset.borderColor = 'rgba(80, 80, 80, 0.35)';
                        dataset.borderWidth = 1;
                        dataset.pointRadius = Array(nbPoints).fill(1);
                        dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(80, 80, 80, 0.3)');
                        dataset.pointHoverRadius = 1;
                        dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                    }
                });
            } else {
                dernierDatasetSurvoleACP = -1;
                chart.data.datasets.forEach(dataset => {
                    const nbPoints = dataset.data.length;
                    dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
                    dataset.borderWidth = 1.5;
                    dataset.pointRadius = Array(nbPoints).fill(2);
                    dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(50, 50, 50, 0.5)');
                    dataset.pointHoverRadius = 5;
                    dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                });
            }
            chart.update('none');
        });

        // Fonction toggle verrouillage
        function toggleVerrouillageSpaghetti(indexDataset) {
            if (datasetVerrouilleACP === indexDataset) {
                datasetVerrouilleACP = -1;
                console.log('🔓 Courbe ACP déverrouillée');
                chart.data.datasets.forEach(dataset => {
                    dataset.pointHoverRadius = 5;
                    dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                });
            } else {
                datasetVerrouilleACP = indexDataset;
                dernierDatasetSurvoleACP = indexDataset;
                console.log(`🔒 Courbe ACP verrouillée: ${chart.data.datasets[indexDataset]?.label}`);
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === indexDataset) {
                        dataset.pointHoverRadius = 5;
                        dataset.pointHoverBackgroundColor = '#E91E63';
                    } else {
                        dataset.pointHoverRadius = 1;
                        dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                    }
                });
            }
            chart.update('none');
        }

        // Gestionnaire de clic
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // Vérifier clic sur nom
            for (const zone of zonesNomsEtudiantsACP) {
                if (clickX >= zone.x && clickX <= zone.x + zone.width &&
                    clickY >= zone.y && clickY <= zone.y + zone.height) {
                    toggleVerrouillageSpaghetti(zone.datasetIndex);
                    return;
                }
            }

            // Vérifier clic sur point
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length > 0) {
                toggleVerrouillageSpaghetti(elements[0].datasetIndex);
                return;
            }

            // Clic ailleurs - déverrouiller
            if (datasetVerrouilleACP >= 0) {
                toggleVerrouillageSpaghetti(datasetVerrouilleACP);
            }
        });

        // Curseur pointer
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            let surElement = false;
            for (const zone of zonesNomsEtudiantsACP) {
                if (mouseX >= zone.x && mouseX <= zone.x + zone.width &&
                    mouseY >= zone.y && mouseY <= zone.y + zone.height) {
                    surElement = true;
                    break;
                }
            }

            if (!surElement) {
                const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                surElement = elements.length > 0;
            }

            canvas.style.cursor = surElement ? 'pointer' : 'default';
        });

        console.log(`✅ Graphique spaghetti ACP créé (${indice}) avec ${datasets.length} étudiants`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique spaghetti ACP:', error);
        return null;
    }
}

/**
 * Rafraîchit le graphique spaghetti ACP avec l'indice sélectionné
 */
function rafraichirGraphiqueSpaghettiACP() {
    const selecteur = document.getElementById('selecteur-indice-acp');
    const indice = selecteur ? selecteur.value : 'A';
    creerGraphiqueGroupeSpaghettiACP('graphique-groupe-moyennes', indice);
}

/* ===============================
   GRAPHIQUE GROUPE - SPAGHETTI
   Résultats bruts par artefact (Beta 96)
   =============================== */

/**
 * Instance globale du graphique spaghetti (pour pouvoir le détruire/recréer)
 */
let graphiqueSpaghettiInstance = null;

/**
 * Plugin pour afficher les étiquettes de zones sur le côté droit
 * Utilise l'échelle de performance de l'utilisateur
 */
const pluginEtiquettesZones = {
    id: 'etiquettesZones',
    afterDraw(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const yScale = chart.scales.y;

        // Obtenir les zones depuis l'échelle utilisateur
        const zonesUtilisateur = genererZonesDepuisEchelle();

        ctx.save();
        ctx.font = 'italic 11px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        zonesUtilisateur.forEach(zone => {
            const yCenter = (zone.yMin + zone.yMax) / 2;
            const yPixel = yScale.getPixelForValue(yCenter);

            // Vérifier que la position est dans la zone du graphique
            if (yPixel >= chartArea.top && yPixel <= chartArea.bottom) {
                // Utiliser une couleur plus foncée pour le texte (extraire de borderColor)
                ctx.fillStyle = zone.borderColor || '#666666';
                ctx.fillText(zone.label, chartArea.right - 5, yPixel);
            }
        });

        ctx.restore();
    }
};

/**
 * Variables pour suivre le dernier survol (évite les mises à jour inutiles)
 */
let dernierDatasetSurvole = -1;
let dernierPointSurvole = -1;

/**
 * Variable pour le verrouillage d'une courbe (clic sur le nom)
 * -1 = pas de verrouillage, sinon index du dataset verrouillé
 */
let datasetVerrouille = -1;

/**
 * Données partagées pour les tooltips multiples (initialisées dans creerGraphiqueGroupeSpaghetti)
 */
let donneesSpaghettiGlobales = {
    memesActivites: {},
    labels: [],
    evaluationsIndex: {},
    productionsArtefacts: [],
    noteVersIDME: null
};

/**
 * Stockage des zones cliquables des noms d'étudiants
 */
let zonesNomsEtudiants = [];

/**
 * Plugin pour afficher le nom de l'étudiant au bout de la courbe survolée/verrouillée
 */
const pluginNomEtudiantSurvol = {
    id: 'nomEtudiantSurvol',
    afterDraw(chart) {
        // Afficher le nom pour le dataset actif (survolé ou verrouillé)
        const datasetIndexActif = datasetVerrouille >= 0 ? datasetVerrouille : dernierDatasetSurvole;
        if (datasetIndexActif === -1) {
            zonesNomsEtudiants = [];
            return;
        }

        const ctx = chart.ctx;
        const dataset = chart.data.datasets[datasetIndexActif];
        if (!dataset) return;

        const meta = chart.getDatasetMeta(datasetIndexActif);
        if (!meta || !meta.data || meta.data.length === 0) return;

        // Trouver le dernier point visible (non-null) de la courbe
        let dernierPoint = null;
        for (let i = meta.data.length - 1; i >= 0; i--) {
            const point = meta.data[i];
            if (point && dataset.data[i] !== null) {
                dernierPoint = point;
                break;
            }
        }

        if (!dernierPoint) return;

        // Dessiner le nom de l'étudiant à droite du dernier point
        const estVerrouille = datasetVerrouille >= 0;
        const nom = dataset.label || '';
        const texteAffiche = estVerrouille ? `🔒 ${nom}` : nom;
        const x = dernierPoint.x + 10;
        const y = dernierPoint.y;

        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Fond blanc semi-transparent pour lisibilité
        const textWidth = ctx.measureText(texteAffiche).width;
        const rectX = x - 3;
        const rectY = y - 10;
        const rectW = textWidth + 10;
        const rectH = 20;

        ctx.fillStyle = estVerrouille ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(rectX, rectY, rectW, rectH);

        // Bordure si verrouillé
        if (estVerrouille) {
            ctx.strokeStyle = '#E91E63';
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX, rectY, rectW, rectH);
        }

        // Texte
        ctx.fillStyle = estVerrouille ? '#C2185B' : '#1976D2';
        ctx.fillText(texteAffiche, x, y);
        ctx.restore();

        // Stocker la zone cliquable pour ce nom
        zonesNomsEtudiants = [{
            datasetIndex: datasetIndexActif,
            x: rectX,
            y: rectY,
            width: rectW,
            height: rectH
        }];
    }
};

/**
 * Plugin pour afficher les tooltips de toutes les activités similaires
 * Permet de comparer les résultats sur une même activité pratiquée plusieurs fois
 */
const pluginTooltipsMultiples = {
    id: 'tooltipsMultiples',
    afterDraw(chart) {
        // Vérifier qu'on a un point survolé et les données nécessaires
        if (dernierPointSurvole === -1) return;
        const datasetActif = datasetVerrouille >= 0 ? datasetVerrouille : dernierDatasetSurvole;
        if (datasetActif === -1) return;

        const { memesActivites, labels, evaluationsIndex, productionsArtefacts, noteVersIDME } = donneesSpaghettiGlobales;
        if (!memesActivites || !labels || !noteVersIDME) return;

        // Obtenir tous les indices de même activité
        const indicesMemeActivite = memesActivites[dernierPointSurvole] || [];
        if (indicesMemeActivite.length <= 1) return; // Pas d'autres activités similaires

        const ctx = chart.ctx;
        const dataset = chart.data.datasets[datasetActif];
        if (!dataset) return;

        const meta = chart.getDatasetMeta(datasetActif);
        if (!meta || !meta.data) return;

        const da = dataset.da;

        // Dessiner un tooltip pour chaque AUTRE point de même activité (pas le survolé)
        // Le point survolé a déjà le tooltip natif de Chart.js
        indicesMemeActivite.forEach(pointIndex => {
            // Exclure le point directement survolé (déjà géré par tooltip natif)
            if (pointIndex === dernierPointSurvole) return;

            const point = meta.data[pointIndex];
            const valeur = dataset.data[pointIndex];
            if (!point || valeur === null) return;

            // Obtenir les infos de l'évaluation
            const production = productionsArtefacts[pointIndex];
            const evaluation = production && da ? evaluationsIndex[da]?.[production.id] : null;

            // Construire le texte du tooltip
            const label = labels[pointIndex] || `Point ${pointIndex + 1}`;
            const codeIDME = noteVersIDME(valeur);
            const pourcent = (valeur * 100).toFixed(0);

            // Collecter les statuts
            const statuts = [];
            if (evaluation) {
                if (evaluation.repriseDeId || evaluation.jetonReprise || evaluation.jetonDelai || evaluation.avecJeton) {
                    statuts.push('Jeton');
                }
                if (evaluation.statutIntegrite === 'plagiat') statuts.push('Plagiat');
                else if (evaluation.statutIntegrite === 'ia') statuts.push('IA');
                if (evaluation.statutRemise === 'non-remis') statuts.push('Non remis');
                else if (evaluation.statutRemise === 'retard') statuts.push('Retard');
            }

            let ligne2 = `${codeIDME} (${pourcent}%)`;
            if (statuts.length > 0) ligne2 += ' - ' + statuts.join(' - ');

            // Position du tooltip (au-dessus ou en-dessous du point selon l'espace)
            const x = point.x;
            const y = point.y;
            const estEnHaut = y > chart.chartArea.top + 60;

            ctx.save();
            ctx.font = '11px Arial';

            // Mesurer les textes
            const largeurLabel = ctx.measureText(label).width;
            const largeurLigne2 = ctx.measureText(ligne2).width;
            const largeurMax = Math.max(largeurLabel, largeurLigne2);

            const padding = 6;
            const hauteur = 36;
            const rectX = x - largeurMax / 2 - padding;
            const rectY = estEnHaut ? y - hauteur - 12 : y + 12;
            const rectW = largeurMax + padding * 2;

            // Fond du tooltip
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectW, hauteur, 4);
            ctx.fill();

            // Flèche vers le point
            ctx.beginPath();
            if (estEnHaut) {
                ctx.moveTo(x - 6, rectY + hauteur);
                ctx.lineTo(x, rectY + hauteur + 6);
                ctx.lineTo(x + 6, rectY + hauteur);
            } else {
                ctx.moveTo(x - 6, rectY);
                ctx.lineTo(x, rectY - 6);
                ctx.lineTo(x + 6, rectY);
            }
            ctx.fill();

            // Texte
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(label, x, rectY + 14);
            ctx.font = '11px Arial';
            ctx.fillText(ligne2, x, rectY + 28);

            ctx.restore();
        });
    }
};

/**
 * Gère le survol du graphique spaghetti - met en évidence la courbe survolée
 * @param {Event} event - Événement de survol
 * @param {Array} activeElements - Éléments actifs (points survolés)
 * @param {Chart} chart - Instance du graphique
 */
function gererSurvolSpaghetti(event, activeElements, chart) {
    if (!chart || !chart.data || !chart.data.datasets) return;

    let datasetIndex = -1;

    // Détecter quel dataset est survolé
    if (activeElements && activeElements.length > 0) {
        datasetIndex = activeElements[0].datasetIndex;
    }

    // Si pas de changement, ne rien faire
    if (datasetIndex === dernierDatasetSurvole) return;

    dernierDatasetSurvole = datasetIndex;

    // Appliquer les styles selon le survol
    chart.data.datasets.forEach((dataset, index) => {
        if (datasetIndex === -1) {
            // Aucun survol - style par défaut
            dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
            dataset.borderWidth = 1.5;
            dataset.pointRadius = 2;
            dataset.pointBackgroundColor = 'rgba(50, 50, 50, 0.5)';
        } else if (index === datasetIndex) {
            // Courbe survolée - mise en évidence
            dataset.borderColor = '#2196F3';
            dataset.borderWidth = 3;
            dataset.pointRadius = 4;
            dataset.pointBackgroundColor = '#2196F3';
        } else {
            // Autres courbes - atténuées mais visibles
            dataset.borderColor = 'rgba(80, 80, 80, 0.35)';
            dataset.borderWidth = 1;
            dataset.pointRadius = 1;
            dataset.pointBackgroundColor = 'rgba(80, 80, 80, 0.3)';
        }
    });

    chart.update('none'); // Update sans animation pour fluidité
}

/**
 * Réinitialise les styles du graphique spaghetti (au mouseout)
 * @param {Chart} chart - Instance du graphique
 */
function reinitialiserStylesSpaghetti(chart) {
    if (!chart || !chart.data || !chart.data.datasets) return;

    dernierDatasetSurvole = -1;

    // Réinitialiser tous les datasets au style par défaut
    chart.data.datasets.forEach(dataset => {
        dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
        dataset.borderWidth = 1.5;
        dataset.pointRadius = 2;
        dataset.pointBackgroundColor = 'rgba(50, 50, 50, 0.5)';
    });

    chart.update('none');
}

/**
 * Crée un graphique "spaghetti" montrant les RÉSULTATS BRUTS par artefact
 *
 * IMPORTANT (Beta 96) : Ce graphique montre les notes réelles de chaque évaluation,
 * PAS l'indice P agrégé. Cela permet de voir :
 * - La volatilité réelle de l'apprentissage
 * - Les hauts et les bas (non-linéarité)
 * - Les patterns de difficulté par artefact
 * - La résilience des étudiants (rebonds après difficultés)
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueGroupeSpaghetti(canvasId) {
    try {
        // Détruire le graphique existant si présent
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
                console.log('🗑️ Graphique spaghetti existant détruit');
            }
        }

        // Récupérer les productions (artefacts) du cours actif
        // IMPORTANT: Utiliser 'productions' pour les IDs (correspondance avec évaluations)
        // mais enrichir les descriptions depuis 'productionsPedagogiques' (formulaire)
        let productions = [];

        if (typeof obtenirDonneesSelonMode === 'function') {
            productions = obtenirDonneesSelonMode('productions') || [];
        } else {
            const cleProductions = (typeof cle === 'function') ? cle('productions') : 'productions';
            productions = db.getSync(cleProductions, []);
        }

        // Récupérer aussi productionsPedagogiques pour les descriptions mises à jour
        let productionsPedago = [];
        if (typeof obtenirDonneesSelonMode === 'function') {
            productionsPedago = obtenirDonneesSelonMode('productionsPedagogiques') || [];
        } else {
            const clePedago = (typeof cle === 'function') ? cle('productionsPedagogiques') : 'productionsPedagogiques';
            productionsPedago = db.getSync(clePedago, []);
        }

        // Créer un mapping titre → description depuis productionsPedagogiques
        const descriptionsParTitre = {};
        productionsPedago.forEach(p => {
            if (p.titre && p.description) {
                descriptionsParTitre[p.titre] = p.description;
            }
        });

        // Enrichir les productions avec les descriptions mises à jour
        productions = productions.map(p => ({
            ...p,
            description: descriptionsParTitre[p.titre] || p.description
        }));

        console.log(`📊 [Spaghetti] Productions trouvées: ${productions.length}`);

        // Filtrer les productions : garder les artefacts évaluables + évaluation terminale
        // Exclure uniquement : Portfolio (conteneur vide), Analyse finale (réflexion non comparable)
        const productionsVues = new Set();
        const productionsArtefacts = productions.filter(p => {
            const titreLower = (p.titre || '').toLowerCase();

            // Exclure le Portfolio (c'est un conteneur, pas une production évaluable)
            if (titreLower === 'portfolio' || titreLower.startsWith('portfolio ') ||
                p.type === 'portfolio' || p.categorie === 'portfolio') {
                return false;
            }

            // Exclure uniquement "Analyse finale" (réflexion métacognitive, pas comparable aux artefacts)
            // MAIS garder "Évaluation terminale" car c'est une rédaction comparable
            if (titreLower.includes('analyse finale') ||
                p.type === 'analyseFinale' ||
                p.categorie === 'analyseFinale') {
                return false;
            }

            // Dédupliquer par ID
            if (productionsVues.has(p.id)) {
                console.warn(`📊 [Spaghetti] Production dupliquée ignorée: ${p.id}`);
                return false;
            }
            productionsVues.add(p.id);
            return true;
        });

        console.log(`📊 [Spaghetti] Productions artefacts: ${productionsArtefacts.length}`);

        if (productionsArtefacts.length === 0) {
            console.warn('Aucune production disponible pour le graphique spaghetti');
            afficherMessageAttente(canvas, 'Aucun artefact défini', 'Créez des productions dans Réglages › Productions');
            return null;
        }

        // Récupérer les évaluations
        let evaluationsBrutes = [];

        if (typeof obtenirDonneesSelonMode === 'function') {
            evaluationsBrutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        } else {
            const cleEvaluations = (typeof cle === 'function') ? cle('evaluationsSauvegardees') : 'evaluationsSauvegardees';
            evaluationsBrutes = db.getSync(cleEvaluations, []);
        }

        // IMPORTANT: Filtrer les doublons - garder seulement la plus récente par étudiant/production
        // Cela évite d'afficher plusieurs points pour le même artefact
        const evaluationsMap = new Map();
        evaluationsBrutes.forEach(evalItem => {
            const cle = `${evalItem.etudiantDA}_${evalItem.productionId}`;
            const existante = evaluationsMap.get(cle);

            // Garder l'évaluation la plus récente (ou la première si pas de date)
            if (!existante) {
                evaluationsMap.set(cle, evalItem);
            } else {
                const dateExistante = existante.dateEvaluation || existante.date || '';
                const dateNouvelle = evalItem.dateEvaluation || evalItem.date || '';
                if (dateNouvelle > dateExistante) {
                    evaluationsMap.set(cle, evalItem);
                }
            }
        });

        const evaluations = Array.from(evaluationsMap.values());
        console.log(`📊 [Spaghetti] Évaluations: ${evaluationsBrutes.length} brutes → ${evaluations.length} après dédoublonnage`);

        // Créer un index rapide pour le tooltip : [da][productionId] → évaluation
        const evaluationsIndex = {};
        evaluations.forEach(evalItem => {
            if (!evaluationsIndex[evalItem.etudiantDA]) {
                evaluationsIndex[evalItem.etudiantDA] = {};
            }
            evaluationsIndex[evalItem.etudiantDA][evalItem.productionId] = evalItem;
        });

        if (evaluations.length === 0) {
            console.warn('Aucune évaluation disponible pour le graphique spaghetti');
            afficherMessageAttente(canvas, 'En attente d\'évaluations', 'Les trajectoires apparaîtront après les premières évaluations.');
            return null;
        }

        // Récupérer la liste des étudiants
        let etudiants = [];
        if (typeof obtenirDonneesSelonMode === 'function') {
            etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        } else {
            const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
            etudiants = db.getSync(cleEtudiants, []);
        }

        console.log(`📊 [Spaghetti] Étudiants trouvés: ${etudiants.length}`);

        if (etudiants.length === 0) {
            console.warn('Aucun étudiant disponible');
            afficherMessageAttente(canvas, 'Aucun étudiant', 'Ajoutez des étudiants dans Réglages › Groupe');
            return null;
        }

        // Diagnostic: Vérifier la correspondance entre évaluations et productions
        const prodIds = new Set(productionsArtefacts.map(p => p.id));
        const evalProdIds = [...new Set(evaluations.map(e => e.productionId))];
        const correspondances = evalProdIds.filter(id => prodIds.has(id));

        console.log(`📊 [Spaghetti] IDs productions: ${[...prodIds].slice(0, 3).join(', ')}...`);
        console.log(`📊 [Spaghetti] IDs dans évaluations: ${evalProdIds.slice(0, 3).join(', ')}...`);
        console.log(`📊 [Spaghetti] Correspondances: ${correspondances.length}/${evalProdIds.length}`);

        // Créer un index productionId → position pour le tri
        const indexProductions = {};
        productionsArtefacts.forEach((prod, index) => {
            indexProductions[prod.id] = index;
        });

        // Préparer les labels - utiliser le champ "description" qui contient l'activité d'apprentissage
        // Ex: titre="Artefact 1", description="Portrait de lecteur" → "Portrait de lecteur"
        const labels = productionsArtefacts.map((prod, index) => {
            // Priorité : description (activité) > titre > fallback
            if (prod.description && prod.description.trim()) {
                return prod.description.trim();
            }
            // Si pas de description, utiliser le titre
            return prod.titre || `Production ${index + 1}`;
        });

        // Créer un mapping activité → indices des productions (pour surbrillance des mêmes activités)
        // Normaliser les noms pour regrouper les variantes
        // Ex: "Carte mentale" et "Carte mentale (2)" → même activité
        // Ex: "Formuler 10 HOC" et "Formuler 5 HOC" → même activité
        const normaliserActivite = (label) => {
            return label.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever accents
                .replace(/\s*\(\d+\)\s*$/, '') // Enlever suffixes (2), (3), etc.
                .replace(/\s*\d+\s*$/, '') // Enlever numéros en fin
                .replace(/\s+\d+\s+/g, ' ') // Enlever numéros au milieu (ex: "Formuler 10 HOC" → "Formuler HOC")
                .replace(/\s+/g, ' ').trim();
        };

        const activitesMap = {};
        labels.forEach((label, index) => {
            const normalise = normaliserActivite(label);
            if (!activitesMap[normalise]) {
                activitesMap[normalise] = [];
            }
            activitesMap[normalise].push(index);
        });

        // Index inverse : pour chaque position, TOUS les indices de la même activité (y compris le courant)
        const memesActivites = {};
        labels.forEach((label, index) => {
            const normalise = normaliserActivite(label);
            // TOUS les indices de cette activité (y compris l'index courant pour mise en relief complète)
            memesActivites[index] = activitesMap[normalise];
        });

        // Debug: afficher les activités regroupées
        console.log('📊 [Spaghetti] Activités regroupées:', Object.entries(activitesMap).filter(([k, v]) => v.length > 1));

        // Fonction pour convertir une note (0-1) en code selon l'échelle utilisateur
        const zonesEchelle = genererZonesDepuisEchelle();
        const noteVersIDME = (note) => {
            if (note === null || note === undefined) return '—';
            const notePourcent = note * 100;
            // Parcourir les zones du plus haut au plus bas
            const zonesTries = [...zonesEchelle].sort((a, b) => b.yMin - a.yMin);
            for (const zone of zonesTries) {
                if (notePourcent >= zone.yMin * 100) {
                    return zone.code || zone.label.charAt(0).toUpperCase();
                }
            }
            // Fallback: première zone (la plus basse)
            const zoneBasse = zonesEchelle[0];
            return zoneBasse?.code || 'I';
        };

        // Stocker les données pour les plugins (tooltips multiples)
        donneesSpaghettiGlobales = {
            memesActivites,
            labels,
            evaluationsIndex,
            productionsArtefacts,
            noteVersIDME
        };

        // Créer un dataset par étudiant
        const datasets = etudiants.map(etudiant => {
            const da = etudiant.da;

            // Pour chaque production, trouver l'évaluation de cet étudiant
            const donnees = productionsArtefacts.map(prod => {
                // Trouver l'évaluation pour cet étudiant et cette production
                const evaluation = evaluations.find(e =>
                    e.etudiantDA === da && e.productionId === prod.id
                );

                // Pas d'évaluation → trou dans la trajectoire
                if (!evaluation) return null;

                // IMPORTANT: Vérifier si le travail a été REMIS
                // Si statutRemise existe et n'est pas 'remis' → trou (pas de point)
                // Cela distingue "travail non-remis" de "travail remis avec 0%"
                if (evaluation.statutRemise && evaluation.statutRemise !== 'remis') {
                    return null; // Trou pour travail non-remis
                }

                // Utiliser noteFinale (0-100) converti en 0-1
                const note = evaluation.noteFinale;
                if (note === null || note === undefined) return null;

                // Convertir en décimal (0-1) pour cohérence avec les zones IDME
                return note / 100;
            });

            // Vérifier si l'étudiant a au moins une évaluation
            const aDonnees = donnees.some(v => v !== null);
            if (!aDonnees) return null;

            // Obtenir le nom pour l'infobulle
            const nom = etudiant.prenom && etudiant.nom
                ? `${etudiant.prenom} ${etudiant.nom.charAt(0)}.`
                : etudiant.nom || `DA ${da}`;

            return {
                label: nom,
                da: da, // Stocker le DA pour identification
                data: donnees,
                // Style par défaut (sera modifié au survol)
                borderColor: 'rgba(50, 50, 50, 0.4)',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.2,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: 'rgba(50, 50, 50, 0.5)',
                pointHoverBackgroundColor: 'rgba(50, 50, 50, 0.9)',
                spanGaps: false, // NE PAS connecter les trous (travaux non-remis)
                // Propriétés pour le survol
                hoverBorderWidth: 3,
                hoverBorderColor: '#2196F3' // Bleu vif au survol
            };
        }).filter(d => d !== null);

        if (datasets.length === 0) {
            console.warn('Aucune donnée valide pour le graphique spaghetti');
            afficherMessageAttente(canvas, 'Aucune trajectoire disponible', 'Les évaluations ne correspondent pas aux productions définies.');
            return null;
        }

        // Obtenir le canvas
        if (!canvas) {
            console.error(`Canvas ${canvasId} introuvable`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginEtiquettesZones, pluginNomEtudiantSurvol, pluginTooltipsMultiples],
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 120 // Espace pour les étiquettes de zones
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Trajectoire d\'apprentissage - Résultats par activité',
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'point', // Un seul point exact (évite les doublons)
                        intersect: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                        // Filtrer pour ne garder qu'un seul élément (évite doublons)
                        filter: function(tooltipItem, index) {
                            return index === 0; // Garder seulement le premier
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems || tooltipItems.length === 0) return '';
                                const item = tooltipItems[0];
                                const dataIndex = item.dataIndex;
                                const production = productionsArtefacts[dataIndex];
                                // Titre : activité d'apprentissage (description) ou titre
                                // Note: le nom de l'élève est déjà affiché à droite de la courbe
                                return production?.description || production?.titre || `Production ${dataIndex + 1}`;
                            },
                            label: function(context) {
                                const lignes = [];
                                const da = context.dataset.da;
                                const dataIndex = context.dataIndex;
                                const production = productionsArtefacts[dataIndex];

                                // Récupérer l'évaluation complète depuis l'index
                                const evaluation = production && da
                                    ? evaluationsIndex[da]?.[production.id]
                                    : null;

                                // Construire une ligne compacte : "M (75%) - Jeton - Plagiat"
                                const noteDecimale = context.parsed.y;
                                const notePourcent = noteDecimale !== null
                                    ? (noteDecimale * 100).toFixed(0)
                                    : '—';
                                const codeIDME = noteVersIDME(noteDecimale);

                                // Collecter les statuts
                                const statuts = [];

                                if (evaluation) {
                                    // Jeton utilisé
                                    const jetonUtilise = evaluation.repriseDeId ||
                                                        evaluation.jetonReprise ||
                                                        evaluation.jetonDelai ||
                                                        evaluation.avecJeton;
                                    if (jetonUtilise) {
                                        statuts.push('Jeton');
                                    }

                                    // Intégrité académique
                                    const statutIntegrite = evaluation.statutIntegrite;
                                    if (statutIntegrite === 'plagiat') {
                                        statuts.push('Plagiat');
                                    } else if (statutIntegrite === 'ia') {
                                        statuts.push('IA');
                                    }

                                    // Statut de remise
                                    const statutRemise = evaluation.statutRemise;
                                    if (statutRemise === 'non-remis') {
                                        statuts.push('Non remis');
                                    } else if (statutRemise === 'retard') {
                                        statuts.push('Retard');
                                    }
                                }

                                // Formater sur une ligne : "M (75%)" ou "M (75%) - Jeton - Plagiat"
                                let ligne = `${codeIDME} (${notePourcent}%)`;
                                if (statuts.length > 0) {
                                    ligne += ' - ' + statuts.join(' - ');
                                }

                                return ligne;
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
                            display: true,
                            text: 'Activités d\'apprentissage',
                            font: { size: 12, weight: 'bold' }
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
                            display: true,
                            text: 'Résultat',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2).replace('.', ',');
                            },
                            stepSize: 0.20,
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
                    axis: 'xy',
                    intersect: false // Permet de détecter le survol près de la ligne
                },
                // Gestion du survol pour mise en évidence + mêmes activités + verrouillage
                onHover: function(event, activeElements, chart) {
                    if (!chart || !chart.data || !chart.data.datasets) return;

                    let datasetIndex = -1;
                    let dataIndex = -1;

                    // Détecter quel point est survolé
                    if (activeElements && activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                        dataIndex = activeElements[0].index;
                    }

                    // Si une courbe est verrouillée, forcer le datasetIndex
                    const datasetActif = datasetVerrouille >= 0 ? datasetVerrouille : datasetIndex;

                    // Si pas de changement, ne rien faire
                    if (datasetActif === dernierDatasetSurvole && dataIndex === dernierPointSurvole) return;

                    dernierDatasetSurvole = datasetActif;
                    dernierPointSurvole = dataIndex;

                    // TOUS les indices de la même activité (y compris le point survolé)
                    const indicesMemesActivites = dataIndex >= 0 ? (memesActivites[dataIndex] || []) : [];

                    // Appliquer les styles selon le survol
                    chart.data.datasets.forEach((dataset, idx) => {
                        const nbPoints = dataset.data.length;

                        if (datasetActif === -1) {
                            // Aucun survol - style par défaut
                            dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
                            dataset.borderWidth = 1.5;
                            dataset.pointRadius = Array(nbPoints).fill(2);
                            dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(50, 50, 50, 0.5)');
                        } else if (idx === datasetActif) {
                            // Courbe active (survolée ou verrouillée) - mise en évidence
                            dataset.borderColor = datasetVerrouille >= 0 ? '#E91E63' : '#2196F3'; // Rose si verrouillé, bleu sinon
                            dataset.borderWidth = 3;

                            // Créer des tableaux pour les styles de points
                            const rayons = Array(nbPoints).fill(4);
                            const couleurs = Array(nbPoints).fill(datasetVerrouille >= 0 ? '#E91E63' : '#2196F3');

                            // Mettre en évidence TOUS les points de même activité (orange)
                            if (indicesMemesActivites.length > 1) {
                                indicesMemesActivites.forEach(i => {
                                    if (i >= 0 && i < nbPoints && dataset.data[i] !== null) {
                                        rayons[i] = 7;
                                        couleurs[i] = '#FF9800'; // Orange pour mêmes activités
                                    }
                                });
                            }

                            // Le point directement survolé est plus gros
                            if (dataIndex >= 0 && dataIndex < nbPoints && dataset.data[dataIndex] !== null) {
                                rayons[dataIndex] = 9;
                                // Garder orange si même activité, sinon bleu foncé
                                if (indicesMemesActivites.length <= 1) {
                                    couleurs[dataIndex] = datasetVerrouille >= 0 ? '#AD1457' : '#1565C0';
                                }
                            }

                            dataset.pointRadius = rayons;
                            dataset.pointBackgroundColor = couleurs;
                        } else {
                            // Autres courbes - atténuées
                            dataset.borderColor = 'rgba(80, 80, 80, 0.35)';
                            dataset.borderWidth = 1;
                            dataset.pointRadius = Array(nbPoints).fill(1);
                            dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(80, 80, 80, 0.3)');
                            // Quand une courbe est verrouillée, désactiver le survol des autres courbes
                            if (datasetVerrouille >= 0) {
                                dataset.pointHoverRadius = 1;
                                dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                            } else {
                                // Rétablir les propriétés de survol normales
                                dataset.pointHoverRadius = 5;
                                dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                            }
                        }
                    });

                    chart.update('none');
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);
        graphiqueSpaghettiInstance = chart;

        // Ajouter un listener pour réinitialiser au mouseout du canvas
        // Sauf si une courbe est verrouillée
        canvas.addEventListener('mouseleave', function() {
            // Si verrouillé, garder la courbe active affichée
            if (datasetVerrouille >= 0) {
                dernierDatasetSurvole = datasetVerrouille;
                dernierPointSurvole = -1;
                // Mettre à jour pour montrer la courbe verrouillée sans point survolé
                chart.data.datasets.forEach((dataset, idx) => {
                    const nbPoints = dataset.data.length;
                    if (idx === datasetVerrouille) {
                        dataset.borderColor = '#E91E63';
                        dataset.borderWidth = 3;
                        dataset.pointRadius = Array(nbPoints).fill(4);
                        dataset.pointBackgroundColor = Array(nbPoints).fill('#E91E63');
                        dataset.pointHoverRadius = 5;
                        dataset.pointHoverBackgroundColor = '#E91E63';
                    } else {
                        dataset.borderColor = 'rgba(80, 80, 80, 0.35)';
                        dataset.borderWidth = 1;
                        dataset.pointRadius = Array(nbPoints).fill(1);
                        dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(80, 80, 80, 0.3)');
                        // Désactiver le survol des autres courbes quand verrouillé
                        dataset.pointHoverRadius = 1;
                        dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                    }
                });
            } else {
                // Pas de verrouillage - réinitialiser tout
                dernierDatasetSurvole = -1;
                dernierPointSurvole = -1;
                chart.data.datasets.forEach(dataset => {
                    const nbPoints = dataset.data.length;
                    dataset.borderColor = 'rgba(50, 50, 50, 0.4)';
                    dataset.borderWidth = 1.5;
                    dataset.pointRadius = Array(nbPoints).fill(2);
                    dataset.pointBackgroundColor = Array(nbPoints).fill('rgba(50, 50, 50, 0.5)');
                    // Rétablir les propriétés de survol normales
                    dataset.pointHoverRadius = 5;
                    dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                });
            }
            chart.update('none');
        });

        // Fonction pour appliquer le verrouillage/déverrouillage
        function toggleVerrouillage(indexDataset) {
            if (datasetVerrouille === indexDataset) {
                // Déverrouiller
                datasetVerrouille = -1;
                console.log('🔓 Courbe déverrouillée');
                // Rétablir les propriétés de survol normales pour tous
                chart.data.datasets.forEach(dataset => {
                    dataset.pointHoverRadius = 5;
                    dataset.pointHoverBackgroundColor = 'rgba(50, 50, 50, 0.9)';
                });
            } else {
                // Verrouiller
                datasetVerrouille = indexDataset;
                dernierDatasetSurvole = indexDataset;
                console.log(`🔒 Courbe verrouillée: ${chart.data.datasets[indexDataset]?.label}`);
                // Désactiver le survol des autres courbes
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === indexDataset) {
                        dataset.pointHoverRadius = 5;
                        dataset.pointHoverBackgroundColor = '#E91E63';
                    } else {
                        dataset.pointHoverRadius = 1;
                        dataset.pointHoverBackgroundColor = 'rgba(80, 80, 80, 0.3)';
                    }
                });
            }
            chart.update('none');
        }

        // Gestionnaire de clic pour verrouiller/déverrouiller une courbe
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // 1. Vérifier si le clic est sur un nom d'étudiant
            for (const zone of zonesNomsEtudiants) {
                if (clickX >= zone.x && clickX <= zone.x + zone.width &&
                    clickY >= zone.y && clickY <= zone.y + zone.height) {
                    toggleVerrouillage(zone.datasetIndex);
                    return;
                }
            }

            // 2. Vérifier si le clic est sur un point de la courbe
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length > 0) {
                const clickedDatasetIndex = elements[0].datasetIndex;
                toggleVerrouillage(clickedDatasetIndex);
                return;
            }

            // 3. Si clic ailleurs et une courbe est verrouillée, déverrouiller
            if (datasetVerrouille >= 0) {
                toggleVerrouillage(datasetVerrouille);
            }
        });

        // Changer le curseur au survol des noms ou des points
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Vérifier si sur un nom
            let surElement = false;
            for (const zone of zonesNomsEtudiants) {
                if (mouseX >= zone.x && mouseX <= zone.x + zone.width &&
                    mouseY >= zone.y && mouseY <= zone.y + zone.height) {
                    surElement = true;
                    break;
                }
            }

            // Vérifier si sur un point de courbe
            if (!surElement) {
                const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                surElement = elements.length > 0;
            }

            canvas.style.cursor = surElement ? 'pointer' : 'default';
        });

        console.log(`✅ Graphique spaghetti créé avec ${datasets.length} trajectoires sur ${productionsArtefacts.length} artefacts`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique spaghetti:', error);
        return null;
    }
}

/**
 * Affiche un message d'attente dans le canvas
 * @param {HTMLCanvasElement} canvas - Élément canvas
 * @param {string} titre - Titre du message
 * @param {string} details - Détails supplémentaires
 */
function afficherMessageAttente(canvas, titre, details) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(titre, canvas.width / 2, canvas.height / 2 - 10);

    if (details) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText(details, canvas.width / 2, canvas.height / 2 + 15);
    }
}

/**
 * Rafraîchit le graphique spaghetti
 * Note: Le paramètre indice n'est plus utilisé (Beta 96 - résultats bruts)
 */
function rafraichirGraphiqueSpaghetti() {
    creerGraphiqueGroupeSpaghetti('graphique-groupe-spaghetti');
}

/**
 * Crée les annotations pour les zones colorées (version dynamique)
 * Utilise l'échelle de performance de l'utilisateur
 * @returns {Object} - Configuration des annotations
 */
function creerAnnotationsZonesIDME() {
    const zones = genererZonesDepuisEchelle();
    const annotations = {};

    zones.forEach((zone, index) => {
        annotations[`zone${index}_${zone.code || index}`] = {
            type: 'box',
            yMin: zone.yMin,
            yMax: zone.yMax,
            backgroundColor: zone.backgroundColor,
            borderWidth: 0,
            drawTime: 'beforeDatasetsDraw'
        };
    });

    return annotations;
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
        const productions = obtenirDonneesSelonMode('productionsPedagogiques') || [];

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
window.creerGraphiqueGroupeSpaghettiACP = creerGraphiqueGroupeSpaghettiACP;
window.rafraichirGraphiqueSpaghettiACP = rafraichirGraphiqueSpaghettiACP;
window.creerGraphiqueGroupeSpaghetti = creerGraphiqueGroupeSpaghetti;
window.rafraichirGraphiqueSpaghetti = rafraichirGraphiqueSpaghetti;
window.creerGraphiqueCriteres = creerGraphiqueCriteres;
window.detruireGraphique = detruireGraphique;

console.log('📊 Module graphiques-progression.js chargé');
