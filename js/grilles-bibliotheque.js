/* ===============================
   BIBLIOTHÈQUE DE GRILLES DE CRITÈRES
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque partagée de grilles de critères.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeGrilles' (sans namespace)
   =============================== */

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_GRILLES = 'bibliothequeGrilles';

/**
 * Obtenir toutes les grilles de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les grilles disponibles
 */
async function obtenirToutesLesGrillesBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les grilles disponibles
 */
function obtenirToutesLesGrillesBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque;
}

/**
 * Obtenir les grilles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des grilles de cette discipline
 */
function obtenirGrillesParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(g =>
        g.discipline && g.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

/**
 * Obtenir la liste des disciplines disponibles dans la bibliothèque
 * @returns {Array} Tableau des noms de disciplines uniques
 */
function obtenirDisciplinesDisponiblesGrilles() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    const disciplines = new Set();

    bibliotheque.forEach(grille => {
        if (grille.discipline) {
            disciplines.add(grille.discipline);
        }
    });

    return Array.from(disciplines).sort();
}

/**
 * Ajouter une grille à la bibliothèque partagée
 * @param {Object} grille - La grille à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterGrilleALaBibliotheque(grille) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];

    const existe = bibliotheque.some(g => g.id === grille.id);
    if (existe) {
        console.log('[Bibliothèque Grilles] Grille déjà présente:', grille.id);
        return false;
    }

    // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
    const auteur = grille.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

    const grilleBiblio = {
        ...grille,
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString(),
        auteur: auteur
    };

    bibliotheque.push(grilleBiblio);
    await db.set(CLE_BIBLIOTHEQUE_GRILLES, bibliotheque);

    console.log('[Bibliothèque Grilles] Grille ajoutée:', grille.nom);
    return true;
}

/**
 * Retirer une grille de la bibliothèque
 * @param {string} grilleId - ID de la grille à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerGrilleDeLaBibliotheque(grilleId) {
    let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];

    const indexAvant = bibliotheque.length;
    bibliotheque = bibliotheque.filter(g => g.id !== grilleId);

    if (bibliotheque.length === indexAvant) {
        return false;
    }

    await db.set(CLE_BIBLIOTHEQUE_GRILLES, bibliotheque);
    console.log('[Bibliothèque Grilles] Grille retirée:', grilleId);
    return true;
}

/**
 * Importer des grilles dans la bibliothèque
 * @param {Array} grilles - Tableau de grilles à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerGrillesDansBibliotheque(grilles) {
    let ajoutees = 0;
    let existantes = 0;

    for (const grille of grilles) {
        const resultat = await ajouterGrilleALaBibliotheque(grille);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    console.log(`[Bibliothèque Grilles] Import: ${ajoutees} ajoutées, ${existantes} déjà existantes`);
    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque de grilles
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequeGrilles() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];

    return {
        version: '1.0',
        type: 'grilles',
        dateExport: new Date().toISOString(),
        nombreGrilles: bibliotheque.length,
        grilles: bibliotheque
    };
}

/**
 * Migrer les grilles d'un trimestre vers la bibliothèque partagée
 * @param {string} cleSource - Clé source (ex: 'a2025_grilles')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerGrillesVersBibliotheque(cleSource) {
    const dataRaw = localStorage.getItem(cleSource);
    if (!dataRaw) {
        console.log('[Bibliothèque Grilles] Aucune donnée trouvée pour:', cleSource);
        return { ajoutees: 0, existantes: 0 };
    }

    const grilles = JSON.parse(dataRaw);
    if (!Array.isArray(grilles)) {
        return { ajoutees: 0, existantes: 0 };
    }

    console.log(`[Bibliothèque Grilles] Migration de ${grilles.length} grilles depuis ${cleSource}`);
    return await importerGrillesDansBibliotheque(grilles);
}

/**
 * Lister tous les trimestres qui ont des grilles
 * @returns {Array<{cle: string, code: string, nom: string, nombre: number}>}
 */
function listerTrimestresAvecGrilles() {
    const trimestres = [];
    const trimestreActuel = window.trimestreActif || '';

    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle && cle.endsWith('_grilles')) {
            try {
                const data = JSON.parse(localStorage.getItem(cle));
                if (Array.isArray(data) && data.length > 0) {
                    const codeTrimestre = cle.replace('_grilles', '');

                    if (codeTrimestre !== trimestreActuel) {
                        const nomTrimestre = formaterNomTrimestreGrilles(codeTrimestre);
                        trimestres.push({
                            cle: cle,
                            code: codeTrimestre,
                            nom: nomTrimestre,
                            nombre: data.length
                        });
                    }
                }
            } catch (e) {
                // Ignorer
            }
        }
    }

    trimestres.sort((a, b) => b.code.localeCompare(a.code));
    return trimestres;
}

/**
 * Formater un code trimestre pour affichage
 */
function formaterNomTrimestreGrilles(code) {
    if (!code) return 'Inconnu';
    const saison = code.charAt(0).toLowerCase();
    const annee = code.substring(1);
    const saisons = { 'a': 'Automne', 'h': 'Hiver', 'e': 'Été' };
    return `${saisons[saison] || saison.toUpperCase()} ${annee}`;
}

/**
 * Obtenir les grilles d'un trimestre spécifique
 * @param {string} cleOuCode - Clé complète ou code trimestre
 * @returns {Array}
 */
function obtenirGrillesTrimestre(cleOuCode) {
    const cle = cleOuCode.includes('_') ? cleOuCode : `${cleOuCode}_grilles`;
    try {
        const data = localStorage.getItem(cle);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('[Bibliothèque Grilles] Erreur lecture trimestre:', e);
    }
    return [];
}

/**
 * Obtenir le nombre de grilles dans la bibliothèque
 * @returns {number}
 */
function getNombreGrillesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_GRILLES) || [];
    return bibliotheque.length;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesGrillesBibliotheque = obtenirToutesLesGrillesBibliotheque;
window.obtenirToutesLesGrillesBibliothequeSync = obtenirToutesLesGrillesBibliothequeSync;
window.obtenirGrillesParDiscipline = obtenirGrillesParDiscipline;
window.obtenirDisciplinesDisponiblesGrilles = obtenirDisciplinesDisponiblesGrilles;
window.ajouterGrilleALaBibliotheque = ajouterGrilleALaBibliotheque;
window.retirerGrilleDeLaBibliotheque = retirerGrilleDeLaBibliotheque;
window.importerGrillesDansBibliotheque = importerGrillesDansBibliotheque;
window.exporterBibliothequeGrilles = exporterBibliothequeGrilles;
window.migrerGrillesVersBibliotheque = migrerGrillesVersBibliotheque;
window.listerTrimestresAvecGrilles = listerTrimestresAvecGrilles;
window.formaterNomTrimestreGrilles = formaterNomTrimestreGrilles;
window.obtenirGrillesTrimestre = obtenirGrillesTrimestre;
window.getNombreGrillesBibliotheque = getNombreGrillesBibliotheque;
window.CLE_BIBLIOTHEQUE_GRILLES = CLE_BIBLIOTHEQUE_GRILLES;

// Rétrocompatibilité: GRILLES_BIBLIOTHEQUE vide (plus de hardcodé)
window.GRILLES_BIBLIOTHEQUE = {};
