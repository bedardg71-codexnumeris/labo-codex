/**
 * MODULE GRAPHIQUES PROGRESSION - Visualisations Chart.js (Beta 93)
 *
 * Crée des graphiques d'évolution temporelle des indices A-C-P-E
 * Inspiré des modèles de graphiques du tableur Numbers
 *
 * Types de graphiques :
 * 1. Graphique individuel : Courbes A-C-P-E d'un étudiant, sans zones de niveaux (#575)
 * 2. Graphique groupe moyennes : Moyennes A-C-P-E du groupe
 * 3. Graphique groupe spaghetti : tous les étudiants, sans zone de niveaux (#860)
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

// Désactivation globale des animations Chart.js : le redessin instantané
// prime sur l'effet visuel — sans ça, les changements de paramètres
// (critères, indice, surbrillance) se voient avec délai. S'applique à
// tous les graphiques de l'app (Aperçu, profil individuel, etc.).
if (typeof Chart !== 'undefined' && Chart.defaults) {
    Chart.defaults.animation = false;
    Chart.defaults.animations = { colors: false, x: false, y: false };
    Chart.defaults.transitions = Chart.defaults.transitions || {};
    Chart.defaults.transitions.active = { animation: { duration: 0 } };
    Chart.defaults.transitions.resize = { animation: { duration: 0 } };
}

// Couleurs indices A-C-P-E : centralisées dans js/couleurs.js (COULEURS.indices)
const COULEURS_INDICES = COULEURS.indices;

/**
 * ✨ UNIFORMISATION (#240) : Constantes de style partagées
 * Alignées sur le style du graphique « Dynamique des corrélations »
 */
const STYLE_LIGNE_EPAISSEUR = 2.5;
const STYLE_LIGNE_TENSION = 0.25;
const STYLE_POINT_RAYON = 4;
const STYLE_POINT_RAYON_HOVER = 7;
const STYLE_POINT_BORDURE = 2;
// Style tooltip unifié (#246) — source : STYLE_GRAPHIQUE.tooltip (js/couleurs.js).
// Préserve les ~10 sites de spread `...STYLE_TOOLTIP` déjà en place.
const STYLE_TOOLTIP = (window.STYLE_GRAPHIQUE && window.STYLE_GRAPHIQUE.tooltip) || {
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
 * Applique un style cohérent à un dataset de graphique spaghetti (multi-étudiants)
 * @param {Object} dataset - Dataset Chart.js
 * @param {string} etat - 'defaut' | 'actif' | 'inactif'
 * @param {string} couleur - Couleur hex de l'indice
 */
function appliquerStyleSpaghetti(dataset, etat, couleur) {
    var nbPoints = dataset.data.length;
    var bordure = couleurBordurePoint();

    // Élèves exclus (inactif/décrochage/abandon) : toujours gris pointillé
    if (dataset.exclu) {
        var gris = etat === 'actif' ? 'rgba(150, 150, 150, 0.6)' : 'rgba(150, 150, 150, 0.35)';
        var grisDim = etat === 'inactif' ? 'rgba(150, 150, 150, 0.12)' : gris;
        dataset.borderColor = grisDim;
        dataset.borderDash = [6, 4];
        dataset.borderWidth = etat === 'actif' ? 2.5 : 1.5;
        dataset.pointRadius = etat === 'actif' ? Array(nbPoints).fill(4) : Array(nbPoints).fill(2);
        dataset.pointBackgroundColor = Array(nbPoints).fill(grisDim);
        dataset.pointBorderColor = Array(nbPoints).fill('transparent');
        dataset.pointBorderWidth = 0;
        dataset.pointHoverRadius = etat === 'actif' ? 5 : 2;
        return;
    }

    dataset.borderDash = [];
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

// #860 (lot F, 16 sept. 2026) : la table `ZONES_IDME` (0 / 40 / 65 / 75 / 85, en dur) vivait ici
// comme repli des zones quand aucune échelle n'était résolue. Plus aucun lecteur : les seuls
// graphiques qui dessinent des niveaux (par critère #752, trajectoires en mode Habiletés) posent
// l'échelle de LEURS évaluations par `_zonesParCanvas` ; sans échelle résolue, aucune zone.

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


    return { min: borneMin, max: borneMax };
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
            'var(--niveau-attention-critique)': '#dc3545',
            'var(--niveau-attention-modere)': '#fd7e14',
            'var(--niveau-attention-minimal)': '#28a745',
            'var(--niveau-attention-nul)': '#007bff'
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
 * Génère les zones de niveaux (lignes de seuil + lettres de la marge) à partir de
 * l'échelle passée — et seulement d'elle.
 *
 * ⮕ #752 : les courbes par critère du profil et les trajectoires par habileté passent
 * l'échelle de LEURS évaluations (la majoritaire si plusieurs), posée par
 * `_zonesParCanvas` et lue par `zonesPourChart` dans les plugins d'étiquettes.
 * ⮕ #860 (lot F, 16 sept. 2026) : plus de repli sur « la première échelle du trimestre »
 * ni sur une table IDME en dur — un pourcentage agrégé (indices du groupe, note finale)
 * ne se situe pas dans une échelle de performance, et les graphiques qui le tracent ne
 * demandent plus de zones. Sans échelle résolue : aucune zone.
 * @param {Object|null} [echelle] - échelle résolue (`niveaux` avec `min`/`max`/`couleur`)
 * @returns {Array} - Tableau de zones pour les plugins d'étiquettes
 */
function genererZonesDepuisEchelle(echelle) {
    if (!echelle || !echelle.niveaux || echelle.niveaux.length === 0) {
        return [];
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

/**
 * Les zones d'un graphique donné : celles posées pour son canvas (#752), sinon aucune
 * (#860 : plus d'échelle du trimestre en repli). Un canvas re-rendu remplace son entrée.
 */
const _zonesParCanvas = new WeakMap();
function zonesPourChart(chart) {
    const canvas = chart && chart.canvas;
    return (canvas && _zonesParCanvas.get(canvas)) || [];
}

/**
 * L'échelle majoritaire d'un lot d'évaluations — celle que le plus d'évaluations
 * désignent ET qui se résout ; `null` si aucune ne se résout (alors pas de zones :
 * rien d'inventé). Dit aussi combien d'échelles distinctes se résolvent.
 * @param {Array} evaluations
 * @returns {{ echelle: Object|null, nb: number, total: number, distinctes: number }}
 */
function echelleMajoritaireDesEvaluations(evaluations) {
    const comptes = new Map();
    (evaluations || []).forEach(e => {
        const id = (e && e.echelleId) || '';
        comptes.set(id, (comptes.get(id) || 0) + 1);
    });
    let meilleure = null, nb = 0, distinctes = 0;
    comptes.forEach((n, id) => {
        const echelle = (typeof obtenirEchelleResolue === 'function') ? obtenirEchelleResolue(id || null) : null;
        if (!echelle) return;
        distinctes += 1;
        if (n > nb) { meilleure = echelle; nb = n; }
    });
    return { echelle: meilleure, nb, total: (evaluations || []).length, distinctes };
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
    normal:   { radius: 4 },                              // ● cercle standard
    artefact: { radius: 5, borderWidth: 3, hollow: true }, // ◎ double cercle vide
    jeton:    { radius: 7, borderWidth: 3, filled: true }, // ◉ cercle plein + contour contrasté
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


        evalsAvecJetons.forEach(evaluation => {
            // Trouver la production pour obtenir le titre et la date d'échéance
            const production = productions.find(p => p.id === evaluation.productionId);
            const titreProduction = production?.activiteApprentissage || production?.description || production?.titre || production?.nom || 'Production';
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
                    titre: (typeof window.titreInterventionAffiche === 'function' ? window.titreInterventionAffiche(intervention) : intervention.titre) || `Intervention niveau ${intervention.niveauRai}`   // Lot A, R4
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
    // Legacy — conservée pour compatibilité, préférer genererStylesCombines
    const pointStyle = [];
    const pointRadius = [];
    const pointBackgroundColor = [];

    snapshots.forEach(function() {
        pointStyle.push('circle');
        pointRadius.push(STYLES_EVENEMENTS.normal.radius);
        pointBackgroundColor.push(couleurBase);
    });

    return { pointStyle, pointRadius, pointBackgroundColor };
}

/**
 * Obtient les artefacts (productions) associés à chaque séance
 * Même logique que correlations-longitudinales.js (lignes 265-322)
 * @param {Array} snapshots - Snapshots avec dateSeance
 * @returns {Object} - { dateSeance: [{titre, activite}] }
 */
function obtenirArtefactsParDateSeance(snapshots) {
    const artefactsParDate = {};
    try {
        const productions = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions') || []
            : [];
        const infoCours = db.getSync('infoCours', null);
        const gcId = obtenirIdContexteActif(infoCours);
        const cadre = db.getSync(cle('cadreCalendrier'), {});
        const dateDebutSem = cadre.dateDebut || '';

        const prodFiltrees = productions.filter(function(p) {
            if (p.facultatif || p.type === 'portfolio') return false;
            if (typeof obtenirEcheanceEffective === 'function') {
                var ech = obtenirEcheanceEffective(p, gcId);
                return ech.assignee && !!ech.date && ech.date >= dateDebutSem;
            }
            return !!p.dateEcheance && p.dateEcheance >= dateDebutSem;
        });

        // Extraire les dates de séance triées
        const datesSeances = snapshots.map(function(s) { return s.dateSeance; }).filter(Boolean);

        prodFiltrees.forEach(function(prod) {
            var dateEch = '';
            if (typeof obtenirEcheanceEffective === 'function') {
                dateEch = obtenirEcheanceEffective(prod, gcId).date || '';
            } else {
                dateEch = prod.dateEcheance || '';
            }
            if (!dateEch) return;
            var dateEchNorm = dateEch.substring(0, 10);

            // Trouver la séance la plus proche (dernière séance dont date <= échéance)
            var dateSeanceTrouvee = null;
            for (var i = 0; i < datesSeances.length; i++) {
                if (datesSeances[i] <= dateEchNorm) {
                    dateSeanceTrouvee = datesSeances[i];
                } else {
                    break;
                }
            }
            // Correspondance exacte prioritaire
            if (datesSeances.indexOf(dateEchNorm) !== -1) {
                dateSeanceTrouvee = dateEchNorm;
            }

            if (dateSeanceTrouvee) {
                if (!artefactsParDate[dateSeanceTrouvee]) artefactsParDate[dateSeanceTrouvee] = [];
                artefactsParDate[dateSeanceTrouvee].push({
                    titre: prod.titre || prod.activiteApprentissage || prod.description || 'Sans titre',
                    activite: prod.activiteApprentissage || prod.description || ''
                });
            }
        });
    } catch (e) {
        console.warn('⚠️ obtenirArtefactsParDateSeance:', e);
    }
    return artefactsParDate;
}

/**
 * Génère les styles combinés pour les marqueurs d'événements pédagogiques
 * Fusionne artefacts, jetons et RàI avec priorité : jeton > artefact > normal
 * (Les interventions RàI sont dessinées par un plugin overlay, pas par le style du point)
 *
 * @param {Array} snapshots - Snapshots avec dateSeance
 * @param {Object} jetonsParDate - { dateSeance: { type, production } }
 * @param {Object} artefactsParDate - { dateSeance: [{titre, activite}] }
 * @param {string} couleurBase - Couleur hex de la courbe
 * @param {Object} options - { includeJetons: bool, includeArtefacts: bool }
 * @returns {Object} - { pointStyle, pointRadius, pointBackgroundColor, pointBorderWidth, _eventPointBgColor }
 */
function genererStylesCombines(snapshots, jetonsParDate, artefactsParDate, couleurBase, options) {
    var includeJetons = options && options.includeJetons;
    var includeArtefacts = options && options.includeArtefacts;
    var estClair = document.body.classList.contains('mode-clair');
    var contourJeton = estClair ? '#000' : '#fff';

    var pointStyle = [];
    var pointRadius = [];
    var pointBackgroundColor = [];
    var pointBorderWidth = [];

    snapshots.forEach(function(snapshot) {
        var dateSeance = snapshot.dateSeance;
        var jeton = includeJetons ? jetonsParDate[dateSeance] : null;
        var artefacts = includeArtefacts ? artefactsParDate[dateSeance] : null;

        if (jeton) {
            // ◉ Cercle plein + contour contrasté
            pointStyle.push('circle');
            pointRadius.push(STYLES_EVENEMENTS.jeton.radius);
            pointBackgroundColor.push(couleurBase);
            pointBorderWidth.push(STYLES_EVENEMENTS.jeton.borderWidth);
        } else if (artefacts && artefacts.length > 0) {
            // ◎ Double cercle vide (transparent center + thick border)
            pointStyle.push('circle');
            pointRadius.push(STYLES_EVENEMENTS.artefact.radius);
            pointBackgroundColor.push('transparent');
            pointBorderWidth.push(STYLES_EVENEMENTS.artefact.borderWidth);
        } else {
            // ● Cercle normal
            pointStyle.push('circle');
            pointRadius.push(STYLES_EVENEMENTS.normal.radius);
            pointBackgroundColor.push(couleurBase);
            pointBorderWidth.push(STYLE_POINT_BORDURE);
        }
    });

    return {
        pointStyle: pointStyle,
        pointRadius: pointRadius,
        pointBackgroundColor: pointBackgroundColor,
        pointBorderWidth: pointBorderWidth,
        _eventPointBgColor: pointBackgroundColor.slice()
    };
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
 * Affiche les courbes A-C-P-E — sans zones de niveaux : un indice agrégé ne se situe
 * pas dans une échelle de performance (#575, 13 sept. 2026)
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
            gcIdIndiv = obtenirIdContexteActif(infoCoursIndiv);
            productionsFiltreesIndiv = productions.filter(p => {
                if (p.facultatif || p.type === 'portfolio') return false;
                if (typeof obtenirEcheanceEffective === 'function') {
                    const { date, assignee } = obtenirEcheanceEffective(p, gcIdIndiv);
                    return assignee && !!date;
                }
                return !!p.dateEcheance;
            });
        } catch (e) { console.warn('[Graphiques] productions filter for individual chart skipped:', e.message || e); }

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
        const artefactsParDate = obtenirArtefactsParDateSeance(snapshots);

        // Générer les styles combinés (artefacts sur A et C, jetons+artefacts sur P)
        const stylesA = genererStylesCombines(snapshots, jetonsParDate, artefactsParDate, COULEURS_INDICES.A, { includeArtefacts: true });
        const stylesC = genererStylesCombines(snapshots, jetonsParDate, artefactsParDate, COULEURS_INDICES.C, { includeArtefacts: true });
        const stylesP = genererStylesCombines(snapshots, jetonsParDate, artefactsParDate, COULEURS_INDICES.P, { includeJetons: true, includeArtefacts: true });

        // Stocker les infos pour les tooltips enrichis
        const infosEvenements = { jetonsParDate, raiParDate, artefactsParDate, snapshots };

        // Construire les datasets - style noir/fin par défaut (comme spaghetti)
        const couleursOriginales = {
            'Assiduité (A)': COULEURS_INDICES.A,
            'Complétion (C)': COULEURS_INDICES.C,
            'Performance (P)': COULEURS_INDICES.P
        };

        // ✨ #240: Courbes colorées par défaut, bordure de point thème-aware
        const bordure = couleurBordurePoint();
        const datasets = [
            {
                label: 'Assiduité (A)',
                data: donneesA,
                borderColor: COULEURS_INDICES.A,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: stylesA.pointRadius,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: stylesA.pointStyle,
                pointBackgroundColor: stylesA.pointBackgroundColor,
                pointBorderColor: bordure,
                pointBorderWidth: stylesA.pointBorderWidth,
                _eventPointStyle: stylesA.pointStyle,
                _eventPointRadius: stylesA.pointRadius,
                _eventPointBgColor: stylesA._eventPointBgColor,
                _eventPointBorderWidth: stylesA.pointBorderWidth,
                spanGaps: false
            },
            {
                label: 'Complétion (C)',
                data: donneesC,
                borderColor: COULEURS_INDICES.C,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: stylesC.pointRadius,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: stylesC.pointStyle,
                pointBackgroundColor: stylesC.pointBackgroundColor,
                pointBorderColor: bordure,
                pointBorderWidth: stylesC.pointBorderWidth,
                _eventPointStyle: stylesC.pointStyle,
                _eventPointRadius: stylesC.pointRadius,
                _eventPointBgColor: stylesC._eventPointBgColor,
                _eventPointBorderWidth: stylesC.pointBorderWidth,
                spanGaps: false
            },
            {
                label: 'Performance (P)',
                data: donneesP,
                borderColor: COULEURS_INDICES.P,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: stylesP.pointRadius,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: stylesP.pointStyle,
                pointBackgroundColor: stylesP.pointBackgroundColor,
                pointBorderColor: bordure,
                pointBorderWidth: stylesP.pointBorderWidth,
                _eventPointStyle: stylesP.pointStyle,
                _eventPointRadius: stylesP.pointRadius,
                _eventPointBgColor: stylesP._eventPointBgColor,
                _eventPointBorderWidth: stylesP.pointBorderWidth,
                spanGaps: false
            }
        ];

        // « P sans reprises » : embranchement pointillé si l'étudiant a des jetons
        const donneesPSansReprises = typeof genererPSansReprises === 'function'
            ? genererPSansReprises(da, snapshots, donneesP)
            : null;

        if (donneesPSansReprises) {
            couleursOriginales['P sans reprises'] = COULEURS_INDICES.P;
            datasets.push({
                label: 'P sans reprises',
                data: donneesPSansReprises,
                borderColor: COULEURS_INDICES.P,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderDash: [6, 3],
                tension: STYLE_LIGNE_TENSION,
                pointRadius: 2,
                pointHoverRadius: 4,
                pointStyle: 'circle',
                pointBackgroundColor: 'transparent',
                pointBorderColor: COULEURS_INDICES.P,
                pointBorderWidth: 1,
                spanGaps: true,
                _isSansReprises: true
            });
        }

        // Plugin : triangles d'intervention RàI au-dessus des points
        const pluginInterventionsIndiv = {
            id: 'interventionMarkersIndiv',
            afterDatasetsDraw: function(chart) {
                if (!infosEvenements.raiParDate) return;
                var xScale = chart.scales.x;
                var yScale = chart.scales.y;
                var ctx2 = chart.ctx;
                var couleurN2 = '#FFA726'; // Orange — niveau 2
                var couleurN3 = '#EF5350'; // Rouge — niveau 3

                infosEvenements.snapshots.forEach(function(snapshot, idx) {
                    var dateSeance = snapshot.dateSeance;
                    var rai = infosEvenements.raiParDate[dateSeance];
                    if (!rai) return;

                    var x = xScale.getPixelForValue(idx);

                    // Trouver le point le plus haut parmi les datasets visibles
                    var yMin = yScale.bottom;
                    chart.data.datasets.forEach(function(ds, di) {
                        var meta = chart.getDatasetMeta(di);
                        if (meta.hidden) return;
                        var val = ds.data[idx];
                        if (val == null) return;
                        var yPx = yScale.getPixelForValue(val);
                        if (yPx < yMin) yMin = yPx;
                    });

                    // Triangle pointant vers le bas, au-dessus du point le plus haut
                    var triY = yMin - 12;
                    var triSize = 5;
                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.moveTo(x - triSize, triY - triSize);
                    ctx2.lineTo(x + triSize, triY - triSize);
                    ctx2.lineTo(x, triY + triSize);
                    ctx2.closePath();
                    ctx2.fillStyle = rai.niveau >= 3 ? couleurN3 : couleurN2;
                    ctx2.globalAlpha = 0.8;
                    ctx2.fill();
                    ctx2.restore();
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
            // #575, septième site (13 sept. 2026) : AUCUNE zone de niveaux sur ce graphique.
            // Une échelle de performance juge UNE production ; A, C et P sont des mesures
            // agrégées en pourcentage sur le trimestre. Leurs paliers superposés aux courbes
            // donnaient un repère qui avait l'air de dire quelque chose et ne disait rien
            // (décision de Grégoire). Ne pas réintroduire `pluginEtiquettesZones` ici — ni la
            // marge droite qui portait ses étiquettes. Le graphique par critère (#752) garde
            // les siennes : ses points SONT des niveaux d'évaluations.
            plugins: [pluginInterventionsIndiv],
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
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

                                // Artefacts (productions)
                                const arts = infosEvenements.artefactsParDate[dateSeance];
                                if (arts && arts.length > 0) {
                                    lignes.push('');
                                    lignes.push('▪ Productions :');
                                    arts.forEach(function(a) {
                                        var ligne = '  ' + a.titre;
                                        if (a.activite && a.activite !== a.titre) ligne += ' — ' + a.activite;
                                        lignes.push(ligne);
                                    });
                                }

                                const jeton = infosEvenements.jetonsParDate[dateSeance];
                                if (jeton) {
                                    const typeLabel = jeton.type === 'jetonDelai' ? '⭐ Jeton délai' : '◆ Jeton reprise';
                                    lignes.push('');
                                    lignes.push(`${typeLabel} sur "${jeton.production}"`);
                                }

                                const rai = infosEvenements.raiParDate[dateSeance];
                                if (rai) {
                                    const niveauLabel = rai.niveau === 3 ? '▼ RàI Niveau 3' : '▼ RàI Niveau 2';
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
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // Stocker l'instance pour pouvoir la détruire plus tard
        graphiquesIndividuels[da] = chart;

        return chart;

    } catch (error) {
        console.error('❌ Erreur création graphique individuel:', error);
        return null;
    }
}

// #860 : `creerAnnotationsZones` (seul autre lecteur de `ZONES_IDME`) vivait ici sans appelant — retirée.

// #824 (11 sept. 2026) — `creerGraphiqueGroupeMoyennes` (~270 lignes) vivait ici : exportée,
// jamais appelée (le canevas `graphique-groupe-moyennes` est dessiné par
// `creerGraphiqueGroupeSpaghettiACP`). Retirée avec `appliquerStyleDataset`, son seul helper propre.

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
        const texteAffiche = estVerrouille ? `\u25C9 ${nom}` : nom;
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

        var estExclu = dataset.exclu;
        ctx.fillStyle = estExclu ? 'rgba(150, 150, 150, 0.15)'
            : estVerrouille ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(rectX, rectY, rectW, rectH);

        if (estVerrouille && !estExclu) {
            ctx.strokeStyle = '#E91E63';
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX, rectY, rectW, rectH);
        }

        ctx.fillStyle = estExclu ? '#999'
            : estVerrouille ? '#C2185B' : '#1976D2';
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

        // #400 (rapport P3) : garde idempotente des listeners du canvas — le
        // canvas est PERSISTANT (DOM), le chart est détruit à chaque re-rendu,
        // mais mouseleave/click/mousemove étaient RÉ-attachés sans retrait :
        // +3 listeners par rendu, dont les closures retenaient le chart détruit
        // et ses datasets (75 courbes × semaines). Patron #326 R1 : chaque
        // attache retire d'abord le handler du rendu précédent (même type).
        const _attacherListenerSpaghetti = function(type, handler) {
            canvas._spaghettiHandlers = canvas._spaghettiHandlers || {};
            if (canvas._spaghettiHandlers[type]) {
                canvas.removeEventListener(type, canvas._spaghettiHandlers[type]);
            }
            canvas._spaghettiHandlers[type] = handler;
            canvas.addEventListener(type, handler);
        };

        // Réinitialiser les variables de suivi
        dernierDatasetSurvoleACP = -1;
        datasetVerrouilleACP = -1;
        zonesNomsEtudiantsACP = [];

        // Récupérer les snapshots hebdomadaires
        const snapshots = obtenirSnapshotsHebdomadaires();
        if (snapshots.length === 0) {
            // Fraîche installation — message utilisateur dans le canvas suffit, pas de warn console
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
                const exclu = typeof estEtudiantExclu === 'function' && estEtudiantExclu(etudiant);
                return { da, nomComplet: etudiant.nom || da, nomAffiche, exclu };
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
        } catch (e) { console.warn('[Graphiques] cadreCalendrier read skipped:', e.message || e); }
        if (indice === 'C' || indice === 'P') {
            try {
                const productions = obtenirDonneesSelonMode('productions') || [];
                const infoCoursGraph = db.getSync('infoCours', null);
                gcIdGraph = obtenirIdContexteActif(infoCoursGraph);
                productionsFiltreesGraph = productions.filter(p => {
                    if (p.facultatif || p.type === 'portfolio') return false;
                    if (typeof obtenirEcheanceEffective === 'function') {
                        const { date, assignee } = obtenirEcheanceEffective(p, gcIdGraph);
                        return assignee && !!date && date >= dateDebutSemestre;
                    }
                    return !!p.dateEcheance && p.dateEcheance >= dateDebutSemestre;
                });
            } catch (e) { console.warn('[Graphiques] productions filter for spaghetti skipped:', e.message || e); }
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
            // Inactifs : gris pointillé, exclus des stats (déjà exclus à la capture des snapshots)
            var couleurIndice = couleursIndices[indice] || COULEURS_INDICES.P;
            var couleurLigne = etudiant.exclu ? 'rgba(150, 150, 150, 0.35)' : hexVersRgba(couleurIndice, 0.4);
            return {
                label: etudiant.nomAffiche,
                data: data,
                da: etudiant.da,
                indice: indice,
                exclu: etudiant.exclu,
                borderColor: couleurLigne,
                backgroundColor: 'transparent',
                borderWidth: etudiant.exclu ? 1.5 : STYLE_LIGNE_EPAISSEUR,
                borderDash: etudiant.exclu ? [6, 4] : [],
                tension: STYLE_LIGNE_TENSION,
                pointRadius: etudiant.exclu ? 2 : STYLE_POINT_RAYON,
                pointHoverRadius: etudiant.exclu ? 3 : STYLE_POINT_RAYON_HOVER,
                pointStyle: 'circle',
                pointBackgroundColor: couleurLigne,
                pointBorderColor: etudiant.exclu ? 'transparent' : couleurBordurePoint(),
                pointBorderWidth: etudiant.exclu ? 0 : STYLE_POINT_BORDURE,
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
            // #860 (lot F, 16 sept. 2026) : AUCUNE zone de niveaux sur ce graphique, l'indice P
            // compris — même motif que le septième site de #575 (13 sept.) : A, C et P sont des
            // pourcentages agrégés sur le trimestre, une échelle de performance juge UNE production.
            // Ne pas réintroduire `pluginEtiquettesZones` ici. La marge droite reste : le nom de
            // l'élève au survol (`pluginNomEtudiantSurvolACP`) s'écrit après le dernier point.
            plugins: [pluginGradientFond, pluginNomEtudiantSurvolACP],
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

        _attacherListenerSpaghetti('mouseleave', function() {
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
                chart.data.datasets.forEach(dataset => {
                    appliquerStyleSpaghetti(dataset, 'defaut', couleurIndice);
                });
                if (selecteur) selecteur.value = '';
            } else {
                // Verrouiller
                datasetVerrouilleACP = indexDataset;
                dernierDatasetSurvoleACP = indexDataset;
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
            _majBoutonProfilACP();
            if (chartEstValide(chart)) chart.update('none');
        }

        // Gestionnaire de clic
        // NOTE: Chart.js utilise des coordonnées CSS en interne, pas des pixels canvas
        // Les zones du plugin sont donc en CSS, on utilise les coordonnées CSS du clic
        _attacherListenerSpaghetti('click', function(event) {
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
        _attacherListenerSpaghetti('mousemove', function(event) {
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

        // Peupler le dropdown des étudiants.
        // G-6 (audit du 6 sept., #749 lot 1) — ASYMÉTRIE CONNUE, POSITION, PAS DÉFAUT :
        // ce sélecteur est reconstruit sans restaurer sa valeur (l'élève en relief se
        // perd au re-rendu), alors que celui des trajectoires (`selecteur-etudiant-
        // trajectoires`, plus bas) relit `valeurAvant` et la remet. Rien ne survit au
        // rechargement dans ce sous-onglet hors la liste suivie ; l'aligner est un choix
        // d'ergonomie à prendre avec le lot transversal, pas un correctif.
        const selecteurEtudiant = document.getElementById('selecteur-etudiant-acp');
        if (selecteurEtudiant) {
            selecteurEtudiant.innerHTML = '<option value="">-- Sélectionner --</option>';
            datasets.forEach((dataset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = dataset.exclu ? `${dataset.label} (inactif)` : dataset.label;
                selecteurEtudiant.appendChild(option);
            });
        }
        _majBoutonProfilACP();

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
    _majBoutonProfilACP();
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
}

/**
 * Ouvre le profil de l'élève actuellement en relief dans le graphique ACP.
 * Lit l'index depuis #selecteur-etudiant-acp et la DA depuis dataset.da.
 */
function ouvrirProfilEleveACP() {
    if (!graphiqueSpaghettiACPInstance) return;
    const select = document.getElementById('selecteur-etudiant-acp');
    if (!select || !select.value) return;
    const idx = parseInt(select.value, 10);
    if (isNaN(idx)) return;
    const ds = graphiqueSpaghettiACPInstance.data.datasets[idx];
    if (ds && ds.da && typeof tbNavigerVersProfil === 'function') {
        tbNavigerVersProfil(ds.da);
    }
}

/**
 * Met à jour la visibilité du bouton 👤 « Voir le profil » selon
 * la sélection courante du dropdown élève ACP.
 */
function _majBoutonProfilACP() {
    const btn = document.getElementById('btn-profil-acp');
    const select = document.getElementById('selecteur-etudiant-acp');
    if (!btn || !select) return;
    btn.style.display = (select.value && select.value !== '') ? 'inline-flex' : 'none';
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

        const zonesUtilisateur = zonesPourChart(chart);
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
        const zonesUtilisateur = zonesPourChart(chart);
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
    ctx.fillStyle = couleurTexte();
    ctx.textAlign = 'center';
    ctx.fillText(titre, canvas.width / 2, canvas.height / 2 - 10);

    if (details) {
        ctx.font = '12px Arial';
        ctx.fillStyle = couleurTexte();
        ctx.globalAlpha = 0.7;
        ctx.fillText(details, canvas.width / 2, canvas.height / 2 + 15);
        ctx.globalAlpha = 1;
    }
}


// #860 : `creerAnnotationsZonesIDME` vivait ici sans appelant — retirée.

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
            !e.remplaceeParId &&
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
            return production?.activiteApprentissage || production?.description || production?.nom || `Prod. ${e.productionId}`;
        });

        // Préparer les données par critère — #752 : chaque valeur se convertit dans
        // l'échelle de SON évaluation (`scoreCritereEvaluation`, la conversion du
        // dépistage ; un critère en points par sa fraction). Plus de table I/D/M/E
        // écrite en dur, plus de « ≤ 4 → sur 4 ». Une valeur qui ne se convertit
        // pas est un point ABSENT, compté pour que le graphique le dise.
        const donneesCriteres = {};
        const cacheTables = new Map();
        const evaluationsSansValeur = new Set();
        let pointsSansValeur = 0;

        criteresUniques.forEach(nomCritere => {
            donneesCriteres[nomCritere] = evaluationsEtudiant.map(e => {
                const critere = e.criteres.find(c => c.critereNom === nomCritere);
                if (!critere) return null;
                const enPoints = typeof critere.points === 'number' && !isNaN(critere.points);
                const niveau = critere.niveauSelectionne;
                if (!enPoints && (niveau === null || niveau === undefined || String(niveau).trim() === '')) return null;
                const score = scoreCritereEvaluation(critere, tableConversionPourEvaluation(e, cacheTables));
                if (score === null) {
                    pointsSansValeur += 1;
                    evaluationsSansValeur.add(e.id || e);
                    return null;
                }
                // 0,65 × 100 vaut 65,00000000000001 en flottant : deux décimales.
                return Math.round(score * 10000) / 100;
            });
        });

        return {
            labels,
            criteres: donneesCriteres,
            criteresUniques,
            evaluations: evaluationsEtudiant,
            sansValeurConvertible: { evaluations: evaluationsSansValeur.size, points: pointsSansValeur },
            echelles: echelleMajoritaireDesEvaluations(evaluationsEtudiant)
        };
    } catch (error) {
        console.error('[obtenirDonneesCriteres] Erreur:', error);
        return null;
    }
}

/**
 * « n évaluations sans valeur convertible dans cette échelle » — ou rien.
 * Le mot proposé à Grégoire (consigne du 11 sept., § 2 : silence = tel quel).
 * @param {{ evaluations: number, points: number }} compte
 * @returns {string} vide quand tout se convertit
 */
function _messageSansValeurConvertible(compte) {
    const n = compte ? compte.evaluations : 0;
    if (!n) return '';
    return n + ' évaluation' + (n > 1 ? 's' : '') + ' sans valeur convertible dans cette échelle';
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

        // Détecter événements par index d'évaluation (jetons et interventions)
        const evalsTriees = donnees.evaluations;
        const jetonsParIndex = {};
        const interventionsParIndex = {};
        var estClairCrit = document.body.classList.contains('mode-clair');

        evalsTriees.forEach(function(ev, idx) {
            // Jetons
            if (ev.jetonDelaiApplique || ev.jetonRepriseApplique || ev.repriseDeId) {
                var typeJeton = ev.jetonDelaiApplique ? 'jetonDelai' : 'jetonReprise';
                jetonsParIndex[idx] = { type: typeJeton };
            }
        });

        // Interventions RàI : placer chaque intervention sur l'évaluation la plus proche
        // (dernière évaluation dont la date est <= date de l'intervention)
        if (typeof obtenirInterventionsEtudiant === 'function') {
            try {
                var interventions = obtenirInterventionsEtudiant(da);
                interventions.forEach(function(inter) {
                    if (inter.statut !== 'completee' || inter.niveauRai < 2) return;
                    var dateInter = inter.date || '';
                    if (!dateInter) return;

                    // Trouver l'évaluation la plus proche avant ou le jour de l'intervention
                    var meilleurIdx = -1;
                    evalsTriees.forEach(function(ev, idx) {
                        var dateEval = (ev.dateEvaluation || '').substring(0, 10); // ISO → YYYY-MM-DD
                        if (dateEval && dateEval <= dateInter) {
                            meilleurIdx = idx;
                        }
                    });
                    if (meilleurIdx === -1) return;

                    // Garder le niveau le plus élevé si plusieurs interventions tombent sur le même index
                    var existant = interventionsParIndex[meilleurIdx];
                    if (!existant || inter.niveauRai > existant.niveau) {
                        interventionsParIndex[meilleurIdx] = {
                            niveau: inter.niveauRai,
                            titre: (typeof window.titreInterventionAffiche === 'function' ? window.titreInterventionAffiche(inter) : inter.titre) || 'Intervention N' + inter.niveauRai   // Lot A, R4
                        };
                    }
                });
            } catch (e) { console.warn('[Graphiques] intervention detection skipped:', e.message || e); }
        }

        // Générer les styles de points partagés (jetons uniquement — interventions via plugin)
        var nbEvals = evalsTriees.length;
        var eventPointStyle = [];
        var eventPointRadius = [];
        var eventPointBorderWidth = [];

        for (var ei = 0; ei < nbEvals; ei++) {
            if (jetonsParIndex[ei]) {
                eventPointStyle.push('circle');
                eventPointRadius.push(STYLES_EVENEMENTS.jeton.radius);
                eventPointBorderWidth.push(STYLES_EVENEMENTS.jeton.borderWidth);
            } else {
                eventPointStyle.push('circle');
                eventPointRadius.push(STYLES_EVENEMENTS.normal.radius);
                eventPointBorderWidth.push(STYLE_POINT_BORDURE);
            }
        }

        // Stocker les couleurs originales pour le survol
        const couleursOriginales = {};

        // Créer les datasets avec marqueurs d'événements
        const datasets = donnees.criteresUniques.map((critere, index) => {
            const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];
            couleursOriginales[critere] = couleur;

            // Couleur de fond par point (transparent pour jeton → contour contrasté)
            var bgColors = eventPointStyle.map(function(s, i) {
                return jetonsParIndex[i] ? couleur : couleur;
            });

            return {
                label: critere,
                data: donnees.criteres[critere],
                borderColor: couleur,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: eventPointRadius.slice(),
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointStyle: eventPointStyle.slice(),
                pointBackgroundColor: bgColors,
                pointBorderColor: couleurBordurePoint(),
                pointBorderWidth: eventPointBorderWidth.slice(),
                _eventPointStyle: eventPointStyle.slice(),
                _eventPointRadius: eventPointRadius.slice(),
                _eventPointBgColor: bgColors.slice(),
                _eventPointBorderWidth: eventPointBorderWidth.slice(),
                spanGaps: false
            };
        });

        // Plugin : triangles d'intervention RàI sur le graphique critères
        const pluginInterventionsCriteres = {
            id: 'interventionMarkersCriteres',
            afterDatasetsDraw: function(chart) {
                var xScale = chart.scales.x;
                var yScale = chart.scales.y;
                var ctx2 = chart.ctx;
                var couleurN2 = '#FFA726';
                var couleurN3 = '#EF5350';

                for (var idxStr in interventionsParIndex) {
                    var idx = Number(idxStr);
                    var inter = interventionsParIndex[idxStr];
                    var x = xScale.getPixelForValue(idx);

                    // Trouver le point le plus haut parmi les datasets visibles
                    var yMin = yScale.bottom;
                    chart.data.datasets.forEach(function(ds, di) {
                        var meta = chart.getDatasetMeta(di);
                        if (meta.hidden) return;
                        var val = ds.data[idx];
                        if (val == null) return;
                        var yPx = yScale.getPixelForValue(val);
                        if (yPx < yMin) yMin = yPx;
                    });

                    var triY = yMin - 12;
                    var triSize = 5;
                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.moveTo(x - triSize, triY - triSize);
                    ctx2.lineTo(x + triSize, triY - triSize);
                    ctx2.lineTo(x, triY + triSize);
                    ctx2.closePath();
                    ctx2.fillStyle = inter.niveau >= 3 ? couleurN3 : couleurN2;
                    ctx2.globalAlpha = 0.8;
                    ctx2.fill();
                    ctx2.restore();
                }
            }
        };

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

        // Détruire le graphique existant sur ce canvas (évite "Canvas already in use")
        if (_chartsCriteres[da]) {
            _chartsCriteres[da].destroy();
            delete _chartsCriteres[da];
        }
        var existant = Chart.getChart(canvas);
        if (existant) existant.destroy();

        // #752 — le graphique DIT ce qu'il ne trace pas, et d'où viennent ses zones.
        const note = document.getElementById('graphique-criteres-note-' + da);
        const messageSansValeur = _messageSansValeurConvertible(donnees.sansValeurConvertible);
        const lignesNote = [];
        if (messageSansValeur) lignesNote.push(messageSansValeur);
        if (donnees.echelles.distinctes > 1 && donnees.echelles.echelle) {
            lignesNote.push('Zones : échelle « ' + (donnees.echelles.echelle.nom || donnees.echelles.echelle.id) + ' » ('
                + donnees.echelles.nb + ' évaluations sur ' + donnees.echelles.total + ')');
        }
        if (note) {
            note.textContent = lignesNote.join(' · ');
            note.hidden = lignesNote.length === 0;
        }
        _zonesParCanvas.set(canvas, donnees.echelles.echelle ? genererZonesDepuisEchelle(donnees.echelles.echelle) : []);
        if (datasets.every(ds => ds.data.every(v => v === null))) {
            afficherMessageAttente(canvas, 'Aucune valeur convertible', messageSansValeur || 'Aucune valeur à tracer.');
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Calculer les bornes Y dynamiques (échelle 0-100)
        const bornesY = calculerBornesYDynamiques100(datasets);

        // Plugin : pointillés entre points non consécutifs (ex. Français évalué 1×/2)
        const pluginPointillesGaps = {
            id: 'dashedGapLines',
            afterDatasetsDraw: function(chart) {
                var ctx2 = chart.ctx;
                var xScale = chart.scales.x;
                var yScale = chart.scales.y;

                chart.data.datasets.forEach(function(ds, di) {
                    var meta = chart.getDatasetMeta(di);
                    if (meta.hidden) return;

                    var data = ds.data;
                    var lastNonNull = -1;

                    for (var i = 0; i < data.length; i++) {
                        if (data[i] == null) continue;

                        if (lastNonNull >= 0 && i - lastNonNull > 1) {
                            // Il y a un gap — dessiner un pointillé
                            var x0 = xScale.getPixelForValue(lastNonNull);
                            var y0 = yScale.getPixelForValue(data[lastNonNull]);
                            var x1 = xScale.getPixelForValue(i);
                            var y1 = yScale.getPixelForValue(data[i]);

                            ctx2.save();
                            ctx2.strokeStyle = ds.borderColor || '#999';
                            ctx2.lineWidth = (ds.borderWidth || 2) * 0.7;
                            ctx2.globalAlpha = 0.5;
                            ctx2.setLineDash([6, 4]);
                            ctx2.beginPath();
                            ctx2.moveTo(x0, y0);
                            ctx2.lineTo(x1, y1);
                            ctx2.stroke();
                            ctx2.restore();
                        }

                        lastNonNull = i;
                    }
                });
            }
        };

        // Configuration du graphique
        const config = {
            type: 'line',
            plugins: [pluginGradientFond100, ...(obtenirPreference('afficherSeuilsVisuels') !== false ? [pluginEtiquettesZones100] : []), pluginInterventionsCriteres, pluginPointillesGaps],
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
                        display: false
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
                            },
                            afterBody: function(tooltipItems) {
                                if (!tooltipItems.length) return [];
                                var idx = tooltipItems[0].dataIndex;
                                var lignes = [];

                                var jeton = jetonsParIndex[idx];
                                if (jeton) {
                                    var typeLabel = jeton.type === 'jetonDelai' ? '⭐ Jeton délai' : '◆ Jeton reprise';
                                    lignes.push('');
                                    lignes.push(typeLabel);
                                }

                                var inter = interventionsParIndex[idx];
                                if (inter) {
                                    var niveauLabel = inter.niveau >= 3 ? '▼ RàI Niveau 3' : '▼ RàI Niveau 2';
                                    lignes.push('');
                                    lignes.push(niveauLabel + ': ' + inter.titre);
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
            }
        };

        // Créer le graphique
        const chart = new Chart(ctx, config);

        // Enregistrer l'instance pour toggle externe
        _chartsCriteres[da] = chart;

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
 * (Mesuré au lot 34, 17 sept. 2026 : AUCUN appelant — aucun écran ne montre cette distribution.
 * Verrou : sentinelle-745-exclu-hors-des-moyennes-comportement, B.2 — le jour où un appelant
 * revient, l'essai de comportement du filtre des exclus est dû.)
 * @param {string} canvasId - ID du canvas HTML
 * @returns {Chart|null} - Instance Chart.js ou null si erreur
 */
function creerGraphiqueDistributionACPE(canvasId) {
    try {

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

        etudiantsActifs.forEach(e => {
            // Indice A (Assiduité)
            // ⚠ CODE SANS APPELANT (mesuré le 19 sept. 2026 ; la sentinelle #745 le dit aussi, essai B.2).
            // Si ce graphique revit : lire le magasin par `lireIndiceAssiduite` (#743 — le stock d'avant,
            // `indice: 1, nombreSeances: 0`, compterait ici pour 100 %, et une entrée `null` ferait
            // `null.indice`), et revoir le `A > 0` plus bas, qui écarte l'absent total, contraire à #750.
            const assiduiteSom = indicesAssiduite.sommatif?.[e.da];
            const A = typeof assiduiteSom === 'object'
                ? assiduiteSom.indice
                : (typeof assiduiteSom === 'number' ? assiduiteSom : null);

            if (A !== null && A > 0) {
                valeursA.push(A);
            }

            // Indices C, P
            if (typeof obtenirIndicesCP === 'function') {
                const indicesCP = obtenirIndicesCP(e.da);
                if (indicesCP) {
                    if (indicesCP.C !== undefined && indicesCP.C > 0) {
                        valeursC.push(indicesCP.C / 100);
                    }
                    if (indicesCP.P !== undefined && indicesCP.P > 0) {
                        valeursP.push(indicesCP.P / 100);
                    }
                }
            }
        });


        // Calculer les statistiques pour chaque indice
        const statsA = calculerStatistiques(valeursA);
        const statsC = calculerStatistiques(valeursC);
        const statsP = calculerStatistiques(valeursP);

        // Stocker toutes les stats et valeurs pour le plugin
        const statistiques = {
            A: { ...statsA, valeurs: valeursA },
            C: { ...statsC, valeurs: valeursC },
            P: { ...statsP, valeurs: valeursP }
        };


        // Générer les courbes de Gauss
        const courbeA = genererCourbeGauss(statsA.moyenne, statsA.ecartType);
        const courbeC = genererCourbeGauss(statsC.moyenne, statsC.ecartType);
        const courbeP = genererCourbeGauss(statsP.moyenne, statsP.ecartType);

        // Créer les datasets des courbes
        const datasetsCourbes = [
            creerDatasetGauss('Assiduité (A)', courbeA, COULEURS_INDICES.A),
            creerDatasetGauss('Complétion (C)', courbeC, COULEURS_INDICES.C),
            creerDatasetGauss('Performance (P)', courbeP, COULEURS_INDICES.P)
        ].filter(d => d.data && d.data.length > 0);

        // Créer les datasets des points (étudiants individuels sur l'axe X)
        const datasetsPoints = [
            creerDatasetPoints('A', valeursA, COULEURS_INDICES.A),
            creerDatasetPoints('C', valeursC, COULEURS_INDICES.C),
            creerDatasetPoints('P', valeursP, COULEURS_INDICES.P)
        ].filter(d => d.data && d.data.length > 0);

        // Combiner : courbes d'abord, puis points (alterner pour lier visibilité)
        // Format: [courbeA, pointsA, courbeC, pointsC, ...]
        const datasets = [];
        const indicesLabels = ['A', 'C', 'P'];
        indicesLabels.forEach(indice => {
            const courbe = datasetsCourbes.find(d => d.label.includes(`(${indice})`));
            const points = datasetsPoints.find(d => d.label.startsWith(indice));
            if (courbe) datasets.push(courbe);
            if (points) datasets.push(points);
        });

        if (datasetsCourbes.length === 0) {
            console.warn('[Distribution ACP] Aucune donnée à afficher');
            ctx.font = '14px Arial';
            ctx.fillStyle = couleurTexte();
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

                const indices = ['A', 'C', 'P'];
                const couleurs = [COULEURS_INDICES.A, COULEURS_INDICES.C, COULEURS_INDICES.P];

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

                const indices = ['A', 'C', 'P'];
                const couleurs = [COULEURS_INDICES.A, COULEURS_INDICES.C, COULEURS_INDICES.P];

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

        return chart;

    } catch (error) {
        console.error('[creerGraphiqueDistributionACPE] Erreur:', error);
        return null;
    }
}

/* ===============================
   EXPORTS
   =============================== */

/**
 * Toggle la courbe « P sans reprises » dans le graphique individuel d'un étudiant.
 * @param {string} da - Numéro DA de l'étudiant
 * @param {boolean} visible - true pour afficher, false pour masquer
 */
function togglePSansReprisesIndiv(da, visible) {
    var chart = graphiquesIndividuels[da];
    if (!chart) return;
    var datasets = chart.data.datasets;
    for (var i = 0; i < datasets.length; i++) {
        if (datasets[i]._isSansReprises) {
            datasets[i].hidden = !visible;
        }
    }
    if (chartEstValide(chart)) chart.update('none');
}

/**
 * Toggle la visibilité d'un indice (A, C ou P) sur le graphique individuel
 * @param {string} label - Label du dataset ('Assiduité (A)', 'Complétion (C)', 'Performance (P)')
 * @param {boolean} visible - true pour afficher, false pour masquer
 * @param {string} da - Numéro DA de l'étudiant
 */
function toggleIndiceIndiv(label, visible, da) {
    var chart = graphiquesIndividuels[da];
    if (!chart) return;
    chart.data.datasets.forEach(function(ds) {
        if (ds.label === label) {
            ds.hidden = !visible;
        }
    });
    if (chartEstValide(chart)) chart.update('none');
}

/**
 * Registre des instances Chart.js critères par DA (pour toggle externe)
 */
const _chartsCriteres = {};

/**
 * Toggle la visibilité d'un critère sur le graphique critères d'un étudiant
 * @param {string} critere - Nom du critère
 * @param {boolean} visible - true pour afficher, false pour masquer
 * @param {string} da - Numéro DA de l'étudiant
 */
function toggleCritereIndiv(critere, visible, da) {
    const chart = _chartsCriteres[da];
    if (!chart) return;
    chart.data.datasets.forEach(function(ds) {
        if (ds.label === critere) {
            ds.hidden = !visible;
        }
    });
    if (chartEstValide(chart)) chart.update('none');
}

/* ===============================
   GRAPHIQUE ÉVOLUTION RLO (Beta 99.17)
   Ratios Repérage/Liaison/Ouverture par artefact — spec SPEC-EXPORT-GRAPHIQUE-RLO.md
   =============================== */

const _chartsEvolutionRLO = {};

/**
 * Graphique d'évolution des gestes cognitifs (Repérage, Liaison, Ouverture).
 *
 * Trois séries en % (total cognitifs = 100%), axe X = artefacts ordonnés
 * chronologiquement. Un trou d'annotation (`ratios: null`) s'affiche comme un
 * point absent et les segments qui enjambent le trou sont pointillés.
 *
 * @param {string} canvasId
 * @param {string} da
 * @returns {Chart|null}
 */
function creerGraphiqueEvolutionRLO(canvasId, da) {
    try {
        if (typeof actionsRLO === 'undefined' ||
            typeof actionsRLO.obtenirEvolutionRLOEtudiant !== 'function') return null;
        const donnees = actionsRLO.obtenirEvolutionRLOEtudiant(da);
        if (!donnees || !Array.isArray(donnees.artefacts) || donnees.artefacts.length === 0) return null;

        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.parentNode) return null;
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) return null;

        if (_chartsEvolutionRLO[da]) {
            _chartsEvolutionRLO[da].destroy();
            delete _chartsEvolutionRLO[da];
        }
        const existant = Chart.getChart(canvas);
        if (existant) existant.destroy();

        const artefacts = donnees.artefacts;
        // Terme dépendant des réglages (artefact / production / travail / etc.)
        const termeSing = typeof obtenirTermeProduction === 'function'
            ? obtenirTermeProduction('singulier') : 'artefact';
        const termePlurielMaj = typeof obtenirTermeProduction === 'function'
            ? obtenirTermeProduction('pluriel', true) : 'Artefacts';
        // Préfixe court pour les étiquettes de l'axe X : 3 premiers caractères + point
        const prefixeCourt = termeSing.charAt(0).toUpperCase()
            + termeSing.substring(1, 3).toLowerCase() + '.';
        const labels = artefacts.map(function(a) { return prefixeCourt + ' ' + a.numero; });
        const serie = function(cle) {
            return artefacts.map(function(a) { return a.ratios ? a.ratios[cle] : null; });
        };

        // Palette distincte et compatible daltonisme : bleu, orange, vert-émeraude
        const COULEUR_REPERAGE  = '#f59e0b'; // orange-gold : scanner, repérer
        const COULEUR_LIAISON   = '#3b82f6'; // bleu : relier, articuler
        const COULEUR_OUVERTURE = '#10b981'; // émeraude : ouvrir, transférer

        const bordurePt = couleurBordurePoint();
        const construireDataset = function(label, cle, couleur) {
            return {
                label: label,
                data: serie(cle),
                borderColor: couleur,
                backgroundColor: 'transparent',
                borderWidth: STYLE_LIGNE_EPAISSEUR,
                tension: STYLE_LIGNE_TENSION,
                pointRadius: STYLE_POINT_RAYON,
                pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                pointBackgroundColor: couleur,
                pointBorderColor: bordurePt,
                pointBorderWidth: STYLE_POINT_BORDURE,
                spanGaps: false
            };
        };

        const datasets = [
            construireDataset('Repérage',  'reperage',  COULEUR_REPERAGE),
            construireDataset('Liaison',   'liaison',   COULEUR_LIAISON),
            construireDataset('Ouverture', 'ouverture', COULEUR_OUVERTURE)
        ];

        // Plugin : segments pointillés pour traverser les trous d'observation
        const pluginPointillesTrousRLO = {
            id: 'pointillesTrousRLO',
            afterDatasetsDraw: function(chart) {
                const ctx2 = chart.ctx;
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                chart.data.datasets.forEach(function(ds, di) {
                    const meta = chart.getDatasetMeta(di);
                    if (meta.hidden) return;
                    const data = ds.data;
                    let dernierIdx = -1;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i] == null) continue;
                        if (dernierIdx >= 0 && i - dernierIdx > 1) {
                            const x0 = xScale.getPixelForValue(dernierIdx);
                            const y0 = yScale.getPixelForValue(data[dernierIdx]);
                            const x1 = xScale.getPixelForValue(i);
                            const y1 = yScale.getPixelForValue(data[i]);
                            ctx2.save();
                            ctx2.strokeStyle = ds.borderColor || '#999';
                            ctx2.lineWidth = (ds.borderWidth || 2) * 0.7;
                            ctx2.globalAlpha = 0.5;
                            ctx2.setLineDash([6, 4]);
                            ctx2.beginPath();
                            ctx2.moveTo(x0, y0);
                            ctx2.lineTo(x1, y1);
                            ctx2.stroke();
                            ctx2.restore();
                        }
                        dernierIdx = i;
                    }
                });
            }
        };

        const ctx = canvas.getContext('2d');
        const config = {
            type: 'line',
            plugins: [pluginPointillesTrousRLO],
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { right: 15 } },
                plugins: {
                    title: { display: false },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: couleurTexte(),
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        ...STYLE_TOOLTIP,
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            title: function(items) {
                                if (!items.length) return '';
                                const a = artefacts[items[0].dataIndex];
                                return a ? a.titre : '';
                            },
                            label: function(context) {
                                const v = context.parsed.y;
                                return v == null
                                    ? context.dataset.label + ': —'
                                    : context.dataset.label + ': ' + v.toFixed(1) + '%';
                            },
                            afterBody: function(items) {
                                if (!items.length) return [];
                                const a = artefacts[items[0].dataIndex];
                                if (!a) return [];
                                const lignes = [];
                                if (a.niveauFinal) lignes.push('Niveau IDME : ' + a.niveauFinal);
                                if (!a.observe) lignes.push('Non observé');
                                return lignes;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: termePlurielMaj,
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            callback: function(value, index) {
                                const a = artefacts[index];
                                if (!a) return '';
                                const base = prefixeCourt + ' ' + a.numero;
                                return a.niveauFinal ? (base + ' (' + a.niveauFinal + ')') : base;
                            },
                            font: { size: 11 }
                        },
                        grid: { display: true, color: couleurGrille() }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ratio sur gestes cognitifs',
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            color: couleurTexte(),
                            stepSize: 20,
                            callback: function(v) { return v + '%'; }
                        },
                        grid: { display: true, color: couleurGrille() }
                    }
                },
                interaction: { mode: 'nearest', axis: 'xy', intersect: false }
            }
        };

        const chart = new Chart(ctx, config);
        _chartsEvolutionRLO[da] = chart;
        return chart;
    } catch (error) {
        console.error('[creerGraphiqueEvolutionRLO] Erreur :', error);
        return null;
    }
}

/* ===============================
   GRAPHIQUE GROUPE PAR HABILETÉS
   Spaghetti par artefact ; axe Y = moyenne des critères sélectionnés.
   Pédagogie : explorer la trajectoire d'une habileté à travers les artefacts.
   =============================== */

/**
 * État partagé du graphique habiletés (mis à jour par les contrôles UI).
 * criteresActifs = null signifie « pas encore initialisé » → on prend tout.
 */
let etatTrajectoires = {
    mesure: 'noteFinale',
    criteresActifs: null,
    daSurbrillance: '',
    afficherMediane: false
};

let graphiqueTrajectoiresInstance = null;

/**
 * Palette pour ~24 étudiants — luminances variées pour rester distinguables
 * en mode clair et sombre.
 */
const COULEURS_ETUDIANTS_TRAJECTOIRES = [
    '#1976D2', '#FF6B35', '#4CAF50', '#9C27B0',
    '#F44336', '#00BCD4', '#FFC107', '#795548',
    '#3F51B5', '#E91E63', '#009688', '#FF9800',
    '#673AB7', '#8BC34A', '#FF5722', '#607D8B',
    '#2196F3', '#CDDC39', '#FF4081', '#03A9F4',
    '#A1887F', '#26A69A', '#7E57C2', '#66BB6A'
];

function couleurEtudiantTrajectoires(index) {
    return COULEURS_ETUDIANTS_TRAJECTOIRES[index % COULEURS_ETUDIANTS_TRAJECTOIRES.length];
}

/**
 * Quantile par interpolation linéaire (méthode 7 de R, type par défaut de NumPy).
 * @param {Array<number>} trieesAsc - Valeurs triées par ordre croissant
 * @param {number} p - Probabilité [0, 1]
 * @returns {number|null}
 */
function quantileHabiletes(trieesAsc, p) {
    const n = trieesAsc.length;
    if (n === 0) return null;
    if (n === 1) return trieesAsc[0];
    const idx = p * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return trieesAsc[lo];
    return trieesAsc[lo] + (idx - lo) * (trieesAsc[hi] - trieesAsc[lo]);
}

/**
 * Moyenne arithmétique des scores des critères actifs pour une évaluation.
 * En mode Habiletés (1 courbe par habileté), cette fonction est appelée avec
 * un seul critère à la fois — la pondération est donc non pertinente.
 * En mode Note finale, la pondération est déjà appliquée par evaluation.noteFinale.
 *
 * ⮕ #752 : chaque score se convertit dans l'échelle de l'évaluation
 * (`scoreCritereEvaluation`), comme les courbes du profil ; l'ancienne table
 * I/D/M/E en dur de ce fichier est retirée. Un critère renseigné mais non
 * convertible est compté dans `compte.sansValeur` (le graphique le dit).
 * @param {Object} evaluation - Objet evaluation avec un array .criteres
 * @param {Set<string>} criteresActifs - Noms de critères à inclure
 * @param {Map} [cacheTables] - mémo des tables par échelle (une par rendu)
 * @param {{ sansValeur: number }} [compte] - compteur des valeurs non convertibles
 * @returns {number|null} - Moyenne décimale 0-1 (null si aucun critère évaluable)
 */
function moyenneCriteresHabiletes(evaluation, criteresActifs, cacheTables, compte) {
    if (!evaluation || !Array.isArray(evaluation.criteres) || evaluation.criteres.length === 0) {
        return null;
    }
    const table = tableConversionPourEvaluation(evaluation, cacheTables);
    const valeurs = [];
    for (let i = 0; i < evaluation.criteres.length; i++) {
        const c = evaluation.criteres[i];
        if (!c || !c.critereNom) continue;
        if (criteresActifs && !criteresActifs.has(c.critereNom)) continue;
        const enPoints = typeof c.points === 'number' && !isNaN(c.points);
        const niveau = c.niveauSelectionne;
        if (!enPoints && (niveau === null || niveau === undefined || String(niveau).trim() === '')) continue;
        const v = scoreCritereEvaluation(c, table);
        if (v !== null) valeurs.push(v);
        else if (compte) compte.sansValeur += 1;
    }
    if (valeurs.length === 0) return null;
    let s = 0;
    for (let i = 0; i < valeurs.length; i++) s += valeurs[i];
    return s / valeurs.length;
}

/**
 * Liste les critères présents dans les évaluations actives, ordonnés selon
 * l'ordre des grilles (premier match gagne) et coloriés par palette cyclique.
 * @returns {Array<{nom: string, couleur: string}>}
 */
function listerCriteresHabiletes() {
    try {
        const evaluations = (typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
            : [];
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];

        const nomsUtilises = new Set();
        for (let i = 0; i < evaluations.length; i++) {
            const e = evaluations[i];
            if (e && Array.isArray(e.criteres)) {
                for (let j = 0; j < e.criteres.length; j++) {
                    const c = e.criteres[j];
                    if (c && c.critereNom) nomsUtilises.add(c.critereNom);
                }
            }
        }

        if (nomsUtilises.size === 0) return [];

        const ordre = [];
        const dejaAjoutes = new Set();
        for (let i = 0; i < grilles.length; i++) {
            const g = grilles[i];
            if (!g || !Array.isArray(g.criteres)) continue;
            for (let j = 0; j < g.criteres.length; j++) {
                const c = g.criteres[j];
                if (c && c.nom && nomsUtilises.has(c.nom) && !dejaAjoutes.has(c.nom)) {
                    ordre.push(c.nom);
                    dejaAjoutes.add(c.nom);
                }
            }
        }
        nomsUtilises.forEach(nom => {
            if (!dejaAjoutes.has(nom)) {
                ordre.push(nom);
                dejaAjoutes.add(nom);
            }
        });

        const PALETTE = [
            '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4',
            '#4CAF50', '#FF9800', '#795548', '#607D8B'
        ];
        return ordre.map((nom, index) => ({
            nom: nom,
            couleur: PALETTE[index % PALETTE.length]
        }));
    } catch (e) {
        console.warn('[Trajectoires] listerCriteresHabiletes:', e.message || e);
        return [];
    }
}

/**
 * Charge les artefacts (productions évaluables) du cours actif, déduplique,
 * filtre Portfolio et Analyse finale, trie par date d'échéance effective.
 * @returns {Array} productions triées
 */
function chargerProductionsTrajectoires() {
    let productions = (typeof obtenirDonneesSelonMode === 'function')
        ? (obtenirDonneesSelonMode('productions') || [])
        : (db.getSync(cle('productions'), []) || []);

    const vues = new Set();
    const artefacts = productions.filter(p => {
        if (!p || !p.id) return false;
        const titreLower = (p.titre || '').toLowerCase();
        if (titreLower === 'portfolio' || titreLower.startsWith('portfolio ') ||
            p.type === 'portfolio' || p.categorie === 'portfolio') return false;
        if (titreLower.includes('analyse finale') ||
            p.type === 'analyseFinale' || p.categorie === 'analyseFinale') return false;
        if (vues.has(p.id)) return false;
        vues.add(p.id);
        return true;
    });

    const infoCours = db.getSync('infoCours', null);
    const gcId = obtenirIdContexteActif(infoCours);
    artefacts.sort((a, b) => {
        const dA = (typeof obtenirEcheanceEffective === 'function')
            ? (obtenirEcheanceEffective(a, gcId).date || '9999')
            : (a.dateEcheance || '9999');
        const dB = (typeof obtenirEcheanceEffective === 'function')
            ? (obtenirEcheanceEffective(b, gcId).date || '9999')
            : (b.dateEcheance || '9999');
        return dA.localeCompare(dB);
    });

    return artefacts;
}

/**
 * Crée le graphique « Trajectoires par production ».
 *
 * Chaque ligne = trajectoire d'un étudiant à travers les productions.
 * Chaque point = note décimale (0-1) selon le mode de mesure :
 *   - mode 'noteFinale' : evaluation.noteFinale / 100
 *   - mode 'habiletes'  : moyenne des critères cochés (niveauSelectionne)
 *
 * Trous (null) si pas d'évaluation, travail non remis/retard, note absente,
 * ou (en mode habiletés) aucun critère évalué.
 *
 * @param {string} canvasId - ID de l'élément canvas
 * @param {Object} [options]
 * @param {'noteFinale'|'habiletes'} [options.mesure='noteFinale'] - Mesure à afficher
 * @param {Set<string>} [options.criteresActifs] - Critères à agréger (mode habiletés ; défaut : tous)
 * @param {string} [options.daSurbrillance] - DA de l'étudiant à mettre en relief
 * @param {boolean} [options.afficherMediane] - Afficher médiane + bande Q25-Q75
 * @returns {Chart|null}
 */
function creerGraphiqueTrajectoiresProduction(canvasId, options) {
    options = options || {};
    const mode = (options.mesure === 'habiletes') ? 'habiletes' : 'noteFinale';

    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn('[Trajectoires] Canvas introuvable :', canvasId);
            return null;
        }
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();

        // 1. Critères disponibles (mode habiletés uniquement)
        let criteresInfo = [];
        let criteresActifs = null;
        if (mode === 'habiletes') {
            criteresInfo = listerCriteresHabiletes();
            if (criteresInfo.length === 0) {
                afficherMessageAttente(canvas, 'Aucune habileté à afficher',
                    'Les évaluations enregistrées ne contiennent pas encore de critères détaillés.');
                return null;
            }
            criteresActifs = (options.criteresActifs instanceof Set && options.criteresActifs.size > 0)
                ? options.criteresActifs
                : new Set(criteresInfo.map(c => c.nom));
        }

        // 2. Productions / artefacts
        const artefacts = chargerProductionsTrajectoires();
        const termePluriel = (typeof obtenirTermeProduction === 'function')
            ? obtenirTermeProduction('pluriel', true)
            : 'Productions';
        if (artefacts.length === 0) {
            const termeSing = (typeof obtenirTermeProduction === 'function')
                ? obtenirTermeProduction('singulier')
                : 'production';
            afficherMessageAttente(canvas, 'Aucun ' + termeSing + ' défini',
                'Crée des productions dans Conception › Productions.');
            return null;
        }

        // 3. Étudiants
        const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
            ? obtenirEtudiantsCoursActif()
            : ((typeof obtenirDonneesSelonMode === 'function')
                ? (obtenirDonneesSelonMode('groupeEtudiants') || [])
                : (db.getSync(cle('groupeEtudiants'), []) || []));
        if (etudiants.length === 0) {
            afficherMessageAttente(canvas, 'Aucun étudiant',
                'Sélectionne un groupe pour voir les données.');
            return null;
        }

        // 4. Évaluations dédupliquées (la plus récente par DA × productionId)
        const evaluationsBrutes = (typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
            : (db.getSync(cle('evaluationsSauvegardees'), []) || []);
        const evalIndex = new Map();
        for (let i = 0; i < evaluationsBrutes.length; i++) {
            const e = evaluationsBrutes[i];
            if (!e || e.remplaceeParId) continue;
            const k = e.etudiantDA + '_' + e.productionId;
            const ex = evalIndex.get(k);
            if (!ex) {
                evalIndex.set(k, e);
            } else {
                const dE = ex.dateEvaluation || ex.date || '';
                const dN = e.dateEvaluation || e.date || '';
                if (dN > dE) evalIndex.set(k, e);
            }
        }

        // 5. Labels de l'axe X (activité d'apprentissage > description > titre)
        const labels = artefacts.map(a => {
            if (a.activiteApprentissage && a.activiteApprentissage.trim()) return a.activiteApprentissage.trim();
            if (a.description && a.description.trim()) return a.description.trim();
            return a.titre || '';
        });

        // Helper : valeur d'une éval pour UN critère donné (0-1, ou null)
        // #752 : une table par échelle pour tout le rendu, et le compte de ce qui ne se
        // convertit pas — dit sous le graphique en mode habiletés.
        const cacheTables = new Map();
        const compteConversion = { sansValeur: 0 };
        function _valeurEvalCritere(ev, nomCritere) {
            if (!ev) return null;
            if (ev.statutRemise === 'non-remis' || ev.statutRemise === 'retard') return null;
            if (!Array.isArray(ev.criteres) || ev.criteres.length === 0) return null;
            return moyenneCriteresHabiletes(ev, new Set([nomCritere]), cacheTables, compteConversion);
        }

        // 6. Datasets — selon le mode
        let datasets;
        const daSurbrillance = options.daSurbrillance || '';

        if (mode === 'habiletes') {
            // === MODE HABILETÉS — une courbe par critère coché, couleur de la pill ===
            const criteresArr = criteresInfo.filter(c => criteresActifs.has(c.nom));

            // Helper : médiane du groupe pour un critère donné, par artefact
            function _medianeCritere(c) {
                return artefacts.map(art => {
                    const valeurs = [];
                    for (let i = 0; i < etudiants.length; i++) {
                        const etu = etudiants[i];
                        if (typeof estEtudiantExclu === 'function' && estEtudiantExclu(etu)) continue;
                        const ev = evalIndex.get(etu.da + '_' + art.id);
                        const v = _valeurEvalCritere(ev, c.nom);
                        if (v !== null && v !== undefined) valeurs.push(v);
                    }
                    if (valeurs.length === 0) return null;
                    valeurs.sort((a, b) => a - b);
                    return quantileHabiletes(valeurs, 0.5);
                });
            }

            if (daSurbrillance === 'TOUS') {
                // === TOUS — N élèves × M habiletés en courbes fines + médiane par habileté ===
                datasets = [];
                criteresArr.forEach(c => {
                    // 1) Une courbe fine par étudiant pour ce critère (couleur de la pill, faible opacité)
                    etudiants.forEach(etu => {
                        if (typeof estEtudiantExclu === 'function' && estEtudiantExclu(etu)) return;
                        const data = artefacts.map(art => {
                            const ev = evalIndex.get(etu.da + '_' + art.id);
                            return _valeurEvalCritere(ev, c.nom);
                        });
                        if (data.every(v => v === null)) return;
                        const nomAnon = (typeof anonymiserNom === 'function') ? anonymiserNom(etu.da) : null;
                        const nom = nomAnon || (etu.prenom && etu.nom
                            ? (etu.prenom + ' ' + etu.nom)
                            : (etu.nom || ('DA ' + etu.da)));
                        datasets.push({
                            label: c.nom + ' — ' + nom,
                            da: etu.da,
                            _critereNom: c.nom,
                            _critereCouleur: c.couleur,
                            _isStudentCritere: true,
                            data: data,
                            borderColor: hexVersRgba(c.couleur, 0.22),
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            tension: STYLE_LIGNE_TENSION,
                            pointRadius: 2,
                            pointHoverRadius: 5,
                            pointStyle: 'circle',
                            pointBackgroundColor: hexVersRgba(c.couleur, 0.22),
                            pointBorderColor: 'transparent',
                            pointBorderWidth: 0,
                            spanGaps: false,
                            order: 5
                        });
                    });
                    // 2) Médiane de l'habileté par-dessus (gras, losanges)
                    const med = _medianeCritere(c);
                    if (!med.every(v => v === null)) {
                        datasets.push({
                            label: c.nom + ' (médiane)',
                            _critereNom: c.nom,
                            _critereCouleur: c.couleur,
                            data: med,
                            borderColor: c.couleur,
                            backgroundColor: 'transparent',
                            borderWidth: 3,
                            tension: STYLE_LIGNE_TENSION,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointStyle: 'rectRot',
                            pointBackgroundColor: c.couleur,
                            pointBorderColor: couleurBordurePoint(),
                            pointBorderWidth: 2,
                            spanGaps: false,
                            order: -10
                        });
                    }
                });
            } else {
                // === Single élève (daSurbrillance) OU aucun (médiane seule) ===
                datasets = criteresArr.map(c => {
                    const data = daSurbrillance
                        ? artefacts.map(art => _valeurEvalCritere(evalIndex.get(daSurbrillance + '_' + art.id), c.nom))
                        : _medianeCritere(c);
                    if (data.every(v => v === null)) return null;
                    return {
                        label: c.nom,
                        _critereNom: c.nom,
                        _critereCouleur: c.couleur,
                        data: data,
                        borderColor: c.couleur,
                        backgroundColor: 'transparent',
                        borderWidth: 2.5,
                        tension: STYLE_LIGNE_TENSION,
                        pointRadius: STYLE_POINT_RAYON,
                        pointHoverRadius: STYLE_POINT_RAYON_HOVER,
                        pointStyle: 'circle',
                        pointBackgroundColor: c.couleur,
                        pointBorderColor: couleurBordurePoint(),
                        pointBorderWidth: STYLE_POINT_BORDURE,
                        spanGaps: false
                    };
                }).filter(d => d !== null);

                // Bandes Q25-Q75 par critère (vue groupe seulement, pas pour un seul élève)
                if (!daSurbrillance) {
                    criteresArr.forEach(c => {
                        const q25 = [];
                        const q75 = [];
                        artefacts.forEach(art => {
                            const valeurs = [];
                            etudiants.forEach(etu => {
                                if (typeof estEtudiantExclu === 'function' && estEtudiantExclu(etu)) return;
                                const ev = evalIndex.get(etu.da + '_' + art.id);
                                const v = _valeurEvalCritere(ev, c.nom);
                                if (v !== null && v !== undefined) valeurs.push(v);
                            });
                            if (valeurs.length === 0) {
                                q25.push(null); q75.push(null);
                            } else {
                                valeurs.sort((a, b) => a - b);
                                q25.push(quantileHabiletes(valeurs, 0.25));
                                q75.push(quantileHabiletes(valeurs, 0.75));
                            }
                        });
                        datasets.push({
                            label: c.nom + ' Q25',
                            _isStat: true,
                            _hideFromLegend: true,
                            data: q25,
                            borderColor: 'transparent',
                            backgroundColor: hexVersRgba(c.couleur, 0.12),
                            fill: '+1',
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            tension: STYLE_LIGNE_TENSION,
                            order: 10,
                            spanGaps: false
                        });
                        datasets.push({
                            label: c.nom + ' Q75',
                            _isStat: true,
                            _hideFromLegend: true,
                            data: q75,
                            borderColor: 'transparent',
                            backgroundColor: 'transparent',
                            fill: false,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            tension: STYLE_LIGNE_TENSION,
                            order: 10,
                            spanGaps: false
                        });
                    });
                }
            }
        } else {
            // === MODE NOTE FINALE — une courbe par étudiant, toutes même couleur ===
            // Volontairement uniforme : la lecture est une « nuage » de trajectoires,
            // pas une identification individuelle. La sélection met en relief.
            const couleurNoteFinale = COULEURS_INDICES.P;
            datasets = etudiants.map((etudiant, index) => {
                const da = etudiant.da;
                const data = artefacts.map(art => {
                    const ev = evalIndex.get(da + '_' + art.id);
                    if (!ev) return null;
                    if (ev.statutRemise === 'non-remis' || ev.statutRemise === 'retard') return null;
                    if (!Array.isArray(ev.criteres) || ev.criteres.length === 0) return null;
                    const note = ev.noteFinale;
                    if (note === null || note === undefined) return null;
                    return note / 100;
                });
                if (data.every(v => v === null)) return null;

                const couleur = couleurNoteFinale;
                const exclu = (typeof estEtudiantExclu === 'function') && estEtudiantExclu(etudiant);
                const nomAnonyme = (typeof anonymiserNom === 'function') ? anonymiserNom(da) : null;
                const nom = nomAnonyme || (etudiant.prenom && etudiant.nom
                    ? (etudiant.prenom + ' ' + etudiant.nom)
                    : (etudiant.nom || ('DA ' + da)));

                return {
                    label: nom,
                    da: da,
                    _couleurBase: couleur,
                    exclu: exclu,
                    data: data,
                    borderColor: exclu ? 'rgba(150,150,150,0.35)' : hexVersRgba(couleur, 0.4),
                    backgroundColor: 'transparent',
                    borderWidth: exclu ? 1.5 : STYLE_LIGNE_EPAISSEUR,
                    borderDash: exclu ? [6, 4] : [],
                    tension: STYLE_LIGNE_TENSION,
                    pointRadius: exclu ? 2 : STYLE_POINT_RAYON,
                    pointHoverRadius: exclu ? 3 : STYLE_POINT_RAYON_HOVER,
                    pointStyle: 'circle',
                    pointBackgroundColor: exclu ? 'rgba(150,150,150,0.35)' : hexVersRgba(couleur, 0.4),
                    pointBorderColor: exclu ? 'transparent' : couleurBordurePoint(),
                    pointBorderWidth: exclu ? 0 : STYLE_POINT_BORDURE,
                    spanGaps: false
                };
            }).filter(d => d !== null);

            // Médiane + bande globale (mode noteFinale uniquement)
            if (options.afficherMediane === true && datasets.length > 0) {
                const mediane = [];
                const q25 = [];
                const q75 = [];
                for (let i = 0; i < artefacts.length; i++) {
                    const valeurs = [];
                    for (let j = 0; j < datasets.length; j++) {
                        const ds = datasets[j];
                        if (ds.exclu) continue;
                        const v = ds.data[i];
                        if (v !== null && v !== undefined) valeurs.push(v);
                    }
                    if (valeurs.length === 0) {
                        mediane.push(null); q25.push(null); q75.push(null);
                    } else {
                        valeurs.sort((a, b) => a - b);
                        mediane.push(quantileHabiletes(valeurs, 0.5));
                        q25.push(quantileHabiletes(valeurs, 0.25));
                        q75.push(quantileHabiletes(valeurs, 0.75));
                    }
                }
                const estClair = document.body.classList.contains('mode-clair');
                const couleurMed = estClair ? '#1a1a2e' : '#e6e9ec';
                const couleurBande = estClair ? 'rgba(26, 26, 46, 0.10)' : 'rgba(230, 233, 236, 0.10)';

                datasets.push({
                    label: 'Quartile 25 %',
                    data: q25,
                    _isStat: true,
                    _legendText: 'Bande inter-quartile (Q25–Q75)',
                    _legendFill: couleurBande.replace(/[\d.]+\)$/, '0.35)'),
                    _legendStroke: 'transparent',
                    borderColor: 'transparent',
                    backgroundColor: couleurBande,
                    fill: '+1',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: STYLE_LIGNE_TENSION,
                    order: 10,
                    spanGaps: false
                });
                datasets.push({
                    label: 'Quartile 75 %',
                    data: q75,
                    _isStat: true,
                    _hideFromLegend: true,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: STYLE_LIGNE_TENSION,
                    order: 10,
                    spanGaps: false
                });
                datasets.push({
                    label: 'Médiane du groupe',
                    data: mediane,
                    _isStat: true,
                    _legendText: 'Médiane du groupe',
                    _legendFill: couleurMed,
                    _legendStroke: couleurMed,
                    _legendLineWidth: 3,
                    borderColor: couleurMed,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: STYLE_LIGNE_TENSION,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointStyle: 'rectRot',
                    pointBackgroundColor: couleurMed,
                    pointBorderColor: couleurBordurePoint(),
                    pointBorderWidth: 2,
                    order: -10,
                    spanGaps: false
                });
            }
        }

        if (datasets.length === 0 || datasets.every(d => d._isStat)) {
            afficherMessageAttente(canvas, 'Aucune trajectoire disponible',
                mode === 'habiletes'
                    ? 'Aucune évaluation ne correspond aux critères sélectionnés.'
                    : 'Aucune note enregistrée pour les évaluations actives.');
            return null;
        }

        // 7. Validations canvas (visible, attaché)
        if (!canvas.parentNode || !canvas.ownerDocument) {
            console.warn('[Trajectoires] Canvas détaché du DOM');
            return null;
        }
        if (!canvas.offsetParent && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
            console.warn('[Trajectoires] Canvas non visible — graphique différé');
            return null;
        }

        const ctx = canvas.getContext('2d');
        const bornesY = calculerBornesYDynamiques(datasets);

        // 8. Titre dynamique de l'axe Y
        const labelNote = obtenirLabelNoteFinale();
        let titreY;
        if (mode === 'noteFinale') {
            titreY = labelNote;
        } else if (daSurbrillance === 'TOUS') {
            titreY = (criteresActifs.size === 1)
                ? 'Toutes les courbes — ' + Array.from(criteresActifs)[0]
                : 'Toutes les courbes par habileté';
        } else if (daSurbrillance) {
            const eleve = etudiants.find(e => e.da === daSurbrillance);
            const nomAnon = (typeof anonymiserNom === 'function') ? anonymiserNom(daSurbrillance) : null;
            const nom = nomAnon || (eleve && eleve.prenom && eleve.nom
                ? (eleve.prenom + ' ' + eleve.nom).trim()
                : (eleve && eleve.nom ? eleve.nom : 'l\'étudiant·e'));
            titreY = 'Habiletés de ' + nom;
        } else {
            titreY = (criteresActifs.size === 1)
                ? 'Médiane du groupe — ' + Array.from(criteresActifs)[0]
                : 'Médiane du groupe par habileté';
        }

        // Légende : visible seulement en mode noteFinale avec médiane active.
        // En mode habiletés, les pills critères jouent déjà ce rôle (évite la redondance).
        const afficherLegende = (mode === 'noteFinale' && options.afficherMediane === true);

        // Tooltip mode-aware
        let tooltipConfig;
        if (mode === 'noteFinale') {
            tooltipConfig = {
                ...STYLE_TOOLTIP,
                enabled: true,
                mode: 'point',
                intersect: true,
                displayColors: false,
                callbacks: {
                    title: function(items) {
                        if (!items || items.length === 0) return '';
                        const it = items[0];
                        const ds = it.dataset;
                        return (ds && ds.label ? ds.label + ' — ' : '') + it.label;
                    },
                    label: function(ctxItem) {
                        const v = ctxItem.parsed.y;
                        if (v === null || v === undefined) return '';
                        return (v * 100).toFixed(0) + '%';
                    }
                }
            };
        } else if (daSurbrillance === 'TOUS') {
            // TOUS : trop de courbes pour 'index', on reste en 'point' / intersect
            tooltipConfig = {
                ...STYLE_TOOLTIP,
                enabled: true,
                mode: 'point',
                intersect: true,
                displayColors: true,
                callbacks: {
                    title: function(items) { return (items && items[0]) ? items[0].label : ''; },
                    label: function(ctxItem) {
                        const v = ctxItem.parsed.y;
                        if (v === null || v === undefined) return '';
                        return (ctxItem.dataset.label || '') + ' — ' + (v * 100).toFixed(0) + '%';
                    }
                }
            };
        } else {
            // Habiletés (single élève ou médiane) : 'index' montre toutes les habiletés au même x
            tooltipConfig = {
                ...STYLE_TOOLTIP,
                enabled: true,
                mode: 'index',
                intersect: false,
                displayColors: true,
                filter: function(ti) { return !ti.dataset || !ti.dataset._isStat; },
                callbacks: {
                    title: function(items) { return (items && items[0]) ? items[0].label : ''; },
                    label: function(ctxItem) {
                        const v = ctxItem.parsed.y;
                        if (v === null || v === undefined) return '';
                        return (ctxItem.dataset.label || '') + ' — ' + (v * 100).toFixed(0) + '%';
                    }
                }
            };
        }

        // #860 (lot F, 16 sept. 2026) : les lignes de seuil et les lettres de niveaux ne se
        // dessinent qu'en mode Habiletés, où les points SONT des niveaux d'évaluations (#752).
        // En mode Note finale — un pourcentage du cours — aucune zone, et plus de marge droite
        // pour des lettres qui n'existent plus (même motif que le septième site de #575).
        const avecZones = mode === 'habiletes'
            && (typeof obtenirPreference === 'function' && obtenirPreference('afficherSeuilsVisuels') !== false);
        const config = {
            type: 'line',
            plugins: [pluginGradientFond, ...(avecZones ? [pluginEtiquettesZones] : [])],
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { right: mode === 'habiletes' ? 120 : 0 } },
                plugins: {
                    title: { display: false },
                    legend: {
                        display: afficherLegende,
                        position: 'bottom',
                        align: 'start',
                        onClick: function() { /* désactivé */ },
                        labels: {
                            color: couleurTexte(),
                            font: { size: 11 },
                            boxWidth: 28,
                            boxHeight: 12,
                            padding: 14,
                            generateLabels: function(chart) {
                                const items = [];
                                const couleurTxt = couleurTexte();
                                chart.data.datasets.forEach(function(ds, idx) {
                                    if (ds._hideFromLegend) return;
                                    if (mode === 'habiletes') {
                                        if (ds._isStat) return;
                                        items.push({
                                            text: ds.label,
                                            fillStyle: ds.borderColor || ds.backgroundColor,
                                            strokeStyle: ds.borderColor || 'transparent',
                                            lineWidth: 2,
                                            fontColor: couleurTxt,
                                            hidden: false,
                                            datasetIndex: idx
                                        });
                                    } else {
                                        if (!ds._isStat) return;
                                        items.push({
                                            text: ds._legendText || ds.label,
                                            fillStyle: ds._legendFill || ds.backgroundColor || ds.borderColor,
                                            strokeStyle: ds._legendStroke || ds.borderColor || 'transparent',
                                            lineWidth: ds._legendLineWidth || 1,
                                            fontColor: couleurTxt,
                                            hidden: false,
                                            datasetIndex: idx
                                        });
                                    }
                                });
                                return items;
                            }
                        }
                    },
                    tooltip: tooltipConfig
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: termePluriel,
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            font: { size: 10 },
                            maxRotation: 45,
                            minRotation: 30
                        },
                        grid: { display: true, color: couleurGrille() }
                    },
                    y: {
                        min: bornesY.min,
                        max: bornesY.max,
                        title: {
                            display: true,
                            text: titreY,
                            color: couleurTexte(),
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte(),
                            callback: v => (v * 100).toFixed(0) + '%',
                            stepSize: 0.05
                        },
                        grid: { display: true, color: couleurGrille() }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                }
            }
        };

        // #752 — en mode habiletés, les zones sont celles de l'échelle des évaluations
        // tracées (la majoritaire), et le graphique dit ce qu'il n'a pas pu convertir.
        // #860 — en mode note finale (un pourcentage du cours), aucune zone : l'entrée du
        // canvas est retirée et le plugin n'est pas monté.
        const noteConversion = document.getElementById('trajectoires-note-conversion');
        if (mode === 'habiletes') {
            const echelles = echelleMajoritaireDesEvaluations(Array.from(evalIndex.values()));
            _zonesParCanvas.set(canvas, echelles.echelle ? genererZonesDepuisEchelle(echelles.echelle) : []);
            const lignes = [];
            if (compteConversion.sansValeur > 0) {
                lignes.push(compteConversion.sansValeur + ' valeur' + (compteConversion.sansValeur > 1 ? 's' : '') + ' sans valeur convertible dans cette échelle');
            }
            if (echelles.distinctes > 1 && echelles.echelle) {
                lignes.push('Zones : échelle « ' + (echelles.echelle.nom || echelles.echelle.id) + ' » (' + echelles.nb + ' évaluations sur ' + echelles.total + ')');
            }
            if (noteConversion) { noteConversion.textContent = lignes.join(' · '); noteConversion.hidden = lignes.length === 0; }
        } else {
            _zonesParCanvas.delete(canvas);
            if (noteConversion) { noteConversion.textContent = ''; noteConversion.hidden = true; }
        }

        const chart = new Chart(ctx, config);
        graphiqueTrajectoiresInstance = chart;

        // Peupler le sélecteur d'élève
        // - Mode noteFinale : -- Sélectionner -- + élèves (par DA)
        // - Mode habiletés  : -- Sélectionner -- + Tous les élèves (TOUS) + élèves
        const selecteur = document.getElementById('selecteur-etudiant-trajectoires');
        if (selecteur) {
            const valeurAvant = selecteur.value;
            selecteur.innerHTML = '';
            const optDefaut = document.createElement('option');
            optDefaut.value = '';
            optDefaut.textContent = '-- Sélectionner --';
            selecteur.appendChild(optDefaut);
            if (mode === 'habiletes') {
                const optTous = document.createElement('option');
                optTous.value = 'TOUS';
                optTous.textContent = 'Tous les étudiant·e·s';
                selecteur.appendChild(optTous);
            }
            etudiants.forEach(etu => {
                const da = etu.da;
                const exclu = (typeof estEtudiantExclu === 'function') && estEtudiantExclu(etu);
                const nomAnon = (typeof anonymiserNom === 'function') ? anonymiserNom(da) : null;
                const nom = nomAnon || (etu.prenom && etu.nom
                    ? (etu.prenom + ' ' + etu.nom)
                    : (etu.nom || ('DA ' + da)));
                const opt = document.createElement('option');
                opt.value = String(da);
                opt.textContent = exclu ? (nom + ' (inactif)') : nom;
                selecteur.appendChild(opt);
            });
            if (valeurAvant && Array.from(selecteur.options).some(o => o.value === valeurAvant)) {
                selecteur.value = valeurAvant;
            }
        }

        return chart;

    } catch (error) {
        console.error('[Trajectoires] Erreur création graphique :', error);
        return null;
    }
}

/**
 * Retourne le libellé de la note finale selon la pratique active.
 * - PAN-Maîtrise : « Note chiffrée » (vocabulaire du formulaire d'évaluation)
 * - Sommative ou autre : « Note finale »
 */
function obtenirLabelNoteFinale() {
    try {
        // #328 L2-b2 : type dérivé de la SSOT groupesCours[].pratiqueId (helper D2).
        const pratique = (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null);   // lot N1b : aucun repli
        return (pratique === 'standards') ? 'Note chiffrée' : 'Note finale';
    } catch (e) {
        return 'Note chiffrée';
    }
}

/**
 * Rafraîchit le graphique trajectoires en lisant l'état actuel des contrôles
 * (mesure + checkboxes critères + toggle médiane). La surbrillance étudiant
 * est gérée séparément par selectionnerEtudiantTrajectoires() pour éviter un
 * rebuild complet.
 */
function rafraichirGraphiqueTrajectoires() {
    const selMesure = document.getElementById('selecteur-mesure-trajectoires');
    const mesure = (selMesure && selMesure.value === 'habiletes') ? 'habiletes' : 'noteFinale';

    const checkboxes = document.querySelectorAll('#trajectoires-criteres-checkboxes input[type="checkbox"]');
    const actifs = new Set();
    checkboxes.forEach(function(cb) {
        const nom = cb.dataset.critereNom;
        if (cb.checked && nom) actifs.add(nom);
    });

    const toggleMediane = document.getElementById('trajectoires-toggle-mediane');
    const afficherMediane = !!(toggleMediane && toggleMediane.checked);

    const selecteur = document.getElementById('selecteur-etudiant-trajectoires');
    const daAvant = selecteur ? selecteur.value : '';

    etatTrajectoires.mesure = mesure;
    etatTrajectoires.criteresActifs = actifs.size > 0 ? actifs : null;
    etatTrajectoires.afficherMediane = afficherMediane;
    etatTrajectoires.daSurbrillance = daAvant;

    creerGraphiqueTrajectoiresProduction('graphique-trajectoires-production', {
        mesure: mesure,
        criteresActifs: etatTrajectoires.criteresActifs,
        afficherMediane: etatTrajectoires.afficherMediane,
        daSurbrillance: daAvant
    });

    // En mode noteFinale, restituer la surbrillance par restyle in-place
    // (en mode habiletés, le rebuild a déjà rendu les valeurs de l'élève)
    if (mesure === 'noteFinale' && daAvant !== '') {
        selectionnerEtudiantTrajectoires();
    }
    _majBoutonProfilTrajectoires();
    if (typeof _majSousTitreTrajectoires === 'function') {
        _majSousTitreTrajectoires();
    }
}

/**
 * Ouvre le profil de l'élève actuellement en relief dans le graphique Trajectoires.
 * Le sélecteur stocke le DA dans option.value. La valeur 'TOUS' est ignorée.
 */
function ouvrirProfilEleveTrajectoires() {
    const select = document.getElementById('selecteur-etudiant-trajectoires');
    if (!select || !select.value || select.value === 'TOUS') return;
    if (typeof tbNavigerVersProfil === 'function') {
        tbNavigerVersProfil(select.value);
    }
}

/**
 * Met à jour la visibilité du bouton 👤 selon la sélection courante.
 * Visible seulement quand un élève réel est sélectionné (pas TOUS, pas vide).
 */
function _majBoutonProfilTrajectoires() {
    const btn = document.getElementById('btn-profil-trajectoires');
    const select = document.getElementById('selecteur-etudiant-trajectoires');
    if (!btn || !select) return;
    const isReelEleve = select.value && select.value !== '' && select.value !== 'TOUS';
    btn.style.display = isReelEleve ? 'inline-flex' : 'none';
}

/**
 * Met en relief la courbe de l'étudiant sélectionné.
 * - Mode Note finale : restyle in-place via appliquerStyleSpaghetti (rapide).
 * - Mode Habiletés : rebuild complet, car la source des données change
 *   (médiane du groupe → valeurs de l'élève).
 */
function selectionnerEtudiantTrajectoires() {
    const selMesure = document.getElementById('selecteur-mesure-trajectoires');
    const mesure = (selMesure && selMesure.value === 'habiletes') ? 'habiletes' : 'noteFinale';

    if (mesure === 'habiletes') {
        rafraichirGraphiqueTrajectoires();
        return;
    }

    // Mode Note finale — restyle in-place
    const chart = graphiqueTrajectoiresInstance;
    if (!chartEstValide(chart)) return;

    const selecteur = document.getElementById('selecteur-etudiant-trajectoires');
    if (!selecteur) return;

    const da = selecteur.value;
    const datasets = chart.data.datasets;

    if (da === '') {
        datasets.forEach(function(ds) {
            if (ds._isStat) return;
            const couleur = ds._couleurBase || '#888';
            appliquerStyleSpaghetti(ds, 'defaut', couleur);
        });
        etatTrajectoires.daSurbrillance = '';
    } else {
        datasets.forEach(function(ds) {
            if (ds._isStat) return;
            const couleur = ds._couleurBase || '#888';
            if (ds.da === da) {
                appliquerStyleSpaghetti(ds, 'actif', couleur);
                etatTrajectoires.daSurbrillance = da;
            } else {
                appliquerStyleSpaghetti(ds, 'inactif', couleur);
            }
        });
    }

    _majBoutonProfilTrajectoires();
    chart.update('none');
}

// Exporter les fonctions pour utilisation globale
window.toggleIndiceIndiv = toggleIndiceIndiv;
window.toggleCritereIndiv = toggleCritereIndiv;
window.togglePSansReprisesIndiv = togglePSansReprisesIndiv;
window.creerGraphiqueIndividuel = creerGraphiqueIndividuel;
window.rafraichirGraphiqueIndividuel = rafraichirGraphiqueIndividuel;
window.creerGraphiqueGroupeSpaghettiACP = creerGraphiqueGroupeSpaghettiACP;
window.rafraichirGraphiqueSpaghettiACP = rafraichirGraphiqueSpaghettiACP;
window.selectionnerEtudiantACP = selectionnerEtudiantACP;
window.ouvrirProfilEleveACP = ouvrirProfilEleveACP;
window.creerGraphiqueCriteres = creerGraphiqueCriteres;
window.creerGraphiqueDistributionACPE = creerGraphiqueDistributionACPE;
window.creerGraphiqueEvolutionRLO = creerGraphiqueEvolutionRLO;
window.creerGraphiqueTrajectoiresProduction = creerGraphiqueTrajectoiresProduction;
window.rafraichirGraphiqueTrajectoires = rafraichirGraphiqueTrajectoires;
window.selectionnerEtudiantTrajectoires = selectionnerEtudiantTrajectoires;
window.ouvrirProfilEleveTrajectoires = ouvrirProfilEleveTrajectoires;
window.listerCriteresHabiletes = listerCriteresHabiletes;
window.obtenirLabelNoteFinale = obtenirLabelNoteFinale;
window.detruireGraphique = detruireGraphique;

// Recréer les graphiques visibles lors d'un changement de mode (Normal / Anonymisation / Démo)
window.addEventListener('modeChanged', function() {
    if (typeof rafraichirGraphiqueSpaghettiACP === 'function' && document.getElementById('graphique-groupe-moyennes')) {
        try { rafraichirGraphiqueSpaghettiACP(); } catch(e) { console.warn('[Graphiques] spaghettiACP mode refresh skipped:', e.message || e); }
    }
    if (typeof rafraichirGraphiqueTrajectoires === 'function' && document.getElementById('graphique-trajectoires-production')) {
        try { rafraichirGraphiqueTrajectoires(); } catch(e) { console.warn('[Graphiques] trajectoires mode refresh skipped:', e.message || e); }
    }
    if (typeof rafraichirGraphiqueIndividuel === 'function' && window.profilActuelDA) {
        var canvasIdMode = 'graphique-progression-' + window.profilActuelDA;
        if (document.getElementById(canvasIdMode)) {
            try { rafraichirGraphiqueIndividuel(window.profilActuelDA); } catch(e) { console.warn('[Graphiques] individuel mode refresh skipped:', e.message || e); }
        }
    }
});

// Recréer les graphiques visibles lors d'un changement de thème
window.addEventListener('themeChanged', function() {
    // Les graphiques seront recréés avec les bonnes couleurs
    // lors du prochain appel de rafraîchissement de la section
    if (typeof rafraichirGraphiqueIndividuel === 'function' && window.profilActuelDA) {
        var canvasId = 'graphique-progression-' + window.profilActuelDA;
        if (document.getElementById(canvasId)) {
            rafraichirGraphiqueIndividuel(window.profilActuelDA);
        }
    }
    if (typeof rafraichirGraphiqueSpaghettiACP === 'function') {
        try { rafraichirGraphiqueSpaghettiACP(); } catch(e) { console.warn('[Graphiques] spaghettiACP refresh skipped (section not visible):', e.message || e); }
    }
    if (typeof rafraichirGraphiqueTrajectoires === 'function' && document.getElementById('graphique-trajectoires-production')) {
        try { rafraichirGraphiqueTrajectoires(); } catch(e) { console.warn('[Graphiques] trajectoires refresh skipped:', e.message || e); }
    }
    // Graphique évolution RLO : recréer si un canvas est actuellement dans le DOM
    if (window.profilActuelDA) {
        var canvasRLO = document.getElementById('graphique-evolution-rlo-' + window.profilActuelDA);
        if (canvasRLO) {
            try { creerGraphiqueEvolutionRLO(canvasRLO.id, window.profilActuelDA); }
            catch(e) { console.warn('[Graphiques] evolutionRLO refresh skipped:', e.message || e); }
        }
    }
});



})();
