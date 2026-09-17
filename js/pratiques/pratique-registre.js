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
        'calculerDetailsCompletion',   // #871 : { remis, total } — calculerCompletion en découle, l'affichage le lit
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
            // 🆕 #358 (Option A) : résolution namespacée par id (actif puis repli pool).
            const echelleRef = (typeof resoudreModeleParId === 'function')
                ? resoudreModeleParId('echelle', echelleId)
                : ((db.getSync('echellesTemplates', []) || []).find(e => e.id === echelleId) || null);
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

    // #396 (5 août 2026) : la méthode 'pan_par_objectif' est RETIRÉE (chemin jamais
    // fonctionnel — décision D2). Une config stockée qui la porte encore est
    // NORMALISÉE ici, à la LECTURE, vers le mode STD correspondant — aucune
    // écriture de données, avertissement visible.
    // #762 (6 sept. 2026) — SANS `calcul_note`, LA MÉTHODE SE DÉDUIT DE LA FAMILLE, pas d'un
    // défaut PAN-Standards. Le « Modèle sommatif » adopté par Grégoire le 2 septembre (clone
    // fidèle du gabarit `SOM-simple` : `type: 'sommative'`, pas de `calcul_note`, pas d'échelle)
    // tombait sur `conversion_niveaux`, qui exige une échelle : « Champ obligatoire manquant :
    // echelle », et la pratique était introuvable partout où le registre résout (comparateur,
    // activation, calculs). Une sommative n'a pas d'échelle à fournir. Lecture seule : le stock
    // déjà adopté est lu juste sans être réécrit. Une PAN-Standards sans échelle reste refusée.
    const familleCanon = normaliserIdPratique(config.type || pratiqueData.type || pratiqueData.configuration?.type);
    const METHODE_PAR_FAMILLE = {
        sommative: 'moyenne_ponderee',
        specifications: 'specifications',
        denotation: 'jugement_global',
        standards: 'conversion_niveaux'
    };
    let calcul_note = config.calcul_note || pratiqueData.calcul_note
        || { methode: METHODE_PAR_FAMILLE[familleCanon] || 'conversion_niveaux' };
    if (calcul_note && calcul_note.methode === 'pan_par_objectif') {
        console.warn(`[construireConfigComplete] Méthode retirée « pan_par_objectif » (pratique « ${config.id || pratiqueData.id || '?'} ») — normalisée vers conversion_niveaux (#396). Ré-enregistrer la pratique au wizard pour faire disparaître cet avertissement.`);
        calcul_note = Object.assign({}, calcul_note, { methode: 'conversion_niveaux' });
    }

    // #897 (audit du 16 sept. 2026, constat A-1 ; « brancher », tranché par Grégoire le 17) —
    // LE MOTEUR LIT CE QUE L'ASSISTANT ÉCRIT. L'assistant écrit les règles spéciales d'une
    // sommative sous `configuration.conditions_speciales` ; le moteur ne connaît qu'un lecteur,
    // `calcul_note.conditions_speciales` (la forme des gabarits). Renvoi à la LECTURE, sans
    // écriture ; une pratique qui porte déjà les siennes sous `calcul_note` les garde.
    // ⚠ Seul le VERROU s'applique (PratiqueConfigurable._appliquerVerrousSommatifs) : le
    // plafonnement de l'assistant n'a qu'une condition en texte libre, voir là-bas.
    const reglesAssistant = pratiqueData.configuration?.conditions_speciales;
    if (Array.isArray(reglesAssistant) && reglesAssistant.length > 0
        && calcul_note && !calcul_note.conditions_speciales) {
        calcul_note = Object.assign({}, calcul_note, { conditions_speciales: reglesAssistant });
    }

    return {
        // Champs obligatoires - prendre de config si présent, sinon de racine
        id: config.id || pratiqueData.id,
        nom: config.nom || pratiqueData.nom,
        // Type canonique (famille) — requis par les représentations Session B
        type: config.type || pratiqueData.type || pratiqueData.configuration?.type,
        echelle: echelle,
        calcul_note: calcul_note,

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
        // #328 L2-b2 : id dérivé de la SSOT groupesCours[].pratiqueId (le miroir
        // modalitesEvaluation.pratique n'existe plus). La résolution passe par
        // obtenirPratiqueActiveGroupeCours (modes.js) — SSOT d'abord, copies en
        // dernier recours, défaut 'sommative'.
        const idPratique = (typeof window.obtenirPratiqueActiveGroupeCours === 'function')
            ? window.obtenirPratiqueActiveGroupeCours()
            : null;

        if (!idPratique) {
            return null;
        }

        // Normalisation vers l'identifiant canonique (point unique : normaliserIdPratique).
        // On normalise À LA LECTURE, SANS write-back (Session A-1) — la SSOT peut
        // contenir un id configurable (laissé tel quel) ou un type legacy.
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

        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
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
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
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

/**
 * Résout le TYPE canonique de la pratique active depuis la SSOT — #328 L2-b1.
 *
 * Chaîne : `groupesCours[].pratiqueId` (SSOT actée #303) → type de la pratique
 * (id canonique du registre, ou `configuration.type` d'une configurable lue
 * dans la bibliothèque DU TRIMESTRE DU GROUPE-COURS — pas du trimestre actif,
 * c'est l'absorption de #301). Remplace les lectures du miroir
 * `modalitesEvaluation.pratique`, dont le contenu était ambigu (tantôt un
 * type, tantôt un id de configurable selon l'écrivain).
 *
 * @param {{gcId?: string, trimestreId?: string}} [contexte] - contexte
 *        EXPLICITE de consultation. Sans contexte : groupe-cours actif et
 *        SON trimestre.
 * @returns {string|null} type canonique ('sommative'|'standards'|
 *        'specifications'|'denotation'), ou null si rien d'actif /
 *        introuvable — chaque appelant applique son défaut historique.
 */
function obtenirTypePratiqueActive(contexte) {
    contexte = contexte || {};
    try {
        const gcActif = db.getSync('groupeCoursActif', null);

        // Trimestre de résolution : explicite > celui du GC actif > l'actif.
        const trimestreId = contexte.trimestreId
            || (!contexte.gcId && gcActif && gcActif.trimestreId)
            || (typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : null);
        const gcId = contexte.gcId || (gcActif && gcActif.id) || null;
        if (!gcId || !trimestreId) return null;

        // 1. SSOT : pratiqueId du groupe-cours dans la liste du trimestre.
        let pratiqueId = null;
        const groupesCours = db.getSync(trimestreId + '_groupesCours', null);
        const gc = Array.isArray(groupesCours)
            ? groupesCours.find(g => g && g.id === gcId)
            : null;
        if (gc) {
            pratiqueId = gc.pratiqueId || null;
        } else if (!contexte.gcId) {
            // GC actif introuvable dans la SSOT (état transitoire) : copies en
            // dernier recours — jamais quand un contexte explicite est demandé.
            pratiqueId = (gcActif && gcActif.pratiqueId)
                || ((db.getSync('infoCours', null) || {}).pratiqueId)
                || null;
        }
        if (!pratiqueId) return null;

        // 2. id → type. Un id canonique du registre EST un type.
        const canonique = normaliserIdPratique(pratiqueId);
        if (pratiquesEnregistrees.has(canonique)) return canonique;

        // 3. Configurable : type déclaré par sa configuration, dans la
        //    bibliothèque du trimestre demandé.
        const configurables = db.getSync(trimestreId + '_pratiquesConfigurables', null);
        const p = Array.isArray(configurables)
            ? configurables.find(x => x && x.id === pratiqueId)
            : null;
        if (p) {
            const type = (p.configuration && p.configuration.type) || p.type || null;
            return type ? normaliserIdPratique(type) : null;
        }
        return null;
    } catch (e) {
        console.warn('[Registre] Résolution du type de pratique active échouée :', e.message || e);
        return null;
    }
}

/* ===============================
   #394 — RÔLES DES PRODUCTIONS DANS LE CALCUL STD (SSOT)
   Les DEUX systèmes de calcul (chemin riche calculerDetailsNoteFinale et
   instance PratiquePANStandards, snapshots compris) DOIVENT passer par ces
   trois fonctions. Décision D1 (Grégoire, 5 août 2026) :
   - une production joue le rôle de terminale ssi type === 'terminale'
     (déclaration explicite au formulaire Productions, JAMAIS une inférence
     par pondération) ;
   - le pool = artefacts déclarés, sinon productions non pondérées (repli) —
     le conteneur « portfolio » est optionnel ;
   - la récence = numéro de production décroissant (correctif 24 jan 2026),
     pas la date d'évaluation.
   =============================== */

/**
 * Identifie LA production terminale d'un corpus : type === 'terminale' strict.
 * Pas de terminale typée → null (rien n'en tient lieu, aucun fallback pondéré).
 */
function identifierProductionTerminale(productions) {
    if (!Array.isArray(productions)) return null;
    return productions.find(p => p && p.type === 'terminale') || null;
}

/**
 * Ids du pool d'artefacts STD : les artefacts déclarés (type 'artefact-portfolio'),
 * sinon repli sur les productions non pondérées (hors conteneur et terminale).
 */
function obtenirArtefactsIdsPoolStd(productions, terminalId) {
    if (!Array.isArray(productions)) return [];
    let ids = productions
        .filter(p => p && p.type === 'artefact-portfolio' && p.id !== terminalId)
        .map(p => p.id);
    if (ids.length === 0) {
        ids = productions
            .filter(p =>
                p &&
                p.type !== 'portfolio' &&
                p.type !== 'terminale' &&
                p.id !== terminalId &&
                (p.ponderation === 0 || p.ponderation === undefined || p.ponderation === null)
            )
            .map(p => p.id);
    }
    return ids;
}

/**
 * Comparateur de récence des évaluations (ordre décroissant) : par NUMÉRO de
 * production — une reprise évaluée tard reste « ancienne » si sa production
 * l'est (L9 : la date d'évaluation divergeait entre les deux systèmes).
 */
function creerComparateurRecenceStd(productions) {
    const liste = Array.isArray(productions) ? productions : [];
    const numero = (ev) => {
        const prod = liste.find(p => p && p.id === ev.productionId);
        return prod?.numero || parseInt(String(ev.productionId).match(/(\d+)$/)?.[1]) || 0;
    };
    return (a, b) => numero(b) - numero(a);
}

/* ===============================
   #706 — CE QUI ENTRE DANS LA NOTE DU COURS (SSOT des quatre familles et des deux systèmes)
   Règle arrêtée par Grégoire le 5 septembre 2026, après l'audit de la pratique de notation
   (Rapports/AUDIT-pratique-de-notation-2026-09-05.md, C-1) : une évaluation NON VERROUILLÉE
   — brouillon de l'enregistrement automatique (#674), reprise pas encore réévaluée
   (evaluation-jetons.js, `verrouillee: false`), copie déverrouillée pour modification —, ou
   dont la portée `ponderationCouverte` est INCOMPLÈTE, N'ENTRE PAS dans la note du cours.
   Les DEUX systèmes (calculerDetailsNoteFinale et chaque calculerPerformance) passent ici,
   et le profil comme l'export disent combien ont été écartées (compterEvaluationsEcarteesDeLaNote).

   ⮕ LOT A DU CADRAGE DU 16 SEPT. 2026 (#737, #741, #718) — LA MÊME RÈGLE VAUT PARTOUT :
   « une copie compte quand l'enseignant l'a ENREGISTRÉE, avec ou sans commentaire final ».
   La complétion (SOM, configurable, STD, snapshots), le dépistage (moyennes par critère,
   IPB, défi spécifique, directions, performance des N derniers artefacts, carte RàI) et le
   niveau de la note globale (échelle commune) lisent CE prédicat, et plus jamais
   `e.retroactionFinale` (le filtre datait de la lecture de la prose, #529). Un brouillon
   (verrouillee: false) ne compte donc nulle part — décision de Grégoire, 16 sept. 2026.

   ⚠ « Incomplète » se juge SANS relire la grille : la porte #674 refuse d'enregistrer une
   portée partielle, donc une évaluation verrouillée est complète à l'enregistrement — sauf
   le zéro « rien couvert » (portée 0 : évaluation enregistrée sans aucun critère, ou fossile
   #697), écarté lui aussi. Comparer la portée à la grille COURANTE (grille rééditée après
   coup) est #705, à trancher après le 14 : pas ici. Les évaluations d'avant le 2 septembre
   n'ont pas de portée déclarée (undefined) : elles comptent comme avant.
   ⚠ Conséquence nommée : une copie enregistrée sans aucun critère (0 sur portée 0) ne pèse
   plus 0 dans une moyenne sommative — un « non remis » qui doit compter 0 se note.
   =============================== */

/**
 * Vrai si l'évaluation compte dans la note du cours ; faux pour une remplacée, une sans note,
 * un brouillon (non verrouillée) ou une portée nulle.
 * @param {Object} evaluation
 * @returns {boolean}
 */
function evaluationEntreDansLaNote(evaluation) {
    if (!evaluation) return false;
    if (evaluation.remplaceeParId) return false;
    if (evaluation.noteFinale === null || evaluation.noteFinale === undefined) return false;
    if (evaluation.verrouillee === false) return false;
    if (evaluation.ponderationCouverte === 0) return false;
    return true;
}

/**
 * Lot A du cadrage du 16 sept. 2026 (#738, volet complétion) — LA COPIE EST NON REMISE.
 * Deux valeurs pour une seule réalité : « non-remis », que l'ancien menu écrivait, et
 * « non-recu », que le menu de remise écrit depuis février 2026 (c'est aussi sa valeur par
 * défaut). La complétion ne compte JAMAIS une copie non remise, quelle que soit la pratique ;
 * ce que sa NOTE vaut reste la règle de sa famille (cadrage du 5 sept., hors de ce prédicat).
 * ⚠ Un seul lecteur de ces deux chaînes dans les calculs : ici. Un site qui les recopie
 * en oublie une (mesuré le 16 sept. : STD et les snapshots ne lisaient que « non-remis »).
 * @param {Object} evaluation
 * @returns {boolean}
 */
function evaluationNonRemise(evaluation) {
    if (!evaluation) return false;
    return evaluation.statutRemise === 'non-remis' || evaluation.statutRemise === 'non-recu';
}

/**
 * Combien d'évaluations de cet élève portent une note mais sont écartées par #706.
 * @param {string} da
 * @param {Array} [evaluations] - liste déjà lue (sinon lue via obtenirDonneesSelonMode)
 * @returns {{brouillons:number, sansPortee:number, total:number}}
 */
function compterEvaluationsEcarteesDeLaNote(da, evaluations) {
    const liste = Array.isArray(evaluations) ? evaluations
        : ((typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
            : (db.getSync(cle('evaluationsSauvegardees'), []) || []));
    let brouillons = 0, sansPortee = 0;
    liste.forEach(e => {
        if (!e || e.etudiantDA !== da || e.remplaceeParId) return;
        if (e.noteFinale === null || e.noteFinale === undefined) return;
        if (evaluationEntreDansLaNote(e)) return;
        if (e.verrouillee === false) brouillons++; else sansPortee++;
    });
    return { brouillons: brouillons, sansPortee: sansPortee, total: brouillons + sansPortee };
}

// Fonctions principales
window.enregistrerPratique = enregistrerPratique;
// #706 — la règle unique de ce qui entre dans la note du cours, et son compte
window.evaluationEntreDansLaNote = evaluationEntreDansLaNote;
window.compterEvaluationsEcarteesDeLaNote = compterEvaluationsEcarteesDeLaNote;
// Lot A (16 sept. 2026) — la règle unique de ce qui est « non remis » (deux chaînes, un lecteur)
window.evaluationNonRemise = evaluationNonRemise;
// #394 — rôles des productions STD (SSOT des deux systèmes de calcul)
window.identifierProductionTerminale = identifierProductionTerminale;
window.obtenirArtefactsIdsPoolStd = obtenirArtefactsIdsPoolStd;
window.creerComparateurRecenceStd = creerComparateurRecenceStd;
window.obtenirPratiqueActive = obtenirPratiqueActive;
window.obtenirIdPratiqueActive = obtenirIdPratiqueActive;
window.obtenirTypePratiqueActive = obtenirTypePratiqueActive;
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
// #326 terrain : exposé pour que dupliquerPratique résolve la config exécutable
// d'une pratique quelle que soit sa forme stockée (.config legacy OU .configuration
// + racine du wizard) — la SSOT de résolution, pas une relecture à l'aveugle.
window.construireConfigComplete = construireConfigComplete;

// Gestion du cache
window.invaliderCachePratique = invaliderCachePratique;

// Fonctions de test (ne pas utiliser en production)
window.desenregistrerPratique = desenregistrerPratique;
window.viderRegistre = viderRegistre;



})();
