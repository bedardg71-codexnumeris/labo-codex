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

(function() {
'use strict';

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
 * ✨ UNIFORMISATION (#240) : Constantes de style partagées
 * Alignées sur le style du graphique « Dynamique des corrélations »
 */
const STYLE_LIGNE_EPAISSEUR = 2.5;
const STYLE_LIGNE_TENSION = 0.25;
const STYLE_POINT_RAYON = 4;
const STYLE_POINT_RAYON_HOVER = 7;
const STYLE_POINT_BORDURE = 2;
const STYLE_TOOLTIP = {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    titleColor: '#fff',
    bodyColor: '#fff',
    cornerRadius: 6,
    padding: 10
};

/**
 * ✅ CORRECTIF (2 mars 2026): Vérifie qu'un chart est encore valide
 * avant d'appeler chart.update() dans un event handler.
 * Chart.js crash (TypeError: null is not an object, t.addEventListener)
 * quand le canvas est détaché du DOM (navigation SPA).
 */
function chartEstValide(chart) {
    try {
        return chart && chart.canvas && chart.canvas.parentNode && chart.ctx;
    } catch (e) {
        return false;
    }
}

/**
 * Couleur de grille dynamique selon le thème clair/sombre
 * @param {number} [opacite=0.08] - Opacité de la grille
 * @returns {string} - Couleur rgba adaptée au thème
 */
function couleurGrille(opacite) {
    if (opacite === undefined) opacite = 0.08;
    return document.body.classList.contains('mode-clair')
        ? 'rgba(3, 46, 92, ' + opacite + ')'
        : 'rgba(106, 172, 184, ' + opacite + ')';
}

/**
 * Couleur du texte (axes, labels) adaptée au thème
 * @returns {string} - Couleur hex
 */
function couleurTexte() {
    return document.body.classList.contains('mode-clair') ? '#333' : '#b0c4d0';
}

/**
 * Couleur de bordure des points adaptée au thème
 * @returns {string} - Couleur hex
 */
function couleurBordurePoint() {
    return document.body.classList.contains('mode-clair') ? '#fff' : '#1a2a3a';
}

/**
 * Applique un style cohérent à un dataset de graphique 3 courbes (A-C-P, critères)
 * @param {Object} dataset - Dataset Chart.js
 * @param {string} etat - 'defaut' | 'actif' | 'inactif'
 * @param {string} couleur - Couleur hex de la courbe
 */
function appliquerStyleDataset(dataset, etat, couleur) {
    var nbPoints = dataset.data.length;
    var bordure = couleurBordurePoint();

    switch (etat) {
        case 'defaut':
            dataset.borderColor = couleur;
            dataset.borderWidth = STYLE_LIGNE_EPAISSEUR;
            dataset.pointBackgroundColor = couleur;
            dataset.pointBorderColor = bordure;
            dataset.pointBorderWidth = STYLE_POINT_BORDURE;
            dataset.pointRadius = STYLE_POINT_RAYON;
            dataset.order = 1;
            break;
        case 'actif':
            dataset.borderColor = couleur;
            dataset.borderWidth = 3;
            dataset.pointBackgroundColor = Array(nbPoints).fill(couleur);
            dataset.pointBorderColor = Array(nbPoints).fill(bordure);
            dataset.pointBorderWidth = STYLE_POINT_BORDURE;
            dataset.pointRadius = Array(nbPoints).fill(6);
            dataset.order = 0;
            break;
        case 'inactif':
            dataset.borderColor = hexVersRgba(couleur, 0.2);
            dataset.borderWidth = 1.5;
            dataset.pointBackgroundColor = Array(nbPoints).fill(hexVersRgba(couleur, 0.2));
            dataset.pointBorderColor = Array(nbPoints).fill(hexVersRgba(couleur, 0.1));
            dataset.pointBorderWidth = 1;
            dataset.pointRadius = Array(nbPoints).fill(3);
            dataset.order = 1;
            break;
    }
}

/**
 * Applique un style cohérent à un dataset de graphique spaghetti (multi-étudiants)
 * @param {Object} dataset - Dataset Chart.js
 * @param {string} etat - 'defaut' | 'actif' | 'inactif'
 * @param {string} couleur - Couleur hex de l'indice
 */
function appliquerStyleSpaghetti(dataset, etat, couleur) {
    var nbPoints = dataset.data.length;
    var bordure = couleurBordurePoint();

    switch (etat) {
        case 'defaut':
            dataset.borderColor = hexVersRgba(couleur, 0.4);
            dataset.borderWidth = STYLE_LIGNE_EPAISSEUR;
            dataset.pointBackgroundColor = hexVersRgba(couleur, 0.4);
            dataset.pointBorderColor = bordure;
            dataset.pointBorderWidth = STYLE_POINT_BORDURE;
            dataset.pointRadius = STYLE_POINT_RAYON;
            dataset.pointHoverRadius = STYLE_POINT_RAYON_HOVER;
            break;
        case 'actif':
            dataset.borderColor = couleur;
            dataset.borderWidth = 3;
            dataset.pointRadius = Array(nbPoints).fill(6);
            dataset.pointBackgroundColor = Array(nbPoints).fill(couleur);
            dataset.pointBorderColor = Array(nbPoints).fill(bordure);
            dataset.pointBorderWidth = STYLE_POINT_BORDURE;
            dataset.pointHoverRadius = STYLE_POINT_RAYON_HOVER;
            break;
        case 'inactif':
            dataset.borderColor = hexVersRgba(couleur, 0.15);
            dataset.borderWidth = 1.5;
            dataset.pointRadius = Array(nbPoints).fill(2);
            dataset.pointBackgroundColor = Array(nbPoints).fill(hexVersRgba(couleur, 0.15));
            dataset.pointBorderColor = Array(nbPoints).fill(hexVersRgba(couleur, 0.1));
            dataset.pointBorderWidth = 1;
            dataset.pointHoverRadius = 2;
            break;
    }
}

/**
 * ✨ NOUVELLE FONCTIONNALITÉ (8 déc 2025) : Persistance de l'état de la légende
 * Permet de comparer le même critère/indice entre plusieurs élèves
 */
let etatLegendeGraphiqueACPE = {}; // { 'A': true, 'C': false, 'P': true, 'E': true }
let etatLegendeGraphiqueCriteres = {}; // { 'Structure': true, 'Rigueur': false, ... }

/**
 * Zones colorées selon échelle IDME (0.00 à 1.00)
 */
// 🆕 BETA 96: Couleurs identiques au gradient des barres ACPE (dégradé vertical)
const ZONES_IDME = [
    {
        yMin: 0.00,
        yMax: 0.40,
        backgroundColor: 'rgba(255, 140, 0, 0.25)',   // Orange (#ff8c00) - comme barre gauche
        borderColor: 'rgba(255, 140, 0, 0.4)',
        label: 'Incomplet'
    },
    {
        yMin: 0.40,
        yMax: 0.65,
        backgroundColor: 'rgba(255, 193, 7, 0.25)',   // Jaune (#ffc107) - transition
        borderColor: 'rgba(255, 193, 7, 0.4)',
        label: 'en Développement'
    },
    {
        yMin: 0.65,
        yMax: 0.75,
        backgroundColor: 'rgba(152, 208, 37, 0.25)',  // Vert citron (#98d025) - comme barre centre-gauche
        borderColor: 'rgba(152, 208, 37, 0.4)',
        label: 'en Développement'
    },
    {
        yMin: 0.75,
        yMax: 0.85,
        backgroundColor: 'rgba(34, 197, 94, 0.25)',   // Vert (#22c55e) - comme barre centre
        borderColor: 'rgba(34, 197, 94, 0.4)',
        label: 'Maîtrisé'
    },
    {
        yMin: 0.85,
        yMax: 1.00,
        backgroundColor: 'rgba(14, 165, 233, 0.25)',  // Bleu ciel (#0ea5e9) - comme barre droite
        borderColor: 'rgba(14, 165, 233, 0.4)',
        label: 'Étendu'
    }
];

/**
 * Calcule les bornes Y dynamiques pour un meilleur affichage des données
 * Au lieu de 0-100%, affiche (min - 5%) à (max + 5%) arrondi à 5%
 * @param {Array} datasets - Les datasets Chart.js avec leurs données
 * @returns {Object} - { min: number, max: number } en valeurs 0-1
 */
function calculerBornesYDynamiques(datasets) {
    // Collecter toutes les valeurs non-null des datasets
    let toutesValeurs = [];
    datasets.forEach(dataset => {
        if (dataset.data && Array.isArray(dataset.data)) {
            dataset.data.forEach(val => {
                if (val !== null && val !== undefined && !isNaN(val)) {
                    toutesValeurs.push(val);
                }
            });
        }
    });

    // Si pas de données, retourner l'échelle complète
    if (toutesValeurs.length === 0) {
        return { min: 0, max: 1 };
    }

    // Trouver min et max
    const minData = Math.min(...toutesValeurs);
    const maxData = Math.max(...toutesValeurs);

    // Arrondir à 5% (0.05) avec marge de 5%
    // Min: arrondir vers le bas au 5% inférieur, puis soustraire 5%
    // Max: arrondir vers le haut au 5% supérieur, puis ajouter 5%
    const pas = 0.05; // 5%

    let borneMin = Math.floor(minData / pas) * pas - pas;
    let borneMax = Math.ceil(maxData / pas) * pas + pas;

    // S'assurer de rester dans les limites raisonnables
    // Min: pas en dessous de 0
    // Max: permet jusqu'à 1.03 (103%) pour espace visuel au-dessus de 100%
    borneMin = Math.max(0, borneMin);
    borneMax = Math.min(1.03, borneMax);

    // Si la plage est trop petite, élargir un peu
    if (borneMax - borneMin < 0.2) {
        const centre = (borneMin + borneMax) / 2;
        borneMin = Math.max(0, centre - 0.15);
        borneMax = Math.min(1.03, centre + 0.15);
    }

    console.log(`📊 [Échelle Y dynamique] Données: ${(minData*100).toFixed(0)}%-${(maxData*100).toFixed(0)}% → Affichage: ${(borneMin*100).toFixed(0)}%-${(borneMax*100).toFixed(0)}%`);

    return { min: borneMin, max: borneMax };
}

/**
 * Calcule les bornes Y dynamiques pour une échelle 0-100 (pourcentages)
 * Variante de calculerBornesYDynamiques pour les graphiques en pourcentage
 * @param {Array} datasets - Les datasets Chart.js avec leurs données
 * @returns {Object} - { min: number, max: number } en valeurs 0-100
 */
function calculerBornesYDynamiques100(datasets) {
    // Collecter toutes les valeurs non-null des datasets
    let toutesValeurs = [];
    datasets.forEach(dataset => {
        if (dataset.data && Array.isArray(dataset.data)) {
            dataset.data.forEach(val => {
                if (val !== null && val !== undefined && !isNaN(val)) {
                    toutesValeurs.push(val);
                }
            });
        }
    });

    // Si pas de données, retourner l'échelle complète
    if (toutesValeurs.length === 0) {
        return { min: 0, max: 100 };
    }

    // Trouver min et max
    const minData = Math.min(...toutesValeurs);
    const maxData = Math.max(...toutesValeurs);

    // Arrondir à 5% avec marge de 5%
    const pas = 5; // 5%

    let borneMin = Math.floor(minData / pas) * pas - pas;
    let borneMax = Math.ceil(maxData / pas) * pas + pas;

    // S'assurer de rester dans les limites raisonnables
    // Min: pas en dessous de 0
    // Max: permet jusqu'à 103% pour espace visuel au-dessus de 100%
    borneMin = Math.max(0, borneMin);
    borneMax = Math.min(103, borneMax);

    // Si la plage est trop petite, élargir un peu
    if (borneMax - borneMin < 20) {
        const centre = (borneMin + borneMax) / 2;
        borneMin = Math.max(0, centre - 15);
        borneMax = Math.min(103, centre + 15);
    }

    console.log(`📊 [Échelle Y dynamique 100] Données: ${minData.toFixed(0)}%-${maxData.toFixed(0)}% → Affichage: ${borneMin.toFixed(0)}%-${borneMax.toFixed(0)}%`);

    return { min: borneMin, max: borneMax };
}

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
/**
 * Stockage des instances de graphiques individuels par DA
 */
const graphiquesIndividuels = {};

/**
 * Rafraîchit le graphique individuel en fonction des checkboxes
 * @param {string} da - Numéro DA de l'étudiant
 */
function rafraichirGraphiqueIndividuel(da) {
    const canvasId = `graphique-progression-${da}`;

    // Détruire l'ancien graphique s'il existe
    if (graphiquesIndividuels[da]) {
        graphiquesIndividuels[da].destroy();
        delete graphiquesIndividuels[da];
    }

    // Recréer le graphique
    creerGraphiqueIndividuel(canvasId, da);
}

function creerGraphiqueIndividuel(canvasId, da) {
    try {
        // Récupérer les snapshots de l'étudiant
        const snapshots = obtenirSnapshotsEtudiant(da);

        if (snapshots.length === 0) {
            console.warn(`Aucun snapshot disponible pour DA ${da}`);
            return null;
        }

        // Préparer les données - afficher tous les indices
        const OFFSET_VISUEL = {
            A: 0.000,
            C: 0.005,
            P: 0.010
        };

        const labels = snapshots.map(s => `Sem. ${s.numSemaine}`);

        // 🆕 Beta 98.3 : Construire la liste des productions assignées pour vérifier
        // à chaque date de snapshot si des productions sont dues.
        // Si aucune n'est due → C et P doivent être null (pas 0%).
        let productionsFiltreesIndiv = [];
        let gcIdIndiv = null;
        try {
            const productions = obtenirDonneesSelonMode('productions') || [];
            const infoCoursIndiv = db.getSync('infoCours', null);
            gcIdIndiv = infoCoursIndiv ? (infoCoursIndiv._groupeCoursId || infoCoursIndiv.id || null) : null;
            productionsFiltreesIndiv = productions.filter(p => {
                if (p.facultatif || p.type === 'portfolio') return false;
                if (typeof obtenirEcheanceEffective === 'function') {
                    const { date, assignee } = obtenirEcheanceEffective(p, gcIdIndiv);
                    return assignee && !!date;
                }
                return !!p.dateEcheance;
            });
        } catch (e) { /* silencieux */ }

        // Helper : si aucune production n'est due à la date du snapshot, retourner null
        const corrigerAvantEcheance = (s, valeur) => {
            if (valeur === null) return null;
            if (productionsFiltreesIndiv.length === 0) {
                // Aucune production assignée → C/P toujours null
                return null;
            }
            const dateSnapshot = s.dateFin || s.dateDebut || '';
            const nbDues = productionsFiltreesIndiv.filter(p => {
                if (typeof obtenirEcheanceEffective === 'function') {
                    return obtenirEcheanceEffective(p, gcIdIndiv).date <= dateSnapshot;
                }
                return p.dateEcheance <= dateSnapshot;
            }).length;
            if (nbDues === 0) return null;
            return valeur;
        };

        // 🆕 Beta 98.3 : Ne plus filtrer les 0% — seul null signifie "pas de données"
        const donneesA = snapshots.map(s => {
            const valeur = s.A_cumulatif !== undefined ? s.A_cumulatif : s.A;
            return valeur !== null ? (valeur / 100) + OFFSET_VISUEL.A : null;
        });

        const donneesC = snapshots.map(s => {
            const valeur = corrigerAvantEcheance(s, s.C);
            return valeur !== null ? (valeur / 100) + OFFSET_VISUEL.C : null;
        });

        const donneesP = snapshots.map(s => {
            const valeur = corrigerAvantEcheance(s, s.P);
            return valeur !== null ? (valeur / 100) + OFFSET_VISUEL.P : null;
        });

        // Récupérer les événements pédagogiques pour marqueurs visuels
        const jetonsParDate = obtenirJetonsParDate(da, snapshots);
        const raiParDate = obtenirRaiParDate(da, snapshots);

        // Générer les styles de points personnalisés
        const stylesA = genererStylesPoints(snapshots, raiParDate, 'rai', COULEURS_INDICES.A);
        const stylesC = genererStylesPoints(snapshots, {}, 'none', COULEURS_INDICES.C);
        const stylesP = genererStylesPoints(snapshots, jetonsParDate, 'jeton', COULEURS_INDICES.P);

        // Stocker les infos pour les tooltips enrichis
        const infosEvenements = { jetonsParDate, raiParDate, snapshots };

        // Construire les datasets - style noir/fin par défaut (comme spaghetti)
        const couleursOriginales = {
            'Assiduité (A)': COULEURS_INDICES.A,
            'Complétion (C)': COULEURS_INDICES.C,
            'Performance (P)': COULEURS_INDICES.P
        };

        // ✨ #240: Courbes colorées par défaut, bordure de point thème-aware
        const datasets = [
            {
                label: 'Assiduité (A)',
                data: donneesA,
                borderColor: COULEURS_INDICES.A,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: COULEURS_INDICES.A,
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            },
            {
                label: 'Complétion (C)',
                data: donneesC,
                borderColor: COULEURS_INDICES.C,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: COULEURS_INDICES.C,
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            },
            {
                label: 'Performance (P)',
                data: donneesP,
                borderColor: COULEURS_INDICES.P,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: COULEURS_INDICES.P,
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            }
        ];

        // Variables pour suivre le dataset survolé et verrouillé
        let dernierDatasetSurvoleIndiv = -1;
        let datasetVerrouilleIndiv = -1;
        let zonesNomsIndices = []; // Zones cliquables pour les noms A, C, P

        // Plugin pour afficher le nom de l'indice au bout de la courbe active
        const pluginNomIndiceSurvol = {
            id: 'nomIndiceSurvol',
            afterDraw(chart) {
                const datasetIndexActif = datasetVerrouilleIndiv >= 0 ? datasetVerrouilleIndiv : dernierDatasetSurvoleIndiv;
                zonesNomsIndices = []; // Réinitialiser les zones

                const ctx = chart.ctx;
                const chartArea = chart.chartArea;

                // Afficher le nom pour le dataset actif
                chart.data.datasets.forEach((dataset, idx) => {
                    const meta = chart.getDatasetMeta(idx);
                    if (!meta || !meta.data || meta.data.length === 0) return;

                    // Trouver le dernier point visible
                    let dernierPoint = null;
                    for (let i = meta.data.length - 1; i >= 0; i--) {
                        if (dataset.data[i] !== null && dataset.data[i] !== undefined) {
                            dernierPoint = meta.data[i];
                            break;
                        }
                    }
                    if (!dernierPoint) return;

                    const x = dernierPoint.x + 10;
                    const y = dernierPoint.y;

                    // Extraire le nom court (A, C ou P)
                    const nomCourt = dataset.label.match(/\(([ACP])\)/)?.[1] || dataset.label;
                    const couleur = couleursOriginales[dataset.label];

                    ctx.save();
                    ctx.font = idx === datasetIndexActif ? 'bold 12px Arial' : '11px Arial';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';

                    if (idx === datasetIndexActif) {
                        // Fond blanc pour le nom actif
                        const textWidth = ctx.measureText(nomCourt).width;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(x - 3, y - 8, textWidth + 6, 16);
                        ctx.strokeStyle = couleur;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x - 3, y - 8, textWidth + 6, 16);
                        ctx.fillStyle = couleur;
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    }

                    ctx.fillText(nomCourt, x, y);

                    // Stocker la zone cliquable
                    const textWidth = ctx.measureText(nomCourt).width;
                    zonesNomsIndices.push({
                        datasetIndex: idx,
                        x: x - 3,
                        y: y - 8,
                        width: textWidth + 6,
                        height: 16,
                        label: dataset.label
                    });

                    ctx.restore();
                });
            }
        };

        // Calculer les bornes Y dynamiques
        const bornesY = calculerBornesYDynamiques(datasets);

        // Obtenir le canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const config = {
            type: 'line',
            // 🆕 BETA 96: Utiliser le plugin gradient au lieu des annotations
            plugins: [pluginGradientFond, pluginEtiquettesZones, pluginNomIndiceSurvol],
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { right: 25 }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Progression temporelle - Indices A-C-P',
                        font: { size: 16, weight: 'bold' },
                        color: couleurTexte(),
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: false // Masquer la légende, on utilise les checkboxes
                    },
                    tooltip: {
                        ...STYLE_TOOLTIP,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems.length) return '';
                                const index = tooltipItems[0].dataIndex;
                                const snapshot = infosEvenements.snapshots[index];
                                if (!snapshot) return tooltipItems[0].label;

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
                                const valeurReelle = context.parsed.y;
                                const value = (valeurReelle * 100).toFixed(0);
                                return `${label}: ${value}%`;
                            },
                            afterBody: function(tooltipItems) {
                                if (!tooltipItems.length) return [];

                                const index = tooltipItems[0].dataIndex;
                                const snapshot = infosEvenements.snapshots[index];
                                if (!snapshot) return [];

                                const dateSeance = snapshot.dateSeance;
                                const lignes = [];

                                const jeton = infosEvenements.jetonsParDate[dateSeance];
                                if (jeton) {
                                    const typeLabel = jeton.type === 'jetonDelai' ? '⭐ Jeton délai' : '◆ Jeton reprise';
                                    lignes.push('');
                                    lignes.push(`${typeLabel} sur "${jeton.production}"`);
                                }

                                const rai = infosEvenements.raiParDate[dateSeance];
                                if (rai) {
                                    const niveauLabel = rai.niveau === 3 ? '■ RàI Niveau 3' : '▲ RàI Niveau 2';
                                    lignes.push('');
                                    lignes.push(`${niveauLabel}: ${rai.titre}`);
                                }

                                return lignes;
                            }
                        }
                    }

                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Semaines',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 10 }
                        },
                        grid: { display: true, color: couleurGrille() }
                    },
                    y: {
                        min: bornesY.min,
                        max: bornesY.max,
                        title: {
                            display: true,
                            text: 'Indice',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            callback: value => (value * 100).toFixed(0) + '%',
                            stepSize: 0.05
                        },
                        grid: { display: true, color: couleurGrille() }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                // ✨ #240: Gestionnaire survol via appliquerStyleDataset
                onHover: function(event, activeElements, chart) {
                    let datasetIndex = -1;

                    if (activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                    }

                    // Si verrouillé, forcer le datasetIndex actif
                    const datasetActif = datasetVerrouilleIndiv >= 0 ? datasetVerrouilleIndiv : datasetIndex;

                    // Éviter les mises à jour inutiles
                    if (datasetActif === dernierDatasetSurvoleIndiv && datasetVerrouilleIndiv < 0) return;
                    dernierDatasetSurvoleIndiv = datasetActif;

                    chart.data.datasets.forEach((dataset, idx) => {
                        const couleurOriginale = couleursOriginales[dataset.label];
                        if (datasetActif === -1) {
                            appliquerStyleDataset(dataset, 'defaut', couleurOriginale);
                        } else if (idx === datasetActif) {
                            appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                        } else {
                            appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // 🆕 BETA 96: Fonction de verrouillage/déverrouillage
        function toggleVerrouillageIndiv(indexDataset) {
            if (datasetVerrouilleIndiv === indexDataset) {
                // Déverrouiller
                datasetVerrouilleIndiv = -1;
                dernierDatasetSurvoleIndiv = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleDataset(dataset, 'defaut', couleursOriginales[dataset.label]);
                });
            } else {
                // Verrouiller
                datasetVerrouilleIndiv = indexDataset;
                dernierDatasetSurvoleIndiv = indexDataset;
                chart.data.datasets.forEach((dataset, idx) => {
                    const couleurOriginale = couleursOriginales[dataset.label];
                    if (idx === indexDataset) {
                        appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                    } else {
                        appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                    }
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        }

        // Verrouillage au clic (sur nom ou point)
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            // Appliquer le ratio de scale pour correspondre aux coordonnées du canvas
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;

            // 1. Vérifier clic sur un nom d'indice (A, C, P)
            for (const zone of zonesNomsIndices) {
                if (clickX >= zone.x && clickX <= zone.x + zone.width &&
                    clickY >= zone.y && clickY <= zone.y + zone.height) {
                    toggleVerrouillageIndiv(zone.datasetIndex);
                    return;
                }
            }

            // 2. Vérifier clic sur un point de la courbe
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length > 0) {
                toggleVerrouillageIndiv(elements[0].datasetIndex);
                return;
            }

            // 3. Clic ailleurs - déverrouiller si verrouillé
            if (datasetVerrouilleIndiv >= 0) {
                toggleVerrouillageIndiv(datasetVerrouilleIndiv);
            }
        });

        canvas.addEventListener('mouseleave', function() {
            if (datasetVerrouilleIndiv >= 0) {
                dernierDatasetSurvoleIndiv = datasetVerrouilleIndiv;
                chart.data.datasets.forEach((dataset, idx) => {
                    const couleurOriginale = couleursOriginales[dataset.label];
                    if (idx === datasetVerrouilleIndiv) {
                        appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                    } else {
                        appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                    }
                });
            } else {
                dernierDatasetSurvoleIndiv = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleDataset(dataset, 'defaut', couleursOriginales[dataset.label]);
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        });

        // Changer le curseur au survol des noms ou des points
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            // Appliquer le ratio de scale pour correspondre aux coordonnées du canvas
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            let surElement = false;
            for (const zone of zonesNomsIndices) {
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

        // Stocker l'instance pour pouvoir la détruire plus tard
        graphiquesIndividuels[da] = chart;

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
        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Stocker les couleurs originales pour le survol
        const couleursOriginales = {
            'Assiduité (A)': COULEURS_INDICES.A,
            'Complétion (C)': COULEURS_INDICES.C,
            'Performance (P)': COULEURS_INDICES.P
        };

        // Variable pour tracker le dernier survol
        let dernierDatasetSurvoleMoyennes = -1;

        // Préparer les datasets pour calculer les bornes Y
        const datasetsTemp = [
            { data: donneesA },
            { data: donneesC },
            { data: donneesP }
        ];

        // Calculer les bornes Y dynamiques
        const bornesY = calculerBornesYDynamiques(datasetsTemp);

        // Configuration du graphique
        const config = {
            type: 'line',
            // 🆕 BETA 96: Utiliser le plugin gradient au lieu des annotations
            plugins: [pluginGradientFond, pluginEtiquettesZones],
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Assiduité (A)',
                        data: donneesA,
                        borderColor: COULEURS_INDICES.A,
                        backgroundColor: 'transparent',
                        borderWidth: STYLE_LIGNE_EPAISSEUR,
                        tension: STYLE_LIGNE_TENSION,
                        pointRadius: STYLE_POINT_RAYON,
                        pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                        pointBackgroundColor: COULEURS_INDICES.A,
                        pointBorderColor: couleurBordurePoint(),
                        pointBorderWidth: STYLE_POINT_BORDURE
                    },
                    {
                        label: 'Complétion (C)',
                        data: donneesC,
                        borderColor: COULEURS_INDICES.C,
                        backgroundColor: 'transparent',
                        borderWidth: STYLE_LIGNE_EPAISSEUR,
                        tension: STYLE_LIGNE_TENSION,
                        pointRadius: STYLE_POINT_RAYON,
                        pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                        pointBackgroundColor: COULEURS_INDICES.C,
                        pointBorderColor: couleurBordurePoint(),
                        pointBorderWidth: STYLE_POINT_BORDURE,
                        spanGaps: false
                    },
                    {
                        label: 'Performance (P)',
                        data: donneesP,
                        borderColor: COULEURS_INDICES.P,
                        backgroundColor: 'transparent',
                        borderWidth: STYLE_LIGNE_EPAISSEUR,
                        tension: STYLE_LIGNE_TENSION,
                        pointRadius: STYLE_POINT_RAYON,
                        pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                        pointBackgroundColor: COULEURS_INDICES.P,
                        pointBorderColor: couleurBordurePoint(),
                        pointBorderWidth: STYLE_POINT_BORDURE,
                        spanGaps: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { right: 25 }
                },
                plugins: {
                    title: {
                        display: true,
                        text: ['Évolution du groupe - Moyennes A-C-P (par séance)', 'A et C : ponctuals (cette séance) • P : cumulatif (depuis le début)'],
                        font: [
                            { size: 16, weight: 'bold' },
                            { size: 11, weight: 'normal', style: 'italic' }
                        ],
                        color: [couleurTexte(), hexVersRgba(couleurTexte(), 0.6)],
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 },
                            color: couleurTexte()
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

                            if (chartEstValide(chart)) chart.update();
                        }
                    },
                    tooltip: {
                        ...STYLE_TOOLTIP,
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
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Semaines',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: { color: couleurTexte() },
                        grid: { display: true, color: couleurGrille() }
                    },
                    y: {
                        min: bornesY.min,
                        max: bornesY.max,
                        title: {
                            display: true,
                            text: 'Performance',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            callback: function(value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                        },
                        grid: { display: true, color: couleurGrille() }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                onHover: function(event, activeElements, chart) {
                    let datasetIndex = -1;

                    if (activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                    }

                    if (datasetIndex === dernierDatasetSurvoleMoyennes) return;
                    dernierDatasetSurvoleMoyennes = datasetIndex;

                    chart.data.datasets.forEach((dataset, idx) => {
                        const couleurOriginale = couleursOriginales[dataset.label];
                        if (datasetIndex === -1) {
                            appliquerStyleDataset(dataset, 'defaut', couleurOriginale);
                        } else if (idx === datasetIndex) {
                            appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                        } else {
                            appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
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
        if (chartEstValide(chart)) chart.update();

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

        // Zone cliquable élargie pour éviter les problèmes de DPI/scale
        const marge = 5;
        zonesNomsEtudiantsACP = [{
            datasetIndex: datasetIndexActif,
            x: rectX - marge,
            y: rectY - marge,
            width: rectW + marge * 2,
            height: rectH + marge * 2
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

        // Récupérer les étudiants du groupe actif (source de vérité pour les noms)
        const etudiantsGroupeActif = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif() : [];
        if (etudiantsGroupeActif.length === 0) {
            afficherMessageAttente(canvas, 'Aucun groupe actif', 'Sélectionne un groupe pour voir les données.');
            return null;
        }
        const dasGroupeActif = new Set(etudiantsGroupeActif.map(e => e.da));

        // Collecter les DAs présents dans les snapshots
        const dasAvecDonnees = new Set();
        snapshots.forEach(snapshot => {
            if (snapshot.etudiants) {
                snapshot.etudiants.forEach(e => {
                    if (dasGroupeActif.has(e.da)) dasAvecDonnees.add(e.da);
                });
            }
        });

        // Construire la liste d'étudiants avec noms du groupe actif (pas des snapshots)
        const etudiants = etudiantsGroupeActif
            .filter(e => dasAvecDonnees.has(e.da))
            .map(etudiant => {
                const da = etudiant.da;
                const nomAnonyme = typeof anonymiserNom === 'function' ? anonymiserNom(da) : null;
                const nomAffiche = nomAnonyme
                    ? nomAnonyme
                    : (etudiant.prenom && etudiant.nom
                        ? `${etudiant.prenom} ${etudiant.nom}`
                        : etudiant.nom || `DA ${da}`);
                return { da, nomComplet: etudiant.nom || da, nomAffiche };
            });
        if (etudiants.length === 0) {
            afficherMessageAttente(canvas, 'Aucun étudiant', 'Les snapshots ne contiennent pas de données étudiants.');
            return null;
        }

        // Noms des indices
        const nomsIndices = {
            'A': 'Assiduité',
            'C': 'Complétion',
            'P': 'Construction de P'
        };

        // Couleurs des indices
        const couleursIndices = {
            'A': '#1976D2',
            'C': '#FF6B35',
            'P': '#4CAF50'
        };

        // Décalage visuel aléatoire pour séparer les courbes superposées (±1.5%)
        const genererOffset = () => (Math.random() - 0.5) * 0.03;

        // 🆕 Beta 98.3 : Pour C et P, déterminer à chaque date de snapshot si des productions
        // sont dues. Si aucune production n'est due à la date de ce snapshot → C/P = null.
        // Corrige les snapshots qui stockaient C=0 au lieu de null.
        let productionsFiltreesGraph = [];
        let gcIdGraph = null;
        // Borne inférieure du semestre : les productions dont l'échéance est antérieure
        // sont d'un trimestre précédent et ne comptent pas pour C/P du semestre courant.
        let dateDebutSemestre = '';
        try {
            const cadre = db.getSync(cle('cadreCalendrier'), null);
            if (cadre && cadre.dateDebut) dateDebutSemestre = cadre.dateDebut;
        } catch (e) { /* silencieux */ }
        if (indice === 'C' || indice === 'P') {
            try {
                const productions = obtenirDonneesSelonMode('productions') || [];
                const infoCoursGraph = db.getSync('infoCours', null);
                gcIdGraph = infoCoursGraph ? (infoCoursGraph._groupeCoursId || infoCoursGraph.id || null) : null;
                productionsFiltreesGraph = productions.filter(p => {
                    if (p.facultatif || p.type === 'portfolio') return false;
                    if (typeof obtenirEcheanceEffective === 'function') {
                        const { date, assignee } = obtenirEcheanceEffective(p, gcIdGraph);
                        return assignee && !!date && date >= dateDebutSemestre;
                    }
                    return !!p.dateEcheance && p.dateEcheance >= dateDebutSemestre;
                });
            } catch (e) { /* silencieux */ }
        }

        // Créer un dataset par étudiant
        const datasets = etudiants.map(etudiant => {
            const offsetEtudiant = genererOffset();
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

                // 🆕 Beta 98.3 : Si aucune production n'est due à la date de ce snapshot,
                // C et P doivent être null (pas de données), pas 0%.
                // Corrige les anciens snapshots qui stockaient C=0 au lieu de null.
                if ((indice === 'C' || indice === 'P') && valeur !== null) {
                    if (productionsFiltreesGraph.length === 0) {
                        // Aucune production assignée → C/P toujours null
                        valeur = null;
                    } else {
                        const dateSnapshot = snapshot.dateFin || snapshot.dateDebut || '';
                        const nbDues = productionsFiltreesGraph.filter(p => {
                            if (typeof obtenirEcheanceEffective === 'function') {
                                return obtenirEcheanceEffective(p, gcIdGraph).date <= dateSnapshot;
                            }
                            return p.dateEcheance <= dateSnapshot;
                        }).length;
                        if (nbDues === 0) {
                            valeur = null;
                        }
                    }
                }

                // Convertir en 0-1 si en pourcentage (valeurs > 1)
                if (valeur !== null && valeur !== undefined && valeur > 1) {
                    valeur = valeur / 100;
                }

                // Appliquer le décalage visuel pour séparer les courbes superposées
                if (valeur !== null && valeur !== undefined) {
                    valeur = Math.max(0, Math.min(1, valeur + offsetEtudiant));
                }

                return valeur;
            });

            // Vérifier qu'il y a au moins une valeur non-null
            if (data.every(v => v === null || v === undefined)) return null;

            // ✨ #240: Couleur de l'indice à 40% par défaut
            var couleurIndice = couleursIndices[indice] || COULEURS_INDICES.P;
            return {
                label: etudiant.nomAffiche,
                data: data,
                da: etudiant.da,
                indice: indice,
                borderColor: hexVersRgba(couleurIndice, 0.4),
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: hexVersRgba(couleurIndice, 0.4),
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            };
        }).filter(d => d !== null);

        if (datasets.length === 0) {
            afficherMessageAttente(canvas, 'Aucune donnée', 'Pas de données pour cet indice.');
            return null;
        }

        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        // Vérifier que le canvas est visible (Chart.js échoue sur display:none)
        // offsetParent === null quand un parent a display:none
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Calculer les bornes Y dynamiques
        const bornesY = calculerBornesYDynamiques(datasets);

        // Configuration
        const config = {
            type: 'line',
            // 🆕 BETA 96: Utiliser le plugin gradient au lieu des annotations
            plugins: [pluginGradientFond, ...(indice === 'P' ? [pluginEtiquettesZones] : []), pluginNomEtudiantSurvolACP],
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
                        display: false  // 🆕 BETA 96: Titre dans l'en-tête de section
                    },
                    legend: { display: false },
                    tooltip: {
                        ...STYLE_TOOLTIP,
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
                    }
                },
                scales: {
                    x: {
                        grid: { display: true, color: couleurGrille() },
                        ticks: {
                            color: couleurTexte(),
                            font: { size: 10 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        min: bornesY.min,
                        max: bornesY.max,
                        grid: { display: true, color: couleurGrille() },
                        ticks: {
                            color: couleurTexte(),
                            callback: value => (value * 100).toFixed(0) + '%',
                            stepSize: 0.05
                        },
                        title: {
                            display: true,
                            text: nomsIndices[indice],
                            color: couleurTexte(),
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

                    var couleurIndice = couleursIndices[indice] || COULEURS_INDICES.P;
                    chart.data.datasets.forEach((dataset, idx) => {
                        if (datasetActif === -1) {
                            appliquerStyleSpaghetti(dataset, 'defaut', couleurIndice);
                        } else if (idx === datasetActif) {
                            appliquerStyleSpaghetti(dataset, 'actif', couleurIndice);
                            // Agrandir le point survolé
                            if (dataIndex >= 0 && dataIndex < dataset.data.length && dataset.data[dataIndex] !== null) {
                                dataset.pointRadius[dataIndex] = 8;
                            }
                        } else {
                            appliquerStyleSpaghetti(dataset, 'inactif', couleurIndice);
                            dataset.pointHoverRadius = datasetVerrouilleACP >= 0 ? 2 : STYLE_POINT_RAYON_HOVER;
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
                }
            }
        };

        const chart = new Chart(ctx, config);
        graphiqueSpaghettiACPInstance = chart;

        canvas.addEventListener('mouseleave', function() {
            var couleurIndice = couleursIndices[indice] || COULEURS_INDICES.P;
            if (datasetVerrouilleACP >= 0) {
                dernierDatasetSurvoleACP = datasetVerrouilleACP;
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === datasetVerrouilleACP) {
                        appliquerStyleSpaghetti(dataset, 'actif', couleurIndice);
                    } else {
                        appliquerStyleSpaghetti(dataset, 'inactif', couleurIndice);
                        dataset.pointHoverRadius = 2;
                    }
                });
            } else {
                dernierDatasetSurvoleACP = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleSpaghetti(dataset, 'defaut', couleurIndice);
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        });

        function toggleVerrouillageSpaghetti(indexDataset) {
            const selecteur = document.getElementById('selecteur-etudiant-acp');
            var couleurIndice = couleursIndices[indice] || COULEURS_INDICES.P;

            if (datasetVerrouilleACP === indexDataset) {
                // Déverrouiller
                datasetVerrouilleACP = -1;
                dernierDatasetSurvoleACP = -1;
                console.log('🔓 Courbe ACP déverrouillée');
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleSpaghetti(dataset, 'defaut', couleurIndice);
                });
                if (selecteur) selecteur.value = '';
            } else {
                // Verrouiller
                datasetVerrouilleACP = indexDataset;
                dernierDatasetSurvoleACP = indexDataset;
                console.log(`🔒 Courbe ACP verrouillée: ${chart.data.datasets[indexDataset]?.label}`);
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === indexDataset) {
                        appliquerStyleSpaghetti(dataset, 'actif', couleurIndice);
                    } else {
                        appliquerStyleSpaghetti(dataset, 'inactif', couleurIndice);
                        dataset.pointHoverRadius = 2;
                    }
                });
                if (selecteur) selecteur.value = indexDataset;
            }
            if (chartEstValide(chart)) chart.update('none');
        }

        // Gestionnaire de clic
        // NOTE: Chart.js utilise des coordonnées CSS en interne, pas des pixels canvas
        // Les zones du plugin sont donc en CSS, on utilise les coordonnées CSS du clic
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // Vérifier clic sur nom (coordonnées CSS)
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
            // Garde : si le chart est détruit (navigation SPA), ne rien faire
            if (!chart || !chart.canvas) return;

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
                try {
                    const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                    surElement = elements.length > 0;
                } catch (e) {
                    // Chart.js peut échouer si le canvas est détaché du DOM
                    return;
                }
            }

            canvas.style.cursor = surElement ? 'pointer' : 'default';
        });

        // Peupler le dropdown des étudiants
        const selecteurEtudiant = document.getElementById('selecteur-etudiant-acp');
        if (selecteurEtudiant) {
            selecteurEtudiant.innerHTML = '<option value="">-- Sélectionner --</option>';
            datasets.forEach((dataset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = dataset.label;
                selecteurEtudiant.appendChild(option);
            });
        }

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

/**
 * Sélectionne un étudiant dans le graphique ACP via le dropdown
 */
function selectionnerEtudiantACP() {
    const selecteur = document.getElementById('selecteur-etudiant-acp');
    if (!selecteur || !graphiqueSpaghettiACPInstance) return;

    const indexStr = selecteur.value;
    // Déterminer l'indice ACP actif via le sélecteur
    const selecteurIndice = document.getElementById('selecteur-indice-acp');
    const indiceActif = selecteurIndice ? selecteurIndice.value : 'A';
    const couleursIndicesLocal = { 'A': '#1976D2', 'C': '#FF6B35', 'P': '#4CAF50' };
    var couleurIndice = couleursIndicesLocal[indiceActif] || COULEURS_INDICES.P;

    if (indexStr === '') {
        if (datasetVerrouilleACP >= 0) {
            datasetVerrouilleACP = -1;
            dernierDatasetSurvoleACP = -1;
            graphiqueSpaghettiACPInstance.data.datasets.forEach(dataset => {
                appliquerStyleSpaghetti(dataset, 'defaut', couleurIndice);
            });
            graphiqueSpaghettiACPInstance.update('none');
        }
        return;
    }

    const index = parseInt(indexStr);
    datasetVerrouilleACP = index;
    dernierDatasetSurvoleACP = index;

    const chart = graphiqueSpaghettiACPInstance;
    chart.data.datasets.forEach((dataset, idx) => {
        if (idx === index) {
            appliquerStyleSpaghetti(dataset, 'actif', couleurIndice);
        } else {
            appliquerStyleSpaghetti(dataset, 'inactif', couleurIndice);
            dataset.pointHoverRadius = 2;
        }
    });
    if (chartEstValide(chart)) chart.update('none');
    console.log(`🔒 Étudiant sélectionné (dropdown): ${chart.data.datasets[index]?.label}`);
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
 * ✨ #240: Plugin unifié — lignes pointillées aux seuils IDME + étiquettes colorées
 * Dessine des lignes horizontales aux frontières de zones et les noms dans la marge droite.
 * Fonctionne avec l'échelle 0-1 (genererZonesDepuisEchelle).
 */
const pluginEtiquettesZones = {
    id: 'etiquettesZones',
    beforeDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const yScale = chart.scales.y;

        if (!chartArea || !yScale) return;

        const zonesUtilisateur = genererZonesDepuisEchelle();
        const estModeClair = document.body.classList.contains('mode-clair');
        const yMinVisible = yScale.min;
        const yMaxVisible = yScale.max;

        ctx.save();

        // 1. Lignes pointillées aux frontières entre zones
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;

        zonesUtilisateur.forEach(zone => {
            // Dessiner la ligne de la borne inférieure de chaque zone (sauf la première)
            if (zone.yMin <= yMinVisible || zone.yMin >= yMaxVisible) return;
            var yPx = yScale.getPixelForValue(zone.yMin);
            if (yPx < chartArea.top || yPx > chartArea.bottom) return;

            // Extraire la couleur hex depuis borderColor (format rgba ou hex)
            var couleurLigne = zone.borderColor || (estModeClair ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)');
            ctx.strokeStyle = couleurLigne;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPx);
            ctx.lineTo(chartArea.right, yPx);
            ctx.stroke();
        });

        ctx.setLineDash([]);

        // 2. Étiquettes colorées dans la marge droite
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        var xLabel = chartArea.right + 8;

        zonesUtilisateur.forEach(zone => {
            if (zone.yMax <= yMinVisible || zone.yMin >= yMaxVisible) return;

            var zoneMinVis = Math.max(zone.yMin, yMinVisible);
            var zoneMaxVis = Math.min(zone.yMax, yMaxVisible);
            var yCenterVis = (zoneMinVis + zoneMaxVis) / 2;
            var yPx = yScale.getPixelForValue(yCenterVis);

            if (yPx < chartArea.top || yPx > chartArea.bottom) return;

            // Utiliser la couleur de la zone (extraire du borderColor)
            var couleurLabel = zone.borderColor || couleurTexte();
            ctx.fillStyle = couleurLabel;
            // Code court (I, D, M, E) ou label tronqué
            var texte = zone.code || zone.label.charAt(0);
            ctx.fillText(texte, xLabel, yPx);
        });

        ctx.restore();
    }
};

/**
 * Plugin gradient désactivé — fond neutre, les seuils sont indiqués par pluginEtiquettesZones
 */
const pluginGradientFond100 = { id: 'gradientFond100' };

/**
 * ✨ #240: Plugin — lignes + étiquettes (version 0-100%)
 * Utilise genererZonesDepuisEchelle() (0-1) converti en 0-100.
 */
const pluginEtiquettesZones100 = {
    id: 'etiquettesZones100',
    beforeDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const yScale = chart.scales.y;

        if (!chartArea || !yScale) return;

        const estModeClair = document.body.classList.contains('mode-clair');
        const yMinVisible = yScale.min;
        const yMaxVisible = yScale.max;

        // Convertir les zones utilisateur (0-1) en échelle 0-100
        const zonesUtilisateur = genererZonesDepuisEchelle();
        const zones = zonesUtilisateur.map(zone => ({
            yMin: zone.yMin * 100,
            yMax: zone.yMax * 100,
            label: zone.label,
            code: zone.code || zone.label.charAt(0),
            borderColor: zone.borderColor
        }));

        ctx.save();

        // 1. Lignes pointillées aux frontières
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;

        zones.forEach(zone => {
            if (zone.yMin <= yMinVisible || zone.yMin >= yMaxVisible) return;
            var yPx = yScale.getPixelForValue(zone.yMin);
            if (yPx < chartArea.top || yPx > chartArea.bottom) return;

            ctx.strokeStyle = zone.borderColor || (estModeClair ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)');
            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPx);
            ctx.lineTo(chartArea.right, yPx);
            ctx.stroke();
        });

        ctx.setLineDash([]);

        // 2. Étiquettes colorées dans la marge droite
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        var xLabel = chartArea.right + 8;

        zones.forEach(zone => {
            if (zone.yMax <= yMinVisible || zone.yMin >= yMaxVisible) return;

            var zoneMinVis = Math.max(zone.yMin, yMinVisible);
            var zoneMaxVis = Math.min(zone.yMax, yMaxVisible);
            var yCenterVis = (zoneMinVis + zoneMaxVis) / 2;
            var yPx = yScale.getPixelForValue(yCenterVis);

            if (yPx < chartArea.top || yPx > chartArea.bottom) return;

            ctx.fillStyle = zone.borderColor || couleurTexte();
            ctx.fillText(zone.code, xLabel, yPx);
        });

        ctx.restore();
    }
};

/**
 * Variables pour le graphique des critères
 */
let dernierDatasetSurvoleCriteresGlobal = -1;
let datasetVerrouilleCriteresGlobal = -1;
let zonesCriteres = [];

/**
 * Plugin pour afficher le nom du critère au bout de la courbe survolée
 */
const pluginNomCritereSurvol = {
    id: 'nomCritereSurvol',
    afterDraw(chart) {
        // Utiliser le dataset verrouillé ou survolé
        const datasetIndex = datasetVerrouilleCriteresGlobal >= 0 ? datasetVerrouilleCriteresGlobal : dernierDatasetSurvoleCriteresGlobal;
        if (datasetIndex === -1) {
            zonesCriteres = [];
            return;
        }

        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const dataset = chart.data.datasets[datasetIndex];
        if (!dataset) return;

        const meta = chart.getDatasetMeta(datasetIndex);
        if (!meta || !meta.data || meta.data.length === 0) return;

        // Trouver le dernier point visible
        let dernierPoint = null;
        let dernierIndex = -1;
        for (let i = meta.data.length - 1; i >= 0; i--) {
            const point = meta.data[i];
            if (point && dataset.data[i] !== null && dataset.data[i] !== undefined) {
                dernierPoint = point;
                dernierIndex = i;
                break;
            }
        }

        if (!dernierPoint) return;

        // Couleur du critère
        const couleur = dataset.borderColor;
        const nomCritere = dataset.label;

        ctx.save();
        ctx.font = 'bold 12px Arial';

        const textWidth = ctx.measureText(nomCritere).width;
        const marge = 10;

        // Vérifier si le texte peut tenir à droite du point
        let x, textAlign;
        if (dernierPoint.x + marge + textWidth <= chartArea.right) {
            // Assez de place à droite
            x = dernierPoint.x + marge;
            textAlign = 'left';
        } else {
            // Pas assez de place : afficher à gauche du point
            x = dernierPoint.x - marge;
            textAlign = 'right';
        }

        // Position Y : légèrement au-dessus du point pour éviter le chevauchement
        let y = dernierPoint.y - 15;
        // S'assurer que le texte reste dans la zone du graphique
        if (y < chartArea.top + 10) {
            y = dernierPoint.y + 15; // Mettre en dessous si trop haut
        }

        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = couleur;
        ctx.fillText(nomCritere, x, y);

        // Stocker la zone cliquable
        const xZone = textAlign === 'left' ? x : x - textWidth;
        zonesCriteres = [{
            x: xZone,
            y: y - 10,
            width: textWidth,
            height: 20,
            datasetIndex: datasetIndex
        }];

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

    var couleurP = COULEURS_INDICES.P;
    chart.data.datasets.forEach((dataset, index) => {
        if (datasetIndex === -1) {
            appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
        } else if (index === datasetIndex) {
            appliquerStyleSpaghetti(dataset, 'actif', couleurP);
        } else {
            appliquerStyleSpaghetti(dataset, 'inactif', couleurP);
        }
    });

    if (chartEstValide(chart)) chart.update('none'); // Update sans animation pour fluidité
}

/**
 * Réinitialise les styles du graphique spaghetti (au mouseout)
 * @param {Chart} chart - Instance du graphique
 */
function reinitialiserStylesSpaghetti(chart) {
    if (!chart || !chart.data || !chart.data.datasets) return;

    dernierDatasetSurvole = -1;

    var couleurP = COULEURS_INDICES.P;
    chart.data.datasets.forEach(dataset => {
        appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
    });

    if (chartEstValide(chart)) chart.update('none');
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
            const cleProductions = cle('productions');
            productions = db.getSync(cleProductions, []);
        }

        // Récupérer aussi productionsPedagogiques pour les descriptions mises à jour
        let productionsPedago = [];
        if (typeof obtenirDonneesSelonMode === 'function') {
            productionsPedago = obtenirDonneesSelonMode('productions') || [];
        } else {
            const clePedago = cle('productions');
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
            afficherMessageAttente(canvas, 'Aucun artefact défini', 'Crée des productions dans Réglages › Productions');
            return null;
        }

        // Récupérer les évaluations
        let evaluationsBrutes = [];

        if (typeof obtenirDonneesSelonMode === 'function') {
            evaluationsBrutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        } else {
            const cleEvaluations = cle('evaluationsSauvegardees');
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

        // Récupérer la liste des étudiants du groupe actif
        let etudiants = [];
        if (typeof obtenirEtudiantsCoursActif === 'function') {
            etudiants = obtenirEtudiantsCoursActif();
        } else if (typeof obtenirDonneesSelonMode === 'function') {
            etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        } else {
            const cleEtudiants = cle('groupeEtudiants');
            etudiants = db.getSync(cleEtudiants, []);
        }

        console.log(`📊 [Spaghetti] Étudiants trouvés: ${etudiants.length}`);

        if (etudiants.length === 0) {
            console.warn('Aucun étudiant disponible');
            afficherMessageAttente(canvas, 'Aucun étudiant', 'Ajoute des étudiants dans Réglages › Groupe');
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

                // Vérifier si le travail a été reçu
                if (evaluation.statutRemise === 'non-remis' || evaluation.statutRemise === 'retard') {
                    return null; // Trou pour travail non reçu
                }

                // Utiliser noteFinale (0-100) converti en 0-1
                const note = evaluation.noteFinale;
                if (note === null || note === undefined) return null;

                // Convertir en décimal (0-1) pour cohérence avec les zones IDME
                return note / 100;
            });

            // Vérifier si l'étudiant a au moins une évaluation
            const aDonnees = donnees.some(v => v !== null);

            // 🆕 BETA 96 (FIX): Obtenir le nom en respectant le mode anonymisation
            // Si anonymiserNom retourne une valeur, on est en mode anonymisation
            const nomAnonyme = typeof anonymiserNom === 'function' ? anonymiserNom(da) : null;
            const nom = nomAnonyme
                ? nomAnonyme
                : (etudiant.prenom && etudiant.nom
                    ? `${etudiant.prenom} ${etudiant.nom}`
                    : etudiant.nom || `DA ${da}`);

            // 🆕 BETA 98.9: Inclure les élèves sans données dans le dropdown
            // Ils apparaissent avec un message au lieu d'une trajectoire
            if (!aDonnees) {
                return {
                    label: nom,
                    da: da,
                    data: donnees,
                    sansDonnees: true,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    hidden: true // Masquer par défaut dans le graphique
                };
            }

            // ✨ #240: Couleur P à 40% par défaut
            return {
                label: nom,
                da: da,
                data: donnees,
                borderColor: hexVersRgba(COULEURS_INDICES.P, 0.4),
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: hexVersRgba(COULEURS_INDICES.P, 0.4),
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            };
        }).filter(d => d !== null);

        if (datasets.length === 0) {
            console.warn('Aucune donnée valide pour le graphique spaghetti');
            afficherMessageAttente(canvas, 'Aucune trajectoire disponible', 'Les évaluations ne correspondent pas aux productions définies.');
            return null;
        }

        // Obtenir le canvas
        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        // Vérifier que le canvas est visible (Chart.js échoue sur display:none)
        // offsetParent === null quand un parent a display:none
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Calculer les bornes Y dynamiques
        const bornesY = calculerBornesYDynamiques(datasets);

        // Configuration du graphique
        const config = {
            type: 'line',
            // 🆕 BETA 96: Utiliser le plugin gradient au lieu des annotations
            plugins: [pluginGradientFond, pluginEtiquettesZones, pluginNomEtudiantSurvol, pluginTooltipsMultiples],
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
                        display: false  // 🆕 BETA 96: Titre dans l'en-tête de section
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
                    }

                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Activités d\'apprentissage',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: couleurGrille()
                        }
                    },
                    y: {
                        min: bornesY.min,
                        max: bornesY.max,
                        title: {
                            display: true,
                            text: 'Résultat',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            callback: function(value) {
                                return value.toFixed(2).replace('.', ',');
                            },
                            stepSize: 0.05,
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: couleurGrille()
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

                    var couleurP = COULEURS_INDICES.P;
                    chart.data.datasets.forEach((dataset, idx) => {
                        var nbPoints = dataset.data.length;

                        if (datasetActif === -1) {
                            appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
                        } else if (idx === datasetActif) {
                            appliquerStyleSpaghetti(dataset, 'actif', couleurP);

                            if (datasetVerrouille < 0) {
                                // Mettre en évidence TOUS les points de même activité (orange)
                                if (indicesMemesActivites.length > 1) {
                                    indicesMemesActivites.forEach(i => {
                                        if (i >= 0 && i < nbPoints && dataset.data[i] !== null) {
                                            dataset.pointRadius[i] = 8;
                                            dataset.pointBackgroundColor[i] = '#FF9800';
                                        }
                                    });
                                }
                                // Le point directement survolé est plus gros
                                if (dataIndex >= 0 && dataIndex < nbPoints && dataset.data[dataIndex] !== null) {
                                    dataset.pointRadius[dataIndex] = 10;
                                }
                            }
                        } else {
                            appliquerStyleSpaghetti(dataset, 'inactif', couleurP);
                            dataset.pointHoverRadius = datasetVerrouille >= 0 ? 2 : STYLE_POINT_RAYON_HOVER;
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
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
            var couleurP = COULEURS_INDICES.P;
            if (datasetVerrouille >= 0) {
                dernierDatasetSurvole = datasetVerrouille;
                dernierPointSurvole = -1;
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === datasetVerrouille) {
                        appliquerStyleSpaghetti(dataset, 'actif', couleurP);
                    } else {
                        appliquerStyleSpaghetti(dataset, 'inactif', couleurP);
                        dataset.pointHoverRadius = 2;
                    }
                });
            } else {
                dernierDatasetSurvole = -1;
                dernierPointSurvole = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        });

        function toggleVerrouillage(indexDataset) {
            const selecteur = document.getElementById('selecteur-etudiant-spaghetti');
            var couleurP = COULEURS_INDICES.P;

            if (datasetVerrouille === indexDataset) {
                // Déverrouiller
                datasetVerrouille = -1;
                dernierDatasetSurvole = -1;
                dernierPointSurvole = -1;
                console.log('🔓 Courbe déverrouillée');
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
                });
                if (selecteur) selecteur.value = '';
            } else {
                // Verrouiller
                datasetVerrouille = indexDataset;
                dernierDatasetSurvole = indexDataset;
                console.log(`🔒 Courbe verrouillée: ${chart.data.datasets[indexDataset]?.label}`);
                chart.data.datasets.forEach((dataset, idx) => {
                    if (idx === indexDataset) {
                        appliquerStyleSpaghetti(dataset, 'actif', couleurP);
                    } else {
                        appliquerStyleSpaghetti(dataset, 'inactif', couleurP);
                        dataset.pointHoverRadius = 2;
                    }
                });
                if (selecteur) selecteur.value = indexDataset;
            }
            if (chartEstValide(chart)) chart.update('none');
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
            if (!canvas.isConnected) return;

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

        // Peupler le dropdown des étudiants
        const selecteurEtudiant = document.getElementById('selecteur-etudiant-spaghetti');
        if (selecteurEtudiant) {
            selecteurEtudiant.innerHTML = '<option value="">-- Sélectionner --</option>';
            datasets.forEach((dataset, index) => {
                const option = document.createElement('option');
                option.value = index;
                // 🆕 BETA 98.9: Marquer les élèves sans données dans le dropdown
                option.textContent = dataset.sansDonnees
                    ? `${dataset.label} (aucune évaluation)`
                    : dataset.label;
                selecteurEtudiant.appendChild(option);
            });
        }

        console.log(`✅ Graphique spaghetti créé avec ${datasets.length} trajectoires sur ${productionsArtefacts.length} artefacts`);
        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique spaghetti:', error);
        return null;
    }
}

/**
 * Sélectionne un étudiant dans le graphique spaghetti productions via le dropdown
 */
// 🆕 BETA 96: Verrouillé = noir
function selectionnerEtudiantSpaghetti() {
    const selecteur = document.getElementById('selecteur-etudiant-spaghetti');
    if (!selecteur || !graphiqueSpaghettiInstance) return;

    const indexStr = selecteur.value;
    var couleurP = COULEURS_INDICES.P;
    if (indexStr === '') {
        if (datasetVerrouille >= 0) {
            datasetVerrouille = -1;
            dernierDatasetSurvole = -1;
            dernierPointSurvole = -1;
            graphiqueSpaghettiInstance.data.datasets.forEach(dataset => {
                appliquerStyleSpaghetti(dataset, 'defaut', couleurP);
            });
            graphiqueSpaghettiInstance.update('none');
        }
        return;
    }

    const index = parseInt(indexStr);

    const chart = graphiqueSpaghettiInstance;

    // 🆕 BETA 98.9: Gérer les élèves sans données
    const datasetSelectionne = chart.data.datasets[index];
    const messageSansDonnees = document.getElementById('message-spaghetti-sans-donnees');
    if (messageSansDonnees) messageSansDonnees.remove();

    if (datasetSelectionne && datasetSelectionne.sansDonnees) {
        // Afficher un message au-dessus du canvas
        const canvas = document.getElementById('graphique-groupe-spaghetti');
        if (canvas && canvas.parentNode) {
            const msg = document.createElement('div');
            msg.id = 'message-spaghetti-sans-donnees';
            msg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 20; background: rgba(0,0,0,0.75); color: #ccc; padding: 12px 20px; border-radius: 8px; text-align: center; font-size: 0.9rem; pointer-events: none;';
            msg.textContent = 'Aucun artefact évalué — aucune trajectoire à tracer';
            canvas.parentNode.style.position = 'relative';
            canvas.parentNode.appendChild(msg);
        }
        datasetVerrouille = -1;
        return;
    }

    datasetVerrouille = index;
    dernierDatasetSurvole = index;

    chart.data.datasets.forEach((dataset, idx) => {
        if (idx === index) {
            appliquerStyleSpaghetti(dataset, 'actif', couleurP);
        } else {
            appliquerStyleSpaghetti(dataset, 'inactif', couleurP);
            dataset.pointHoverRadius = 2;
        }
    });
    if (chartEstValide(chart)) chart.update('none');
    console.log(`🔒 Étudiant sélectionné (dropdown): ${chart.data.datasets[index]?.label}`);
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
    ctx.fillStyle = '#8aa4b0';
    ctx.textAlign = 'center';
    ctx.fillText(titre, canvas.width / 2, canvas.height / 2 - 10);

    if (details) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#5a7a88';
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

/**
 * Plugin gradient désactivé — fond neutre, les seuils sont indiqués par pluginEtiquettesZones
 */
const pluginGradientFond = { id: 'gradientFond' };

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

        // Stocker les couleurs originales pour le survol
        const couleursOriginales = {};

        // Créer les datasets - courbes noires par défaut (comme spaghetti)
        const datasets = donnees.criteresUniques.map((critere, index) => {
            const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];
            couleursOriginales[critere] = couleur;

            // ✨ #240: Courbe colorée par défaut
            return {
                label: critere,
                data: donnees.criteres[critere],
                borderColor: couleur,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: couleur,
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            };
        });

        // Réinitialiser les variables globales pour le plugin
        dernierDatasetSurvoleCriteresGlobal = -1;
        datasetVerrouilleCriteresGlobal = -1;

        // Obtenir le canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }
        const ctx = canvas.getContext('2d');

        // Calculer les bornes Y dynamiques (échelle 0-100)
        const bornesY = calculerBornesYDynamiques100(datasets);

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginGradientFond100, pluginEtiquettesZones100, pluginNomCritereSurvol],
            data: {
                labels: donnees.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { right: 25 }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Développement des habiletés et compétences',
                        font: { size: 16, weight: 'bold' },
                        color: couleurTexte(),
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        ...STYLE_TOOLTIP,
                        mode: 'nearest',
                        intersect: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: function(context) {
                                const critere = context.dataset.label;
                                const valeur = context.parsed.y;
                                return valeur !== null ? `${critere}: ${valeur.toFixed(0)}%` : `${critere}: —`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Activités d\'apprentissage',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 10 }
                        },
                        grid: { display: true, color: couleurGrille() }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Performance',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        min: bornesY.min,
                        max: bornesY.max,
                        ticks: {
                            color: couleurTexte(),
                            stepSize: 5,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { display: true, color: couleurGrille() }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                onHover: function(event, activeElements, chart) {
                    let datasetIndex = -1;

                    if (activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                    }

                    const datasetActif = datasetVerrouilleCriteresGlobal >= 0 ? datasetVerrouilleCriteresGlobal : datasetIndex;

                    if (datasetActif === dernierDatasetSurvoleCriteresGlobal && datasetVerrouilleCriteresGlobal < 0) return;
                    dernierDatasetSurvoleCriteresGlobal = datasetActif;

                    chart.data.datasets.forEach((dataset, idx) => {
                        const couleurOriginale = couleursOriginales[dataset.label];
                        if (datasetActif === -1) {
                            appliquerStyleDataset(dataset, 'defaut', couleurOriginale);
                        } else if (idx === datasetActif) {
                            appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                        } else {
                            appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        function toggleVerrouillage(indexDataset) {
            if (datasetVerrouilleCriteresGlobal === indexDataset) {
                // Déverrouiller
                datasetVerrouilleCriteresGlobal = -1;
                dernierDatasetSurvoleCriteresGlobal = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleDataset(dataset, 'defaut', couleursOriginales[dataset.label]);
                });
            } else {
                // Verrouiller
                datasetVerrouilleCriteresGlobal = indexDataset;
                dernierDatasetSurvoleCriteresGlobal = indexDataset;
                chart.data.datasets.forEach((dataset, idx) => {
                    const couleurOriginale = couleursOriginales[dataset.label];
                    if (idx === indexDataset) {
                        appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                    } else {
                        appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                    }
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        }

        // Verrouillage au clic (sur nom ou point)
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            // Appliquer le ratio de scale pour correspondre aux coordonnées du canvas
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;

            // 1. Vérifier clic sur un nom de critère
            for (const zone of zonesCriteres) {
                if (clickX >= zone.x && clickX <= zone.x + zone.width &&
                    clickY >= zone.y && clickY <= zone.y + zone.height) {
                    toggleVerrouillage(zone.datasetIndex);
                    return;
                }
            }

            // 2. Vérifier clic sur un point de la courbe
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length > 0) {
                toggleVerrouillage(elements[0].datasetIndex);
                return;
            }

            // 3. Clic ailleurs - déverrouiller si verrouillé
            if (datasetVerrouilleCriteresGlobal >= 0) {
                toggleVerrouillage(datasetVerrouilleCriteresGlobal);
            }
        });

        canvas.addEventListener('mouseleave', function() {
            if (datasetVerrouilleCriteresGlobal >= 0) {
                dernierDatasetSurvoleCriteresGlobal = datasetVerrouilleCriteresGlobal;
                chart.data.datasets.forEach((dataset, idx) => {
                    const couleurOriginale = couleursOriginales[dataset.label];
                    if (idx === datasetVerrouilleCriteresGlobal) {
                        appliquerStyleDataset(dataset, 'actif', couleurOriginale);
                    } else {
                        appliquerStyleDataset(dataset, 'inactif', couleurOriginale);
                    }
                });
            } else {
                dernierDatasetSurvoleCriteresGlobal = -1;
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleDataset(dataset, 'defaut', couleursOriginales[dataset.label]);
                });
            }
            if (chartEstValide(chart)) chart.update('none');
        });

        // Changer le curseur au survol des noms ou des points
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            // Appliquer le ratio de scale pour correspondre aux coordonnées du canvas
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

            let surElement = false;
            for (const zone of zonesCriteres) {
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

        console.log(`✅ Graphique critères créé avec ${donnees.criteresUniques.length} critères`);
        return chart;

    } catch (error) {
        console.error('[creerGraphiqueCriteres] Erreur:', error);
        return null;
    }
}

/* ===============================
   GRAPHIQUE DISTRIBUTION ACPE (Beta 96)
   Courbes de Gauss avec moyenne et écarts-types
   =============================== */

/**
 * Calcule les statistiques (moyenne et écart-type) d'un tableau de valeurs
 * @param {Array} valeurs - Tableau de valeurs numériques
 * @returns {Object} - { moyenne, ecartType, n }
 */
function calculerStatistiques(valeurs) {
    if (!valeurs || valeurs.length < 2) {
        return { moyenne: null, ecartType: null, n: 0 };
    }

    const n = valeurs.length;
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / n;
    const variance = valeurs.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / n;
    const ecartType = Math.sqrt(variance);

    return { moyenne, ecartType: ecartType > 0 ? ecartType : 0.01, n };
}

/**
 * Génère les points d'une courbe de Gauss (distribution normale)
 * @param {number} moyenne - Moyenne (μ)
 * @param {number} ecartType - Écart-type (σ)
 * @returns {Array} - Points {x, y} pour tracer la courbe
 */
function genererCourbeGauss(moyenne, ecartType) {
    if (moyenne === null || ecartType === null) return [];

    const points = [];
    // Générer de 0 à 1 (ou étendre si nécessaire)
    for (let x = 0; x <= 1.001; x += 0.005) {
        // Formule de la distribution normale
        const y = (1 / (ecartType * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((x - moyenne) / ecartType, 2));
        points.push({ x: parseFloat(x.toFixed(3)), y: y });
    }

    return points;
}

/**
 * Crée un dataset Chart.js pour une courbe de Gauss
 * @param {string} label - Nom de la courbe
 * @param {Array} points - Points {x, y} de la courbe
 * @param {string} couleur - Couleur hex de la courbe
 * @returns {Object} - Dataset Chart.js
 */
function creerDatasetGauss(label, points, couleur) {
    if (!points || points.length === 0) {
        return { label, data: [], borderColor: couleur || 'transparent' };
    }

    // ✨ #240: Courbe colorée par défaut
    return {
        label: label,
        data: points,
        borderColor: couleur,
        backgroundColor: hexVersRgba(couleur, 0.1),
        couleurOriginale: couleur,
        borderWidth: STYLE_LIGNE_EPAISSEUR,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 0,
        parsing: {
            xAxisKey: 'x',
            yAxisKey: 'y'
        }
    };
}

/**
 * Compte le nombre de valeurs dans une plage donnée
 * @param {Array} valeurs - Tableau de valeurs
 * @param {number} min - Borne inférieure
 * @param {number} max - Borne supérieure
 * @returns {number} - Nombre de valeurs dans la plage
 */
function compterValeursEntre(valeurs, min, max) {
    return valeurs.filter(v => v >= min && v <= max).length;
}

/**
 * Crée un dataset de points pour afficher les étudiants sur l'axe X
 * Les points sont positionnés à y=0 (sur l'axe X) avec un léger jitter horizontal
 * @param {string} label - Label du dataset (A, C, P ou E)
 * @param {Array} valeurs - Valeurs des étudiants
 * @param {string} couleur - Couleur hex
 * @returns {Object} - Dataset Chart.js
 */
function creerDatasetPoints(label, valeurs, couleur) {
    if (!valeurs || valeurs.length === 0) {
        return { label, data: [], borderColor: couleur };
    }

    // Créer les points sur l'axe X (y=0) avec léger jitter horizontal pour éviter superposition
    const points = valeurs.map((v, i) => ({
        x: v + (Math.random() - 0.5) * 0.01, // Léger jitter horizontal
        y: 0 // Sur l'axe X
    }));

    // ✨ #240: Point coloré avec bordure thème-aware
    return {
        label: label + ' (étudiants)',
        data: points,
        borderColor: couleurBordurePoint(),
        backgroundColor: couleur,
        pointRadius: STYLE_POINT_RAYON,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: couleur,
        pointHoverBorderColor: couleurBordurePoint(),
        pointBorderWidth: STYLE_POINT_BORDURE,
        pointStyle: 'circle',
        showLine: false,
        parsing: { xAxisKey: 'x', yAxisKey: 'y' },
        order: 0
    };
}

/**
 * Crée un graphique de distribution normale (Gauss) des indices ACPE
 * Affiche les courbes avec moyenne (μ) au centre et écarts-types (σ) marqués
 * Inclut les points individuels des étudiants et le comptage par zone σ
 * @param {string} canvasId - ID du canvas HTML
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueDistributionACPE(canvasId) {
    try {
        console.log('📊 [Distribution ACPE] Création du graphique...');

        // Détruire le graphique existant si présent
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.parentNode || !canvas.ownerDocument) {
            console.error(`Canvas ${canvasId} introuvable ou détaché du DOM`);
            return null;
        }
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn(`Canvas ${canvasId} non visible (parent display:none) — graphique différé`);
            return null;
        }

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');

        // Récupérer les étudiants actifs
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : (typeof obtenirDonneesSelonMode === 'function'
                ? obtenirDonneesSelonMode('groupeEtudiants')
                : []) || [];

        const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

        if (etudiantsActifs.length === 0) {
            console.warn('[Distribution ACPE] Aucun étudiant actif');
            return null;
        }

        // Collecter les valeurs ACPE pour chaque étudiant
        const indicesAssiduite = typeof obtenirDonneesSelonMode === 'function'
            ? obtenirDonneesSelonMode('indicesAssiduite') || {}
            : {};

        const valeursA = [];
        const valeursC = [];
        const valeursP = [];
        const valeursE = [];

        etudiantsActifs.forEach(e => {
            // Indice A (Assiduité)
            const assiduiteSom = indicesAssiduite.sommatif?.[e.da];
            const A = typeof assiduiteSom === 'object'
                ? assiduiteSom.indice
                : (typeof assiduiteSom === 'number' ? assiduiteSom : null);

            if (A !== null && A > 0) {
                valeursA.push(A);
            }

            // Indices C, P, E
            if (typeof obtenirIndicesCP === 'function') {
                const indicesCP = obtenirIndicesCP(e.da);
                if (indicesCP) {
                    if (indicesCP.C !== undefined && indicesCP.C > 0) {
                        valeursC.push(indicesCP.C / 100);
                    }
                    if (indicesCP.P !== undefined && indicesCP.P > 0) {
                        valeursP.push(indicesCP.P / 100);
                    }
                    if (indicesCP.E !== undefined && indicesCP.E > 0) {
                        valeursE.push(indicesCP.E);
                    }
                }
            }
        });

        console.log(`📊 [Distribution ACPE] Valeurs collectées: A=${valeursA.length}, C=${valeursC.length}, P=${valeursP.length}, E=${valeursE.length}`);

        // Calculer les statistiques pour chaque indice
        const statsA = calculerStatistiques(valeursA);
        const statsC = calculerStatistiques(valeursC);
        const statsP = calculerStatistiques(valeursP);
        const statsE = calculerStatistiques(valeursE);

        // Stocker toutes les stats et valeurs pour le plugin
        const statistiques = {
            A: { ...statsA, valeurs: valeursA },
            C: { ...statsC, valeurs: valeursC },
            P: { ...statsP, valeurs: valeursP },
            E: { ...statsE, valeurs: valeursE }
        };

        console.log(`📊 [Distribution ACPE] Stats: A(μ=${(statsA.moyenne*100).toFixed(1)}%, σ=${(statsA.ecartType*100).toFixed(1)}%), C(μ=${(statsC.moyenne*100).toFixed(1)}%, σ=${(statsC.ecartType*100).toFixed(1)}%)`);

        // Générer les courbes de Gauss
        const courbeA = genererCourbeGauss(statsA.moyenne, statsA.ecartType);
        const courbeC = genererCourbeGauss(statsC.moyenne, statsC.ecartType);
        const courbeP = genererCourbeGauss(statsP.moyenne, statsP.ecartType);
        const courbeE = genererCourbeGauss(statsE.moyenne, statsE.ecartType);

        // Créer les datasets des courbes
        const datasetsCourbes = [
            creerDatasetGauss('Assiduité (A)', courbeA, COULEURS_INDICES.A),
            creerDatasetGauss('Complétion (C)', courbeC, COULEURS_INDICES.C),
            creerDatasetGauss('Performance (P)', courbeP, COULEURS_INDICES.P),
            creerDatasetGauss('Engagement (E)', courbeE, COULEURS_INDICES.E)
        ].filter(d => d.data && d.data.length > 0);

        // Créer les datasets des points (étudiants individuels sur l'axe X)
        const datasetsPoints = [
            creerDatasetPoints('A', valeursA, COULEURS_INDICES.A),
            creerDatasetPoints('C', valeursC, COULEURS_INDICES.C),
            creerDatasetPoints('P', valeursP, COULEURS_INDICES.P),
            creerDatasetPoints('E', valeursE, COULEURS_INDICES.E)
        ].filter(d => d.data && d.data.length > 0);

        // Combiner : courbes d'abord, puis points (alterner pour lier visibilité)
        // Format: [courbeA, pointsA, courbeC, pointsC, ...]
        const datasets = [];
        const indicesLabels = ['A', 'C', 'P', 'E'];
        indicesLabels.forEach(indice => {
            const courbe = datasetsCourbes.find(d => d.label.includes(`(${indice})`));
            const points = datasetsPoints.find(d => d.label.startsWith(indice));
            if (courbe) datasets.push(courbe);
            if (points) datasets.push(points);
        });

        if (datasetsCourbes.length === 0) {
            console.warn('[Distribution ACPE] Aucune donnée à afficher');
            ctx.font = '14px Arial';
            ctx.fillStyle = '#8aa4b0';
            ctx.textAlign = 'center';
            ctx.fillText('Données insuffisantes pour afficher la distribution', canvas.width / 2, canvas.height / 2);
            return null;
        }

        // Plugin pour afficher les bandes σ, lignes μ et comptages
        const pluginBandesEtLignes = {
            id: 'bandesEtLignesACPE',
            beforeDatasetsDraw(chart) {
                // Dessiner les bandes σ AVANT les courbes
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const chartArea = chart.chartArea;

                ctx.save();

                const indices = ['A', 'C', 'P', 'E'];
                const couleurs = [COULEURS_INDICES.A, COULEURS_INDICES.C, COULEURS_INDICES.P, COULEURS_INDICES.E];

                indices.forEach((indice, i) => {
                    const stats = statistiques[indice];
                    if (stats.moyenne === null) return;

                    const mu = stats.moyenne;
                    const sigma = stats.ecartType;
                    const couleur = couleurs[i];

                    // Bande μ±1σ (plus foncée)
                    const x1SigmaMin = Math.max(0, mu - sigma);
                    const x1SigmaMax = Math.min(1, mu + sigma);
                    const px1Min = xScale.getPixelForValue(x1SigmaMin);
                    const px1Max = xScale.getPixelForValue(x1SigmaMax);

                    ctx.fillStyle = hexVersRgba(couleur, 0.15);
                    ctx.fillRect(px1Min, chartArea.top, px1Max - px1Min, chartArea.bottom - chartArea.top);

                    // Bande μ±2σ (plus claire, uniquement les parties extérieures à ±1σ)
                    const x2SigmaMin = Math.max(0, mu - 2 * sigma);
                    const x2SigmaMax = Math.min(1, mu + 2 * sigma);

                    ctx.fillStyle = hexVersRgba(couleur, 0.07);
                    // Partie gauche (entre -2σ et -1σ)
                    if (x2SigmaMin < x1SigmaMin) {
                        const px2Min = xScale.getPixelForValue(x2SigmaMin);
                        ctx.fillRect(px2Min, chartArea.top, px1Min - px2Min, chartArea.bottom - chartArea.top);
                    }
                    // Partie droite (entre +1σ et +2σ)
                    if (x2SigmaMax > x1SigmaMax) {
                        const px2Max = xScale.getPixelForValue(x2SigmaMax);
                        ctx.fillRect(px1Max, chartArea.top, px2Max - px1Max, chartArea.bottom - chartArea.top);
                    }
                });

                ctx.restore();
            },
            afterDraw(chart) {
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const chartArea = chart.chartArea;

                ctx.save();

                const indices = ['A', 'C', 'P', 'E'];
                const couleurs = [COULEURS_INDICES.A, COULEURS_INDICES.C, COULEURS_INDICES.P, COULEURS_INDICES.E];

                // Dessiner les lignes μ et σ
                indices.forEach((indice, i) => {
                    const stats = statistiques[indice];
                    if (stats.moyenne === null) return;

                    const mu = stats.moyenne;
                    const sigma = stats.ecartType;
                    const couleur = couleurs[i];

                    // Ligne μ (moyenne) - trait plein
                    const xMu = xScale.getPixelForValue(mu);
                    ctx.strokeStyle = couleur;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(xMu, chartArea.top);
                    ctx.lineTo(xMu, chartArea.bottom);
                    ctx.stroke();

                    // Lignes σ (écarts-types) - traits pointillés
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);

                    // μ - σ
                    if (mu - sigma >= 0) {
                        const xSigmaMoins = xScale.getPixelForValue(mu - sigma);
                        ctx.beginPath();
                        ctx.moveTo(xSigmaMoins, chartArea.top);
                        ctx.lineTo(xSigmaMoins, chartArea.bottom);
                        ctx.stroke();
                    }

                    // μ + σ
                    if (mu + sigma <= 1) {
                        const xSigmaPlus = xScale.getPixelForValue(mu + sigma);
                        ctx.beginPath();
                        ctx.moveTo(xSigmaPlus, chartArea.top);
                        ctx.lineTo(xSigmaPlus, chartArea.bottom);
                        ctx.stroke();
                    }
                });

                ctx.setLineDash([]);

                // Afficher les légendes μ avec comptage σ en haut
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                let offsetY = 5;
                indices.forEach((indice, i) => {
                    const stats = statistiques[indice];
                    if (stats.moyenne === null) return;

                    const mu = stats.moyenne;
                    const sigma = stats.ecartType;
                    const valeurs = stats.valeurs;
                    const n = valeurs.length;
                    const xMu = xScale.getPixelForValue(mu);

                    // Compter les étudiants dans chaque zone
                    const dans1Sigma = compterValeursEntre(valeurs, mu - sigma, mu + sigma);
                    const dans2Sigma = compterValeursEntre(valeurs, mu - 2 * sigma, mu + 2 * sigma);

                    // Afficher μ et comptage au-dessus de la ligne
                    ctx.fillStyle = couleurs[i];
                    const muLabel = `μ${indice}=${(mu * 100).toFixed(0)}% | ±1σ: ${dans1Sigma}/${n} (${Math.round(dans1Sigma/n*100)}%)`;
                    ctx.fillText(muLabel, xMu, chartArea.top + offsetY);

                    offsetY += 13; // Décaler pour éviter superposition
                });

                ctx.restore();
            }
        };

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginBandesEtLignes],
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 70 } // Espace pour les labels μ avec comptage
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution des indices ACPE',
                        font: { size: 16, weight: 'bold' },
                        color: couleurTexte(),
                        padding: { top: 10, bottom: 5 }
                    },
                    subtitle: {
                        display: true,
                        text: 'Courbes de Gauss + points = position réelle des étudiants | Bandes colorées = zones ±1σ et ±2σ',
                        font: { size: 10, style: 'italic' },
                        color: hexVersRgba(couleurTexte(), 0.6),
                        padding: { bottom: 10 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 11 },
                            color: couleurTexte(),
                            filter: function(item) {
                                return !item.text.includes('(étudiants)');
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            const chart = legend.chart;
                            const index = legendItem.datasetIndex;
                            const dataset = chart.data.datasets[index];

                            // Extraire l'indice (A, C, P ou E)
                            const indiceMatch = dataset.label.match(/\(([ACPE])\)/);
                            if (!indiceMatch) return;
                            const indice = indiceMatch[1];

                            // Trouver le dataset des points associé
                            const pointsIndex = chart.data.datasets.findIndex(
                                d => d.label === `${indice} (étudiants)`
                            );

                            // Toggle visibilité de la courbe
                            const isHidden = chart.isDatasetVisible(index);
                            chart.setDatasetVisibility(index, !isHidden);

                            // Toggle visibilité des points associés
                            if (pointsIndex !== -1) {
                                chart.setDatasetVisibility(pointsIndex, !isHidden);
                            }

                            if (chartEstValide(chart)) chart.update();
                        }
                    },
                    tooltip: {
                        ...STYLE_TOOLTIP,
                        enabled: true,
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            title: function(items) {
                                if (items.length > 0) {
                                    const valeur = items[0].parsed.x;
                                    return `Valeur: ${(valeur * 100).toFixed(1)}%`;
                                }
                                return '';
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                // Si c'est un point d'étudiant
                                if (label.includes('(étudiants)')) {
                                    const indice = label.charAt(0); // A, C, P ou E
                                    const stats = statistiques[indice];
                                    const valeur = context.parsed.x;
                                    if (stats && stats.moyenne !== null) {
                                        const ecartMu = ((valeur - stats.moyenne) / stats.ecartType).toFixed(2);
                                        const position = ecartMu >= 0 ? `+${ecartMu}σ` : `${ecartMu}σ`;
                                        return [
                                            `Étudiant - Indice ${indice}`,
                                            `  Valeur: ${(valeur * 100).toFixed(1)}%`,
                                            `  Position: ${position} par rapport à μ`
                                        ];
                                    }
                                    return `Indice ${indice}: ${(valeur * 100).toFixed(1)}%`;
                                }
                                // Si c'est une courbe de Gauss
                                const indice = label.match(/\(([ACPE])\)/)?.[1];
                                const stats = statistiques[indice];
                                if (stats && stats.moyenne !== null) {
                                    const dans1Sigma = compterValeursEntre(stats.valeurs, stats.moyenne - stats.ecartType, stats.moyenne + stats.ecartType);
                                    return [
                                        label,
                                        `  μ = ${(stats.moyenne * 100).toFixed(1)}%`,
                                        `  σ = ${(stats.ecartType * 100).toFixed(1)}%`,
                                        `  n = ${stats.n} étudiants`,
                                        `  Dans ±1σ: ${dans1Sigma} (${Math.round(dans1Sigma/stats.n*100)}%)`
                                    ];
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Valeur de l\'indice',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            stepSize: 0.1,
                            callback: function(value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                        },
                        grid: {
                            display: true,
                            color: couleurGrille()
                        }
                    },
                    y: {
                        title: {
                            display: false
                        },
                        beginAtZero: true,
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: true
                },
                onHover: function(event, activeElements, chart) {
                    let datasetIndex = -1;

                    if (activeElements.length > 0) {
                        datasetIndex = activeElements[0].datasetIndex;
                    }

                    chart.data.datasets.forEach((dataset, idx) => {
                        if (dataset.label.includes('(étudiants)')) return;

                        const couleurOriginale = dataset.couleurOriginale;

                        if (datasetIndex === -1) {
                            // Aucun survol — courbes colorées
                            dataset.borderColor = couleurOriginale;
                            dataset.backgroundColor = hexVersRgba(couleurOriginale, 0.1);
                            dataset.borderWidth = STYLE_LIGNE_EPAISSEUR;
                        } else if (idx === datasetIndex) {
                            // Courbe survolée — pleine opacité
                            dataset.borderColor = couleurOriginale;
                            dataset.backgroundColor = hexVersRgba(couleurOriginale, 0.2);
                            dataset.borderWidth = 3.5;
                        } else {
                            // Autres courbes — atténuées
                            dataset.borderColor = hexVersRgba(couleurOriginale, 0.2);
                            dataset.backgroundColor = hexVersRgba(couleurOriginale, 0.03);
                            dataset.borderWidth = 1.5;
                        }
                    });

                    if (chartEstValide(chart)) chart.update('none');
                }
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        console.log('✅ Graphique distribution ACPE créé');
        return chart;

    } catch (error) {
        console.error('[creerGraphiqueDistributionACPE] Erreur:', error);
        return null;
    }
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions pour utilisation globale
window.creerGraphiqueIndividuel = creerGraphiqueIndividuel;
window.rafraichirGraphiqueIndividuel = rafraichirGraphiqueIndividuel;
window.creerGraphiqueGroupeMoyennes = creerGraphiqueGroupeMoyennes;
window.creerGraphiqueGroupeSpaghettiACP = creerGraphiqueGroupeSpaghettiACP;
window.rafraichirGraphiqueSpaghettiACP = rafraichirGraphiqueSpaghettiACP;
window.selectionnerEtudiantACP = selectionnerEtudiantACP;
window.creerGraphiqueGroupeSpaghetti = creerGraphiqueGroupeSpaghetti;
window.rafraichirGraphiqueSpaghetti = rafraichirGraphiqueSpaghetti;
window.selectionnerEtudiantSpaghetti = selectionnerEtudiantSpaghetti;
window.creerGraphiqueCriteres = creerGraphiqueCriteres;
window.creerGraphiqueDistributionACPE = creerGraphiqueDistributionACPE;
window.detruireGraphique = detruireGraphique;

// Recréer les graphiques visibles lors d'un changement de thème
window.addEventListener('themeChanged', function() {
    // Les graphiques seront recréés avec les bonnes couleurs
    // lors du prochain appel de rafraîchissement de la section
    if (typeof rafraichirGraphiqueIndividuel === 'function' && window.profilActuelDA) {
        rafraichirGraphiqueIndividuel(window.profilActuelDA);
    }
    if (typeof rafraichirGraphiqueSpaghettiACP === 'function') {
        try { rafraichirGraphiqueSpaghettiACP(); } catch(e) { /* section pas visible */ }
    }
    if (typeof rafraichirGraphiqueSpaghetti === 'function') {
        try { rafraichirGraphiqueSpaghetti(); } catch(e) { /* section pas visible */ }
    }
});

console.log('📊 Module graphiques-progression.js chargé');


})();
