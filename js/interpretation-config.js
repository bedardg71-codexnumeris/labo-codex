/* ===============================
   MODULE: CONFIGURATION DES SEUILS D'INTERPRÉTATION
   Version: 1.0 - 31 octobre 2025

   Module centralisé pour tous les paramètres d'analyse et d'interprétation
   des données pédagogiques. Permet d'ajuster la sensibilité des algorithmes
   de détection de progression, risque, et patterns d'apprentissage.

   UTILISATION:
   - AUCUNE UI de réglage depuis la refonte nav (#299) : l'ancienne page
     d'interprétation de la section Réglages a été retirée. Les seuils vivent
     en localStorage (chargerSeuilsInterpretation) et retombent sur
     SEUILS_PAR_DEFAUT
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

    // Sensibilité des flèches par critère (curseur de Labo › Outils d'observation ;
    // #823 : ex-« Direction du risque », nom de clé conservé). Variation minimale
    // de la moyenne d'un critère entre deux fenêtres d'analyse décalées d'une
    // production pour afficher → ou ← (`calculerDirectionsCriteres`).
    directionRisque: 0.05,  // 5 points sur échelle 0-1

    // Fenêtre d'analyse des patterns
    // Nombre de productions récentes à analyser pour détecter les patterns
    nombreProductionsAnalyse: 3,  // 3 dernières productions (recommandé pour détection précoce)

    // Identification des défis SRPNF
    // Score en dessous duquel un critère est considéré comme un défi
    defiSpecifique: 0.70,  // 70% - Seuil conventionnel ; non validé empiriquement (voir RELECTURE-2026-09-17)

    // Paliers de l'assiduité et de la complétion (décision de Grégoire, 30 oct. 2026). LA source de tous
    // les signaux de A et de C (`contexte-qualification.js`), réglable dans Labo › Outils d'observation.
    interpretation: {
        excellent: 0.95,    // ≥ 95 % : « Aucune absence ou presque »
        bon: 0.90,          // 90-94 % : « Absences rares »
        acceptable: 0.85    // 85-89 % : « Quelques absences » ; sous 85 %, le palier le plus bas
    }
};

// La note de passage du collégial. Une seule source, hors de l'objet enregistré : elle n'est pas un
// réglage, et elle ne se fige donc chez personne.
const NOTE_DE_PASSAGE = 0.60;

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
 * #818 suite (10 sept. 2026) — LE BRANCHEMENT MANQUANT DES TROIS CURSEURS.
 *
 * Les curseurs « Fragile / Acceptable / Bon » de Labo > Outils d'observation
 * écrivaient `fragile`, `acceptable` et `bon` À PLAT, à la racine de
 * `seuilsInterpretation`. Les consommateurs — `etudiants.js`,
 * `profil-etudiant-helpers.js` — lisent la branche `interpretation`. Rien ne
 * reliait les deux, et `fusionnerAvecDefauts` ne parcourt que les clés du
 * modèle : le réglage était conservé en base, réaffiché à l'identique dans son
 * propre panneau, et sans le moindre effet sur un calcul ou une couleur.
 * Les défauts coïncidaient (70/80/85), ce qui masquait le défaut tant que
 * personne ne bougeait un curseur.
 *
 * ⚠ Les deux vocabulaires nomment la MÊME frontière par des côtés opposés : le
 * curseur « Fragile 70 » dit « sous 70, c'est fragile » ; la branche écrit
 * `acceptable: 0.70`, « à partir de 70, c'est acceptable ». Ce n'est pas un
 * décalage d'un cran, c'est la même borne nommée par en dessous ou par en
 * dessus. D'où cette table, et pas une autre.
 */
const SEUILS_PLATS_VERS_INTERPRETATION = {
    fragile: 'acceptable',
    acceptable: 'bon',
    bon: 'excellent'
};

/**
 * Reporte dans la branche `interpretation` un réglage resté à plat, puis retire
 * la clé plate. Muter la COPIE, jamais l'objet rendu par le cache.
 * Sans repli arbitraire : une clé absente ou non numérique est ignorée.
 * @param {Object} stocke - copie de l'objet stocké, mutée sur place
 * @returns {boolean} - vrai si au moins un réglage a été repris
 */
function migrerSeuilsPlats(stocke) {
    if (!stocke || typeof stocke !== 'object') return false;
    let repris = false;
    for (const plat in SEUILS_PLATS_VERS_INTERPRETATION) {
        const valeur = stocke[plat];
        if (typeof valeur !== 'number' || !isFinite(valeur)) continue;
        if (!stocke.interpretation || typeof stocke.interpretation !== 'object') {
            stocke.interpretation = {};
        }
        stocke.interpretation[SEUILS_PLATS_VERS_INTERPRETATION[plat]] = valeur;
        delete stocke[plat];
        repris = true;
    }
    return repris;
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
    // Copie : `db.getSync` peut rendre une référence vivante du cache.
    const copie = JSON.parse(JSON.stringify(stocke));
    // #818 suite — reprendre un réglage laissé à plat AVANT la fusion. Après
    // elle, il serait perdu : les clés plates ne figurent pas dans le modèle.
    const migre = migrerSeuilsPlats(copie);
    const fusion = fusionnerAvecDefauts(copie, SEUILS_PAR_DEFAUT);
    // 30 oct. 2026 — une clé sortie du modèle reste dans l'objet : c'est le cas de `idme` (0,64 / 0,75 /
    // 0,85), que plus aucun code ne lit depuis que l'échelle de l'enseignant fait foi pour P. Tarir n'est
    // pas réparer : on n'efface rien chez l'utilisateur.
    const valeur = Object.assign({}, copie, fusion.valeur);
    if (!fusion.complete || migre) {
        // Auto-guérison : l'objet stocké manquait de clés ajoutées depuis, ou
        // portait un réglage à plat qu'on vient de rebrancher.
        db.setSync('seuilsInterpretation', valeur);
    }
    return valeur;
}

/**
 * Sauvegarde les seuils dans db.setSync
 * @param {Object} seuils - Objet contenant les seuils à sauvegarder
 */
function sauvegarderSeuilsInterpretation(seuils) {
    try {
        db.setSync('seuilsInterpretation', seuils);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('seuilsInterpretation');   // lot F : geste hors témoin (sauvegarderSeuilsInterpretation)
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
 * @param {string} chemin - Chemin vers le seuil (ex: 'progressionArtefacts', 'interpretation.bon')
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
    window.NOTE_DE_PASSAGE = NOTE_DE_PASSAGE;

}

// Auto-initialisation lors du chargement du module
if (typeof window !== 'undefined') {
    initialiserModuleInterpretation();
}

})();
