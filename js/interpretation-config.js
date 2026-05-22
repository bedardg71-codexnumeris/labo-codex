/* ===============================
   MODULE: CONFIGURATION DES SEUILS D'INTERPRÉTATION
   Version: 1.0 - 31 octobre 2025

   Module centralisé pour tous les paramètres d'analyse et d'interprétation
   des données pédagogiques. Permet d'ajuster la sensibilité des algorithmes
   de détection de progression, risque, et patterns d'apprentissage.

   UTILISATION:
   - Les seuils peuvent être ajustés via l'interface Réglages → Interprétation
   - Les valeurs sont sauvegardées dans localStorage
   - Les valeurs par défaut sont restaurées si aucune configuration n'existe
   =============================== */

(function() {
'use strict';

/* ===============================
   VALEURS PAR DÉFAUT
   =============================== */

const SEUILS_PAR_DEFAUT = {
    // Progression des artefacts (AM vs AL)
    // Seuil minimal pour détecter une progression ou régression significative
    progressionArtefacts: 0.10,  // 10 points sur échelle 0-1

    // Direction du risque (évolution temporelle)
    // Seuil minimal pour détecter une augmentation ou diminution du risque
    directionRisque: 0.05,  // 5 points sur échelle 0-1

    // Fenêtre d'analyse des patterns
    // Nombre de productions récentes à analyser pour détecter les patterns
    nombreProductionsAnalyse: 3,  // 3 dernières productions (recommandé pour détection précoce)

    // Taxonomie SOLO - Niveaux IDME
    // Seuils de passage entre les niveaux de compréhension
    idme: {
        insuffisant: 0.64,      // < 64% = Incomplet (unistructurel)
        developpement: 0.75,    // 64-74% = en Développement (multistructurel)
        maitrise: 0.85          // 75-84% = Maîtrisé (relationnel), ≥85% = Étendu (abstrait)
    },

    // Identification des défis SRPNF
    // Score en dessous duquel un critère est considéré comme un défi
    defiSpecifique: 0.70,  // 70% - Seuil d'autonomie empirique (validation 101→102)

    // Seuils d'interprétation A-C-M (Assiduité, Complétion, Mobilisation)
    // Utilisés pour classifier les niveaux de performance
    interpretation: {
        excellent: 0.85,    // ≥85% = Excellent
        bon: 0.80,          // 80-84% = Bon
        acceptable: 0.70    // 70-79% = Acceptable, <70% = Fragile/Critique
    }
};

/* ===============================
   FONCTIONS D'ACCÈS AUX SEUILS
   =============================== */

/**
 * Fusionne récursivement un objet stocké avec un modèle de valeurs par défaut.
 * Les clés absentes côté stocké sont comblées par le défaut, les clés présentes
 * sont préservées. Les objets imbriqués sont traités récursivement.
 * @param {Object} stocke - Objet chargé depuis la persistance (peut être partiel)
 * @param {Object} defauts - Objet modèle complet
 * @returns {{ valeur: Object, complete: boolean }} valeur fusionnée + indicateur
 *          `complete` à false si au moins une clé manquait côté stocké.
 */
function fusionnerAvecDefauts(stocke, defauts) {
    const resultat = {};
    let complete = true;
    for (const cle in defauts) {
        const valDefaut = defauts[cle];
        const valStocke = stocke ? stocke[cle] : undefined;
        const estObjet = valDefaut && typeof valDefaut === 'object' && !Array.isArray(valDefaut);
        if (estObjet) {
            const fusion = fusionnerAvecDefauts(valStocke || {}, valDefaut);
            resultat[cle] = fusion.valeur;
            if (!fusion.complete || valStocke === undefined) complete = false;
        } else if (valStocke !== undefined) {
            resultat[cle] = valStocke;
        } else {
            resultat[cle] = valDefaut;
            complete = false;
        }
    }
    return { valeur: resultat, complete: complete };
}

/**
 * Charge les seuils depuis db.getSync, fusionne avec les défauts pour combler
 * toute clé manquante, et persiste la version complète si une clé a été ajoutée.
 * Garantit que l'objet retourné expose TOUTES les branches de SEUILS_PAR_DEFAUT.
 * @returns {Object} - Objet contenant tous les seuils configurés
 */
function chargerSeuilsInterpretation() {
    const stocke = db.getSync('seuilsInterpretation', null);
    if (!stocke) {
        return JSON.parse(JSON.stringify(SEUILS_PAR_DEFAUT));
    }
    const fusion = fusionnerAvecDefauts(stocke, SEUILS_PAR_DEFAUT);
    if (!fusion.complete) {
        // Auto-guérison : l'objet stocké manquait de clés ajoutées depuis.
        // On persiste la fusion pour éviter de refaire le merge à chaque lecture.
        db.setSync('seuilsInterpretation', fusion.valeur);
    }
    return fusion.valeur;
}

/**
 * Sauvegarde les seuils dans db.setSync
 * @param {Object} seuils - Objet contenant les seuils à sauvegarder
 */
function sauvegarderSeuilsInterpretation(seuils) {
    try {
        db.setSync('seuilsInterpretation', seuils);
        return true;
    } catch (e) {
        console.error('❌ Erreur lors de la sauvegarde des seuils:', e);
        return false;
    }
}

/**
 * Réinitialise les seuils aux valeurs par défaut
 */
function reinitialiserSeuilsInterpretation() {
    sauvegarderSeuilsInterpretation(SEUILS_PAR_DEFAUT);
}

/**
 * Obtient un seuil spécifique
 * @param {string} chemin - Chemin vers le seuil (ex: 'progressionArtefacts', 'idme.maitrise')
 * @returns {number} - Valeur du seuil
 */
function obtenirSeuil(chemin) {
    const seuils = chargerSeuilsInterpretation();
    const parties = chemin.split('.');
    let valeur = seuils;

    for (const partie of parties) {
        if (valeur && typeof valeur === 'object' && partie in valeur) {
            valeur = valeur[partie];
        } else {
            console.warn(`⚠️ Seuil introuvable: ${chemin}, utilisation de la valeur par défaut`);
            // Récupérer depuis les valeurs par défaut
            let defaut = SEUILS_PAR_DEFAUT;
            for (const p of parties) {
                defaut = defaut[p];
            }
            return defaut;
        }
    }

    return valeur;
}

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module d'interprétation
 * Charge les seuils et les rend disponibles globalement
 */
function initialiserModuleInterpretation() {

    // Charger les seuils
    const seuils = chargerSeuilsInterpretation();

    // Rendre les fonctions disponibles globalement
    window.chargerSeuilsInterpretation = chargerSeuilsInterpretation;
    window.sauvegarderSeuilsInterpretation = sauvegarderSeuilsInterpretation;
    window.reinitialiserSeuilsInterpretation = reinitialiserSeuilsInterpretation;
    window.obtenirSeuil = obtenirSeuil;
    window.SEUILS_PAR_DEFAUT = SEUILS_PAR_DEFAUT;

}

// Auto-initialisation lors du chargement du module
if (typeof window !== 'undefined') {
    initialiserModuleInterpretation();
}

})();
