/* ===============================
   MODULE : ARCHIVES — ARCHIVER LES COPIES D'UN TRIMESTRE CLOS (ses données restent)
   Date : 5 octobre 2026 (#1028)
   Consigne : plans de travail/CONSIGNE-DU-JOUR.md (Cowork, 5 oct. 2026, 9 h 02)

   Vocation
     Retirer de l'application les FICHIERS des copies d'un trimestre clos, quand son archive
     (E1), listée et VÉRIFIÉE dans ce navigateur, sait les rendre à l'identique. Les données
     (notes, grilles, rétroactions, annotations, fiches des copies) restent. Décision de
     Grégoire (5 oct., 9 h) : l'unité est le trimestre clos entier, pas le groupe.

   La règle : une copie ne part que si l'archive sait la rendre à l'identique
     Au geste, l'archive est relue comme pour E3 (ReserveRenvoyer.relireArchive : meta.json et
     donnees.json à leurs empreintes, le contenu de chaque copie relu et empreinté). Puis chaque
     fichier de copie que l'application a (travail et corbeille) est comparé à son empreinte dans
     l'archive. Une copie absente de l'archive ou différente → RIEN n'est retiré.
     Les DONNÉES ne sont pas comparées : elles restent dans l'application.
     Les copies d'un·e étudiant·e supprimé·e restent dans l'application : « Faire revenir » ne
     les ramènerait pas (règle du 2 oct.), elles ne partent donc pas.

   La marque : `_copiesAuxArchives` (clé globale, hors de tout trimestre)
     { <trimestre>: { dossier, uuid, date, ids: { <id>: true } } }
     Hors des clés `<trimestre>_*` : E3 ne la compare pas (le trimestre reste « identique » à son
     archive), E1 ne l'archive pas. Elle voyage dans le codex (toutes les clés y vont) et
     s'installe sur l'appareil qui l'ouvre (#1184, chargerCodex) : elle y REMPLACE la marque
     locale ; un codex sans marque (d'avant #1028) laisse la marque locale telle quelle. Levée en
     entier, elle reste écrite `{}` : c'est ce qui lève celle de l'autre appareil.
     L'écriture du codex n'emporte ni le fichier ni la vignette d'une copie marquée, même présent
     sur l'appareil (un iPad qui a gardé les fichiers d'un codex plus ancien) ; elle ne la compte
     pas « manquante ». À l'ouverture non plus, une copie marquée n'est jamais « manquante ».
     Ailleurs, une copie est « aux archives » quand elle est marquée ET que son fichier n'est pas
     là : une copie marquée dont le fichier existe encore se montre normalement.

   Ce qui est retiré, dans cet ordre
     1. la marque est posée pour toutes les copies identiques (une écriture, relue) ;
     2. le fichier de chaque copie, relu absent, puis sa vignette `thumbnail_<id>`.
     Rien d'autre : ni registre, ni clé `<trimestre>_*`, ni séance, ni clé globale.
     Interrompu, il se reprend depuis le même menu (même comparaison sur ce qui reste).

   Le retour : « Faire revenir » (reserve-revenir.js, #1000), depuis la ligne de l'archive du
   trimestre ; il lève la marque des copies dont le fichier est revenu.

   Ce qui le respecte ailleurs
     - E1 (reserve-trimestre.js) et l'archive d'un groupe (reserve.js) refusent tant que des
       copies sont aux archives : une nouvelle archive ne les contiendrait pas.
     - E3 (reserve-renvoyer.js) lève la marque du trimestre qu'il renvoie.
     - le codex (codex.js) : une copie marquée n'est ni écrite ni « manquante » à l'écriture,
       ni « manquante » à l'ouverture ; l'ouverture installe la marque du codex.
     - les lecteurs du fichier d'une copie disent « aux archives » (MOTS.copie).

   Dépendances
     - reserve-renvoyer.js (window.ReserveRenvoyer) : refusImmediat, entreeArchive, relireArchive, MOTS.refus
     - reserve-verifier.js (window.ReserveVerifier) : sources, empreintes
     - reserve.js (window.Reserve) : supporteFSAPI, obtenirHandle
     - taille-fichier.js (window.TailleFichier.dire)
     - travaux-stockage.js (window.travauxStockage) : recupererBlob, supprimerBlob, supprimerThumbnail
     - import-export.js (window.dasElevesEcartes)
     - db.js, progression.js, ui-dialogues.js, utils-notifications.js
   =============================== */

(function() {
'use strict';

var CLE = '_copiesAuxArchives';
var RE_TRIMESTRE = /^[aeh]\d{4}$/;
var SAISONS = { a: 'Automne', h: 'Hiver', e: 'Été' };

/* ===============================
   LES MOTS — UN SEUL ENDROIT (tranchés par Grégoire le 5 octobre 2026 :
   plans de travail/MOTS-2026-10-05-1028-archiver-copies.md). Règle : ne jamais promettre
   que les annotations se voient sans leur copie.
   =============================== */
function _pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

function _jour(iso) {
    if (!iso) return '?';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '?';
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

var CHEMIN = 'Réglages › Données › Archives';
var DONNEES = 'résultats des étudiant·es et du groupe, grilles, rétroactions';
var ANNOTATIONS = 'Les annotations restent aussi, mais ne se voient qu\'avec leur copie.';
function _revenir(nom) { return CHEMIN + ', ligne de ' + nom + ', « Faire revenir »'; }

var MOTS = {
    menu: 'Archiver les copies…',
    menuTitre: 'Retirer de l\'application les copies de ce trimestre : son archive vérifiée les garde, ses données restent',
    enCours: 'Comparaison avec l\'archive…',
    retrait: 'Archivage des copies…',
    fenetre: {
        titre: function(nom) { return 'Archiver les copies de ' + nom + ' ?'; },
        texte: function(c) {
            var lignes = [
                _pluriel(c.copies, 'copie quittera', 'copies quitteront') + ' l\'application, environ ' + window.TailleFichier.dire(c.taille) + '.',
                'Son archive, vérifiée le ' + _jour(c.dateVerification) + ', les garde telles quelles : « Faire revenir » les ramènera.',
                'Toutes les données de ' + c.nom + ' restent dans l\'application : ' + DONNEES + '. ' + ANNOTATIONS,
                'Garde bien cette archive : c\'est elle qui conserve les copies.'
            ];
            if (c.laissees) lignes.push(_pluriel(c.laissees, 'copie d\'un·e étudiant·e supprimé·e reste', 'copies d\'étudiant·es supprimé·es restent') + ' dans l\'application.');
            return lignes.join('\n');
        },
        confirmer: 'Archiver les copies'
    },
    different: {
        titre: function(nom) { return 'Des copies de ' + nom + ' ont changé depuis son archive'; },
        texte: function(c) {
            var parts = [];
            if (c.copiesAbsentes) parts.push(_pluriel(c.copiesAbsentes, 'copie ajoutée', 'copies ajoutées'));
            if (c.copiesDifferentes) parts.push(_pluriel(c.copiesDifferentes, 'copie modifiée', 'copies modifiées'));
            return ['Rien n\'a été retiré.',
                'Depuis son archive du ' + _jour(c.dateArchive) + ' : ' + parts.join(', ') + '.',
                'Pour archiver ses copies : archive le trimestre de nouveau, vérifie la nouvelle archive, puis archive ses copies.'].join('\n');
        },
        confirmer: 'Archiver de nouveau'
    },
    bilan: {
        titre: function(nom) { return 'Les copies de ' + nom + ' sont aux archives'; },
        texte: function(b) {
            return _pluriel(b.copies, 'copie retirée', 'copies retirées') + '.' + (b.taille ? ' Ton prochain codex sera plus léger d\'environ ' + window.TailleFichier.dire(b.taille) + '.' : '') + '\n' +
                'Toutes les données de ' + b.nom + ' restent dans l\'application : ' + DONNEES + '. ' + ANNOTATIONS + '\n' +
                'Pour faire revenir les copies : ' + _revenir(b.nom) + '.';
        }
    },
    interrompu: {
        titre: 'Archivage des copies inachevé',
        texte: function(b) {
            return 'L\'archivage des copies de ' + b.nom + ' s\'est arrêté en cours de route. Rien n\'est perdu : son archive les garde toutes.\n' +
                'Pour finir : relance « ' + MOTS.menu + ' » depuis le menu ⋮ de ' + b.nom + '.\n' +
                'Pour annuler : « Faire revenir », dans ' + CHEMIN + '.';
        }
    },
    refus: {
        titre: 'Copies non archivées',
        rien: 'Ce trimestre n\'a plus de copie dans l\'application : il n\'y a rien à archiver.',
        pasDansLApplication: 'Ce trimestre n\'est pas dans l\'application.'
        // Les autres refus (l'archive) sont ceux d'E3 : ReserveRenvoyer.MOTS.refus.
    },
    // Ce qu'affiche une copie aux archives, partout où l'on cherche son fichier.
    copie: {
        etiquette: 'Aux archives',
        badge: 'ARC',
        infobulle: 'Copie aux archives : sa note, sa grille, sa rétroaction et ses annotations restent dans l\'application',
        message: function(nom) {
            return 'Cette copie est aux archives.\n' +
                'Ses résultats, sa grille et sa rétroaction restent dans l\'application ; ses annotations aussi, mais elles ne se voient qu\'avec la copie.\n' +
                'Pour la revoir : fais revenir les copies de ' + nom + ' (' + _revenir(nom) + ').';
        },
        // Dans le bilan d'un export, à la place de « Blob introuvable ».
        raison: 'aux archives',
        // « Dossier PDF » : la synthèse seule.
        dossierPdf: 'Cette copie est aux archives : le dossier ne contient que la synthèse (note, grille, rétroaction).',
        // L'aperçu du PDF annoté.
        apercu: 'Cette copie est aux archives.',
        // Un geste qui transforme le fichier (fusion, édition des pages) : refusé.
        refusGeste: 'Cette copie est aux archives : fais-la revenir avant de modifier ses pages.'
    },
    // E1 et l'archive d'un groupe, tant que des copies sont aux archives.
    refusArchiver: {
        titre: 'Trimestre non archivé',
        // Le texte tranché parle des copies du trimestre sans les compter : n reste dans la
        // signature pour l'appelant, il ne s'imprime plus.
        texte: function(n, nom) {
            return 'Les copies de ' + nom + ' sont aux archives : une nouvelle archive ne les contiendrait pas, et elle remplacerait celle qui les garde.\n' +
                'Fais-les revenir d\'abord (' + _revenir(nom) + '), puis archive de nouveau.';
        }
    }
};

/* ===============================
   LA MARQUE
   =============================== */

function _a(objet, cle) { return Object.prototype.hasOwnProperty.call(objet, cle); }

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

function _lireMarque() {
    var m = window.db && typeof window.db.getSync === 'function' ? window.db.getSync(CLE, null) : null;
    return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
}

/** Les ids marqués d'un trimestre (sans regarder si le fichier est là). */
function idsMarques(trimestre) {
    var t = _lireMarque()[trimestre];
    return t && t.ids && typeof t.ids === 'object' ? Object.keys(t.ids) : [];
}

/** Le trimestre dont cette copie est marquée aux archives, ou null. Sans attente. */
function trimestreDeLaCopie(id) {
    var m = _lireMarque();
    var trimestres = Object.keys(m);
    for (var i = 0; i < trimestres.length; i++) {
        var t = m[trimestres[i]];
        if (t && t.ids && _a(t.ids, id)) return trimestres[i];
    }
    return null;
}

/**
 * La copie est-elle marquée aux archives ? Sans attente : à appeler là où son fichier vient
 * d'être cherché et ne s'est pas trouvé (la marque seule ne dit pas que le fichier manque).
 */
function estAuxArchives(id) {
    return !!id && trimestreDeLaCopie(id) !== null;
}

/** #1182 — tous les ids marqués ici, tous trimestres (la fusion n'en reprend aucun). Sans attente. */
function tousLesIdsMarques() {
    return idsDansDonnees({ _copiesAuxArchives: _lireMarque() });
}

/** Une marque lue dans d'autres données (un codex qu'on ouvre) : l'ensemble de ses ids. */
function idsDansDonnees(donnees) {
    var ids = {};
    var m = donnees && donnees[CLE];
    if (!m || typeof m !== 'object') return ids;
    Object.keys(m).forEach(function(t) {
        if (m[t] && m[t].ids && typeof m[t].ids === 'object') Object.keys(m[t].ids).forEach(function(id) { ids[id] = true; });
    });
    return ids;
}

function _nomDe(trimestre) {
    var liste = window.db.getSync('trimestres', []) || [];
    var t = Array.isArray(liste) ? liste.find(function(x) { return x && x.id === trimestre; }) : null;
    if (t && t.nom) return t.nom;
    var s = String(trimestre || '');
    return RE_TRIMESTRE.test(s) ? SAISONS[s.charAt(0)] + ' ' + s.slice(1) : s;
}

// #1184 : une marque levée en entier s'écrit `{}`, elle n'est plus retirée. Elle voyage ainsi dans
// le codex, et l'appareil qui l'ouvre lève la sienne ; une clé absente dirait « codex d'avant ».
async function _ecrireMarque(m) {
    await window.db.set(CLE, m);
}

/**
 * Lève la marque des copies d'un trimestre dont le fichier est là (après un retour, un codex
 * ouvert…), et rend celles qui restent aux archives. `tout` : lève la marque entière du
 * trimestre (E3 : il quitte l'application, son archive garde tout).
 */
async function lever(trimestre, tout) {
    var m = await window.db.get(CLE, null);
    if (!m || typeof m !== 'object' || !m[trimestre]) return [];
    var restent = [];
    if (!tout) {
        var ids = Object.keys(m[trimestre].ids || {});
        for (var i = 0; i < ids.length; i++) {
            var b = null;
            try { b = await window.travauxStockage.recupererBlob(ids[i]); } catch (e) { b = null; }
            if (!b) restent.push(ids[i]);
        }
        if (restent.length === ids.length) return restent;
    }
    if (restent.length) {
        var garde = {};
        restent.forEach(function(id) { garde[id] = true; });
        m[trimestre].ids = garde;
    } else {
        delete m[trimestre];
    }
    await _ecrireMarque(m);
    return restent;
}

/**
 * Les copies d'un trimestre qui sont aux archives (marquées, fichier absent). La marque des
 * autres est levée au passage. Pour E1 et l'archive d'un groupe.
 * @param {string} trimestre
 * @param {Array} [ids] - restreint à ces copies (l'archive d'un groupe)
 */
async function copiesParties(trimestre, ids) {
    if (!idsMarques(trimestre).length) return [];
    var restent = await lever(trimestre);
    if (!ids) return restent;
    var dans = {};
    ids.forEach(function(id) { dans[id] = true; });
    return restent.filter(function(id) { return dans[id]; });
}

/* ===============================
   LA COMPARAISON (lecture seule)
   =============================== */

async function _fichesDuTrimestre(trimestre) {
    var fiches = [];
    var listes = ['fichiersTravaux', 'corbeilleFichiers'];
    for (var l = 0; l < listes.length; l++) {
        var v = await window.db.get(trimestre + '_' + listes[l], []);
        if (Array.isArray(v)) v.forEach(function(f) { if (f && f.id) fiches.push(f); });
    }
    return fiches;
}

function _supprimes(trimestre) {
    if (typeof window.dasElevesEcartes !== 'function') return new Set();
    return window.dasElevesEcartes(
        window.db.getSync(trimestre + '_elevesDesinscrits', []) || [],
        window.db.getSync(trimestre + '_groupeEtudiants', []) || []
    );
}

/** Le refus qui se lit dans l'application seule, sans attente (le sélecteur part du clic, #995). */
function refusImmediat(trimestre) {
    var RR = window.ReserveRenvoyer;
    if (!RR) return 'sansMagasin';
    if (!RE_TRIMESTRE.test(trimestre || '') || !(window.ReserveTrimestre && window.ReserveTrimestre.estDansLApplication(trimestre))) {
        return 'pasDansLApplication';
    }
    return RR.refusImmediat(trimestre);
}

/**
 * Relit l'archive, puis compare chaque fichier de copie que l'application a. N'écrit rien.
 * @returns {Promise<Object>} etat ∈ identique | different | refus
 */
async function comparer(source, trimestre, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    var RR = window.ReserveRenvoyer;
    var res = {
        etat: null, motif: null, trimestre: trimestre, nom: _nomDe(trimestre), entree: null,
        differences: [], aRetirer: { copies: [], vignettes: [] },
        taille: 0, tailles: {}, dejaParties: 0, laissees: 0
    };
    function refus(motif) { res.etat = 'refus'; res.motif = motif; return res; }

    if (!window.travauxStockage || typeof window.travauxStockage.supprimerBlob !== 'function') return refus('sansMagasin');
    var motif = refusImmediat(trimestre);
    if (motif) return refus(motif);
    res.entree = RR.entreeArchive(trimestre);

    var archive = await RR.relireArchive(source, trimestre, res.entree, onProg);
    if (archive.motif) return refus(archive.motif);
    var empreintes = archive.empreintesCopies;
    var nomDansArchive = {};
    Object.keys(empreintes).forEach(function(n) { nomDansArchive[RV.idDeLaCopie(n)] = n; });
    var total = Object.keys(empreintes).length;

    var fiches = await _fichesDuTrimestre(trimestre);
    var supprimes = _supprimes(trimestre);
    var marques = {};
    idsMarques(trimestre).forEach(function(id) { marques[id] = true; });
    var vues = {};
    var cles = new Set(typeof window.db.keysSync === 'function' ? window.db.keysSync() : await window.db.keys());
    for (var p = 0; p < fiches.length; p++) {
        var f = fiches[p];
        if (vues[f.id]) continue;
        vues[f.id] = true;
        onProg(total + Math.round((p / Math.max(fiches.length, 1)) * total), total * 2);
        var ici = null;
        try { ici = await window.travauxStockage.recupererBlob(f.id); } catch (e) { ici = null; }
        if (!ici) {
            if (marques[f.id]) {
                res.dejaParties++;
                if (cles.has('thumbnail_' + f.id)) res.aRetirer.vignettes.push(f.id);
            }
            continue;
        }
        if (f.etudiantDA && supprimes.has(String(f.etudiantDA))) { res.laissees++; continue; }
        if (!(ici instanceof Blob)) ici = new Blob([ici]);
        if (!nomDansArchive[f.id]) {
            res.differences.push({ type: 'copieAbsente', id: f.id });
        } else {
            var taille = ici.size || 0;
            var empreinte = await RV.sha256(new Uint8Array(await ici.arrayBuffer()));
            if (empreinte !== empreintes[nomDansArchive[f.id]]) res.differences.push({ type: 'copieDifferente', id: f.id });
            else { res.aRetirer.copies.push(f.id); res.taille += taille; res.tailles[f.id] = taille; }
        }
        ici = null;
        if (p % 5 === 4) await _yield();
    }
    onProg(1, 1);
    if (res.differences.length) res.etat = 'different';
    else if (!res.aRetirer.copies.length && !res.aRetirer.vignettes.length) return refus('rien');
    else res.etat = 'identique';
    return res;
}

/* ===============================
   LE RETRAIT
   =============================== */

class Abandon extends Error {
    constructor(raison) { super(raison); this.name = 'Abandon'; this.raison = raison; }
}

/**
 * Pose la marque, puis retire chaque fichier identique et sa vignette. S'arrête au premier refus.
 * @returns {Promise<Object>} bilan : etat ∈ fait | interrompu
 */
async function retirer(res, onProg) {
    onProg = onProg || function() {};
    if (res.etat !== 'identique') throw new Error('retirer() n\'accepte qu\'une comparaison identique');
    var trimestre = res.trimestre;
    var a = res.aRetirer;
    var bilan = { etat: null, motif: null, trimestre: trimestre, nom: res.nom, copies: 0, taille: 0, reste: 0 };
    var total = a.copies.length + 1;
    try {
        // 1. La marque, AVANT tout retrait : une copie retirée est toujours marquée.
        if (a.copies.length) {
            // #522 lot 7 : la marque se lit et s'écrit dans la file de sa clé (db.modifier) ; même
            // marque, même moment (avant tout retrait), relue juste après comme avant.
            var e = res.entree || {};
            await window.db.modifier(CLE, function(m) {
                if (!m || typeof m !== 'object' || Array.isArray(m)) m = {};
                var t = m[trimestre] && typeof m[trimestre] === 'object' ? m[trimestre] : { ids: {} };
                t.dossier = e.dossier || t.dossier || null;
                t.uuid = e.uuid || t.uuid || null;
                t.date = new Date().toISOString();
                t.ids = t.ids && typeof t.ids === 'object' ? t.ids : {};
                a.copies.forEach(function(id) { t.ids[id] = true; });
                m[trimestre] = t;
                return m;
            }, null);
            var relue = await window.db.get(CLE, null);
            if (!relue || !relue[trimestre] || a.copies.some(function(id) { return !_a(relue[trimestre].ids || {}, id); })) throw new Abandon('marqueNonEcrite');
        }
        onProg(1, total);
        // 2. Les fichiers, chacun relu absent, puis sa vignette.
        var vignettes = {};
        a.vignettes.forEach(function(id) { vignettes[id] = true; });
        for (var i = 0; i < a.copies.length; i++) {
            var id = a.copies[i];
            await window.travauxStockage.supprimerBlob(id);
            if (await window.travauxStockage.recupererBlob(id)) throw new Abandon('nonRetire');
            bilan.copies++;
            bilan.taille += res.tailles[id] || 0;
            await _retirerVignette(id);
            delete vignettes[id];
            onProg(i + 2, total);
            if (i % 5 === 4) await _yield();
        }
        // Les vignettes des copies déjà parties (un geste repris).
        var restantes = Object.keys(vignettes);
        for (var v = 0; v < restantes.length; v++) await _retirerVignette(restantes[v]);
        if (typeof window.db.flush === 'function') await window.db.flush();
    } catch (err) {
        if (!(err instanceof Abandon)) console.error('[Archives] Archivage des copies interrompu :', err);
        bilan.etat = 'interrompu';
        bilan.motif = err instanceof Abandon ? err.raison : 'nonRetire';
        if (typeof window.db.flush === 'function') {
            try { await window.db.flush(); } catch (e2) { console.warn('[Archives] flush après arrêt :', e2 && e2.message || e2); }
        }
        bilan.reste = a.copies.length - bilan.copies;
        return bilan;
    }
    bilan.etat = 'fait';
    if (typeof window.signalerEcritureUsager === 'function') window.signalerEcritureUsager(CLE);
    return bilan;
}

/** Retire une clé de vignette, et s'assure qu'elle est partie. */
async function _retirerVignette(id) {
    if (typeof window.travauxStockage.supprimerThumbnail === 'function') await window.travauxStockage.supprimerThumbnail(id);
    var cle = 'thumbnail_' + id;
    await window.db.remove(cle);
    if (window.db.getSync(cle, null) !== null) throw new Abandon('nonRetire');
}

/** Compare, puis retire si identique. Le point d'entrée des bancs et de l'écran. */
async function archiverCopies(source, trimestre, options) {
    options = options || {};
    var res = await comparer(source, trimestre, options.onProgComparaison);
    if (res.etat !== 'identique') return { comparaison: res, bilan: null };
    if (options.confirmer && !(await options.confirmer(res))) return { comparaison: res, bilan: null, annule: true };
    return { comparaison: res, bilan: await retirer(res, options.onProgRetrait) };
}

/* ===============================
   LE COMPTE RENDU
   =============================== */

function compteRendu(comparaison, bilan) {
    if (comparaison.etat === 'refus') {
        var m = MOTS.refus[comparaison.motif] || (window.ReserveRenvoyer && window.ReserveRenvoyer.MOTS.refus[comparaison.motif]);
        return { titre: MOTS.refus.titre, message: typeof m === 'string' ? m : '' };
    }
    if (comparaison.etat === 'different') {
        var c = { copiesAbsentes: 0, copiesDifferentes: 0 };
        comparaison.differences.forEach(function(d) { if (d.type === 'copieAbsente') c.copiesAbsentes++; else c.copiesDifferentes++; });
        c.dateArchive = comparaison.entree && comparaison.entree.date_archive;
        return { titre: MOTS.different.titre(comparaison.nom), message: MOTS.different.texte(c) };
    }
    if (bilan && bilan.etat === 'interrompu') return { titre: MOTS.interrompu.titre, message: MOTS.interrompu.texte({ nom: bilan.nom }) };
    return { titre: MOTS.bilan.titre(bilan.nom), message: MOTS.bilan.texte(bilan) };
}

function fenetreIdentique(res) {
    return {
        titre: MOTS.fenetre.titre(res.nom),
        message: MOTS.fenetre.texte({
            nom: res.nom, copies: res.aRetirer.copies.length, taille: res.taille, laissees: res.laissees,
            dateVerification: res.entree && res.entree.verification && res.entree.verification.date
        }),
        texteConfirmer: MOTS.fenetre.confirmer
    };
}

/* ===============================
   LE GESTE, DEPUIS L'ÉCRAN
   =============================== */

function _prog(pct, detail, stats) {
    if (typeof window.majProgression === 'function') window.majProgression(pct, detail, stats);
}

function _masquer() {
    if (typeof window.masquerProgression === 'function') window.masquerProgression();
}

async function _informer(cr) {
    if (window.uiDialogues && typeof window.uiDialogues.informer === 'function') {
        await window.uiDialogues.informer({ titre: cr.titre, message: cr.message, preformate: true });
    }
}

function _rafraichir() {
    if (window.ReserveReglages && typeof window.ReserveReglages.rafraichir === 'function') {
        try { window.ReserveReglages.rafraichir(); } catch (e) { /* la liste se relit à son ouverture */ }
    }
}

async function _executer(trimestre, source) {
    var res;
    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.enCours, _nomDe(trimestre));
    _prog(0, MOTS.enCours, '');
    try {
        res = await comparer(source, trimestre, function(n, m) { _prog(m ? Math.round((n / m) * 100) : 100, MOTS.enCours, n + ' / ' + m); });
    } catch (e) {
        _masquer();
        console.error('[Archives] Archivage des copies impossible :', e);
        notifications.erreur(window.ReserveVerifier.MOTS.illisible.titre, e.message || String(e));
        return null;
    }
    _masquer();

    if (res.etat === 'refus') { await _informer(compteRendu(res)); return { comparaison: res }; }
    if (res.etat === 'different') {
        var cr = compteRendu(res);
        var archiver = window.uiDialogues && typeof window.uiDialogues.confirmerAction === 'function'
            ? await window.uiDialogues.confirmerAction({ titre: cr.titre, message: cr.message, texteConfirmer: MOTS.different.confirmer, preformate: true })
            : false;
        if (archiver && window.ReserveTrimestre) window.ReserveTrimestre.actionArchiver(trimestre);
        return { comparaison: res };
    }

    var f = fenetreIdentique(res);
    var ok = window.uiDialogues && typeof window.uiDialogues.confirmerAction === 'function'
        ? await window.uiDialogues.confirmerAction({ titre: f.titre, message: f.message, texteConfirmer: f.texteConfirmer, preformate: true })
        : false;
    if (!ok) return { comparaison: res, annule: true };

    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.retrait, res.nom);
    var bilan = await retirer(res, function(n, m) { _prog(m ? Math.round((n / m) * 100) : 100, MOTS.retrait, n + ' / ' + m); });
    _masquer();
    await _informer(compteRendu(res, bilan));
    _rafraichir();
    return { comparaison: res, bilan: bilan };
}

/** Menu ⋮ d'une carte close de la bibliothèque des trimestres (data-param = id du trimestre). */
function actionArchiverCopies(trimestre) {
    if (typeof window.fermerModalBibliothequeTrimestres === 'function') {
        try { window.fermerModalBibliothequeTrimestres(); } catch (e) { /* la modale peut être déjà fermée */ }
    }
    var Reserve = window.Reserve;
    var RV = window.ReserveVerifier;
    var motif = refusImmediat(trimestre);
    if (motif) { _informer(compteRendu({ etat: 'refus', motif: motif })); return; }
    var entree = window.ReserveRenvoyer.entreeArchive(trimestre);
    if (entree.mode_archive === 'fsapi' && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()) {
        Reserve.obtenirHandle().then(function(handle) {
            if (!handle) return;
            return _executer(trimestre, RV.sourceDossier(handle, entree.dossier));
        }).catch(function(e) {
            if (e && e.name === 'DossierRefuse') return; // le garde-fou du dossier a déjà parlé
            console.error('[Archives] Archivage des copies (dossier) échoué :', e);
            notifications.erreur(RV.MOTS.illisible.titre, e && e.message || String(e));
        });
        return;
    }
    RV.choisirFichier(function(fichier) {
        _executer(trimestre, RV.sourceFichier(fichier));
    });
}

/**
 * Le refus d'une nouvelle archive tant que des copies sont aux archives (E1, archive d'un
 * groupe). Rend true si l'archive peut s'écrire ; sinon le dit à l'usager et rend false.
 */
async function permettreArchive(trimestre, ids, options) {
    var parties = await copiesParties(trimestre, ids);
    if (!parties.length) return true;
    if (!(options && options.silencieux)) {
        await _informer({ titre: MOTS.refusArchiver.titre, message: MOTS.refusArchiver.texte(parties.length, _nomDe(trimestre)) });
    }
    return false;
}

window.ReserveCopies = {
    MOTS: MOTS,
    CLE: CLE,
    ACTION: 'ReserveCopies.actionArchiverCopies',
    idsMarques: idsMarques,
    trimestreDeLaCopie: trimestreDeLaCopie,
    estAuxArchives: estAuxArchives,
    idsDansDonnees: idsDansDonnees,
    tousLesIdsMarques: tousLesIdsMarques,
    nomDuTrimestre: _nomDe,
    lever: lever,
    copiesParties: copiesParties,
    permettreArchive: permettreArchive,
    refusImmediat: refusImmediat,
    comparer: comparer,
    retirer: retirer,
    archiverCopies: archiverCopies,
    compteRendu: compteRendu,
    fenetreIdentique: fenetreIdentique,
    executer: _executer,
    actionArchiverCopies: actionArchiverCopies
};

})();
