/* ===============================
   BIBLIOTHÈQUE DE CONFIGURATIONS DE PRATIQUES
   (c) 2 janvier 2026 - Beta 95

   Bibliothèque partagée de configurations de pratiques de notation.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Inclut les modèles prédéfinis (François, Simple, Littérature)

   Clé de stockage: 'bibliothequePratiques' (sans namespace)
   =============================== */

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_PRATIQUES = 'bibliothequePratiques';

/**
 * Modèles prédéfinis (gabarits de base fournis avec l'application)
 * Ces modèles sont toujours disponibles même si la bibliothèque est vide
 */
const MODELES_PRATIQUES_PREDEFINIS = {
    'SPE-francois': {
        id: 'SPE-francois',
        nom: 'Modèle François',
        description: 'Basé sur la pratique de François A.-H. (Chimie)',
        type: 'pan-specifications',
        auteur: 'François A.-H.',
        discipline: 'Chimie',
        estGabarit: true,
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Prise de position', description: 'Travail écrit argumentatif' },
                { id: 2, nom: 'Test', description: 'Évaluation des connaissances' },
                { id: 3, nom: 'Portfolio', description: 'Dossier d\'apprentissage' },
                { id: 4, nom: 'Oral', description: 'Présentation orale' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 90, travaux: { 1: 3, 2: 2, 3: 1, 4: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 2, 3: 1, 4: 1 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 2, 3: 0, 4: 0 } }
            ]
        }
    },
    'SPE-simple': {
        id: 'SPE-simple',
        nom: 'Modèle simple',
        description: 'Pour débuter avec PAN-Spécifications',
        type: 'pan-specifications',
        auteur: 'Codex Numeris',
        discipline: 'Général',
        estGabarit: true,
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
    'SPE-litterature': {
        id: 'SPE-litterature',
        nom: 'Modèle littérature',
        description: 'Adapté aux cours de français et littérature',
        type: 'pan-specifications',
        auteur: 'Codex Numeris',
        discipline: 'Français',
        estGabarit: true,
        pratiques: ['SPE'],
        configuration: {
            seuilAcceptable: 75,
            typesTravaux: [
                { id: 1, nom: 'Analyse littéraire', description: 'Analyse d\'un texte ou d\'une œuvre' },
                { id: 2, nom: 'Dissertation', description: 'Texte argumentatif structuré' },
                { id: 3, nom: 'Portfolio de lecture', description: 'Traces de lecture et réflexions' }
            ],
            forfaits: [
                { id: 1, lettre: 'A', note: 100, travaux: { 1: 2, 2: 1, 3: 1 } },
                { id: 2, lettre: 'B', note: 80, travaux: { 1: 2, 2: 1, 3: 0 } },
                { id: 3, lettre: 'C', note: 60, travaux: { 1: 1, 2: 1, 3: 0 } }
            ]
        }
    }
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
 * @param {string} typePratique - Type de pratique (pan-specifications, pan-standards, etc.)
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
    // Vérifier d'abord les gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        return { ...MODELES_PRATIQUES_PREDEFINIS[configId] };
    }

    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    return bibliotheque.find(p => p.id === configId) || null;
}

/**
 * Ajouter une configuration à la bibliothèque partagée
 * @param {Object} configuration - La configuration à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterPratiqueALaBibliotheque(configuration) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const existe = bibliotheque.some(p => p.id === configuration.id);
    if (existe) {
        console.log('[Bibliothèque Pratiques] Configuration déjà présente:', configuration.id);
        return false;
    }

    const configBiblio = {
        ...configuration,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: configuration.auteur || 'Inconnu'
    };

    bibliotheque.push(configBiblio);
    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);

    console.log('[Bibliothèque Pratiques] Configuration ajoutée:', configuration.nom);
    return true;
}

/**
 * Mettre à jour une configuration existante
 * @param {Object} configuration - La configuration mise à jour
 * @returns {Promise<boolean>} true si mise à jour, false si non trouvée
 */
async function mettreAJourConfigurationPratique(configuration) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const index = bibliotheque.findIndex(p => p.id === configuration.id);
    if (index === -1) {
        return false;
    }

    bibliotheque[index] = {
        ...bibliotheque[index],
        ...configuration,
        dateModification: new Date().toISOString()
    };

    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);
    console.log('[Bibliothèque Pratiques] Configuration mise à jour:', configuration.nom);
    return true;
}

/**
 * Retirer une configuration de la bibliothèque
 * @param {string} configId - ID de la configuration à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée ou prédéfinie
 */
async function retirerPratiqueDeLaBibliotheque(configId) {
    // Ne pas permettre la suppression des gabarits prédéfinis
    if (MODELES_PRATIQUES_PREDEFINIS[configId]) {
        console.log('[Bibliothèque Pratiques] Impossible de supprimer un gabarit prédéfini:', configId);
        return false;
    }

    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(p => p.id !== configId);

    if (bibliotheque.length === indexAvant) {
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_PRATIQUES, bibliotheque);
    console.log('[Bibliothèque Pratiques] Configuration retirée:', configId);
    return true;
}

/**
 * Sauvegarder la configuration actuelle comme nouvelle configuration
 * @param {string} nom - Nom de la configuration
 * @param {string} description - Description optionnelle
 * @returns {Promise<Object>} La configuration sauvegardée
 */
async function sauvegarderConfigurationActuelle(nom, description = '') {
    let modalites = {};
    try {
        modalites = db.getSync('modalitesEvaluation') || {};
    } catch (e) {
        modalites = {};
    }

    const nouvelleConfig = {
        id: `config_${Date.now()}`,
        nom: nom,
        description: description,
        type: modalites.pratique || 'pan-specifications',
        auteur: 'Utilisateur',
        discipline: modalites.discipline || 'Général',
        dateCreation: new Date().toISOString(),
        configuration: {}
    };

    // Selon le type de pratique, extraire la configuration pertinente
    if (modalites.pratique === 'pan-specifications' || modalites.pratique === 'specifications') {
        nouvelleConfig.pratiques = ['SPE'];
        nouvelleConfig.configuration = {
            seuilAcceptable: modalites.specifications?.seuilAcceptable || 75,
            typesTravaux: JSON.parse(JSON.stringify(modalites.specifications?.typesTravaux || [])),
            forfaits: JSON.parse(JSON.stringify(modalites.specifications?.forfaits || []))
        };
    } else if (modalites.pratique === 'pan-standards') {
        nouvelleConfig.pratiques = ['STD'];
        nouvelleConfig.configuration = {
            varianteCalcul: modalites.varianteCalcul || '',
            parObjectifs: modalites.parObjectifs ? JSON.parse(JSON.stringify(modalites.parObjectifs)) : null
        };
    }

    // Ajouter à la bibliothèque
    await ajouterPratiqueALaBibliotheque(nouvelleConfig);

    return nouvelleConfig;
}

/**
 * Appliquer une configuration depuis la bibliothèque
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
        modalites = db.getSync('modalitesEvaluation') || {};
    } catch (e) {
        modalites = {};
    }

    // Appliquer selon le type
    if (config.type === 'pan-specifications') {
        modalites.pratique = 'pan-specifications';

        if (!modalites.specifications) {
            modalites.specifications = {};
        }

        modalites.specifications.seuilAcceptable = config.configuration?.seuilAcceptable || 75;
        modalites.specifications.typesTravaux = JSON.parse(JSON.stringify(config.configuration?.typesTravaux || []));
        modalites.specifications.forfaits = JSON.parse(JSON.stringify(config.configuration?.forfaits || []));
        modalites.specifications.modeleChoisi = config.id;
        modalites.specifications.modeleNom = config.nom;
    } else if (config.type === 'pan-standards') {
        modalites.pratique = 'pan-standards';

        if (config.configuration?.varianteCalcul) {
            modalites.varianteCalcul = config.configuration.varianteCalcul;
        }
        if (config.configuration?.parObjectifs) {
            modalites.parObjectifs = JSON.parse(JSON.stringify(config.configuration.parObjectifs));
        }
    }

    db.setSync('modalitesEvaluation', modalites);
    console.log('[Bibliothèque Pratiques] Configuration appliquée:', config.nom);

    // Rafraîchir l'interface si disponible
    if (typeof chargerConfigSpecifications === 'function') {
        chargerConfigSpecifications();
    }
    if (typeof afficherTypesTravauxSpec === 'function') {
        afficherTypesTravauxSpec(modalites.specifications?.typesTravaux || []);
    }
    if (typeof afficherForfaitsSpec === 'function') {
        afficherForfaitsSpec(
            modalites.specifications?.forfaits || [],
            modalites.specifications?.typesTravaux || []
        );
    }

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

    console.log(`[Bibliothèque Pratiques] Import: ${ajoutees} ajoutées, ${existantes} déjà existantes`);
    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de configurations
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequePratiques() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRATIQUES) || [];

    return {
        version: '1.0',
        type: 'configurations-pratiques',
        dateExport: new Date().toISOString(),
        nombreConfigurations: bibliotheque.length,
        configurations: bibliotheque
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

/**
 * Obtenir le nombre de configurations dans la bibliothèque
 * @returns {number}
 */
function getNombrePratiquesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRATIQUES) || [];
    return bibliotheque.length + Object.keys(MODELES_PRATIQUES_PREDEFINIS).length;
}

/**
 * Générer le HTML pour le sélecteur de configurations
 * @param {string} typeFiltre - Filtrer par type (optionnel)
 * @returns {Promise<string>} HTML du sélecteur
 */
async function genererSelecteurModelesPratiques(typeFiltre = null) {
    const configurations = await obtenirToutesLesPratiquesBibliotheque();

    let html = '<option value="">-- Sélectionner une configuration --</option>';

    // Grouper par type
    const gabarits = configurations.filter(c => c.estGabarit);
    const personnalises = configurations.filter(c => !c.estGabarit);

    // Filtrer si nécessaire
    const filtrerParType = (configs) => {
        if (!typeFiltre) return configs;
        return configs.filter(c => c.type === typeFiltre);
    };

    const gabaritsFiltres = filtrerParType(gabarits);
    const personnalisesFiltres = filtrerParType(personnalises);

    if (gabaritsFiltres.length > 0) {
        html += '<optgroup label="Configurations prédéfinies">';
        gabaritsFiltres.forEach(config => {
            const badge = config.pratiques?.includes('SPE') ? '[SPE] ' : '';
            html += `<option value="${config.id}">${badge}${config.nom}</option>`;
        });
        html += '</optgroup>';
    }

    if (personnalisesFiltres.length > 0) {
        html += '<optgroup label="Mes configurations">';
        personnalisesFiltres.forEach(config => {
            html += `<option value="${config.id}">${config.nom}</option>`;
        });
        html += '</optgroup>';
    }

    return html;
}

/**
 * Charger le dropdown des modèles dans l'interface
 */
async function chargerDropdownModelesPratiques() {
    const dropdown = document.getElementById('v2-spec-dropdown-modeles');
    if (!dropdown) return;

    dropdown.innerHTML = await genererSelecteurModelesPratiques('pan-specifications');
}

/**
 * Appliquer la configuration sélectionnée depuis le dropdown
 */
async function appliquerModeleSelectionne() {
    const dropdown = document.getElementById('v2-spec-dropdown-modeles');
    if (!dropdown || !dropdown.value) {
        alert('Veuillez sélectionner une configuration.');
        return;
    }

    const configId = dropdown.value;
    const succes = await appliquerConfigurationPratique(configId);

    if (succes) {
        // Afficher confirmation
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Configuration appliquée avec succès');
        } else {
            alert('Configuration appliquée !');
        }
    } else {
        alert('Erreur lors de l\'application de la configuration.');
    }
}

/**
 * Ouvrir la modale de sauvegarde de configuration
 */
function ouvrirModaleSauvegardeConfig() {
    const nom = prompt('Nom de la configuration de pratique :', 'Ma configuration');
    if (!nom) return;

    const description = prompt('Description (optionnel) :', '');

    sauvegarderConfigurationActuelle(nom, description).then(config => {
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`Configuration "${config.nom}" sauvegardée`);
        } else {
            alert(`Configuration "${config.nom}" sauvegardée !`);
        }

        // Rafraîchir le dropdown
        chargerDropdownModelesPratiques();
    }).catch(err => {
        console.error('[Bibliothèque Pratiques] Erreur sauvegarde:', err);
        alert('Erreur lors de la sauvegarde.');
    });
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesPratiquesBibliotheque = obtenirToutesLesPratiquesBibliotheque;
window.obtenirToutesLesPratiquesBibliothequeSync = obtenirToutesLesPratiquesBibliothequeSync;
window.obtenirPratiquesParType = obtenirPratiquesParType;
window.obtenirPratiquesParDiscipline = obtenirPratiquesParDiscipline;
window.obtenirDisciplinesDisponiblesPratiques = obtenirDisciplinesDisponiblesPratiques;
window.obtenirConfigurationPratiqueParId = obtenirConfigurationPratiqueParId;
window.ajouterPratiqueALaBibliotheque = ajouterPratiqueALaBibliotheque;
window.mettreAJourConfigurationPratique = mettreAJourConfigurationPratique;
window.retirerPratiqueDeLaBibliotheque = retirerPratiqueDeLaBibliotheque;
window.sauvegarderConfigurationActuelle = sauvegarderConfigurationActuelle;
window.appliquerConfigurationPratique = appliquerConfigurationPratique;
window.importerPratiquesDansBibliotheque = importerPratiquesDansBibliotheque;
window.exporterBibliothequePratiques = exporterBibliothequePratiques;
window.exporterConfigurationPratique = exporterConfigurationPratique;
window.getNombrePratiquesBibliotheque = getNombrePratiquesBibliotheque;
window.genererSelecteurModelesPratiques = genererSelecteurModelesPratiques;
window.chargerDropdownModelesPratiques = chargerDropdownModelesPratiques;
window.appliquerModeleSelectionne = appliquerModeleSelectionne;
window.ouvrirModaleSauvegardeConfig = ouvrirModaleSauvegardeConfig;
window.CLE_BIBLIOTHEQUE_PRATIQUES = CLE_BIBLIOTHEQUE_PRATIQUES;
window.MODELES_PRATIQUES_PREDEFINIS = MODELES_PRATIQUES_PREDEFINIS;

console.log('[pratiques-bibliotheque] Module chargé');
