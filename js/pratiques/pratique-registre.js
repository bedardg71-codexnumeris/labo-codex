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
/** #762 — la méthode de calcul de chaque famille, quand une pratique ne porte pas de `calcul_note`. */
const METHODE_PAR_FAMILLE = {
    sommative: 'moyenne_ponderee',
    specifications: 'specifications',
    denotation: 'jugement_global',
    standards: 'conversion_niveaux'
};

/** La méthode que sa famille donne à une pratique (le type, à la racine, dans `.config` ou `.configuration`), ou null. */
function methodeDeLaFamille(pratiqueData) {
    const p = pratiqueData || {};
    const config = p.config || {};
    return METHODE_PAR_FAMILLE[normaliserIdPratique(config.type || p.type || p.configuration?.type)] || null;
}

/**
 * #1149, lot 3b (24 oct. 2026) — LA MÉTHODE QUE LE MOTEUR APPLIQUERA, lue comme `construireConfigComplete`
 * la lit : le `calcul_note` porté (`pan_par_objectif` normalisée, #396), sinon celle de la famille (#762).
 * `null` quand rien ne la dit : là où le moteur retombe sur `conversion_niveaux` par défaut, la chaîne
 * des étapes, elle, ne prétend pas qu'une méthode est posée. Fonction pure.
 */
function methodeDeCalculDeLaPratique(pratiqueData) {
    const p = pratiqueData || {};
    const portee = (p.config || {}).calcul_note || p.calcul_note;
    if (portee) return portee.methode === 'pan_par_objectif' ? 'conversion_niveaux' : (portee.methode || null);
    return methodeDeLaFamille(p);
}

function construireConfigComplete(pratiqueData) {
    // Priorité : config interne > racine
    const config = pratiqueData.config || {};

    // Résoudre l'échelle (embarquée ou par référence ID)
    let echelle = config.echelle || pratiqueData.echelle;
    // #590 (verdict de Cowork, 11 oct.) : la marque `introuvable` posée plus bas voyage dans les
    // données — « Dupliquer » et « Dériver une variante » embarquent la config résolue. Embarquée,
    // elle passerait avant toute référence et figerait la copie sur une échelle vide. Elle reste
    // stockée (la validation de sauvegarde exige `config.echelle`), mais ne vaut pas résolution.
    // Son `echelle_id` reste la référence de dernier recours : la copie d'une pratique de forme
    // `.config` (#712) ne porte ni `configuration.echelleId` ni `config.echelleId` (le `return`
    // plus bas ne le recopie pas). Sans ce repli, plus aucune référence, et la copie ne se charge plus.
    let idDeLaMarque = null;
    if (echelle && echelle.introuvable) {
        idDeLaMarque = echelle.echelle_id || null;
        echelle = null;
    }
    if (!echelle) {
        // Chercher par ID dans configuration ou config, puis dans la marque écartée
        const echelleId = pratiqueData.configuration?.echelleId || config.echelleId || idDeLaMarque;
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
                // #590 (option A de Grégoire, 28 août 2026 : « Rien codé en dur ! ») —
                // l'échelle IDME 50/65/80/95 posée ici contredisait celle de
                // l'utilisateur. Une échelle introuvable reste VIDE et le dit : la
                // pratique se charge encore (sa note ne passe pas par ces niveaux,
                // `calculerNoteFinale` n'a aucun appelant), et aucun niveau n'est inventé.
                console.warn(`[construireConfigComplete] Échelle "${echelleId}" introuvable : aucun niveau n'est inventé (#590)`);
                echelle = {
                    type: 'niveaux',
                    echelle_id: echelleId,
                    introuvable: true,
                    niveaux: []
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
    let calcul_note = config.calcul_note || pratiqueData.calcul_note
        || { methode: methodeDeLaFamille(pratiqueData) || 'conversion_niveaux' };
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
        // Lot N1a (21 sept. 2026) : l'id que rend LA résolution (`designerPratiqueActive`), ou null.
        // Avant, le pointeur normalisé, repli « sommative » compris : l'export des résultats
        // simulait une sommative pour un groupe-cours sans pratique.
        const designation = designerPratiqueActive();
        return designation.etat === 'ok' ? designation.id : null;
    } catch (error) {
        console.error('Erreur lors de la lecture de la pratique active:', error);
        return null;
    }
}

/* ===============================
   LOT N1a (#710, #711, #712, #713 volet registre, #719 — 21 sept. 2026)
   LA PRATIQUE ACTIVE SE TROUVE D'UNE SEULE FAÇON

   Avant, sept fonctions répondaient « quelle est la pratique active ? », avec deux replis
   contraires (« sommative » dans modes.js, PRATIQUE_DEFAUT = « standards » chez le profil) :
   P 87 au tableau de bord, « introuvable » au profil, pour le même groupe-cours.

   Décision de Grégoire (21 sept. 2026, 14 h 31) : SANS PRATIQUE ASSIGNÉE, AUCUNE NOTE. Pas de
   repli. Rien n'est effacé : les notes reviennent dès qu'une pratique est assignée.

   La chaîne : pointeur du groupe-cours actif (brut, modes.js) → entrée de la bibliothèque
   désignée PAR SON ID (brut, puis normalisé ; jamais par son type) → configuration complète
   (`construireConfigComplete`) → instance.

   Les états :
   - 'illisible'   : (résolution seulement) assignée et trouvée, mais l'instance ne se construit pas ;
   - 'aucune'      : rien n'est assigné ;
   - 'introuvable' : un id est assigné, mais il ne mène à aucune pratique de la bibliothèque
                     (supprimée, id ancien jamais réécrit, `standards` ou `specifications` nus :
                     une instance du registre jamais configurée calculait avec SES défauts, #711,
                     ou rendait 50 % à tout le monde, #713) ;
   - 'ok'.

   ⚠ SUPPOSITION NOMMÉE : un pointeur `sommative` nu reste 'ok'. La moyenne pondérée est la
   seule famille du registre qui n'a besoin d'aucune configuration ; elle calcule juste
   aujourd'hui, au tableau de bord comme au profil. Ce n'est pas un repli : c'est ce qui est assigné.

   ⚠ AUCUNE ÉCRITURE : un pointeur ancien reste tel quel en base, seule la lecture le normalise.
   =============================== */

/**
 * L'entrée de la bibliothèque du trimestre qu'un id désigne : id brut d'abord, puis id normalisé
 * (#711 : un pointeur `pan-standards` désigne la pratique rangée sous cet id, ou sous `standards`).
 * Jamais par type : « la première pratique de la même famille » serait une pratique devinée.
 * @param {string} id
 * @returns {Object|null}
 */
function trouverPratiqueEnBibliotheque(id) {
    if (!id) return null;
    const liste = db.getSync(cle('pratiquesConfigurables'), null);
    if (!Array.isArray(liste)) return null;
    const canonique = normaliserIdPratique(id);
    return liste.find(p => p && p.id === id)
        || liste.find(p => p && p.id === canonique)
        || liste.find(p => p && normaliserIdPratique(p.id) === canonique)
        || null;
}

/** La désignation seule (sans instance) : ce que `obtenirIdPratiqueActive` et la résolution partagent. */
function designerPratiqueActive() {
    const idBrut = (typeof window.lirePointeurPratiqueGroupeCours === 'function')
        ? window.lirePointeurPratiqueGroupeCours()
        : null;
    if (!idBrut) return { etat: 'aucune', idBrut: null, id: null, donnees: null, famille: null };
    const donnees = trouverPratiqueEnBibliotheque(idBrut);
    if (donnees) {
        // La famille se lit sur l'ENTRÉE de bibliothèque (comme `obtenirTypePratiqueActive`, plus la
        // forme d'import `.config`, #712), pas sur l'instance : une Standards adoptée sans échelle
        // avant #898 n'a pas d'instance constructible, mais son portfolio calcule — ce stock garde sa note.
        const type = (donnees.configuration && donnees.configuration.type) || donnees.type || (donnees.config && donnees.config.type) || null;
        return { etat: 'ok', idBrut, id: donnees.id, donnees, famille: type ? normaliserIdPratique(type) : null };
    }
    if (normaliserIdPratique(idBrut) === 'sommative' && pratiquesEnregistrees.has('sommative')) {
        return { etat: 'ok', idBrut, id: 'sommative', donnees: null, famille: 'sommative' };
    }
    return { etat: 'introuvable', idBrut, id: null, donnees: null, famille: null };
}

/**
 * LA résolution de la pratique active du groupe-cours. Tout ce qui calcule ou écrit une note passe par ici.
 *
 * @returns {{etat:'aucune'|'introuvable'|'illisible'|'ok', idBrut:?string, famille:?string, id:?string, donnees:?Object,
 *            configuration:?Object, pratique:?Object}}
 *          `configuration` : ce que lisent le portfolio et ses règles — `.configuration`, sinon
 *          `.config` (#712, la forme d'import) ; null pour la sommative du registre.
 */
function resoudrePratiqueActive() {
    const designation = designerPratiqueActive();
    if (designation.etat !== 'ok') {
        return Object.assign({ configuration: null, pratique: null }, designation);
    }
    const pratique = obtenirPratiqueParId(designation.id);
    const donnees = designation.donnees;
    return Object.assign({}, designation, {
        // 'illisible' : une pratique EST assignée et se trouve en bibliothèque, mais son instance ne se
        // construit pas (le stock de #898 : Standards adoptée sans échelle). Ce n'est ni « aucune »
        // ni « introuvable » : on n'écrit pas « non constructible » par-dessus, on ne calcule pas non plus.
        etat: pratique ? 'ok' : 'illisible',
        configuration: donnees ? (donnees.configuration || donnees.config || null) : null,
        pratique
    });
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

    // Lot N1a : l'instance que rend LA résolution. Avant, une troisième recherche, par id brut
    // dans la bibliothèque et par id normalisé au registre.
    const instance = resoudrePratiqueActive().pratique;
    if (!instance) {
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

    // Lot N1a (#711, 21 sept. 2026) : LA BIBLIOTHÈQUE D'ABORD, le registre ensuite. Avant, un id
    // que la normalisation menait au registre (`pan-standards` → `standards`) n'atteignait jamais
    // la pratique rangée sous ce même id : l'instance du registre calculait avec SES défauts
    // (3 / meilleurs) à la place de la configuration de l'enseignant (N = 4).
    const pratiqueData = window.PratiqueManager ? trouverPratiqueEnBibliotheque(id) : null;
    if (pratiqueData) {
        try {
            // Construire la config complète en fusionnant racine + config
            // (certaines pratiques ont les champs à la racine, d'autres dans config)
            return new PratiqueConfigurable(construireConfigComplete(pratiqueData));
        } catch (error) {
            console.error(`Erreur lors du chargement de la pratique configurable "${idCanonique}":`, error);
            return null;
        }
    }

    // Pratiques codées en dur
    return pratiquesEnregistrees.get(idCanonique) || null;
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
 * La FAMILLE canonique de la pratique active — #328 L2-b1, réécrite au lot N1b (21 sept. 2026).
 *
 * Avant, une HUITIÈME lecture du pointeur vivait ici (SSOT, puis copies, puis registre, puis
 * bibliothèque par id brut seulement) : un pointeur `standards` nu rendait « standards » pendant
 * que la résolution le disait introuvable, et chaque appelant ajoutait son repli
 * (PRATIQUE_DEFAUT, « sommative »). Elle rend maintenant la famille que porte LA désignation
 * (`designerPratiqueActive`) : lue sur l'entrée de bibliothèque désignée par son id, « sommative »
 * pour la sommative du registre, null dans tous les autres cas (aucune, introuvable).
 *
 * ⚠ Le type ne sert PLUS à fabriquer une instance ni à choisir un calcul : il ne décide que de
 * mots et de mises en forme. Un appelant qui reçoit null n'a pas de pratique — il n'en invente pas.
 * (Le paramètre `contexte` {gcId, trimestreId} est retiré : aucun appelant ne le passait.)
 *
 * @returns {string|null} 'sommative'|'standards'|'specifications'|'denotation', ou null
 */
function obtenirTypePratiqueActive() {
    try {
        const designation = designerPratiqueActive();
        return designation.etat === 'ok' ? (designation.famille || null) : null;
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
 * Vrai si l'évaluation compte dans la note du cours ; faux pour une remplacée (voir E4 ci-dessous), une sans note,
 * un brouillon (non verrouillée), une portée nulle ou une copie « Incomplet ; travail en cours ».
 * @param {Object} evaluation
 * @param {Array} [evaluations] - la liste où chercher la reprise d'une originale gardée (sinon : le stockage)
 * @returns {boolean}
 */
function evaluationEntreDansLaNote(evaluation, evaluations) {
    if (!evaluation) return false;
    if (evaluation.remplaceeParId && originaleEstRemplacee(evaluation, evaluations)) return false;
    return _copieCompteParElleMeme(evaluation);
}

/** Tout ce qui décide qu'une copie compte, sauf son remplacement. */
function _copieCompteParElleMeme(evaluation) {
    if (evaluationTravailEnCours(evaluation)) return false;   // statut incomplet (25 oct. 2026) : verrouillée ou non
    if (evaluation.noteFinale === null || evaluation.noteFinale === undefined) return false;
    if (evaluation.verrouillee === false) return false;
    if (evaluation.ponderationCouverte === 0) return false;
    return true;
}

/**
 * E4 (décision de Grégoire, 28 oct. 2026, 14 h 45) — UNE ORIGINALE GARDÉE COMPTE JUSQU'À CE QUE SA REPRISE
 * ENTRE DANS LA NOTE. `appliquerJetonReprise` marque l'originale (`remplaceeParId`) dès l'octroi, et la reprise
 * naît déverrouillée : avant E4, ni l'une ni l'autre ne comptait, et la production sortait de la note jusqu'à la
 * réévaluation (SOM-C7, SPE-C4, STD-C5 du banc du 28 oct.). Maintenant l'originale compte tant que sa reprise ne
 * compte pas d'elle-même (évaluée, verrouillée, ni « Incomplet » ni de portée 0) ; la reprise la remplace alors.
 * Une reprise de reprise se lit maillon par maillon : chaque originale ne regarde que SA reprise.
 * Restent remplacés comme avant : un doublon réconcilié (#360, `reconcilieParDoublon`), et une originale dont la
 * reprise est introuvable (dans la liste fournie, sinon dans le stockage). Une originale SUPPRIMÉE (réglage
 * « Supprimer ») n'est plus là : rien ne reste à compter, la production reste hors de la note d'ici là.
 * ⚠ Se lit AU CALCUL : les copies déjà marquées suivent sans écriture ; les captures déjà prises gardent leurs valeurs.
 * @param {Object} evaluation - une copie qui porte `remplaceeParId`
 * @param {Array} [evaluations]
 * @returns {boolean} vrai si la copie est hors de la note parce que remplacée
 */
function originaleEstRemplacee(evaluation, evaluations) {
    if (!evaluation || !evaluation.remplaceeParId) return false;
    if (evaluation.reconcilieParDoublon) return true;
    const reprise = _indexDesEvaluations(Array.isArray(evaluations) ? evaluations : _lireEvaluationsDuCalcul())
        .get(evaluation.remplaceeParId);
    return !reprise || _copieCompteParElleMeme(reprise);
}

function _lireEvaluationsDuCalcul() {
    // Le lecteur des calculs : il suit la simulation du Comparateur et la mémoïsation d'un lot de calculs (modes.js).
    if (typeof obtenirDonneesSelonMode === 'function') return obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    return (typeof db !== 'undefined' && typeof cle === 'function') ? (db.getSync(cle('evaluationsSauvegardees'), []) || []) : [];
}

// Retouche E4 (mesure du 28 oct. 2026) — L'INDEX NE SURVIT PAS AU LOT QUI L'A CONSTRUIT. Hors cours actif,
// `obtenirDonneesSelonMode` rend la référence de `db.getSync`, et `memoryCache` rend la même d'un appel à l'autre ;
// `appliquerJetonReprise` (evaluation-jetons.js) modifie CE tableau en place (`remplaceeParId` posé, `push` de la
// reprise) puis le réécrit. Un index gardé par tableau y lisait la reprise « introuvable » : l'originale sortait de la
// note. D'où : un index par lot de calculs (`jetonCacheLecture`, modes.js : un objet neuf à chaque lot) ou par jeu
// simulé (le Comparateur, le P des snapshots : des tableaux construits pour le calcul) ; partout ailleurs, reconstruit
// à chaque lecture. Les trois lots (indices.js, portfolio.js, tableau-bord-apercu.js) sont synchrones et n'écrivent
// pas les évaluations : rien ne modifie le tableau pendant leur durée.
const _indexParLot = new WeakMap();
function _indexDesEvaluations(liste) {
    if (!Array.isArray(liste)) return new Map();
    const lot = _lotQuiGardeLIndex(liste);
    let parListe = lot ? _indexParLot.get(lot) : null;
    let index = parListe ? parListe.get(liste) : null;
    if (!index) {
        index = new Map();
        liste.forEach(e => { if (e && e.id) index.set(e.id, e); });
        if (lot) {
            if (!parListe) { parListe = new WeakMap(); _indexParLot.set(lot, parListe); }
            parListe.set(liste, index);
        }
    }
    return index;
}

function _lotQuiGardeLIndex(liste) {
    const simule = typeof obtenirDonneesSimulationOuNull === 'function' ? obtenirDonneesSimulationOuNull('evaluationsSauvegardees') : null;
    if (simule === liste) return liste;
    return typeof jetonCacheLecture === 'function' ? jetonCacheLecture() : null;
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
// E8 (mesure du 28 oct. 2026) — une copie « Non reçu » qui PORTE une note ne vaut pas la même chose partout : la
// sommative la compte, les standards la gardent au pool, les spécifications la refusent (SOM-C2, STD-C2, SPE-C1).
// Non mesuré que l'écran puisse produire cet état (`statutRemise` est réécrit « evalue » à chaque verrouillage) :
// commenté, pas corrigé.
function evaluationNonRemise(evaluation) {
    if (!evaluation) return false;
    return evaluation.statutRemise === 'non-remis' || evaluation.statutRemise === 'non-recu';
}

/**
 * Lot 30 (17 sept. 2026) — LA COPIE EST NON RECEVABLE (plagiat, IA non autorisée) : CE N'EST PAS UNE REMISE.
 * Tranché par Grégoire le 17 sept. 2026, chiffres en main : sur le pack démo, l'indice C comptait comme remise
 * la copie marquée « plagiat » de DEMO004 (90 %, « 9/10 ») pendant que la carte du profil la rangeait sous
 * « non remis ou non recevable » — aucun calcul de complétion ne lisait le statut d'intégrité. La complétion
 * (les trois familles qui comptent des productions, et les snapshots) lit maintenant CE prédicat, à côté de
 * `evaluationNonRemise`. Ce que la NOTE fait d'une telle copie ne change pas (hors de ce prédicat).
 * ⚠ SOURCE seulement : l'indice C courant se recalcule ; un snapshot déjà écrit garde sa valeur.
 * @param {Object} evaluation
 * @returns {boolean}
 */
function evaluationNonRecevable(evaluation) {
    if (!evaluation) return false;
    return evaluation.statutIntegrite === 'plagiat' || evaluation.statutIntegrite === 'ia';
}

/**
 * CE QUE VAUT UNE COPIE NON RECEVABLE DANS LE CALCUL DE LA NOTE — la règle par défaut, posée ICI seulement.
 * Décisions de Grégoire du 15 oct. 2026 (13 h 47, 14 h 36), telles que l'Aide les dit (`accordeon-aide-irrecevables`) :
 * en sommative elle vaut 0 (une reprise la remplace ; une pratique qui ne retient que les meilleures l'écarte si elle
 * n'en est pas, puisqu'elle vaut 0) ; en spécifications, un travail non satisfaisant ; en standards, elle sort du
 * portfolio, et une terminale non recevable vaut 0 (en hybride, notes finales cochées, l'obligatoire absente du pool
 * compte 0 au dénominateur) ; en dénotation, la note est un jugement saisi : aucune copie n'y entre par calcul.
 * ⚠ C'EST LA PRATIQUE DE GRÉGOIRE, PAS UNE VÉRITÉ (28 oct. 2026, 6 h 16) : un réglage de la pratique de notation devra
 * pouvoir la remplacer (chantier au BACKLOG). Il remplacera cet objet, et les familles n'auront rien à changer : aucune
 * ne relit `statutIntegrite`, toutes lisent `valeurCopieNonRecevable` ou `noteRetenueParLeCalcul`.
 * ⚠ Se lit AU CALCUL, sur le statut : les copies déjà verrouillées suivent sans qu'on écrive dans leurs données.
 * Les captures déjà prises gardent leurs valeurs jusqu'à « Recalculer les captures ».
 */
const VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT = Object.freeze({
    note: 0,                  // sommative, terminale des standards
    satisfaisante: false,     // spécifications
    dansLePortfolio: false    // standards
});

/**
 * @param {Object} evaluation
 * @returns {{note:number, satisfaisante:boolean, dansLePortfolio:boolean}|null} null : la copie est recevable
 */
function valeurCopieNonRecevable(evaluation) {
    return evaluationNonRecevable(evaluation) ? VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT : null;
}

/**
 * La note qu'un calcul retient pour une copie : la sienne, ou ce que vaut une copie non recevable.
 * Ne décide pas si la copie entre dans la note (`evaluationEntreDansLaNote`) : seulement ce qu'elle y vaut.
 * @param {Object} evaluation
 * @returns {number|null|undefined}
 */
function noteRetenueParLeCalcul(evaluation) {
    const valeur = valeurCopieNonRecevable(evaluation);
    return valeur ? valeur.note : evaluation.noteFinale;
}

/**
 * CE QUE MONTRE UNE COPIE NON RECEVABLE à la place de sa note et de ses niveaux, sur le formulaire et sur le PDF
 * de l'étudiant·e (décision de Grégoire, 28 oct. 2026, 6 h 46). Les libellés du menu « Intégrité académique »
 * (`index.html`), à la casse de l'écran. Un AFFICHAGE : l'évaluation de l'enseignant·e reste en base, intacte, et
 * retirer le statut fait tout revenir.
 */
const LIBELLES_COPIE_NON_RECEVABLE = Object.freeze({
    plagiat: 'Non recevable (Plagiat)',
    ia: 'Non recevable (IA non autorisée)'
});

/**
 * @param {Object} evaluation
 * @returns {string|null} null : la copie est recevable
 */
function libelleCopieNonRecevable(evaluation) {
    return evaluationNonRecevable(evaluation) ? LIBELLES_COPIE_NON_RECEVABLE[evaluation.statutIntegrite] : null;
}

/**
 * Statut « Incomplet ; travail en cours » (décisions de Grégoire, 25 oct. 2026) — l'élève n'a pas eu
 * le temps de finir et l'enseignant lui donne un délai, SANS jeton. Tant que le statut est posé, la
 * copie n'a pas de note et ne compte jamais dans la note du cours (`evaluationEntreDansLaNote`) ;
 * elle compte comme REMISE pour l'indice C (`evaluationCompteCommeRemise`). Le travail terminé
 * remplace la première copie (« Remplacer l'existant » à l'import) ; l'enseignant décoche ensuite.
 * Un champ à part, pas une valeur de `statutRemise` : celui-ci est réécrit par l'application
 * (« evalue » à chaque verrouillage, « importe » à l'import).
 * @param {Object} evaluation
 * @returns {boolean}
 */
function evaluationTravailEnCours(evaluation) {
    return !!evaluation && evaluation.travailEnCours === true;
}

/**
 * LA COPIE COMPTE COMME REMISE POUR L'INDICE C — la règle unique des calculs de complétion (SOM,
 * configurable, STD, et les deux des snapshots). Une copie qui compte (#706), qui n'est ni non remise
 * ni non recevable ; ou une copie « Incomplet ; travail en cours » non remplacée (l'élève a remis à
 * temps, le délai vient de l'enseignant : Grégoire, 25 oct. 2026). Une non recevable ne l'est jamais.
 * E15 (décision de Grégoire, 28 oct. 2026, 15 h 22) : l'originale gardée qui compte dans la note (E4) compte aussi
 * comme remise, jusqu'à ce que sa reprise la remplace ; l'élève a remis ce travail. Se lit au calcul.
 * @param {Object} evaluation
 * @param {Array} [evaluations] - la liste où chercher la reprise d'une originale gardée (sinon : le stockage)
 * @returns {boolean}
 */
function evaluationCompteCommeRemise(evaluation, evaluations) {
    if (!evaluation) return false;
    if (evaluation.remplaceeParId && originaleEstRemplacee(evaluation, evaluations)) return false;
    if (evaluationNonRecevable(evaluation)) return false;
    if (evaluationTravailEnCours(evaluation)) return true;
    return evaluationEntreDansLaNote(evaluation, evaluations) && !evaluationNonRemise(evaluation);
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
window.originaleEstRemplacee = originaleEstRemplacee;   // E4 (28 oct. 2026) — pour les récits qui nomment les remplacées
window.compterEvaluationsEcarteesDeLaNote = compterEvaluationsEcarteesDeLaNote;
// Lot A (16 sept. 2026) — la règle unique de ce qui est « non remis » (deux chaînes, un lecteur)
window.evaluationNonRemise = evaluationNonRemise;
// Lot 30 (17 sept. 2026) — une copie non recevable (plagiat, IA) n'est pas une remise pour la complétion
window.evaluationNonRecevable = evaluationNonRecevable;
// 28 oct. 2026 — ce que vaut une copie non recevable dans la note (règle par défaut, un seul endroit)
window.valeurCopieNonRecevable = valeurCopieNonRecevable;
window.noteRetenueParLeCalcul = noteRetenueParLeCalcul;
window.libelleCopieNonRecevable = libelleCopieNonRecevable;   // ce que la copie montre à la place
// Statut « Incomplet ; travail en cours » (25 oct. 2026) — hors de la note, remise pour C
window.evaluationTravailEnCours = evaluationTravailEnCours;
window.evaluationCompteCommeRemise = evaluationCompteCommeRemise;
// #394 — rôles des productions STD (SSOT des deux systèmes de calcul)
window.identifierProductionTerminale = identifierProductionTerminale;
window.obtenirArtefactsIdsPoolStd = obtenirArtefactsIdsPoolStd;
window.creerComparateurRecenceStd = creerComparateurRecenceStd;
window.obtenirPratiqueActive = obtenirPratiqueActive;
window.obtenirIdPratiqueActive = obtenirIdPratiqueActive;
window.resoudrePratiqueActive = resoudrePratiqueActive;
window.designerPratiqueActive = designerPratiqueActive;
window.trouverPratiqueEnBibliotheque = trouverPratiqueEnBibliotheque;
window.obtenirTypePratiqueActive = obtenirTypePratiqueActive;
window.normaliserIdPratique = normaliserIdPratique;
// Lot N1b (21 sept. 2026) : `window.PRATIQUE_DEFAUT` n'est PLUS exporté — plus aucun lecteur ne se replie sur
// une pratique par défaut. La constante ne sert plus qu'à la représentation neutre d'un badge (ci-dessus).

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
window.methodeDeCalculDeLaPratique = methodeDeCalculDeLaPratique;   // #1149, lot 3b : la chaîne de la pratique
window.METHODE_PAR_FAMILLE = METHODE_PAR_FAMILLE;

// Gestion du cache
window.invaliderCachePratique = invaliderCachePratique;

// Fonctions de test (ne pas utiliser en production)
window.desenregistrerPratique = desenregistrerPratique;
window.viderRegistre = viderRegistre;



})();
