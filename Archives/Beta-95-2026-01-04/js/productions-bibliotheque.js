/* ===============================
   BIBLIOTHÈQUE DE PRODUCTIONS ÉTUDIANTES
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque partagée de productions étudiantes.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeProductions' (sans namespace)
   =============================== */

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_PRODUCTIONS = 'bibliothequeProductions';

/**
 * Obtenir toutes les productions de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les productions disponibles
 */
async function obtenirToutesLesProductionsBibliotheque() {
    // Lecture depuis IndexedDB (clé non-namespacée)
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les productions disponibles
 */
function obtenirToutesLesProductionsBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
    return bibliotheque;
}

/**
 * Obtenir les productions d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des productions de cette discipline
 */
function obtenirProductionsParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(p =>
        p.discipline && p.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

/**
 * Obtenir la liste des disciplines disponibles dans la bibliothèque
 * @returns {Array} Tableau des noms de disciplines uniques
 */
function obtenirDisciplinesDisponibles() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
    const disciplines = new Set();

    bibliotheque.forEach(prod => {
        if (prod.discipline) {
            disciplines.add(prod.discipline);
        }
    });

    return Array.from(disciplines).sort();
}

/**
 * Ajouter une production à la bibliothèque partagée
 * @param {Object} production - La production à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterALaBibliotheque(production) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];

    // Vérifier si déjà présente (par ID)
    const existe = bibliotheque.some(p => p.id === production.id);
    if (existe) {
        console.log('[Bibliothèque] Production déjà présente:', production.id);
        return false;
    }

    // Marquer comme partagée et ajouter métadonnées
    const productionBiblio = {
        ...production,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        // Conserver l'auteur original ou utiliser celui du cours
        auteur: production.auteur || 'Inconnu'
    };

    bibliotheque.push(productionBiblio);
    await db.set(CLE_BIBLIOTHEQUE_PRODUCTIONS, bibliotheque);

    console.log('[Bibliothèque] Production ajoutée:', production.titre);
    return true;
}

/**
 * Retirer une production de la bibliothèque
 * @param {string} productionId - ID de la production à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerDeLaBibliotheque(productionId) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(p => p.id !== productionId);

    if (bibliotheque.length === indexAvant) {
        console.log('[Bibliothèque] Production non trouvée:', productionId);
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_PRODUCTIONS, bibliotheque);
    console.log('[Bibliothèque] Production retirée:', productionId);
    return true;
}

/**
 * Importer des productions dans la bibliothèque (depuis un fichier JSON par exemple)
 * @param {Array} productions - Tableau de productions à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerDansBibliotheque(productions) {
    let ajoutees = 0;
    let existantes = 0;

    for (const prod of productions) {
        const resultat = await ajouterALaBibliotheque(prod);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    console.log(`[Bibliothèque] Import: ${ajoutees} ajoutées, ${existantes} déjà existantes`);
    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque (pour partage avec collègues)
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];

    return {
        version: '1.0',
        dateExport: new Date().toISOString(),
        nombreProductions: bibliotheque.length,
        productions: bibliotheque
    };
}

/**
 * Migrer les productions d'un trimestre vers la bibliothèque partagée
 * @param {string} cleSource - Clé source (ex: 'a2025_productions')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerVersBibliotheque(cleSource) {
    // Lire directement depuis localStorage (clé exacte fournie)
    const dataRaw = localStorage.getItem(cleSource);
    if (!dataRaw) {
        console.log('[Bibliothèque] Aucune donnée trouvée pour:', cleSource);
        return { ajoutees: 0, existantes: 0 };
    }

    const productions = JSON.parse(dataRaw);
    if (!Array.isArray(productions)) {
        console.log('[Bibliothèque] Format invalide pour:', cleSource);
        return { ajoutees: 0, existantes: 0 };
    }

    console.log(`[Bibliothèque] Migration de ${productions.length} productions depuis ${cleSource}`);
    return await importerDansBibliotheque(productions);
}

/**
 * Obtenir le nombre de productions dans la bibliothèque
 * @returns {number}
 */
function getNombreProductionsBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
    return bibliotheque.length;
}

/**
 * Lister tous les trimestres qui ont des productions
 * @returns {Array<{cle: string, trimestre: string, nombre: number}>}
 */
function listerTrimestresAvecProductions() {
    const trimestres = [];
    const trimestreActuel = window.trimestreActif || '';

    // Scanner localStorage pour les clés *_productions
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle && cle.endsWith('_productions')) {
            try {
                const data = JSON.parse(localStorage.getItem(cle));
                if (Array.isArray(data) && data.length > 0) {
                    // Extraire le code trimestre (ex: "a2025" de "a2025_productions")
                    const codeTrimestre = cle.replace('_productions', '');

                    // Ne pas inclure le trimestre actuel (déjà accessible)
                    if (codeTrimestre !== trimestreActuel) {
                        // Formater le nom pour affichage
                        const nomTrimestre = formaterNomTrimestre(codeTrimestre);
                        trimestres.push({
                            cle: cle,
                            code: codeTrimestre,
                            nom: nomTrimestre,
                            nombre: data.length
                        });
                    }
                }
            } catch (e) {
                // Ignorer les clés non-JSON
            }
        }
    }

    // Trier par code (plus récent d'abord)
    trimestres.sort((a, b) => b.code.localeCompare(a.code));

    return trimestres;
}

/**
 * Formater un code trimestre pour affichage
 * @param {string} code - Ex: "a2025", "h2026"
 * @returns {string} - Ex: "Automne 2025", "Hiver 2026"
 */
function formaterNomTrimestre(code) {
    if (!code) return 'Inconnu';

    const saison = code.charAt(0).toLowerCase();
    const annee = code.substring(1);

    const saisons = {
        'a': 'Automne',
        'h': 'Hiver',
        'e': 'Été'
    };

    return `${saisons[saison] || saison.toUpperCase()} ${annee}`;
}

/**
 * Obtenir les productions d'un trimestre spécifique
 * @param {string} cleOuCode - Clé complète (ex: "a2025_productions") ou code (ex: "a2025")
 * @returns {Array}
 */
function obtenirProductionsTrimestre(cleOuCode) {
    // Si c'est un code, construire la clé
    const cle = cleOuCode.includes('_') ? cleOuCode : `${cleOuCode}_productions`;

    try {
        const data = localStorage.getItem(cle);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('[Bibliothèque] Erreur lecture trimestre:', e);
    }
    return [];
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesProductionsBibliotheque = obtenirToutesLesProductionsBibliotheque;
window.obtenirToutesLesProductionsBibliothequeSync = obtenirToutesLesProductionsBibliothequeSync;
window.obtenirProductionsParDiscipline = obtenirProductionsParDiscipline;
window.obtenirDisciplinesDisponibles = obtenirDisciplinesDisponibles;
window.ajouterALaBibliotheque = ajouterALaBibliotheque;
window.retirerDeLaBibliotheque = retirerDeLaBibliotheque;
window.importerDansBibliotheque = importerDansBibliotheque;
window.exporterBibliotheque = exporterBibliotheque;
window.migrerVersBibliotheque = migrerVersBibliotheque;
window.getNombreProductionsBibliotheque = getNombreProductionsBibliotheque;
window.listerTrimestresAvecProductions = listerTrimestresAvecProductions;
window.formaterNomTrimestre = formaterNomTrimestre;
window.obtenirProductionsTrimestre = obtenirProductionsTrimestre;
window.CLE_BIBLIOTHEQUE_PRODUCTIONS = CLE_BIBLIOTHEQUE_PRODUCTIONS;

// Rétrocompatibilité: PRODUCTIONS_BIBLIOTHEQUE vide (plus de hardcodé)
window.PRODUCTIONS_BIBLIOTHEQUE = {};
