/* ===============================
   BIBLIOTHÈQUE DE CONFIGURATIONS DE PRATIQUES
   (c) 2 janvier 2026 - Beta 95

   Bibliothèque de configurations de pratiques de notation.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Inclut les modèles prédéfinis, un par famille (DEN, SPE, STD, SOM)

   Clé de stockage: 'bibliothequePratiques' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_PRATIQUES = 'bibliothequePratiques';

/**
 * Modèles prédéfinis (gabarits de base fournis avec l'application)
 * Ces modèles sont toujours disponibles même si la bibliothèque est vide
 * Jetons par défaut (décision de Grégoire, 29 oct. 2026) : chacun porte `jetons: { actif: false }`. Toutes les voies qui
 * installent un modèle le recopient (« Utiliser dans ce trimestre », « Partir d'un modèle », « Dupliquer pour créer ma
 * pratique ») : la pratique installée n'offre les jetons que si l'enseignant·e coche « Activer le système de jetons ». Une
 * pratique déjà installée d'un modèle n'est pas touchée (elle garde les jetons du défaut).
 */
const MODELES_PRATIQUES_PREDEFINIS = {
    // === PAN-DÉNOTATION (#318) ===
    // ⚠️ Placé EN TÊTE À DESSEIN : obtenirToutesLesPratiquesBibliothequeSync fait `unshift`
    // sur chaque gabarit → l'ordre d'affichage est INVERSÉ, donc une entrée en tête ici
    // s'affiche EN DERNIER dans « Partir d'un modèle » (demande Grégoire : DEN en fin de liste).
    // Gabarit « de base », volontairement GÉNÉRIQUE et LARGE (pas une discipline précise) :
    // DEN n'est pas la pratique de Grégoire — description et paramètres s'appuient sur la
    // théorie (Girouard-Gagné, Talbert, CoP Sherbrooke ; cf. SKILL_pratiques_notation §2 bis/§8).
    // Mode `eliminee` (seul livré, #318). Échelle/grille OPTIONNELLES (la rétroaction peut aussi
    // être orale/hors-app ; l'app garde au moins une trace) ; les CIBLES tiennent le rôle des
    // critères explicites. DEN reste un chantier en soi (modes différée/réduite à venir).
    'DEN-base': {
        id: 'DEN-base',
        nom: 'Modèle de base',
        description: 'Rétroaction qualitative sur des cibles d\'apprentissage explicites ; la note finale certificative (RREC) est posée à la fin selon l\'atteinte des cibles, sans note chiffrée en cours de route.',
        type: 'denotation',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        jetons: { actif: false },   // jetons par défaut (29 oct. 2026) : une pratique installée d'un modèle les refuse jusqu'à ce qu'on coche « Activer »
        pratiques: ['DEN'],
        configuration: {
            type: 'denotation',
            modeDEN: 'eliminee',
            objectifs: [
                { id: 'cible-1', nom: 'Maîtriser les savoirs et concepts essentiels du cours' },
                { id: 'cible-2', nom: 'Appliquer les méthodes propres à la discipline' },
                { id: 'cible-3', nom: 'Communiquer clairement sa démarche et ses résultats' }
            ],
            suggestion: { methode: 'mode' },
            echelleId: null,
            grilleId: null
        }
    },

    // === PAN-SPÉCIFICATIONS ===
    'SPE-simple': {
        id: 'SPE-simple',
        nom: 'Modèle simple',
        description: 'Pour débuter avec PAN – Spécifications',
        type: 'specifications',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        jetons: { actif: false },   // jetons par défaut (29 oct. 2026) : une pratique installée d'un modèle les refuse jusqu'à ce qu'on coche « Activer »
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' },
                { id: 2, nom: 'Examen', description: 'Évaluation sommative' }
            ],
            forfaits: [
                { id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } },
                { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }
            ]
        }
    },
    // === SOMMATIVE ===
    'SOM-litterature': {
        // ⚠⚠ L'IDENTIFIANT NOMME UNE DISCIPLINE ALORS QUE PLUS RIEN DE VISIBLE
        // NE LE FAIT — ET IL RESTE. Ce gabarit est offert depuis le 28 mai 2026
        // (`git log -S "SOM-litterature"`), donc AVANT l'ouverture publique du
        // 1er juin : quelqu'un a pu l'adopter. L'`id` est la clé qui empêche le
        // prédéfini de réapparaître à côté de sa copie (`idsExistants` dans la
        // fusion à la lecture). Le renommer ferait donc apparaître DEUX entrées
        // pour une seule pratique, chez la personne la plus ancienne.
        // ⮕ Le sort des identifiants qui portent un nom propre ou une matière
        // est une DÉCISION DUE À GRÉGOIRE, inscrite en **#690** avec les
        // prénoms de collègues de `pratiques-predefines.js`. Ne pas trancher
        // ici en passant.
        id: 'SOM-litterature',
        // #691 — LE NOM ÉTAIT DÉJÀ NEUTRE ; C'EST LA CONFIGURATION QUI RESTAIT
        // UNE PRATIQUE DE LITTÉRATURE, et c'est elle que voit l'enseignant qui
        // adopte le modèle. « Analyse partielle », « Portfolio », « Cohérence
        // textuelle », le double verrou, « 5-7 travaux » : autant de réglages
        // d'une personne, servis comme un défaut à tout le monde.
        // ⮕ Le patron est `SPE-simple` : court, générique, fait pour DÉMARRER,
        // pas pour reproduire la pratique de quelqu'un.
        nom: 'Modèle sommatif',
        description: 'Pour débuter avec une pratique sommative',
        type: 'sommative',
        auteur: 'Gabarit Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        jetons: { actif: false },   // jetons par défaut (29 oct. 2026) : une pratique installée d'un modèle les refuse jusqu'à ce qu'on coche « Activer »
        pratiques: ['SOM'],
        configuration: {
            methodeCalcul: 'moyenne-ponderee',
            // Une répartition que n'importe quelle discipline reconnaît : deux
            // travaux, deux examens. Rien à décoder.
            //
            // ⚠⚠ LES QUATRE PARTS SONT ÉGALES, ET C'EST DÉLIBÉRÉ — NE PAS
            // « CORRIGER » CES 25 % EN LES TROUVANT TROP PLATS.
            // Décision de Grégoire, 2 septembre 2026. Les NOMS sont neutres :
            // « Examen de mi-session » est du vocabulaire commun à tous les
            // programmes. La PONDÉRATION, elle, ne l'était pas : `20/20/30/30`
            // met 60 % du poids sur les examens, et c'est une position
            // pédagogique, pas un point de départ. En arts, en techniques, en
            // éducation physique, les examens sont minoritaires ou absents —
            // un enseignant de ces programmes aurait lu, dans un gabarit
            // FOURNI PAR L'APPLICATION, une opinion sur la bonne façon d'évaluer.
            //
            // ⮕ Des parts égales ne disent rien. Et surtout : quatre nombres
            // identiques SE VOIENT comme un réglage à poser, là où `20/20/30/30`
            // se lit comme un réglage déjà décidé par quelqu'un d'autre.
            // C'est la suite directe de #691 : une pondération qui ressemble à
            // une vraie pratique reproduit la pratique de son auteur, en plus
            // discret qu'un libellé.
            evaluations: [
                { id: 1, nom: 'Travail 1', type: 'travail', ponderation: 25 },
                { id: 2, nom: 'Travail 2', type: 'travail', ponderation: 25 },
                { id: 3, nom: 'Examen de mi-session', type: 'examen', ponderation: 25 },
                { id: 4, nom: 'Examen final', type: 'examen', ponderation: 25 }
            ],
            // ⮕ LES QUATRE CRITÈRES DE LA GRILLE DE DÉPART (`grilles.js`,
            // GRILLE_GENERIQUE). Cohérence gratuite : qui prend la grille de
            // départ ET ce modèle voit le même vocabulaire des deux côtés.
            criteres: {
                type: 'fixes',
                liste: [
                    'Compréhension',
                    'Application',
                    'Analyse',
                    'Synthèse'
                ]
            }
            // `particularites` RETIRÉ : `doubleVerrou` et
            // `portfolioNombreTravaux: '5-7'` étaient deux réglages personnels,
            // pas un défaut. Un gabarit de démarrage n'impose pas de mécanique.
        }
        // (#900, lot N6 — constat B-4 de l'audit du 16 sept. 2026 : le bloc `seuils` en camelCase
        // (`vaBien`, `difficulte`, `grandeDifficulte`) est retiré. La pratique configurable lit
        // `va_bien` / `difficulte` / `grande_difficulte` : il était sans effet, ses valeurs étaient
        // celles des défauts.)
    },
    // === PAN-STANDARDS ===
    // #435 (9 août 2026) : les quatre gabarits « par objectifs » (Par objectifs
    // (Pondéré), STD Chimie organique, STD Interfaces et BD, STD Anatomie) sont
    // RETIRÉS avec le mode — chacun illustrait un des 4 modes de calcul retirés
    // et aucun ne portait le moindre objectif (zéro entrée `objectifs: []`) :
    // même appliqués, ils n'ont jamais rien pu calculer.
    'STD-n-meilleurs': {
        id: 'STD-n-meilleurs',
        nom: 'N meilleures évaluations',
        description: 'Garde les 7 meilleures évaluations sur 10, valorise la progression',
        type: 'standards',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        jetons: { actif: false },   // jetons par défaut (29 oct. 2026) : une pratique installée d'un modèle les refuse jusqu'à ce qu'on coche « Activer »
        pratiques: ['STD'],
        configuration: {
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 7,
                minimumCompletion: 7
            }
        }
    },
    'STD-n-recents': {
        id: 'STD-n-recents',
        nom: 'N plus récentes',
        description: 'Garde les 5 évaluations les plus récentes, valorise l\'état actuel',
        type: 'standards',
        auteur: 'Demo Labo Codex',
        discipline: 'Général',
        estGabarit: true,
        jetons: { actif: false },   // jetons par défaut (29 oct. 2026) : une pratique installée d'un modèle les refuse jusqu'à ce qu'on coche « Activer »
        pratiques: ['STD'],
        configuration: {
            portfolio: {
                methodeSelection: 'recents',
                nombreARetenir: 5,
                minimumCompletion: 5
            }
        }
    },
    // ============================================================================
    // PRATIQUES SOMMATIVES TRADITIONNELLES
    // ============================================================================


};

/**
 * Obtenir toutes les configurations de la bibliothèque (incluant gabarits prédéfinis)
 * @param {boolean} inclureGabarits - Inclure les gabarits prédéfinis (true par défaut)
 * @returns {Promise<Array>} Tableau de toutes les configurations disponibles
 */
async function obtenirToutesLesPratiquesBibliotheque(inclureGabarits = true) {
    let bibliotheque = [];

    try {
        bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    } catch (e) {
        console.error('[Bibliothèque Pratiques] Erreur lecture:', e);
        bibliotheque = [];
    }

    // Ajouter les gabarits prédéfinis s'ils ne sont pas déjà présents
    if (inclureGabarits) {
        const idsExistants = new Set(bibliotheque.map(p => p.id));

        Object.values(MODELES_PRATIQUES_PREDEFINIS).forEach(gabarit => {
            if (!idsExistants.has(gabarit.id)) {
                bibliotheque.unshift({
                    ...gabarit,
                    estGabarit: true,
                    dateAjoutBiblio: null // null = prédéfini
                });
            }
        });
    }

    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @param {boolean} inclureGabarits - Inclure les gabarits prédéfinis (true par défaut)
 * @returns {Array} Tableau de toutes les configurations disponibles
 */
function obtenirToutesLesPratiquesBibliothequeSync(inclureGabarits = true) {
    let bibliotheque = [];

    try {
        bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    } catch (e) {
        bibliotheque = [];
    }

    // Ajouter les gabarits prédéfinis
    if (inclureGabarits) {
        const idsExistants = new Set(bibliotheque.map(p => p.id));

        Object.values(MODELES_PRATIQUES_PREDEFINIS).forEach(gabarit => {
            if (!idsExistants.has(gabarit.id)) {
                bibliotheque.unshift({
                    ...gabarit,
                    estGabarit: true,
                    dateAjoutBiblio: null
                });
            }
        });
    }

    return bibliotheque;
}

/**
 * Obtenir les configurations d'un type de pratique spécifique
 * @param {string} typePratique - Type de pratique (specifications, standards, etc.)
 * @returns {Promise<Array>} Tableau des configurations de ce type
 */
async function obtenirPratiquesParType(typePratique) {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    if (!typePratique || typePratique === 'tous') {
        return bibliotheque;
    }
    return bibliotheque.filter(p =>
        p.type && p.type.toLowerCase() === typePratique.toLowerCase()
    );
}

/**
 * Obtenir les configurations d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Promise<Array>} Tableau des configurations de cette discipline
 */
async function obtenirPratiquesParDiscipline(discipline) {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(p =>
        p.discipline && p.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

/**
 * Obtenir la liste des disciplines disponibles dans la bibliothèque
 * @returns {Promise<Array>} Tableau des noms de disciplines uniques
 */
async function obtenirDisciplinesDisponiblesPratiques() {
    const bibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    const disciplines = new Set();

    bibliotheque.forEach(config => {
        if (config.discipline) {
            disciplines.add(config.discipline);
        }
    });

    return Array.from(disciplines).sort();
}

/**
 * Obtenir une configuration par son ID
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object|null>} La configuration ou null
 */
async function obtenirConfigurationPratiqueParId(configId) {
    // 1. Vérifier d'abord les gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        return { ...MODELES_PRATIQUES_PREDEFINIS[configId] };
    }

    // 2. Vérifier la Bibliothèque
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    const dansBibliotheque = bibliotheque.find(p => p.id === configId);
    if (dansBibliotheque) return dansBibliotheque;

    // 3. Vérifier les pratiques configurables de l'utilisateur. Les configs vivent
    //    dans la clé namespacée par trimestre depuis 99.64 ; on lit donc
    //    cle('pratiquesConfigurables') d'abord, avec repli sur la clé nue legacy
    //    (même idiome que pratiques-gestion.js / evaluation-calcul.js).
    const configurables = await db.get(cle('pratiquesConfigurables')) || await db.get('pratiquesConfigurables') || [];
    return configurables.find(p => p.id === configId) || null;
}

/**
 * Ajouter une configuration à la Bibliothèque
 * @param {Object} configuration - La configuration à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterPratiqueALaBibliotheque(configuration) {
    // B-β — passage obligé par assainirObjet. Le schéma pratique inclut
    // `configuration` en type 'object' brut pour préserver la structure
    // riche (typesTravaux, forfaits, portfolio) sans devoir
    // la modéliser exhaustivement.
    const configSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.pratique)
        ? window.assainirObjet(configuration, window.SCHEMAS_IMPORT.pratique)
        : configuration;

    // #599 — la présence est vérifiée DANS la file. Hors file, deux ajouts
    // concurrents du même item passaient tous les deux, et la bibliothèque
    // partagée gardait un doublon que rien ne signalait.
    let dejaPresente = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_PRATIQUES, (lues) => {
        const bibliotheque = lues || [];

        const existe = bibliotheque.some(p => p.id === configSafe.id);
        if (existe) {
            dejaPresente = true;
            return undefined;
        }

        // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
        const auteur = configSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

        const configBiblio = {
            ...configSafe,
            dansBibliotheque: true,
            dateAjoutBiblio: new Date().toISOString(),
            auteur: auteur
        };

        bibliotheque.push(configBiblio);
        return bibliotheque;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_PRATIQUES);   // lot F : geste hors témoin (ajouterPratiqueALaBibliotheque)

    if (dejaPresente) {
        return false;
    }

    return true;
}

/**
 * Mettre à jour une configuration existante
 * @param {Object} configuration - La configuration mise à jour
 * @returns {Promise<boolean>} true si mise à jour, false si non trouvée
 */
async function mettreAJourConfigurationPratique(configuration) {
    let miseAJour = false;
    await db.modifier(CLE_BIBLIOTHEQUE_PRATIQUES, (lues) => {
        const bibliotheque = lues || [];

        const index = bibliotheque.findIndex(p => p.id === configuration.id);
        if (index === -1) return undefined;

        bibliotheque[index] = {
            ...bibliotheque[index],
            ...configuration,
            dateModification: new Date().toISOString()
        };

        miseAJour = true;
        return bibliotheque;
    }, []);

    return miseAJour;
}

/**
 * Retirer une configuration de la bibliothèque
 * @param {string} configId - ID de la configuration à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée ou prédéfinie
 */
async function retirerPratiqueDeLaBibliotheque(configId) {
    // Bug fix 28 mai 2026 PM : on autorise la suppression de la copie IDB
    // même si son ID partage avec un seed prédéfini. Le seed lui-même n'est
    // pas affecté (il vit dans le code source) et se réinjecte automatiquement
    // via obtenirToutesLesPratiquesBibliotheque au prochain rafraîchissement.
    // La protection seeds prédéfinis vit désormais dans supprimerPratiqueDeBibliothequePartagee
    // qui distingue correctement "copie IDB" vs "gabarit pur".
    // #599 — le retrait passe par la file. Hors file, un retrait et un ajout
    // concurrents sur la MÊME Bibliothèque s'écrasaient l'un l'autre :
    // les cinq familles écrivent dans un seul magasin, pas un par famille.
    let retiree = false;
    const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE_PRATIQUES, (lues) => {
        const bibliotheque = lues || [];
        const restants = bibliotheque.filter(p => p.id !== configId);

        // Rien retiré : le mutateur rend `undefined`, aucune écriture.
        if (restants.length === bibliotheque.length) return undefined;

        retiree = true;
        return restants;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_PRATIQUES);   // lot F : geste hors témoin (retirerPratiqueDeLaBibliotheque)

    if (!retiree) {
        return false;
    }

    // #320 — cohérence des répertoires : une pratique retirée quitte tout
    // répertoire qui la classait (sinon itemId orphelin). Appel défensif :
    // le module de classement peut ne pas être chargé.
    if (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.retirerItem === 'function') {
        window.repertoiresBibliotheque.retirerItem(configId, 'pratiques');
    }

    return true;
}

/**
 * Appliquer une configuration depuis la bibliothèque
 * Remplit TOUS les paramètres pertinents selon le type de pratique (STD, SPE, etc.)
 * @param {string} configId - ID de la configuration à appliquer
 * @returns {Promise<boolean>} true si appliquée avec succès
 */
async function appliquerConfigurationPratique(configId) {
    const config = await obtenirConfigurationPratiqueParId(configId);
    if (!config) {
        console.error('[Bibliothèque Pratiques] Configuration non trouvée:', configId);
        return false;
    }

    let modalites = {};
    try {
        modalites = window.modalitesEvaluation.lire();
    } catch (e) {
        modalites = {};
    }

    // Session A-2 : id canonique normalisé à la lecture (config.type peut être legacy).
    const typeConfig = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(config.type) : config.type);

    // Appliquer selon le type (#328 L2-b2 : le miroir modalites.pratique n'est
    // plus écrit — appliquer une config ne change pas la pratique active du
    // groupe-cours, seule l'activation par la SSOT le fait)
    if (typeConfig === 'specifications') {
        if (!modalites.specifications) {
            modalites.specifications = {};
        }

        // #935 (15 oct. 2026, Grégoire) : sans seuil, 100 % — une copie est satisfaisante quand toutes ses spécifications sont respectées ; un seuil écrit à 0 reste 0.
        modalites.specifications.seuilAcceptable = (typeof config.configuration?.seuilAcceptable === 'number')
            ? config.configuration.seuilAcceptable : 100;
        modalites.specifications.typesTravaux = JSON.parse(JSON.stringify(config.configuration?.typesTravaux || []));
        modalites.specifications.forfaits = JSON.parse(JSON.stringify(config.configuration?.forfaits || []));
        modalites.specifications.modeleChoisi = config.id;
        modalites.specifications.modeleNom = config.nom;

    } else if (typeConfig === 'standards') {
        // (#900, lot N6 : `varianteCalcul` n'est plus recopié dans les modalités — aucun lecteur.)

        // Portfolio (mode de sélection, N à retenir, etc.)
        if (config.configuration?.portfolio) {
            modalites.portfolio = {
                ...(modalites.portfolio || {}),
                ...JSON.parse(JSON.stringify(config.configuration.portfolio))
            };
        }

        // (#435 : plus de projection `parObjectifs` — le moteur ne la lit plus.)

        // Marquer la configuration appliquée
        modalites.configurationSTDAppliquee = {
            id: config.id,
            nom: config.nom,
            dateApplication: new Date().toISOString()
        };
    }

    window.modalitesEvaluation.remplacer(modalites);

    // #469 (11 oct. 2026) — le rafraîchissement « interface SPE » qui suivait est RETIRÉ, avec
    // l'ancien éditeur (`pratique-notation-v2.js`) qui portait ses trois fonctions : leurs
    // cibles (`v2-spec-*`) n'existent plus dans index.html, chaque appel sortait sans rien faire.
    // #434 (9 août 2026) — le bloc de rafraîchissement « interface STD » qui
    // suivait est RETIRÉ : ses six `getElementById` visaient des ids `v2-*`
    // (`v2-variante-calcul`, `v2-portfolio-selection`, `v2-portfolio-nombre`,
    // `v2-portfolio-minimum`, `v2-portfolio-total`, `v2-decoupler-pn`) qui
    // n'existent plus dans `index.html` — le DOM de l'éditeur V2 est parti.
    // Chaque `if (element && …)` sortait donc silencieusement : du code qui ne
    // pouvait plus rien rafraîchir, et qui ne pouvait pas non plus échouer.
    // C'est le formulaire `mat-*` qui recharge l'interface, via chargerPratiqueDansFormulaireMat().

    return true;
}

/**
 * Importer des configurations dans la bibliothèque
 * @param {Array} configurations - Tableau de configurations à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerPratiquesDansBibliotheque(configurations) {
    let ajoutees = 0;
    let existantes = 0;

    for (const config of configurations) {
        const resultat = await ajouterPratiqueALaBibliotheque(config);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de configurations
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequePratiques() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    const configurations = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(p => ajouterMetadonnéesCC(p, 'pratique', p.nom || '').contenu || p)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'configurations-pratiques',
        dateExport: new Date().toISOString(),
        nombreConfigurations: configurations.length,
        configurations
    };
}

/**
 * Exporter une configuration spécifique
 * @param {string} configId - ID de la configuration à exporter
 * @returns {Promise<Object|null>} Objet JSON exportable ou null
 */
async function exporterConfigurationPratique(configId) {
    const config = await obtenirConfigurationPratiqueParId(configId);
    if (!config) return null;

    return {
        version: '1.0',
        type: 'configuration-pratique',
        dateExport: new Date().toISOString(),
        configuration: config
    };
}

// ===========================
// #898 — ADOPTER UN MODÈLE STANDARDS SANS ÉCHELLE DEMANDE L'ÉCHELLE
// ===========================
// Tranché par Grégoire le 17 sept. 2026. Les gabarits « N meilleures » et « N plus
// récentes » n'ont pas d'échelle : adoptés tels quels, ils ne construisaient pas
// d'instance (« Champ obligatoire manquant : echelle ») — export « non constructible »,
// Comparateur muet, pendant que le profil calculait par son chemin riche. Deux gestes
// vivants y menaient, et les deux passent par ici : « ✓ Créer la pratique » de
// l'assistant après « Partir d'un modèle » (wizard-pratique-v2.js) et « Ajouter » de la
// bibliothèque (pratiques-gestion.js). Les imports et le pack ne posent pas de question
// et ne sont pas touchés ; la pratique Standards du pack porte son échelle.
// ⚠ On ne devine jamais l'échelle, même s'il n'en existe qu'une.

/** Les mots de Grégoire, tels quels. */
const QUESTION_ECHELLE_ADOPTION = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note. Choisis-la :';

/**
 * #909 — le trimestre n'a AUCUNE échelle à offrir : la fenêtre s'ouvre quand même, dit
 * pourquoi et où aller, et l'adoption n'a pas lieu. Les mots de Grégoire (17 sept. 2026) ;
 * le nom d'écran est celui de la navigation (« Conception → Échelles de performance »).
 */
const PHRASE_AUCUNE_ECHELLE_ADOPTION = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note, et ce trimestre n\'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle.';

/**
 * Vrai pour un modèle de la famille Standards qui ne porte AUCUNE échelle — ni
 * embarquée, ni par id. Même lecture que `construireConfigComplete` (pratique-registre.js),
 * qui est celle dont dépend l'instance. Les autres familles ne calculent pas par une
 * échelle : jamais de question.
 * @param {Object} modele
 * @returns {boolean}
 */
function modeleDemandeEchelle(modele) {
    if (!modele) return false;
    const config = modele.config || {};
    const configuration = modele.configuration || {};
    const typeBrut = config.type || modele.type || configuration.type;
    const famille = (typeof normaliserIdPratique === 'function') ? normaliserIdPratique(typeBrut) : typeBrut;
    if (famille !== 'standards') return false;
    return !(config.echelle || modele.echelle || configuration.echelleId || config.echelleId);
}

/**
 * Les échelles du trimestre offertes à l'adoption : celles des dropdowns de l'éditeur
 * de pratique (`chargerDropdownEchellesMat`, `verifierDependancesPratique`).
 * @returns {Array<{id:string, nom:string}>}
 */
function obtenirEchellesOffertesAdoption() {
    return (db.getSync(cle('echellesTemplates'), []) || [])
        .filter(e => e && e.id && e.dansBibliotheque !== false);
}

/**
 * Pose la question de l'échelle pour l'adoption de `modele`.
 * @param {Object} modele
 * @returns {Promise<{adopter:boolean, echelleId:(string|null)}>}
 *   · modèle qui ne demande rien → { adopter: true, echelleId: null } ;
 *   · échelle choisie → { adopter: true, echelleId } ;
 *   · question fermée sans choix → { adopter: false } : rien n'est adopté.
 *   · aucune échelle à offrir (#909) → la phrase est affichée, { adopter: false }.
 */
async function demanderEchelleAdoption(modele) {
    if (!modeleDemandeEchelle(modele)) return { adopter: true, echelleId: null };
    const echelles = obtenirEchellesOffertesAdoption();
    // #909 — aucune échelle utilisable dans le trimestre : la liste serait vide et
    // « Adopter » sans objet. On le DIT (même titre que la question : le nom du modèle),
    // et rien n'est adopté — les deux gestes d'adoption passent par ici.
    if (echelles.length === 0) {
        await uiDialogues.informer({ titre: modele.nom || 'Sans nom', message: PHRASE_AUCUNE_ECHELLE_ADOPTION });
        return { adopter: false, echelleId: null };
    }
    const choisie = await uiDialogues.demanderChoix({
        titre: modele.nom || 'Sans nom',
        message: QUESTION_ECHELLE_ADOPTION,
        choix: echelles.map(e => ({ valeur: e.id, libelle: e.nom || 'Sans nom' })),
        texteConfirmer: 'Adopter'
    });
    // La valeur rendue doit être une échelle OFFERTE : rien d'autre ne s'écrit.
    if (!choisie || !echelles.some(e => e.id === choisie)) return { adopter: false, echelleId: null };
    return { adopter: true, echelleId: choisie };
}

/**
 * Pose l'échelle choisie sur la pratique adoptée (mute et rend `pratique`).
 * @param {Object} pratique
 * @param {string|null} echelleId
 */
function poserEchelleAdoption(pratique, echelleId) {
    if (!pratique || !echelleId) return pratique;
    pratique.configuration = Object.assign({}, pratique.configuration, { echelleId: echelleId });
    return pratique;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.modeleDemandeEchelle = modeleDemandeEchelle;
window.obtenirEchellesOffertesAdoption = obtenirEchellesOffertesAdoption;
window.demanderEchelleAdoption = demanderEchelleAdoption;
window.poserEchelleAdoption = poserEchelleAdoption;
window.obtenirToutesLesPratiquesBibliotheque = obtenirToutesLesPratiquesBibliotheque;
window.obtenirToutesLesPratiquesBibliothequeSync = obtenirToutesLesPratiquesBibliothequeSync;
window.obtenirPratiquesParType = obtenirPratiquesParType;
window.obtenirPratiquesParDiscipline = obtenirPratiquesParDiscipline;
window.obtenirDisciplinesDisponiblesPratiques = obtenirDisciplinesDisponiblesPratiques;
window.obtenirConfigurationPratiqueParId = obtenirConfigurationPratiqueParId;
window.ajouterPratiqueALaBibliotheque = ajouterPratiqueALaBibliotheque;
window.mettreAJourConfigurationPratique = mettreAJourConfigurationPratique;
window.retirerPratiqueDeLaBibliotheque = retirerPratiqueDeLaBibliotheque;
window.appliquerConfigurationPratique = appliquerConfigurationPratique;
window.importerPratiquesDansBibliotheque = importerPratiquesDansBibliotheque;
window.exporterBibliothequePratiques = exporterBibliothequePratiques;
window.exporterConfigurationPratique = exporterConfigurationPratique;
window.CLE_BIBLIOTHEQUE_PRATIQUES = CLE_BIBLIOTHEQUE_PRATIQUES;
window.MODELES_PRATIQUES_PREDEFINIS = MODELES_PRATIQUES_PREDEFINIS;

})();
