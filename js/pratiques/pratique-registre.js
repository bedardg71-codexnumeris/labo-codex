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

(function() {
'use strict';

// ============================================================================
// IDENTIFIANTS CANONIQUES (Session A — assainissement, mai 2026)
// ============================================================================
// Un seul identifiant neutre par pratique. La famille « PAN » n'est plus un
// préfixe technique ni un jeton de calcul. Les codes courts (SOM/STD/SPE/DEN)
// restent inchangés (décision 29 mai 2026 : STD demeure le code de Standards).

const PRATIQUE_DEFAUT = 'standards';

// Table de normalisation legacy → canonique.
// 'pan-objectifs' (décision D1) : granularité fine de 'standards', foldée en
// Session C (Lot 4) — l'instance séparée a été retirée ; tout id legacy résiduel
// résout désormais vers 'standards' (la variante par-objectifs vit dans Standards).
const TABLE_NORMALISATION_PRATIQUE = {
    'alternative': 'standards',
    'pan-maitrise': 'standards',
    'pan-maitrise-json': 'standards',
    'pan-standards': 'standards',
    'pan-objectifs': 'standards',
    'pan-specifications': 'specifications',
    'pan-denotation': 'denotation'
};

/**
 * Normalise un identifiant de pratique vers sa forme canonique neutre.
 * Idempotent : normaliserIdPratique(normaliserIdPratique(x)) === normaliserIdPratique(x).
 * @param {string} id - identifiant éventuellement legacy
 * @returns {string} identifiant canonique (ou l'entrée telle quelle si déjà canonique / inconnue)
 */
function normaliserIdPratique(id) {
    if (!id || typeof id !== 'string') return id;
    return TABLE_NORMALISATION_PRATIQUE[id] || id;
}

// ============================================================================
// REPRÉSENTATIONS CANONIQUES (Session B — source unique, juin 2026)
// ============================================================================
// Le registre est la SOURCE UNIQUE du triplet {code, couleur, famille} d'une
// pratique. Avant la Session B, ce triplet était dupliqué dans ~7 tables locales
// (main.js, etudiants.js, gabarits-utils.js, donnees-v2.js, pratiques-gestion.js,
// pratique-notation-v2.js, echelles.js). Toute représentation passe désormais ici.
//
// - couleurVar : variable CSS canonique du design system (styles.css). Les classes
//   .badge-type-* lisent la même couleur ; obtenirCouleurPratique renvoie var(--…)
//   pour les usages hors badge (style inline, Chart.js).
// - famille : « Sommative » (SOM) ou « PAN » (STD/SPE/DEN) — « PAN » est un libellé
//   de famille, plus un préfixe technique (décision 29 mai 2026).
// Taxonomie (#318, DEN-F) : le badge « PAN » est conservé pour l'UI (cohérence avec
// le billet CoP vulgarisé), MAIS la dénotation est académiquement une PRÉN (pratique
// de réduction/élimination de la notation), pas une PAN (Girouard-Gagné et al. 2024).
// Distinction documentée ici, dans SKILL_pratiques_notation §2 bis, et dans le guide PAN.
const REPRESENTATIONS_PRATIQUES = {
    sommative:      { code: 'SOM', couleurVar: '--som-orange', famille: 'Sommative' },
    standards:      { code: 'STD', couleurVar: '--std-bleu',   famille: 'PAN' },
    specifications: { code: 'SPE', couleurVar: '--spe-vert',   famille: 'PAN' },
    denotation:     { code: 'DEN', couleurVar: '--den-violet', famille: 'PAN' } // PRÉN académiquement (voir note ci-dessus)
};

// Représentation par défaut = celle de la pratique par défaut (Standards).
const REPRESENTATION_DEFAUT = REPRESENTATIONS_PRATIQUES[PRATIQUE_DEFAUT];

/**
 * Obtient la représentation canonique {code, couleurVar, famille, classe} d'une pratique.
 * Normalise l'id (les variantes legacy comme pan-objectifs y sont foldées, Lot 4),
 * retombe sur le défaut si inconnu.
 * @param {string} id - identifiant de pratique (legacy ou canonique)
 * @returns {{code:string, couleurVar:string, famille:string, classe:string}}
 */
function obtenirRepresentationPratique(id) {
    const idNorm = normaliserIdPratique(id);
    const rep = REPRESENTATIONS_PRATIQUES[idNorm] || REPRESENTATION_DEFAUT;
    return {
        code: rep.code,
        couleurVar: rep.couleurVar,
        famille: rep.famille,
        classe: 'badge-type-' + rep.code.toLowerCase()
    };
}

/**
 * Variante STRICTE : retourne null si l'id n'est pas une famille connue (après
 * normalisation). Pour les consommateurs qui ont un état
 * « inconnu / multi / masqué » distinct (badge configurable CFG, badge caché…) et
 * ne doivent PAS retomber sur le défaut STD.
 * @param {string} id @returns {?{code,couleurVar,famille,classe}}
 */
function obtenirRepresentationPratiqueStricte(id) {
    const idNorm = normaliserIdPratique(id);
    if (!REPRESENTATIONS_PRATIQUES[idNorm]) return null;
    return obtenirRepresentationPratique(id);
}

/** Code court (SOM/STD/SPE/DEN). @param {string} id @returns {string} */
function obtenirCodePratique(id) {
    return obtenirRepresentationPratique(id).code;
}

/** Couleur sous forme var(--…) (style inline / Chart.js). @param {string} id @returns {string} */
function obtenirCouleurPratique(id) {
    return 'var(' + obtenirRepresentationPratique(id).couleurVar + ')';
}

/** Libellé de famille (« Sommative » / « PAN »). @param {string} id @returns {string} */
function obtenirLabelFamillePratique(id) {
    return obtenirRepresentationPratique(id).famille;
}

/**
 * Génère le badge HTML court d'une pratique — GÉNÉRATEUR UNIQUE.
 * Sortie 100 % contrôlée (codes du registre, jamais de donnée utilisateur) → pas
 * d'échappement requis, zéro handler inline (conforme CSP script-src 'self').
 * @param {string} id - identifiant de pratique
 * @returns {string} `<span class="badge-type-pratique badge-type-std">STD</span>`
 */
function genererBadgePratiqueHTML(id) {
    const rep = obtenirRepresentationPratique(id);
    return '<span class="badge-type-pratique ' + rep.classe + '">' + rep.code + '</span>';
}

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
 * @param {string} id - Identifiant unique de la pratique (ex: 'pan-standards')
 * @param {Object} instance - Instance de la classe implémentant IPratique
 * @throws {Error} Si l'ID est vide ou si la pratique est invalide
 *
 * @example
 * const pratiquePAN = new PratiquePANStandards();
 * enregistrerPratique('pan-standards', pratiquePAN);
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

    // Invalider le cache si c'est la pratique active
    if (pratiqueCacheId === id) {
        pratiqueCacheActive = null;
        pratiqueCacheId = null;
    }
}

// ============================================================================
// HELPER : Construction de config complète
// ============================================================================

/**
 * Construit une config complète pour PratiqueConfigurable
 * en fusionnant les champs racine et config interne.
 *
 * Certaines pratiques ont les champs (id, nom, echelle...) à la racine,
 * d'autres dans pratiqueData.config. Cette fonction normalise les deux formats.
 *
 * NOUVEAU (Beta 96.2): Charge l'échelle par ID si non embarquée
 *
 * @param {Object} pratiqueData - Données de la pratique depuis pratiquesConfigurables
 * @returns {Object} Config complète prête pour PratiqueConfigurable
 */
function construireConfigComplete(pratiqueData) {
    // Priorité : config interne > racine
    const config = pratiqueData.config || {};

    // Résoudre l'échelle (embarquée ou par référence ID)
    let echelle = config.echelle || pratiqueData.echelle;
    if (!echelle) {
        // Chercher par ID dans configuration ou config
        const echelleId = pratiqueData.configuration?.echelleId || config.echelleId;
        if (echelleId) {
            const echelles = db.getSync('echellesTemplates', []);
            const echelleRef = echelles.find(e => e.id === echelleId);
            if (echelleRef) {
                echelle = {
                    type: 'niveaux',
                    echelle_id: echelleRef.id,
                    echelle_nom: echelleRef.nom,
                    niveaux: echelleRef.niveaux
                };
            } else {
                console.warn(`[construireConfigComplete] Échelle "${echelleId}" non trouvée, utilisation échelle par défaut`);
                // Échelle par défaut pour éviter l'erreur
                echelle = {
                    type: 'niveaux',
                    niveaux: [
                        { code: 'I', label: 'Incomplet', valeur_pourcentage: 50, ordre: 1 },
                        { code: 'D', label: 'en Développement', valeur_pourcentage: 65, ordre: 2 },
                        { code: 'M', label: 'Maîtrisé', valeur_pourcentage: 80, ordre: 3 },
                        { code: 'E', label: 'Étendu', valeur_pourcentage: 95, ordre: 4 }
                    ]
                };
            }
        }
    }

    return {
        // Champs obligatoires - prendre de config si présent, sinon de racine
        id: config.id || pratiqueData.id,
        nom: config.nom || pratiqueData.nom,
        // Type canonique (famille) — requis par les représentations Session B
        type: config.type || pratiqueData.type || pratiqueData.configuration?.type,
        echelle: echelle,
        calcul_note: config.calcul_note || pratiqueData.calcul_note || { methode: 'conversion_niveaux' },

        // Champs optionnels
        description: config.description || pratiqueData.description,
        auteur: config.auteur || pratiqueData.auteur,
        etablissement: config.etablissement || pratiqueData.etablissement,
        discipline: config.discipline || pratiqueData.discipline,
        version: config.version || pratiqueData.version,
        date_creation: config.date_creation || pratiqueData.dateCreation,

        // Sections de configuration
        structure_evaluations: config.structure_evaluations || pratiqueData.structure_evaluations,
        systeme_reprises: config.systeme_reprises || pratiqueData.systeme_reprises,
        gestion_criteres: config.gestion_criteres || pratiqueData.gestion_criteres,
        seuils: config.seuils || pratiqueData.seuils || pratiqueData.configuration?.seuils,
        interface: config.interface || pratiqueData.interface,
        portfolio: config.portfolio || pratiqueData.portfolio || pratiqueData.configuration?.portfolio,
        jetons: config.jetons || pratiqueData.jetons,
        objectifs: config.objectifs || pratiqueData.objectifs || pratiqueData.configuration?.objectifs,

        // Champs ajoutés par le wizard comportemental
        variante: pratiqueData.variante || null,
        reglesSpeciales: pratiqueData.reglesSpeciales || null,
        nbEvaluationsPrevues: pratiqueData.nbEvaluationsPrevues || null,

        // Configuration spécifique (pour pratiques avec approcheEvaluation, etc.)
        configuration: pratiqueData.configuration
    };
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
 * obtenirIdPratiqueActive() => "pan-standards"
 */
function obtenirIdPratiqueActive() {
    try {
        const config = db.getSync(cle('modalitesEvaluation'), null);

        if (!config) {
            // Fraîche installation — modalitesEvaluation pas encore initialisé. Silent.
            return null;
        }

        let idPratique = config.pratique;

        if (!idPratique) {
            console.warn('Aucune pratique configurée dans modalitesEvaluation.pratique');
            return null;
        }

        // Normalisation vers l'identifiant canonique (point unique : normaliserIdPratique).
        // Remplace les anciennes « migrations » dispersées — dont celle qui poussait
        // specifications → pan-specifications alors que l'instance s'enregistre sous
        // specifications (le .get échouait).
        //
        // Session A-1 : on normalise À LA LECTURE, SANS write-back. Réécrire
        // modalitesEvaluation.pratique en base désynchroniserait les ~60 comparaisons
        // qui lisent encore `config.pratique`/`modalites.pratique` brut (legacy). La
        // migration des données stockées + le collapse de ces comparaisons sont traités
        // ensemble en Session A-2 (étape 6), sur backup.
        return normaliserIdPratique(idPratique);
    } catch (error) {
        console.error('Erreur lors de la lecture de la pratique active:', error);
        return null;
    }
}

/**
 * Obtient l'instance de la pratique active
 *
 * Cette fonction détecte automatiquement la pratique configurée et retourne
 * l'instance correspondante depuis le registre OU depuis PratiqueManager
 * (pour les pratiques configurables).
 *
 * NOUVEAU (Beta 92): Support pratiques configurables JSON
 * Si la pratique n'est pas dans le registre, tente de la charger via PratiqueManager
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
        // Fraîche installation — pas de pratique active encore. Silent.
        return null;
    }

    // Chercher dans le registre (pratiques codées en dur)
    let instance = pratiquesEnregistrees.get(idActif);

    // NOUVEAU (Beta 92): Si non trouvée dans le registre, chercher dans les pratiques configurables
    // MISE À JOUR (Beta 96.2): Utilise construireConfigComplete pour normaliser les formats
    if (!instance && window.PratiqueManager) {

        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === idActif);

        if (pratiqueData) {
            // Créer une instance de PratiqueConfigurable
            try {
                const configComplete = construireConfigComplete(pratiqueData);
                instance = new PratiqueConfigurable(configComplete);
            } catch (error) {
                console.error(`Erreur lors du chargement de la pratique configurable "${idActif}":`, error);
                return null;
            }
        }
    }

    if (!instance) {
        console.error(
            `Pratique "${idActif}" non trouvée (ni dans le registre, ni dans les pratiques configurables). ` +
            `Pratiques disponibles : ${Array.from(pratiquesEnregistrees.keys()).join(', ')}`
        );
        return null;
    }

    // Mettre en cache
    pratiqueCacheId = idActif;
    pratiqueCacheActive = instance;

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
 *     id: 'pan-standards',
 *     nom: 'PAN-Standards',
 *     description: 'Pratique PAN-Standards...',
 *     instance: PratiquePANStandards {...}
 *   },
 *   {
 *     id: 'sommative',
 *     nom: 'Sommative',
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
 * pratiqueEstDisponible('pan-standards') => true
 * pratiqueEstDisponible('inexistante') => false
 */
function pratiqueEstDisponible(id) {
    return pratiquesEnregistrees.has(id);
}

/**
 * Obtient une pratique spécifique par son ID
 *
 * NOUVEAU (Beta 96.2): Support pratiques configurables JSON
 * Si la pratique n'est pas dans le registre, tente de la charger depuis pratiquesConfigurables
 *
 * @param {string} id - ID de la pratique
 * @returns {Object|null} Instance de la pratique, ou null si non trouvée
 *
 * @example
 * const pratiquePAN = obtenirPratiqueParId('pan-standards');
 */
function obtenirPratiqueParId(id) {
    // Session A volet B : normaliser l'id AU POINT DE RÉSOLUTION. Le SSOT peut
    // contenir une valeur legacy non migrée (pan-standards…) ; or depuis A-1 les
    // instances codées en dur sont enregistrées sous l'id canonique (standards…),
    // donc une résolution sur la valeur brute échouait silencieusement (bug terrain
    // 31 mai : portfolio.js → « Pratique pan-standards non disponible dans le
    // registre » → indices C/P non calculés). Les ids configurables (pan-standards-
    // bedard…) sont absents de la table → restent inchangés et résolvent comme avant.
    const idCanonique = normaliserIdPratique(id);

    // Chercher dans le registre (pratiques codées en dur)
    let instance = pratiquesEnregistrees.get(idCanonique);

    // Si non trouvée dans le registre, chercher dans les pratiques configurables
    if (!instance && window.PratiqueManager) {
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === idCanonique);

        if (pratiqueData) {
            try {
                // Construire la config complète en fusionnant racine + config
                // (certaines pratiques ont les champs à la racine, d'autres dans config)
                const configComplete = construireConfigComplete(pratiqueData);
                instance = new PratiqueConfigurable(configComplete);
            } catch (error) {
                console.error(`Erreur lors du chargement de la pratique configurable "${idCanonique}":`, error);
                return null;
            }
        }
    }

    return instance || null;
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
 * import './pratiques/pratique-pan-standards.js';
 * import './pratiques/pratique-sommative.js';
 * import { initialiserRegistrePratiques } from './pratiques/pratique-registre.js';
 *
 * initialiserRegistrePratiques();
 */
function initialiserRegistrePratiques() {

    // Les pratiques doivent s'enregistrer elles-mêmes au chargement de leur module
    // Cette fonction vérifie simplement qu'au moins une pratique est disponible

    const nbPratiques = pratiquesEnregistrees.size;

    if (nbPratiques === 0) {
        console.warn(
            '⚠️ Aucune pratique enregistrée ! ' +
            'Assure-toi que les modules de pratiques sont chargés.'
        );
    } else {

        // Afficher les pratiques enregistrées
        for (const pratique of listerPratiquesDisponibles()) {
        }

        // Afficher la pratique active (silent si aucune — fraîche installation)
        obtenirPratiqueActive();
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Fonctions principales
window.enregistrerPratique = enregistrerPratique;
window.obtenirPratiqueActive = obtenirPratiqueActive;
window.obtenirIdPratiqueActive = obtenirIdPratiqueActive;
window.normaliserIdPratique = normaliserIdPratique;
window.PRATIQUE_DEFAUT = PRATIQUE_DEFAUT;

// Représentations canoniques (Session B) — source unique code/couleur/famille/badge
window.obtenirRepresentationPratique = obtenirRepresentationPratique;
window.obtenirRepresentationPratiqueStricte = obtenirRepresentationPratiqueStricte;
window.obtenirCodePratique = obtenirCodePratique;
window.obtenirCouleurPratique = obtenirCouleurPratique;
window.obtenirLabelFamillePratique = obtenirLabelFamillePratique;
window.genererBadgePratiqueHTML = genererBadgePratiqueHTML;
window.listerPratiquesDisponibles = listerPratiquesDisponibles;
window.pratiqueEstDisponible = pratiqueEstDisponible;
window.obtenirPratiqueParId = obtenirPratiqueParId;
window.initialiserRegistrePratiques = initialiserRegistrePratiques;

// Gestion du cache
window.invaliderCachePratique = invaliderCachePratique;

// Fonctions de test (ne pas utiliser en production)
window.desenregistrerPratique = desenregistrerPratique;
window.viderRegistre = viderRegistre;



})();
