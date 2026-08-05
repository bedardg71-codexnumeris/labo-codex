/* ===============================
   📦 MODULE: IMPORT/EXPORT DE DONNÉES
   Adapté de index 35-M5

   ÉCRITURES pratiquesConfigurables : import JSON (fusion), import Code Connect (fusion)
   =============================== */

(function() {
'use strict';

/* ===============================
   VALIDATION ZIP SÉCURITÉ (Phase 6 — Audit)
   =============================== */

/**
 * Valide la sécurité d'un ZIP chargé par JSZip.
 * Vérifie : taille décompressée, path traversal, noms d'entrées.
 * @param {JSZip} zip - Instance JSZip déjà chargée
 * @returns {{valide: boolean, erreur: string}} Résultat de validation
 */
function validerZipSecurite(zip) {
    var TAILLE_MAX_DECOMPRESSEE = 2 * 1024 * 1024 * 1024; // 2 Go
    var tailleDecompressee = 0;

    var noms = Object.keys(zip.files);
    for (var i = 0; i < noms.length; i++) {
        var nom = noms[i];
        var entry = zip.files[nom];

        // A3 — Path traversal : rejeter entrées avec .. ou commençant par /
        if (nom.indexOf('..') !== -1) {
            return { valide: false, erreur: 'Entrée ZIP suspecte (path traversal) : ' + nom };
        }
        if (nom.charAt(0) === '/') {
            return { valide: false, erreur: 'Entrée ZIP suspecte (chemin absolu) : ' + nom };
        }

        // A1 — Sommer la taille décompressée (si disponible)
        if (!entry.dir && entry._data && entry._data.uncompressedSize) {
            tailleDecompressee += entry._data.uncompressedSize;
        }
    }

    // A1 — Rejeter si taille décompressée > 2 Go
    if (tailleDecompressee > TAILLE_MAX_DECOMPRESSEE) {
        return {
            valide: false,
            erreur: 'ZIP trop volumineux une fois décompressé (' +
                (tailleDecompressee / 1024 / 1024 / 1024).toFixed(1) + ' Go). Limite : 2 Go.',
            tailleDecompressee: tailleDecompressee
        };
    }

    // tailleDecompressee vaut 0 si JSZip n'expose pas _data.uncompressedSize
    // (D6 du plan #334) — les consommateurs doivent traiter 0 comme « inconnu ».
    return { valide: true, erreur: null, tailleDecompressee: tailleDecompressee };
}

// Export global pour que codex.js puisse l'utiliser
window.validerZipSecurite = validerZipSecurite;

/**
 * Vérifie l'unicité des IDs dans un tableau d'objets.
 * Si des doublons sont détectés, ré-identifie les entrées dupliquées avec genererIdUnique().
 * @param {Array} tableau - Tableau d'objets avec propriété .id
 * @param {string} nomCollection - Nom pour le log console (ex: 'productions')
 * @returns {Array} - Le même tableau, sans doublons d'ID
 */
function verifierUniciteIds(tableau, nomCollection) {
    if (!Array.isArray(tableau)) return tableau;
    const idsVus = new Set();
    let nbDoublons = 0;
    for (let i = 0; i < tableau.length; i++) {
        const item = tableau[i];
        if (!item || !item.id) continue;
        if (idsVus.has(item.id)) {
            const ancienId = item.id;
            item.id = genererIdUnique(ancienId.replace(/[0-9_]+$/, '').replace(/-+$/, '_'));
            console.warn(`⚠️ [${nomCollection}] ID dupliqué corrigé: ${ancienId} → ${item.id}`);
            nbDoublons++;
        }
        idsVus.add(item.id);
    }
    if (nbDoublons > 0) {
        console.warn(`⚠️ [${nomCollection}] ${nbDoublons} doublon(s) d'ID corrigé(s) sur ${tableau.length} éléments`);
    }
    return tableau;
}

/**
 * MODULE: import-export.js
 *
 * RÔLE:
 * Gère l'exportation et l'importation sélective de données
 * stockées via db.js sous forme de fichiers JSON
 *
 * FONCTIONNALITÉS:
 * - Export sélectif des clés (backup complet)
 * - Import avec aperçu et confirmation
 * - Sélection "Toutes les clés"
 * - Validation des fichiers JSON
 *
 * NOTE TECHNIQUE:
 * Ce module manipule localStorage directement (pas db.js) car il fait
 * des backups complets et manipule des strings JSON brutes pour export/import.
 *
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 */

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

function initialiserModuleImportExport() {

    const modalExport = document.getElementById('modalExport');
    const modalImport = document.getElementById('modalImport');

    if (modalExport && modalImport) {
    } else {
        console.warn('   Modales import/export manquantes');
    }
}

/* ===============================
   DÉTECTION HEURISTIQUE DES DONNÉES DÉMO
   (6 jan 2026) - Pour filtrer à l'export
   =============================== */

/**
 * Détecte si une ressource est du matériel démo basé sur des patterns connus
 * @param {Object} ressource - La ressource à vérifier
 * @param {string} type - Type de ressource ('grille', 'echelle', 'production', 'cartouche', 'pratique', 'etudiant')
 * @returns {boolean} - True si c'est du matériel démo
 */
function estRessourceDemo(ressource, type) {
    if (!ressource) return false;

    // Si explicitement marqué comme démo
    if (ressource.estDemo || ressource.isDemo) return true;

    // Si importé d'un collègue
    if (ressource.auteurOriginal) return true;

    const nom = (ressource.nom || '').toLowerCase();

    // Patterns communs pour les données démo
    const patternsDemo = [
        'démo', 'demo', '(exemple)', 'exemple',
        'primo primavera', // Auteur des données démo
        '[spe] gabarit' // Gabarits SPE
    ];

    // Vérifier les patterns dans le nom
    if (patternsDemo.some(pattern => nom.includes(pattern))) {
        return true;
    }

    // Détection spécifique par type
    switch (type) {
        case 'etudiant':
            // Étudiants démo : groupe 9999 ou DA commençant par 9999
            if (ressource.groupe === '9999' || ressource.groupe === 9999) return true;
            if (ressource.da && ressource.da.toString().startsWith('9999')) return true;
            if (ressource.coursId && ressource.coursId.includes('9999')) return true;
            break;

        case 'grille':
            // Grilles avec noms spécifiques démo
            if (nom.includes('grille générique') || nom.includes('grille démo')) return true;
            break;

        case 'echelle':
            // Échelles avec noms spécifiques démo
            if (nom.includes('échelle générique') || nom.includes('echelle générique')) return true;
            break;

        case 'cours':
            // Cours démo : groupe 9999
            if (ressource.groupe === '9999' || ressource.groupe === 9999) return true;
            break;
    }

    return false;
}

/**
 * Filtre un tableau pour exclure les ressources démo
 * @param {Array} ressources - Tableau de ressources
 * @param {string} type - Type de ressource
 * @returns {Array} - Ressources filtrées (sans démo ni importées)
 */
function filtrerRessourcesNonDemo(ressources, type) {
    if (!Array.isArray(ressources)) return [];
    return ressources.filter(r => !estRessourceDemo(r, type));
}

/* ===============================
   ASSAINISSEMENT DES IMPORTS (anti-XSS / validation)
   =============================== */

/**
 * Assainit une chaîne importée : vérifie le type, tronque, retire les balises HTML
 * @param {*} str - Valeur à assainir
 * @param {number} maxLen - Longueur maximale (défaut 500)
 * @returns {string} Chaîne nettoyée
 */
function assainirChaine(str, maxLen = 500) {
    if (typeof str !== 'string') return '';
    // Tronquer si trop long
    let resultat = str.length > maxLen ? str.substring(0, maxLen) : str;
    // Retirer les balises HTML (<...>)
    resultat = resultat.replace(/<[^>]*>/g, '');
    return resultat;
}

/**
 * Assainit un objet importé selon un schéma (whitelist de propriétés)
 * @param {Object} obj - Objet à assainir
 * @param {Object} schema - Schéma { nomProp: { type, maxLen?, schema? } }
 *   Types reconnus : 'string', 'number', 'boolean', 'array', 'object',
 *                    'mapStrings' (object à clés dynamiques, valeurs assainies en strings),
 *                    'stringOrNumber' (id qui peut arriver soit en string soit en number).
 * @returns {Object} Objet nettoyé (seules les clés du schéma sont conservées)
 */
function assainirObjet(obj, schema) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const resultat = {};

    for (const [cle, spec] of Object.entries(schema)) {
        if (!(cle in obj)) {
            // Propriété absente : ignorer (optionnelle)
            continue;
        }
        const valeur = obj[cle];

        switch (spec.type) {
            case 'string':
                resultat[cle] = assainirChaine(valeur, spec.maxLen || 500);
                break;
            case 'number':
                resultat[cle] = typeof valeur === 'number' ? valeur : 0;
                break;
            case 'boolean':
                resultat[cle] = !!valeur;
                break;
            case 'stringOrNumber':
                // Accepte une string (assainie) ou un number (laissé tel quel).
                // Utile pour les id qui peuvent arriver dans les deux formes
                // (ex. critères de pratique : id numérique dans les modèles
                // prédéfinis, id 'CR_xxx' string ailleurs).
                if (typeof valeur === 'number') {
                    resultat[cle] = valeur;
                } else {
                    resultat[cle] = assainirChaine(valeur, spec.maxLen || 100);
                }
                break;
            case 'array':
                if (Array.isArray(valeur)) {
                    if (spec.schema) {
                        // Assainir chaque élément récursivement
                        resultat[cle] = valeur.map(item =>
                            typeof item === 'object' && item !== null
                                ? assainirObjet(item, spec.schema)
                                : (typeof item === 'string' ? assainirChaine(item, spec.maxLen || 500) : item)
                        );
                    } else {
                        resultat[cle] = valeur;
                    }
                } else {
                    resultat[cle] = [];
                }
                break;
            case 'object':
                if (spec.schema && typeof valeur === 'object' && valeur !== null) {
                    resultat[cle] = assainirObjet(valeur, spec.schema);
                } else {
                    resultat[cle] = valeur;
                }
                break;
            case 'mapStrings':
                // Object à clés dynamiques dont toutes les valeurs doivent être
                // des strings assainies. Ex. cartouche.commentaires :
                // { 'CR_<id>_<niveau>': 'texte de rétroaction', ... }
                if (typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)) {
                    const map = {};
                    for (const k in valeur) {
                        if (Object.prototype.hasOwnProperty.call(valeur, k)) {
                            // La clé elle-même est assainie (longueur courte) pour
                            // bloquer une injection dans le nom de la clé.
                            const cleAssainie = assainirChaine(k, 200);
                            if (cleAssainie) {
                                map[cleAssainie] = assainirChaine(valeur[k], spec.maxLen || 1000);
                            }
                        }
                    }
                    resultat[cle] = map;
                } else {
                    resultat[cle] = {};
                }
                break;
            default:
                // Type inconnu : copier tel quel (fallback safe)
                resultat[cle] = valeur;
        }
    }

    return resultat;
}

/** Sous-schéma `metadata_cc` réutilisé sur tous les types partageables. */
const SCHEMA_METADATA_CC = {
    type: 'object',
    schema: {
        licence: { type: 'string', maxLen: 100 },
        auteur_original: { type: 'string', maxLen: 100 },
        description_courte: { type: 'string', maxLen: 500 },
        contributeurs: {
            type: 'array',
            schema: {
                nom: { type: 'string', maxLen: 100 },
                date: { type: 'string', maxLen: 50 }
            }
        }
    }
};

/** Sous-schéma `inspireDe` (filiation Plan §4.3) réutilisé sur tous les types.
 *  `sourceId` (axe D / #326) : id de la source pour l'arbre de filiation —
 *  optionnel, jamais effacé (invariant CC, SPEC §3.1). */
const SCHEMA_INSPIRE_DE = {
    type: 'object',
    schema: {
        nom: { type: 'string', maxLen: 200 },
        auteur: { type: 'string', maxLen: 100 },
        date: { type: 'string', maxLen: 50 },
        sourceId: { type: 'string', maxLen: 100 }
    }
};

/** Schémas de validation pour les ressources partageables */
const SCHEMAS_IMPORT = {
    grille: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        criteres: {
            type: 'array',
            schema: {
                id: { type: 'string', maxLen: 100 },
                nom: { type: 'string', maxLen: 200 },
                description: { type: 'string', maxLen: 500 },
                ponderation: { type: 'number' },
                type: { type: 'string', maxLen: 50 },
                formule: { type: 'string', maxLen: 200 },
                niveauSOLO: { type: 'string', maxLen: 50 },
                verrouille: { type: 'boolean' },
                obligatoire: { type: 'boolean' }
            }
        },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        type: { type: 'string', maxLen: 50 },
        typeSPE: { type: 'boolean' },
        typeProductionId: { type: 'string', maxLen: 100 },
        description: { type: 'string', maxLen: 500 },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    },
    echelle: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        niveaux: {
            type: 'array',
            schema: {
                code: { type: 'string', maxLen: 20 },
                nom: { type: 'string', maxLen: 100 },
                description: { type: 'string', maxLen: 500 },
                min: { type: 'number' },
                max: { type: 'number' },
                valeur: { type: 'number' },
                couleur: { type: 'string', maxLen: 30 }
            }
        },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        discipline: { type: 'string', maxLen: 100 },
        description: { type: 'string', maxLen: 500 },
        verrouille: { type: 'boolean' },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    },
    pratique: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        type: { type: 'string', maxLen: 100 },
        description: { type: 'string', maxLen: 500 },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        estGabarit: { type: 'boolean' },
        criteres: {
            type: 'array',
            schema: {
                id: { type: 'stringOrNumber', maxLen: 100 },
                nom: { type: 'string', maxLen: 200 },
                description: { type: 'string', maxLen: 500 },
                essentiel: { type: 'boolean' },
                ponderation: { type: 'number' }
            }
        },
        // `pratiques` : array de codes courts (ex: ['SPE'], ['STD']) qui
        // identifient les modalités d'évaluation. Sub-schema string scalar.
        pratiques: { type: 'array' },
        // `configuration` : object riche, hétérogène selon le type de pratique
        // (pan-specifications, pan-standards, par-objectifs, etc.).
        // Modélisation exhaustive trop coûteuse pour le bénéfice — copié brut.
        // Trade-off accepté : le contenu est de la donnée structurelle
        // (numbers, codes courts), peu exposé au risque XSS direct.
        configuration: { type: 'object' },
        ponderation: { type: 'object' },
        seuilReussite: { type: 'number' },
        // `seuils` : { vaBien, difficulte, grandeDifficulte } — pratiques perso.
        seuils: { type: 'object' },
        echelleId: { type: 'string', maxLen: 100 },
        discipline: { type: 'string', maxLen: 100 },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    },
    production: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        titre: { type: 'string', maxLen: 200 },
        type: { type: 'string', maxLen: 100 },
        activiteApprentissage: { type: 'string', maxLen: 500 },
        description: { type: 'string', maxLen: 500 },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        dateEcheance: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        facultatif: { type: 'boolean' },
        grilleId: { type: 'string', maxLen: 100 },
        echelleId: { type: 'string', maxLen: 100 },
        pratiqueId: { type: 'string', maxLen: 100 },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    },
    cartouche: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        grilleId: { type: 'string', maxLen: 100 },
        echelleId: { type: 'string', maxLen: 100 },
        contexte: { type: 'string', maxLen: 1000 },
        criteres: {
            type: 'array',
            schema: {
                id: { type: 'string', maxLen: 100 },
                nom: { type: 'string', maxLen: 200 }
            }
        },
        niveaux: {
            type: 'array',
            schema: {
                code: { type: 'string', maxLen: 20 },
                nom: { type: 'string', maxLen: 100 }
            }
        },
        // Clés dynamiques de la forme `<critereId>_<niveauCode>` → texte de
        // rétroaction. Vecteur principal d'injection sur les cartouches : tous
        // les commentaires sont assainis par `mapStrings`.
        commentaires: { type: 'mapStrings', maxLen: 1000 },
        verrouille: { type: 'boolean' },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    },
    tampon: {
        id: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        fichier: { type: 'string', maxLen: 200 },
        // imageBase64 : data URI d'une PNG. Limite haute (10 Mo en base64
        // ~= 7.5 Mo binaire) — l'audit textuel ignore ce champ (cf. modèle
        // de menaces §A.1) ; le risque polyglotte image+JS est traité par
        // la Défense O (re-encodage canvas).
        imageBase64: { type: 'string', maxLen: 10000000 },
        categorie: { type: 'string', maxLen: 100 },
        custom: { type: 'boolean' },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE
    }
};

/** Limite de taille max pour un fichier JSON importé (50 Mo) */
const TAILLE_MAX_IMPORT_OCTETS = 50 * 1024 * 1024;

/** #380 — Clés du cadre calendrier reconnues à l'import (nues ou namespacées).
 *  journeesSansCours = clé courante (fusion #374) ; les deux noms evenements*
 *  restent acceptés en LECTURE pour les exports antérieurs (fusion au boot).
 *  Source unique consommée par analyserRessourcesDetaillees (aperçu) ET
 *  executerImportSelectif (import) — l'import de ces clés passe DÉSORMAIS par
 *  une case à cocher dédiée, plus jamais en silence (audit 5 août, rapport A1). */
const CLES_CALENDRIER_IMPORT = ['cadreCalendrier', 'calendrierComplet', 'journeesSansCours', 'evenementsPrevus', 'evenementsImprevus', 'seancesCompletes', 'horaireHebdo'];

/** #380 — Une clé de config appartient-elle au cadre calendrier ? */
function estCleCalendrierImport(cle) {
    return CLES_CALENDRIER_IMPORT.includes(cle) ||
        CLES_CALENDRIER_IMPORT.some(function(c) { return cle.endsWith('_' + c); });
}

/* ===============================
   EXPORT DES DONNÉES
   =============================== */

async function ouvrirModalExport() {
    const modal = document.getElementById('modalExport');
    const liste = document.getElementById('listeClesExport');

    // 🆕 Beta 96.2 : Récupérer toutes les clés depuis IndexedDB (pas seulement localStorage)
    // Cela inclut les données volumineuses qui ne tiennent pas dans localStorage
    let cles = [];
    try {
        cles = await db.keys();
    } catch (e) {
        // Fallback vers localStorage si erreur
        console.warn('[Export] Erreur lecture IndexedDB, fallback localStorage:', e);
        cles = Object.keys(localStorage);
    }

    // Construire la liste des clés avec leurs tailles
    let html = '';
    for (const cle of cles) {
        let tailleKo = '?';
        try {
            const valeur = await db.get(cle, null);
            if (valeur !== null) {
                const jsonStr = JSON.stringify(valeur);
                tailleKo = ((cle.length + jsonStr.length) / 1024).toFixed(2);
            }
        } catch (e) {
            // Ignorer les erreurs de lecture
        }

        html += `
            <label style="display: flex; align-items: center; padding: 8px;
                   background: var(--bleu-tres-pale); margin-bottom: 5px;
                   border-radius: 4px; border: 1px solid var(--bleu-pale);
                   transition: all 0.2s; cursor: pointer;">
                <input type="checkbox" class="cle-export" value="${echapperHtml(cle)}"
                       style="margin-right: 10px; transform: scale(1.2);">
                <span style="flex: 1; font-family: monospace; font-size: 0.9rem;">${echapperHtml(cle)}</span>
                <span style="color: var(--bleu-leger); font-size: 0.85rem;">${tailleKo} Ko</span>
            </label>
        `;
    }

    liste.innerHTML = html;
    document.getElementById('checkToutesLes').checked = false;
    modal.classList.remove('u-hide');
}

function fermerModalExport() {
    document.getElementById('modalExport').classList.add('u-hide');
    document.getElementById('checkToutesLes').checked = false;
}

function toggleToutesLesCles() {
    const checkTous = document.getElementById('checkToutesLes').checked;
    document.querySelectorAll('.cle-export').forEach(cb => {
        cb.checked = checkTous;
    });
}

async function executerExport() {
    const clesSelectionnees = [];
    document.querySelectorAll('.cle-export:checked').forEach(cb => {
        clesSelectionnees.push(cb.value);
    });

    if (clesSelectionnees.length === 0) {
        alert('Aucune clé sélectionnée');
        return;
    }

    // Détecter si des clés contiennent des données personnelles
    const CLES_DONNEES_PERSONNELLES = ['groupeEtudiants', 'presences', 'evaluationsSauvegardees', 'snapshots'];
    const contientDonneesPerso = clesSelectionnees.some(cle =>
        CLES_DONNEES_PERSONNELLES.some(pattern => cle.includes(pattern))
    );

    if (contientDonneesPerso) {
        const continuer = confirm(
            'Ce fichier contiendra des données personnelles d\'étudiants (noms, DA, notes, présences).\n\n' +
            'Ne le partagez pas.\n\n' +
            'Continuer l\'export ?'
        );
        if (!continuer) return;
    }

    const _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) {
        window.afficherProgression('Export sélectif');
        window.majProgression(0, 'Lecture des clés...', clesSelectionnees.length + ' clés');
        await new Promise(r => setTimeout(r, 0));
    }

    try {

    const donnees = {};
    let nbDemoExclus = 0;
    let _iCle = 0;

    // 🆕 Beta 96.2 : Utiliser db.get() pour lire depuis IndexedDB (pas seulement localStorage)
    for (const cle of clesSelectionnees) {
        let valeur = null;
        if (_hasProg) {
            const pct = Math.round((_iCle / clesSelectionnees.length) * 50);
            window.majProgression(pct, 'Lecture des clés...', (_iCle + 1) + '/' + clesSelectionnees.length + ' · ' + cle);
        }
        _iCle++;

        try {
            // Récupérer la valeur depuis IndexedDB (ou localStorage en fallback)
            valeur = await db.get(cle, null);
        } catch (e) {
            console.warn(`[Export] Erreur lecture clé "${cle}":`, e);
            continue;
        }

        // ✅ AJOUTÉ (6 jan 2026) : Filtrer les données démo avant export
        if (valeur !== null) {
            // Filtrer les étudiants démo (groupe 9999)
            if (cle.includes('groupeEtudiants') && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(e => !estRessourceDemo(e, 'etudiant'));
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les cours démo (groupe 9999)
            if (cle === 'listeCours' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(c => !estRessourceDemo(c, 'cours'));
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les grilles démo
            if (cle === 'grillesTemplates' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = filtrerRessourcesNonDemo(valeur, 'grille');
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les échelles démo
            if (cle === 'echellesTemplates' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = filtrerRessourcesNonDemo(valeur, 'echelle');
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les productions démo
            if (cle.includes('productions') && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(p => !p.estDemo);
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les évaluations démo
            if (cle.includes('evaluationsSauvegardees') && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(ev => !ev.estDemo);
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les presences démo
            if (cle.includes('presences') && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(p => !p.estDemo);
                nbDemoExclus += avant - valeur.length;
            }

            // Retirer les noms des étudiants dans les snapshots exportés
            // (le nom sera re-résolu localement à l'import via la liste d'étudiants)
            if (cle.includes('snapshots') && valeur && typeof valeur === 'object') {
                const retirerNomsSnapshots = (snapArray) => {
                    if (!Array.isArray(snapArray)) return snapArray;
                    return snapArray.map(snap => {
                        if (snap && Array.isArray(snap.etudiants)) {
                            return {
                                ...snap,
                                etudiants: snap.etudiants.map(e => {
                                    const { nom, prenom, ...sansNom } = e;
                                    return sansNom;
                                })
                            };
                        }
                        return snap;
                    });
                };
                if (valeur.hebdomadaires) valeur.hebdomadaires = retirerNomsSnapshots(valeur.hebdomadaires);
                if (valeur.interventions) valeur.interventions = retirerNomsSnapshots(valeur.interventions);
            }

            // Pour les ressources partageables, vérifier qu'aucun champ personnel ne s'y glisse
            if ((cle === 'grillesTemplates' || cle === 'echellesTemplates' || cle === 'pratiquesConfigurables' || cle.includes('productions')) && Array.isArray(valeur)) {
                valeur = valeur.map(item => {
                    const copie = { ...item };
                    // Retirer les champs personnels qui ne devraient pas être dans les ressources
                    delete copie.etudiantDA;
                    delete copie.da;
                    delete copie.prenom;
                    // Ne pas supprimer 'nom' car c'est le nom de la ressource, pas d'un étudiant
                    return copie;
                });
            }

            // 🔧 FIX (Beta 97.9) : Convertir les tableaux sparse en Object
            // Un DA étudiant utilisé comme index crée des millions de slots null
            if (Array.isArray(valeur) && valeur.length > 10000) {
                const nbNonNull = valeur.filter(v => v != null).length;
                if (nbNonNull < valeur.length * 0.01) {
                    // Tableau sparse détecté (>99% de slots null)
                    const converti = {};
                    for (let i = 0; i < valeur.length; i++) {
                        if (valeur[i] != null) {
                            converti[String(i)] = valeur[i];
                        }
                    }
                    valeur = converti;
                }
            }

            // Stocker la valeur
            donnees[cle] = valeur;
        }
    }

    if (nbDemoExclus > 0) {
    }

    if (_hasProg) window.majProgression(55, 'Sérialisation JSON...');
    const json = JSON.stringify(donnees, null, 2);

    // 🆕 FIX #56 (1er fév 2026) : Horodatage complet pour éviter confusion entre exports
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;

    // Convention #262 : préfixe `sauvegarde-{auteur}-{date}` (sans
    // « CONFIDENTIEL- » ni « monitorage », accents préservés).
    // contientDonneesPerso reste consommé par le dialog de confirmation au-dessus.
    const infoCours = db.getSync ? db.getSync('infoCours', {}) : {};
    const auteurBrut = infoCours?.enseignant;
    const auteur = (typeof auteurBrut === 'string') ? auteurBrut : '';
    const auteurNettoye = auteur
        ? auteur.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '-').replace(/-+/g, '-').toLowerCase()
        : '';
    const partieAuteur = auteurNettoye ? `-${auteurNettoye}` : '';

    // 🆕 Export ZIP si fichiersTravaux est sélectionné (inclut les blobs)
    // #384 (audit 5 août, rapport A3) : TOUTES les clés fichiersTravaux
    // sélectionnées (une par trimestre) — l'ancien `find` n'embarquait les
    // blobs QUE de la première clé trouvée : backup multi-trimestre incomplet,
    // perte découverte à la restauration.
    const clesFT = clesSelectionnees.filter(c => c.includes('fichiersTravaux'));
    if (clesFT.length > 0 && typeof JSZip !== 'undefined' && typeof travauxStockage !== 'undefined') {
        if (_hasProg) window.majProgression(65, 'Préparation du ZIP...');
        const zip = new JSZip();
        zip.file('donnees.json', json);

        const metadonnees = [];
        for (const cleFT of clesFT) {
            if (Array.isArray(donnees[cleFT])) metadonnees.push(...donnees[cleFT]);
        }
        if (Array.isArray(metadonnees)) {
            const dossier = zip.folder('travaux');
            let nbBlobs = 0;
            let _iBlob = 0;
            for (const f of metadonnees) {
                if (_hasProg && _iBlob % 5 === 0) {
                    const pct = 65 + Math.round((_iBlob / Math.max(1, metadonnees.length)) * 10);
                    window.majProgression(pct, 'Ajout des fichiers travaux...', nbBlobs + '/' + metadonnees.length);
                }
                _iBlob++;
                const blobTravail = await travauxStockage.recupererBlob(f.id);
                if (blobTravail) {
                    const ext = (f.nomFichier || 'bin').split('.').pop();
                    dossier.file(f.id + '.' + ext, blobTravail);
                    nbBlobs++;
                }
            }
        }

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, function(meta) {
            if (_hasProg) {
                const pct = 75 + Math.round(meta.percent * 0.23);
                window.majProgression(pct, 'Compression du ZIP...', Math.round(meta.percent) + '%');
            }
        });
        const nomFichier = `sauvegarde${partieAuteur}-${dateStr}.zip`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(a.href);
    } else {
        // Export JSON classique (sans fichiersTravaux)
        if (_hasProg) window.majProgression(90, 'Préparation du téléchargement...');
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const nomFichier = `sauvegarde${partieAuteur}-${dateStr}.json`;
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
    }

    fermerModalExport();

    notifications.succes(`Export réussi : ${clesSelectionnees.length} clé(s) exportée(s)`);

    } finally {
        if (_hasProg) window.masquerProgression();
    }
}

/* ===============================
   IMPORT DES DONNÉES
   =============================== */

let donneesImportEnAttente = null;

function ouvrirModalImport() {
    const modal = document.getElementById('modalImport');
    document.getElementById('fichierImport').value = '';
    document.getElementById('apercu-import').classList.add('u-hide');
    document.getElementById('btnExecuterImport').disabled = true;
    document.getElementById('btnExecuterImport').style.opacity = '0.5';
    donneesImportEnAttente = null;
    modal.classList.remove('u-hide');
    
    document.getElementById('fichierImport').onchange = previsualiserImport;
}

function fermerModalImport() {
    document.getElementById('modalImport').classList.add('u-hide');
    donneesImportEnAttente = null;
}

function previsualiserImport(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    // Limite de taille : 1 Go pour ZIP, 50 Mo pour JSON
    const limiteOctets = (fichier.name.endsWith('.zip') || fichier.type === 'application/zip')
        ? 1024 * 1024 * 1024
        : TAILLE_MAX_IMPORT_OCTETS;

    if (fichier.size > limiteOctets) {
        alert(`Fichier trop volumineux (${(fichier.size / 1024 / 1024).toFixed(1)} Mo).\n\nLimite : ${(limiteOctets / 1024 / 1024).toFixed(0)} Mo.`);
        return;
    }

    const nomFichier = fichier.name;

    // 🆕 Détection format ZIP (backup avec fichiers travaux)
    if ((fichier.name.endsWith('.zip') || fichier.type === 'application/zip') && typeof JSZip !== 'undefined') {
        const lecteurZip = new FileReader();
        lecteurZip.onload = async function(e) {
            try {
                const zip = await JSZip.loadAsync(e.target.result);

                // Validation sécurité ZIP (taille décompressée + path traversal)
                var securite = validerZipSecurite(zip);
                if (!securite.valide) {
                    alert('ZIP rejeté : ' + securite.erreur);
                    return;
                }

                // Bloquer les codex : ils doivent passer par le bouton Codex
                if (zip.file('codex-manifeste.json') || zip.file('classeur-manifeste.json')) {
                    alert('Ce fichier est un codex (donn\u00e9es portables USB).\n\nPour l\u2019ouvrir, utilise le bouton Codex dans l\u2019en-t\u00eate de l\u2019application, puis \u00ab\u00a0Ouvrir un codex...\u00a0\u00bb.');
                    return;
                }

                const jsonEntry = zip.file('donnees.json');
                if (!jsonEntry) {
                    alert('ZIP invalide : fichier donnees.json manquant.');
                    return;
                }
                const jsonStr = await jsonEntry.async('string');
                let donnees;
                try {
                    donnees = JSON.parse(jsonStr);
                } catch (err) {
                    alert('Fichier donnees.json invalide dans le ZIP.');
                    console.error('Erreur parsing JSON dans ZIP:', err);
                    return;
                }

                // Stocker la référence ZIP pour restauration ultérieure des blobs
                donnees._zipTravaux = zip;

                fermerModalImport();
                configCompleteEnAttente = donnees;

                const format = detecterFormatConfig(donnees);
                if (format === 'configuration-complete') {
                    afficherModalPreviewConfigComplete(donnees);
                } else {
                    configCompleteEnAttente._format = 'localStorage-brut';
                    afficherModalPreviewLocalStorageBrut(donnees, nomFichier);
                }
            } catch (err) {
                alert('Erreur lors de la lecture du fichier ZIP.\n\nDétails dans la console (F12).');
                console.error('Erreur lecture ZIP:', err);
            }
        };
        lecteurZip.readAsArrayBuffer(fichier);
        return;
    }

    // Import JSON classique
    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        // Étape 1 : Parser le JSON
        let donnees;
        try {
            donnees = JSON.parse(e.target.result);
        } catch (err) {
            alert('Fichier JSON invalide.\n\nVérifiez que le fichier est bien un export Monitorage.');
            console.error('Erreur de parsing JSON:', err);
            return;
        }

        // Étape 2 : Traiter les données (erreurs séparées)
        try {
            // 🆕 BETA 95.1 : Fermer l'ancien modal et ouvrir le nouveau avec analyse
            fermerModalImport();

            // Stocker les données pour l'import
            configCompleteEnAttente = donnees;

            // Détecter le format et afficher le modal approprié
            const format = detecterFormatConfig(donnees);

            if (format === 'configuration-complete') {
                // Format Beta 91+ avec métadonnées
                afficherModalPreviewConfigComplete(donnees);
            } else {
                // Format localStorage brut → nouveau modal avec checkboxes
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(donnees, nomFichier);
            }
        } catch (err) {
            alert('Erreur lors de l\'analyse du fichier.\n\nDétails dans la console (F12).');
            console.error('Erreur analyse import:', err);
        }
    };
    lecteur.readAsText(fichier);
}

async function executerImport() {
    if (!donneesImportEnAttente) return;

    if (!confirm('Confirmer l\'importation ? Les données existantes seront écrasées pour les clés importées.')) {
        return;
    }

    // Snapshot local : la fonction est async et fermerModalImport() peut
    // reset donneesImportEnAttente à null pendant les await ci-dessous.
    const donnees = donneesImportEnAttente;

    try {
        // ✅ CORRECTION: Utiliser db.set() (async/IndexedDB) au lieu de db.setSync()
        // Pour éviter QuotaExceededError sur localStorage avec gros fichiers
        const cles = Object.keys(donnees).filter(c => !c.startsWith('_'));
        let nbCles = 0;

        for (const cle of cles) {
            let valeur = donnees[cle];

            // ✅ CORRECTION: Parser les strings JSON (backups de l'ancienne version localStorage)
            // Si la valeur est une string JSON, la parser avant de stocker
            if (typeof valeur === 'string') {
                try {
                    valeur = JSON.parse(valeur);
                } catch (e) {
                    // Si ce n'est pas du JSON valide, garder la string telle quelle
                }
            }

            await db.set(cle, valeur);
            nbCles++;
        }

        // Détecter si ce sont les données de démo (pour déclencher tutoriel)
        const clesDemoPresentes = ['groupeEtudiants', 'artefacts', 'modalitesEvaluation'].every(cle =>
            donnees.hasOwnProperty(cle)
        );

        if (clesDemoPresentes && donnees.groupeEtudiants &&
            Array.isArray(donnees.groupeEtudiants) &&
            donnees.groupeEtudiants.length > 0) {
            // Marquer que les données de démo ont été chargées
            await db.set('donnees_demo_chargees', true);
        }

        // ✅ CRITIQUE: Synchroniser le cache localStorage avec IndexedDB
        // Les modules utilisent db.getSync() qui lit depuis le cache localStorage
        await db.syncToLocalStorageCache();

        // 🆕 Restauration des blobs travaux depuis le ZIP
        const nbRestores = await _restaurerBlobsDepuisZip(donnees);

        fermerModalImport();

        const msgBlobs = nbRestores > 0 ? ` + ${nbRestores} fichier(s) travaux` : '';
        notifications.succes(`Import réussi : ${nbCles} clé(s) importée(s)${msgBlobs}`);

        // Écritures IDB pendantes terminées AVANT le reload (bug terrain
        // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
        await db.flush();
        if (confirm('Import terminé ! Recharger la page pour appliquer les changements ?')) {
            location.reload();
        }
    } catch (erreur) {
        console.error('❌ Erreur lors de l\'import:', erreur);
        alert(`Erreur lors de l'import : ${erreur.message}`);
        fermerModalImport();
    }
}

/**
 * 🆕 Restaure les blobs travaux depuis un ZIP importé
 * Utilisé par executerImport() et executerImportLocalStorageBrut()
 * @param {Object} donnees - Données importées, avec éventuellement _zipTravaux
 * @returns {Promise<number>} Nombre de blobs restaurés
 */
async function _restaurerBlobsDepuisZip(donnees) {
    if (!donnees._zipTravaux || typeof travauxStockage === 'undefined') return 0;

    const zip = donnees._zipTravaux;
    // #384 : TOUTES les clés fichiersTravaux (une par trimestre) — symétrique
    // à l'export ; l'ancien `find` ne restaurait que la première.
    const metadonnees = [];
    for (const cleFT of Object.keys(donnees).filter(c => c.includes('fichiersTravaux'))) {
        if (Array.isArray(donnees[cleFT])) metadonnees.push(...donnees[cleFT]);
    }

    if (metadonnees.length === 0) return 0;

    let nbRestores = 0;
    for (const f of metadonnees) {
        try {
            const entries = zip.file(new RegExp('^travaux/' + f.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.'));
            if (entries && entries.length > 0) {
                const blob = await entries[0].async('blob');
                // #385 (audit 5 août, rapport A4) : même garde que le chemin
                // codex (codex.js) — un ZIP altéré peut contenir un blob
                // malveillant déguisé en image/PDF. Règle CLAUDE.md :
                // validerMagicBytes sur TOUT blob importé.
                if (window.travauxImport && typeof window.travauxImport.validerMagicBytes === 'function') {
                    const magicOk = await window.travauxImport.validerMagicBytes(blob);
                    if (!magicOk) {
                        console.warn(`[Import ZIP] Blob refusé (magic bytes invalides) pour ${f.id}`);
                        continue;
                    }
                }
                await travauxStockage.stockerBlob(f.id, blob, f.etudiantDA, f.productionId);
                nbRestores++;
            }
        } catch (e) {
            console.warn(`[Import ZIP] Erreur restauration blob ${f.id}:`, e);
        }
    }

    if (nbRestores > 0) {
    }
    return nbRestores;
}

/* ===============================
   RÉINITIALISATION
   =============================== */

function reinitialiserDonnees() {
    if (!confirm('ATTENTION : Cette action va effacer TOUTES les données de l\'application.\n\nEs-tu sûr de vouloir continuer ?')) {
        return;
    }

    if (!confirm('Cette action est IRRÉVERSIBLE.\n\nAs-tu exporté tes données avant de continuer ?')) {
        return;
    }

    const confirmation = prompt('Pour confirmer, tape "EFFACER" en majuscules :');

    if (confirmation !== 'EFFACER') {
        alert('Réinitialisation annulée');
        return;
    }

    try {
        // Effacer localStorage
        localStorage.clear();

        // Effacer IndexedDB (async)
        if (typeof db !== 'undefined' && typeof db.clear === 'function') {
            db.clear().then(() => {
                alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
                location.reload();
            }).catch(erreur => {
                console.error('Erreur lors de l\'effacement IndexedDB:', erreur);
                alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
                location.reload();
            });
        } else {
            alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
            location.reload();
        }
    } catch (erreur) {
        console.error('Erreur lors de la réinitialisation:', erreur);
        alert('Erreur lors de la réinitialisation.');
    }
}

/* ===============================
   IMPORT CONFIGURATION COMPLÈTE (Beta 91)
   =============================== */

let configCompleteEnAttente = null;

/**
 * Prévisualise une configuration complète avant import
 * Supporte deux formats :
 * - Nouveau format (Beta 91+) : { metadata: { type: 'configuration-complete' }, contenu: {...} }
 * - Ancien format (localStorage brut) : { modalitesEvaluation: ..., bibliothequeGrilles: ..., ... }
 *
 * @param {Event} event - Événement de sélection de fichier
 */
function previsualiserConfigComplete(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    // Limite de taille (50 Mo)
    if (fichier.size > TAILLE_MAX_IMPORT_OCTETS) {
        alert(`Fichier trop volumineux (${(fichier.size / 1024 / 1024).toFixed(1)} Mo).\n\nLimite : 50 Mo.`);
        return;
    }

    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);

            // 🆕 BETA 95.1 : Détecter le format du fichier
            const formatDetecte = detecterFormatConfig(config);

            if (formatDetecte === 'configuration-complete') {
                // Nouveau format (Beta 91+)
                if (!config.contenu) {
                    alert('Fichier invalide. La structure de la configuration est incorrecte.');
                    return;
                }
                configCompleteEnAttente = config;
                configCompleteEnAttente._format = 'configuration-complete';
                afficherModalPreviewConfigComplete(config);

            } else if (formatDetecte === 'localStorage-brut') {
                // Ancien format (export localStorage brut)
                configCompleteEnAttente = config;
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(config, fichier.name);

            } else {
                alert('Fichier non reconnu.\n\nFormats acceptés :\n• Configuration complète (Beta 91+)\n• Export localStorage brut');
            }

        } catch (err) {
            alert('Erreur lors de la lecture du fichier JSON.\n\n' + err.message);
            console.error('Erreur parsing JSON:', err);
        }
    };
    lecteur.readAsText(fichier);
}

/**
 * Détecte le format d'un fichier de configuration
 * @param {Object} config - Objet JSON parsé
 * @returns {string} 'configuration-complete' | 'localStorage-brut' | 'inconnu'
 */
function detecterFormatConfig(config) {
    // Format nouveau (Beta 91+)
    if (config.metadata && config.metadata.type === 'configuration-complete') {
        return 'configuration-complete';
    }

    // Format localStorage brut : contient des clés typiques de l'application
    const clesBrut = ['modalitesEvaluation', 'infoCours', 'bibliothequeGrilles', 'echellesTemplates',
                      'grillesTemplates', 'productionsCours', 'pratiquesConfigurables', 'cadreCalendrier'];
    const clesPresentes = Object.keys(config);
    const nbClesReconnues = clesBrut.filter(cle => clesPresentes.includes(cle)).length;

    if (nbClesReconnues >= 2 || clesPresentes.some(c => c.includes('_') && c.includes('2026'))) {
        return 'localStorage-brut';
    }

    return 'inconnu';
}

/**
 * Affiche le modal de prévisualisation pour un export localStorage brut
 * Propose deux modes : import complet OU fusion avec bibliothèques
 * @param {Object} config - Données brutes localStorage
 * @param {string} nomFichier - Nom du fichier importé
 */
// Variable globale pour stocker l'analyse en cours
let analyseImportEnCours = null;

/**
 * Toggle toutes les checkboxes d'une catégorie
 * @param {string} category - ID de la catégorie (grilles, echelles, etc.)
 * @param {boolean} checked - État à appliquer
 */
function toggleCategoryItems(category, checked) {
    const items = document.querySelectorAll(`.import-item-${category}`);
    items.forEach(cb => {
        cb.checked = checked;
    });
}

// Exposer globalement
window.toggleCategoryItems = toggleCategoryItems;

// Wrapper délégué (data-on-change) — reçoit (param, el) du dispatcher
window.toggleCategoryItemsFromEl = function(category, el) {
    toggleCategoryItems(category, el.checked);
};

/**
 * 🆕 Beta 96.2 : Toggle l'affichage des checkboxes données perso quand l'utilisateur confirme
 * @param {boolean} checked - État de la checkbox "C'est ma propre sauvegarde"
 */
function toggleDonneesPersoImport(checked) {
    const container = document.getElementById('checkboxesDonneesPerso');
    if (container) {
        toggleDisplay(container, checked);
        // 🆕 FIX (31 jan 2026) : Cocher automatiquement les checkboxes données perso
        // quand l'utilisateur confirme que c'est sa propre sauvegarde
        if (checked) {
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
        }
    }
    // Stocker dans l'analyse en cours pour utilisation lors de l'import
    if (analyseImportEnCours) {
        analyseImportEnCours.confirmeMaSauvegarde = checked;
    }
}

// Exposer globalement
window.toggleDonneesPersoImport = toggleDonneesPersoImport;

// Wrapper délégué (data-on-change) — reçoit (el) du dispatcher
window.toggleDonneesPersoImportFromEl = function(el) {
    toggleDonneesPersoImport(el.checked);
};

function afficherModalPreviewLocalStorageBrut(config, nomFichier) {
    const cles = Object.keys(config);
    const nbCles = cles.length;

    // Calculer la taille approximative (exclure _zipTravaux qui est un objet JSZip)
    let tailleTotale = 0;
    Object.entries(config).forEach(function(pair) {
        if (pair[0] === '_zipTravaux' || pair[0] === '_format') return;
        var v = pair[1];
        try {
            tailleTotale += (typeof v === 'string' ? v.length : JSON.stringify(v).length) * 2;
        } catch (e) {
            // Valeur non sérialisable — ignorer
        }
    });
    const tailleKo = (tailleTotale / 1024).toFixed(1);

    // Analyser les ressources en détail
    const analyse = analyserRessourcesDetaillees(config);
    analyseImportEnCours = analyse;

    // ✅ CORRIGÉ (6 jan 2026) : Lire le nom enseignant dans tous les formats possibles
    const extraireNomEnseignant = (infoCours) => {
        if (!infoCours) return '';
        // Format 1: prenomEnseignant + nomEnseignant (champs séparés)
        if (infoCours.prenomEnseignant || infoCours.nomEnseignant) {
            return `${infoCours.prenomEnseignant || ''} ${infoCours.nomEnseignant || ''}`.trim().toLowerCase();
        }
        // Format 2: enseignant comme chaîne
        if (typeof infoCours.enseignant === 'string') {
            return infoCours.enseignant.toLowerCase().trim();
        }
        // Format 3: enseignant.prenom + enseignant.nom (objet)
        if (infoCours.enseignant?.prenom || infoCours.enseignant?.nom) {
            return `${infoCours.enseignant.prenom || ''} ${infoCours.enseignant.nom || ''}`.trim().toLowerCase();
        }
        return '';
    };

    // Détecter si l'import vient d'un collègue ou de soi-même
    const infoCoursActuel = db.getSync('infoCours', {}) || {};
    const utilisateurActuel = extraireNomEnseignant(infoCoursActuel);

    // Chercher l'auteur dans le fichier importé
    let auteurImport = '';
    if (config.infoCours) {
        try {
            const infoCoursImport = typeof config.infoCours === 'string'
                ? JSON.parse(config.infoCours)
                : config.infoCours;
            auteurImport = extraireNomEnseignant(infoCoursImport);
        } catch (e) { console.warn('[Import-Export] auteur import extraction skipped:', e.message || e); }
    }

    // Déterminer si c'est un collègue (auteurs différents ET non vides)
    const estCollègue = auteurImport && utilisateurActuel && auteurImport !== utilisateurActuel;

    // 🆕 Beta 96.2 : Logique améliorée pour la source
    // - Si auteur identifié dans fichier mais pas de profil local → restauration sur nouvel appareil (OK)
    // - Si profil local mais pas d'auteur dans fichier → fichier ancien ou d'un collègue (blocage)
    // - Si les deux vides → vraiment inconnu (blocage)
    const sourceInconnue = !auteurImport; // Seulement si le FICHIER n'a pas d'auteur
    const restaurationNouvelAppareil = auteurImport && !utilisateurActuel;

    const sourceLabel = estCollègue
        ? `Configuration de ${auteurImport.split(' ')[0] || 'collègue'}`
        : restaurationNouvelAppareil
            ? `Restauration de ${auteurImport.split(' ')[0] || 'ta sauvegarde'}`
            : sourceInconnue
                ? 'Source inconnue'
                : 'Sauvegarde personnelle';

    // Stocker pour utilisation dans executerImportSelectif
    analyseImportEnCours.estCollègue = estCollègue;
    analyseImportEnCours.auteurImport = auteurImport;
    analyseImportEnCours.sourceInconnue = sourceInconnue;
    analyseImportEnCours.restaurationNouvelAppareil = restaurationNouvelAppareil;

    // ✅ MODIFIÉ (6 jan 2026) : Checkbox individuelle par élément
    const genererLigneRessource = (id, label, count, items) => {
        if (count === 0) return '';

        // Générer les checkboxes individuelles pour chaque item
        const itemsHTML = items.map((item, index) => {
            const itemId = item.id || `${id}_${index}`;
            const nomAffiche = echapperHtml(item.nom || 'Sans nom');
            // Ajouter l'auteur original si présent (échappé contre XSS)
            const auteurInfo = item.auteurOriginal ? ` <span style="color: var(--gris-clair); font-size: 0.75rem;">(${echapperHtml(item.auteurOriginal)})</span>` : '';

            return `
                <label style="display: flex; align-items: center; gap: 8px; padding: 6px 10px;
                       background: var(--gris-tres-pale); border-radius: 4px; margin: 4px 0; cursor: pointer;
                       border: 1px solid var(--bordure-claire); transition: all 0.15s;"
                       class="hover-bordure-succes">
                    <input type="checkbox" class="import-item import-item-${id}" data-category="${id}" data-item-id="${itemId}"
                           style="transform: scale(1.1); accent-color: var(--vert-succes);">
                    <span style="font-size: 0.85rem;">${nomAffiche}${auteurInfo}</span>
                </label>
            `;
        }).join('');

        return `
            <div style="background: var(--surface-conteneur, #162c36); border-radius: 6px; margin-bottom: 12px;
                   border: 1px solid var(--bordure-claire); overflow: hidden;">
                <!-- En-tête de catégorie avec checkbox "tout sélectionner" -->
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px;
                       background: var(--gris-tres-pale); cursor: pointer; border-bottom: 1px solid var(--bordure-claire);"
                       >
                    <input type="checkbox" id="import-${id}" class="import-category-toggle"
                           data-category="${id}"
                           data-on-change="toggleCategoryItemsFromEl" data-param="${id}"
                           style="transform: scale(1.2); accent-color: var(--vert-succes);">
                    <div style="flex: 1;">
                        <strong style="font-size: 0.95rem;">${label}</strong>
                        <span style="color: var(--vert-succes); font-size: 0.85rem; margin-left: 8px;">(${count})</span>
                        <span style="color: var(--gris-clair); font-size: 0.75rem; margin-left: 8px;">tout cocher/décocher</span>
                    </div>
                </label>
                <!-- Liste des items individuels -->
                <div style="padding: 8px 12px; max-height: 200px; overflow-y: auto;">
                    ${itemsHTML}
                </div>
            </div>
        `;
    };

    // Générer les lignes de données avec checkboxes
    const genererLigneDonnee = (id, label, info) => {
        if (!info) return '';
        return `
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px;
                   background: var(--surface-conteneur, #162c36); border-radius: 6px; margin-bottom: 8px; cursor: pointer;
                   border: 1px solid var(--bordure-claire); transition: all 0.2s;"
                   class="hover-bordure-gris">
                <input type="checkbox" id="import-${id}"
                       style="transform: scale(1.2); accent-color: var(--gris-moyen);">
                <div style="flex: 1;">
                    <strong style="font-size: 0.95rem;">${label}</strong>
                    <span style="color: var(--gris-moyen); font-size: 0.85rem; margin-left: 8px;">${info}</span>
                </div>
            </label>
        `;
    };

    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: var(--surface-conteneur, #162c36); border-radius: 10px; padding: 30px; max-width: 650px;
                 width: 90%; max-height: 90vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--texte-secondaire); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Contenu du fichier
                </h2>

                <!-- Info fichier + source -->
                <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.95rem;">${echapperHtml(nomFichier)}</strong>
                        <span style="background: ${estCollègue ? 'var(--alerte-fond-attention)' : sourceInconnue ? 'var(--gris-tres-pale)' : 'var(--alerte-fond-succes, #d4edda)'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                            ${echapperHtml(sourceLabel)}
                        </span>
                    </div>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: var(--gris-moyen);">
                        ${nbCles} éléments · ~${tailleKo} Ko
                    </p>
                </div>

                ${sourceInconnue ? `
                <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 12px; margin-bottom: 15px; border-left: 4px solid var(--gris-moyen);">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--gris-fonce);">
                        <strong>Auteur non identifié</strong><br>
                        ${!utilisateurActuel
                            ? 'Configure ton nom dans Cadre > Trimestre > Cours pour identifier tes fichiers.'
                            : 'Le fichier importé ne contient pas d\'information sur son auteur.'}
                    </p>
                </div>
                ` : ''}

                <!-- Instruction -->
                <p style="font-size: 0.95rem; color: var(--gris-fonce); margin-bottom: 15px;">
                    <strong>Coche ce que tu veux importer :</strong>
                </p>

                <!-- SECTION: Ressources pédagogiques -->
                ${analyse.totalRessources > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: var(--vert-succes); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--alerte-fond-succes, #d4edda); padding: 4px 8px; border-radius: 4px;">Ressources pédagogiques</span>
                        <span style="font-size: 0.8rem; color: var(--gris-moyen); font-weight: normal;">Ajoutées à tes bibliothèques</span>
                    </h3>
                    <div style="background: var(--alerte-fond-succes, #f0fff4); border-radius: 8px; padding: 12px;">
                        ${genererLigneRessource('pratiques', 'Pratiques de notation', analyse.ressources.pratiques.count, analyse.ressources.pratiques.items)}
                        ${genererLigneRessource('grilles', 'Grilles de critères', analyse.ressources.grilles.count, analyse.ressources.grilles.items)}
                        ${genererLigneRessource('echelles', 'Échelles de performance', analyse.ressources.echelles.count, analyse.ressources.echelles.items)}
                        ${genererLigneRessource('productions', 'Productions', analyse.ressources.productions.count, analyse.ressources.productions.items)}
                        ${analyse.ressources.cartouches.count > 0 ? genererLigneRessource('cartouches', 'Cartouches de rétroaction', analyse.ressources.cartouches.count, analyse.ressources.cartouches.items.map(c => ({id: 'cartouches_' + c.grilleId, nom: c.count + ' pour grille ' + c.grilleId.substring(0,8)}))) : ''}
                    </div>
                </div>
                ` : ''}

                <!-- SECTION: Données du cours -->
                ${analyse.totalDonnees > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: var(--gris-moyen); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--gris-tres-pale); padding: 4px 8px; border-radius: 4px;">Données du cours</span>
                        <span style="font-size: 0.8rem; color: var(--gris-clair); font-weight: normal;">Protégées</span>
                    </h3>

                    <!-- 🆕 Beta 96.2 : Données personnelles importables SI c'est sa propre sauvegarde ou restauration -->
                    ${(analyse.donnees.etudiants.count > 0 || analyse.donnees.presences.count > 0 || analyse.donnees.evaluations.count > 0) ? `
                    ${estCollègue ? `
                    <!-- Fichier d'un collègue : bloquer import données perso (pas de bypass possible) -->
                    <div style="background: var(--alerte-fond-erreur, #f8d7da); border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid var(--rouge-erreur);">
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                            ${analyse.donnees.etudiants.count > 0 ? `<span style="background: var(--alerte-fond-erreur, #f5c6cb); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--rouge-erreur);">Étudiants (${analyse.donnees.etudiants.count})</span>` : ''}
                            ${analyse.donnees.presences.count > 0 ? `<span style="background: var(--alerte-fond-erreur, #f5c6cb); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--rouge-erreur);">Présences (${analyse.donnees.presences.count} dates)</span>` : ''}
                            ${analyse.donnees.evaluations.count > 0 ? `<span style="background: var(--alerte-fond-erreur, #f5c6cb); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--rouge-erreur);">Notes (${analyse.donnees.evaluations.cles.length} ensemble(s))</span>` : ''}
                        </div>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--rouge-erreur);">
                            <strong>Partage impossible</strong> – Ces données appartiennent à un collègue et ne peuvent pas être importées.
                        </p>
                    </div>
                    ` : (sourceInconnue && !restaurationNouvelAppareil) ? `
                    <!-- Source inconnue : permettre bypass avec confirmation -->
                    <div id="sectionDonneesPerso" style="background: var(--alerte-fond-attention); border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid var(--btn-annuler);">
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                            ${analyse.donnees.etudiants.count > 0 ? `<span style="background: var(--alerte-fond-attention); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--gris-fonce);">Étudiants (${analyse.donnees.etudiants.count})</span>` : ''}
                            ${analyse.donnees.presences.count > 0 ? `<span style="background: var(--alerte-fond-attention); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--gris-fonce);">Présences (${analyse.donnees.presences.count} dates)</span>` : ''}
                            ${analyse.donnees.evaluations.count > 0 ? `<span style="background: var(--alerte-fond-attention); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: var(--gris-fonce);">Notes (${analyse.donnees.evaluations.cles.length} ensemble(s))</span>` : ''}
                        </div>
                        <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: var(--gris-fonce);">
                            <strong>Source non identifiée</strong> – Le fichier ne contient pas d'information sur son auteur.
                        </p>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 6px; border: 2px solid var(--btn-annuler);">
                            <input type="checkbox" id="confirmMaSauvegarde" data-on-change="toggleDonneesPersoImportFromEl" style="width: 20px; height: 20px;">
                            <span style="font-size: 0.9rem; color: var(--gris-fonce);"><strong>C'est ma propre sauvegarde</strong> – Je confirme que ce fichier m'appartient</span>
                        </label>
                        <div id="checkboxesDonneesPerso" style="display: none; margin-top: 12px; padding: 12px; background: var(--alerte-fond-succes, #d4edda); border-radius: 6px;">
                            ${analyse.donnees.etudiants.count > 0 ? genererLigneDonnee('etudiants', 'Étudiants', analyse.donnees.etudiants.count + ' étudiant(s)') : ''}
                            ${analyse.donnees.presences.count > 0 ? genererLigneDonnee('presences', 'Présences', analyse.donnees.presences.count + ' date(s)') : ''}
                            ${analyse.donnees.evaluations.count > 0 ? genererLigneDonnee('evaluations', 'Notes', analyse.donnees.evaluations.cles.length + ' ensemble(s)') : ''}
                        </div>
                    </div>
                    ` : `
                    <!-- Sauvegarde personnelle : permettre import données perso -->
                    <div style="background: var(--alerte-fond-succes, #d4edda); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                        ${analyse.donnees.etudiants.count > 0 ? genererLigneDonnee('etudiants', 'Étudiants', analyse.donnees.etudiants.count + ' étudiant(s)') : ''}
                        ${analyse.donnees.presences.count > 0 ? genererLigneDonnee('presences', 'Présences', analyse.donnees.presences.count + ' date(s)') : ''}
                        ${analyse.donnees.evaluations.count > 0 ? genererLigneDonnee('evaluations', 'Notes', analyse.donnees.evaluations.cles.length + ' ensemble(s)') : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--vert-succes); margin: 8px 0 0 12px;">
                        <span class="icone-inline icone-inline--check" aria-hidden="true"></span>Sauvegarde personnelle détectée – tes données peuvent être restaurées
                    </p>
                    `}
                    ` : ''}

                    <!-- Configuration du cours (importable sauf si collègue) -->
                    ${analyse.donnees.configuration.present && !estCollègue ? `
                    <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 12px;">
                        ${genererLigneDonnee('configuration', 'Configuration du cours', analyse.donnees.configuration.cles.join(', '))}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--rouge-erreur); margin: 8px 0 0 12px;">
                        Attention : cette option remplacera ta configuration actuelle
                    </p>
                    ` : ''}
                </div>
                ` : ''}

                <!-- 🆕 Beta 96.2 : SECTION: Entités structurelles -->
                ${(analyse.entites?.groupesCours?.count > 0 || analyse.entites?.horaires?.count > 0 || analyse.entites?.enseignants?.present || analyse.entites?.calendrier?.count > 0) ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: var(--bleu-clair); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--bleu-pale); padding: 4px 8px; border-radius: 4px;">Structure du trimestre</span>
                        <span style="font-size: 0.8rem; color: var(--gris-moyen); font-weight: normal;">Groupe-cours, horaires, enseignants</span>
                    </h3>
                    <div style="background: var(--bleu-tres-pale); border-radius: 8px; padding: 12px;">
                        ${analyse.entites.groupesCours.count > 0 ? genererLigneDonnee('groupesCours', 'Groupe-cours', analyse.entites.groupesCours.count + ' groupe(s) - ' + analyse.entites.groupesCours.cles.join(', ')) : ''}
                        ${analyse.entites.horaires.count > 0 ? genererLigneDonnee('horaires', 'Horaires', analyse.entites.horaires.count + ' horaire(s) - ' + analyse.entites.horaires.cles.join(', ')) : ''}
                        ${analyse.entites.enseignants.present ? genererLigneDonnee('enseignants', 'Enseignants', analyse.entites.enseignants.count + ' profil(s)') : ''}
                        ${analyse.entites.calendrier?.count > 0 ? genererLigneDonnee('calendrier', 'Cadre du trimestre (calendrier)', analyse.entites.calendrier.count + ' clé(s) - remplace bornes, journées sans cours et séances') : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--bleu-clair); margin: 8px 0 0 12px;">
                        Ces données sont essentielles pour que l'application fonctionne correctement
                    </p>
                </div>
                ` : ''}

                <!-- SECTION: Fichiers travaux (PDF annotés) + Annotations -->
                ${analyse.fichiersTravaux.count > 0 || analyse.annotationsTravaux.count > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: var(--btn-annuler); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--alerte-fond-attention); padding: 4px 8px; border-radius: 4px;">Fichiers travaux</span>
                        <span style="font-size: 0.8rem; color: var(--gris-moyen); font-weight: normal;">PDF importés et annotés</span>
                    </h3>
                    <div style="background: var(--alerte-fond-attention); border-radius: 8px; padding: 12px;">
                        ${analyse.fichiersTravaux.count > 0 ? genererLigneDonnee('fichiersTravaux', 'Fichiers travaux', analyse.fichiersTravaux.count + ' fichier(s) PDF' + (analyse.fichiersTravaux.nbBlobsZip > 0 ? ' + ' + analyse.fichiersTravaux.nbBlobsZip + ' blob(s) dans le ZIP' : '')) : ''}
                        ${analyse.annotationsTravaux.count > 0 ? genererLigneDonnee('annotationsTravaux', 'Annotations', analyse.annotationsTravaux.count + ' annotation(s) sur les travaux') : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--btn-annuler); margin: 8px 0 0 12px;">
                        Indispensable pour consulter les travaux annotés dans la visionneuse
                    </p>
                </div>
                ` : ''}

                ${analyse.totalRessources === 0 && analyse.totalDonnees === 0 && !(analyse.entites?.groupesCours?.count > 0 || analyse.entites?.calendrier?.count > 0) ? `
                <div style="background: var(--alerte-fond-attention); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0; color: var(--gris-fonce);">Aucune ressource reconnue dans ce fichier.</p>
                </div>
                ` : ''}

                <!-- Boutons -->
                <div class="modal-actions">
                    <button class="btn btn-secondaire" data-action="fermerModalPreviewConfigComplete">
                        Annuler
                    </button>
                    <button class="btn btn-principal" data-action="executerImportSelectif"
                            ${analyse.totalRessources === 0 && analyse.totalDonnees === 0 && !(analyse.entites?.groupesCours?.count > 0 || analyse.entites?.horaires?.count > 0 || analyse.entites?.enseignants?.present || analyse.entites?.calendrier?.count > 0) ? 'disabled' : ''}>
                        Importer la sélection
                    </button>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * Analyse détaillée complète d'un export localStorage
 * Retourne les détails pour ressources pédagogiques ET données du cours
 * @param {Object} config - Données brutes localStorage
 * @returns {Object} Détails des ressources et données par type
 */
function analyserRessourcesDetaillees(config) {
    const result = {
        // Ressources pédagogiques (bibliothèques)
        ressources: {
            pratiques: { items: [], count: 0, cle: 'pratiquesConfigurables' },
            grilles: { items: [], count: 0, cles: ['grillesTemplates', 'bibliothequeGrilles'] },
            echelles: { items: [], count: 0, cle: 'echellesTemplates' },
            productions: { items: [], count: 0, cle: 'bibliothequeProductions' },
            cartouches: { items: [], count: 0, cles: [] }
        },
        // Données du cours (troubleshooting)
        donnees: {
            etudiants: { count: 0, cles: [] },
            presences: { count: 0, cles: [] },
            evaluations: { count: 0, cles: [] },
            configuration: { present: false, cles: [] }
        },
        // 🆕 Beta 96.2 : Entités structurelles (groupe-cours, horaires, enseignants)
        entites: {
            groupesCours: { count: 0, cles: [] },
            horaires: { count: 0, cles: [] },
            enseignants: { count: 0, present: false },
            // #380 : cadre calendrier — listé pour la case à cocher dédiée
            calendrier: { count: 0, cles: [] }
        },
        // Fichiers travaux (PDF annotés)
        fichiersTravaux: { count: 0, cles: [], nbBlobsZip: 0 },
        // Annotations sur les travaux
        annotationsTravaux: { count: 0, cles: [] },
        totalRessources: 0,
        totalDonnees: 0
    };

    // Parser les valeurs si elles sont des strings JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    // ========== RESSOURCES PÉDAGOGIQUES ==========

    // Pratiques configurables
    if (config.pratiquesConfigurables) {
        const pratiques = parseValeur(config.pratiquesConfigurables);
        if (Array.isArray(pratiques)) {
            result.ressources.pratiques.items = pratiques.map(p => ({
                id: p.id,
                nom: p.nom || 'Sans nom',
                activiteApprentissage: p.activiteApprentissage || p.description || '',
                description: p.activiteApprentissage || p.description || ''
            }));
            result.ressources.pratiques.count = pratiques.length;
        }
    }

    // Grilles (plusieurs sources possibles)
    let allGrilles = [];
    if (config.bibliothequeGrilles) {
        const grilles = parseValeur(config.bibliothequeGrilles);
        if (Array.isArray(grilles)) allGrilles = allGrilles.concat(grilles);
    }
    if (config.grillesTemplates) {
        const grilles = parseValeur(config.grillesTemplates);
        if (Array.isArray(grilles)) allGrilles = allGrilles.concat(grilles);
    }
    result.ressources.grilles.items = allGrilles.map(g => ({
        id: g.id,
        nom: g.nom || 'Sans nom',
        criteres: g.criteres ? g.criteres.length : 0
    }));
    result.ressources.grilles.count = allGrilles.length;

    // Échelles
    if (config.echellesTemplates) {
        const echelles = parseValeur(config.echellesTemplates);
        if (Array.isArray(echelles)) {
            result.ressources.echelles.items = echelles.map(e => ({
                id: e.id,
                nom: e.nom || 'Sans nom',
                niveaux: e.niveaux ? e.niveaux.length : 0
            }));
            result.ressources.echelles.count = echelles.length;
        }
    }

    // Productions (chercher dans bibliothequeProductions, productions, ET *_productions namespacées)
    // 🆕 FIX (1er fév 2026) : Ajout support clés namespacées comme h2026_productions
    let allProductions = [];
    let clesProdsAnalyse = [];

    // 1. Clé legacy bibliothequeProductions
    if (config.bibliothequeProductions) {
        const prodsTest = parseValeur(config.bibliothequeProductions);
        if (Array.isArray(prodsTest) && prodsTest.length > 0) {
            clesProdsAnalyse.push('bibliothequeProductions');
            allProductions = allProductions.concat(prodsTest);
        }
    }

    // 2. Clé globale ou namespacée productions / *_productions
    Object.keys(config).forEach(cle => {
        if (cle === 'productions' || cle.endsWith('_productions')) {
            const prods = parseValeur(config[cle]);
            if (Array.isArray(prods) && prods.length > 0) {
                clesProdsAnalyse.push(cle);
                allProductions = allProductions.concat(prods);
            }
        }
    });

    // Dédupliquer par ID (au cas où la même production serait dans plusieurs clés)
    const prodsUniques = [];
    const idsVus = new Set();
    allProductions.forEach(p => {
        if (p.id && !idsVus.has(p.id)) {
            idsVus.add(p.id);
            prodsUniques.push(p);
        }
    });

    if (prodsUniques.length > 0) {
        result.ressources.productions.items = prodsUniques.map(p => ({
            id: p.id,
            nom: p.nom || p.titre || 'Sans nom',
            type: p.type || ''
        }));
        result.ressources.productions.count = prodsUniques.length;
        result.ressources.productions.cles = clesProdsAnalyse;
    }

    // Cartouches (chercher toutes les clés cartouches_*)
    Object.keys(config).forEach(cle => {
        if (cle.startsWith('cartouches_')) {
            const cartouches = parseValeur(config[cle]);
            if (Array.isArray(cartouches) && cartouches.length > 0) {
                result.ressources.cartouches.cles.push(cle);
                result.ressources.cartouches.items.push({
                    grilleId: cle.replace('cartouches_', ''),
                    count: cartouches.length
                });
                result.ressources.cartouches.count += cartouches.length;
            }
        }
    });

    // ========== DONNÉES DU COURS ==========

    // Étudiants (clés: groupeEtudiants, *_groupeEtudiants)
    Object.keys(config).forEach(cle => {
        if (cle === 'groupeEtudiants' || cle.endsWith('_groupeEtudiants')) {
            const etudiants = parseValeur(config[cle]);
            if (Array.isArray(etudiants) && etudiants.length > 0) {
                result.donnees.etudiants.cles.push(cle);
                result.donnees.etudiants.count += etudiants.length;
            }
        }
    });

    // Présences (clés: presences, *_presences)
    Object.keys(config).forEach(cle => {
        if (cle === 'presences' || cle.endsWith('_presences')) {
            const presences = parseValeur(config[cle]);
            if (presences && typeof presences === 'object') {
                const nbDates = Object.keys(presences).length;
                if (nbDates > 0) {
                    result.donnees.presences.cles.push(cle);
                    result.donnees.presences.count += nbDates;
                }
            }
        }
    });

    // Évaluations/Notes (clés: evaluations, evaluationsSauvegardees, notesEtudiants + namespacées)
    Object.keys(config).forEach(cle => {
        if (cle === 'evaluations' || cle.endsWith('_evaluations') ||
            cle === 'evaluationsSauvegardees' || cle.endsWith('_evaluationsSauvegardees') ||
            cle === 'notesEtudiants' || cle.endsWith('_notesEtudiants')) {
            const data = parseValeur(config[cle]);
            if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                result.donnees.evaluations.cles.push(cle);
                result.donnees.evaluations.count++;
            }
        }
    });

    // Configuration (modalitesEvaluation, infoCours, listeCours, trimestres)
    ['modalitesEvaluation', 'infoCours', 'listeCours', 'trimestres'].forEach(cle => {
        if (config[cle]) {
            result.donnees.configuration.cles.push(cle);
            result.donnees.configuration.present = true;
        }
    });

    // 🆕 Beta 96.2 : Entités structurelles

    // Groupe-cours (clés: *_groupesCours)
    Object.keys(config).forEach(cle => {
        if (cle.endsWith('_groupesCours')) {
            const groupesCours = parseValeur(config[cle]);
            if (Array.isArray(groupesCours) && groupesCours.length > 0) {
                result.entites.groupesCours.cles.push(cle);
                result.entites.groupesCours.count += groupesCours.length;
            }
        }
    });

    // Horaires (clés: *_horaires)
    Object.keys(config).forEach(cle => {
        if (cle.endsWith('_horaires')) {
            const horaires = parseValeur(config[cle]);
            if (Array.isArray(horaires) && horaires.length > 0) {
                result.entites.horaires.cles.push(cle);
                result.entites.horaires.count += horaires.length;
            }
        }
    });

    // Enseignants (clé globale)
    if (config.enseignants) {
        const enseignants = parseValeur(config.enseignants);
        if (Array.isArray(enseignants) && enseignants.length > 0) {
            result.entites.enseignants.count = enseignants.length;
            result.entites.enseignants.present = true;
        }
    }

    // #380 : Cadre calendrier (clés nues ou namespacées) — recensé pour la
    // case à cocher dédiée de la modale (import sur consentement seulement)
    Object.keys(config).forEach(cle => {
        if (estCleCalendrierImport(cle)) {
            const dataCal = parseValeur(config[cle]);
            if (dataCal && (Array.isArray(dataCal) ? dataCal.length > 0 : Object.keys(dataCal).length > 0)) {
                result.entites.calendrier.cles.push(cle);
                result.entites.calendrier.count++;
            }
        }
    });

    // Fichiers travaux (clés: *fichiersTravaux)
    Object.keys(config).forEach(cle => {
        if (cle.includes('fichiersTravaux')) {
            const fichiers = parseValeur(config[cle]);
            if (Array.isArray(fichiers) && fichiers.length > 0) {
                result.fichiersTravaux.cles.push(cle);
                result.fichiersTravaux.count += fichiers.length;
            }
        }
    });
    // Annotations travaux (clés: *annotationsTravaux)
    Object.keys(config).forEach(cle => {
        if (cle.includes('annotationsTravaux')) {
            var annotations = parseValeur(config[cle]);
            if (Array.isArray(annotations) && annotations.length > 0) {
                result.annotationsTravaux.cles.push(cle);
                result.annotationsTravaux.count += annotations.length;
            }
        }
    });

    // Compter les blobs dans le ZIP si présent
    if (config._zipTravaux) {
        try {
            var travauxFolder = config._zipTravaux.folder('travaux');
            if (travauxFolder) {
                var nbBlobs = 0;
                travauxFolder.forEach(function() { nbBlobs++; });
                result.fichiersTravaux.nbBlobsZip = nbBlobs;
            }
        } catch (e) { console.warn('[Import-Export] ZIP travaux blob count skipped:', e.message || e); }
    }

    // Totaux
    result.totalRessources = result.ressources.pratiques.count +
                             result.ressources.grilles.count +
                             result.ressources.echelles.count +
                             result.ressources.productions.count +
                             result.ressources.cartouches.count;

    result.totalDonnees = result.donnees.etudiants.count +
                          result.donnees.presences.count +
                          (result.donnees.evaluations.count > 0 ? 1 : 0) +
                          (result.donnees.configuration.present ? 1 : 0);

    return result;
}

/**
 * Version simplifiée pour rétrocompatibilité (retourne juste les comptes)
 */
function analyserRessourcesBibliotheques(config) {
    const details = analyserRessourcesDetaillees(config);
    return {
        pratiques: details.pratiques.count,
        grilles: details.grilles.count,
        echelles: details.echelles.count,
        productions: details.productions.count,
        total: details.total
    };
}

/**
 * Affiche le modal de prévisualisation de la configuration
 * @param {Object} config - Configuration complète à prévisualiser
 */
function afficherModalPreviewConfigComplete(config) {
    const meta = config.metadata;
    const contenu = config.contenu;

    // Compter les ressources
    const nbEchelles = contenu.echelles ? contenu.echelles.length : 0;
    const nbGrilles = contenu.grilles ? contenu.grilles.length : 0;
    const nbProductions = contenu.productions ? contenu.productions.length : 0;
    const nbCartouches = contenu.cartouches
        ? Object.keys(contenu.cartouches).reduce((total, grilleId) => {
            return total + (contenu.cartouches[grilleId] ? contenu.cartouches[grilleId].length : 0);
          }, 0)
        : 0;
    const totalRessources = nbEchelles + nbGrilles + nbProductions + nbCartouches;

    // Créer le modal
    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: var(--surface-conteneur, #162c36); border-radius: 10px; padding: 30px; max-width: 600px;
                 width: 90%; max-height: 85vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--texte-secondaire); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Fichier analysé
                </h2>

                <!-- Type détecté -->
                <div style="background: var(--alerte-fond-succes, #e8f5e9); border: 1px solid var(--vert-succes); border-radius: 8px;
                     padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="icons/icons8-library-2.svg" alt="" style="width: 32px; height: 32px;">
                        <div>
                            <strong style="color: var(--vert-succes); font-size: 1.1rem;">Configuration pédagogique partagée</strong>
                            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: var(--gris-moyen);">
                                Ce fichier contient des ressources pédagogiques prêtes à utiliser.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Infos auteur -->
                <div style="background: var(--bleu-tres-pale); border-radius: 8px;
                     padding: 15px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.05rem; color: var(--texte-secondaire);">
                        ${echapperHtml(meta.nom || '')}
                    </h3>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--gris-moyen);">
                        Par <strong>${echapperHtml(meta.auteur || '')}</strong>
                        ${Array.isArray(meta.discipline) && meta.discipline.length > 0 ? ` · ${echapperHtml(meta.discipline.join(', '))}` : ''}
                        ${meta.niveau ? ` · ${echapperHtml(meta.niveau)}` : ''}
                    </p>
                    ${meta.description
                        ? `<p style="margin: 10px 0 0 0; font-size: 0.9rem; font-style: italic; color: var(--gris-moyen);">${echapperHtml(meta.description)}</p>`
                        : ''}
                </div>

                <!-- Contenu -->
                <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 0.95rem; font-weight: 500;">
                        Ressources incluses (${totalRessources}) :
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.9rem;">
                        ${nbEchelles > 0 ? `<span style="background: var(--surface-conteneur, #162c36); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--bordure-claire);"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>${nbEchelles} échelle(s)</span>` : ''}
                        ${nbGrilles > 0 ? `<span style="background: var(--surface-conteneur, #162c36); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--bordure-claire);"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>${nbGrilles} grille(s)</span>` : ''}
                        ${nbProductions > 0 ? `<span style="background: var(--surface-conteneur, #162c36); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--bordure-claire);"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>${nbProductions} production(s)</span>` : ''}
                        ${nbCartouches > 0 ? `<span style="background: var(--surface-conteneur, #162c36); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--bordure-claire);"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>${nbCartouches} cartouche(s)</span>` : ''}
                    </div>
                </div>

                <!-- Info CC -->
                <div style="background: var(--bleu-pale); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--bleu-clair);">
                        Licence <strong>CC BY-NC-SA 4.0</strong> — Tu peux utiliser et adapter ces ressources
                        en citant l'auteur.
                    </p>
                </div>

                <!-- Boutons -->
                <div class="modal-actions">
                    <button class="btn btn-secondaire" data-action="fermerModalPreviewConfigComplete">
                        Annuler
                    </button>
                    <button class="btn btn-principal" data-action="executerImportConfigComplete">
                        Ajouter à mes bibliothèques
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * Ferme le modal de prévisualisation
 */
function fermerModalPreviewConfigComplete() {
    const modal = document.getElementById('modalPreviewConfigComplete');
    if (modal) {
        modal.parentElement.remove();
    }
    configCompleteEnAttente = null;
}

/**
 * Exécute l'import de la configuration complète avec gestion des conflits d'ID
 * Supporte deux formats : configuration-complete (Beta 91+) et localStorage-brut
 */
async function executerImportConfigComplete() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // 🆕 BETA 95.1 : Gérer les deux formats
    if (config._format === 'localStorage-brut') {
        await executerImportLocalStorageBrut(config);
        return;
    }

    // Format configuration-complete (Beta 91+)
    const contenu = config.contenu;

    // Défense H — vérifier les sceaux SHA-256 des ressources reçues AVANT
    // tout traitement. Le sceau a été calculé par l'auteur sur le contenu
    // canonicalisé ; toute altération en transit (même un caractère) est
    // détectée. N'altère pas le flux d'import : on accumule les anomalies
    // pour les remonter à l'utilisateur en fin d'import.
    let resumeSceauGlobal = null;
    if (window.SecuriteHash && typeof window.SecuriteHash.verifierLot === 'function') {
        resumeSceauGlobal = { valide: 0, altere: 0, sansSceau: 0, indisponible: 0, total: 0, alteres: [] };
        const lots = [];
        if (Array.isArray(contenu.echelles)) lots.push({ libelle: 'échelles', items: contenu.echelles });
        if (Array.isArray(contenu.grilles)) lots.push({ libelle: 'grilles', items: contenu.grilles });
        if (Array.isArray(contenu.productions)) lots.push({ libelle: 'productions', items: contenu.productions });
        if (contenu.cartouches && typeof contenu.cartouches === 'object') {
            const grilleIdsC = Object.keys(contenu.cartouches);
            for (let gi = 0; gi < grilleIdsC.length; gi++) {
                const arr = contenu.cartouches[grilleIdsC[gi]];
                if (Array.isArray(arr)) lots.push({ libelle: 'cartouches', items: arr });
            }
        }
        for (let li = 0; li < lots.length; li++) {
            const r = await window.SecuriteHash.verifierLot(lots[li].items);
            resumeSceauGlobal.valide += r.valide;
            resumeSceauGlobal.altere += r.altere;
            resumeSceauGlobal.sansSceau += r.sansSceau;
            resumeSceauGlobal.indisponible += r.indisponible;
            resumeSceauGlobal.total += r.total;
            for (let ai = 0; ai < r.alteres.length; ai++) {
                resumeSceauGlobal.alteres.push({
                    type: lots[li].libelle,
                    index: r.alteres[ai].index,
                    hashAttendu: r.alteres[ai].hashAttendu,
                    hashCalcule: r.alteres[ai].hashCalcule
                });
            }
        }
        if (resumeSceauGlobal.altere > 0) {
            console.warn('[Sécurité H] ' + resumeSceauGlobal.altere + ' ressource(s) avec sceau invalide :', resumeSceauGlobal.alteres);
        }
    }

    try {
        // Table de remapping: oldId → newId
        const remapEchelles = {};
        const remapGrilles = {};

        // Récupérer les ressources existantes
        const echellesExistantes = db.getSync(cle('echellesTemplates'), []);
        const grillesExistantes = db.getSync(cle('grillesTemplates'), []);

        // Créer des Sets d'IDs existants pour recherche rapide
        const idsEchellesExistants = new Set(echellesExistantes.map(e => e.id));
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));

        // 1. Importer les échelles avec détection de conflits
        if (contenu.echelles && contenu.echelles.length > 0) {
            const echellesAImporter = contenu.echelles.map(echelle => {
                // Vérifier si l'ID existe déjà
                if (idsEchellesExistants.has(echelle.id)) {
                    // Conflit détecté: générer un nouvel ID
                    const ancienId = echelle.id;
                    const nouvelId = genererIdUnique('ECH_');

                    // Enregistrer le remapping
                    remapEchelles[ancienId] = nouvelId;


                    // Retourner échelle avec nouvel ID
                    return { ...echelle, id: nouvelId };
                }
                // Pas de conflit, retourner tel quel
                return echelle;
            });

            // Fusionner avec échelles existantes
            const echellesFusionnees = verifierUniciteIds([...echellesExistantes, ...echellesAImporter], 'échelles');
            db.setSync(cle('echellesTemplates'), echellesFusionnees);
        }

        // 2. Importer les grilles avec détection de conflits
        if (contenu.grilles && contenu.grilles.length > 0) {
            const grillesAImporter = contenu.grilles.map(grille => {
                // Vérifier si l'ID existe déjà
                if (idsGrillesExistants.has(grille.id)) {
                    // Conflit détecté: générer un nouvel ID
                    const ancienId = grille.id;
                    const nouvelId = genererIdUnique('GRILLE_');

                    // Enregistrer le remapping
                    remapGrilles[ancienId] = nouvelId;


                    // Retourner grille avec nouvel ID
                    return { ...grille, id: nouvelId };
                }
                // Pas de conflit, retourner tel quel
                return grille;
            });

            // Fusionner avec grilles existantes
            const grillesFusionnees = verifierUniciteIds([...grillesExistantes, ...grillesAImporter], 'grilles');
            db.setSync(cle('grillesTemplates'), grillesFusionnees);
        }

        // 3. Importer les productions avec mise à jour des références aux grilles
        // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
        if (contenu.productions && contenu.productions.length > 0) {
            const cleProductions = cle('productions');
            const productionsExistantes = db.getSync(cleProductions, []);

            const idsProdsExistants = new Set(productionsExistantes.map(p => p.id));

            const productionsAImporter = contenu.productions.map(production => {
                // Créer une copie de la production
                const prod = { ...production };

                // Générer un nouvel ID SEULEMENT si conflit d'ID
                if (idsProdsExistants.has(prod.id)) {
                    const ancienId = prod.id;
                    prod.id = genererIdUnique('PROD_');
                }
                // Sinon, garder l'ID original pour préserver les références

                // Mettre à jour la référence à la grille si elle a été remappée
                if (prod.grilleId && remapGrilles[prod.grilleId]) {
                    prod.grilleId = remapGrilles[prod.grilleId];
                }

                // Mettre à jour la référence à l'échelle si elle a été remappée
                if (prod.echelleId && remapEchelles[prod.echelleId]) {
                    prod.echelleId = remapEchelles[prod.echelleId];
                }

                return prod;
            });

            // Fusionner avec productions existantes
            const productionsFusionnees = verifierUniciteIds([...productionsExistantes, ...productionsAImporter], 'productions');
            db.setSync(cleProductions, productionsFusionnees);
        }

        // 4. Importer les cartouches avec mise à jour des clés (grilleId)
        if (contenu.cartouches) {
            let nbCartouchesTotal = 0;

            Object.keys(contenu.cartouches).forEach(ancienGrilleId => {
                const cartouchesGrille = contenu.cartouches[ancienGrilleId];
                if (!cartouchesGrille || cartouchesGrille.length === 0) return;

                // Déterminer la bonne clé à utiliser (remappée ou originale)
                const grilleIdFinal = remapGrilles[ancienGrilleId] || ancienGrilleId;

                if (remapGrilles[ancienGrilleId]) {
                }

                // Récupérer les cartouches existantes pour cette grille
                const cartouchesExistantes = db.getSync(`cartouches_${grilleIdFinal}`, []);

                // Sanitiser chaque cartouche reçu avant fusion. Les commentaires
                // (clés dynamiques `<critereId>_<niveauCode>`) sont assainis via
                // le type `mapStrings`. Voir MODELE-MENACES.md §3.1.bis (D-01).
                const cartouchesAssainis = cartouchesGrille.map(c => assainirObjet(c, SCHEMAS_IMPORT.cartouche));

                // Fusionner (ajouter les nouvelles cartouches)
                const cartouchesFusionnees = verifierUniciteIds([...cartouchesExistantes, ...cartouchesAssainis], 'cartouches');
                db.setSync(`cartouches_${grilleIdFinal}`, cartouchesFusionnees);

                nbCartouchesTotal += cartouchesAssainis.length;
            });

        }

        // 5. Importer les paramètres du cours (fusion avec paramètres existants)
        if (contenu.parametres) {
            // Écriture via le module propriétaire (SSOT #328 Lot 1)
            window.modalitesEvaluation.modifier(function (m) {
                m.systemeJetons = contenu.parametres.systeme_jetons;
                m.reprisesAutorisees = contenu.parametres.reprises_autorisees;
                m.nombreArtefacts = contenu.parametres.nombre_artefacts;
                m.pratiqueActive = contenu.parametres.pratique_active;
                // Session C (#303) : modeComparatif retiré (mode comparatif supprimé).
            });
        }

        // Afficher résumé des remappages si nécessaire
        const nbRemapEchelles = Object.keys(remapEchelles).length;
        const nbRemapGrilles = Object.keys(remapGrilles).length;

        if (nbRemapEchelles > 0 || nbRemapGrilles > 0) {
            if (nbRemapEchelles > 0) {
            }
            if (nbRemapGrilles > 0) {
            }
        }

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Notification de succès
        let messageSucces = `Configuration «${config.metadata.nom}» importée avec succès!`;
        if (nbRemapEchelles > 0 || nbRemapGrilles > 0) {
            messageSucces += `\n\n${nbRemapEchelles + nbRemapGrilles} conflit(s) d'ID résolu(s) automatiquement.`;
        }

        // Défense H — message d'alerte si des sceaux ont échoué.
        if (resumeSceauGlobal && resumeSceauGlobal.altere > 0) {
            messageSucces += `\n\n${resumeSceauGlobal.altere} ressource(s) avec sceau invalide ` +
                             `(modifiée(s) après l'export). Vérifie le contenu avant utilisation.`;
        } else if (resumeSceauGlobal && resumeSceauGlobal.valide > 0 && resumeSceauGlobal.altere === 0) {
            const tauxValide = Math.round((resumeSceauGlobal.valide / resumeSceauGlobal.total) * 100);
            if (tauxValide === 100) {
                messageSucces += `\n\nSceaux SHA-256 valides sur les ${resumeSceauGlobal.total} ressources vérifiables.`;
            } else {
                messageSucces += `\n\n${resumeSceauGlobal.valide}/${resumeSceauGlobal.total} ressources avec sceau valide ` +
                                 `(${resumeSceauGlobal.sansSceau} sans sceau, export antérieur à Défense H).`;
            }
        }

        notifications.succes(messageSucces);

        // Proposer de recharger la page
        // Écritures IDB pendantes terminées AVANT le reload (bug terrain
        // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
        await db.flush();
        if (confirm('Import terminé!\n\nRecharger la page pour appliquer les changements?')) {
            location.reload();
        }

    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import de la configuration:', erreur);
        alert('Erreur lors de l\'import de la configuration.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Exécute l'import d'un export localStorage brut
 * Réutilise la logique de executerImport() mais via le modal unifié
 * @param {Object} config - Données brutes localStorage
 */
async function executerImportLocalStorageBrut(config) {
    // Retirer les propriétés internes avant import
    const donnees = { ...config };
    const zipTravaux = donnees._zipTravaux;
    delete donnees._format;
    delete donnees._zipTravaux;

    try {
        const cles = Object.keys(donnees);
        let nbCles = 0;

        for (const cle of cles) {
            let valeur = donnees[cle];

            // Parser les strings JSON (backups de l'ancienne version localStorage)
            if (typeof valeur === 'string') {
                try {
                    valeur = JSON.parse(valeur);
                } catch (e) {
                    // Garder comme string si ce n'est pas du JSON valide
                }
            }

            // Utiliser db.set (async/IndexedDB)
            await db.set(cle, valeur);
            nbCles++;
        }

        // Synchroniser le cache localStorage avec IndexedDB
        if (typeof db.syncToLocalStorageCache === 'function') {
            await db.syncToLocalStorageCache();
        }

        // 🆕 Restauration des blobs travaux depuis le ZIP
        const nbRestores = await _restaurerBlobsDepuisZip({ ...donnees, _zipTravaux: zipTravaux });

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        const msgBlobs = nbRestores > 0 ? ` + ${nbRestores} fichier(s) travaux` : '';

        // Notification et rechargement
        alert(`Import réussi !\n\n${nbCles} clé(s) de données importée(s)${msgBlobs}.`);

        // Écritures IDB pendantes terminées AVANT le reload (bug terrain
        // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
        await db.flush();
        if (confirm('Recharger la page pour appliquer les changements ?')) {
            location.reload();
        }

    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import localStorage brut:', erreur);
        alert('Erreur lors de l\'import.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Import fusionné vers les bibliothèques
 * Extrait uniquement les ressources (pratiques, grilles, échelles, productions)
 * et les ajoute aux bibliothèques existantes SANS écraser les données du cours
 */
async function executerImportVersBibliotheques() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // Retirer la propriété interne _format
    const donnees = { ...config };
    delete donnees._format;

    // Helper pour parser les valeurs JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    try {
        let compteurs = { pratiques: 0, grilles: 0, echelles: 0, productions: 0 };

        // 1. PRATIQUES CONFIGURABLES
        if (donnees.pratiquesConfigurables) {
            const pratiquesImport = parseValeur(donnees.pratiquesConfigurables);
            if (Array.isArray(pratiquesImport) && pratiquesImport.length > 0) {
                const pratiquesExistantes = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
                const idsPratiquesExistants = new Set(pratiquesExistantes.map(p => p.id));

                // 🆕 FIX (31 jan 2026) : Préserver les IDs originaux pour maintenir les références
                const pratiquesNouvelles = pratiquesImport.filter(p => {
                    // Éviter les doublons par ID seulement (pas par nom - l'ID est la référence unique)
                    if (idsPratiquesExistants.has(p.id)) return false;
                    return true;
                }).map(p => ({
                    ...p,
                    // IMPORTANT: Garder l'ID original pour préserver les références (groupe-cours, etc.)
                    dateImport: new Date().toISOString()
                }));

                if (pratiquesNouvelles.length > 0) {
                    const pratiquesFusionnees = verifierUniciteIds([...pratiquesExistantes, ...pratiquesNouvelles], 'pratiques');
                    db.setSync(cle('pratiquesConfigurables'), pratiquesFusionnees);
                    compteurs.pratiques = pratiquesNouvelles.length;
                }
            }
        }

        // 2. GRILLES (depuis grillesTemplates et bibliothequeGrilles)
        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        let grillesExistantes = db.getSync(cle('grillesTemplates'), []);
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        let grillesNouvelles = [];

        // Collecter toutes les grilles à importer
        let toutesGrillesImport = [];
        if (donnees.grillesTemplates) {
            const grillesImport = parseValeur(donnees.grillesTemplates);
            if (Array.isArray(grillesImport)) {
                toutesGrillesImport = toutesGrillesImport.concat(grillesImport);
            }
        }
        if (donnees.bibliothequeGrilles) {
            const grillesImport = parseValeur(donnees.bibliothequeGrilles);
            if (Array.isArray(grillesImport)) {
                toutesGrillesImport = toutesGrillesImport.concat(grillesImport);
            }
        }

        // Traiter chaque grille avec gestion des doublons
        for (const g of toutesGrillesImport) {
            // Vérifier si déjà dans la liste des nouvelles
            if (grillesNouvelles.some(gn => gn.nom === g.nom)) continue;

            // Vérifier doublon par ID ou nom
            const existeParId = idsGrillesExistants.has(g.id);
            const existeParNom = grillesExistantes.some(ge => ge.nom === g.nom);

            if (!existeParId && !existeParNom) {
                // Pas de doublon - ajouter directement avec ID original
                grillesNouvelles.push({
                    ...g,
                    // IMPORTANT: Garder l'ID original pour préserver les références
                    dateImport: new Date().toISOString()
                });
            } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                // Doublon détecté - demander à l'utilisateur
                const resultat = await afficherModalDoublon('grille', g.nom, { estImport: true });

                if (resultat && resultat.action === 'renommer') {
                    grillesNouvelles.push({
                        ...g,
                        nom: resultat.nouveauNom,
                        // Garder l'ID original sauf si conflit d'ID
                        ...(existeParId ? { id: genererIdUnique('GRILLE_') } : {}),
                        dateImport: new Date().toISOString()
                    });
                } else if (resultat && resultat.action === 'ecraser') {
                    // Supprimer l'existante et ajouter la nouvelle
                    grillesExistantes = grillesExistantes.filter(ge => ge.nom !== g.nom);
                    grillesNouvelles.push({
                        ...g,
                        // Garder l'ID original sauf si conflit d'ID
                        ...(existeParId ? { id: genererIdUnique('GRILLE_') } : {}),
                        dateImport: new Date().toISOString()
                    });
                }
                // Si ignorer ou annuler, on ne fait rien
            }
        }

        if (grillesNouvelles.length > 0 || grillesExistantes.length !== db.getSync(cle('grillesTemplates'), []).length) {
            const grillesFusionnees = verifierUniciteIds([...grillesExistantes, ...grillesNouvelles], 'grilles');
            db.setSync(cle('grillesTemplates'), grillesFusionnees);
            compteurs.grilles = grillesNouvelles.length;
        }

        // 3. ÉCHELLES
        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        if (donnees.echellesTemplates) {
            const echellesImport = parseValeur(donnees.echellesTemplates);
            if (Array.isArray(echellesImport) && echellesImport.length > 0) {
                let echellesExistantes = db.getSync(cle('echellesTemplates'), []);
                const idsEchellesExistants = new Set(echellesExistantes.map(e => e.id));
                let echellesNouvelles = [];

                for (const e of echellesImport) {
                    const existeParId = idsEchellesExistants.has(e.id);
                    const existeParNom = echellesExistantes.some(ee => ee.nom === e.nom);

                    if (!existeParId && !existeParNom && !echellesNouvelles.some(en => en.nom === e.nom)) {
                        echellesNouvelles.push({
                            ...e,
                            // IMPORTANT: Garder l'ID original pour préserver les références
                            dateImport: new Date().toISOString()
                        });
                    } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                        const resultat = await afficherModalDoublon('echelle', e.nom, { estImport: true });

                        if (resultat && resultat.action === 'renommer') {
                            echellesNouvelles.push({
                                ...e,
                                nom: resultat.nouveauNom,
                                // Garder l'ID original sauf si conflit d'ID
                                ...(existeParId ? { id: genererIdUnique('ECH_') } : {}),
                                dateImport: new Date().toISOString()
                            });
                        } else if (resultat && resultat.action === 'ecraser') {
                            echellesExistantes = echellesExistantes.filter(ee => ee.nom !== e.nom);
                            echellesNouvelles.push({
                                ...e,
                                // Garder l'ID original sauf si conflit d'ID
                                ...(existeParId ? { id: genererIdUnique('ECH_') } : {}),
                                dateImport: new Date().toISOString()
                            });
                        }
                    }
                }

                if (echellesNouvelles.length > 0 || echellesExistantes.length !== db.getSync(cle('echellesTemplates'), []).length) {
                    const echellesFusionnees = verifierUniciteIds([...echellesExistantes, ...echellesNouvelles], 'échelles');
                    db.setSync(cle('echellesTemplates'), echellesFusionnees);
                    compteurs.echelles = echellesNouvelles.length;
                }
            }
        }

        // 4. PRODUCTIONS (depuis bibliothequeProductions, productions, ET *_productions)
        // 🆕 FIX (1er fév 2026) : Support clés namespacées *_productions
        let clesProdsVersBibl = [];
        let allProdsVersBibl = [];

        // 1. Clé legacy bibliothequeProductions
        if (donnees.bibliothequeProductions) {
            const prodsTest = parseValeur(donnees.bibliothequeProductions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                clesProdsVersBibl.push('bibliothequeProductions');
                allProdsVersBibl = allProdsVersBibl.concat(prodsTest);
            }
        }

        // 2. Clés productions et *_productions (namespacées)
        Object.keys(donnees).forEach(cle => {
            if (cle === 'productions' || cle.endsWith('_productions')) {
                const prods = parseValeur(donnees[cle]);
                if (Array.isArray(prods) && prods.length > 0) {
                    clesProdsVersBibl.push(cle);
                    allProdsVersBibl = allProdsVersBibl.concat(prods);
                }
            }
        });

        // Dédupliquer par ID
        const prodsImportUniques = [];
        const idsProdsVus = new Set();
        allProdsVersBibl.forEach(p => {
            if (p.id && !idsProdsVus.has(p.id)) {
                idsProdsVus.add(p.id);
                prodsImportUniques.push(p);
            }
        });

        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        if (prodsImportUniques.length > 0) {
            const prodsImport = prodsImportUniques;
            if (Array.isArray(prodsImport) && prodsImport.length > 0) {
                const cleProductions = cle('productions');
                let prodsExistantes = db.getSync(cleProductions, []);
                const idsProdsExistants = new Set(prodsExistantes.map(p => p.id));
                let prodsNouvelles = [];

                // Productions utilisent 'titre' comme nom
                const getNomProd = (p) => p.titre || p.nom || '';

                for (const p of prodsImport) {
                    const nomProd = getNomProd(p);
                    const existeParId = idsProdsExistants.has(p.id);
                    const existeParNom = prodsExistantes.some(pe => getNomProd(pe) === nomProd);

                    if (!existeParId && !existeParNom && !prodsNouvelles.some(pn => getNomProd(pn) === nomProd)) {
                        prodsNouvelles.push({
                            ...p,
                            // IMPORTANT: Garder l'ID original pour préserver les références
                            dateImport: new Date().toISOString()
                        });
                    } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                        const resultat = await afficherModalDoublon('production', nomProd, { estImport: true });

                        if (resultat && resultat.action === 'renommer') {
                            prodsNouvelles.push({
                                ...p,
                                titre: resultat.nouveauNom,
                                // Garder l'ID original sauf si conflit d'ID
                                ...(existeParId ? { id: genererIdUnique('PROD_') } : {}),
                                dateImport: new Date().toISOString()
                            });
                        } else if (resultat && resultat.action === 'ecraser') {
                            prodsExistantes = prodsExistantes.filter(pe => getNomProd(pe) !== nomProd);
                            prodsNouvelles.push({
                                ...p,
                                // Garder l'ID original sauf si conflit d'ID
                                ...(existeParId ? { id: genererIdUnique('PROD_') } : {}),
                                dateImport: new Date().toISOString()
                            });
                        }
                    }
                }

                if (prodsNouvelles.length > 0 || prodsExistantes.length !== db.getSync(cleProductions, []).length) {
                    const prodsFusionnees = verifierUniciteIds([...prodsExistantes, ...prodsNouvelles], 'productions');
                    db.setSync(cleProductions, prodsFusionnees);
                    compteurs.productions = prodsNouvelles.length;
                }
            }
        }

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Message de résumé
        const total = compteurs.pratiques + compteurs.grilles + compteurs.echelles + compteurs.productions;

        if (total === 0) {
            alert('Aucune nouvelle ressource à ajouter.\n\nToutes les ressources du fichier existent déjà dans tes bibliothèques.');
        } else {
            let details = [];
            if (compteurs.pratiques > 0) details.push(`${compteurs.pratiques} pratique(s)`);
            if (compteurs.grilles > 0) details.push(`${compteurs.grilles} grille(s)`);
            if (compteurs.echelles > 0) details.push(`${compteurs.echelles} échelle(s)`);
            if (compteurs.productions > 0) details.push(`${compteurs.productions} production(s)`);

            const message = `Fusion réussie !\n\n${details.join(', ')} ajoutée(s) à tes bibliothèques.\n\nTes données existantes ont été préservées.`;

            notifications.succes(message);
            alert(message);

            // Écritures IDB pendantes terminées AVANT le reload (bug terrain
            // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
            await db.flush();
            if (confirm('Recharger la page pour voir les nouvelles ressources ?')) {
                location.reload();
            }
        }


    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import vers bibliothèques:', erreur);
        alert('Erreur lors de la fusion.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Import sélectif basé sur les checkboxes
 * ✅ MODIFIÉ (6 jan 2026) : Support des checkboxes individuelles par élément
 * Importe uniquement les éléments cochés par l'utilisateur
 */
async function executerImportSelectif() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // Retirer la propriété interne _format
    const donnees = { ...config };
    delete donnees._format;

    // Helper pour parser les valeurs JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    // ✅ NOUVEAU : Récupérer les IDs des items cochés individuellement par catégorie
    const getCheckedItemIds = (category) => {
        const checkboxes = document.querySelectorAll(`.import-item-${category}:checked`);
        return Array.from(checkboxes).map(cb => cb.dataset.itemId);
    };

    // Vérifier si au moins un item est coché dans une catégorie (checkboxes individuelles)
    const hasCheckedItems = (category) => {
        return document.querySelectorAll(`.import-item-${category}:checked`).length > 0;
    };

    // Pour les données du cours (étudiants, présences, etc.) - ancien comportement
    const isChecked = (id) => {
        const cb = document.getElementById(`import-${id}`);
        return cb && cb.checked;
    };

    try {
        let compteurs = { ressources: 0, donnees: 0 };
        let details = [];

        // Auteur source pour marquage des imports
        const auteurSource = analyseImportEnCours?.auteurImport || '';

        // ========== RESSOURCES PÉDAGOGIQUES (fusion avec sélection individuelle) ==========

        // Pratiques - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('pratiques') && donnees.pratiquesConfigurables) {
            const pratiquesImport = parseValeur(donnees.pratiquesConfigurables);
            const selectedIds = getCheckedItemIds('pratiques');

            if (Array.isArray(pratiquesImport) && pratiquesImport.length > 0) {
                const pratiquesExistantes = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
                const idsPratiquesExistants = new Set(pratiquesExistantes.map(p => p.id));
                // 🆕 FIX (31 jan 2026) : Filtrer par ID (pas par nom) pour préserver les références
                const pratiquesNouvelles = pratiquesImport
                    .filter(p => selectedIds.includes(p.id) || selectedIds.includes(p.nom))
                    .filter(p => !idsPratiquesExistants.has(p.id)) // Éviter doublons par ID uniquement
                    .map(p => ({
                        ...assainirObjet(p, SCHEMAS_IMPORT.pratique),
                        // IMPORTANT: Garder l'ID original pour préserver les références
                        dateImport: new Date().toISOString(),
                        auteurOriginal: assainirChaine(auteurSource || p.auteurOriginal || '', 100)
                    }));
                if (pratiquesNouvelles.length > 0) {
                    db.setSync(cle('pratiquesConfigurables'), verifierUniciteIds([...pratiquesExistantes, ...pratiquesNouvelles], 'pratiques'));
                    compteurs.ressources += pratiquesNouvelles.length;
                    details.push(`${pratiquesNouvelles.length} pratique(s)`);
                }
            }
        }

        // Grilles - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('grilles')) {
            const grillesExistantes = db.getSync(cle('grillesTemplates'), []);
            const selectedIds = getCheckedItemIds('grilles');
            let grillesNouvelles = [];

            ['grillesTemplates', 'bibliothequeGrilles'].forEach(cle => {
                if (donnees[cle]) {
                    const grillesImport = parseValeur(donnees[cle]);
                    if (Array.isArray(grillesImport)) {
                        grillesImport.forEach(g => {
                            // Vérifier si cet item est sélectionné
                            const estSelectionne = selectedIds.includes(g.id) || selectedIds.includes(g.nom);
                            if (estSelectionne &&
                                !grillesExistantes.some(ge => ge.nom === g.nom) &&
                                !grillesNouvelles.some(gn => gn.nom === g.nom)) {
                                // Vérifier si l'ID existe déjà
                                const idExiste = grillesExistantes.some(ge => ge.id === g.id);
                                grillesNouvelles.push({
                                    ...assainirObjet(g, SCHEMAS_IMPORT.grille),
                                    // Garder l'ID original sauf si conflit d'ID
                                    ...(idExiste ? { id: genererIdUnique('GRILLE_') } : {}),
                                    dateImport: new Date().toISOString(),
                                    auteurOriginal: assainirChaine(auteurSource || g.auteurOriginal || '', 100)
                                });
                            }
                        });
                    }
                }
            });

            if (grillesNouvelles.length > 0) {
                db.setSync(cle('grillesTemplates'), verifierUniciteIds([...grillesExistantes, ...grillesNouvelles], 'grilles'));
                compteurs.ressources += grillesNouvelles.length;
                details.push(`${grillesNouvelles.length} grille(s)`);
            }
        }

        // Échelles - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('echelles') && donnees.echellesTemplates) {
            const echellesImport = parseValeur(donnees.echellesTemplates);
            const selectedIds = getCheckedItemIds('echelles');

            if (Array.isArray(echellesImport) && echellesImport.length > 0) {
                const echellesExistantes = db.getSync(cle('echellesTemplates'), []);
                const echellesNouvelles = echellesImport
                    .filter(e => selectedIds.includes(e.id) || selectedIds.includes(e.nom))
                    .filter(e => !echellesExistantes.some(ee => ee.nom === e.nom))
                    .map(e => {
                        // Vérifier si l'ID existe déjà
                        const idExiste = echellesExistantes.some(ee => ee.id === e.id);
                        return {
                            ...assainirObjet(e, SCHEMAS_IMPORT.echelle),
                            // Garder l'ID original sauf si conflit d'ID
                            ...(idExiste ? { id: genererIdUnique('ECH_') } : {}),
                            dateImport: new Date().toISOString(),
                            auteurOriginal: assainirChaine(auteurSource || e.auteurOriginal || '', 100)
                        };
                    });
                if (echellesNouvelles.length > 0) {
                    db.setSync(cle('echellesTemplates'), verifierUniciteIds([...echellesExistantes, ...echellesNouvelles], 'échelles'));
                    compteurs.ressources += echellesNouvelles.length;
                    details.push(`${echellesNouvelles.length} échelle(s)`);
                }
            }
        }

        // Productions - ✅ MODIFIÉ pour import sélectif individuel
        // 🆕 FIX (1er fév 2026) : Support clés namespacées *_productions
        let clesProdsSource = [];
        let allProdsImport = [];

        // 1. Clé legacy bibliothequeProductions
        if (donnees.bibliothequeProductions) {
            const prodsTest = parseValeur(donnees.bibliothequeProductions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                clesProdsSource.push('bibliothequeProductions');
                allProdsImport = allProdsImport.concat(prodsTest);
            }
        }

        // 2. Clés productions et *_productions (namespacées)
        Object.keys(donnees).forEach(cle => {
            if (cle === 'productions' || cle.endsWith('_productions')) {
                const prods = parseValeur(donnees[cle]);
                if (Array.isArray(prods) && prods.length > 0) {
                    clesProdsSource.push(cle);
                    allProdsImport = allProdsImport.concat(prods);
                }
            }
        });

        if (hasCheckedItems('productions') && allProdsImport.length > 0) {
            const selectedIds = getCheckedItemIds('productions');
            const cleProductions = cle('productions');
            const prodsExistantes = db.getSync(cleProductions, []);

            // Dédupliquer par ID
            const prodsUniques = [];
            const idsVus = new Set();
            allProdsImport.forEach(p => {
                if (p.id && !idsVus.has(p.id)) {
                    idsVus.add(p.id);
                    prodsUniques.push(p);
                }
            });

            const prodsNouvelles = prodsUniques
                .filter(p => selectedIds.includes(p.id) || selectedIds.includes(p.nom) || selectedIds.includes(p.titre))
                .filter(p => !prodsExistantes.some(pe => (pe.nom && pe.nom === p.nom) || (pe.titre && pe.titre === p.titre)))
                .map(p => {
                    // Vérifier si l'ID existe déjà
                    const idExiste = prodsExistantes.some(pe => pe.id === p.id);
                    return {
                        ...assainirObjet(p, SCHEMAS_IMPORT.production),
                        // Garder l'ID original sauf si conflit d'ID
                        ...(idExiste ? { id: genererIdUnique('PROD_') } : {}),
                        dateImport: new Date().toISOString(),
                        auteurOriginal: assainirChaine(auteurSource || p.auteurOriginal || '', 100)
                    };
                });
            if (prodsNouvelles.length > 0) {
                db.setSync(cleProductions, verifierUniciteIds([...prodsExistantes, ...prodsNouvelles], 'productions'));
                compteurs.ressources += prodsNouvelles.length;
                details.push(`${prodsNouvelles.length} production(s)`);
            }
        }

        // Cartouches - #383 (audit 5 août, rapport A2) : la modale liste UNE ligne
        // par grille avec data-item-id = clé `cartouches_<grilleId>` — le filtre
        // se fait donc PAR CLÉ. L'ancien filtre comparait les ids AGRÉGÉS de la
        // modale (`cartouches_0`, `cartouches_1`…) aux ids INDIVIDUELS des
        // cartouches : aucune correspondance possible, cocher « Cartouches »
        // n'importait JAMAIS rien.
        if (hasCheckedItems('cartouches')) {
            const selectedIds = getCheckedItemIds('cartouches');
            let nbCartouches = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle.startsWith('cartouches_') && selectedIds.includes(cle)) {
                    const cartouches = parseValeur(donnees[cle]);
                    if (Array.isArray(cartouches) && cartouches.length > 0) {
                        const cartouchesExistantes = db.getSync(cle, []);
                        // Assainir via SCHEMAS_IMPORT.cartouche (descend dans
                        // criteres, niveaux, commentaires — MODELE-MENACES §3.1.bis).
                        const cartouchesSelectionnees = cartouches
                            .map(c => ({
                                ...assainirObjet(c, SCHEMAS_IMPORT.cartouche),
                                dateImport: new Date().toISOString(),
                                auteurOriginal: assainirChaine(auteurSource || c.auteurOriginal || '', 100)
                            }));
                        if (cartouchesSelectionnees.length > 0) {
                            const cartouchesFusionnees = verifierUniciteIds([...cartouchesExistantes, ...cartouchesSelectionnees], 'cartouches');
                            db.setSync(cle, cartouchesFusionnees);
                            nbCartouches += cartouchesSelectionnees.length;
                        }
                    }
                }
            });
            if (nbCartouches > 0) {
                compteurs.ressources += nbCartouches;
                details.push(`${nbCartouches} cartouche(s)`);
            }
        }

        // ========== DONNÉES DU COURS (écrasement) ==========
        // 🆕 Beta 96.2 : Bloquer import données perso SEULEMENT si collègue ou source vraiment inconnue
        // Permettre si : sauvegarde personnelle OU restauration sur nouvel appareil OU confirmation utilisateur
        const bloquerDonneesPerso = analyseImportEnCours &&
            (analyseImportEnCours.estCollègue ||
             (analyseImportEnCours.sourceInconnue && !analyseImportEnCours.restaurationNouvelAppareil && !analyseImportEnCours.confirmeMaSauvegarde));

        // Étudiants
        if (isChecked('etudiants') && !bloquerDonneesPerso) {
            let nbEtudiants = 0;
            for (var cleEtu of Object.keys(donnees)) {
                if (cleEtu === 'groupeEtudiants' || cleEtu.endsWith('_groupeEtudiants')) {
                    var etudiants = parseValeur(donnees[cleEtu]);
                    if (Array.isArray(etudiants)) {
                        await db.set(cleEtu, etudiants);
                        nbEtudiants += etudiants.length;
                    }
                }
            }
            if (nbEtudiants > 0) {
                compteurs.donnees++;
                details.push(`${nbEtudiants} étudiant(s)`);
            }
        }

        // Présences
        if (isChecked('presences') && !bloquerDonneesPerso) {
            let nbDates = 0;
            for (var clePres of Object.keys(donnees)) {
                if (clePres === 'presences' || clePres.endsWith('_presences')) {
                    var presences = parseValeur(donnees[clePres]);
                    if (presences && typeof presences === 'object') {
                        await db.set(clePres, presences);
                        nbDates += Object.keys(presences).length;
                    }
                }
            }
            if (nbDates > 0) {
                compteurs.donnees++;
                details.push(`${nbDates} date(s) de présences`);
            }
        }

        // Évaluations
        if (isChecked('evaluations') && !bloquerDonneesPerso) {
            let nbEvals = 0;
            for (var cleEval of Object.keys(donnees)) {
                if (cleEval === 'evaluations' || cleEval.endsWith('_evaluations') ||
                    cleEval === 'evaluationsSauvegardees' || cleEval.endsWith('_evaluationsSauvegardees') ||
                    cleEval === 'notesEtudiants' || cleEval.endsWith('_notesEtudiants')) {
                    var data = parseValeur(donnees[cleEval]);
                    if (data) {
                        await db.set(cleEval, data);
                        nbEvals += Array.isArray(data) ? data.length : 1;
                    }
                }
            }
            if (nbEvals > 0) {
                compteurs.donnees++;
                details.push('Évaluations/Notes');
            }
        }

        // Configuration
        if (isChecked('configuration')) {
            for (var cleConf of ['modalitesEvaluation', 'infoCours', 'listeCours', 'trimestres']) {
                if (donnees[cleConf]) {
                    await db.set(cleConf, parseValeur(donnees[cleConf]));
                }
            }
            compteurs.donnees++;
            details.push('Configuration du cours');
        }

        // 🆕 Beta 96.2 : Entités structurelles (groupe-cours, horaires, enseignants)

        // Groupe-cours (clés: *_groupesCours)
        if (isChecked('groupesCours')) {
            let nbGC = 0;
            for (var cleGC of Object.keys(donnees)) {
                if (cleGC.endsWith('_groupesCours')) {
                    var groupesCours = parseValeur(donnees[cleGC]);
                    if (Array.isArray(groupesCours) && groupesCours.length > 0) {
                        await db.set(cleGC, groupesCours);
                        nbGC += groupesCours.length;
                    }
                }
            }
            if (nbGC > 0) {
                compteurs.donnees++;
                details.push(`${nbGC} groupe-cours`);
            }
        }

        // Horaires (clés: *_horaires)
        if (isChecked('horaires')) {
            let nbHoraires = 0;
            for (var cleHor of Object.keys(donnees)) {
                if (cleHor.endsWith('_horaires')) {
                    var horaires = parseValeur(donnees[cleHor]);
                    if (Array.isArray(horaires) && horaires.length > 0) {
                        await db.set(cleHor, horaires);
                        nbHoraires += horaires.length;
                    }
                }
            }
            if (nbHoraires > 0) {
                compteurs.donnees++;
                details.push(`${nbHoraires} horaire(s)`);
            }
        }

        // Enseignants (clé globale)
        if (isChecked('enseignants')) {
            if (donnees.enseignants) {
                var enseignants = parseValeur(donnees.enseignants);
                if (Array.isArray(enseignants) && enseignants.length > 0) {
                    await db.set('enseignants', enseignants);
                    compteurs.donnees++;
                    details.push(`${enseignants.length} enseignant(s)`);
                }
            }
        }

        // #380 (audit 5 août, rapport A1) : les clés calendrier ne sont plus
        // JAMAIS importées en silence — case à cocher dédiée dans la modale
        // (isChecked), comptées dans le total, comme toute autre donnée.
        // Historique : le FIX du 31 jan 2026 les écrivait inconditionnellement
        // (« essentielles ») → le cadre du trimestre du poste était remplacé
        // même quand RIEN n'était coché.
        if (isChecked('calendrier')) {
            let nbCalendrier = 0;
            for (var cleCal of Object.keys(donnees)) {
                if (estCleCalendrierImport(cleCal)) {
                    var dataCal = parseValeur(donnees[cleCal]);
                    if (dataCal && (Array.isArray(dataCal) ? dataCal.length > 0 : Object.keys(dataCal).length > 0)) {
                        await db.set(cleCal, dataCal);
                        nbCalendrier++;
                    }
                }
            }
            if (nbCalendrier > 0) {
                compteurs.donnees++;
                details.push(`${nbCalendrier} config(s) calendrier`);
            }
        }

        // Fichiers travaux (métadonnées + blobs ZIP)
        if (isChecked('fichiersTravaux')) {
            let nbFichiers = 0;
            for (var cleFT of Object.keys(donnees)) {
                if (cleFT.includes('fichiersTravaux')) {
                    var fichiersTravaux = parseValeur(donnees[cleFT]);
                    if (Array.isArray(fichiersTravaux) && fichiersTravaux.length > 0) {
                        await db.set(cleFT, fichiersTravaux);
                        nbFichiers += fichiersTravaux.length;
                    }
                }
            }
            // Restaurer les blobs depuis le ZIP si disponible
            // _restaurerBlobsDepuisZip a besoin des clés fichiersTravaux + _zipTravaux
            var zipTravaux = configCompleteEnAttente ? configCompleteEnAttente._zipTravaux : null;
            if (zipTravaux && typeof travauxStockage !== 'undefined') {
                var donneesBlobs = { _zipTravaux: zipTravaux };
                for (var cleB of Object.keys(donnees)) {
                    if (cleB.includes('fichiersTravaux')) donneesBlobs[cleB] = parseValeur(donnees[cleB]);
                }
                var nbBlobs = await _restaurerBlobsDepuisZip(donneesBlobs);
                if (nbBlobs > 0) {
                    details.push(nbFichiers + ' fichier(s) travaux + ' + nbBlobs + ' PDF restauré(s)');
                } else {
                    details.push(nbFichiers + ' fichier(s) travaux (métadonnées)');
                }
            } else if (nbFichiers > 0) {
                details.push(nbFichiers + ' fichier(s) travaux (métadonnées, sans blobs)');
            }
            if (nbFichiers > 0) compteurs.donnees++;
        }

        // Annotations travaux
        if (isChecked('annotationsTravaux')) {
            var nbAnnotations = 0;
            for (var cleAT of Object.keys(donnees)) {
                if (cleAT.includes('annotationsTravaux')) {
                    var annotations = parseValeur(donnees[cleAT]);
                    if (Array.isArray(annotations) && annotations.length > 0) {
                        await db.set(cleAT, annotations);
                        nbAnnotations += annotations.length;
                    }
                }
            }
            if (nbAnnotations > 0) {
                details.push(nbAnnotations + ' annotation(s) sur les travaux');
                compteurs.donnees++;
            }
        }

        // Synchroniser le cache après tous les imports
        if (typeof db.syncToLocalStorageCache === 'function') {
            await db.syncToLocalStorageCache();
        }

        // ✅ CORRIGÉ (6 jan 2026) : Vérifier les checkboxes AVANT de fermer le modal
        // Pour les ressources, vérifier les checkboxes individuelles; pour les données, l'ancienne méthode
        const quelqueChoseCoche =
            hasCheckedItems('pratiques') || hasCheckedItems('grilles') ||
            hasCheckedItems('echelles') || hasCheckedItems('productions') ||
            hasCheckedItems('cartouches') ||
            isChecked('etudiants') || isChecked('presences') ||
            isChecked('evaluations') || isChecked('configuration') ||
            isChecked('groupesCours') || isChecked('horaires') || isChecked('enseignants') ||
            isChecked('calendrier') ||
            isChecked('fichiersTravaux') || isChecked('annotationsTravaux');

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Message de résumé
        const total = compteurs.ressources + compteurs.donnees;

        if (total === 0) {
            if (!quelqueChoseCoche) {
                alert('Coche au moins un élément à importer.');
            } else {
                alert('Aucune nouvelle donnée à importer.\n\nLes éléments sélectionnés existent déjà (même nom).');
            }
        } else {
            const message = `Import réussi !\n\n${details.join('\n')}\n\nTotal : ${total} élément(s) importé(s).`;

            notifications.succes(message);
            alert(message);

            // Écritures IDB pendantes terminées AVANT le reload (bug terrain
            // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
            await db.flush();
            if (confirm('Recharger la page pour voir les changements ?')) {
                location.reload();
            }
        }


    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import sélectif:', erreur);
        alert('Erreur lors de l\'import.\n\n' + erreur.message);
    }
}

/* ===============================
   EXPORT CONFIGURATION COMPLÈTE (Beta 91)
   =============================== */

/**
 * Exporte une configuration pédagogique complète
 * Rassemble toutes les ressources du cours actif:
 * - Échelles de performance
 * - Grilles de critères
 * - Productions
 * - Cartouches de rétroaction
 * - Paramètres du cours (jetons, reprises, etc.)
 */
async function exporterConfigurationComplete() {
    // 1. Rassembler toutes les ressources
    const toutesEchelles = db.getSync(cle('echellesTemplates'), []);
    const toutesGrilles = db.getSync(cle('grillesTemplates'), []);
    // 🆕 FIX (1er fév 2026) : Utiliser la clé namespacée pour les productions
    const cleProductions = cle('productions');
    const toutesProductions = db.getSync(cleProductions, []);

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const echelles = filtrerRessourcesNonDemo(toutesEchelles, 'echelle');
    const grilles = filtrerRessourcesNonDemo(toutesGrilles, 'grille');
    const productions = filtrerRessourcesNonDemo(toutesProductions, 'production');

    let nbExclues = (toutesEchelles.length - echelles.length) +
                    (toutesGrilles.length - grilles.length) +
                    (toutesProductions.length - productions.length);

    // Cartouches (stockage par grille) - aussi filtrées avec heuristique
    const cartouches = {};
    const allKeys = Object.keys(localStorage);
    for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            const toutesCartouches = db.getSync(key, []);
            const cartouchesFiltrees = filtrerRessourcesNonDemo(toutesCartouches, 'cartouche');
            nbExclues += toutesCartouches.length - cartouchesFiltrees.length;
            if (cartouchesFiltrees.length > 0) {
                cartouches[grilleId] = cartouchesFiltrees;
            }
        }
    }

    // Paramètres du cours
    const modalitesEvaluation = db.getSync(cle('modalitesEvaluation'), null) || {};
    const parametres = {
        systeme_jetons: modalitesEvaluation.systemeJetons || false,
        reprises_autorisees: modalitesEvaluation.reprisesAutorisees || false,
        nombre_artefacts: modalitesEvaluation.nombreArtefacts || 0,
        pratique_active: modalitesEvaluation.pratiqueActive || 'sommative'
        // Session C (#303) : mode_comparatif retiré (mode comparatif supprimé).
    };

    // Vérifier qu'il y a du contenu à exporter
    const nbCartouches = Object.values(cartouches).reduce((total, arr) => total + arr.length, 0);
    const nbRessources = echelles.length + grilles.length + productions.length + nbCartouches;

    if (nbRessources === 0) {
        if (nbExclues > 0) {
            alert(`Aucune ressource personnelle à exporter.\n\n${nbExclues} ressource(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune ressource à exporter.\n\nCréez d\'abord des grilles, échelles ou productions.');
        }
        return;
    }

    // Informer si des ressources ont été exclues
    if (nbExclues > 0) {
    }

    // 2. Demander les métadonnées enrichies (modal spécial pour config complète)
    const metaEnrichies = await demanderMetadonneesConfigComplete(nbRessources);

    if (!metaEnrichies) {
        return;
    }

    // Afficher l'overlay de progression (#264) — masqué avant la preview K-β
    // (interaction utilisateur) puis pas réaffiché : les étapes restantes
    // (sérialisation, écriture du fichier) sont rapides comparées au scellement.
    const _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) {
        window.afficherProgression('Export de la configuration');
        window.majProgression(5, 'Préparation...', nbRessources + ' ressources');
        await new Promise(r => setTimeout(r, 0));
    }

    // Défense H — sceller chaque ressource avant export. Le sceau est
    // calculé sur le contenu canonicalisé (cf. js/securite-hash.js) et
    // permettra à l'import de détecter une altération en transit.
    let echellesScellees = echelles;
    let grillesScellees = grilles;
    let productionsScellees = productions;
    let cartouchesScellees = cartouches;
    if (window.SecuriteHash && typeof window.SecuriteHash.scellerLot === 'function') {
        if (_hasProg) window.majProgression(15, 'Scellement des échelles...', echelles.length + ' éch.');
        echellesScellees = await window.SecuriteHash.scellerLot(echelles);
        if (_hasProg) window.majProgression(30, 'Scellement des grilles...', grilles.length + ' gri.');
        grillesScellees = await window.SecuriteHash.scellerLot(grilles);
        if (_hasProg) window.majProgression(50, 'Scellement des productions...', productions.length + ' prod.');
        productionsScellees = await window.SecuriteHash.scellerLot(productions);
        cartouchesScellees = {};
        const grilleIdsCart = Object.keys(cartouches);
        for (let gci = 0; gci < grilleIdsCart.length; gci++) {
            const gId = grilleIdsCart[gci];
            cartouchesScellees[gId] = await window.SecuriteHash.scellerLot(cartouches[gId]);
            if (_hasProg) {
                const pct = 60 + Math.round((gci / Math.max(1, grilleIdsCart.length)) * 15);
                window.majProgression(pct, 'Scellement des cartouches...', (gci + 1) + '/' + grilleIdsCart.length + ' grilles');
            }
        }
    }
    if (_hasProg) window.majProgression(80, 'Validation et structure...');

    // 3. Construire l'objet de configuration complète
    const configComplete = {
        metadata: {
            type: "configuration-complete",
            nom: metaEnrichies.nom,
            auteur: metaEnrichies.auteur,
            discipline: metaEnrichies.discipline,
            niveau: metaEnrichies.niveau,
            description: metaEnrichies.description,
            licence: "CC BY-NC-SA 4.0",
            licence_url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
            version: "1.0",
            date_creation: new Date().toISOString().split('T')[0],
            date_export: new Date().toISOString().split('T')[0],
            application_version: "Beta 91",
            email_auteur: metaEnrichies.email || "",
            site_auteur: metaEnrichies.site || ""
        },
        contenu: {
            echelles: echellesScellees,
            grilles: grillesScellees,
            productions: productionsScellees,
            cartouches: cartouchesScellees,
            parametres: parametres
        }
    };

    // Défense K — valider la structure de l'objet exporté avant
    // sérialisation et téléchargement. Si un payload a tenté d'ajouter un
    // champ annexe (cf. MODELE-MENACES.md §X-01, §X-02), l'export est
    // bloqué ici.
    if (window.SecuriteExportValidation && typeof window.SecuriteExportValidation.validerExportConfigurationComplete === 'function') {
        try {
            window.SecuriteExportValidation.validerExportConfigurationComplete(configComplete);
        } catch (e) {
            console.error(e);
            alert('Export bloqué pour des raisons de sécurité.\n\n' + e.message + '\n\nL\'export contient des champs inattendus. Vérifie l\'intégrité de l\'application avant de réessayer.');
            return;
        }
    }

    // K-β — preview UI : montrer les champs racine du JSON et demander
    // confirmation avant le téléchargement. Masquer la progression pour ne
    // pas superposer deux modales — la preview ouvre sa propre fenêtre.
    if (window.SecuriteExportPreview && typeof window.SecuriteExportPreview.previewJsonEtConfirmer === 'function') {
        if (_hasProg) window.masquerProgression();
        const okPreview = await window.SecuriteExportPreview.previewJsonEtConfirmer(configComplete, 'configuration pédagogique');
        if (!okPreview) {
            return;
        }
    } else if (_hasProg) {
        // Pas de preview module : masquer la progression avant le téléchargement
        window.masquerProgression();
    }

    // 4. Générer nom de fichier (convention #262 — accents préservés via helper)
    const nomFichierJSON = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('config', { nom: metaEnrichies.auteur, extension: '.json', inclureLicence: true })
        : `config-${metaEnrichies.auteur.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    const nomFichierTXT = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('lisezmoi', { nom: metaEnrichies.auteur, extension: '.txt' })
        : `lisezmoi-${metaEnrichies.auteur.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;

    // 5. Générer le fichier LISEZMOI.txt
    const contenuLISEZMOI = genererFichierLISEZMOI(configComplete.metadata, {
        nbEchelles: echelles.length,
        nbGrilles: grilles.length,
        nbProductions: productions.length,
        nbCartouches: Object.keys(cartouches).reduce((total, grilleId) => total + cartouches[grilleId].length, 0)
    });

    // 6. Télécharger le JSON
    const blobJSON = new Blob([JSON.stringify(configComplete, null, 2)], { type: 'application/json' });
    const urlJSON = URL.createObjectURL(blobJSON);
    const aJSON = document.createElement('a');
    aJSON.href = urlJSON;
    aJSON.download = nomFichierJSON;
    document.body.appendChild(aJSON);
    aJSON.click();
    document.body.removeChild(aJSON);
    URL.revokeObjectURL(urlJSON);

    // 7. Télécharger le LISEZMOI.txt (avec un petit délai pour éviter le blocage navigateur)
    setTimeout(() => {
        const blobTXT = new Blob([contenuLISEZMOI], { type: 'text/plain;charset=utf-8' });
        const urlTXT = URL.createObjectURL(blobTXT);
        const aTXT = document.createElement('a');
        aTXT.href = urlTXT;
        aTXT.download = nomFichierTXT;
        document.body.appendChild(aTXT);
        aTXT.click();
        document.body.removeChild(aTXT);
        URL.revokeObjectURL(urlTXT);

        // 8. Notification de succès
        notifications.succes('Configuration complète exportée avec succès!\n\n2 fichiers téléchargés: JSON + LISEZMOI.txt');
    }, 500);
}

/* ===============================
   EXPORTS VERS WINDOW (ACCESSIBLE DEPUIS HTML)
   =============================== */

// Fonctions appelées depuis le HTML (onclick)
window.ouvrirModalImport = ouvrirModalImport;
window.executerImport = executerImport;
window.fermerModalImport = fermerModalImport;
// window.exporterDonneesJSON = exporterDonneesJSON; // ❌ Fonction n'existe plus
window.reinitialiserDonnees = reinitialiserDonnees;
// window.importerConfigComplete = importerConfigComplete; // ❌ Fonction n'existe plus
window.executerImportConfigComplete = executerImportConfigComplete;
window.fermerModalPreviewConfigComplete = fermerModalPreviewConfigComplete;
window.exporterConfigurationComplete = exporterConfigurationComplete;
window.executerImportVersBibliotheques = executerImportVersBibliotheques; // 🆕 BETA 95.1
window.executerImportSelectif = executerImportSelectif; // 🆕 BETA 95.1

// 🆕 Beta 96.2 : Export des fonctions d'export (corrigées pour IndexedDB)
window.ouvrirModalExport = ouvrirModalExport;
window.fermerModalExport = fermerModalExport;
window.toggleToutesLesCles = toggleToutesLesCles;
window.executerExport = executerExport;

// Filtrage des données démo — réutilisé par js/reserve.js
window.estRessourceDemo = estRessourceDemo;
window.filtrerRessourcesNonDemo = filtrerRessourcesNonDemo;

// Sanitisation — exposée pour les modules qui ont leur propre canal d'import
// (ex. tampons-bibliotheque.js — Défense P du modèle de menaces).
// Toute écriture vers une bibliothèque partagée depuis une source externe
// devrait passer par `assainirObjet(item, SCHEMAS_IMPORT.<type>)` avant `db.set`.
window.assainirObjet = assainirObjet;
window.assainirChaine = assainirChaine;
window.SCHEMAS_IMPORT = SCHEMAS_IMPORT;
window.verifierUniciteIds = verifierUniciteIds; // #292 : exposé pour chargerCodex (codex.js)

})();
