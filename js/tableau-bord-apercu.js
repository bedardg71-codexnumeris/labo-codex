/* ===============================
   MODULE: TABLEAU DE BORD - APERÇU
   Calculs des indices A-C-P et affichage des métriques globales
   =============================== */

/**
 * MODULE: tableau-bord-apercu.js
 *
 * RÔLE:
 * Calcule et affiche les statistiques pédagogiques du tableau de bord
 * - Métriques globales du groupe (indices A-C-P)
 * - Distribution des niveaux d'engagement
 * - Alertes prioritaires (étudiants à engagement insuffisant)
 *
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique pour compenser décroissance multiplicative)
 *
 * DÉPENDANCES:
 * - LocalStorage: groupeEtudiants, presences, evaluationsSauvegardees
 * - Modules: 09-2-saisie-presences.js (pour calculs assiduité)
 */

/* ===============================
   🔧 FONCTIONS HELPERS
   =============================== */

/**
 * Génère un badge HTML indiquant la pratique de notation active
 * @returns {string} - HTML du badge avec icône et texte
 */
function genererBadgePratique() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratique = config.pratique || 'alternative';
    const typePAN = config.typePAN || 'maitrise';
    const affichage = config.affichageTableauBord || {};

    let texte = '';
    let couleur = '';
    let description = '';

    if (affichage.afficherSommatif && affichage.afficherAlternatif) {
        // Mode hybride
        texte = 'Mode Hybride (SOM + PAN)';
        couleur = '#9c27b0'; // Violet
        description = 'Comparaison expérimentale des deux pratiques';
    } else if (pratique === 'sommative') {
        texte = 'Sommative traditionnelle (SOM)';
        couleur = '#ff6f00'; // Orange
        description = 'Moyenne pondérée provisoire';
    } else {
        // PAN
        const typesPAN = {
            'maitrise': 'Maîtrise (IDME)',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        texte = `Alternative - ${typesPAN[typePAN] || 'PAN'}`;
        couleur = '#0277bd'; // Bleu
        description = 'N meilleurs artefacts';
    }

    return `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
                     background: ${couleur}15; border: 1.5px solid ${couleur}; border-radius: 20px;
                     font-size: 0.85rem; font-weight: 600; color: ${couleur}; margin-left: 12px;"
              title="${description}">
            ${texte}
        </span>
    `;
}

/**
 * Génère un badge compact indiquant la source des données (SOM, PAN, ou Hybride)
 * Pour les sections du tableau de bord
 * @returns {string} - HTML du badge
 */
function genererBadgeSourceDonnees() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSommatif = affichage.afficherSommatif !== false;
    const afficherAlternatif = affichage.afficherAlternatif !== false;

    let texte = '';
    let couleur = '';
    let titre = '';

    if (afficherSommatif && afficherAlternatif) {
        // Mode hybride - les cartes montrent déjà (SOM) et (PAN)
        texte = 'Hybride';
        couleur = '#9c27b0';
        titre = 'Affichage des deux pratiques';
    } else if (afficherSommatif) {
        texte = 'Source : SOM';
        couleur = '#ff6f00';
        titre = 'Données calculées selon pratique sommative';
    } else {
        texte = 'Source : PAN';
        couleur = '#0277bd';
        titre = 'Données calculées selon pratique alternative';
    }

    return `
        <span style="display: inline-block; padding: 3px 10px; background: ${couleur}15;
                     border: 1px solid ${couleur}; border-radius: 12px;
                     font-size: 0.75rem; font-weight: 700; color: ${couleur};
                     margin-left: 8px; vertical-align: middle;"
              title="${titre}">
            ${texte}
        </span>
    `;
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module du tableau de bord - aperçu
 * Appelée par main.js au chargement
 */
function initialiserModuleTableauBordApercu() {
    console.log('Module Tableau de bord - Aperçu initialisé');

    // Charger les statistiques si la sous-section aperçu est active
    const apercu = document.getElementById('tableau-bord-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }
}

/* ===============================
   📈 FONCTION PRINCIPALE
   =============================== */

function chargerTableauBordApercu() {
    console.log('Chargement du tableau de bord - aperçu');

    // 🔄 Calculer les indices C et P (SOM + PAN) avant l'affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    } else {
        console.warn('⚠️ calculerEtStockerIndicesCP non disponible - Module portfolio.js non chargé ?');
    }

    try {
        const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiants = typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(tousEtudiants)
            : tousEtudiants.filter(e => e.groupe !== '9999');

        const etudiantsActifs = etudiants.filter(e =>
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );

        // Ajouter les indices (structure : {sommatif: {...}, alternatif: {...}})
        const etudiantsAvecIndices = etudiantsActifs.map(etudiant => {
            const indices = calculerIndicesEtudiant(etudiant.da);
            return {
                ...etudiant,
                ...indices  // Ajoute sommatif et alternatif
            };
        });

        // Ajouter l'indicateur de pratique ou les checkboxes selon le mode
        const titre = document.querySelector('#tableau-bord-apercu h2');
        if (titre) {
            const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
            const affichage = config.affichageTableauBord || {};

            // NOUVEAU Beta 90 : Détection automatique du mode comparatif
            // Si les deux pratiques sont affichées (OU si le flag explicite est true), c'est comparatif
            const afficherSom = affichage.afficherSommatif !== false;
            const afficherPan = affichage.afficherAlternatif !== false;
            const modeComparatif = (afficherSom && afficherPan) || affichage.modeComparatif === true;

            titre.innerHTML = '';
            const conteneurTitre = document.createElement('div');

            // Layout uniforme : titre à gauche, badges à droite
            conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
            conteneurTitre.innerHTML = `
                <span>Vue d'ensemble</span>
                ${genererIndicateurPratiqueOuCheckboxes()}
            `;

            titre.appendChild(conteneurTitre);
        }

        // Afficher tout (sans noms d'étudiants dans l'aperçu)
        afficherMetriquesGlobales(etudiantsAvecIndices);
        afficherAlertesPrioritairesCompteurs(etudiantsAvecIndices);
        afficherPatternsApprentissage(etudiantsAvecIndices);
        afficherNiveauxRaI(etudiantsAvecIndices);

        console.log('✅ Tableau de bord chargé (aperçu anonyme)');

    } catch (error) {
        console.error('❌ Erreur chargement tableau de bord:', error);
    }
}

/**
 * Génère soit un badge de pratique simple, soit les checkboxes selon le mode
 * @returns {string} HTML du badge ou des checkboxes
 */
function genererIndicateurPratiqueOuCheckboxes() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;

    // NOUVEAU Beta 90 : Détection automatique du mode comparatif
    // Si les deux pratiques sont affichées, c'est le mode comparatif
    const modeComparatif = afficherSom && afficherPan;

    // MODE COMPARATIF: Afficher deux badges informatifs côte à côte
    // (similaires aux badges utilisés dans le profil étudiant)
    if (modeComparatif) {
        return `
            <div style="display: flex; gap: 10px; align-items: center;">
                ${genererBadgePratique('SOM', true)}
                ${genererBadgePratique('PAN', true)}
            </div>
        `;
    }

    // MODE NORMAL: Afficher un simple badge identifiant la pratique
    const pratique = afficherSom ? 'SOM' : 'PAN';

    // Utiliser la fonction globale unique (compact = true)
    return genererBadgePratique(pratique, true);
}


/* ===============================
   🧮 CALCULS DES INDICES
   =============================== */

/**
 * Récupère les indices calculés pour un étudiant
 * Retourne TOUJOURS sommatif ET alternatif
 * C'est l'affichage qui décide quoi montrer
 *
 * LECTURE DEPUIS STRUCTURE DUALE (SOM + PAN) :
 * - indicesCP[da].actuel.SOM → indices sommatifs
 * - indicesCP[da].actuel.PAN → indices alternatifs
 *
 * @param {string} da - DA de l'étudiant
 * @returns {Object} Indices complets { sommatif: {...}, alternatif: {...} }
 */
function calculerIndicesEtudiant(da) {
    // Récupérer les indices A depuis saisie-presences.js
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesA = obtenirDonneesSelonMode('indicesAssiduite') || {};

    // Récupérer les indices C et P depuis portfolio.js (Single Source of Truth)
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const indicesCPEtudiant = indicesCP[da]?.actuel || null;

    // 🔀 LECTURE DEPUIS LES DEUX BRANCHES
    const indicesSOM = indicesCPEtudiant?.SOM || null;
    const indicesPAN = indicesCPEtudiant?.PAN || null;

    // Structure complète avec sommatif ET alternatif
    // IMPORTANT: indicesA contient maintenant des objets { indice, heuresPresentes, heuresOffertes, nombreSeances }
    const assiduiteSommatif = indicesA.sommatif?.[da];
    const assiduiteAlternatif = indicesA.alternatif?.[da];

    const indices = {
        sommatif: {
            assiduite: (typeof assiduiteSommatif === 'object') ? assiduiteSommatif.indice : (assiduiteSommatif || 0),
            completion: indicesSOM ? indicesSOM.C / 100 : 0,
            performance: indicesSOM ? indicesSOM.P / 100 : 0
        },
        alternatif: {
            assiduite: (typeof assiduiteAlternatif === 'object') ? assiduiteAlternatif.indice : (assiduiteAlternatif || 0),
            completion: indicesPAN ? indicesPAN.C / 100 : 0,
            performance: indicesPAN ? indicesPAN.P / 100 : 0
        }
    };

    // ========================================
    // DÉCOUPLAGE P/R : Lire P_recent si activé pour PAN
    // ========================================
    let P_recent_PAN = null;
    if (indicesPAN && indicesPAN.details && indicesPAN.details.decouplerPR &&
        indicesPAN.details.P_recent !== null && indicesPAN.details.P_recent !== undefined) {
        P_recent_PAN = indicesPAN.details.P_recent / 100; // Convertir en proportion 0-1
        console.log(`[Découplage P/R] DA ${da}: P_recent=${indicesPAN.details.P_recent}% utilisé pour calcul risque PAN`);
    }

    // Calculer l'engagement pour les deux pratiques (E = racine cubique de A × C × P)
    indices.sommatif.engagement = calculerEngagement(
        indices.sommatif.assiduite,
        indices.sommatif.completion,
        indices.sommatif.performance
    );
    indices.sommatif.niveauEngagement = determinerNiveauEngagement(indices.sommatif.engagement);

    // Pour PAN: utiliser P_recent si découplage activé, sinon P normal
    const P_pour_engagement_PAN = P_recent_PAN !== null ? P_recent_PAN : indices.alternatif.performance;
    indices.alternatif.engagement = calculerEngagement(
        indices.alternatif.assiduite,
        indices.alternatif.completion,
        P_pour_engagement_PAN
    );
    indices.alternatif.niveauEngagement = determinerNiveauEngagement(indices.alternatif.engagement);

    return indices;
}

/**
 * Calcule le niveau d'engagement
 * FORMULE: E = (A × C × P)^(1/3) (racine cubique)
 * La racine cubique compense la décroissance multiplicative
 * Exemple: 80% × 80% × 80% = 51.2% → racine cubique → 80%
 *
 * @param {number} assiduite - Indice A (0-1)
 * @param {number} completion - Indice C (0-1)
 * @param {number} performance - Indice P (0-1)
 * @returns {number} Engagement entre 0 et 1
 */
function calculerEngagement(assiduite, completion, performance) {
    // Calcul du produit A × C × P
    const E_brut = assiduite * completion * performance;

    // Appliquer la racine cubique pour compenser la décroissance multiplicative
    const E_ajuste = Math.pow(E_brut, 1/3);

    return E_ajuste;
}

/**
 * Détermine le niveau d'engagement selon les seuils
 *
 * Seuils (échelle positive, inversée par rapport au risque):
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 *
 * @param {number} engagement - Indice d'engagement (0-1)
 * @returns {string} Niveau d'engagement
 */
function determinerNiveauEngagement(engagement) {
    if (engagement >= 0.80) return 'très favorable';
    if (engagement >= 0.65) return 'favorable';
    if (engagement >= 0.50) return 'modéré';
    if (engagement >= 0.30) return 'fragile';
    return 'insuffisant';
}

/* ===============================
   AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Affiche les métriques globales du groupe avec barres de distribution
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;

    // Préparer les données pour chaque métrique
    const etudiantsSOM_A = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.assiduite
    }));

    const etudiantsPAN_A = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.assiduite
    }));

    const etudiantsSOM_C = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.completion
    }));

    const etudiantsPAN_C = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.completion
    }));

    const etudiantsSOM_P = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.performance
    }));

    const etudiantsPAN_P = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.performance
    }));

    const etudiantsSOM_E = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.engagement
    }));

    const etudiantsPAN_E = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.engagement
    }));

    // Trouver la carte des indicateurs globaux
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteIndicateurs = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Indicateurs globaux")) {
            carteIndicateurs = carte;
        }
    });

    if (!carteIndicateurs) return;

    // Conserver le header et la note toggle
    const noteToggle = carteIndicateurs.querySelector('.carte-info-toggle');
    const header = carteIndicateurs.querySelector('h3');

    carteIndicateurs.innerHTML = '';
    carteIndicateurs.appendChild(header);
    if (noteToggle) carteIndicateurs.appendChild(noteToggle);

    // Générer la légende unique en haut
    const legendeUnique = `
        <div class="distribution-legende-commune" style="position: relative; height: 40px; font-size: 0.8rem; color: #666; margin-bottom: 20px; padding: 0 20px;">
            <div style="display: flex; justify-content: space-around; align-items: center; height: 100%;">
                <span style="color: #ff9800; text-align: center; font-weight: 600;">Fragile<br><span style="font-size: 0.7rem; font-weight: 400;">30-49%</span></span>
                <span style="color: #ffc107; text-align: center; font-weight: 600;">Modéré<br><span style="font-size: 0.7rem; font-weight: 400;">50-64%</span></span>
                <span style="color: #28a745; text-align: center; font-weight: 600;">Favorable<br><span style="font-size: 0.7rem; font-weight: 400;">65-79%</span></span>
                <span style="color: #2196F3; text-align: center; font-weight: 600;">Très favorable<br><span style="font-size: 0.7rem; font-weight: 400;">≥ 80%</span></span>
            </div>
        </div>
    `;

    // Générer les 4 barres de distribution
    const html = `
        <div style="padding: 20px;">
            ${legendeUnique}
            ${genererBarreDistribution('Assiduité (A)', etudiantsSOM_A, etudiantsPAN_A, 'A', afficherSom, afficherPan)}
            ${genererBarreDistribution('Complétion (C)', etudiantsSOM_C, etudiantsPAN_C, 'C', afficherSom, afficherPan)}
            ${genererBarreDistribution('Performance (P)', etudiantsSOM_P, etudiantsPAN_P, 'P', afficherSom, afficherPan)}
            ${genererBarreDistribution('Engagement (E)', etudiantsSOM_E, etudiantsPAN_E, 'E', afficherSom, afficherPan)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte de métrique avec les valeurs SOM et PAN
 * Format standard: fond blanc avec fine bordure
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 * @param {string} label - Nom de la métrique
 * @param {number} valeurSom - Valeur SOM
 * @param {number} valeurPan - Valeur PAN
 * @param {boolean} afficherSom - Afficher SOM
 * @param {boolean} afficherPan - Afficher PAN
 * @returns {string} HTML de la carte
 */
function genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan, description = '') {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong style="font-size: 1.8rem; color: var(--som-orange); font-weight: 700;">${formatPourcentage(valeurSom)}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong style="font-size: 1.8rem; color: var(--pan-bleu); font-weight: 700;">${formatPourcentage(valeurPan)}</strong>`);
    }

    // Intégrer la description dans le label si présente
    const labelComplet = description ? `${label} <span style="font-size: 0.75rem; color: #666;">(${description})</span>` : label;

    return `
        <div class="carte-metrique">
            <span class="label">${labelComplet}</span>
            <div style="display: flex; gap: 15px; align-items: baseline;">
                ${valeurs.join('')}
            </div>
        </div>
    `;
}

/* ===============================
   NOUVELLES FONCTIONS : BARRES DE DISTRIBUTION
   =============================== */

/**
 * Génère une barre de distribution visuelle pour A, C, P ou E
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {string} label - Nom de la métrique (ex: "Assiduité")
 * @param {Array} etudiantsSOM - [{da, nom, prenom, valeur}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, valeur}] pour PAN
 * @param {string} type - Type de métrique ('A', 'C', 'P', 'E')
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre de distribution
 */
function genererBarreDistribution(label, etudiantsSOM, etudiantsPAN, type, afficherSom, afficherPan) {
    // Gradient de couleurs selon les seuils d'engagement (4 zones, sans Insuffisant)
    // Orange (30-49%) → Jaune (50-64%) → Vert (65-79%) → Bleu (≥80%)
    // Transitions douces entre les couleurs
    const gradient = `linear-gradient(to right,
        #ff9800 0%,
        #ffc107 25%,
        #28a745 50%,
        #2196F3 75%)`;

    // Générer les points pour SOM avec jitter aléatoire
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesSOM = {};
        etudiantsSOM.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesSOM[scoreArrondi]) {
                groupesSOM[scoreArrondi] = [];
            }
            groupesSOM[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesSOM).forEach(score => {
            const etudiants = groupesSOM[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter léger : ±0.3% horizontal, ±8px vertical
                const jitterH = (Math.random() - 0.5) * 0.6; // -0.3% à +0.3%
                const jitterV = (Math.random() - 0.5) * 16; // -8px à +8px
                lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                    style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                    data-valeur="${Math.round(e.valeur * 100)}%"
                    title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : ${Math.round(e.valeur * 100)}%"></div>`;
            });
        });
    }

    // Générer les points pour PAN avec jitter aléatoire
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesPAN = {};
        etudiantsPAN.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesPAN[scoreArrondi]) {
                groupesPAN[scoreArrondi] = [];
            }
            groupesPAN[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesPAN).forEach(score => {
            const etudiants = groupesPAN[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter léger : ±0.3% horizontal, ±8px vertical
                const jitterH = (Math.random() - 0.5) * 0.6; // -0.3% à +0.3%
                const jitterV = (Math.random() - 0.5) * 16; // -8px à +8px
                lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                    style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                    data-valeur="${Math.round(e.valeur * 100)}%"
                    title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : ${Math.round(e.valeur * 100)}%"></div>`;
            });
        });
    }

    return `
        <div class="distribution-container" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; font-size: 0.95rem; color: #333;">${label}</h4>
            <div class="distribution-barre-container" style="position: relative; height: 30px; background: ${gradient}; border-radius: 6px;">
                ${lignesSOM}
                ${lignesPAN}
            </div>
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les patterns d'apprentissage
 * 4 zones : Stable (vert) | Défi (bleu) | Émergent (jaune) | Critique (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, pattern}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, pattern}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan) {
    // 4 zones égales de 25% chacune
    const gradient = `linear-gradient(to right,
        #4caf50 0%, #4caf50 25%,
        #9c27b0 25%, #9c27b0 50%,
        #ffc107 50%, #ffc107 75%,
        #ff9800 75%, #ff9800 100%)`;

    // Mapper les patterns aux positions (centre de chaque zone)
    const positionPattern = {
        'stable': 12.5,          // Centre de 0-25%
        'progression': 12.5,
        'defi-specifique': 37.5, // Centre de 25-50%
        'blocage-emergent': 62.5,// Centre de 50-75%
        'blocage-critique': 87.5 // Centre de 75-100%
    };

    // Générer les points pour SOM avec jitter (nuage de points)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const position = positionPattern[e.pattern] || 50;
            const jitterH = (Math.random() - 0.5) * 0.6; // ±0.3%
            const jitterV = (Math.random() - 0.5) * 16; // ±8px
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                data-pattern="${e.pattern}"
                title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : ${e.pattern}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const position = positionPattern[e.pattern] || 50;
            const jitterH = (Math.random() - 0.5) * 0.6; // ±0.3%
            const jitterV = (Math.random() - 0.5) * 16; // ±8px
            lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                data-pattern="${e.pattern}"
                title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : ${e.pattern}"></div>`;
        });
    }

    return `
        <div class="distribution-container" style="margin-bottom: 30px;">
            <h4 style="margin-bottom: 10px; font-size: 0.95rem; color: #333;">Répartition des patterns d'apprentissage</h4>
            <div class="distribution-barre-container" style="position: relative; height: 60px; background: ${gradient}; border-radius: 6px; margin-bottom: 10px;">
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende" style="position: relative; height: 30px; font-size: 0.75rem; color: #666;">
                <span style="position: absolute; left: 12.5%; transform: translateX(-50%); color: #4caf50; text-align: center;">Progression<br>stable</span>
                <span style="position: absolute; left: 37.5%; transform: translateX(-50%); color: #9c27b0; text-align: center;">Défi<br>spécifique</span>
                <span style="position: absolute; left: 62.5%; transform: translateX(-50%); color: #ffc107; text-align: center;">Blocage<br>émergent</span>
                <span style="position: absolute; left: 87.5%; transform: translateX(-50%); color: #ff9800; text-align: center;">Blocage<br>critique</span>
            </div>
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les niveaux RàI
 * 3 zones : Niveau 1 (vert) | Niveau 2 (jaune) | Niveau 3 (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, niveau}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, niveau}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan) {
    // 3 zones : 0-33% vert, 33-66% jaune, 66-100% orange
    const gradient = `linear-gradient(to right,
        #4caf50 0%, #4caf50 33%,
        #ffc107 33%, #ffc107 66%,
        #ff9800 66%, #ff9800 100%)`;

    // Mapper les niveaux aux positions (centre de chaque zone)
    const positionNiveau = {
        1: 16.5,  // Centre de 0-33%
        2: 49.5,  // Centre de 33-66%
        3: 83     // Centre de 66-100%
    };

    // Générer les points pour SOM avec jitter (nuage de points)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const position = positionNiveau[e.niveau] || 50;
            const jitterH = (Math.random() - 0.5) * 0.6; // ±0.3%
            const jitterV = (Math.random() - 0.5) * 16; // ±8px
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                data-niveau="${e.niveau}"
                title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : Niveau ${e.niveau}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const position = positionNiveau[e.niveau] || 50;
            const jitterH = (Math.random() - 0.5) * 0.6; // ±0.3%
            const jitterV = (Math.random() - 0.5) * 16; // ±8px
            lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                style="left: calc(${position}% + ${jitterH}%); top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}"
                data-niveau="${e.niveau}"
                title="${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)} : Niveau ${e.niveau}"></div>`;
        });
    }

    return `
        <div class="distribution-container" style="margin-bottom: 30px;">
            <h4 style="margin-bottom: 10px; font-size: 0.95rem; color: #333;">Modèle de la Réponse à l'intervention (RàI)</h4>
            <div class="distribution-barre-container" style="position: relative; height: 60px; background: ${gradient}; border-radius: 6px; margin-bottom: 10px;">
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende" style="position: relative; height: 30px; font-size: 0.75rem; color: #666;">
                <span style="position: absolute; left: 16.5%; transform: translateX(-50%); color: #4caf50; text-align: center;">Niveau 1<br>Universel</span>
                <span style="position: absolute; left: 49.5%; transform: translateX(-50%); color: #ffc107; text-align: center;">Niveau 2<br>Préventif</span>
                <span style="position: absolute; left: 83%; transform: translateX(-50%); color: #ff9800; text-align: center;">Niveau 3<br>Intensif</span>
            </div>
        </div>
    `;
}

/**
 * Affiche les compteurs de niveaux d'engagement
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritairesCompteurs(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;
    const nbTotal = etudiants.length;

    // Calculer les statistiques pour SOM
    let somTresFavorable = 0, somFavorable = 0, somModere = 0, somFragile = 0, somInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.sommatif.niveauEngagement;
        if (niveau === 'très favorable') somTresFavorable++;
        else if (niveau === 'favorable') somFavorable++;
        else if (niveau === 'modéré') somModere++;
        else if (niveau === 'fragile') somFragile++;
        else if (niveau === 'insuffisant') somInsuffisant++;
    });

    // Calculer les statistiques pour PAN
    let panTresFavorable = 0, panFavorable = 0, panModere = 0, panFragile = 0, panInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.alternatif.niveauEngagement;
        if (niveau === 'très favorable') panTresFavorable++;
        else if (niveau === 'favorable') panFavorable++;
        else if (niveau === 'modéré') panModere++;
        else if (niveau === 'fragile') panFragile++;
        else if (niveau === 'insuffisant') panInsuffisant++;
    });

    // Trouver la carte Niveau d'engagement
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteEngagement = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && (h3.textContent.includes("Niveau d'engagement") || h3.textContent.includes("Risque d'échec"))) {
            carteEngagement = carte;
        }
    });

    if (!carteEngagement) return;

    // Conserver le header et la note toggle
    const noteToggle = carteEngagement.querySelector('.carte-info-toggle');
    const header = carteEngagement.querySelector('h3');

    carteEngagement.innerHTML = '';
    carteEngagement.appendChild(header);
    if (noteToggle) carteEngagement.appendChild(noteToggle);

    // Générer les cartes (ordre inversé : favorable en haut, insuffisant en bas)
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${genererCarteEngagement('Engagement favorable', somTresFavorable + somFavorable, panTresFavorable + panFavorable, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCarteEngagement('Engagement modéré', somModere, panModere, nbTotal, afficherSom, afficherPan, '#fffbf0', '#fbc02d')}
            ${genererCarteEngagement('Engagement fragile', somFragile, panFragile, nbTotal, afficherSom, afficherPan, '#fff8f0', 'var(--risque-tres-eleve)')}
            ${genererCarteEngagement('Engagement insuffisant', somInsuffisant, panInsuffisant, nbTotal, afficherSom, afficherPan, '#fff5f5', 'var(--risque-critique)')}
        </div>
    `;

    carteEngagement.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte d'engagement avec les valeurs SOM et PAN colorées
 */
function genererCarteEngagement(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--som-orange); font-weight: 700;">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--pan-bleu); font-weight: 700;">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: #666;">${label}</span>
                <div style="display: flex; gap: 15px; align-items: baseline;">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche la liste des étudiants à engagement insuffisant
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 * @param {boolean} afficherSommatif - Utiliser les indices sommatifs
 */
function afficherListeEtudiantsCritiques(etudiants, afficherSommatif) {
    const container = document.getElementById('tb-etudiants-critique');
    if (!container) return;

    const etudiantsCritiques = etudiants
        .filter(e => {
            const niveau = afficherSommatif ? e.sommatif.niveauEngagement : e.alternatif.niveauEngagement;
            return niveau === 'insuffisant';
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        });

    container.innerHTML = etudiantsCritiques.map(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center;
                        padding: 12px; background: white; border-radius: 6px;
                        border-left: 4px solid var(--risque-critique);">
                <div>
                    <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                    <span style="color: #666; margin-left: 10px;">(${echapperHtml(e.groupe || '—')})</span>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        A: ${formatPourcentage(indices.assiduite)} |
                        C: ${formatPourcentage(indices.completion)} |
                        P: ${formatPourcentage(indices.performance)}
                    </div>
                </div>
                <button class="btn btn-principal"
                        onclick="afficherSection('etudiants'); setTimeout(() => { afficherSousSection('profil-etudiant'); chargerProfilEtudiant('${e.da}'); }, 100);"
                        style="padding: 6px 12px; font-size: 0.9rem;">
                    Voir profil
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Génère une carte de pattern avec valeurs SOM et PAN colorées
 */
function genererCartePattern(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--som-orange); font-weight: 700;">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--pan-bleu); font-weight: 700;">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: #666;">${label}</span>
                <div style="display: flex; gap: 15px; align-items: baseline;">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche les patterns d'apprentissage
 * En mode hybride, affiche SOM et PAN côte à côte
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherPatternsApprentissage(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;

    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    const pratiqueSOM = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('sommative') : null;
    const pratiquePAN = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('pan-maitrise') : null;

    // Préparer les données pour SOM
    const etudiantsSOM = [];
    if (pratiqueSOM) {
        etudiants.forEach(e => {
            const patternInfo = pratiqueSOM.identifierPattern(e.da);
            const type = patternInfo ? patternInfo.type : null;

            // Normaliser le type
            const typeNormalise = type ? type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') : null;

            if (typeNormalise) {
                etudiantsSOM.push({
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    pattern: typeNormalise
                });
            }
        });
    }

    // Préparer les données pour PAN
    const etudiantsPAN = [];
    if (pratiquePAN) {
        etudiants.forEach(e => {
            const patternInfo = pratiquePAN.identifierPattern(e.da);
            const type = patternInfo ? patternInfo.type : null;

            // Normaliser le type
            const typeNormalise = type ? type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') : null;

            if (typeNormalise) {
                etudiantsPAN.push({
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    pattern: typeNormalise
                });
            }
        });
    }

    // Trouver le conteneur de la section Patterns
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let cartePatterns = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("patterns")) {
            cartePatterns = carte;
        }
    });

    if (!cartePatterns) return;

    // Conserver le header et les notes
    const noteToggle = cartePatterns.querySelector('.carte-info-toggle');
    const header = cartePatterns.querySelector('h3');

    cartePatterns.innerHTML = '';
    cartePatterns.appendChild(header);
    if (noteToggle) cartePatterns.appendChild(noteToggle);

    // Générer la barre de distribution
    const html = `
        <div style="padding: 20px;">
            ${genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan)}
        </div>
    `;

    cartePatterns.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte RàI avec valeurs SOM et PAN colorées
 */
function genererCarteRaI(label, description, valeurSomPct, valeurPanPct, valeurSomCount, valeurPanCount, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--som-orange); font-weight: 700;">${valeurSomPct}%</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong style="font-size: 1.5rem; color: var(--pan-bleu); font-weight: 700;">${valeurPanPct}%</strong>`);
    }

    // Générer le texte du nombre d'étudiants
    let texteEtudiants = '';
    if (afficherSom && afficherPan) {
        texteEtudiants = `${valeurSomCount} / ${valeurPanCount} étudiants – ${description}`;
    } else if (afficherSom) {
        texteEtudiants = `${valeurSomCount} étudiants – ${description}`;
    } else if (afficherPan) {
        texteEtudiants = `${valeurPanCount} étudiants – ${description}`;
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: #666;">${label}</span>
                <div style="display: flex; gap: 15px; align-items: baseline;">
                    ${valeurs.join('')}
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 4px;">${texteEtudiants}</div>
        </div>
    `;
}

/**
 * Affiche les niveaux RàI (Réponse à l'intervention)
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherNiveauxRaI(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;

    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    const pratiqueSOM = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('sommative') : null;
    const pratiquePAN = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('pan-maitrise') : null;

    // Préparer les données pour SOM
    const etudiantsSOM = [];
    if (pratiqueSOM) {
        etudiants.forEach(e => {
            const cibleInfo = pratiqueSOM.genererCibleIntervention(e.da);
            const niveau = cibleInfo ? cibleInfo.niveau : null;

            if (niveau) {
                etudiantsSOM.push({
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    niveau: niveau
                });
            }
        });
    }

    // Préparer les données pour PAN
    const etudiantsPAN = [];
    if (pratiquePAN) {
        etudiants.forEach(e => {
            const cibleInfo = pratiquePAN.genererCibleIntervention(e.da);
            const niveau = cibleInfo ? cibleInfo.niveau : null;

            if (niveau) {
                etudiantsPAN.push({
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    niveau: niveau
                });
            }
        });
    }

    // Trouver le conteneur de la section RàI
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteRaI = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Réponse à l'intervention")) {
            carteRaI = carte;
        }
    });

    if (!carteRaI) return;

    // Conserver le header et les notes
    const noteToggle = carteRaI.querySelector('.carte-info-toggle');
    const header = carteRaI.querySelector('h3');

    carteRaI.innerHTML = '';
    carteRaI.appendChild(header);
    if (noteToggle) carteRaI.appendChild(noteToggle);

    // Générer la barre de distribution
    const html = `
        <div style="padding: 20px;">
            ${genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan)}
        </div>
    `;

    carteRaI.insertAdjacentHTML('beforeend', html);
}

/**
 * ANCIENNE FONCTION (Beta 89 et antérieur) - OBSOLÈTE depuis Beta 90
 *
 * Cette fonction calculait les patterns directement selon les indices A-C-P.
 * Elle est désormais remplacée par l'appel à pratique.identifierPattern(da)
 * qui délègue la détection de pattern à la pratique active.
 *
 * Conservée en commentaire pour référence et compréhension de l'ancienne logique.
 *
 * @deprecated Utiliser pratique.identifierPattern(da) à la place
 */
/*
function determinerPattern(indices) {
    const {assiduite, completion, performance, niveauRisque} = indices;

    // Stable: tous les indices > 0.75, risque faible/minimal
    if (assiduite >= 0.75 && completion >= 0.75 && performance >= 0.75) {
        return 'stable';
    }

    // Critique: niveau de risque critique
    if (niveauRisque === 'critique') {
        return 'critique';
    }

    // Émergent: assiduité OK mais complétion ou performance en baisse
    if (assiduite >= 0.75 && (completion < 0.65 || performance < 0.65)) {
        return 'émergent';
    }

    // Défi: au moins un indice sous 0.75 mais pas de blocage critique
    return 'défi';
}
*/

/**
 * Affiche les actions recommandées (Top 5)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherActionsRecommandees(etudiants) {
    const container = document.getElementById('tb-liste-actions');
    const messageVide = document.getElementById('tb-aucune-action');

    if (!container) return;

    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;

    // Filtrer étudiants à engagement faible et trier par priorité (engagement croissant)
    const etudiantsAEngagementFaible = etudiants
        .filter(e => {
            const engagement = afficherSommatif ? e.sommatif.engagement : e.alternatif.engagement;
            return engagement < 0.50; // Seuil: modéré ou moins
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        })
        .slice(0, 5); // Top 5

    if (etudiantsAEngagementFaible.length === 0) {
        container.style.display = 'none';
        if (messageVide) messageVide.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (messageVide) messageVide.style.display = 'none';

    container.innerHTML = etudiantsAEngagementFaible.map((e, index) => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const recommendation = genererRecommandation(indices);

        return `
            <div style="padding: 15px; background: white; border-radius: 8px;
                        border-left: 4px solid ${getCouleurEngagement(indices.niveauEngagement)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span style="display: inline-block; width: 24px; height: 24px;
                                     background: ${getCouleurEngagement(indices.niveauEngagement)};
                                     color: white; border-radius: 50%; text-align: center;
                                     line-height: 24px; font-weight: bold; margin-right: 10px;">
                            ${index + 1}
                        </span>
                        <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                        <span style="color: #666; margin-left: 8px;">(${echapperHtml(e.groupe || '—')})</span>
                    </div>
                    <span class="badge-engagement engagement-${indices.niveauEngagement.replace(' ', '-')}"
                          style="text-transform: capitalize;">
                        ${indices.niveauEngagement}
                    </span>
                </div>
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                    ${recommendation}
                </div>
                <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                    <span>A: ${formatPourcentage(indices.assiduite)}</span> |
                    <span>C: ${formatPourcentage(indices.completion)}</span> |
                    <span>P: ${formatPourcentage(indices.performance)}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Génère une recommandation d'action selon les indices
 *
 * @param {Object} indices - Indices A-C-P
 * @returns {string} Recommandation pédagogique
 */
function genererRecommandation(indices) {
    const {assiduite, completion, performance} = indices;

    // Identifier le défi principal
    if (assiduite < 0.65) {
        return "<strong>Priorité: Assiduité</strong> - Contacter l'étudiant pour comprendre les absences et proposer un soutien";
    }
    if (completion < 0.65) {
        return "📝 <strong>Priorité: Complétion</strong> - Rencontre pour identifier les obstacles et établir un échéancier réaliste";
    }
    if (performance < 0.65) {
        return "🎯 <strong>Priorité: Performance</strong> - Offrir du soutien pédagogique et des stratégies d'apprentissage";
    }
    if (assiduite < 0.75) {
        return "⚠️ <strong>Suivi: Assiduité</strong> - Surveiller l'évolution et encourager la régularité";
    }
    if (completion < 0.75) {
        return "⚠️ <strong>Suivi: Complétion</strong> - Rappeler les échéances et vérifier la charge de travail";
    }
    if (performance < 0.75) {
        return "⚠️ <strong>Suivi: Performance</strong> - Proposer des ressources complémentaires";
    }

    return "✓ Situation sous contrôle - Maintenir le suivi régulier";
}

/**
 * Retourne la couleur CSS selon le niveau d'engagement
 *
 * @param {string} niveau - Niveau d'engagement
 * @returns {string} Couleur CSS
 */
function getCouleurEngagement(niveau) {
    const couleurs = {
        'très favorable': '#2196F3',  // Bleu - Très bon
        'favorable': '#388e3c',        // Vert - Bon
        'modéré': '#fbc02d',           // Jaune - Attention
        'fragile': '#f57c00',          // Orange - Préoccupant
        'insuffisant': '#d32f2f'       // Rouge - Critique
    };
    return couleurs[niveau] || '#999';
}

/**
 * Affiche la distribution des niveaux de risque
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherDistributionRisques(etudiants) {
    const container = document.getElementById('tb-distribution-risques');
    if (!container) return;
    
    // Compter par niveau de risque
    const distribution = {
        'minimal': 0,
        'faible': 0,
        'modéré': 0,
        'élevé': 0,
        'très élevé': 0,
        'critique': 0
    };
    
    etudiants.forEach(e => {
        distribution[e.niveauRisque]++;
    });
    
    // Couleurs selon le niveau
    const couleurs = {
        'minimal': 'var(--risque-nul)',
        'faible': 'var(--risque-minimal)',
        'modéré': 'var(--risque-modere)',
        'élevé': 'var(--risque-eleve)',
        'très élevé': '#c0392b',
        'critique': '#7f0000'
    };
    
    // Générer le HTML
    container.innerHTML = Object.entries(distribution).map(([niveau, nombre]) => `
        <div style="padding: 15px; background: white; border-left: 4px solid ${couleurs[niveau]}; 
                    border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 1.5rem; font-weight: bold; color: ${couleurs[niveau]};">
                ${nombre}
            </div>
            <div style="font-size: 0.85rem; color: #666; text-transform: capitalize;">
                ${niveau}
            </div>
        </div>
    `).join('');
}

/**
 * Affiche les alertes prioritaires (étudiants à risque)
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritaires(etudiants) {
    const container = document.getElementById('tb-alertes-prioritaires');
    if (!container) return;
    
    // Filtrer les étudiants avec risque ≥ élevé (seuil 0.4)
    const etudiantsARisque = etudiants
        .filter(e => e.risque >= 0.4)
        .sort((a, b) => b.risque - a.risque);  // Tri décroissant
    
    if (etudiantsARisque.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; padding: 30px; color: green;">
                ✅ Aucune intervention urgente requise
            </p>
        `;
        return;
    }
    
    // Générer le tableau
    container.innerHTML = `
        <table class="tableau" style="margin-top: 15px;">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Groupe</th>
                    <th>Assiduité</th>
                    <th>Complétion</th>
                    <th>Performance</th>
                    <th>Niveau de risque</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${etudiantsARisque.map(e => `
                    <tr>
                        <td><strong>${echapperHtml(e.nom)}</strong></td>
                        <td>${echapperHtml(e.prenom)}</td>
                        <td>${echapperHtml(e.groupe || '—')}</td>
                        <td>${formatPourcentage(e.assiduite)}</td>
                        <td>${formatPourcentage(e.completion)}</td>
                        <td>${formatPourcentage(e.performance)}</td>
                        <td>
                            <span class="badge-risque risque-${e.niveauRisque.replace(' ', '-')}" 
                                  style="text-transform: capitalize;">
                                ${e.niveauRisque}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-principal" 
                                    onclick="afficherSousSection('tableau-bord-profil'); chargerProfilEtudiant('${e.da}')"
                                    style="padding: 6px 12px; font-size: 0.9rem;">
                                Voir profil
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

/**
 * Met à jour le texte d'un élément HTML
 * 
 * @param {string} id - ID de l'élément
 * @param {string|number} valeur - Valeur à afficher
 */
function setStatText(id, valeur) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = valeur;
    } else {
        console.warn(`⚠️ Élément ${id} non trouvé`);
    }
}

/**
 * Formate un nombre en pourcentage
 *
 * @param {number} valeur - Valeur entre 0 et 1
 * @returns {string} Pourcentage formaté (ex: "87%")
 */
function formatPourcentage(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) {
        return '—';
    }
    return Math.round(valeur * 100) + '%';
}

/**
 * Met à jour la largeur d'une barre de progression
 *
 * @param {string} id - ID de l'élément barre
 * @param {number} pourcentage - Pourcentage de largeur (0-100)
 */
function setBarre(id, pourcentage) {
    const element = document.getElementById(id);
    if (element) {
        element.style.width = Math.round(pourcentage) + '%';
    }
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js : echapperHtml()
 * - 09-2-saisie-presences.js : calculerNombreSeances() (optionnel)
 * - styles.css : classes badge-risque, carte-metrique, tableau
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module doit être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ (lecture seule):
 * - 'groupeEtudiants' : Array des étudiants
 * - 'presences' : Array des présences
 * - 'evaluationsSauvegardees' : Array des évaluations
 * - 'productions' : Array des productions
 * 
 * HTML REQUIS:
 * Éléments avec IDs dans la sous-section tableau-bord-apercu:
 * - tb-total-etudiants
 * - tb-assiduite-moyenne
 * - tb-completion-moyenne
 * - tb-performance-moyenne
 * - tb-interventions-requises
 * - tb-distribution-risques
 * - tb-alertes-prioritaires
 * 
 * FORMULES UTILISÉES (Guide de monitorage):
 * - Assiduité (A) : SOMME(heures présent) / TOTAL(heures cours)
 * - Complétion (C) : NOMBRE(remis) / NOMBRE(attendus)
 * - Performance (P) : MOYENNE(3 derniers IDME) / 4
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique)
 *
 * SEUILS D'ENGAGEMENT:
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 */