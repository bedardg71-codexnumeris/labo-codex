/**
 * REGISTRE DE PRATIQUES - Gestion centralisée des pratiques de notation
 *
 * Ce module gère l'enregistrement et la détection automatique des pratiques de notation.
 * Il agit comme un registre central permettant de charger dynamiquement la pratique active.
 *
 * RESPONSABILITÉS :
 * - Enregistrer les pratiques disponibles
 * - Détecter automatiquement la pratique active
 * - Fournir l'instance de la pratique courante
 * - Lister les pratiques disponibles
 * - Gérer les erreurs (pratique non trouvée)
 *
 * VERSION : 1.0
 * DATE : 11 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

// ============================================================================
// ÉTAT DU REGISTRE
// ============================================================================

/**
 * Map des pratiques enregistrées
 * Clé : ID de la pratique (string)
 * Valeur : Instance de la pratique (object implémentant IPratique)
 */
const pratiquesEnregistrees = new Map();

/**
 * Cache de la pratique active
 * Permet d'éviter des lectures répétées de localStorage
 */
let pratiqueCacheActive = null;
let pratiqueCacheId = null;

// ============================================================================
// ENREGISTREMENT DE PRATIQUES
// ============================================================================

/**
 * Enregistre une nouvelle pratique dans le registre
 *
 * @param {string} id - Identifiant unique de la pratique (ex: 'pan-maitrise')
 * @param {Object} instance - Instance de la classe implémentant IPratique
 * @throws {Error} Si l'ID est vide ou si la pratique est invalide
 *
 * @example
 * const pratiquePAN = new PratiquePANMaitrise();
 * enregistrerPratique('pan-maitrise', pratiquePAN);
 */
function enregistrerPratique(id, instance) {
    // Validation de l'ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('L\'ID de la pratique doit être une chaîne non vide');
    }

    // Validation de l'instance
    if (!instance || typeof instance !== 'object') {
        throw new Error('L\'instance de la pratique doit être un objet');
    }

    // Validation des méthodes obligatoires (contrat IPratique)
    const methodesRequises = [
        'obtenirNom',
        'obtenirId',
        'obtenirDescription',
        'calculerPerformance',
        'calculerCompletion',
        'detecterDefis',
        'identifierPattern',
        'genererCibleIntervention'
    ];

    for (const methode of methodesRequises) {
        if (typeof instance[methode] !== 'function') {
            throw new Error(
                `La pratique "${id}" doit implémenter la méthode "${methode}"`
            );
        }
    }

    // Vérifier cohérence ID
    const idInstance = instance.obtenirId();
    if (idInstance !== id) {
        console.warn(
            `Incohérence d'ID : enregistrement "${id}" mais instance retourne "${idInstance}"`
        );
    }

    // Enregistrer la pratique
    pratiquesEnregistrees.set(id, instance);
    console.log(`✅ Pratique enregistrée : ${id} (${instance.obtenirNom()})`);

    // Invalider le cache si c'est la pratique active
    if (pratiqueCacheId === id) {
        pratiqueCacheActive = null;
        pratiqueCacheId = null;
    }
}

// ============================================================================
// DÉTECTION DE LA PRATIQUE ACTIVE
// ============================================================================

/**
 * Obtient l'ID de la pratique active depuis localStorage
 *
 * @returns {string|null} ID de la pratique active, ou null si non configuré
 *
 * @example
 * obtenirIdPratiqueActive() => "pan-maitrise"
 */
function obtenirIdPratiqueActive() {
    try {
        const config = db.getSync('modalitesEvaluation', null);

        if (!config) {
            console.warn('Aucune configuration trouvée dans modalitesEvaluation');
            return null;
        }

        const idPratique = config.pratique;

        if (!idPratique) {
            console.warn('Aucune pratique configurée dans modalitesEvaluation.pratique');
            return null;
        }

        return idPratique;
    } catch (error) {
        console.error('Erreur lors de la lecture de la pratique active:', error);
        return null;
    }
}

/**
 * Obtient l'instance de la pratique active
 *
 * Cette fonction détecte automatiquement la pratique configurée et retourne
 * l'instance correspondante depuis le registre.
 *
 * @returns {Object|null} Instance de la pratique active, ou null si non trouvée
 *
 * @example
 * const pratique = obtenirPratiqueActive();
 * if (pratique) {
 *   const indiceP = pratique.calculerPerformance(da);
 * }
 */
function obtenirPratiqueActive() {
    // Utiliser le cache si disponible
    const idActif = obtenirIdPratiqueActive();

    if (pratiqueCacheId === idActif && pratiqueCacheActive) {
        return pratiqueCacheActive;
    }

    // Cache invalide, recharger
    if (!idActif) {
        console.warn('Aucune pratique active configurée');
        return null;
    }

    // Chercher dans le registre
    const instance = pratiquesEnregistrees.get(idActif);

    if (!instance) {
        console.error(
            `Pratique "${idActif}" non trouvée dans le registre. ` +
            `Pratiques disponibles : ${Array.from(pratiquesEnregistrees.keys()).join(', ')}`
        );
        return null;
    }

    // Mettre en cache
    pratiqueCacheId = idActif;
    pratiqueCacheActive = instance;

    console.log(`🎯 Pratique active : ${idActif} (${instance.obtenirNom()})`);
    return instance;
}

// ============================================================================
// LISTAGE DES PRATIQUES
// ============================================================================

/**
 * Liste toutes les pratiques enregistrées
 *
 * @returns {Array<Object>} Tableau d'objets {id, nom, description, instance}
 *
 * @example
 * listerPratiquesDisponibles() => [
 *   {
 *     id: 'pan-maitrise',
 *     nom: 'PAN-Maîtrise',
 *     description: 'Pratique PAN-Maîtrise...',
 *     instance: PratiquePANMaitrise {...}
 *   },
 *   {
 *     id: 'sommative',
 *     nom: 'Sommative traditionnelle',
 *     description: 'Pratique sommative...',
 *     instance: PratiqueSommative {...}
 *   }
 * ]
 */
function listerPratiquesDisponibles() {
    const pratiques = [];

    for (const [id, instance] of pratiquesEnregistrees.entries()) {
        pratiques.push({
            id: id,
            nom: instance.obtenirNom(),
            description: instance.obtenirDescription(),
            instance: instance
        });
    }

    return pratiques;
}

/**
 * Vérifie si une pratique est enregistrée
 *
 * @param {string} id - ID de la pratique à vérifier
 * @returns {boolean} true si la pratique est enregistrée
 *
 * @example
 * pratiqueEstDisponible('pan-maitrise') => true
 * pratiqueEstDisponible('inexistante') => false
 */
function pratiqueEstDisponible(id) {
    return pratiquesEnregistrees.has(id);
}

/**
 * Obtient une pratique spécifique par son ID
 *
 * @param {string} id - ID de la pratique
 * @returns {Object|null} Instance de la pratique, ou null si non trouvée
 *
 * @example
 * const pratiquePAN = obtenirPratiqueParId('pan-maitrise');
 */
function obtenirPratiqueParId(id) {
    return pratiquesEnregistrees.get(id) || null;
}

// ============================================================================
// GESTION DU CACHE
// ============================================================================

/**
 * Invalide le cache de la pratique active
 *
 * À appeler lorsque la configuration change (ex: changement de pratique dans réglages)
 *
 * @example
 * // Après modification dans pratiques.js
 * sauvegarderModalites();
 * invaliderCachePratique();
 */
function invaliderCachePratique() {
    pratiqueCacheActive = null;
    pratiqueCacheId = null;
    console.log('🔄 Cache de pratique invalidé');
}

// ============================================================================
// DÉSENREGISTREMENT (pour tests)
// ============================================================================

/**
 * Désenregistre une pratique (utile pour les tests)
 *
 * @param {string} id - ID de la pratique à désenregistrer
 * @returns {boolean} true si la pratique a été désenregistrée
 */
function desenregistrerPratique(id) {
    const existed = pratiquesEnregistrees.delete(id);

    if (existed) {
        console.log(`🗑️ Pratique désenregistrée : ${id}`);

        // Invalider le cache si c'était la pratique active
        if (pratiqueCacheId === id) {
            invaliderCachePratique();
        }
    }

    return existed;
}

/**
 * Désenregistre toutes les pratiques (utile pour les tests)
 */
function viderRegistre() {
    pratiquesEnregistrees.clear();
    invaliderCachePratique();
    console.log('🗑️ Registre vidé');
}

// ============================================================================
// INITIALISATION DU REGISTRE
// ============================================================================

/**
 * Initialise le registre avec les pratiques disponibles
 *
 * Cette fonction doit être appelée au chargement de l'application,
 * APRÈS avoir chargé tous les modules de pratiques.
 *
 * @example
 * // Dans main.js
 * import './pratiques/pratique-pan-maitrise.js';
 * import './pratiques/pratique-sommative.js';
 * import { initialiserRegistrePratiques } from './pratiques/pratique-registre.js';
 *
 * initialiserRegistrePratiques();
 */
function initialiserRegistrePratiques() {
    console.log('📋 Initialisation du registre de pratiques...');

    // Les pratiques doivent s'enregistrer elles-mêmes au chargement de leur module
    // Cette fonction vérifie simplement qu'au moins une pratique est disponible

    const nbPratiques = pratiquesEnregistrees.size;

    if (nbPratiques === 0) {
        console.warn(
            '⚠️ Aucune pratique enregistrée ! ' +
            'Assurez-vous que les modules de pratiques sont chargés.'
        );
    } else {
        console.log(`✅ ${nbPratiques} pratique(s) disponible(s)`);

        // Afficher les pratiques enregistrées
        for (const pratique of listerPratiquesDisponibles()) {
            console.log(`   • ${pratique.id} : ${pratique.nom}`);
        }

        // Afficher la pratique active
        const active = obtenirPratiqueActive();
        if (active) {
            console.log(`🎯 Pratique active : ${active.obtenirNom()}`);
        } else {
            console.warn('⚠️ Aucune pratique active configurée');
        }
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Fonctions principales
window.enregistrerPratique = enregistrerPratique;
window.obtenirPratiqueActive = obtenirPratiqueActive;
window.obtenirIdPratiqueActive = obtenirIdPratiqueActive;
window.listerPratiquesDisponibles = listerPratiquesDisponibles;
window.pratiqueEstDisponible = pratiqueEstDisponible;
window.obtenirPratiqueParId = obtenirPratiqueParId;
window.initialiserRegistrePratiques = initialiserRegistrePratiques;

// Gestion du cache
window.invaliderCachePratique = invaliderCachePratique;

// Fonctions de test (ne pas utiliser en production)
window.desenregistrerPratique = desenregistrerPratique;
window.viderRegistre = viderRegistre;

console.log('✅ Module pratique-registre.js chargé');
