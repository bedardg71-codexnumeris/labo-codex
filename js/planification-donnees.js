/* ===============================
   MODULE: PLANIFICATION — COUCHE DONNÉES
   Gestion du stockage des cartes mentales
   via db.getSync/db.setSync + cle()

   Export: window.planificationDonnees
   =============================== */

(function() {
'use strict';

// === CONSTANTES ===
const CLE_DONNEES = 'planification_mindmap';

// Clés localStorage du prototype (pour migration)
const PROTO_PREFIXE = 'proto_cm_';
const PROTO_CLE_INDEX = PROTO_PREFIXE + 'index';

// === RATTACHEMENT CARTE → COURS (lot 1, 7 août 2026) ===
//
// Pourquoi ce champ existe. La carte vit dans `planification_mindmap`,
// NAMESPACÉ par trimestre : elle est enfermée dans sa session. Le cours, lui,
// est une collection GLOBALE (`db.getSync('cours', [])`, jamais préfixée) —
// 601-101 est le même objet d'un trimestre à l'autre. Le `coursId` est donc la
// seule identité de la carte qui survive au changement de trimestre, et c'est
// ce qui rendra la reprise d'une session à l'autre possible (#368, aujourd'hui
// un geste manuel qui revient chaque session).
//
// Le champ vit dans l'ENTRÉE D'INDEX, pas dans le contenu de la carte :
// retrouver les cartes d'un cours ne doit pas obliger à charger toutes les
// cartes.
//
// ⚠ `cours` est une collection globale partagée (cf. SKILL_integrite_globaux) :
// on ne stocke ici que son ID, jamais une copie de l'objet, et la résolution se
// fait par IDENTITÉ contre la collection vivante — jamais par un flag recopié
// sur la carte, qui se périmerait en silence.

/** ID du cours actif, ou null. Jamais d'exception : une carte vit sans cours. */
function coursActifId() {
    try {
        if (typeof obtenirCoursActifId !== 'function') return null;
        return obtenirCoursActifId() || null;
    } catch (e) {
        console.warn('[Planification] Cours actif indisponible :', e);
        return null;
    }
}

/**
 * Entrée d'index d'une carte — FABRIQUE UNIQUE.
 * Les six sites de création posaient le même littéral `{id, nom, dateCreation}`
 * chacun de leur côté ; ajouter un champ obligeait à les retrouver tous. Ils
 * passent tous par ici.
 */
function creerEntreeIndex(id, nom) {
    var entree = {
        id: id,
        nom: nom || 'Sans titre',
        dateCreation: new Date().toISOString()
    };
    var cid = coursActifId();
    if (cid) entree.coursId = cid;
    return entree;
}

/** ID du cours rattaché à une carte, ou null. N'atteste RIEN de son existence. */
function obtenirCoursDeCarte(carteId) {
    const index = getIndex();
    if (!index || !Array.isArray(index.cartes)) return null;
    const carte = index.cartes.find(function(c) { return c && c.id === carteId; });
    return (carte && carte.coursId) || null;
}

/**
 * Porte d'écriture UNIQUE du rattachement (même patron que
 * `definirSemaineLecon` / `definirObjectifsLecon`).
 * `coursId` null/'' = détacher.
 * @returns {boolean} true si l'index a changé
 */
function definirCoursDeCarte(carteId, coursId) {
    const index = getIndex();
    if (!index || !Array.isArray(index.cartes)) return false;
    const carte = index.cartes.find(function(c) { return c && c.id === carteId; });
    if (!carte) return false;

    const vise = coursId || null;
    if ((carte.coursId || null) === vise) return false;

    if (vise === null) delete carte.coursId;
    else carte.coursId = vise;

    sauvegarderIndex(index);
    return true;
}

/**
 * Le cours rattaché, RÉSOLU contre la collection globale vivante.
 * @returns {Object|null} l'objet cours, ou null si la carte n'a pas de
 *   rattachement OU si le cours rattaché n'existe plus (rattachement
 *   ORPHELIN — voir `rattachementOrphelin`). Dans les deux cas la carte
 *   reste parfaitement utilisable : un cours supprimé ne doit jamais rendre
 *   un alignement inaccessible.
 */
function resoudreCoursDeCarte(carteId) {
    const id = obtenirCoursDeCarte(carteId);
    if (!id) return null;
    let liste;
    try {
        liste = db.getSync('cours', []);
    } catch (e) {
        console.warn('[Planification] Lecture de la collection cours échouée :', e);
        return null;
    }
    if (!Array.isArray(liste)) return null;
    return liste.find(function(c) { return c && c.id === id; }) || null;
}

/**
 * Vrai quand la carte PORTE un rattachement dont le cours a disparu.
 * Distinguer ce cas de « pas de rattachement » est nécessaire à l'interface :
 * l'un se répare (réassigner), l'autre est un état normal.
 */
function rattachementOrphelin(carteId) {
    return !!obtenirCoursDeCarte(carteId) && resoudreCoursDeCarte(carteId) === null;
}

// === FONCTIONS INTERNES ===

/**
 * Récupère toutes les données de planification pour le trimestre actif.
 * Structure : { index: { active, compteurCartes, cartes: [] }, cartes: { carte_1: {...}, ... } }
 */
function getDonnees() {
    try {
        return db.getSync(cle(CLE_DONNEES), null);
    } catch (e) {
        console.warn('[Planification] Erreur lecture données :', e);
        return null;
    }
}

/**
 * Sauvegarde toutes les données de planification.
 * Lot F (D4) : un geste sur la carte écrit ici, hors du témoin commun ; ce point le dit
 * au codex (`signalerEcritureUsager`). L'initialisation, la migration, le changement
 * d'onglet et une sauvegarde qui ne change rien passent `{ discret: true }`.
 * @param {Object} donnees
 * @param {{discret?: boolean, machine?: boolean}} [options]
 */
function setDonnees(donnees, options) {
    try {
        db.setSync(cle(CLE_DONNEES), donnees);
        // #982 : un geste sur la carte dit « Enregistré » ; une transformation de la
        // machine au chargement (`machine`) prévient le codex sans rien afficher.
        if (options && options.discret) return;
        if (options && options.machine) {
            if (window.signalerEcritureUsager) window.signalerEcritureUsager(cle(CLE_DONNEES));
        } else if (window.annoncerEcritureUsager) {
            window.annoncerEcritureUsager(cle(CLE_DONNEES));
        }
    } catch (e) {
        console.warn('[Planification] Erreur sauvegarde données :', e);
    }
}

/**
 * Récupère l'index des cartes.
 */
function getIndex() {
    const donnees = getDonnees();
    return donnees ? donnees.index : null;
}

/**
 * Sauvegarde l'index des cartes.
 * @param {Object} index
 * @param {{discret?: boolean}} [options] - voir setDonnees
 */
function sauvegarderIndex(index, options) {
    let donnees = getDonnees();
    if (!donnees) {
        donnees = { index: index, cartes: {} };
    } else {
        donnees.index = index;
    }
    setDonnees(donnees, options);
}

/**
 * Sauvegarde le contenu d'une carte spécifique.
 */
function sauvegarderCarte(carteId, contenu, options) {
    let donnees = getDonnees();
    if (!donnees) {
        donnees = { index: null, cartes: {} };
    }
    if (!donnees.cartes) donnees.cartes = {};
    // Lot F : `sauvegarder()` de la carte réécrit tout, à chaque appel (56 sites, dont le
    // changement d'onglet) ; seule une carte qui a changé le dit au codex.
    const inchangee = JSON.stringify(donnees.cartes[carteId]) === JSON.stringify(contenu);
    donnees.cartes[carteId] = contenu;
    setDonnees(donnees, { discret: inchangee, machine: !!(options && options.machine) });
}

/**
 * Charge le contenu d'une carte spécifique.
 */
function chargerCarte(carteId) {
    const donnees = getDonnees();
    if (!donnees || !donnees.cartes) return null;
    return donnees.cartes[carteId] || null;
}

/**
 * Supprime une carte du stockage.
 */
function supprimerCarte(carteId) {
    const donnees = getDonnees();
    if (!donnees || !donnees.cartes) return;
    delete donnees.cartes[carteId];
    setDonnees(donnees);
}

/**
 * Initialise la structure de données si elle n'existe pas.
 * Retourne l'index (existant ou nouvellement créé).
 */
function initialiserSiNecessaire() {
    let donnees = getDonnees();
    if (!donnees || !donnees.index || !donnees.index.cartes || donnees.index.cartes.length === 0) {
        const index = {
            active: 'carte_1',
            compteurCartes: 1,
            cartes: [creerEntreeIndex('carte_1', 'Sans titre')]
        };
        donnees = { index: index, cartes: {} };
        setDonnees(donnees, { discret: true });   // ouverture, sans geste (lot F)
        return index;
    }

    // Garde-fou contre l'incohérence index.active vs cartes existantes : si la
    // carte active a disparu (corruption quota localStorage, reset partiel,
    // import incomplet…), fallback silencieux sur la première carte de l'index
    // au lieu d'afficher une UI vide « Sans titre » trompeuse (cf #261, 5 mai 2026).
    var idsValides = donnees.index.cartes.map(function(c) { return c.id; });
    if (idsValides.indexOf(donnees.index.active) === -1) {
        var nouvelleActive = idsValides[0];
        console.warn(
            '[Planification] index.active="' + donnees.index.active +
            '" introuvable dans les ' + idsValides.length + ' cartes de l\'index. ' +
            'Fallback sur "' + nouvelleActive + '".'
        );
        donnees.index.active = nouvelleActive;
        setDonnees(donnees, { discret: true });   // réparation silencieuse (lot F)
    }

    return donnees.index;
}

/**
 * Migration one-shot des données du prototype (localStorage proto_cm_*)
 * vers le format namespacé db.getSync/setSync + cle().
 */
function migrerDonneesProto() {
    // Vérifier si des données proto existent
    let protoIndex = null;
    try {
        const json = localStorage.getItem(PROTO_CLE_INDEX);
        if (json) protoIndex = JSON.parse(json);
    } catch (e) { console.warn('[Planif-Donnees] proto index JSON parse fallback:', e.message || e); }

    // Vérifier aussi l'ancien format unique
    let ancienneCarteUnique = null;
    try {
        const json = localStorage.getItem('proto_carte_mentale');
        if (json) ancienneCarteUnique = JSON.parse(json);
    } catch (e) { console.warn('[Planif-Donnees] legacy carte JSON parse fallback:', e.message || e); }

    if (!protoIndex && !ancienneCarteUnique) return false; // Rien à migrer

    // Ne pas écraser des données déjà migrées
    const existant = getDonnees();
    if (existant && existant.index && existant.index.cartes && existant.index.cartes.length > 0) {
        return false;
    }


    // Cas 1 : ancien format unique → convertir en multi-cartes
    if (ancienneCarteUnique && !protoIndex) {
        const index = {
            active: 'carte_1',
            compteurCartes: 1,
            cartes: [creerEntreeIndex('carte_1', 'Sans titre')]
        };
        const donnees = {
            index: index,
            cartes: { 'carte_1': ancienneCarteUnique }
        };
        setDonnees(donnees, { discret: true });   // migration (lot F)
        // Nettoyer le localStorage proto
        localStorage.removeItem('proto_carte_mentale');
        return true;
    }

    // Cas 2 : format multi-cartes proto
    if (protoIndex) {
        const cartes = {};
        for (const carte of protoIndex.cartes) {
            try {
                const json = localStorage.getItem(PROTO_PREFIXE + carte.id);
                if (json) cartes[carte.id] = JSON.parse(json);
            } catch (e) { console.warn('[Planif-Donnees] carte migration JSON parse fallback:', carte.id, e.message || e); }
        }

        const donnees = {
            index: protoIndex,
            cartes: cartes
        };
        setDonnees(donnees, { discret: true });   // migration (lot F)

        // Nettoyer le localStorage proto
        localStorage.removeItem(PROTO_CLE_INDEX);
        for (const carte of protoIndex.cartes) {
            localStorage.removeItem(PROTO_PREFIXE + carte.id);
        }
        localStorage.removeItem('proto_carte_mentale');

        return true;
    }

    return false;
}

/**
 * Importe un alignement depuis la Bibliothèque dans le trimestre actif.
 * Deep-clone les données pour éviter les références croisées.
 * @param {Object} alignementBiblio - Item de la bibliothèque { nom, donnees: { compteur, compteurLiens, noeuds, liens } }
 * @returns {string|null} ID de la nouvelle carte créée, ou null si échec
 */
function importerDepuisBibliotheque(alignementBiblio) {
    if (!alignementBiblio || !alignementBiblio.donnees) return null;

    var donnees = getDonnees();
    if (!donnees || !donnees.index) {
        // Initialiser si nécessaire
        initialiserSiNecessaire();
        donnees = getDonnees();
        if (!donnees) return null;
    }

    var index = donnees.index;
    index.compteurCartes = (index.compteurCartes || 0) + 1;
    var nouvelId = 'carte_' + index.compteurCartes;

    // Ajouter à l'index
    // Le cours vient du contexte d'IMPORT (le cours actif ici), jamais de
    // l'item de bibliothèque : un alignement partagé par un collègue porterait
    // un coursId qui n'existe pas dans ce codex.
    index.cartes.push(creerEntreeIndex(nouvelId, alignementBiblio.nom || 'Alignement importé'));

    // Deep-clone les données de la carte
    var contenuClone = JSON.parse(JSON.stringify(alignementBiblio.donnees));

    // Sauvegarder
    if (!donnees.cartes) donnees.cartes = {};
    donnees.cartes[nouvelId] = contenuClone;
    index.active = nouvelId;
    donnees.index = index;
    setDonnees(donnees);

    return nouvelId;
}

/**
 * Exporte une carte du trimestre actif pour la bibliothèque.
 * @param {string} carteId - ID de la carte à exporter (ex: 'carte_1')
 * @returns {Object|null} { nom, dateCreation, donnees: { compteur, compteurLiens, noeuds, liens } }
 */
function exporterCartePourBibliotheque(carteId) {
    var donnees = getDonnees();
    if (!donnees || !donnees.cartes || !donnees.cartes[carteId]) return null;

    var index = donnees.index;
    var infosCarte = null;
    if (index && index.cartes) {
        for (var i = 0; i < index.cartes.length; i++) {
            if (index.cartes[i].id === carteId) {
                infosCarte = index.cartes[i];
                break;
            }
        }
    }

    var contenu = donnees.cartes[carteId];
    return {
        nom: infosCarte ? infosCarte.nom : 'Sans titre',
        dateCreation: infosCarte ? infosCarte.dateCreation : new Date().toISOString(),
        donnees: JSON.parse(JSON.stringify({
            compteur: contenu.compteur || 0,
            compteurLiens: contenu.compteurLiens || 0,
            noeuds: contenu.noeuds || [],
            liens: contenu.liens || []
        }))
    };
}

/* ===============================
   IMPORT INTER-TRIMESTRE (4 août 2026 — patron Brique C, comme les
   grilles/productions : COPIE vers le trimestre actif, source INTOUCHÉE,
   id de carte neuf généré par l'index cible, trace importeDe.
   Voie canonique de lecture = cleSource() (planification_mindmap est au
   registre CLES_NAMESPACEES).
   =============================== */

/**
 * Liste les autres trimestres qui possèdent au moins une carte mentale.
 * Lecture SEULE. @returns {Array<{id, nom, cartes:[{id, nom, nbNoeuds}]}>}
 */
function listerTrimestresAvecCartes() {
    if (typeof obtenirTrimestres !== 'function' || typeof cleSource !== 'function') return [];
    const actif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : (window.trimestreActif || '');
    const resultat = [];
    (obtenirTrimestres() || []).forEach(t => {
        if (!t || !t.id || t.id === actif) return;
        const donnees = db.getSync(cleSource(CLE_DONNEES, t.id), null);
        if (!donnees || !donnees.index || !Array.isArray(donnees.index.cartes) || donnees.index.cartes.length === 0) return;
        const cartes = donnees.index.cartes.map(c => {
            const contenu = (donnees.cartes && donnees.cartes[c.id]) || {};
            return {
                id: c.id,
                nom: c.nom || 'Sans titre',
                nbNoeuds: (contenu.noeuds || []).length,
                coursId: c.coursId || null
            };
        });
        if (cartes.length > 0) resultat.push({ id: t.id, nom: t.nom || t.id, cartes: cartes });
    });
    resultat.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return resultat;
}

/**
 * Les cartes des AUTRES trimestres qui portent ce cours (lot 2, 7 août 2026).
 *
 * C'est la requête qui ferme #368 : chaque rentrée, retrouver la carte du
 * 601-101 de la session précédente était un geste manuel — ouvrir la liste de
 * tous les trimestres, reconnaître la bonne carte à son nom. Le `coursId` posé
 * au lot 1 permet de la DÉSIGNER.
 *
 * ⚠ Aucun tri chronologique n'est promis ici. `listerTrimestresAvecCartes()`
 * ordonne par id décroissant, ce qui n'est pas l'ordre de l'année scolaire
 * (a2026 SUIT h2026, mais 'h' > 'a'). Plutôt que de deviner la « bonne »
 * source, on rend TOUT ce qui correspond et on laisse choisir dès qu'il y a
 * plus d'un candidat.
 *
 * @returns {Array<{trimestreId, trimestreNom, carte:{id, nom, nbNoeuds}}>}
 */
function listerReprisesPourCours(coursId) {
    if (!coursId) return [];
    const reprises = [];
    listerTrimestresAvecCartes().forEach(t => {
        t.cartes.forEach(c => {
            if (c.coursId && c.coursId === coursId) {
                reprises.push({ trimestreId: t.id, trimestreNom: t.nom, carte: c });
            }
        });
    });
    return reprises;
}

/**
 * Ids des productions VIVANTES du trimestre ACTIF (celui de l'arrivée).
 * ⚠ Même chemin de lecture que `trimestres.js` : clé namespacée AVEC repli sur
 * la clé nue — sans le repli, un trimestre dont les productions n'ont pas
 * migré verrait TOUTES ses références déclarées mortes (leçon #419 : on juge
 * par le chemin par lequel on lit).
 */
function idsProductionsVivantes() {
    let productions;
    try {
        productions = db.getSync(cle('productions')) || db.getSync('productions', []);
    } catch (e) {
        console.warn('[Planification] Lecture des productions échouée :', e);
        productions = [];
    }
    const ids = new Set();
    (Array.isArray(productions) ? productions : []).forEach(p => {
        if (p && p.id) ids.add(p.id);
    });
    return ids;
}

/**
 * Copie une carte d'un trimestre source vers le trimestre ACTIF.
 * La source n'est jamais mutée (deep-clone via importerDepuisBibliotheque).
 * Copie aussi les notes de séance (Objectif/Notes des vues leçon) des leçons
 * de la carte — par id, sans jamais écraser une entrée existante de la cible.
 * @returns {string|null} id de la nouvelle carte, ou null si échec
 */
function importerCarteDepuisTrimestre(trimestreSourceId, carteId) {
    try {
        const source = db.getSync(cleSource(CLE_DONNEES, trimestreSourceId), null);
        if (!source || !source.cartes || !source.cartes[carteId]) return null;
        const infos = ((source.index && source.index.cartes) || []).find(c => c.id === carteId);

        const nouvelId = importerDepuisBibliotheque({
            nom: (infos && infos.nom) || 'Carte importée',
            donnees: source.cartes[carteId]
        });
        if (!nouvelId) return null;

        // Trace de provenance sur l'entrée d'index fraîchement créée
        const donnees = getDonnees();
        const entree = donnees.index.cartes.find(c => c.id === nouvelId);
        if (entree) {
            entree.importeDe = { trimestre: trimestreSourceId, carte: carteId, date: new Date().toISOString() };
        }

        // #425 préalable : contrôle de vivacité de `metadata.productionId`,
        // symétrique de celui du cours ci-dessous — mais contre les productions
        // du trimestre d'ARRIVÉE, car `productions` est NAMESPACÉE par
        // trimestre (contrairement à `cours`, global) : le trou s'ouvrait à
        // chaque rentrée. Une référence morte vaut moins qu'un champ absent.
        const vivantes = idsProductionsVivantes();
        (((donnees.cartes || {})[nouvelId] || {}).noeuds || []).forEach(n => {
            if (n && n.metadata && n.metadata.productionId && !vivantes.has(n.metadata.productionId)) {
                delete n.metadata.productionId;
            }
        });
        setDonnees(donnees);

        // Le rattachement SUIT la carte d'un trimestre à l'autre : `cours` est
        // une collection globale, donc le même coursId reste valide dans le
        // trimestre d'arrivée. C'est tout l'intérêt du champ — reprendre le
        // 601-101 de la session précédente sans le réassigner à la main.
        // On ne recopie que si le cours EXISTE encore : un id mort vaut moins
        // que le cours actif posé par défaut à la création.
        if (infos && infos.coursId) {
            let coursVivants = [];
            try { coursVivants = db.getSync('cours', []) || []; } catch (e) { coursVivants = []; }
            if (Array.isArray(coursVivants) && coursVivants.some(c => c && c.id === infos.coursId)) {
                definirCoursDeCarte(nouvelId, infos.coursId);
            }
        }

        copierSeancesLecons(trimestreSourceId, carteId, nouvelId, source.cartes[carteId]);
        return nouvelId;
    } catch (e) {
        console.warn('[Planification] Import inter-trimestre échoué :', e);
        return null;
    }
}

/**
 * Les Objectif/Notes des vues leçon vivent dans une clé séparée
 * ('planification_seances', indexée par id de leçon — ids préservés à la copie).
 * ✅ #367 LIVRÉ (7 août 2026) : la clé est namespacée par trimestre ET son
 * dictionnaire est composé en `<carteId>::<leconId>`. Cette fonction est donc
 * ACTIVE — elle ne l'était pas avant (les notes « suivaient » par accident, via
 * la clé nue partagée). Les ids de leçon étant préservés à la copie mais les
 * ids de CARTE non, la note se lit sous la carte source et s'écrit sous la
 * carte d'arrivée. Push sans replace : on n'écrase jamais une note existante
 * du trimestre actif.
 */
function copierSeancesLecons(trimestreSourceId, carteSourceId, nouvelleCarteId, contenuCarte) {
    try {
        const seancesSource = db.getSync(trimestreSourceId + '_planification_seances', {}) || {};
        const idsLecons = (contenuCarte.noeuds || []).filter(n => n.type === 'lecon').map(n => n.id);
        if (idsLecons.length === 0) return;
        const cible = db.getSync(cle('planification_seances'), {}) || {};
        // #425 préalable, second chemin : la deep-copy de l'entrée de séance
        // emporte `.activites[].productionId` — même contrôle de vivacité que
        // la metadata de nœud (deux chemins, même trou ; audit §3bis D6).
        const vivantes = idsProductionsVivantes();
        let modifie = false;
        idsLecons.forEach(lid => {
            // Clés COMPOSITES des deux côtés (#367) : les ids de leçon ne sont
            // uniques que par carte, donc la note se lit sous la carte SOURCE et
            // s'écrit sous la carte d'ARRIVÉE — qui porte un id différent.
            const cleSourceNote = `${carteSourceId}::${lid}`;
            const cleCibleNote = `${nouvelleCarteId}::${lid}`;
            if (seancesSource[cleSourceNote] && !cible[cleCibleNote]) {
                const copie = JSON.parse(JSON.stringify(seancesSource[cleSourceNote]));
                Object.keys(copie.activites || {}).forEach(aid => {
                    const act = copie.activites[aid];
                    if (act && act.productionId && !vivantes.has(act.productionId)) {
                        act.productionId = null;
                    }
                });
                cible[cleCibleNote] = copie;
                modifie = true;
            }
        });
        if (modifie) db.setSync(cle('planification_seances'), cible); // security-ok: copie interne de données locales (autre trimestre du même utilisateur), pas de source externe
    } catch (e) {
        console.warn('[Planification] Copie des notes de séance échouée :', e);
    }
}

// === EXPORT ===
window.planificationDonnees = {
    getIndex: getIndex,
    sauvegarderIndex: sauvegarderIndex,
    sauvegarderCarte: sauvegarderCarte,
    chargerCarte: chargerCarte,
    supprimerCarte: supprimerCarte,
    initialiserSiNecessaire: initialiserSiNecessaire,
    migrerDonneesProto: migrerDonneesProto,
    importerDepuisBibliotheque: importerDepuisBibliotheque,
    exporterCartePourBibliotheque: exporterCartePourBibliotheque,
    listerTrimestresAvecCartes: listerTrimestresAvecCartes,
    listerReprisesPourCours: listerReprisesPourCours,
    importerCarteDepuisTrimestre: importerCarteDepuisTrimestre,
    creerEntreeIndex: creerEntreeIndex,
    obtenirCoursDeCarte: obtenirCoursDeCarte,
    definirCoursDeCarte: definirCoursDeCarte,
    resoudreCoursDeCarte: resoudreCoursDeCarte,
    rattachementOrphelin: rattachementOrphelin
};

})();
