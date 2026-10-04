/* ===============================
   MODULE : ARCHIVES — VÉRIFIER UNE ARCHIVE
   Date : 30 septembre 2026 (lot A2 du chantier des archives, #999)
   Plan : plans de travail/PLAN-2026-09-30-chantier-archives.md
   Format : docs/architecture/SPEC-RESERVE-V1.md (§ 13 et § 14)

   Vocation
     Relit une archive, copie par copie, et dit ce qu'elle a trouvé. C'est la condition
     posée par Grégoire pour qu'une copie puisse un jour quitter l'application (lot A4) :
     « relue et vérifiée par l'application ».

     Pour chaque copie déclarée dans meta.json (integrite.travaux_sha256) : présente, et
     son empreinte recalculée égale l'empreinte déclarée. L'empreinte de donnees.json
     aussi. Un fichier présent dans travaux/ mais absent de la liste est signalé. Et la
     COUVERTURE : chaque fiche de copie du groupe, telle qu'elle est aujourd'hui dans
     l'application, a sa copie dans l'archive.

   Les deux modes
     - dossier (Chrome, Edge) : depuis le dossier des archives (FSAPI) ;
     - fichier (Safari) : l'usager désigne le fichier .zip de l'archive.

   La mémoire ne dépend pas du poids de l'archive
     En mode fichier, le ZIP n'est JAMAIS chargé en entier (JSZip.loadAsync prenait 800 Mo
     pour 608 Mo, mesuré le 30 sept.) : le répertoire central est lu par une tranche du
     fichier, puis chaque copie est lue une à la fois par sa propre tranche, et son tampon
     est rendu aussitôt. La borne de 2 Go de `validerZipSecurite` ne s'applique donc pas :
     la défense contre un ZIP hostile est ici bornée PAR ENTRÉE (une copie ou un texte de
     plus de LIMITE_ENTREE_OCTETS n'est pas lu), par le poids du répertoire central, par la
     taille déclarée d'une entrée compressée (le gonflage s'arrête au premier octet de trop),
     et par le refus des noms suspects (les mêmes règles que validerZipSecurite). Rien n'est
     écrit sur le disque ni dans les données à partir du contenu de l'archive.

   Ce qui est écrit
     Rien dans les trimestres, rien dans l'archive. Seule l'entrée de l'archive dans la
     liste locale (`_manifesteReserve`, tenue par reserve.js) reçoit `verification` :
     état, date, version, nombre de copies, et de quoi savoir que c'est CETTE archive
     (son uuid et l'empreinte de son meta.json). Un nouvel archivage du même groupe
     remplace l'entrée entière : l'état retombe à « non vérifiée ».

   Dépendances
     - reserve.js (window.Reserve) : lireManifesteLocal, upsertEntreeManifeste,
       listerGroupesVersables, obtenirHandle, supporteFSAPI
     - db.js (window.db) : les fiches de copie du groupe, pour la couverture
     - progression.js, ui-dialogues.js, utils-notifications.js
     - crypto.subtle (SHA-256), DecompressionStream (les textes compressés d'un ZIP)
     Pas de JSZip : ce module ne charge jamais un fichier entier.
   =============================== */

(function() {
'use strict';

/* ===============================
   LES MOTS — UN SEUL ENDROIT
   ===============================
   § 3 de la consigne du lot A2, acceptés par Grégoire le 30 sept. 2026 à 16 h 26.
   Ceux marqués « non soumis » sont à relire (demande de relecture du lot A2).
*/
var MOTS = {
    bouton: 'Vérifier',
    enCours: 'Vérification de l\'archive…',
    compte: function(n, m) { return n + ' copies sur ' + m; },
    reussite: {
        titre: 'Archive vérifiée',
        texte: function(m) { return 'Les ' + m + ' copies sont présentes et intactes, et les données concordent.'; }
    },
    echec: {
        titre: 'Archive incomplète',
        texte: function(n, m) { return n + ' copies sur ' + m + ' manquent ou ne concordent pas. Archive de nouveau ce groupe.'; }
    },
    sansEmpreintes: {
        titre: 'Archive à refaire',
        texte: 'Cette archive date d\'avant les empreintes : elle ne peut pas être vérifiée copie par copie. Archive de nouveau ce groupe.'
    },
    liste: {
        verifiee: function(jour) { return 'Vérifiée le ' + jour; },
        nonVerifiee: 'Non vérifiée'
    },
    // Le détail sous le texte d'échec : ce que chaque copie a. Accord en nombre tranché par
    // Cowork (verdict de relecture du lot A2, 16 h 57).
    detail: {
        copies: function(n, adjectif) { return n + ' copie' + (n > 1 ? 's ' : ' ') + adjectif + (n > 1 ? 's' : ''); },
        absente: 'absente', tronquee: 'tronquée', alteree: 'altérée', illisible: 'illisible',
        enTrop: function(n) { return n + ' fichier' + (n > 1 ? 's' : '') + ' en trop dans l\'archive'; },
        nonCouvertes: function(n) { return n + ' fiche' + (n > 1 ? 's' : '') + ' du groupe sans copie dans l\'archive'; },
        donneesKo: 'les données de l\'archive ne concordent pas avec leur empreinte',
        couvertureNonMesuree: 'couverture non mesurée : ce groupe n\'est plus dans l\'application'
    },
    // Le fichier choisi n'est pas l'archive de la ligne. Accepté par Grégoire le 30 sept. 2026.
    autreArchive: {
        titre: 'Ce n\'est pas cette archive',
        texte: 'Le fichier choisi est l\'archive d\'un autre groupe ou d\'une autre date. Choisis le fichier de cette ligne.'
    },
    // L'archive n'a pas pu être lue (non soumis à Grégoire ; relu par Cowork, tel quel).
    illisible: { titre: 'Archive illisible' },
    aRefaireDetail: function(nb, taille) { return nb + ' copies, ' + taille + ' (compte et taille seulement, sans valoir vérification).'; },
    erreurs: {
        pasUnZip: 'Le fichier choisi n\'est pas un ZIP lisible.',
        zip64: 'Ce ZIP emploie un format (ZIP64) que l\'application ne lit pas.',
        repertoireTropLourd: 'Le répertoire de ce ZIP est trop lourd pour être lu.',
        repertoireHors: 'Le répertoire de ce ZIP pointe hors du fichier : il est tronqué ou altéré.',
        nomSuspect: 'Entrée suspecte dans le ZIP : ',
        entreeTropGrosse: 'Une entrée de l\'archive dépasse ce que l\'application accepte de lire (1 Go).',
        methodeInconnue: 'Une entrée de l\'archive emploie une compression inconnue.',
        sansGonflage: 'Ce navigateur ne sait pas lire les textes compressés de l\'archive.',
        sansMeta: 'Cette archive n\'a pas de meta.json : elle n\'est pas une archive de l\'application.',
        metaIllisible: 'Le meta.json de cette archive est illisible.',
        sansCrypto: 'Ce navigateur ne peut pas calculer d\'empreinte (crypto.subtle indisponible).',
        dossierAbsent: 'Le dossier de cette archive est introuvable dans le dossier des archives : ',
        nonListee: 'Cette archive n\'est pas dans la liste.'
    }
};

/* ===============================
   BORNES
   =============================== */

/** Le répertoire central d'un ZIP est lu en mémoire : au plus 64 Mo (65 535 entrées y tiennent dix fois). */
var LIMITE_REPERTOIRE_OCTETS = 64 * 1024 * 1024;
/** Une copie ou un texte est lu en entier, un à la fois, puis rendu : au plus 1 Go chacun. */
var LIMITE_ENTREE_OCTETS = 1024 * 1024 * 1024;
var TAILLE_CLOTURE_ZIP = 22;
var COMMENTAIRE_ZIP_MAX = 0xFFFF;

/* ===============================
   UTILITAIRES
   =============================== */

function _versionApp() {
    return typeof window.VERSION_MAJEURE === 'string' ? window.VERSION_MAJEURE : 'inconnue';
}

function _formaterTaille(octets) {
    if (!octets) return '0 o';
    if (octets < 1024) return octets + ' o';
    if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
    if (octets < 1024 * 1024 * 1024) return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
    return (octets / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

function _jour(iso) {
    try {
        return new Date(iso).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return String(iso || '').slice(0, 10);
    }
}

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

/** L'empreinte SHA-256 d'une suite d'octets, en hexadécimal. Le tampon est rendu aussitôt. */
async function _sha256(octets) {
    if (typeof crypto === 'undefined' || !crypto.subtle) throw new Error(MOTS.erreurs.sansCrypto);
    var condense = await crypto.subtle.digest('SHA-256', octets);
    var tampon = octets.buffer;
    if (tampon && typeof tampon.transfer === 'function' && !tampon.detached) {
        try { tampon.transfer(0); } catch (e) { /* un tampon partagé ou déjà rendu */ }
    }
    return Array.from(new Uint8Array(condense)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function _sha256Texte(texte) {
    return _sha256(new TextEncoder().encode(texte));
}

/**
 * Un fichier que le système pose de lui-même dans un dossier (`.DS_Store` du Finder, `Thumbs.db`
 * et `desktop.ini` de Windows, tout nom qui commence par un point) : ni une copie, ni un fichier
 * en trop. Relecture de Cowork (30 sept. 2026) : l'archive réelle vit dans iCloud et s'ouvre dans
 * le Finder ; sans cette règle, « vérifiée » aurait tenu quelques jours.
 */
function _fichierDuSysteme(nom) {
    return nom.charAt(0) === '.' || nom === 'Thumbs.db' || nom === 'desktop.ini';
}

/** Le nom d'une copie sous travaux/ (« <id>.<ext> ») → l'id de sa fiche. */
function _idDeLaCopie(nom) {
    var i = nom.lastIndexOf('.');
    return i > 0 ? nom.slice(0, i) : nom;
}

/** Les mêmes règles que validerZipSecurite (import-export.js), sans sa borne de 2 Go. */
function _nomSuspect(nom) {
    return nom.indexOf('..') !== -1 || nom.charAt(0) === '/';
}

/* ===============================
   LECTURE D'UN ZIP PAR TRANCHES (mode fichier)
   ===============================
   Le fichier n'est jamais lu en entier : la clôture (22 octets, plus le commentaire),
   le répertoire central, puis l'en-tête local et les octets d'UNE entrée à la fois.
   Sans ZIP64 : ni FichierSortant.assemblerZip ni JSZip n'en écrivent.
*/

async function _octets(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Le répertoire central d'un ZIP : ses entrées, sans lire leurs octets.
 * @param {Blob} fichier
 * @returns {Promise<Array<{nom, methode, crc, tailleComp, tailleReelle, offset, dir}>>}
 */
async function lireRepertoireZip(fichier) {
    var taille = fichier.size;
    if (taille < TAILLE_CLOTURE_ZIP) throw new Error(MOTS.erreurs.pasUnZip);
    var debutQueue = Math.max(0, taille - TAILLE_CLOTURE_ZIP - COMMENTAIRE_ZIP_MAX);
    var queue = await _octets(fichier.slice(debutQueue, taille));
    var v = new DataView(queue.buffer, queue.byteOffset, queue.byteLength);
    var pos = -1;
    for (var i = queue.length - TAILLE_CLOTURE_ZIP; i >= 0; i--) {
        if (v.getUint32(i, true) === 0x06054b50) { pos = i; break; }
    }
    if (pos < 0) throw new Error(MOTS.erreurs.pasUnZip);
    var nb = v.getUint16(pos + 10, true);
    var tailleRep = v.getUint32(pos + 12, true);
    var debutRep = v.getUint32(pos + 16, true);
    if (nb === 0xFFFF || tailleRep === 0xFFFFFFFF || debutRep === 0xFFFFFFFF) throw new Error(MOTS.erreurs.zip64);
    if (tailleRep > LIMITE_REPERTOIRE_OCTETS) throw new Error(MOTS.erreurs.repertoireTropLourd);

    // Un répertoire qui pointe hors du fichier rend une tranche courte : la lecture des fiches
    // le dit (« répertoireHors »). Une garde de plus ici ne changeait rien (mutation M14, 30 sept.).
    var rep = await _octets(fichier.slice(debutRep, debutRep + tailleRep));
    var w = new DataView(rep.buffer, rep.byteOffset, rep.byteLength);
    var decodeur = new TextDecoder('utf-8');
    var entrees = [];
    var p = 0;
    for (var k = 0; k < nb; k++) {
        if (p + 46 > rep.length || w.getUint32(p, true) !== 0x02014b50) throw new Error(MOTS.erreurs.repertoireHors);
        var n = w.getUint16(p + 28, true);
        var m = w.getUint16(p + 30, true);
        var c = w.getUint16(p + 32, true);
        if (p + 46 + n > rep.length) throw new Error(MOTS.erreurs.repertoireHors);
        var nom = decodeur.decode(rep.subarray(p + 46, p + 46 + n));
        if (_nomSuspect(nom)) throw new Error(MOTS.erreurs.nomSuspect + nom);
        entrees.push({
            nom: nom,
            methode: w.getUint16(p + 10, true),
            crc: w.getUint32(p + 16, true),
            tailleComp: w.getUint32(p + 20, true),
            tailleReelle: w.getUint32(p + 24, true),
            offset: w.getUint32(p + 42, true),
            dir: nom.charAt(nom.length - 1) === '/'
        });
        p += 46 + n + m + c;
    }
    return entrees;
}

/** Les octets rangés d'une entrée (tels quels, compressés ou non), ou null si le fichier est tronqué. */
async function _blobDeLEntree(fichier, e) {
    if (e.offset + 30 > fichier.size) return null;
    var enTete = await _octets(fichier.slice(e.offset, e.offset + 30));
    var v = new DataView(enTete.buffer, enTete.byteOffset, enTete.byteLength);
    if (v.getUint32(0, true) !== 0x04034b50) throw new Error(MOTS.erreurs.repertoireHors);
    var debut = e.offset + 30 + v.getUint16(26, true) + v.getUint16(28, true);
    if (debut + e.tailleComp > fichier.size) return null;
    return fichier.slice(debut, debut + e.tailleComp);
}

/** Gonfle une entrée DEFLATE, en s'arrêtant au premier octet au-delà de la taille déclarée. */
async function _gonfler(blob, tailleAttendue) {
    if (typeof DecompressionStream !== 'function') throw new Error(MOTS.erreurs.sansGonflage);
    var lecteur = blob.stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    var sortie = new Uint8Array(tailleAttendue);
    var pos = 0;
    while (true) {
        var r = await lecteur.read();
        if (r.done) break;
        if (pos + r.value.length > tailleAttendue) {
            try { await lecteur.cancel(); } catch (eAnnul) { /* le flux est abandonné */ }
            return null;
        }
        sortie.set(r.value, pos);
        pos += r.value.length;
    }
    return pos === tailleAttendue ? sortie : null;
}

/**
 * Les octets d'UNE entrée, en entier (au plus LIMITE_ENTREE_OCTETS), ou null si l'entrée est
 * tronquée ou ne rend pas la taille déclarée.
 */
async function _octetsDeLEntree(fichier, e) {
    if (e.tailleReelle > LIMITE_ENTREE_OCTETS || e.tailleComp > LIMITE_ENTREE_OCTETS) {
        throw new Error(MOTS.erreurs.entreeTropGrosse);
    }
    var blob = await _blobDeLEntree(fichier, e);
    if (!blob) return null;
    if (e.methode === 0) {
        if (e.tailleComp !== e.tailleReelle) return null;
        return _octets(blob);
    }
    if (e.methode === 8) return _gonfler(blob, e.tailleReelle);
    throw new Error(MOTS.erreurs.methodeInconnue);
}

/* ===============================
   LES DEUX SOURCES
   ===============================
   Une source répond à trois questions : le texte d'un fichier de l'archive (meta.json,
   donnees.json), la liste des copies sous travaux/, et les octets d'une copie.
*/

/** Mode fichier : le .zip désigné par l'usager. Le dossier de l'archive est celui qui porte meta.json. */
function sourceFichier(fichier) {
    var parNom = null;
    var base = '';
    return {
        mode: 'fichier',
        async ouvrir() {
            var entrees = await lireRepertoireZip(fichier);
            parNom = {};
            entrees.forEach(function(e) { parNom[e.nom] = e; });
            var metas = entrees.filter(function(e) { return /^trimestres\/[^\/]+\/meta\.json$/.test(e.nom); });
            if (metas.length !== 1) throw new Error(MOTS.erreurs.sansMeta);
            base = metas[0].nom.slice(0, -'meta.json'.length);
        },
        async lireTexte(nom) {
            var e = parNom[base + nom];
            if (!e) return null;
            var octets = await _octetsDeLEntree(fichier, e);
            return octets ? new TextDecoder('utf-8').decode(octets) : null;
        },
        async listerCopies() {
            var prefixe = base + 'travaux/';
            return Object.keys(parNom).filter(function(n) {
                return n.indexOf(prefixe) === 0 && n.length > prefixe.length && !parNom[n].dir && n.slice(prefixe.length).indexOf('/') < 0;
            }).map(function(n) { return { nom: n.slice(prefixe.length), taille: parNom[n].tailleReelle }; });
        },
        async lireCopie(nom) {
            var e = parNom[base + 'travaux/' + nom];
            if (!e) return { probleme: 'absente' };
            var octets = await _octetsDeLEntree(fichier, e);
            return octets ? { octets: octets } : { probleme: 'tronquee' };
        }
    };
}

/** Mode dossier : la racine des archives (FSAPI), et le nom du dossier de l'archive. */
function sourceDossier(handleRacine, dossier) {
    var dossierArchive = null;
    var fichiersTravaux = null;
    return {
        mode: 'dossier',
        async ouvrir() {
            try {
                var trimestres = await handleRacine.getDirectoryHandle('trimestres');
                dossierArchive = await trimestres.getDirectoryHandle(dossier);
            } catch (e) {
                throw new Error(MOTS.erreurs.dossierAbsent + dossier);
            }
            fichiersTravaux = new Map();
            var travaux;
            try {
                travaux = await dossierArchive.getDirectoryHandle('travaux');
            } catch (e) {
                return; // pas de dossier travaux/ : aucune copie
            }
            for await (var paire of travaux.entries()) {
                if (paire[1] && paire[1].kind === 'file') fichiersTravaux.set(paire[0], paire[1]);
            }
        },
        async lireTexte(nom) {
            try {
                var fh = await dossierArchive.getFileHandle(nom);
                return await (await fh.getFile()).text();
            } catch (e) {
                return null;
            }
        },
        async listerCopies() {
            var liste = [];
            for (var paire of fichiersTravaux) {
                var f = await paire[1].getFile();
                liste.push({ nom: paire[0], taille: f.size });
            }
            return liste;
        },
        async lireCopie(nom) {
            var h = fichiersTravaux.get(nom);
            if (!h) return { probleme: 'absente' };
            var f = await h.getFile();
            if (f.size > LIMITE_ENTREE_OCTETS) throw new Error(MOTS.erreurs.entreeTropGrosse);
            return { octets: await _octets(f) };
        }
    };
}

/* ===============================
   LA VÉRIFICATION
   =============================== */

/** Les fiches de copie du groupe, telles qu'elles sont AUJOURD'HUI dans l'application ; null si le groupe n'y est plus. */
function _fichesDuGroupe(entree, dossier) {
    var Reserve = window.Reserve;
    if (!entree || !entree.trimestre || !Reserve || typeof Reserve.listerGroupesVersables !== 'function') return null;
    var gc = Reserve.listerGroupesVersables(entree.trimestre).find(function(g) { return g.dossier === dossier; });
    if (!gc) return null;
    var fiches = window.db && typeof window.db.getSync === 'function'
        ? (window.db.getSync(entree.trimestre + '_fichiersTravaux', []) || []) : [];
    if (!Array.isArray(fiches)) return [];
    return fiches.filter(function(f) { return f && f.id && f.groupeCoursId === gc.id; });
}

/**
 * Relit l'archive et rend un rapport. N'écrit rien.
 * @param {Object} source - sourceFichier(...) ou sourceDossier(...)
 * @param {Object} entree - l'entrée de la liste locale (uuid, trimestre, …), ou null
 * @param {string} dossier - le nom du dossier de l'archive (clé de la liste)
 * @param {Function} [onProg] - (copiesFaites, total)
 * @returns {Promise<Object>} rapport : etat ∈ verifiee | incomplete | a_refaire | autre_archive
 */
async function verifierArchive(source, entree, dossier, onProg) {
    onProg = onProg || function() {};
    var rapport = {
        etat: null, mode: source.mode, dossier: dossier,
        uuid: null, meta_sha256: null, version_archive: null, date_archive: null,
        total: 0, verifiees: 0, problemes: [], enTrop: [], nonCouvertes: [],
        couvertureMesuree: false, donneesConcordent: null,
        nombreFichiers: 0, tailleFichiers: 0
    };

    await source.ouvrir();

    var metaTexte = await source.lireTexte('meta.json');
    if (metaTexte == null) throw new Error(MOTS.erreurs.sansMeta);
    var meta;
    try { meta = JSON.parse(metaTexte); } catch (e) { throw new Error(MOTS.erreurs.metaIllisible); }
    if (!meta || typeof meta !== 'object') throw new Error(MOTS.erreurs.metaIllisible);
    rapport.uuid = meta.uuid || null;
    rapport.meta_sha256 = await _sha256Texte(metaTexte);
    rapport.version_archive = meta.application_version || null;
    rapport.date_archive = meta.date_archive || null;

    // C'est CETTE archive ? Le fichier d'un autre groupe ou d'une autre date n'est pas jugé.
    if (entree && entree.uuid && meta.uuid && entree.uuid !== meta.uuid) {
        rapport.etat = 'autre_archive';
        return rapport;
    }

    var copies = (await source.listerCopies()).filter(function(c) { return !_fichierDuSysteme(c.nom); });
    rapport.nombreFichiers = copies.length;
    rapport.tailleFichiers = copies.reduce(function(s, c) { return s + (c.taille || 0); }, 0);

    var empreintes = meta.integrite && meta.integrite.travaux_sha256;
    if (!empreintes || typeof empreintes !== 'object') {
        rapport.etat = 'a_refaire';
        return rapport;
    }
    var noms = Object.keys(empreintes);
    rapport.total = noms.length;

    // Les données : leur empreinte, et les fiches qu'elles portaient (pour dire « tronquée »).
    var donneesTexte = await source.lireTexte('donnees.json');
    var attenduDonnees = meta.integrite.donnees_json_sha256 || null;
    rapport.donneesConcordent = donneesTexte != null && !!attenduDonnees &&
        (await _sha256Texte(donneesTexte)) === attenduDonnees;
    var tailleFiche = {};
    if (donneesTexte != null && entree && entree.trimestre) {
        try {
            var donnees = JSON.parse(donneesTexte);
            var fichesArchive = donnees[entree.trimestre + '_fichiersTravaux'];
            if (Array.isArray(fichesArchive)) {
                fichesArchive.forEach(function(f) { if (f && f.id && f.tailleFichier > 0) tailleFiche[f.id] = f.tailleFichier; });
            }
        } catch (e) { /* les données illisibles sont déjà dites par leur empreinte */ }
    }

    // Les copies, une à la fois.
    var presentes = {};
    copies.forEach(function(c) { presentes[c.nom] = true; });
    for (var i = 0; i < noms.length; i++) {
        var nom = noms[i];
        onProg(i, noms.length);
        if (!presentes[nom]) {
            rapport.problemes.push({ nom: nom, type: 'absente' });
            continue;
        }
        var lu = await source.lireCopie(nom);
        if (lu.probleme) {
            rapport.problemes.push({ nom: nom, type: lu.probleme });
            continue;
        }
        var taille = lu.octets.length;
        var empreinte = await _sha256(lu.octets);
        lu = null;
        if (empreinte === empreintes[nom]) {
            rapport.verifiees++;
        } else {
            var attendue = tailleFiche[_idDeLaCopie(nom)];
            rapport.problemes.push({ nom: nom, type: attendue && attendue !== taille ? 'tronquee' : 'alteree' });
        }
        if (i % 5 === 4) await _yield();
    }
    onProg(noms.length, noms.length);

    // Les fichiers en trop, et la couverture des fiches d'aujourd'hui.
    rapport.enTrop = copies.map(function(c) { return c.nom; }).filter(function(n) { return !Object.prototype.hasOwnProperty.call(empreintes, n); });
    var fiches = _fichesDuGroupe(entree, dossier);
    if (fiches) {
        rapport.couvertureMesuree = true;
        var idsArchive = {};
        noms.forEach(function(n) { idsArchive[_idDeLaCopie(n)] = true; });
        var vus = {};
        fiches.forEach(function(f) {
            if (vus[f.id]) return;
            vus[f.id] = true;
            if (!idsArchive[f.id]) rapport.nonCouvertes.push(f.id);
        });
    }

    rapport.etat = (rapport.problemes.length === 0 && rapport.enTrop.length === 0 &&
        rapport.nonCouvertes.length === 0 && rapport.donneesConcordent === true) ? 'verifiee' : 'incomplete';
    return rapport;
}

/* ===============================
   L'ÉTAT RETENU DANS LA LISTE
   =============================== */

/** Écrit le résultat dans l'entrée de la liste locale. Rien d'autre n'est écrit. */
function retenirResultat(dossier, rapport) {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.lireManifesteLocal !== 'function') return null;
    var entree = Reserve.lireManifesteLocal().archives[dossier];
    if (!entree) return null;
    var copie = Object.assign({}, entree, {
        verification: {
            etat: rapport.etat,
            date: new Date().toISOString(),
            version_app: _versionApp(),
            nombre_copies: rapport.total,
            uuid: rapport.uuid,
            meta_sha256: rapport.meta_sha256
        }
    });
    Reserve.upsertEntreeManifeste(dossier, copie);
    return copie.verification;
}

/**
 * Ce que la liste dit d'une entrée : « Vérifiée le JOUR » seulement si la vérification a
 * réussi ET porte l'uuid de l'archive listée (un nouvel archivage remplace l'entrée, mais
 * une entrée fusionnée d'ailleurs pourrait garder une vérification d'une autre archive).
 */
function etatVerification(entree) {
    var v = entree && entree.verification;
    var ok = !!(v && v.etat === 'verifiee' && (!entree.uuid || !v.uuid || v.uuid === entree.uuid));
    return { verifiee: ok, date: ok ? v.date : null, texte: ok ? MOTS.liste.verifiee(_jour(v.date)) : MOTS.liste.nonVerifiee };
}

/* ===============================
   LE COMPTE RENDU À L'USAGER
   =============================== */

function compteRendu(rapport) {
    if (rapport.etat === 'verifiee') {
        return { titre: MOTS.reussite.titre, message: MOTS.reussite.texte(rapport.total) };
    }
    if (rapport.etat === 'a_refaire') {
        return { titre: MOTS.sansEmpreintes.titre, message: MOTS.sansEmpreintes.texte + '\n' + MOTS.aRefaireDetail(rapport.nombreFichiers, _formaterTaille(rapport.tailleFichiers)) };
    }
    if (rapport.etat === 'autre_archive') {
        return { titre: MOTS.autreArchive.titre, message: MOTS.autreArchive.texte };
    }
    var parType = {};
    rapport.problemes.forEach(function(p) { parType[p.type] = (parType[p.type] || 0) + 1; });
    var lignes = [];
    if (parType.absente) lignes.push(MOTS.detail.copies(parType.absente, MOTS.detail.absente));
    if (parType.tronquee) lignes.push(MOTS.detail.copies(parType.tronquee, MOTS.detail.tronquee));
    if (parType.alteree) lignes.push(MOTS.detail.copies(parType.alteree, MOTS.detail.alteree));
    if (parType.illisible) lignes.push(MOTS.detail.copies(parType.illisible, MOTS.detail.illisible));
    if (rapport.enTrop.length) lignes.push(MOTS.detail.enTrop(rapport.enTrop.length));
    if (rapport.nonCouvertes.length) lignes.push(MOTS.detail.nonCouvertes(rapport.nonCouvertes.length));
    if (rapport.donneesConcordent !== true) lignes.push(MOTS.detail.donneesKo);
    if (!rapport.couvertureMesuree) lignes.push(MOTS.detail.couvertureNonMesuree);
    var n = rapport.problemes.length;
    var message = (n > 0 ? MOTS.echec.texte(n, rapport.total) + '\n' : '') + lignes.join('\n');
    return { titre: MOTS.echec.titre, message: message };
}

/* ===============================
   LE GESTE, DEPUIS L'ÉCRAN « ARCHIVES »
   =============================== */

function _prog(pct, detail, stats) {
    if (typeof window.majProgression === 'function') window.majProgression(pct, detail, stats);
}

async function _executer(dossier, entree, source) {
    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.enCours, dossier);
    _prog(0, MOTS.enCours, '');
    var rapport;
    try {
        rapport = await verifierArchive(source, entree, dossier, function(n, m) {
            _prog(m ? Math.round((n / m) * 100) : 100, MOTS.enCours, MOTS.compte(n, m));
        });
    } catch (e) {
        if (typeof window.masquerProgression === 'function') window.masquerProgression();
        console.error('[Archives] Vérification échouée :', e);
        notifications.erreur(MOTS.illisible.titre, e.message || String(e));
        return null;
    }
    if (typeof window.masquerProgression === 'function') window.masquerProgression();

    if (rapport.etat !== 'autre_archive') retenirResultat(dossier, rapport);

    var cr = compteRendu(rapport);
    if (window.uiDialogues && typeof window.uiDialogues.informer === 'function') {
        await window.uiDialogues.informer({ titre: cr.titre, message: cr.message, preformate: true });
    }
    return rapport;
}

/** Ouvre le sélecteur de fichier. Doit partir d'un clic (Chrome exige un geste actif, #995). */
function _choisirFichier(surFichier) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.style.display = 'none';
    input.addEventListener('change', function() {
        var f = input.files && input.files[0];
        document.body.removeChild(input);
        if (f) surFichier(f);
    });
    document.body.appendChild(input);
    input.click();
}

/**
 * Action du bouton « Vérifier » d'une ligne de la liste (data-action, data-param = dossier).
 * Le mode suit l'archive : « fsapi » → le dossier des archives ; « zip » → le fichier.
 */
function actionVerifier(dossier) {
    var Reserve = window.Reserve;
    if (!dossier || !Reserve || typeof Reserve.lireManifesteLocal !== 'function') return;
    var entree = Reserve.lireManifesteLocal().archives[dossier];
    if (!entree) {
        notifications.erreur(MOTS.illisible.titre, MOTS.erreurs.nonListee);
        return;
    }
    if (entree.mode_archive === 'fsapi' && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()) {
        Reserve.obtenirHandle().then(function(handle) {
            if (!handle) return;
            return _executer(dossier, entree, sourceDossier(handle, dossier));
        }).catch(function(e) {
            if (e && e.name === 'DossierRefuse') return; // le garde-fou du dossier a déjà parlé
            console.error('[Archives] Vérification (dossier) échouée :', e);
            notifications.erreur(MOTS.illisible.titre, e && e.message || String(e));
        });
        return;
    }
    _choisirFichier(function(fichier) {
        _executer(dossier, entree, sourceFichier(fichier));
    });
}

window.ReserveVerifier = {
    MOTS: MOTS,
    lireRepertoireZip: lireRepertoireZip,
    sourceFichier: sourceFichier,
    sourceDossier: sourceDossier,
    verifierArchive: verifierArchive,
    retenirResultat: retenirResultat,
    etatVerification: etatVerification,
    compteRendu: compteRendu,
    executer: _executer,
    actionVerifier: actionVerifier,
    // Lot A3 (#1000) : « Faire revenir » (reserve-revenir.js) relit l'archive par les mêmes pièces.
    sha256: _sha256,
    sha256Texte: _sha256Texte,
    idDeLaCopie: _idDeLaCopie,
    fichierDuSysteme: _fichierDuSysteme,
    choisirFichier: _choisirFichier
};

})();
