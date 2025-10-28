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
 * - Distribution des niveaux de risque
 * - Alertes prioritaires (étudiants à risque élevé)
 * 
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
 * - Risque : 1 - (A × C × P)
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
            const modeComparatif = affichage.afficherSommatif && affichage.afficherAlternatif;

            titre.innerHTML = '';
            const conteneurTitre = document.createElement('div');

            if (modeComparatif) {
                // Mode comparatif: checkboxes à droite
                conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
                conteneurTitre.innerHTML = `
                    <span>Vue d'ensemble</span>
                    ${genererIndicateurPratiqueOuCheckboxes()}
                `;
            } else {
                // Mode normal: badge inline après le titre
                conteneurTitre.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px;';
                conteneurTitre.innerHTML = `
                    <span>Vue d'ensemble</span>
                    ${genererIndicateurPratiqueOuCheckboxes()}
                `;
            }

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
    const modeComparatif = afficherSom && afficherPan;

    // MODE COMPARATIF: Afficher les checkboxes interactives
    if (modeComparatif) {
        return `
            <div style="display: flex; gap: 15px; align-items: center;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;
                              padding: 6px 12px; background: color-mix(in srgb, var(--som-orange) 9%, transparent);
                              border: 1.5px solid var(--som-orange); border-radius: 6px; font-size: 0.9rem; font-weight: 600;">
                    <input type="checkbox" id="checkbox-som" ${afficherSom ? 'checked' : ''}
                           onchange="togglerAffichagePratique('som', this.checked)"
                           style="cursor: pointer;">
                    <span style="color: var(--som-orange);">SOM</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;
                              padding: 6px 12px; background: color-mix(in srgb, var(--pan-bleu) 9%, transparent);
                              border: 1.5px solid var(--pan-bleu); border-radius: 6px; font-size: 0.9rem; font-weight: 600;">
                    <input type="checkbox" id="checkbox-pan" ${afficherPan ? 'checked' : ''}
                           onchange="togglerAffichagePratique('pan', this.checked)"
                           style="cursor: pointer;">
                    <span style="color: var(--pan-bleu);">PAN</span>
                </label>
            </div>
        `;
    }

    // MODE NORMAL: Afficher un simple badge identifiant la pratique
    const pratique = afficherSom ? 'SOM' : 'PAN';
    const couleur = afficherSom ? 'var(--som-orange)' : 'var(--pan-bleu)';

    return `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
                     background: color-mix(in srgb, ${couleur} 9%, transparent);
                     border: 1.5px solid ${couleur}; border-radius: 20px;
                     font-size: 0.85rem; font-weight: 600; color: ${couleur}; margin-left: 12px;">
            ${pratique}
        </span>
    `;
}

/**
 * Toggle l'affichage d'une pratique et met à jour les réglages
 * @param {string} pratique - 'som' ou 'pan'
 * @param {boolean} afficher - true pour afficher, false pour masquer
 */
function togglerAffichagePratique(pratique, afficher) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    if (!config.affichageTableauBord) {
        config.affichageTableauBord = {};
    }

    // Mettre à jour la pratique sélectionnée
    if (pratique === 'som') {
        config.affichageTableauBord.afficherSommatif = afficher;
    } else if (pratique === 'pan') {
        config.affichageTableauBord.afficherAlternatif = afficher;
    }

    // Validation: au moins une pratique doit rester affichée
    if (!config.affichageTableauBord.afficherSommatif && !config.affichageTableauBord.afficherAlternatif) {
        alert('Au moins une pratique doit rester affichée !');
        // Recocher la pratique qu'on vient de décocher
        if (pratique === 'som') {
            config.affichageTableauBord.afficherSommatif = true;
        } else if (pratique === 'pan') {
            config.affichageTableauBord.afficherAlternatif = true;
        }
    }

    localStorage.setItem('modalitesEvaluation', JSON.stringify(config));

    // Recharger le tableau de bord
    chargerTableauBordApercu();
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
    const indices = {
        sommatif: {
            assiduite: indicesA.sommatif?.[da] || 0,
            completion: indicesSOM ? indicesSOM.C / 100 : 0,
            performance: indicesSOM ? indicesSOM.P / 100 : 0
        },
        alternatif: {
            assiduite: indicesA.alternatif?.[da] || 0,
            completion: indicesPAN ? indicesPAN.C / 100 : 0,
            performance: indicesPAN ? indicesPAN.P / 100 : 0
        }
    };

    // Calculer les risques pour les deux
    indices.sommatif.risque = calculerRisque(
        indices.sommatif.assiduite,
        indices.sommatif.completion,
        indices.sommatif.performance
    );
    indices.sommatif.niveauRisque = determinerNiveauRisque(indices.sommatif.risque);

    indices.alternatif.risque = calculerRisque(
        indices.alternatif.assiduite,
        indices.alternatif.completion,
        indices.alternatif.performance
    );
    indices.alternatif.niveauRisque = determinerNiveauRisque(indices.alternatif.risque);

    return indices;
}

/**
 * Calcule le risque d'échec
 * Formule du Guide: 1 - (A × C × P)
 * 
 * @param {number} assiduite - Indice A
 * @param {number} completion - Indice C
 * @param {number} performance - Indice P
 * @returns {number} Risque entre 0 et 1
 */
function calculerRisque(assiduite, completion, performance) {
    // Si un des indices est 0, risque = 1 (critique)
    if (assiduite === 0 || completion === 0 || performance === 0) {
        return 1;
    }
    
    return 1 - (assiduite * completion * performance);
}

/**
 * Détermine le niveau de risque selon les seuils du Guide
 * 
 * Seuils:
 * - Critique: > 0.7
 * - Très élevé: 0.5 - 0.7
 * - Élevé: 0.4 - 0.5
 * - Modéré: 0.3 - 0.4
 * - Faible: 0.2 - 0.3
 * - Minimal: ≤ 0.2
 * 
 * @param {number} risque - Indice de risque
 * @returns {string} Niveau de risque
 */
function determinerNiveauRisque(risque) {
    if (risque > 0.7) return 'critique';
    if (risque > 0.5) return 'très élevé';
    if (risque > 0.4) return 'élevé';
    if (risque > 0.3) return 'modéré';
    if (risque > 0.2) return 'faible';
    return 'minimal';
}

/* ===============================
   AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Affiche les métriques globales du groupe
 * Affiche les valeurs avec badges (SOM) et (PAN) dans les mêmes cartes
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const nbTotal = etudiants.length;
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;

    // Calculer les moyennes pour SOMMATIF
    const assiduiteSommatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.sommatif.assiduite, 0) / nbTotal
        : 0;
    const completionSommatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.sommatif.completion, 0) / nbTotal
        : 0;
    const performanceSommatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.sommatif.performance, 0) / nbTotal
        : 0;

    // Calculer les moyennes pour PAN (Alternatif)
    const assiduiteAlternatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.alternatif.assiduite, 0) / nbTotal
        : 0;
    const completionAlternatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.alternatif.completion, 0) / nbTotal
        : 0;
    const performanceAlternatif = nbTotal > 0
        ? etudiants.reduce((sum, e) => sum + e.alternatif.performance, 0) / nbTotal
        : 0;

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

    // Générer les cartes avec les 2 valeurs côte à côte
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${genererCarteMetrique('Assiduité', assiduiteSommatif, assiduiteAlternatif, afficherSom, afficherPan)}
            ${genererCarteMetrique('Complétion', completionSommatif, completionAlternatif, afficherSom, afficherPan)}
            ${genererCarteMetrique('Performance', performanceSommatif, performanceAlternatif, afficherSom, afficherPan)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte de métrique avec les valeurs SOM et PAN
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 * @param {string} label - Nom de la métrique
 * @param {number} valeurSom - Valeur SOM
 * @param {number} valeurPan - Valeur PAN
 * @param {boolean} afficherSom - Afficher SOM
 * @param {boolean} afficherPan - Afficher PAN
 * @returns {string} HTML de la carte
 */
function genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong style="font-size: 1.8rem; color: var(--som-orange); font-weight: 700;">${formatPourcentage(valeurSom)}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong style="font-size: 1.8rem; color: var(--pan-bleu); font-weight: 700;">${formatPourcentage(valeurPan)}</strong>`);
    }

    return `
        <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; border: 2px solid var(--bleu-principal);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; color: #666;">${label}</span>
                <div style="display: flex; gap: 15px; align-items: baseline;">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche les compteurs d'alertes prioritaires (Risque d'échec)
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
    let somCritique = 0, somTresEleve = 0, somEleve = 0, somFaibles = 0;
    etudiants.forEach(e => {
        const niveau = e.sommatif.niveauRisque;
        if (niveau === 'critique') somCritique++;
        else if (niveau === 'très élevé') somTresEleve++;
        else if (niveau === 'élevé') somEleve++;
        else somFaibles++;
    });

    // Calculer les statistiques pour PAN
    let panCritique = 0, panTresEleve = 0, panEleve = 0, panFaibles = 0;
    etudiants.forEach(e => {
        const niveau = e.alternatif.niveauRisque;
        if (niveau === 'critique') panCritique++;
        else if (niveau === 'très élevé') panTresEleve++;
        else if (niveau === 'élevé') panEleve++;
        else panFaibles++;
    });

    // Trouver la carte Risque d'échec
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteRisque = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Risque d'échec")) {
            carteRisque = carte;
        }
    });

    if (!carteRisque) return;

    // Conserver le header et la note toggle
    const noteToggle = carteRisque.querySelector('.carte-info-toggle');
    const header = carteRisque.querySelector('h3');

    carteRisque.innerHTML = '';
    carteRisque.appendChild(header);
    if (noteToggle) carteRisque.appendChild(noteToggle);

    // Générer les cartes
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${genererCarteRisque('Risques faibles', somFaibles, panFaibles, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCarteRisque('Risque élevé', somEleve, panEleve, nbTotal, afficherSom, afficherPan, '#fffbf0', 'var(--risque-eleve)')}
            ${genererCarteRisque('Risque très élevé', somTresEleve, panTresEleve, nbTotal, afficherSom, afficherPan, '#fff8f0', 'var(--risque-tres-eleve)')}
            ${genererCarteRisque('Risque critique', somCritique, panCritique, nbTotal, afficherSom, afficherPan, '#fff5f5', 'var(--risque-critique)')}
        </div>
    `;

    carteRisque.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte de risque avec les valeurs SOM et PAN colorées
 */
function genererCarteRisque(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
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
 * Affiche la liste des étudiants à risque critique
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 * @param {boolean} afficherSommatif - Utiliser les indices sommatifs
 */
function afficherListeEtudiantsCritiques(etudiants, afficherSommatif) {
    const container = document.getElementById('tb-etudiants-critique');
    if (!container) return;

    const etudiantsCritiques = etudiants
        .filter(e => {
            const niveau = afficherSommatif ? e.sommatif.niveauRisque : e.alternatif.niveauRisque;
            return niveau === 'critique';
        })
        .sort((a, b) => {
            const risqueA = afficherSommatif ? a.sommatif.risque : a.alternatif.risque;
            const risqueB = afficherSommatif ? b.sommatif.risque : b.alternatif.risque;
            return risqueB - risqueA;
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
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherPatternsApprentissage(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;
    const nbTotal = etudiants.length;

    // Calculer les patterns pour SOM
    let somStable = 0, somDefi = 0, somEmergent = 0, somCritique = 0;
    etudiants.forEach(e => {
        const pattern = determinerPattern(e.sommatif);
        if (pattern === 'stable') somStable++;
        else if (pattern === 'défi') somDefi++;
        else if (pattern === 'émergent') somEmergent++;
        else if (pattern === 'critique') somCritique++;
    });

    // Calculer les patterns pour PAN
    let panStable = 0, panDefi = 0, panEmergent = 0, panCritique = 0;
    etudiants.forEach(e => {
        const pattern = determinerPattern(e.alternatif);
        if (pattern === 'stable') panStable++;
        else if (pattern === 'défi') panDefi++;
        else if (pattern === 'émergent') panEmergent++;
        else if (pattern === 'critique') panCritique++;
    });

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

    // Générer les cartes avec valeurs colorées
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 15px;">
            ${genererCartePattern('Progression stable', somStable, panStable, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCartePattern('Défi spécifique', somDefi, panDefi, nbTotal, afficherSom, afficherPan, '#f3eeff', 'var(--btn-modifier)')}
            ${genererCartePattern('Blocage émergent', somEmergent, panEmergent, nbTotal, afficherSom, afficherPan, '#fffbea', 'var(--risque-modere)')}
            ${genererCartePattern('Blocage critique', somCritique, panCritique, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-attention)', 'var(--btn-annuler)')}
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
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherNiveauxRaI(etudiants) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif !== false;
    const afficherPan = affichage.afficherAlternatif !== false;
    const nbTotal = etudiants.length;

    // Calculer les niveaux RàI pour SOM
    let somNiveau1 = 0, somNiveau2 = 0, somNiveau3 = 0;
    etudiants.forEach(e => {
        const pattern = determinerPattern(e.sommatif);
        if (pattern === 'stable') {
            somNiveau1++;
        } else if (pattern === 'défi' || pattern === 'émergent') {
            somNiveau2++;
        } else if (pattern === 'critique') {
            somNiveau3++;
        }
    });

    // Calculer les niveaux RàI pour PAN
    let panNiveau1 = 0, panNiveau2 = 0, panNiveau3 = 0;
    etudiants.forEach(e => {
        const pattern = determinerPattern(e.alternatif);
        if (pattern === 'stable') {
            panNiveau1++;
        } else if (pattern === 'défi' || pattern === 'émergent') {
            panNiveau2++;
        } else if (pattern === 'critique') {
            panNiveau3++;
        }
    });

    // Calculer les pourcentages
    const somPct1 = nbTotal > 0 ? Math.round((somNiveau1 / nbTotal) * 100) : 0;
    const somPct2 = nbTotal > 0 ? Math.round((somNiveau2 / nbTotal) * 100) : 0;
    const somPct3 = nbTotal > 0 ? Math.round((somNiveau3 / nbTotal) * 100) : 0;

    const panPct1 = nbTotal > 0 ? Math.round((panNiveau1 / nbTotal) * 100) : 0;
    const panPct2 = nbTotal > 0 ? Math.round((panNiveau2 / nbTotal) * 100) : 0;
    const panPct3 = nbTotal > 0 ? Math.round((panNiveau3 / nbTotal) * 100) : 0;

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

    // Générer les cartes avec valeurs colorées
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 15px;">
            ${genererCarteRaI('Niveau 1 (Universel)', 'Suivi régulier', somPct1, panPct1, somNiveau1, panNiveau1, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCarteRaI('Niveau 2 (Ciblé)', 'Interventions ciblées', somPct2, panPct2, somNiveau2, panNiveau2, afficherSom, afficherPan, '#f3eeff', 'var(--btn-modifier)')}
            ${genererCarteRaI('Niveau 3 (Intensif)', 'Interventions intensives', somPct3, panPct3, somNiveau3, panNiveau3, afficherSom, afficherPan, 'var(--alerte-fond-attention)', 'var(--btn-annuler)')}
        </div>
    `;

    carteRaI.insertAdjacentHTML('beforeend', html);
}

/**
 * Détermine le pattern d'apprentissage selon les indices A-C-P
 *
 * @param {Object} indices - Indices {assiduite, completion, performance, risque, niveauRisque}
 * @returns {string} Pattern: 'stable', 'défi', 'émergent', 'critique'
 */
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

    // Filtrer étudiants à risque et trier par priorité (risque décroissant)
    const etudiantsARisque = etudiants
        .filter(e => {
            const risque = afficherSommatif ? e.sommatif.risque : e.alternatif.risque;
            return risque >= 0.4; // Seuil: élevé ou plus
        })
        .sort((a, b) => {
            const risqueA = afficherSommatif ? a.sommatif.risque : a.alternatif.risque;
            const risqueB = afficherSommatif ? b.sommatif.risque : b.alternatif.risque;
            return risqueB - risqueA;
        })
        .slice(0, 5); // Top 5

    if (etudiantsARisque.length === 0) {
        container.style.display = 'none';
        if (messageVide) messageVide.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (messageVide) messageVide.style.display = 'none';

    container.innerHTML = etudiantsARisque.map((e, index) => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const recommendation = genererRecommandation(indices);

        return `
            <div style="padding: 15px; background: white; border-radius: 8px;
                        border-left: 4px solid ${getCouleurRisque(indices.niveauRisque)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span style="display: inline-block; width: 24px; height: 24px;
                                     background: ${getCouleurRisque(indices.niveauRisque)};
                                     color: white; border-radius: 50%; text-align: center;
                                     line-height: 24px; font-weight: bold; margin-right: 10px;">
                            ${index + 1}
                        </span>
                        <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                        <span style="color: #666; margin-left: 8px;">(${echapperHtml(e.groupe || '—')})</span>
                    </div>
                    <span class="badge-risque risque-${indices.niveauRisque.replace(' ', '-')}"
                          style="text-transform: capitalize;">
                        ${indices.niveauRisque}
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
 * Retourne la couleur CSS selon le niveau de risque
 *
 * @param {string} niveau - Niveau de risque
 * @returns {string} Couleur CSS
 */
function getCouleurRisque(niveau) {
    const couleurs = {
        'critique': '#d32f2f',
        'très élevé': '#f57c00',
        'élevé': '#fbc02d',
        'modéré': '#fdd835',
        'faible': '#7cb342',
        'minimal': '#388e3c'
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
 * - 'listeGrilles' : Array des productions
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
 * - Risque : 1 - (A × C × P)
 * 
 * SEUILS DE RISQUE:
 * - Critique: > 0.7
 * - Très élevé: 0.5 - 0.7
 * - Élevé: 0.4 - 0.5
 * - Modéré: 0.3 - 0.4
 * - Faible: 0.2 - 0.3
 * - Minimal: ≤ 0.2
 */