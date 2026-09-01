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
 * ⚰ #574 étendu — LES HUIT ÉCHELLES « DISCIPLINAIRES » SONT RETIRÉES
 * (1er septembre 2026, §1 du `plans de travail/PLAN-2026-09-01-materiel-seme-et-chemin-d-entree.md`).
 *
 * `migrerEchellesColleguesVersBibliotheque` versait ici huit échelles de
 * catalogue — Chimie, Info, Bio, Philo ×2, Littérature, Admin, Géo. **Leurs 32
 * niveaux portaient `valeur:` et jamais `valeurCalcul:`.**
 *
 * CE QUE ÇA PRODUISAIT, mesuré sous WebKit le 1er septembre : depuis le retrait
 * du repli milieu-de-plage (#527), `valeurNumeriqueDuNiveau` rend `null` pour un
 * niveau sans `valeurCalcul`. Tous les critères sortent alors du total,
 * `ponderationTotal` tombe à 0, et `calculerNote` affiche **0,0 % · niveau `--`,
 * sans un mot**. Un enseignant de chimie qui faisait la chose sensée — ouvrir la
 * bibliothèque, prendre l'échelle « Chimie » — obtenait zéro à sa première
 * évaluation.
 *
 * ⮕ **DÉCISION DE GRÉGOIRE : on les RETIRE, on ne les répare pas.** Leur poser
 * des `valeurCalcul` choisies par le projet referait exactement l'arbitrage
 * pédagogique que #526/#527 ont supprimé — et ce sont, dans ses mots, du
 * « matériel fictif qu'on croit utile dans d'autres disciplines alors qu'il ne
 * l'est pas ».
 *
 * ⚠⚠ CE QUE CE RETRAIT NE FAIT PAS, ET QU'IL NE FAUT PAS CROIRE QU'IL FAIT.
 * Il tarit la SOURCE : un nouvel utilisateur ne recevra plus jamais ces huit
 * échelles. Il ne touche AUCUNE donnée déjà en place. Chez qui a déjà lancé
 * l'application, le drapeau `migration_echelles_collegues_biblio_done` est posé
 * et les huit échelles vivent dans `bibliothequeEchelles` — ce sont des données
 * utilisateur depuis #464/D2, et elles restent muettes. Les copies importées
 * dans un trimestre (`<trim>_echellesTemplates`) aussi.
 * ⮕ Ce qu'elles produisent est le sujet de **#674** ; ce qu'il faut en faire est
 * un geste de Grégoire, éclairé par `_sonderEchellesDisciplinaires()` ci-dessous.
 *
 * ⚠ Leurs identifiants RESTENT dans `IDS_GABARITS_HARDCODES` (main.js), et c'est
 * voulu : cette liste est ce qui fait poser un tombstone à la suppression. Sans
 * elle, quelqu'un qui supprime son échelle « Chimie » la verrait revenir au
 * prochain import. Un retrait de semis n'emporte pas la durabilité d'une
 * suppression — ce sont deux sujets, et le second survit au premier.
 */

/**
 * Sonde LECTURE SEULE — que reste-t-il des huit échelles disciplinaires chez cet
 * utilisateur, et ces copies sont-elles calculables ?
 *
 * Écrite parce que le §1 du plan l'exige avant toute décision sur les données :
 * « retirer de la bibliothèque ne retire pas la copie déjà importée — et cette
 * copie est cassée. Si le cas existe, il faut le DIRE à l'utilisateur ».
 * Cette sonde donne le chiffre ; elle ne décide de rien et n'écrit RIEN.
 *
 * ⚠ Complète `_sonder574()` (echelles.js) plutôt qu'elle ne la répète : celle-là
 * ne connaît que `ECHELLE_GENERIQUE` et les `GABARIT_ECHELLE_*`, et ne regarde
 * pas la bibliothèque partagée. Les huit-ci lui sont invisibles.
 *
 * À lancer en console : await _sonderEchellesDisciplinaires()
 *
 * @returns {Promise<{bibliotheque:Array, copies:Array, usages:Object}>}
 */
async function _sonderEchellesDisciplinaires() {
    const IDS = ['ECHELLE_BRUNO_CHIMIE', 'ECHELLE_XAVIER_INFO', 'ECHELLE_ISABELLE_BIO',
                 'ECHELLE_HELENE_PHILO', 'ECHELLE_MARIEHELENE_LITT', 'ECHELLE_ETIENNE_ADMIN',
                 'ECHELLE_OLIVIER_GEO', 'ECHELLE_JORDAN_PHILO'];
    const estVisee = (e) => !!e && (IDS.indexOf(e.id) >= 0 || IDS.indexOf(e.idOriginal) >= 0);
    // Un niveau est MUET s'il ne peut rendre aucun nombre — c'est la règle de
    // `valeurNumeriqueDuNiveau` (#525), pas une seconde règle écrite ici.
    const muet = (n) => !n || n.valeurCalcul == null || String(n.valeurCalcul).trim() === '' || isNaN(Number(n.valeurCalcul));

    const decrire = (e, ou) => ({
        ou: ou, id: e.id, nom: e.nom || '', idOriginal: e.idOriginal || '',
        niveaux: (e.niveaux || []).length,
        niveauxMuets: (e.niveaux || []).filter(muet).length
    });

    const bibliotheque = ((await db.get(CLE_BIBLIOTHEQUE_ECHELLES)) || [])
        .filter(estVisee).map(e => decrire(e, 'bibliothequeEchelles'));

    let trimestres = [];
    try { trimestres = (db.getSync('trimestres', []) || []).filter(t => t && t.id); } catch (e) { trimestres = []; }

    const copies = [];
    const idsPresents = {};
    const clesVues = {};
    for (const t of trimestres) {
        for (const cleEssai of [t.id + '_echellesTemplates', 'echellesTemplates']) {
            if (clesVues[cleEssai]) continue;
            const liste = await db.get(cleEssai);
            if (!Array.isArray(liste)) continue;
            clesVues[cleEssai] = true;
            liste.filter(estVisee).forEach(e => { copies.push(decrire(e, cleEssai)); idsPresents[e.id] = true; });
            break;
        }
    }

    // Ce qui DÉSIGNE une de ces copies : c'est ce chiffre, et lui seul, qui dit
    // si le sujet est théorique ou s'il touche du travail réel.
    const usages = { evaluations: 0, productions: 0 };
    for (const t of trimestres) {
        for (const [nomCle, type] of [['_evaluationsSauvegardees', 'evaluations'], ['_productions', 'productions']]) {
            const liste = await db.get(t.id + nomCle);
            (Array.isArray(liste) ? liste : []).forEach(item => {
                if (item && item.echelleId && idsPresents[item.echelleId]) usages[type]++;
            });
        }
    }

    // ⚠ `console` assumé et nommé : la sortie EST le produit de cette sonde,
    // même statut que `_sonder574` et `_diagnostiquerResolutionEchelles`.
    if (typeof console !== 'undefined' && console.table) {
        if (bibliotheque.length) console.table(bibliotheque);
        if (copies.length) console.table(copies);
    }
    console.log('[Sonde échelles disciplinaires] dans la bibliothèque : ' + bibliotheque.length
        + ' · copies dans les trimestres : ' + copies.length
        + ' · dont MUETTES (aucun niveau calculable) : '
        + bibliotheque.concat(copies).filter(e => e.niveaux > 0 && e.niveauxMuets === e.niveaux).length);
    console.log('[Sonde échelles disciplinaires] désignent une de ces copies — évaluations : '
        + usages.evaluations + ' · productions : ' + usages.productions);
    if (!bibliotheque.length && !copies.length) {
        console.log('[Sonde échelles disciplinaires] ZÉRO — et ce zéro porte son témoin : '
            + trimestres.length + ' trimestre(s) et la bibliothèque partagée ont été RÉELLEMENT lus.');
    }
    return { bibliotheque: bibliotheque, copies: copies, usages: usages };
}
window._sonderEchellesDisciplinaires = _sonderEchellesDisciplinaires;

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
