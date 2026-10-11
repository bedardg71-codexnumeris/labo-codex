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

/* ============================================================================
   #448 — UNE COLLISION D'ID À L'IMPORT N'EST PAS UN ACCIDENT À RENOMMER
   ----------------------------------------------------------------------------
   Le défaut, mesuré sur les données réelles de Grégoire le 11 août 2026.

   `verifierUniciteIds` (ci-dessous) traite une collision d'identifiant comme
   un accident : elle renomme le second et GARDE LES DEUX. C'est juste pour
   deux éléments réellement distincts qui se disputent un id. C'est FAUX pour
   un réimport, où la collision est précisément la preuve que c'est le MÊME
   élément — celui qu'on vient de réimporter.

   Ce que ça a produit chez lui, en deux formes distinctes :
     · collision sur une CARTOUCHE → jumeau en place. L'original garde ses
       références, la copie naît muette. Lot du 24 mars : quatre paires à
       75/0, 79/0, 50/0, 50/0 citations.
     · collision sur une GRILLE → la grille entrante est remappée vers un id
       neuf, et ses cartouches partent dans un magasin NEUF que rien ne
       référence. Lot du 27 juin : huit éléments à 0/0. Plus insidieux —
       ça ne double rien à l'écran, ça fabrique un magasin fantôme.

   ⚠ LA RÈGLE DE PRUDENCE QUI COMMANDE LA COMPARAISON. On ne fusionne que sur
   contenu STRICTEMENT identique. Se tromper dans un sens ou dans l'autre n'a
   pas le même prix :
     · croire à tort que deux éléments sont identiques ⇒ on en ÉCARTE un, et
       on perd ce qu'il portait de différent. Irréversible.
     · croire à tort qu'ils diffèrent ⇒ on garde un doublon. C'est le statu
       quo d'aujourd'hui, et ça se nettoie.
   D'où l'égalité stricte, et le refus de « normaliser » pour rapprocher deux
   objets qui ne sont pas les mêmes. C'est la leçon de #442, écrite sur pièces :
   « ne rien casser » n'est pas « ne rien perdre » — la 3e copie du cours
   portait deux champs que personne ne lisait.
   ========================================================================= */

/**
 * Signature stable d'un objet : JSON aux clés TRIÉES, récursivement.
 * `JSON.stringify` conserve l'ordre d'insertion — deux objets identiques
 * écrits dans un ordre différent produiraient deux chaînes différentes, et
 * on croirait à un conflit là où il n'y en a pas.
 * @param {*} valeur
 * @param {string[]} [champsIgnores] - clés à exclure de la comparaison
 * @returns {string}
 */
function signatureContenu(valeur, champsIgnores) {
    const ignores = champsIgnores || [];
    const visiter = (v) => {
        if (v === null || typeof v !== 'object') return v;
        if (Array.isArray(v)) return v.map(visiter);
        const sortie = {};
        Object.keys(v).sort().forEach((k) => {
            if (ignores.indexOf(k) !== -1) return;
            sortie[k] = visiter(v[k]);
        });
        return sortie;
    };
    try {
        return JSON.stringify(visiter(valeur));
    } catch (e) {
        // Cycle ou valeur non sérialisable : on refuse de conclure à
        // l'identité. Le repli est le comportement d'avant — on garde les deux.
        return null;
    }
}

/**
 * Fusionne une collection ENTRANTE dans une collection EXISTANTE en traitant
 * une collision d'id comme une IDENTITÉ, pas comme un accident.
 *
 * @param {Array} existants
 * @param {Array} entrants
 * @param {string} nomCollection - pour le journal console
 * @param {string[]} [champsPosesParLImport] - #954 : champs que le chemin d'import pose
 *   lui-même sur l'entrant (`dateImport`…), exclus de la comparaison d'identité.
 * @returns {{liste: Array, ajoutes: number, ignores: number, conflits: number,
 *            renommages: Object<string, string>}} `renommages` : ancienId → id
 *          neuf de chaque entrant renommé pour conflit (#654 — sans lui, rien ne
 *          peut rebrancher ce qui le référençait).
 */
function fusionnerParIdentite(existants, entrants, nomCollection, champsPosesParLImport) {
    const champsHorsIdentite = ['id'].concat(champsPosesParLImport || []);
    const base = Array.isArray(existants) ? existants.slice() : [];
    const arrivants = Array.isArray(entrants) ? entrants : [];

    const parId = new Map();
    for (let i = 0; i < base.length; i++) {
        const it = base[i];
        if (it && it.id) parId.set(it.id, it);
    }

    let ajoutes = 0, ignores = 0, conflits = 0;
    const renommages = {};

    for (let j = 0; j < arrivants.length; j++) {
        const entrant = arrivants[j];
        if (!entrant || !entrant.id) { base.push(entrant); ajoutes++; continue; }

        const enPlace = parId.get(entrant.id);
        if (!enPlace) {
            base.push(entrant);
            parId.set(entrant.id, entrant);
            ajoutes++;
            continue;
        }

        // Même id : est-ce le MÊME élément ? L'id est identique par
        // hypothèse, on ne compare donc que le reste.
        const sigEnPlace = signatureContenu(enPlace, champsHorsIdentite);
        const sigEntrant = signatureContenu(entrant, champsHorsIdentite);
        if (sigEnPlace !== null && sigEnPlace === sigEntrant) {
            ignores++;   // déjà là, à l'identique : rien à faire
            continue;
        }

        // Contenus réellement différents : on garde les deux, comme avant,
        // mais on le DIT — jusqu'ici ça se faisait en silence.
        const ancienId = entrant.id;
        entrant.id = genererIdUnique(String(ancienId).replace(/[0-9_]+$/, '').replace(/-+$/, '_'));
        renommages[ancienId] = entrant.id;
        base.push(entrant);
        parId.set(entrant.id, entrant);
        conflits++;
        console.warn(`⚠️ [${nomCollection}] même id, contenu DIFFÉRENT — les deux sont conservés : ${ancienId} → ${entrant.id}`);
    }

    if (ignores > 0) {
        console.warn(`[${nomCollection}] ${ignores} élément(s) déjà présent(s) à l'identique — non réimporté(s).`);
    }
    if (conflits > 0) {
        console.warn(`⚠️ [${nomCollection}] ${conflits} conflit(s) réel(s) : même id, contenu différent.`);
    }

    // Filet : le lot ENTRANT peut lui-même porter des ids dupliqués en
    // interne. `fusionnerParIdentite` ne traite que la collision avec
    // l'existant — celle-là reste du ressort de `verifierUniciteIds`.
    return { liste: verifierUniciteIds(base, nomCollection), ajoutes, ignores, conflits, renommages };
}

/**
 * #954 (lot 3, 10 oct. 2026) — les champs que l'import sélectif pose sur chaque élément
 * reçu : l'instant de l'import et l'auteur de la source. Ils ne disent rien du CONTENU ;
 * comparés, ils rendaient une cartouche identique différente de celle en place.
 */
const CHAMPS_POSES_PAR_L_IMPORT = ['dateImport', 'auteurOriginal'];

/**
 * Lot 3, relecture du 10 oct. 2026 — deux grilles (ou deux échelles) de même nom ne
 * sont tenues pour la même que si leurs éléments portent les mêmes identifiants :
 * ids de critères pour une grille, codes de niveaux pour une échelle (même ensemble,
 * ordre indifférent). Le nom seul ne suffit pas : la grille « Grille de rédaction »
 * d'un collègue peut porter d'autres critères que la locale, et rebrancher sur
 * celle-ci rangerait ses cartouches sous des critères qui n'y sont pas. Un lien
 * rompu se voit ; un lien faux ne se voit pas.
 *
 * @param {Object} a
 * @param {Object} b
 * @param {string} champ - 'criteres' ou 'niveaux'
 * @param {string} cleElement - 'id' ou 'code'
 * @returns {boolean}
 */
function memesIdentifiantsElements(a, b, champ, cleElement) {
    const ensemble = o => Array.from(new Set(
        (Array.isArray(o && o[champ]) ? o[champ] : []).map(x => String(x && x[cleElement]))
    )).sort();
    const ea = ensemble(a);
    const eb = ensemble(b);
    return ea.length === eb.length && ea.every((v, i) => v === eb[i]);
}

/**
 * Vérifie l'unicité des IDs dans un tableau d'objets.
 *
 * #454 — un doublon interne au contenu IDENTIQUE est ÉCARTÉ, plus jamais
 * renommé. Renommer une copie identique fabriquait une ressource fantôme :
 * rien ne repointe les productions, les évaluations ni la clé
 * `cartouches_{id}` vers le nouvel identifiant (deux imports mesurés chez
 * Grégoire, 23 mars et 11 avril 2026). Même règle d'identité que
 * `fusionnerParIdentite` (#448) : un id identique avec un contenu identique
 * n'est pas une collision, c'est la même chose. Le renommage ne subsiste que
 * pour un VRAI conflit (même id, contenu différent) — là, garder les deux
 * reste le seul choix qui ne perd rien, et la console le dit.
 *
 * @param {Array} tableau - Tableau d'objets avec propriété .id
 * @param {string} nomCollection - Nom pour le log console (ex: 'productions')
 * @returns {Array} - Tableau sans doublons d'ID (filtré : ne pas ignorer le retour)
 */
function verifierUniciteIds(tableau, nomCollection) {
    if (!Array.isArray(tableau)) return tableau;
    const premiersParId = new Map();
    const garde = [];
    let nbEcartes = 0, nbConflits = 0;
    for (let i = 0; i < tableau.length; i++) {
        const item = tableau[i];
        if (!item || !item.id) { garde.push(item); continue; }
        const premier = premiersParId.get(item.id);
        if (!premier) {
            premiersParId.set(item.id, item);
            garde.push(item);
            continue;
        }
        // Doublon interne : même chose, ou vrai conflit ? L'id est identique
        // par hypothèse — on ne compare que le reste. `null` (non sérialisable)
        // ne conclut JAMAIS à l'identité : dans le doute, on garde.
        const sigPremier = signatureContenu(premier, ['id']);
        const sigItem = signatureContenu(item, ['id']);
        if (sigPremier !== null && sigPremier === sigItem) {
            nbEcartes++;   // copie à l'identique : écartée, rien à repointer
            continue;
        }
        const ancienId = item.id;
        item.id = genererIdUnique(ancienId.replace(/[0-9_]+$/, '').replace(/-+$/, '_'));
        premiersParId.set(item.id, item);
        garde.push(item);
        console.warn(`⚠️ [${nomCollection}] même id, contenu DIFFÉRENT — les deux sont conservés : ${ancienId} → ${item.id}`);
        nbConflits++;
    }
    if (nbEcartes > 0) {
        console.warn(`[${nomCollection}] ${nbEcartes} doublon(s) interne(s) au contenu identique écarté(s) sur ${tableau.length} éléments (#454).`);
    }
    if (nbConflits > 0) {
        console.warn(`⚠️ [${nomCollection}] ${nbConflits} conflit(s) réel(s) interne(s) : même id, contenu différent.`);
    }
    return garde;
}

/**
 * MODULE: import-export.js
 *
 * RÔLE:
 * Gère l'export de la configuration pédagogique et l'importation sélective
 * de données stockées via db.js (fichiers JSON ou ZIP)
 *
 * FONCTIONNALITÉS:
 * - Export de la configuration pédagogique (« Exporter ma config »)
 * - Import avec aperçu et confirmation
 * - Validation des fichiers JSON et ZIP
 *
 * LOT I BIS (D9, 30 sept. 2026) — la fenêtre des clés (« Toutes les clés ») et son
 * export sont RETIRÉS : l'application ne parle plus que du codex, et le cliquet
 * tests/unit/sentinelle-lot-I-bis-un-seul-terme.test.js refuse l'ancien nom de ce
 * fichier partout dans le dossier js/ et index.html. L'OUVERTURE d'un fichier déjà
 * fait (.json, ou .zip avec les travaux) reste, par previsualiserImport →
 * afficherModalPreviewLocalStorageBrut → executerImportSelectif : ces fichiers
 * existent chez les gens. Banc :
 * tests/integration/lot-i-bis-anciens-fichiers-s-ouvrent.spec.js.
 *
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 */

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

function initialiserModuleImportExport() {

    const modalImport = document.getElementById('modalImport');

    if (!modalImport) {
        console.warn('   Modale d\'import manquante');
    }
}

/* ===============================
   DÉTECTION HEURISTIQUE DES DONNÉES DÉMO
   (6 jan 2026) - Pour filtrer à l'export
   =============================== */

/**
 * Détecte si une ressource est du matériel démo basé sur des patterns connus
 * @param {Object} ressource - La ressource à vérifier
 * @param {string} type - Type de ressource ('grille', 'echelle', 'production', 'cartouche', 'pratique')
 * @returns {boolean} - True si c'est du matériel démo
 */
function estRessourceDemo(ressource, type) {
    if (!ressource) return false;

    // Si explicitement marqué comme démo
    if (ressource.estDemo || ressource.isDemo) return true;

    // Si importé d'un collègue
    if (ressource.auteurOriginal) return true;

    const nom = (ressource.nom || '').toLowerCase();

    // ⚠ LE MATÉRIEL SEMÉ EST RECONNU PAR SON IDENTIFIANT, PAS PAR SON NOM
    // (1er septembre 2026, §3 du PLAN-2026-09-01).
    //
    // Ces trois pièces étaient exclues de l'export parce que leur nom contenait
    // « (exemple) » ou « grille générique ». Le §3 les a renommées — elles se
    // disent maintenant « de départ », prêtes à servir telles quelles — et cette
    // heuristique de NOM serait tombée avec les anciens mots : un lot annoncé
    // comme « des libellés et de la présentation » aurait changé, en silence, ce
    // qui part dans un export.
    //
    // ⮕ L'identifiant ne bouge pas quand le vocabulaire bouge. Le comportement
    // d'export est donc RIGOUREUSEMENT INCHANGÉ pour la grille et la cartouche.
    // Seule `ECHELLE_IDME_DEPART` est nouvellement reconnue : son nom n'a jamais
    // porté ces mots, elle échappait au filtre que ses deux sœurs subissaient.
    // Les trois pièces du même triptyque sont désormais traitées pareil.
    const IDS_MATERIEL_SEME = ['GRILLE_GENERIQUE', 'CART_GENERIQUE', 'ECHELLE_IDME_DEPART'];
    if (ressource.id && IDS_MATERIEL_SEME.indexOf(ressource.id) >= 0) return true;

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
        case 'grille':
            // Grilles avec noms spécifiques démo
            if (nom.includes('grille générique') || nom.includes('grille démo')) return true;
            break;

        case 'echelle':
            // Échelles avec noms spécifiques démo
            if (nom.includes('échelle générique') || nom.includes('echelle générique')) return true;
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
 * Assainit une chaîne importée : vérifie le type, retire les balises HTML, tronque
 * @param {*} str - Valeur à assainir
 * @param {number} maxLen - Longueur maximale (défaut 500)
 * @returns {string} Chaîne nettoyée
 *
 * #585 (décision de Grégoire, 28 août 2026) : les balises partent AVANT la
 * troncature. Dans l'ordre inverse, une balise coupée par `maxLen` perdait son
 * `>` et `/<[^>]*>/` ne mordait plus : `'<img src=x onerror=alert(1)>M'` sur
 * 20 caractères ressortait en `'<img src=x onerror=a'`.
 * Ce qui reste hors de portée de cette fonction : un `<` sans `>` qui le ferme
 * (« note < 60 ») traverse, comme avant. C'est l'échappement à l'affichage
 * (`echapperHtml`, règle 1) qui le couvre, pas le filtre d'import.
 */
function assainirChaine(str, maxLen = 500) {
    if (typeof str !== 'string') return '';
    // Retirer les balises HTML (<...>)
    const resultat = str.replace(/<[^>]*>/g, '');
    // Puis tronquer si trop long
    return resultat.length > maxLen ? resultat.substring(0, maxLen) : resultat;
}

/**
 * #511 (25 août 2026) — CE QUE `SCHEMAS_IMPORT.production` N'EMPORTE PAS, ET POURQUOI.
 *
 * Le schéma est une liste blanche : une clé oubliée n'est pas signalée, elle
 * disparaît. C'est ainsi que tout le contenu pédagogique des productions a
 * voyagé vide pendant des mois. Le remède n'est pas seulement d'allonger la
 * liste — c'est de rendre l'oubli VISIBLE : la sentinelle #511 relit les clés
 * qu'écrit `construireProductionData` (productions.js) et exige que chacune
 * soit transportée OU inscrite ici, avec sa raison.
 *
 * Ajouter une clé au gabarit sans décider de son sort fera donc rougir un test,
 * plutôt que de perdre la donnée en silence.
 */
const CLES_PRODUCTION_NON_TRANSPORTEES = {
    // Rattachement LOCAL au cours actif au moment de la création. Le transporter
    // ferait apparaître une production reçue sous un cours homonyme du
    // destinataire, ou sous un cours qui n'existe pas chez lui. Le rattachement
    // est décidé à l'arrivée, par le chemin d'import — pas par le fichier.
    // ⚠ Conséquence assumée et INCHANGÉE depuis toujours : restaurer une archive
    // rend des productions sans `coursId`. À trancher séparément.
    coursId: 'rattachement local au cours actif — décidé à l\'arrivée, jamais par le fichier'
};

/**
 * AUDIT DU 28 AOÛT 2026 — CE QUE `SCHEMAS_IMPORT.echelle` N'EMPORTE PAS.
 *
 * Jumelle de `CLES_PRODUCTION_NON_TRANSPORTEES` (#511), et posée pour la même
 * raison : la liste blanche ne signale pas ce qu'elle oublie, elle le fait
 * disparaître. L'audit a trouvé six champs d'échelle perdus à l'import sélectif,
 * dont `valeurCalcul` — d'où des notes recalculées sur le repli `(min + max) / 2`,
 * avec des valeurs que l'utilisateur n'avait jamais choisies.
 *
 * `tests/unit/sentinelle-transport-echelles.test.js` relit la liste blanche de
 * `dupliquerEchelle` (echelles.js) et la constante `niveauxDefaut`, et exige que
 * chaque clé soit transportée OU inscrite ici, avec sa raison.
 */
const CLES_ECHELLE_NON_TRANSPORTEES = {
    // Trace de la source d'un import (`ajouterEchelleIndividuelle`, echelles.js).
    // Le transporter ferait répondre l'échelle reçue à l'identifiant de l'échelle
    // d'origine du destinataire : `obtenirEchelleResolue` résout par
    // `e.id === id || e.idOriginal === id` et prend le PREMIER du tableau (#542).
    // C'est exactement ce que la liste blanche de `dupliquerEchelle` évite.
    idOriginal: 'trace de la source d\'un import — la transporter ferait répondre la copie à l\'identifiant de la source (#542)'
};

/**
 * Lot 3 (10 oct. 2026) — UN NOMBRE ÉCRIT EN TEXTE EST UN NOMBRE. Les éditeurs
 * d'échelles écrivent `niveaux[].valeurCalcul` tel que le champ le rend, en texte
 * (« 40 », mesuré dans le codex de banc 1.172.0). Le type `'number'` le ramenait à 0 :
 * l'échelle importée calculait avec des valeurs que personne n'avait choisies.
 * Seul un texte qui est un nombre décimal simple est converti (virgule acceptée) ;
 * tout le reste retombe à 0, comme avant.
 */
function nombreImporte(valeur) {
    if (typeof valeur === 'number') return valeur;
    if (typeof valeur === 'string') {
        const texte = valeur.trim().replace(',', '.');
        if (/^-?\d+(\.\d+)?$/.test(texte)) return Number(texte);
    }
    return 0;
}

/**
 * Assainit un objet importé selon un schéma (whitelist de propriétés)
 * @param {Object} obj - Objet à assainir
 * @param {Object} schema - Schéma { nomProp: { type, maxLen?, schema? } }
 *   Types reconnus : 'string', 'number', 'boolean', 'array', 'object',
 *                    'mapStrings' (object à clés dynamiques, valeurs assainies en strings),
 *                    'mapObjets' (object à clés dynamiques, valeurs = objets assainis par spec.schema),
 *                    'numberOrNull' (nombre dont `null` est une valeur signifiante,
 *                                    non un vide : `'number'` le coercerait en 0),
 *                    'arrayStrings' (tableau de chaînes, chacune assainie),
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
                resultat[cle] = nombreImporte(valeur);
                break;
            case 'numberOrNull':
                // Un nombre dont `null` est une VALEUR, pas une absence.
                // ⚠ Pourquoi ce type existe (#668 Lot 4) : `'number'` coerce
                // `null` en `0`, et un `paliersProjection[].ratioMax` à 0 n'est
                // pas un palier terminal — c'est un seuil. La lecture le
                // rattrape (`evaluation-projection.js:282`, `max <= 0 → null`),
                // mais elle rattraperait une donnée déjà fausse EN BASE, et
                // `_palierNeuf` (`grilles.js:4874`) lit les paliers bruts sans
                // passer par ce rattrapage.
                resultat[cle] = valeur === null ? null : nombreImporte(valeur);
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
                if (spec.schema) {
                    // Relecture du lot 3 (10 oct. 2026) : avec un sous-schéma, une valeur
                    // qui n'est pas un objet non nul (tableau compris) est OMISE. Avant,
                    // elle passait telle quelle — une chaîne entrait sans assainirChaine.
                    if (typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)) {
                        resultat[cle] = assainirObjet(valeur, spec.schema);
                    }
                } else {
                    // Sans sous-schéma (`configuration`, `config`) : recopiée telle quelle,
                    // compromis assumé que l'échappement à l'affichage (lot 2) couvre.
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
            case 'arrayStrings':
                // #511 — tableau de chaînes courtes : identifiants de blocs
                // (`ordreBlocs`), codes de pratique (`pratiquesCompatibles`).
                // ⚠ `array` SANS sous-schéma copie le tableau TEL QUEL : ces
                // valeurs-là repartent dans des attributs HTML (`data-param`,
                // `data-champ-id`), elles doivent être assainies une à une.
                resultat[cle] = Array.isArray(valeur)
                    ? valeur.filter(v => typeof v === 'string').map(v => assainirChaine(v, spec.maxLen || 100))
                    : [];
                break;
            case 'mapObjets':
                // #511 — object à clés dynamiques dont les valeurs sont des
                // OBJETS assainis par `spec.schema`. Ex. `echeancesParGroupe` :
                // { '<groupeCoursId>': { assignee: bool, date: 'AAAA-MM-JJ' } }.
                // `mapStrings` ne convenait pas (valeurs non scalaires), et
                // `object` non plus (clés inconnues à l'avance).
                if (typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)) {
                    const carte = {};
                    for (const k in valeur) {
                        if (Object.prototype.hasOwnProperty.call(valeur, k)) {
                            const cleAssainie = assainirChaine(k, 200);
                            if (cleAssainie && typeof valeur[k] === 'object' && valeur[k] !== null) {
                                carte[cleAssainie] = assainirObjet(valeur[k], spec.schema || {});
                            }
                        }
                    }
                    resultat[cle] = carte;
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

/**
 * #467 (CO-39, 9 oct. 2026) — L'IMPORT D'UN FICHIER JSON DANS UNE BIBLIOTHÈQUE.
 *
 * Les cinq imports JSON de Bibliothèque (grilles, échelles, cartouches, productions,
 * pratiques) faisaient
 * `JSON.parse` puis fusionnaient tel quel : un nom reçu arrivait brut dans le
 * stockage, puis dans le `innerHTML` du destinataire.
 *
 * Pourquoi pas `assainirObjet` seul, comme les autres chemins : la liste blanche
 * fait DISPARAÎTRE ce qu'elle ne nomme pas (#511). Mesuré le 9 oct. sur le codex
 * de banc (fixture 1.172.0) : une grille y perdait `pratiques`, ses codes de
 * pratique, `criteres[].estStandard`, `metadata_cc.date_creation` ; une production `regles`
 * et `code` ; une cartouche perdrait `description`. Tout cela voyage aujourd'hui
 * par le fichier JSON. Compléter les listes blanches est l'affaire de l'import
 * sélectif (lot suivant), pas de celui-ci.
 *
 * Donc : toute chaîne perd ses balises ; une chaîne que le schéma nomme est en
 * plus bornée à sa longueur, comme sur les autres chemins. Les autres valeurs
 * (nombres, booléens, clés inconnues) sont gardées telles quelles. Rien n'est jeté.
 */
const CLES_RESERVEES_PROTOTYPE = ['__proto__', 'constructor', 'prototype'];

function retirerBalisesProfond(valeur) {
    if (typeof valeur === 'string') return valeur.replace(/<[^>]*>/g, '');
    if (Array.isArray(valeur)) return valeur.map(retirerBalisesProfond);
    if (valeur && typeof valeur === 'object') {
        const resultat = {};
        for (const k of Object.keys(valeur)) {
            if (CLES_RESERVEES_PROTOTYPE.includes(k)) continue;
            resultat[k] = retirerBalisesProfond(valeur[k]);
        }
        return resultat;
    }
    return valeur;
}

/**
 * Superpose les CHAÎNES de `selonSchema` (bornées en longueur) à `profond`, en
 * descendant dans les objets et tableaux. Seule une chaîne restée chaîne est
 * reprise du schéma : ses coercitions de type ne le sont pas. Mesuré le 9 oct.
 * dans le codex de banc (fixture 1.172.0) : `niveaux[].valeurCalcul` y vaut « 40 »
 * (une chaîne), que le type `number` du schéma ramène à 0.
 */
function superposerAssaini(profond, selonSchema) {
    if (Array.isArray(profond) && Array.isArray(selonSchema)) {
        return profond.map((v, i) => superposerAssaini(v, selonSchema[i]));
    }
    const estObjet = (v) => v && typeof v === 'object' && !Array.isArray(v);
    if (estObjet(profond) && estObjet(selonSchema)) {
        const resultat = { ...profond };
        for (const k of Object.keys(selonSchema)) {
            if (k in profond) resultat[k] = superposerAssaini(profond[k], selonSchema[k]);
        }
        return resultat;
    }
    return (typeof profond === 'string' && typeof selonSchema === 'string') ? selonSchema : profond;
}

/**
 * Assainit un élément reçu par un fichier JSON avant qu'il entre dans une Bibliothèque.
 * @param {*} item - L'élément lu dans le fichier
 * @param {string} type - Clé de `SCHEMAS_IMPORT` ('grille', 'echelle', 'cartouche', 'production', 'pratique')
 * @returns {*} Copie assainie (l'original n'est pas modifié)
 */
function assainirImportJson(item, type) {
    const schema = SCHEMAS_IMPORT[type];
    if (!schema) throw new Error('assainirImportJson : type inconnu « ' + type + ' »');
    const profond = retirerBalisesProfond(item);
    if (!profond || typeof profond !== 'object' || Array.isArray(profond)) return profond;
    // `assainirObjet` laisse passer tel quel un `array` ou un `object` sans
    // sous-schéma : la sortie du schéma repasse donc, elle aussi, par le retrait
    // des balises (sans effet sur une chaîne déjà assainie).
    return superposerAssaini(profond, retirerBalisesProfond(assainirObjet(item, schema)));
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
                date: { type: 'string', maxLen: 50 },
                modifications: { type: 'string', maxLen: 1000 }
            }
        },
        // Lot 3 (10 oct. 2026) — ce que `ajouterMetadonnéesCC` (cc-license.js) écrit
        // aussi, et que la liste blanche faisait disparaître à l'import sélectif et à
        // l'ajout en Bibliothèque. Recensé dans le code, pas seulement dans les fixtures.
        date_creation: { type: 'string', maxLen: 50 },
        date_modification: { type: 'string', maxLen: 50 },
        licence_url: { type: 'string', maxLen: 500 },
        licence_resume: { type: 'string', maxLen: 1000 },
        email_auteur: { type: 'string', maxLen: 200 },
        site_auteur: { type: 'string', maxLen: 500 },
        type: { type: 'string', maxLen: 100 },
        nom: { type: 'string', maxLen: 200 },
        version: { type: 'string', maxLen: 50 },
        attribution: { type: 'string', maxLen: 1000 },
        niveau: { type: 'string', maxLen: 100 },
        institution: { type: 'string', maxLen: 200 },
        discipline: { type: 'arrayStrings', maxLen: 100 },
        // La forme qu'écrit le formulaire CC d'une pratique (pratiques.js, cc-license.js).
        auteur: { type: 'string', maxLen: 100 },
        courriel: { type: 'string', maxLen: 200 },
        siteWeb: { type: 'string', maxLen: 500 }
    }
};

/**
 * Lot 3 (10 oct. 2026) — les deux champs CC que `cc-license.js` écrit à la RACINE
 * d'une ressource : `metadata` (quand `metadata_cc` manque, même contenu) et
 * `institution`. Communs aux cinq types.
 *
 * Ce qui reste HORS des listes blanches, délibérément (recensé le même jour) :
 * `idOriginal` et `inspireDeTrimestre` (traces locales d'un import ou d'un emprunt —
 * voir `CLES_ECHELLE_NON_TRANSPORTEES`, #542), `coursId` d'une production
 * (`CLES_PRODUCTION_NON_TRANSPORTEES`), `etablissement` d'une pratique (donnée
 * d'auteur, interdite au partage : `partage-schemas.js`), `inspireDe.idOriginal`.
 */
const CHAMPS_CC_RACINE = {
    metadata: SCHEMA_METADATA_CC,
    institution: { type: 'string', maxLen: 200 }
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
                obligatoire: { type: 'boolean' },
                estStandard: { type: 'boolean' },   // Lot 3 — critère d'un gabarit STD
                // Codes par grille (3 sept. 2026) — le geste d'activation voyage avec la grille.
                codesDepuisSousCriteres: { type: 'boolean' },
                facteurNormalisation: { type: 'number' },

                // #667 — le modèle de formule choisi par l'utilisateur et ses
                // paramètres. Absents du schéma, ils se perdaient au transport
                // et la grille importée calculait selon une AUTRE formule que
                // celle de son auteur·e.
                modeleFormule: { type: 'string', maxLen: 60 },
                // ⚠ Schéma FERMÉ, jamais `{ type: 'object' }` nu : sans schéma,
                // assainirObjet recopie la valeur telle quelle et un fichier
                // d'import ferait entrer un objet arbitraire dans la base.
                paramsFormule: {
                    type: 'object',
                    schema: {
                        facteurNormalisation: { type: 'number' },
                        motsParErreurCible: { type: 'number' },
                        pointsParErreur: { type: 'number' }
                    }
                },

                // #668 Lot 4 — LA PROJECTION EUF SE PERDAIT DE MÊME. Aucun des
                // trois champs n'était déclaré ici : une grille importée
                // projetait selon le modèle de MIGRATION et ses paliers
                // d'origine, quel que soit le réglage de son auteur·e.
                // ⚠ TROIS champs, pas deux. `modeleProjection` est le seul qui
                // décide du modèle (`evaluation-projection.js:315`) :
                // transporter les paramètres sans lui les ferait lire par un
                // modèle reconstitué — la classe de défaut de #667.
                modeleProjection: { type: 'string', maxLen: 60 },
                paramsProjection: {
                    type: 'object',
                    schema: {
                        motsReference: { type: 'number' },
                        erreursTolerees: { type: 'number' },
                        nomServiceAide: { type: 'string', maxLen: 200 },
                        lienServiceAide: { type: 'string', maxLen: 500 },
                        libelleSignalement: { type: 'string', maxLen: 200 }   // Lot 3 — #790
                    }
                },
                paliersProjection: {
                    type: 'array',
                    schema: {
                        cle: { type: 'string', maxLen: 100 },
                        libelle: { type: 'string', maxLen: 200 },
                        sansErreur: { type: 'boolean' },
                        leveSignalement: { type: 'boolean' },   // Lot 3 — #790
                        // `null` = palier TERMINAL. Voir `numberOrNull` : le
                        // type `'number'` en ferait un 0, c'est-à-dire un seuil.
                        ratioMax: { type: 'numberOrNull' },
                        texte: { type: 'string', maxLen: 5000 },
                        texteAide: { type: 'string', maxLen: 5000 }
                    }
                },

                // #581 — LES ÉNONCÉS DU CRITÈRE SE PERDRAIENT DE MÊME. Même
                // classe que #667 et #668 : un critère dont l'auteur·e a
                // réécrit les phrases arriverait avec celles par défaut.
                // ⚠ `modeleEnonces` est celui qui décide du modèle ; sans lui,
                // les textes seraient lus sous un modèle reconstitué depuis le
                // NOM du critère.
                modeleEnonces: { type: 'string', maxLen: 60 },
                // ⚠ Schéma FERMÉ, jamais `{ type: 'object' }` nu : sans schéma,
                // assainirObjet recopie la valeur telle quelle et un fichier
                // d'import ferait entrer un objet arbitraire dans la base.
                enonces: {
                    type: 'object',
                    schema: {
                        decompte:  { type: 'string', maxLen: 2000 },
                        priorite:  { type: 'string', maxLen: 2000 },
                        concentre: { type: 'string', maxLen: 2000 },
                        aucune:    { type: 'string', maxLen: 2000 }
                    }
                },

                // #511 — LES ONZE RÉTROACTIONS DE FRANÇAIS SE PERDAIENT AUSSI.
                // Un critère algorithmique porte ses catégories d'erreurs : ce
                // sont ELLES qui contiennent les textes rendus à l'étudiant·e,
                // parfois plusieurs centaines de mots chacun. Absentes du
                // schéma, elles disparaissaient au transport — la grille
                // arrivait structurellement intacte et pédagogiquement muette.
                sousCriteres: {
                    type: 'array',
                    schema: {
                        id: { type: 'string', maxLen: 100 },
                        code: { type: 'stringOrNumber', maxLen: 20 },
                        nom: { type: 'string', maxLen: 200 },
                        ponderation: { type: 'number' },
                        retroaction: { type: 'string', maxLen: 5000 },
                        // Codes par grille (3 sept. 2026) — la couleur du code sur la copie.
                        couleur: { type: 'string', maxLen: 20 }
                    }
                },
                // Structure antérieure aux sous-critères, encore lue par la
                // migration (`_categoriesmigrees`) : la transporter est ce qui
                // permet à cette migration de faire son travail à l'arrivée.
                categoriesErreurs: {
                    type: 'array',
                    schema: {
                        code: { type: 'stringOrNumber', maxLen: 20 },
                        nom: { type: 'string', maxLen: 200 },
                        retroaction: { type: 'string', maxLen: 5000 }
                    }
                },
                _categoriesmigrees: { type: 'boolean' }
            }
        },
        auteur: { type: 'string', maxLen: 100 },
        auteurOriginal: { type: 'string', maxLen: 100 },
        dateImport: { type: 'string', maxLen: 50 },
        dateCreation: { type: 'string', maxLen: 50 },
        dateModification: { type: 'string', maxLen: 50 },
        estDemo: { type: 'boolean' },
        isDemo: { type: 'boolean' },
        // Lot 1 (3 sept. 2026) — `grille.type`, le DÉFAUT des critères, passe par
        // cette ligne, qui existait avant lui. Témoin : sentinelle-type-grille-lot1.
        type: { type: 'string', maxLen: 50 },
        typeSPE: { type: 'boolean' },
        typeProductionId: { type: 'string', maxLen: 100 },
        description: { type: 'string', maxLen: 500 },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },
        // Lot 3 — perdus jusqu'ici (codex de banc 1.172.0, gabarits-utils.js, grilles.js).
        pratiques: { type: 'arrayStrings', maxLen: 50 },          // codes de pratique d'un gabarit
        pratiquesCompatibles: { type: 'arrayStrings', maxLen: 50 },
        estGabarit: { type: 'boolean' },
        baseSur: { type: 'string', maxLen: 100 },                 // filiation, lue par grilles.js
        discipline: { type: 'string', maxLen: 100 },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE,
        ...CHAMPS_CC_RACINE
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
                // ⚠ LES DEUX VOYAGENT, ET CE N'EST PAS UNE REDONDANCE.
                // `valeur` est le champ des échelles de CATALOGUE
                // (`echelles-bibliotheque.js`) ; `valeurCalcul` est celui que
                // les éditeurs d'echelles.js écrivent
                // (`data-champ="valeurCalcul"` dans `afficherNiveauxNouvelleEchelle`
                // et `afficherNiveauxEchelle` ; le troisième, `afficherTableauNiveaux`,
                // rendait dans un conteneur caché et est parti avec #658),
                // et que lisent `valeurNumeriqueDuNiveau` (echelles.js — LA règle
                // depuis #525), `_tableDepuisNiveaux` (profil-etudiant-calculs.js)
                // et `_construireConversion` (module Consolidation, retiré). Les données
                // réelles portent l'un ou l'autre selon leur origine.
                // ⚠ Cités par NOM et non par numéro de ligne : deux des trois
                // renvois de ce commentaire avaient glissé (`echelles.js:1540` ne
                // porte plus rien de tel ; `profil-etudiant-calculs.js:395` tombe
                // dans un JSDoc de diagnostic, pas dans une lecture). Un renvoi
                // faux est pire qu'aucun renvoi : il se recoupe une fois, échoue,
                // et on cesse d'y croire. Ne transporter que `valeur` — l'état
                // d'avant le 28 août — faisait retomber toute échelle importée sur
                // le repli `(min + max) / 2` : des notes calculées avec des valeurs
                // que l'utilisateur n'a jamais choisies (audit du 28 août 2026).
                valeur: { type: 'number' },
                valeurCalcul: { type: 'number' },
                // Étiquette SOLO du niveau (`niveauxDefaut`, `echelles.js:85`),
                // exportée au format recherche par `trimestres.js:1882`.
                niveauSOLO: { type: 'string', maxLen: 50 },
                couleur: { type: 'string', maxLen: 30 }
            }
        },
        // #555 (28 août 2026) — LES DEUX REPÈRES DE MAÎTRISE. Ce sont des CODES
        // de niveau ('D', 'M'…), pas des scores : ils ne valent que rapportés aux
        // `niveaux` transportés ci-dessus, qui voyagent avec eux dans le même objet.
        seuilSuffisance: { type: 'string', maxLen: 20 },
        seuilMaitrise: { type: 'string', maxLen: 20 },
        // Configuration de l'échelle : relue à l'ouverture (`echelles.js:646-656`)
        // et imprimée sur trois PDF (`export-pdf.js:517, 867, 945`).
        config: {
            type: 'object',
            schema: {
                typeEchelle: { type: 'string', maxLen: 50 },
                seuilReussite: { type: 'number' },
                notePassage: { type: 'string', maxLen: 20 },
                codesPersonnalises: { type: 'string', maxLen: 2000 }
            }
        },
        pratiquesCompatibles: { type: 'arrayStrings', maxLen: 50 },
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
        inspireDe: SCHEMA_INSPIRE_DE,
        ...CHAMPS_CC_RACINE
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
        // Lot 3 — LA CONFIGURATION DE CALCUL SE PERDAIT. `calcul_note.methode` décide
        // comment la note est calculée (wizard-pratique-v2.js) ; sans lui, la pratique
        // reçue retombait sur un défaut. Mesuré sur le codex de banc 1.172.0.
        calcul_note: {
            type: 'object',
            schema: {
                methode: { type: 'string', maxLen: 60 },
                // Aucun écrivain actuel ; même compromis que `configuration`.
                conditions_speciales: { type: 'array' }
            }
        },
        echelle: {
            type: 'object',
            schema: {
                type: { type: 'string', maxLen: 60 },
                niveaux: {
                    type: 'array',
                    schema: {
                        code: { type: 'string', maxLen: 20 },
                        label: { type: 'string', maxLen: 100 },
                        valeur_pourcentage: { type: 'number' },
                        ordre: { type: 'number' }
                    }
                }
            }
        },
        // Config exécutable résolue (pratiques.js, pratique-manager.js) : même
        // compromis que `configuration` ci-dessus, copiée brute.
        config: { type: 'object' },
        variante: { type: 'string', maxLen: 60 },
        reglesSpeciales: { type: 'arrayStrings', maxLen: 100 },
        nbEvaluationsPrevues: { type: 'number' },
        estMaquette: { type: 'boolean' },
        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE,
        ...CHAMPS_CC_RACINE
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
        diagnostique: { type: 'boolean' },   // #790 — sinon le marqueur ne survit à aucun import/export
        grilleId: { type: 'string', maxLen: 100 },
        echelleId: { type: 'string', maxLen: 100 },
        pratiqueId: { type: 'string', maxLen: 100 },
        cartoucheId: { type: 'string', maxLen: 100 },
        dansBibliotheque: { type: 'boolean' },
        dateAjoutBiblio: { type: 'string', maxLen: 50 },

        // #511 (25 août 2026) — LE CONTENU PÉDAGOGIQUE VOYAGE ENFIN.
        //
        // ⚠⚠ Ce schéma est une LISTE BLANCHE : ce qui n'y figure pas est
        // silencieusement écarté. Or deux chemins vivants l'appliquent —
        // `ajouterALaBibliotheque` (partager une production) et l'import
        // sélectif d'archives (la restaurer). Les deux rendaient donc une
        // production VIDE de ses consignes : ni objectif, ni tâche, ni détail,
        // ni pondération, ni blocs nommés par l'enseignant·e. Partager sa
        // production, c'était partager une coquille — et personne ne le disait.
        //
        // ⚠ `maxLen` généreux sur les champs libres : `detailTache` porte les
        // consignes remises aux étudiant·es (étapes numérotées, contraintes de
        // format). Une troncature à 500 caractères y aurait coupé au milieu
        // d'une phrase, en silence elle aussi.
        ponderation: { type: 'number' },
        objectif: { type: 'string', maxLen: 2000 },
        tache: { type: 'string', maxLen: 2000 },
        detailTache: { type: 'string', maxLen: 20000 },
        champsPersonnalises: {                                   // #499
            type: 'array',
            schema: {
                id: { type: 'string', maxLen: 100 },
                titre: { type: 'string', maxLen: 200 },
                contenu: { type: 'string', maxLen: 20000 }
            }
        },
        titresBlocs: { type: 'mapStrings', maxLen: 200 },        // #500
        ordreBlocs: { type: 'arrayStrings', maxLen: 100 },       // #500
        pratiquesCompatibles: { type: 'arrayStrings', maxLen: 50 },
        categorie: { type: 'string', maxLen: 100 },
        modeCalcul: { type: 'string', maxLen: 50 },
        verrouille: { type: 'boolean' },
        // Les dates par groupe-cours (#468/CO-17). Les identifiants de groupe
        // sont LOCAUX : chez un destinataire qui ne les connaît pas, l'entrée
        // est simplement ignorée (`obtenirEcheanceEffective` retombe sur
        // `dateEcheance`). Les perdre, en revanche, était une perte sèche à la
        // restauration d'une archive.
        echeancesParGroupe: {
            type: 'mapObjets',
            schema: {
                assignee: { type: 'boolean' },
                date: { type: 'string', maxLen: 50 }
            }
        },
        // Lot 3 — perdus jusqu'ici (pack démo, codex de banc 1.172.0). `regles` est lu
        // par portfolio.js et productions.js : combien de productions retenir.
        regles: {
            type: 'object',
            schema: {
                nombreARetenir: { type: 'number' },
                minimumCompletion: { type: 'number' },
                nombreTotal: { type: 'number' }
            }
        },
        code: { type: 'string', maxLen: 50 },

        metadata_cc: SCHEMA_METADATA_CC,
        inspireDe: SCHEMA_INSPIRE_DE,
        ...CHAMPS_CC_RACINE
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
        // Lot 3 — le contenu que cartouches.js écrit et que la liste blanche jetait.
        description: { type: 'string', maxLen: 2000 },
        contexteSpecifique: { type: 'string', maxLen: 2000 },
        pratiquesCompatibles: { type: 'arrayStrings', maxLen: 50 },
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
        inspireDe: SCHEMA_INSPIRE_DE,
        ...CHAMPS_CC_RACINE
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
   IMPORT DES DONNÉES
   =============================== */

function ouvrirModalImport() {
    const modal = document.getElementById('modalImport');
    document.getElementById('fichierImport').value = '';
    document.getElementById('apercu-import').classList.add('u-hide');
    modal.classList.remove('u-hide');
    
    document.getElementById('fichierImport').onchange = previsualiserImport;
}

function fermerModalImport() {
    document.getElementById('modalImport').classList.add('u-hide');
}

/**
 * LOT I BIS (1er oct. 2026) — un codex choisi dans la case « Ouvrir un Codex » s'ouvre par
 * le chemin du menu Codex, avec ses confirmations (modèle antérieur, rechargement). Avant,
 * la case le refusait par une alerte qui renvoyait au menu, alors que ses mots disent
 * « Ouvre un codex ou une configuration partagée ». La fenêtre d'import se ferme : la suite
 * (progression, bilan, rechargement) appartient au codex.
 */
/**
 * T2 du chantier du démo (décision G1 de Grégoire, 6 oct. 2026) — un fichier ancien sans
 * manifeste (format « localStorage brut ») porte souvent le démo d'un autre jour. Ni l'aperçu,
 * ni l'import complet, ni l'import par cases ne l'écrivent : même sélection, par identité, que
 * l'ouverture d'un codex (`Codex.partDuDemo`). Les valeurs de ces anciens fichiers peuvent être
 * des chaînes JSON : la sélection lit leur forme parsée, le fichier garde la sienne.
 * @param {Object} donnees - le contenu du fichier (avec `_zipTravaux` éventuel)
 * @returns {Object} un nouvel objet, sans les clés `demo_*` ni les vignettes du démo
 */
function _sansLeDemoDuFichier(donnees) {
    if (!donnees || !window.Codex || typeof window.Codex.partDuDemo !== 'function') return donnees;
    const vue = {};
    Object.keys(donnees).forEach(c => {
        let v = donnees[c];
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { /* une chaîne */ } }
        vue[c] = v;
    });
    const part = window.Codex.partDuDemo(vue);
    const reste = {};
    Object.keys(donnees).forEach(c => { if (!part.cles[c]) reste[c] = donnees[c]; });
    return reste;
}

/**
 * #1046 (lot 7, 11 oct. 2026) — LES RESSOURCES DES TRIMESTRES D'UN FICHIER RÉCENT.
 *
 * Depuis #358 et S5/#623, grilles, échelles, pratiques et cartouches vivent sous la clé de leur
 * trimestre (`a2031_grillesTemplates`, `a2031_cartouches_<grille>`). L'import sélectif ne les
 * cherchait que sous les clés nues : un fichier récent n'offrait pas ses grilles. Cette vue les
 * REPLIE sur les clés nues, avant l'aperçu et avant l'import : elles prennent ensuite exactement
 * le chemin des clés nues (assainissement, renommages, rebranchements, identité des cartouches
 * du lot 3) et entrent dans le trimestre actif.
 *
 * Règles :
 *   · seuls les préfixes de trimestre (`a|e|h` + année) : `demo_…` n'est jamais proposé, même si
 *     le retrait du démo (`_sansLeDemoDuFichier`) n'a pas eu lieu ;
 *   · un fichier ancien (clés nues seules) est rendu tel quel : la même vue qu'avant, à l'identique ;
 *   · sinon, les trimestres d'abord, du plus récent au plus ancien, PUIS la clé nue. Une ressource
 *     dont l'id est déjà là n'est ajoutée qu'une fois : même id, même contenu, c'est la même ; même
 *     id, contenu différent, la plus récente l'emporte (supposition retenue par Cowork, lot 7).
 *     La clé nue passe en dernier (correction de Cowork, 11 oct. 2026, 8 h 42) : dans un fichier
 *     récent, elle est un reste (migration S5/#623 inachevée, import sélectif d'avant le lot 3),
 *     jamais plus récente qu'un trimestre. Une ressource sans id n'est jamais fusionnée.
 * Ne modifie pas `donnees` : rend une copie superficielle.
 */
const FAMILLES_DES_TRIMESTRES = ['grillesTemplates', 'echellesTemplates', 'pratiquesConfigurables'];
function _ressourcesDesTrimestresSurLesClesNues(donnees) {
    if (!donnees || typeof donnees !== 'object') return donnees;
    const lireListe = (v) => {
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { return null; } }
        return Array.isArray(v) ? v : null;
    };
    // h < e < a dans une même année : l'ordre du calendrier.
    const rang = (t) => Number(t.slice(1)) * 10 + ({ h: 1, e: 2, a: 3 })[t.charAt(0)];
    const parCible = {};   // clé nue → [{ trimestre, liste }]
    Object.keys(donnees).forEach(c => {
        const m = /^([aeh]\d{4})_(.+)$/.exec(c);
        if (!m) return;
        const nom = m[2];
        if (FAMILLES_DES_TRIMESTRES.indexOf(nom) === -1 && nom.indexOf('cartouches_') !== 0) return;
        const liste = lireListe(donnees[c]);
        if (!liste || liste.length === 0) return;
        (parCible[nom] = parCible[nom] || []).push({ trimestre: m[1], liste: liste });
    });
    const cibles = Object.keys(parCible);
    if (cibles.length === 0) return donnees;

    const vue = { ...donnees };
    cibles.forEach(nom => {
        const sources = parCible[nom].sort((x, y) => rang(y.trimestre) - rang(x.trimestre)).map(x => x.liste);
        sources.push(lireListe(donnees[nom]) || []);   // la clé nue en dernier
        const fusion = [];
        const vus = new Set();
        sources.forEach(liste => {
            liste.forEach(r => {
                if (r && r.id) {
                    if (vus.has(r.id)) return;
                    vus.add(r.id);
                }
                fusion.push(r);
            });
        });
        vue[nom] = fusion;
    });
    return vue;
}

function confierAuCodex(fichier) {
    fermerModalImport();
    return window.Codex.ouvrirFichier(fichier);
}

async function previsualiserImport(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const estZip = fichier.name.endsWith('.zip') || fichier.type === 'application/zip';

    // Un codex part au codex AVANT la limite de taille et AVANT toute lecture complète : le
    // menu Codex n'a pas cette limite, et le reconnaître ne lit que le répertoire du ZIP
    // (un codex d'environ 1 Go ne passe donc pas deux fois par la mémoire).
    if (estZip && await window.Codex.estUnFichierDeCodex(fichier) === true) {
        return confierAuCodex(fichier);
    }

    // Limite de taille : 1 Go pour ZIP, 50 Mo pour JSON
    const limiteOctets = estZip
        ? 1024 * 1024 * 1024
        : TAILLE_MAX_IMPORT_OCTETS;

    if (fichier.size > limiteOctets) {
        alert(`Fichier trop volumineux (${(fichier.size / 1024 / 1024).toFixed(1)} Mo).\n\nLimite : ${(limiteOctets / 1024 / 1024).toFixed(0)} Mo.`);
        return;
    }

    const nomFichier = fichier.name;

    // 🆕 Détection format ZIP (backup avec fichiers travaux)
    if (estZip && typeof JSZip !== 'undefined') {
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

                // Filet (lot I bis) : un codex que la lecture du r\u00e9pertoire n'a pas su
                // reconna\u00eetre (octets ajout\u00e9s devant le ZIP, par exemple) et que JSZip, plus
                // tol\u00e9rant, lit quand m\u00eame. Il part au codex lui aussi : sans ce filet, son
                // donnees.json serait pris pour un fichier de donn\u00e9es d'une version ant\u00e9rieure.
                if (zip.file('codex-manifeste.json') || zip.file('classeur-manifeste.json')) {
                    confierAuCodex(fichier);
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
                    configCompleteEnAttente = _sansLeDemoDuFichier(configCompleteEnAttente);   // T2 (G1)
                    configCompleteEnAttente._format = 'localStorage-brut';
                    afficherModalPreviewLocalStorageBrut(configCompleteEnAttente, nomFichier);
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
                configCompleteEnAttente = _sansLeDemoDuFichier(configCompleteEnAttente);   // T2 (G1)
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(configCompleteEnAttente, nomFichier);
            }
        } catch (err) {
            alert('Erreur lors de l\'analyse du fichier.\n\nDétails dans la console (F12).');
            console.error('Erreur analyse import:', err);
        }
    };
    lecteur.readAsText(fichier);
}

/** Les entrées d'un ZIP importé qui portent le fichier d'une copie (`travaux/<id>.<ext>`). */
function _entreesZipDeLaCopie(zip, id) {
    return zip.file(new RegExp('^travaux/' + String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.')) || [];
}

/**
 * #1012 — la liste des copies d'un fichier importé par les cases S'AJOUTE à celle de
 * l'espace : aucune copie déjà là ne perd son entrée, et aucune entrée déjà là n'est
 * réécrite. Une copie dont l'identifiant existe déjà : l'espace l'emporte.
 *
 * Pas `fusionnerParIdentite` : devant un même id au contenu différent, elle renomme
 * l'entrant et garde les deux. Pour une copie, l'id est aussi la clé de son fichier
 * au magasin : une entrée renommée n'aurait pas de fichier.
 *
 * @param {Array} copiesEspace - la liste de l'espace, telle que stockée
 * @param {Array} copiesFichier - la liste du fichier importé
 * @returns {{liste: Array, nouvelles: Array, dejaLa: Array}} `liste` : les entrées de
 *          l'espace, intactes et dans leur ordre, puis les `nouvelles` ; `dejaLa` : les
 *          entrées DE L'ESPACE dont l'id est aussi dans le fichier.
 */
function fusionnerCopiesImportees(copiesEspace, copiesFichier) {
    const base = Array.isArray(copiesEspace) ? copiesEspace : [];
    const parId = new Map();
    base.forEach(f => { if (f && f.id) parId.set(f.id, f); });

    const nouvelles = [];
    const dejaLa = [];
    const vus = new Set();
    (Array.isArray(copiesFichier) ? copiesFichier : []).forEach(f => {
        if (!f) return;
        // Sans identifiant, rien ne permet de dire « déjà là » : elle entre, comme avant.
        if (!f.id) { nouvelles.push(f); return; }
        if (vus.has(f.id)) return;
        vus.add(f.id);
        if (parId.has(f.id)) dejaLa.push(parId.get(f.id));
        else nouvelles.push(f);
    });
    return { liste: base.concat(nouvelles), nouvelles: nouvelles, dejaLa: dejaLa };
}

/**
 * #1012 (les quatre cases, consigne de Cowork du 2 oct. 2026) — ce qui fait « la même chose »
 * dans les données personnelles d'un trimestre. Chaque famille rend les MARQUES d'une entrée ;
 * une entrée du fichier qui partage une marque avec une entrée de l'espace est déjà là.
 * `espace` : les marques publiées par une entrée de l'espace ; `fichier` : celles qu'une entrée
 * du fichier cherche.
 *  · étudiants : le DA ;
 *  · présences : la date, le DA et le cours ; un `coursId` absent d'un côté = même cours
 *    (comme saisie-presences.js) ;
 *  · notes : l'`id`, et le couple élève × production. Une évaluation du fichier n'entre que si
 *    l'espace n'a AUCUNE évaluation de ce couple : une reprise du fichier sur une originale de
 *    l'espace laisserait deux évaluations actives (l'originale de l'espace n'étant pas archivée),
 *    et changerait la note de l'élève ;
 *  · annotations : l'`id`, et la copie annotée (une copie n'a qu'une annotation).
 * Une entrée sans aucune marque se reconnaît à son contenu entier.
 */
const MARQUES_DONNEES_PERSO = {
    etudiants: {
        espace: e => (e.da ? ['da:' + e.da] : []),
        fichier: e => (e.da ? ['da:' + e.da] : [])
    },
    presences: {
        espace: p => (p.date && p.da ? ['p:' + p.date + '|' + p.da + '|' + (p.coursId || ''), 'p:' + p.date + '|' + p.da + '|*'] : []),
        fichier: p => (p.date && p.da ? (p.coursId ? ['p:' + p.date + '|' + p.da + '|' + p.coursId, 'p:' + p.date + '|' + p.da + '|']
                                                     : ['p:' + p.date + '|' + p.da + '|*']) : [])
    },
    notes: {
        espace: e => _marquesEvaluation(e),
        fichier: e => _marquesEvaluation(e)
    },
    annotations: {
        espace: a => _marquesAnnotation(a),
        fichier: a => _marquesAnnotation(a)
    }
};

function _marquesEvaluation(e) {
    const m = [];
    if (e.id) m.push('id:' + e.id);
    if (e.etudiantDA && e.productionId) m.push('couple:' + e.etudiantDA + '|' + e.productionId);
    return m;
}

function _marquesAnnotation(a) {
    const m = [];
    if (a.id) m.push('id:' + a.id);
    if (a.fichierId) m.push('fichier:' + a.fichierId);
    return m;
}

function _estValeurVide(v) {
    if (v === null || v === undefined) return true;
    if (Array.isArray(v)) return v.length === 0;
    return typeof v === 'object' && Object.keys(v).length === 0;
}

/**
 * #1012 — les cases « Étudiants », « Présences », « Notes » et « Annotations » de l'import par
 * cases. Avant, chacune REMPLAÇAIT la valeur de l'espace par celle du fichier (`db.set`). Ce que
 * le fichier apporte s'ajoute ; rien de ce que l'espace a ne perd son entrée ni n'est réécrit ;
 * une même chose des deux côtés (MARQUES_DONNEES_PERSO), l'espace l'emporte. Les entrées du
 * fichier ne se comparent qu'à l'espace : le même fichier rouvert ne double rien.
 * Une valeur qui n'est pas une liste (un ancien format) n'est écrite que si l'espace n'a rien.
 * Fonction pure, testable en Vitest.
 * @param {*} valeurEspace - la valeur de la clé dans l'espace (null si absente)
 * @param {*} valeurFichier - la valeur de la même clé dans le fichier
 * @param {string} famille - 'etudiants' | 'presences' | 'notes' | 'annotations'
 * @returns {{valeur: *, ecrire: boolean, entrees: number}} `entrees` : ce qui est entré
 */
function fusionnerDonneesPersoImportees(valeurEspace, valeurFichier, famille) {
    const marques = MARQUES_DONNEES_PERSO[famille];
    if (!marques) throw new Error('Famille inconnue : ' + famille);
    if (!Array.isArray(valeurFichier)) {
        if (valeurFichier && typeof valeurFichier === 'object' && _estValeurVide(valeurEspace)) {
            return { valeur: valeurFichier, ecrire: true, entrees: Object.keys(valeurFichier).length };
        }
        return { valeur: valeurEspace, ecrire: false, entrees: 0 };
    }
    if (!Array.isArray(valeurEspace) && !_estValeurVide(valeurEspace)) {
        return { valeur: valeurEspace, ecrire: false, entrees: 0 };
    }
    const base = Array.isArray(valeurEspace) ? valeurEspace : [];
    const dejaLa = new Set();
    base.forEach(e => {
        if (!e || typeof e !== 'object') return;
        const m = marques.espace(e);
        if (m.length === 0) dejaLa.add('contenu:' + JSON.stringify(e));
        m.forEach(x => dejaLa.add(x));
    });
    const nouvelles = valeurFichier.filter(e => {
        if (!e || typeof e !== 'object') return false;
        const m = marques.fichier(e);
        if (m.length === 0) return !dejaLa.has('contenu:' + JSON.stringify(e));
        return !m.some(x => dejaLa.has(x));
    });
    return { valeur: base.concat(nouvelles), ecrire: nouvelles.length > 0, entrees: nouvelles.length };
}

/**
 * #1012, les mots (décision de Grégoire, 2 oct. 2026, 15 h 05) — « N date(s) de présences »
 * compte des DATES distinctes (une date de cours, tous élèves confondus), et non des fiches
 * (une par élève et par jour). Une valeur qui n'est pas une liste (un ancien format, rangé
 * par date) compte ses clés. Fonction pure.
 * @param {*} valeur - une liste de fiches `{ date, da, … }`, ou un ancien objet
 * @returns {number}
 */
function compterDatesPresences(valeur) {
    if (Array.isArray(valeur)) {
        return new Set(valeur.filter(p => p && typeof p === 'object' && p.date).map(p => String(p.date))).size;
    }
    return valeur && typeof valeur === 'object' ? Object.keys(valeur).length : 0;
}

/**
 * #1012, les mots (décision de Grégoire, 2 oct. 2026, 15 h 07) — la ligne du bilan pour les
 * élèves supprimés que l'import a écartés. Vide quand il n'y en a aucun. Fonction pure.
 * @param {number} n - le nombre d'élèves (DA distincts) écartés
 * @returns {string}
 */
function ligneElevesEcartes(n) {
    if (!n) return '';
    return n === 1
        ? '1 élève que tu avais supprimé n\'a pas été ramené.'
        : n + ' élèves que tu avais supprimés n\'ont pas été ramenés.';
}

/**
 * #1012, l'élève désinscrit (décision de Grégoire, 2 oct. 2026) — les élèves qu'un ancien
 * fichier ne ramène plus : les DA de la trace `<trim>_elevesDesinscrits` (écrite par
 * « Supprimer ») qui ne sont pas dans la liste du trimestre. Un DA ajouté de nouveau à la
 * liste après sa suppression n'est plus écarté : il est inscrit.
 * @param {Array} trace - `[{ da, date }]`
 * @param {Array} etudiantsEspace - la liste `groupeEtudiants` du même trimestre
 * @returns {Set<string>}
 */
function dasElevesEcartes(trace, etudiantsEspace) {
    const inscrits = new Set((Array.isArray(etudiantsEspace) ? etudiantsEspace : [])
        .filter(e => e && e.da).map(e => String(e.da)));
    const ecartes = new Set();
    (Array.isArray(trace) ? trace : []).forEach(t => {
        if (t && t.da && !inscrits.has(String(t.da))) ecartes.add(String(t.da));
    });
    return ecartes;
}

/**
 * #1013 — les élèves supprimés du trimestre actif, pour l'affichage : la même règle que
 * l'import (`dasElevesEcartes`), lue dans la trace et la liste ENTIÈRE du trimestre (tous
 * cours confondus : la liste filtrée par cours ferait passer un élève d'un autre cours pour
 * supprimé). Un élève ajouté de nouveau à la liste n'y est plus, et revient avec tout.
 * Les vues filtrent par elle à l'affichage ; rien n'est écrit, aucune clé n'est touchée.
 * @returns {Set<string>}
 */
function dasElevesSupprimes() {
    return dasElevesEcartes(db.getSync(cle('elevesDesinscrits'), []), db.getSync(cle('groupeEtudiants'), []));
}

/** Le DA porté par une entrée de chaque famille de l'import par cases. */
const DA_PAR_FAMILLE = {
    etudiants: e => e.da,
    presences: p => p.da,
    notes: e => e.etudiantDA,
    copies: f => f.etudiantDA,
    annotations: a => a.etudiantDA
};

/**
 * #1012, l'élève désinscrit — retire d'une liste du fichier ce qui appartient à un élève
 * écarté (`dasElevesEcartes`), AVANT la fusion : rien de lui n'entre, et une copie écartée
 * ne dépose pas son fichier. Une annotation s'écarte aussi par la copie qu'elle annote
 * (`idsCopiesEcartees`), quand elle ne porte pas le DA. Fonction pure, sauf `vus` : le DA de
 * chaque entrée écartée y est ajouté (la ligne du bilan compte les élèves, pas les entrées).
 * @param {Array} liste - la liste du fichier
 * @param {string} famille - une clé de DA_PAR_FAMILLE
 * @param {Set<string>} ecartes
 * @param {Set<string>|Map<string,string>} [idsCopiesEcartees] - une Map donne le DA de la copie
 * @param {Set<string>} [vus] - reçoit les DA écartés
 * @returns {Array} la liste sans eux (la même liste quand rien n'est écarté)
 */
function ecarterElevesDesinscrits(liste, famille, ecartes, idsCopiesEcartees, vus) {
    const daDe = DA_PAR_FAMILLE[famille];
    if (!daDe) throw new Error('Famille inconnue : ' + famille);
    if (!Array.isArray(liste) || !ecartes || ecartes.size === 0) return liste;
    return liste.filter(e => {
        if (!e || typeof e !== 'object') return true;
        const da = daDe(e);
        if (da && ecartes.has(String(da))) {
            if (vus) vus.add(String(da));
            return false;
        }
        if (famille === 'annotations' && idsCopiesEcartees && e.fichierId && idsCopiesEcartees.has(e.fichierId)) {
            const daCopie = typeof idsCopiesEcartees.get === 'function' ? idsCopiesEcartees.get(e.fichierId) : null;
            if (vus && daCopie) vus.add(String(daCopie));
            return false;
        }
        return true;
    });
}

/**
 * #1012 — la case « Fichiers travaux » de l'import par cases. Avant, chaque liste du
 * fichier REMPLAÇAIT celle de l'espace (`db.set`) : les copies de l'espace n'avaient
 * plus d'entrée, leurs fichiers restaient au magasin sans rien qui les désigne, et
 * « Mettre à jour le codex » écrivait ensuite un codex sans elles, sans fenêtre
 * (l'avertissement compte les entrées de la liste).
 *
 * Une copie déjà là garde son entrée ET son fichier. Seule exception, qui ne détruit
 * rien : le magasin n'a pas de fichier pour elle, elle n'est pas « exporte » (celle-là
 * a quitté l'application, c'est voulu), et le ZIP en porte un. Le fichier entre alors,
 * rangé sous l'association de l'espace, et un statut « manquant » redevient « present »
 * (comme le geste « Re-déposer » de travaux-import.js).
 *
 * @param {Object<string, Array>} listesDuFichier - clé `*fichiersTravaux` → liste du fichier
 * @param {Object|null} zipTravaux - le ZIP importé, ou null (un `.json` n'a pas de copies)
 * @returns {Promise<{ajoutees: number, blobs: {restaures: number, manquants: number}|null}>}
 *          `blobs` : null quand aucun fichier ne pouvait être restauré (pas de ZIP).
 */
async function _ajouterCopiesImportees(listesDuFichier, zipTravaux) {
    const magasinOffert = !!zipTravaux && typeof travauxStockage !== 'undefined';
    const donneesBlobs = { _zipTravaux: zipTravaux };
    const idsAttendusDeRetour = new Set();
    let ajoutees = 0;

    for (const cleFT of Object.keys(listesDuFichier)) {
        // #522 lot 7 : lire, fusionner, écrire dans la file de la clé (db.modifier) — une copie
        // déposée pendant l'aller-retour n'est plus écrasée. N'écrit que s'il y a du neuf, comme avant.
        let fusion;
        await db.modifier(cleFT, (lus) => {
            fusion = fusionnerCopiesImportees(lus, listesDuFichier[cleFT]);
            return fusion.nouvelles.length > 0 ? fusion.liste : undefined;
        }, []);
        ajoutees += fusion.nouvelles.length;
        if (!magasinOffert) continue;

        const sansFichier = [];
        for (const f of fusion.dejaLa) {
            if (f.blobStatut === 'exporte' || _entreesZipDeLaCopie(zipTravaux, f.id).length === 0) continue;
            // Dans le doute (le magasin ne répond pas), on ne remplace rien.
            let fichierAuMagasin = true;
            try { fichierAuMagasin = !!(await travauxStockage.recupererBlob(f.id)); } catch (e) { /* on ne remplace rien */ }
            if (!fichierAuMagasin) { sansFichier.push(f); idsAttendusDeRetour.add(f.id); }
        }
        donneesBlobs[cleFT] = fusion.nouvelles.concat(sansFichier);
    }
    if (!magasinOffert) return { ajoutees: ajoutees, blobs: null };

    const bilan = await _restaurerBlobsDepuisZip(donneesBlobs);
    // Revenu ou non : on le lit au magasin lui-même, pas dans le compte de la restauration.
    const revenues = new Set();
    for (const id of idsAttendusDeRetour) {
        try { if (await travauxStockage.recupererBlob(id)) revenues.add(id); } catch (e) { /* pas revenu */ }
    }
    if (revenues.size > 0) {
        for (const cleFT of Object.keys(listesDuFichier)) {
            // #522 lot 7 : dans la file de la clé ; n'écrit que si un statut change, comme avant.
            await db.modifier(cleFT, (liste) => {
                if (!Array.isArray(liste)) return undefined;
                let change = false;
                liste.forEach(f => {
                    if (f && revenues.has(f.id) && f.blobStatut === 'manquant') { f.blobStatut = 'present'; change = true; }
                });
                return change ? liste : undefined;
            }, []);
        }
    }
    return { ajoutees: ajoutees, blobs: bilan };
}

/**
 * 🆕 Restaure les blobs travaux depuis un ZIP importé
 * Utilisé par _ajouterCopiesImportees()
 * @param {Object} donnees - Données importées, avec éventuellement _zipTravaux
 * @returns {Promise<{restaures: number, manquants: number}>} Bilan de la restauration
 */
async function _restaurerBlobsDepuisZip(donnees) {
    // #613 (audit chaîne d'importation 30 août 2026, constat S8) : le retour est
    // un BILAN, jamais un nombre nu — y compris sur les sorties anticipées. Un
    // appelant qui lirait `.restaures` sur un nombre obtiendrait `undefined`,
    // qui s'affiche comme un zéro sans que rien ne le signale.
    if (!donnees._zipTravaux || typeof travauxStockage === 'undefined') return { restaures: 0, manquants: 0 };

    const zip = donnees._zipTravaux;
    // #384 : TOUTES les clés fichiersTravaux (une par trimestre) — symétrique
    // à l'export ; l'ancien `find` ne restaurait que la première.
    const metadonnees = [];
    for (const cleFT of Object.keys(donnees).filter(c => c.includes('fichiersTravaux'))) {
        if (Array.isArray(donnees[cleFT])) metadonnees.push(...donnees[cleFT]);
    }

    if (metadonnees.length === 0) return { restaures: 0, manquants: 0 };

    let nbRestores = 0;
    const idsManquants = [];
    const auxArchives = (window.ReserveCopies && typeof window.ReserveCopies.idsDansDonnees === 'function')
        ? window.ReserveCopies.idsDansDonnees(donnees) : {};
    for (const f of metadonnees) {
        // #613 : même garde que `chargerCodex` (codex.js, chemin « ouvrir » —
        // PAS la fusion, qui itère sur les entrées réellement présentes dans le
        // ZIP et où le cas est structurellement absent). Ici on itère sur les
        // MÉTADONNÉES, donc la garde est nécessaire : un `blobStatut: 'exporte'`
        // n'a LÉGITIMEMENT pas de blob dans le ZIP (le blob avait quitté l'app
        // au moment de l'export). Le compter manquant annoncerait « partiel »
        // un import où rien n'est perdu.
        // #1028 : ni une copie aux archives (marquée ici, ou dans les données importées).
        const blobAttendu = f.blobStatut !== 'exporte' && !auxArchives[f.id] &&
            !(window.ReserveCopies && window.ReserveCopies.estAuxArchives(f.id));
        try {
            const entries = _entreesZipDeLaCopie(zip, f.id);
            if (entries.length > 0) {
                const blob = await entries[0].async('blob');
                // #385 (audit 5 août, rapport A4) : même garde que le chemin
                // codex (codex.js) — un ZIP altéré peut contenir un blob
                // malveillant déguisé en image/PDF. Règle CLAUDE.md :
                // validerMagicBytes sur TOUT blob importé.
                if (window.travauxImport && typeof window.travauxImport.validerMagicBytes === 'function') {
                    const magicOk = await window.travauxImport.validerMagicBytes(blob);
                    if (!magicOk) {
                        console.warn(`[Import ZIP] Blob refusé (magic bytes invalides) pour ${f.id}`);
                        idsManquants.push(f.id);
                        continue;
                    }
                }
                // #613 : notifier:false — une notification de quota PAR blob
                // refusé est une avalanche de bandeaux ; le bilan est rendu une
                // seule fois par l'appelant (même patron que `chargerCodex`).
                await travauxStockage.stockerBlob(f.id, blob, f.etudiantDA, f.productionId, { notifier: false });
                nbRestores++;
            } else if (blobAttendu) {
                console.warn(`[Import ZIP] Blob attendu mais absent du ZIP pour ${f.id}`);
                idsManquants.push(f.id);
            }
        } catch (e) {
            console.warn(`[Import ZIP] Erreur restauration blob ${f.id}:`, e);
            // #613 : `blobAttendu` gouverne les TROIS portes de sortie, sinon la
            // même question reçoit deux réponses selon la branche empruntée.
            if (blobAttendu) idsManquants.push(f.id);
        }
    }

    // #613 : marquer les métadonnées dont le blob n'est pas arrivé, pour que la
    // visionneuse affiche « manquant » plutôt qu'un cadre vide. Les clés
    // fichiersTravaux viennent d'être écrites par l'appelant : on relit l'état
    // réellement stocké au lieu du snapshot importé. Un `'exporte'` n'est jamais
    // écrasé — ce serait perdre l'information que le blob a quitté l'app.
    if (idsManquants.length > 0) {
        const manquants = new Set(idsManquants);
        for (const cleFT of Object.keys(donnees).filter(c => c.includes('fichiersTravaux'))) {
            // #522 lot 7 : dans la file de la clé ; écrit comme avant (toute liste lue, même inchangée).
            await db.modifier(cleFT, (liste) => {
                if (!Array.isArray(liste)) return undefined;
                liste.forEach(f => {
                    if (manquants.has(f.id) && f.blobStatut !== 'exporte') f.blobStatut = 'manquant';
                });
                return liste;
            }, []);
        }
    }
    return { restaures: nbRestores, manquants: idsManquants.length };
}

/* ===============================
   RÉINITIALISATION
   =============================== */

async function reinitialiserDonnees() {
    // #1007 (2 oct. 2026) : un codex à part d'abord (`Codex.ecrireAPartAvantSuppression`) ; les
    // trois confirmations ensuite, telles qu'avant. Module du codex absent : rien n'est effacé.
    if (typeof Codex === 'undefined' || !Codex || typeof Codex.ecrireAPartAvantSuppression !== 'function') return;
    if (!(await Codex.ecrireAPartAvantSuppression(
        'Réinitialiser efface pour de bon toutes tes données : tes trimestres, tes étudiant·es, tes évaluations, ' +
        'tes présences, tes productions, tes captures, tes modèles et tes réglages.'
    ))) return;

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
                configCompleteEnAttente = _sansLeDemoDuFichier(configCompleteEnAttente);   // T2 (G1)
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(configCompleteEnAttente, fichier.name);

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

    // #387 (audit 5 août, rapport A6) : détection des clés namespacées par
    // PATRON de préfixe trimestre ([ahe]AAAA_ ou demo_), plus jamais par une
    // année codée en dur — « 2026 » refusait les sauvegardes 2027+ (« Fichier
    // non reconnu ») alors que la plupart des clés reconnaissables sont
    // namespacées depuis #358/#328.
    if (nbClesReconnues >= 2 || clesPresentes.some(c => /^(?:[ahe]\d{4}|demo)_/.test(c))) {
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

    // Le prénom n'a pas de repli (retirés le 1er oct. 2026 : « collègue », « tes données ») :
    // les deux branches exigent un nom d'auteur·e non vide, et extraireNomEnseignant le rend
    // sans espace au début. Son premier mot existe donc toujours ; aucun geste n'atteignait le repli.
    const sourceLabel = estCollègue
        ? `Configuration de ${auteurImport.split(' ')[0]}`
        : restaurationNouvelAppareil
            ? `Restauration de ${auteurImport.split(' ')[0]}`
            : sourceInconnue
                ? 'Source inconnue'
                : 'Fichier personnel';

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
                            <span style="font-size: 0.9rem; color: var(--gris-fonce);"><strong>C'est mon propre fichier</strong> – Je confirme qu'il m'appartient</span>
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
    // #1046 : les ressources des trimestres du fichier, repliées sur les clés nues.
    config = _ressourcesDesTrimestresSurLesClesNues(config);
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
                const nbDates = compterDatesPresences(presences);
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
 * Le format brut passe par sa propre modale (`executerImportSelectif`) ; #1047 a retiré sa branche morte ici.
 */
async function executerImportConfigComplete() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;


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
        const remapCartouches = {};   // #654 — rempli par la fusion des cartouches

        // Récupérer les ressources existantes
        const echellesExistantes = db.getSync(cle('echellesTemplates'), []);
        const grillesExistantes = db.getSync(cle('grillesTemplates'), []);

        // Index par id pour comparer CONTENU à contenu, pas seulement
        // constater la collision (#448).
        const echellesParId = new Map(echellesExistantes.filter(e => e && e.id).map(e => [e.id, e]));
        const grillesParId = new Map(grillesExistantes.filter(g => g && g.id).map(g => [g.id, g]));

        // 1. Importer les échelles avec détection de conflits
        if (contenu.echelles && contenu.echelles.length > 0) {
            const echellesAImporter = contenu.echelles.map(echelle => {
                const enPlace = echelle && echelle.id ? echellesParId.get(echelle.id) : null;
                if (enPlace) {
                    // ⚠ #448 : un id déjà présent ne suffit PAS à conclure au
                    // conflit. Si le contenu est identique, c'est le MÊME
                    // élément qui revient — remapper fabriquerait un jumeau.
                    const sigA = signatureContenu(enPlace, ['id']);
                    const sigB = signatureContenu(echelle, ['id']);
                    if (sigA !== null && sigA === sigB) return echelle;   // fusionnerParIdentite l'écartera

                    const ancienId = echelle.id;
                    const nouvelId = genererIdUnique('ECH_');
                    remapEchelles[ancienId] = nouvelId;
                    return { ...echelle, id: nouvelId };
                }
                return echelle;
            });

            const fusionE = fusionnerParIdentite(echellesExistantes, echellesAImporter, 'échelles');
            db.setSync(cle('echellesTemplates'), fusionE.liste);
        }

        // 2. Importer les grilles avec détection de conflits
        if (contenu.grilles && contenu.grilles.length > 0) {
            const grillesAImporter = contenu.grilles.map(grille => {
                const enPlace = grille && grille.id ? grillesParId.get(grille.id) : null;
                if (enPlace) {
                    // ⚠⚠ #448, LA FORME LA PLUS INSIDIEUSE. Remapper une
                    // grille identique déplace SES CARTOUCHES vers un magasin
                    // `cartouches_<nouvelId>` que plus rien ne référence : un
                    // magasin fantôme, invisible à l'écran. C'est ce qui est
                    // arrivé le 27 juin (8 cartouches à 0 citation).
                    const sigA = signatureContenu(enPlace, ['id']);
                    const sigB = signatureContenu(grille, ['id']);
                    if (sigA !== null && sigA === sigB) return grille;   // pas de remap : la grille EST celle-là

                    const ancienId = grille.id;
                    const nouvelId = genererIdUnique('GRILLE_');
                    remapGrilles[ancienId] = nouvelId;
                    return { ...grille, id: nouvelId };
                }
                return grille;
            });

            const fusionG = fusionnerParIdentite(grillesExistantes, grillesAImporter, 'grilles');
            db.setSync(cle('grillesTemplates'), fusionG.liste);
        }

        // 3. Importer les cartouches avec mise à jour des clés (grilleId)
        // #654 (26 sept. 2026) — AVANT les productions : une cartouche en conflit
        // (même id, contenu différent) reçoit un id neuf dans `fusionnerParIdentite`,
        // et la production importée qui la désignait doit être rebranchée dessus.
        // Traitées après, les productions partaient déjà écrites avec l'ancien id.
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
                const cartouchesExistantes = db.getSync(cle(`cartouches_${grilleIdFinal}`), []);

                // Sanitiser chaque cartouche reçu avant fusion. Les commentaires
                // (clés dynamiques `<critereId>_<niveauCode>`) sont assainis via
                // le type `mapStrings`. Voir MODELE-MENACES.md §3.1.bis (D-01).
                const cartouchesAssainis = cartouchesGrille.map(c => assainirObjet(c, SCHEMAS_IMPORT.cartouche));

                // Fusionner par IDENTITÉ (#448) : une cartouche déjà présente
                // à l'identique n'est pas réimportée. C'est ce chemin qui a
                // produit les quatre paires 75/0, 79/0, 50/0, 50/0 du 24 mars.
                const fusionC = fusionnerParIdentite(cartouchesExistantes, cartouchesAssainis, 'cartouches');
                db.setSync(cle(`cartouches_${grilleIdFinal}`), fusionC.liste);
                Object.assign(remapCartouches, fusionC.renommages);

                nbCartouchesTotal += fusionC.ajoutes;
            });

        }

        // 4. Importer les productions avec mise à jour des références (grilles, échelles, cartouches)
        // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
        if (contenu.productions && contenu.productions.length > 0) {
            const cleProductions = cle('productions');
            const productionsExistantes = db.getSync(cleProductions, []);

            const prodsParId = new Map(productionsExistantes.filter(p => p && p.id).map(p => [p.id, p]));

            const productionsAImporter = contenu.productions.map(production => {
                // Créer une copie de la production
                const prod = { ...production };

                // ⚠ #448 : l'ancien code renommait dès que l'id existait, donc
                // réimporter le même codex fabriquait une production jumelle.
                // On ne renomme que si le CONTENU diffère réellement ; à
                // l'identique, `fusionnerParIdentite` l'écartera plus bas.
                const prodEnPlace = prod.id ? prodsParId.get(prod.id) : null;
                let identiqueEnPlace = false;
                if (prodEnPlace) {
                    const sigA = signatureContenu(prodEnPlace, ['id']);
                    const sigB = signatureContenu(prod, ['id']);
                    if (sigA === null || sigA !== sigB) {
                        prod.id = genererIdUnique('PROD_');
                    } else {
                        identiqueEnPlace = true;
                    }
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

                // #654 — rebrancher sur la cartouche renommée pour conflit. SAUF une
                // production déjà en place à l'identique : `fusionnerParIdentite`
                // l'écarte, et la toucher ici la ferait passer pour différente — une
                // production jumelle naîtrait. Celle en place garde sa cartouche.
                if (!identiqueEnPlace && prod.cartoucheId && remapCartouches[prod.cartoucheId]) {
                    prod.cartoucheId = remapCartouches[prod.cartoucheId];
                }

                return prod;
            });

            // Fusionner avec productions existantes
            const fusionP = fusionnerParIdentite(productionsExistantes, productionsAImporter, 'productions');
            db.setSync(cleProductions, fusionP.liste);
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
            await window.rechargerSiLeServeurRepond(); // #795
        }

    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import de la configuration:', erreur);
        alert('Erreur lors de l\'import de la configuration.\n\n' + erreur.message);
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
    // #1046 : les ressources des trimestres du fichier, repliées sur les clés nues (la même vue que l'aperçu).
    const donnees = _ressourcesDesTrimestresSurLesClesNues({ ...config });
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

    // #1012, l'élève désinscrit : par trimestre (le préfixe de la clé du fichier, celle que
    // l'import écrit), les DA qu'un ancien fichier ne ramène plus, et les copies de ces élèves
    // (du fichier et de l'espace) par lesquelles une annotation sans DA s'écarte.
    const ecartesParPrefixe = new Map();
    const dasEcartesVus = new Set();
    const elevesEcartes = async (cleFichier, nom) => {
        const i = cleFichier.indexOf(nom);
        const prefixe = i > 0 ? cleFichier.slice(0, i) : '';
        if (!ecartesParPrefixe.has(prefixe)) {
            const das = dasElevesEcartes(await db.get(prefixe + 'elevesDesinscrits', []),
                                         await db.get(prefixe + 'groupeEtudiants', []));
            const copies = new Map();
            if (das.size > 0) {
                const fichier = parseValeur(donnees[prefixe + 'fichiersTravaux']);
                const espace = await db.get(prefixe + 'fichiersTravaux', []);
                [fichier, espace].forEach(l => (Array.isArray(l) ? l : []).forEach(f => {
                    if (f && f.id && f.etudiantDA && das.has(String(f.etudiantDA))) copies.set(f.id, String(f.etudiantDA));
                }));
            }
            ecartesParPrefixe.set(prefixe, { das: das, copies: copies });
        }
        return ecartesParPrefixe.get(prefixe);
    };

    try {
        let compteurs = { ressources: 0, donnees: 0 };
        let details = [];

        // Auteur source pour marquage des imports
        const auteurSource = analyseImportEnCours?.auteurImport || '';

        // ========== RESSOURCES PÉDAGOGIQUES (fusion avec sélection individuelle) ==========
        // Lot 3 de la file (#664, #952 — 10 oct. 2026) : L'ORDRE EST CELUI DES DÉPENDANCES.
        // Grilles et échelles d'abord : ce sont elles que l'import renomme pour conflit, et
        // chacun de leurs blocs tient sa table ancien id → nouvel id. Puis les cartouches, les
        // pratiques et les productions, qui les désignent et sont rebranchées par ces tables —
        // le patron de l'import complet ci-dessus et de `reserve-ouvrir.js`. Avant, les
        // pratiques passaient les premières et aucune table n'existait : une production reçue
        // gardait l'id d'une grille renommée, donc désignait la grille LOCALE de même id.
        // Le message de fin garde son ordre d'avant (pratiques, grilles, échelles, cartouches,
        // productions) : chaque bloc range sa ligne dans `bilan`, assemblé à la fin.
        const remapGrilles = {};
        const remapEchelles = {};
        const remapCartouches = {};
        const bilan = {};
        const rebrancher = (id, table) =>
            (id && Object.prototype.hasOwnProperty.call(table, id)) ? table[id] : id;

        // Grilles - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('grilles')) {
            const grillesExistantes = db.getSync(cle('grillesTemplates'), []);
            const selectedIds = getCheckedItemIds('grilles');
            let grillesNouvelles = [];

            ['grillesTemplates', 'bibliothequeGrilles'].forEach(cleSource => {
                if (donnees[cleSource]) {
                    const grillesImport = parseValeur(donnees[cleSource]);
                    if (Array.isArray(grillesImport)) {
                        grillesImport.forEach(g => {
                            // Vérifier si cet item est sélectionné
                            const estSelectionne = selectedIds.includes(g.id) || selectedIds.includes(g.nom);
                            if (!estSelectionne) return;
                            // Une grille de même nom est tenue pour déjà là, et écartée. Ce qui
                            // désigne la grille reçue suit alors celle-là (#952) : sinon, au
                            // second passage, ses cartouches iraient sous la grille LOCALE de même id.
                            // Seulement si elle porte les mêmes ids de critères (relecture du
                            // 10 oct.) : sinon, aucune entrée dans la table — l'état d'avant le lot.
                            const memeNom = grillesExistantes.find(ge => ge.nom === g.nom) ||
                                grillesNouvelles.find(gn => gn.nom === g.nom);
                            if (memeNom) {
                                if (g.id && memeNom.id && memeNom.id !== g.id &&
                                    memesIdentifiantsElements(g, memeNom, 'criteres', 'id')) {
                                    remapGrilles[g.id] = memeNom.id;
                                }
                            } else {
                                // Garder l'ID original sauf si conflit d'ID — et alors, le noter (#952)
                                const idExiste = grillesExistantes.some(ge => ge.id === g.id);
                                const nouvelId = idExiste ? genererIdUnique('GRILLE_') : null;
                                if (nouvelId) remapGrilles[g.id] = nouvelId;
                                grillesNouvelles.push({
                                    ...assainirObjet(g, SCHEMAS_IMPORT.grille),
                                    ...(nouvelId ? { id: nouvelId } : {}),
                                    dateImport: new Date().toISOString(),
                                    auteurOriginal: assainirChaine(auteurSource || g.auteurOriginal || '', 100)
                                });
                            }
                        });
                    }
                }
            });

            if (grillesNouvelles.length > 0) {
                db.setSync(cle('grillesTemplates'), fusionnerParIdentite(grillesExistantes, grillesNouvelles, 'grilles').liste);
                compteurs.ressources += grillesNouvelles.length;
                bilan.grilles = `${grillesNouvelles.length} grille(s)`;
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
                    .filter(e => {
                        // Même règle que les grilles (#952) : une échelle de même nom est tenue
                        // pour déjà là ; ce qui désigne l'échelle reçue suit celle-là — si elle
                        // porte les mêmes codes de niveaux (relecture du 10 oct.).
                        const memeNom = echellesExistantes.find(ee => ee.nom === e.nom);
                        if (memeNom && e.id && memeNom.id && memeNom.id !== e.id &&
                            memesIdentifiantsElements(e, memeNom, 'niveaux', 'code')) {
                            remapEchelles[e.id] = memeNom.id;
                        }
                        return !memeNom;
                    })
                    .map(e => {
                        // Garder l'ID original sauf si conflit d'ID — et alors, le noter (#952)
                        const idExiste = echellesExistantes.some(ee => ee.id === e.id);
                        const nouvelId = idExiste ? genererIdUnique('ECH_') : null;
                        if (nouvelId) remapEchelles[e.id] = nouvelId;
                        return {
                            ...assainirObjet(e, SCHEMAS_IMPORT.echelle),
                            ...(nouvelId ? { id: nouvelId } : {}),
                            dateImport: new Date().toISOString(),
                            auteurOriginal: assainirChaine(auteurSource || e.auteurOriginal || '', 100)
                        };
                    });
                if (echellesNouvelles.length > 0) {
                    db.setSync(cle('echellesTemplates'), fusionnerParIdentite(echellesExistantes, echellesNouvelles, 'échelles').liste);
                    compteurs.ressources += echellesNouvelles.length;
                    bilan.echelles = `${echellesNouvelles.length} échelle(s)`;
                }
            }
        }

        // #654 (26 sept. 2026) — les cartouches passent AVANT les productions : une
        // cartouche en conflit reçoit un id neuf dans `fusionnerParIdentite`, et la
        // production importée qui la désignait est rebranchée dessus (plus bas).
        // Cartouches - #383 (audit 5 août, rapport A2) : la modale liste UNE ligne
        // par grille avec data-item-id = clé `cartouches_<grilleId>` — le filtre
        // se fait donc PAR CLÉ. L'ancien filtre comparait les ids AGRÉGÉS de la
        // modale (`cartouches_0`, `cartouches_1`…) aux ids INDIVIDUELS des
        // cartouches : aucune correspondance possible, cocher « Cartouches »
        // n'importait JAMAIS rien.
        if (hasCheckedItems('cartouches')) {
            const selectedIds = getCheckedItemIds('cartouches');
            let nbCartouches = 0;
            let nbDejaPresentes = 0;
            Object.keys(donnees).forEach(cleFichier => {
                if (cleFichier.startsWith('cartouches_') && selectedIds.includes(cleFichier)) {
                    const cartouches = parseValeur(donnees[cleFichier]);
                    if (Array.isArray(cartouches) && cartouches.length > 0) {
                        // #655 — rangées dans le TRIMESTRE ACTIF, par `cle()`, comme à l'import
                        // complet. La variable de boucle s'appelait `cle` et masquait la fonction :
                        // les cartouches allaient sous la clé nue du fichier, que le trimestre
                        // actif ne lit pas (namespacée depuis S5/#623).
                        // #952 — et sous le nouvel id de leur grille, si elle a été renommée.
                        const grilleIdFichier = cleFichier.slice('cartouches_'.length);
                        const cleCible = cle('cartouches_' + rebrancher(grilleIdFichier, remapGrilles));
                        const cartouchesExistantes = db.getSync(cleCible, []);
                        // Assainir via SCHEMAS_IMPORT.cartouche (descend dans
                        // criteres, niveaux, commentaires — MODELE-MENACES §3.1.bis).
                        const cartouchesSelectionnees = cartouches
                            .map(c => {
                                const assainie = assainirObjet(c, SCHEMAS_IMPORT.cartouche);
                                if (assainie.grilleId) assainie.grilleId = rebrancher(assainie.grilleId, remapGrilles);
                                if (assainie.echelleId) assainie.echelleId = rebrancher(assainie.echelleId, remapEchelles);
                                return {
                                    ...assainie,
                                    dateImport: new Date().toISOString(),
                                    auteurOriginal: assainirChaine(auteurSource || c.auteurOriginal || '', 100)
                                };
                            });
                        if (cartouchesSelectionnees.length > 0) {
                            // #954 — l'identité se juge SANS les champs que l'import pose lui-même :
                            // `dateImport` (l'instant) rendait chaque cartouche différente de
                            // celle en place, qui entrait en conflit et naissait en double.
                            const fusionC = fusionnerParIdentite(cartouchesExistantes, cartouchesSelectionnees,
                                'cartouches', CHAMPS_POSES_PAR_L_IMPORT);
                            db.setSync(cleCible, fusionC.liste);
                            Object.assign(remapCartouches, fusionC.renommages);
                            nbCartouches += fusionC.ajoutes + fusionC.conflits;
                            nbDejaPresentes += fusionC.ignores;
                        }
                    }
                }
            });
            if (nbCartouches > 0) {
                compteurs.ressources += nbCartouches;
                bilan.cartouches = `${nbCartouches} cartouche(s)`;
            }
            // #954 — mots neufs, à relire par Cowork.
            if (nbDejaPresentes > 0) {
                bilan.cartouchesDejaPresentes = `${nbDejaPresentes} cartouche(s) déjà présente(s) à l'identique, non ajoutée(s)`;
            }
        }

        // Pratiques - ✅ MODIFIÉ pour import sélectif individuel
        // #664 — après les échelles : son `echelleId` suit une échelle renommée pour conflit.
        if (hasCheckedItems('pratiques') && donnees.pratiquesConfigurables) {
            const pratiquesImport = parseValeur(donnees.pratiquesConfigurables);
            const selectedIds = getCheckedItemIds('pratiques');

            if (Array.isArray(pratiquesImport) && pratiquesImport.length > 0) {
                const pratiquesExistantes = db.getSync(cle('pratiquesConfigurables'), null) || [];
                const idsPratiquesExistants = new Set(pratiquesExistantes.map(p => p.id));
                // 🆕 FIX (31 jan 2026) : Filtrer par ID (pas par nom) pour préserver les références
                const pratiquesNouvelles = pratiquesImport
                    .filter(p => selectedIds.includes(p.id) || selectedIds.includes(p.nom))
                    .filter(p => !idsPratiquesExistants.has(p.id)) // Éviter doublons par ID uniquement
                    .map(p => {
                        const assainie = assainirObjet(p, SCHEMAS_IMPORT.pratique);
                        if (assainie.echelleId) assainie.echelleId = rebrancher(assainie.echelleId, remapEchelles);
                        return {
                            ...assainie,
                            // IMPORTANT: Garder l'ID original pour préserver les références
                            dateImport: new Date().toISOString(),
                            auteurOriginal: assainirChaine(auteurSource || p.auteurOriginal || '', 100)
                        };
                    });
                if (pratiquesNouvelles.length > 0) {
                    db.setSync(cle('pratiquesConfigurables'), fusionnerParIdentite(pratiquesExistantes, pratiquesNouvelles, 'pratiques').liste);
                    compteurs.ressources += pratiquesNouvelles.length;
                    bilan.pratiques = `${pratiquesNouvelles.length} pratique(s)`;
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
        Object.keys(donnees).forEach(cleSource => {
            if (cleSource === 'productions' || cleSource.endsWith('_productions')) {
                const prods = parseValeur(donnees[cleSource]);
                if (Array.isArray(prods) && prods.length > 0) {
                    clesProdsSource.push(cleSource);
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
                    const assainie = assainirObjet(p, SCHEMAS_IMPORT.production);
                    // #952 — rebranchée sur la grille et l'échelle renommées pour conflit ;
                    // #654 — et sur la cartouche.
                    if (assainie.grilleId) assainie.grilleId = rebrancher(assainie.grilleId, remapGrilles);
                    if (assainie.echelleId) assainie.echelleId = rebrancher(assainie.echelleId, remapEchelles);
                    if (assainie.cartoucheId) assainie.cartoucheId = rebrancher(assainie.cartoucheId, remapCartouches);
                    return {
                        ...assainie,
                        // Garder l'ID original sauf si conflit d'ID
                        ...(idExiste ? { id: genererIdUnique('PROD_') } : {}),
                        dateImport: new Date().toISOString(),
                        auteurOriginal: assainirChaine(auteurSource || p.auteurOriginal || '', 100)
                    };
                });
            if (prodsNouvelles.length > 0) {
                db.setSync(cleProductions, fusionnerParIdentite(prodsExistantes, prodsNouvelles, 'productions').liste);
                compteurs.ressources += prodsNouvelles.length;
                bilan.productions = `${prodsNouvelles.length} production(s)`;
            }
        }

        ['pratiques', 'grilles', 'echelles', 'cartouches', 'cartouchesDejaPresentes', 'productions'].forEach(famille => {
            if (bilan[famille]) details.push(bilan[famille]);
        });
        // ========== DONNÉES DU COURS ==========
        // #1012 : « Étudiants », « Présences », « Notes » et « Annotations » s'AJOUTENT à ce que
        // l'espace a (fusionnerDonneesPersoImportees) ; les comptes disent ce qui est entré.
        // Les autres cases remplacent encore (inscrit sous #1012).
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
                        etudiants = ecarterElevesDesinscrits(etudiants, 'etudiants', (await elevesEcartes(cleEtu, 'groupeEtudiants')).das, null, dasEcartesVus);
                        // #522 lot 7 : lire, fusionner, écrire dans la file de la clé (db.modifier) ; n'écrit que si
                        // la fusion le demande, comme avant.
                        var resEtu;
                        await db.modifier(cleEtu, function(lus) {
                            resEtu = fusionnerDonneesPersoImportees(lus, etudiants, 'etudiants');
                            return resEtu.ecrire ? resEtu.valeur : undefined;
                        }, null);
                        nbEtudiants += resEtu.entrees;
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
                        presences = ecarterElevesDesinscrits(presences, 'presences', (await elevesEcartes(clePres, 'presences')).das, null, dasEcartesVus);
                        // #522 lot 7 : lire, fusionner, écrire dans la file de la clé (db.modifier) ; n'écrit que si
                        // la fusion le demande, comme avant.
                        var resPres;
                        await db.modifier(clePres, function(lus) {
                            resPres = fusionnerDonneesPersoImportees(lus, presences, 'presences');
                            return resPres.ecrire ? resPres.valeur : undefined;
                        }, null);
                        // #1012, les mots : les dates distinctes des fiches ENTRÉES, pas les fiches.
                        // Une fiche entrée est une fiche du fichier que la fusion a gardée telle quelle.
                        var gardeesPres = new Set(Array.isArray(resPres.valeur) ? resPres.valeur : []);
                        var entreesPres = Array.isArray(presences) ? presences.filter(p => gardeesPres.has(p))
                            : (resPres.ecrire ? resPres.valeur : []);
                        nbDates += compterDatesPresences(entreesPres);
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
                    if (data && typeof data === 'object') {
                        var nomEval = cleEval.endsWith('evaluationsSauvegardees') ? 'evaluationsSauvegardees'
                            : cleEval.endsWith('notesEtudiants') ? 'notesEtudiants' : 'evaluations';
                        data = ecarterElevesDesinscrits(data, 'notes', (await elevesEcartes(cleEval, nomEval)).das, null, dasEcartesVus);
                        // #522 lot 7 : lire, fusionner, écrire dans la file de la clé (db.modifier) ; n'écrit que si
                        // la fusion le demande, comme avant.
                        var resEval;
                        await db.modifier(cleEval, function(lus) {
                            resEval = fusionnerDonneesPersoImportees(lus, data, 'notes');
                            return resEval.ecrire ? resEval.valeur : undefined;
                        }, null);
                        nbEvals += resEval.entrees;
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
        // #1012 : les copies du fichier s'AJOUTENT à celles de l'espace (elles ne
        // remplacent plus la liste) ; les comptes disent ce qui est entré.
        if (isChecked('fichiersTravaux')) {
            var listesCopies = {};
            for (var cleFT of Object.keys(donnees)) {
                if (cleFT.includes('fichiersTravaux')) {
                    var fichiersTravaux = parseValeur(donnees[cleFT]);
                    if (Array.isArray(fichiersTravaux)) {
                        fichiersTravaux = ecarterElevesDesinscrits(fichiersTravaux, 'copies', (await elevesEcartes(cleFT, 'fichiersTravaux')).das, null, dasEcartesVus);
                    }
                    if (Array.isArray(fichiersTravaux) && fichiersTravaux.length > 0) listesCopies[cleFT] = fichiersTravaux;
                }
            }
            var zipTravaux = configCompleteEnAttente ? configCompleteEnAttente._zipTravaux : null;
            var resCopies = await _ajouterCopiesImportees(listesCopies, zipTravaux);
            let nbFichiers = resCopies.ajoutees;
            var resBlobs = resCopies.blobs;
            if (resBlobs) {
                // #613 : les fichiers non restaurés sont dits, pas avalés.
                var suffixeManquants = resBlobs.manquants
                    ? ' — ' + resBlobs.manquants + ' non restauré(s), marqué(s) « manquant »'
                    : '';
                if (resBlobs.restaures > 0) {
                    details.push(nbFichiers + ' fichier(s) travaux + ' + resBlobs.restaures + ' PDF restauré(s)' + suffixeManquants);
                } else if (nbFichiers > 0 || resBlobs.manquants > 0) {
                    details.push(nbFichiers + ' fichier(s) travaux (métadonnées)' + suffixeManquants);
                }
            } else if (nbFichiers > 0) {
                details.push(nbFichiers + ' fichier(s) travaux (métadonnées, sans blobs)');
            }
            if (nbFichiers > 0 || (resBlobs && resBlobs.restaures > 0)) compteurs.donnees++;
        }

        // Annotations travaux
        if (isChecked('annotationsTravaux')) {
            var nbAnnotations = 0;
            for (var cleAT of Object.keys(donnees)) {
                if (cleAT.includes('annotationsTravaux')) {
                    var annotations = parseValeur(donnees[cleAT]);
                    if (Array.isArray(annotations) && annotations.length > 0) {
                        var ecartesAT = await elevesEcartes(cleAT, 'annotationsTravaux');
                        annotations = ecarterElevesDesinscrits(annotations, 'annotations', ecartesAT.das, ecartesAT.copies, dasEcartesVus);
                        // #522 lot 7 : lire, fusionner, écrire dans la file de la clé (db.modifier) ; n'écrit que si
                        // la fusion le demande, comme avant.
                        var resAT;
                        await db.modifier(cleAT, function(lus) {
                            resAT = fusionnerDonneesPersoImportees(lus, annotations, 'annotations');
                            return resAT.ecrire ? resAT.valeur : undefined;
                        }, null);
                        nbAnnotations += resAT.entrees;
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
        // #1012, les mots : la ligne des élèves supprimés écartés paraît même quand rien n'entre.
        const ligneEcartes = ligneElevesEcartes(dasEcartesVus.size);
        const suiteEcartes = ligneEcartes ? '\n\n' + ligneEcartes : '';

        if (total === 0) {
            if (!quelqueChoseCoche) {
                alert('Coche au moins un élément à importer.');
            } else {
                alert('Aucune nouvelle donnée à importer.\n\nLes éléments sélectionnés existent déjà (même nom).' + suiteEcartes);
            }
        } else {
            const message = `Import réussi !\n\n${details.join('\n')}${suiteEcartes}\n\nTotal : ${total} élément(s) importé(s).`;

            notifications.succes(message);
            alert(message);

            // Écritures IDB pendantes terminées AVANT le reload (bug terrain
            // iPad 10 juin 2026 — cf. codex.js actionOuvrir, même patron).
            await db.flush();
            if (confirm('Recharger la page pour voir les changements ?')) {
                await window.rechargerSiLeServeurRepond(); // #795
            }
        }


    } catch (erreur) {
        configCompleteEnAttente = null;
        console.error('Erreur lors de l\'import sélectif:', erreur);
        // #393 (audit 5 août, rapport A8) : les clés écrites AVANT l'échec
        // restent écrites — resynchroniser le cache et le dire, plutôt qu'une
        // erreur muette sur un état à moitié importé.
        try { await db.syncToLocalStorageCache(); } catch (e2) { /* best-effort */ }
        alert('Import interrompu : ' + erreur.message + '\n\nLes éléments déjà importés avant l\'erreur sont conservés. Recharge la page pour repartir d\'un état à jour.');
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
    // #389 : keysSync (localStorage ∪ memoryCache) — les clés basculées hors
    // localStorage sur quota manquaient silencieusement à l'export.
    const cartouches = {};
    const allKeys = db.keysSync();
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
window.fermerModalImport = fermerModalImport;
// window.exporterDonneesJSON = exporterDonneesJSON; // ❌ Fonction n'existe plus
window.reinitialiserDonnees = reinitialiserDonnees;
// window.importerConfigComplete = importerConfigComplete; // ❌ Fonction n'existe plus
window.executerImportConfigComplete = executerImportConfigComplete;
window.fermerModalPreviewConfigComplete = fermerModalPreviewConfigComplete;
window.exporterConfigurationComplete = exporterConfigurationComplete;
window.executerImportSelectif = executerImportSelectif; // 🆕 BETA 95.1

// Filtrage des données démo — réutilisé par js/reserve.js
window.estRessourceDemo = estRessourceDemo;
window.filtrerRessourcesNonDemo = filtrerRessourcesNonDemo;

// Sanitisation — exposée pour les modules qui ont leur propre canal d'import
// (ex. tampons-bibliotheque.js — Défense P du modèle de menaces).
// Toute écriture vers une Bibliothèque depuis une source externe
// devrait passer par `assainirObjet(item, SCHEMAS_IMPORT.<type>)` avant `db.set`.
window.assainirObjet = assainirObjet;
window.assainirChaine = assainirChaine;
window.assainirImportJson = assainirImportJson; // #467 : les cinq imports JSON de Bibliothèque
window.retirerBalisesProfond = retirerBalisesProfond; // #467 : l'import JSON des tampons (travaux-outils.js)
window.SCHEMAS_IMPORT = SCHEMAS_IMPORT;
window.CLES_ECHELLE_NON_TRANSPORTEES = CLES_ECHELLE_NON_TRANSPORTEES;
window.CLES_PRODUCTION_NON_TRANSPORTEES = CLES_PRODUCTION_NON_TRANSPORTEES;
window.verifierUniciteIds = verifierUniciteIds; // #292 : exposé pour chargerCodex (codex.js)
window.fusionnerParIdentite = fusionnerParIdentite; // #448
window.fusionnerCopiesImportees = fusionnerCopiesImportees; // #1012 : exposé pour ses essais
window.fusionnerDonneesPersoImportees = fusionnerDonneesPersoImportees; // #1012, les quatre cases : exposé pour ses essais
window.dasElevesEcartes = dasElevesEcartes; // #1012, l'élève désinscrit : exposé pour ses essais
window.ecarterElevesDesinscrits = ecarterElevesDesinscrits; // #1012, l'élève désinscrit : exposé pour ses essais
window.dasElevesSupprimes = dasElevesSupprimes; // #1013 : la lecture que les vues appellent (Liste des évaluations, Travaux)
window.compterDatesPresences = compterDatesPresences; // #1012, les mots : exposé pour ses essais
window.ligneElevesEcartes = ligneElevesEcartes; // #1012, les mots : exposé pour ses essais
window._restaurerBlobsDepuisZip = _restaurerBlobsDepuisZip; // #1028 (verdict) : exposé pour ses essais — une copie aux archives n'est jamais « manquante »
window.analyserRessourcesDetaillees = analyserRessourcesDetaillees; // #1012, les mots : exposé pour l'essai du compte de l'aperçu
window._ressourcesDesTrimestresSurLesClesNues = _ressourcesDesTrimestresSurLesClesNues; // #1046 : exposé pour l'essai « ce qui voyage »
window.signatureContenu = signatureContenu;         // #448

})();
