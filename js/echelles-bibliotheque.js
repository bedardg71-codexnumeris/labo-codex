/* ===============================
   BIBLIOTHÈQUE D'ÉCHELLES DE PERFORMANCE
   ✅ REFACTORING (2 janvier 2026)

   Bibliothèque partagée d'échelles de performance.
   - Indépendante du trimestre (clé non-namespacée)
   - Stockage dans IndexedDB/localStorage
   - Import/export avec collègues
   - Plus de données hardcodées

   Clé de stockage: 'bibliothequeEchelles' (sans namespace)
   =============================== */

(function() {
'use strict';

/**
 * Clé de stockage pour la bibliothèque (NON namespacée = partagée entre trimestres)
 */
const CLE_BIBLIOTHEQUE_ECHELLES = 'bibliothequeEchelles';

/**
 * Obtenir toutes les échelles de la bibliothèque
 * @returns {Promise<Array>} Tableau de toutes les échelles disponibles
 */
async function obtenirToutesLesEchellesBibliotheque() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque;
}

/**
 * Version synchrone pour compatibilité
 * @returns {Array} Tableau de toutes les échelles disponibles
 */
function obtenirToutesLesEchellesBibliothequeSync() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque;
}

/**
 * Obtenir les échelles d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline
 * @returns {Array} Tableau des échelles de cette discipline
 */
function obtenirEchellesParDiscipline(discipline) {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    if (!discipline || discipline === 'toutes') {
        return bibliotheque;
    }
    return bibliotheque.filter(e =>
        e.discipline && e.discipline.toLowerCase() === discipline.toLowerCase()
    );
}

// #327 — obtenirDisciplinesDisponiblesEchelles retiré (code mort) : le seul
// appelant était le filtre par discipline de la modale, supprimé au profit du
// classement par dossiers.

/**
 * Ajouter une échelle à la bibliothèque partagée
 * @param {Object} echelle - L'échelle à ajouter
 * @returns {Promise<boolean>} true si ajoutée, false si déjà existante
 */
async function ajouterEchelleALaBibliotheque(echelle) {
    // B-β — passage obligé par assainirObjet.
    const echelleSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.echelle)
        ? window.assainirObjet(echelle, window.SCHEMAS_IMPORT.echelle)
        : echelle;

    // #599 — la présence est vérifiée DANS la file. Hors file, deux ajouts
    // concurrents du même item passaient tous les deux, et la bibliothèque
    // partagée gardait un doublon que rien ne signalait.
    let dejaPresente = false;
    await db.modifier(CLE_BIBLIOTHEQUE_ECHELLES, (lues) => {
        const bibliotheque = lues || [];

        const existe = bibliotheque.some(e => e.id === echelleSafe.id);
        if (existe) {
            dejaPresente = true;
            return undefined;
        }

        // 🆕 Beta 95.4 : Obtenir l'auteur depuis le profil enseignant si non défini
        const auteur = echelleSafe.auteur || (typeof obtenirProfilAuteurActifSync === 'function' ? obtenirProfilAuteurActifSync()?.auteur_original : null) || 'Inconnu';

        const echelleBiblio = {
            ...echelleSafe,
            dansBibliotheque: true,
            dateAjoutBiblio: new Date().toISOString(),
            auteur: auteur
        };

        bibliotheque.push(echelleBiblio);
        return bibliotheque;
    }, []);

    if (dejaPresente) {
        return false;
    }

    return true;
}

/**
 * 🆕 #464 / décision D2 du triage (21 août 2026) — Versement ONE-SHOT des huit
 * échelles « collègues » dans la bibliothèque partagée. Elles étaient CODÉES EN
 * DUR dans echelles.js (assurerEchellesPersonnalisees, retirée) et re-semées
 * dans CHAQUE trimestre à chaque boot — en recréant au passage la clé nue
 * echellesTemplates que #358 interdit (CO-11). Désormais : contenu de CATALOGUE,
 * versé une fois ici, supprimable et modifiable comme le reste. Les copies déjà
 * semées dans les trimestres existants restent (données utilisateur désormais).
 * Passe par ajouterEchelleALaBibliotheque (assainissement + push sans replace) ;
 * les suppressions passées (ressourcesSupprimees) sont respectées.
 */
async function migrerEchellesColleguesVersBibliotheque() {
    const FLAG = 'migration_echelles_collegues_biblio_done';
    if (db.getSync(FLAG, false)) return;

    const DEFS = [
        { id: 'ECHELLE_BRUNO_CHIMIE', nom: 'Échelle Chimie organique', description: 'Échelle 4 niveaux pour standards. Seuil maîtrise: 75%.', discipline: 'Chimie',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 55, max: 74, valeur: 65, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' } ] },
        { id: 'ECHELLE_XAVIER_INFO', nom: 'Échelle Interfaces/BD', description: 'Échelle 4 niveaux numériques. Niveau 3 = seuil passage, niveau 4 = bonus.', discipline: 'Informatique',
          niveaux: [ { code: '1', nom: 'Non atteint', min: 0, max: 49, valeur: 40, couleur: '#dc3545' }, { code: '2', nom: 'En développement', min: 50, max: 64, valeur: 55, couleur: '#fd7e14' }, { code: '3', nom: 'Maîtrisé', min: 65, max: 84, valeur: 80, couleur: '#28a745' }, { code: '4', nom: 'Excellence', min: 85, max: 100, valeur: 95, couleur: '#007bff' } ] },
        { id: 'ECHELLE_ISABELLE_BIO', nom: 'Échelle Anatomie', description: 'Échelle IDME qualitative pour jugement global. Pas de seuils chiffrés stricts.', discipline: 'Biologie', avertissement: 'Échelle pour jugement professionnel - les seuils sont indicatifs',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 40, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 50, max: 64, valeur: 57, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 65, max: 84, valeur: 75, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92, couleur: '#007bff' } ] },
        { id: 'ECHELLE_HELENE_PHILO', nom: 'Échelle Philosophie', description: 'Échelle 4 niveaux pour cours de philosophie. Seuils: 70/60/50.', discipline: 'Philosophie',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 35, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 50, max: 59, valeur: 55, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 60, max: 79, valeur: 70, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' } ] },
        { id: 'ECHELLE_MARIEHELENE_LITT', nom: 'Échelle Littérature', description: 'Échelle 4 niveaux pour cours de littérature. Seuils: 75/65/55.', discipline: 'Littérature',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 55, max: 64, valeur: 60, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 65, max: 84, valeur: 75, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92, couleur: '#007bff' } ] },
        { id: 'ECHELLE_ETIENNE_ADMIN', nom: 'Échelle Comptabilité', description: 'Échelle 4 niveaux pour cours d\'administration. Seuils: 80/70/60.', discipline: 'Administration',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 59, valeur: 45, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 60, max: 69, valeur: 65, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 70, max: 89, valeur: 80, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' } ] },
        { id: 'ECHELLE_OLIVIER_GEO', nom: 'Échelle Géographie', description: 'Échelle 4 niveaux pour cours de géographie. Seuils: 70/65/55.', discipline: 'Géographie',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 55, max: 64, valeur: 60, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 65, max: 79, valeur: 72, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' } ] },
        { id: 'ECHELLE_JORDAN_PHILO', nom: 'Échelle Philosophie 101', description: 'Échelle 4 niveaux pour cours de philosophie. Seuils: 80/60/50.', discipline: 'Philosophie',
          niveaux: [ { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 35, couleur: '#dc3545' }, { code: 'D', nom: 'en Développement', min: 50, max: 59, valeur: 55, couleur: '#fd7e14' }, { code: 'M', nom: 'Maîtrisé', min: 60, max: 79, valeur: 70, couleur: '#28a745' }, { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' } ] }
    ];

    // Versement en LOT (1 lecture + 1 écriture) : la boucle par
    // ajouterEchelleALaBibliotheque coûtait ~17 allers-retours IndexedDB
    // séquentiels au boot — mesuré au harnais Playwright (chaque test au
    // storage vierge les payait). Même contrat : push sans replace (jamais
    // d'écrasement d'une version présente), tombstones respectés. Contenu
    // interne sûr (littéraux ci-dessus) — pas d'assainissement requis.
    const supprimees = (await db.get('ressourcesSupprimees')) || [];
    // #599 — le versement passe par la file : les présences sont vérifiées à
    // l'instant de l'écriture. Vérifiées avant, un ajout concurrent d'une de ces
    // échelles pendant le boot serait écrasé par ce versement en lot.
    await db.modifier(CLE_BIBLIOTHEQUE_ECHELLES, (lues) => {
        const bibliotheque = lues || [];
        let nbVersees = 0;
        for (const def of DEFS) {
            if (supprimees.includes(def.id)) continue;
            if (bibliotheque.some(e => e.id === def.id)) continue;
            bibliotheque.push(Object.assign({}, def, {
                auteur: 'Labo Codex',
                verrouille: false,
                dansBibliotheque: true,
                dateCreation: '2026-01-03T00:00:00.000Z',
                dateAjoutBiblio: new Date().toISOString()
            }));
            nbVersees++;
        }
        // Rien à verser : le mutateur rend `undefined`, aucune écriture.
        if (nbVersees === 0) return undefined;
        return bibliotheque;
    }, []);
    db.setSync(FLAG, true);
}
window.migrerEchellesColleguesVersBibliotheque = migrerEchellesColleguesVersBibliotheque;

/**
 * Retirer une échelle de la bibliothèque
 * @param {string} echelleId - ID de l'échelle à retirer
 * @returns {Promise<boolean>} true si retirée, false si non trouvée
 */
async function retirerEchelleDeLaBibliotheque(echelleId) {
    // #599 — le retrait passe par la file. Hors file, un retrait et un ajout
    // concurrents sur la MÊME bibliothèque partagée s'écrasaient l'un l'autre :
    // les cinq familles écrivent dans un seul magasin, pas un par famille.
    let retiree = false;
    await db.modifier(CLE_BIBLIOTHEQUE_ECHELLES, (lues) => {
        const bibliotheque = lues || [];
        const restants = bibliotheque.filter(e => e.id !== echelleId);

        // Rien retiré : le mutateur rend `undefined`, aucune écriture.
        if (restants.length === bibliotheque.length) return undefined;

        retiree = true;
        return restants;
    }, []);

    if (!retiree) {
        return false;
    }

    // #327 — hook de cohérence : l'échelle retirée sort de tout dossier de
    // classement (le moteur range par identité, sans toucher l'échelle).
    if (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.retirerItem === 'function') {
        window.repertoiresBibliotheque.retirerItem(echelleId, 'echelles');
    }
    return true;
}

/**
 * Importer des échelles dans la bibliothèque
 * @param {Array} echelles - Tableau d'échelles à importer
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function importerEchellesDansBibliotheque(echelles) {
    let ajoutees = 0;
    let existantes = 0;

    for (const echelle of echelles) {
        const resultat = await ajouterEchelleALaBibliotheque(echelle);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    return { ajoutees, existantes };
}

/**
 * Exporter toute la bibliothèque d'échelles
 * @returns {Promise<Object>} Objet JSON exportable
 */
async function exporterBibliothequeEchelles() {
    const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    const echelles = typeof ajouterMetadonnéesCC === 'function'
        ? bibliotheque.map(e => ajouterMetadonnéesCC(e, 'echelle', e.nom || '').contenu || e)
        : bibliotheque;

    return {
        version: '1.0',
        type: 'echelles',
        dateExport: new Date().toISOString(),
        nombreEchelles: echelles.length,
        echelles
    };
}

/**
 * Migrer les échelles d'un trimestre vers la bibliothèque partagée
 * @param {string} cleSource - Clé source (ex: 'a2025_echelles')
 * @returns {Promise<{ajoutees: number, existantes: number}>}
 */
async function migrerEchellesVersBibliotheque(cleSource) {
    const echelles = db.getSync(cleSource, null);
    if (!echelles) {
        return { ajoutees: 0, existantes: 0 };
    }
    if (!Array.isArray(echelles)) {
        return { ajoutees: 0, existantes: 0 };
    }

    return await importerEchellesDansBibliotheque(echelles);
}

/**
 * Lister tous les trimestres qui ont des échelles
 * @returns {Array<{cle: string, code: string, nom: string, nombre: number}>}
 */
function listerTrimestresAvecEchelles() {
    const trimestres = [];
    const trimestreActuel = window.trimestreActif || '';

    // #389 : keysSync (localStorage ∪ memoryCache) — un trimestre dont la
    // collection a basculé hors localStorage (quota) était invisible au scan.
    const clesStockage = db.keysSync();
    for (let i = 0; i < clesStockage.length; i++) {
        const cle = clesStockage[i];
        if (cle && cle.endsWith('_echelles')) {
            try {
                const data = db.getSync(cle, null);
                if (Array.isArray(data) && data.length > 0) {
                    const codeTrimestre = cle.replace('_echelles', '');

                    if (codeTrimestre !== trimestreActuel) {
                        const nomTrimestre = formaterNomTrimestreEchelles(codeTrimestre);
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
function formaterNomTrimestreEchelles(code) {
    if (!code) return 'Inconnu';
    const saison = code.charAt(0).toLowerCase();
    const annee = code.substring(1);
    const saisons = { 'a': 'Automne', 'h': 'Hiver', 'e': 'Été' };
    return `${saisons[saison] || saison.toUpperCase()} ${annee}`;
}

/**
 * Obtenir les échelles d'un trimestre spécifique
 * @param {string} cleOuCode - Clé complète ou code trimestre
 * @returns {Array}
 */
function obtenirEchellesTrimestre(cleOuCode) {
    const cle = cleOuCode.includes('_') ? cleOuCode : `${cleOuCode}_echelles`;
    try {
        const data = db.getSync(cle, null);
        if (data) {
            return data;
        }
    } catch (e) {
        console.error('[Bibliothèque Échelles] Erreur lecture trimestre:', e);
    }
    return [];
}

/**
 * Obtenir le nombre d'échelles dans la bibliothèque
 * @returns {number}
 */
function getNombreEchellesBibliotheque() {
    const bibliotheque = db.getSync(CLE_BIBLIOTHEQUE_ECHELLES) || [];
    return bibliotheque.length;
}

// ===========================
// EXPORTS GLOBAUX
// ===========================
window.obtenirToutesLesEchellesBibliotheque = obtenirToutesLesEchellesBibliotheque;
window.obtenirToutesLesEchellesBibliothequeSync = obtenirToutesLesEchellesBibliothequeSync;
window.obtenirEchellesParDiscipline = obtenirEchellesParDiscipline;
window.ajouterEchelleALaBibliotheque = ajouterEchelleALaBibliotheque;
window.retirerEchelleDeLaBibliotheque = retirerEchelleDeLaBibliotheque;
window.importerEchellesDansBibliotheque = importerEchellesDansBibliotheque;
window.exporterBibliothequeEchelles = exporterBibliothequeEchelles;
window.migrerEchellesVersBibliotheque = migrerEchellesVersBibliotheque;
window.listerTrimestresAvecEchelles = listerTrimestresAvecEchelles;
window.formaterNomTrimestreEchelles = formaterNomTrimestreEchelles;
window.obtenirEchellesTrimestre = obtenirEchellesTrimestre;
window.getNombreEchellesBibliotheque = getNombreEchellesBibliotheque;
window.CLE_BIBLIOTHEQUE_ECHELLES = CLE_BIBLIOTHEQUE_ECHELLES;

// Rétrocompatibilité: ECHELLES_BIBLIOTHEQUE vide (plus de hardcodé)
window.ECHELLES_BIBLIOTHEQUE = {};


})();
