/* ===============================
   MODULE : ARCHIVES — RENVOYER UN TRIMESTRE AUX ARCHIVES
   Date : 5 octobre 2026 (E3 du plan « emprunter et rendre un trimestre », #1024)
   Plan : plans de travail/PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md
   Consigne : plans de travail/CONSIGNE-DU-JOUR.md (Cowork, 5 oct. 2026, 4 h 36)

   Vocation
     Retirer de l'application un trimestre CLOS dont l'archive (E1), listée et VÉRIFIÉE dans ce
     navigateur, le garde À L'IDENTIQUE. L'archive est l'exemplaire ; « Faire revenir » (E2) le
     ramène. C'est le seul geste du plan qui retire des données.

   La règle : on ne renvoie que ce que l'archive sait rendre à l'identique (décision 2)
     Au moment du geste, l'archive est relue (meta.json à l'empreinte retenue par « Vérifier »,
     donnees.json à la sienne, chaque copie qu'elle promet présente) puis COMPARÉE au trimestre :
       - chaque clé `<trimestre>_*`, et chaque séance vivante de ses groupes, à son empreinte ;
       - chaque fichier de copie (travail et corbeille) que l'application a, à son empreinte.
     Identique → offert. Différent (une clé changée ou née depuis, une copie absente de l'archive
     ou différente) → RIEN n'est retiré ; la fenêtre propose d'archiver de nouveau d'abord.
     Une pièce ABSENTE de l'application ne fait pas de différence : l'archive l'a, rien ne se perd
     (c'est aussi ce qui rend le geste idempotent).

   Ce qui est retiré (décision 4), dans cet ordre (décision 5)
     1. l'entrée du trimestre au registre `trimestres`, sans toucher aux autres ;
     2. les fichiers de ses copies (travail et corbeille, #1019), chacun avec sa vignette
        `thumbnail_<id>` ;
     3. les séances vivantes `seancesCompletes_gc_<id>` de ses groupes ;
     4. EN DERNIER, ses clés `<trimestre>_*`.
     Pourquoi cet ordre : le registre d'abord, pour qu'un trimestre à moitié retiré ne soit plus
     jamais offert à l'activation, à « Rouvrir » ni à « Archiver » (une nouvelle archive d'un
     trimestre amputé écraserait la bonne) ; ses clés en dernier, pour qu'il en reste tant qu'il
     reste quelque chose : une seule clé `<trimestre>_*` sans entrée au registre suffit à dire,
     sans rien lire, « renvoi inachevé » (la ligne de l'archive offre alors de le finir).
     Jamais une clé globale partagée (cours, infoCours, profil, registre longitudinal,
     `seancesCompletes_<coursId>`, `groupeCoursActif`…), ni ce que l'archive ne garde pas
     (`snapshot_<trimestre>_<horodatage>`, `tableCorrespondance_<trimestre>` : laissés).

   Interrompu, il se reprend (décision 5)
     Le geste s'arrête à la première écriture refusée ; ce qui reste est identique à l'archive.
     Le relancer (depuis la ligne de l'archive : « Terminer le renvoi ») refait la même
     comparaison sur ce qui reste et achève. « Faire revenir » sait aussi ramener le trimestre
     depuis ce qui reste (reserve-emprunter.js : identique → laissé).

   Le filet (décision 6)
     L'archive vérifiée et identique EST le filet : aucun codex à part n'est exigé.

   La mémoire
     Une copie à la fois (empreinte, puis oubliée) ; donnees.json est lu en entier pour son
     empreinte (26 Mo pour l'automne et l'hiver réunis).

   Dépendances
     - reserve-verifier.js (window.ReserveVerifier) : sources, empreintes, état « vérifiée »
     - reserve-trimestre.js (window.ReserveTrimestre) : nomDossier, archiverTrimestre
     - reserve.js (window.Reserve) : lireManifesteLocal, supporteFSAPI, obtenirHandle
     - travaux-stockage.js (window.travauxStockage) : recupererBlob, supprimerBlob, supprimerThumbnail
     - db.js, progression.js, ui-dialogues.js, utils-notifications.js
   =============================== */

(function() {
'use strict';

/* ===============================
   LES MOTS — UN SEUL ENDROIT
   ===============================
   Tranchés par Grégoire le 5 oct. 2026 (7 h 43-7 h 45, verdict de Cowork) : « Terminer le renvoi »
   (l'ancien mot provisoire écarté) ; virgule décimale ; une seule date dans la fenêtre.
*/
function _pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

/** La taille, au format de tout l'écran des archives (reserve.js). */
function _formaterTaille(octets) {
    return window.Reserve.formaterTaille(octets);
}

function _jour(iso) {
    if (!iso) return '?';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '?';
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

var MOTS = {
    menu: 'Renvoyer aux archives…',
    menuTitre: 'Retirer ce trimestre de l\'application : son archive vérifiée le garde',
    enCours: 'Comparaison avec l\'archive…',
    retrait: 'Renvoi aux archives…',
    fenetre: {
        titre: function(nom) { return 'Renvoyer ' + nom + ' aux archives ?'; },
        texte: function(c) {
            return c.nom + ' quittera l\'application : ' +
                _pluriel(c.etudiants, 'étudiant·e', 'étudiant·es') + ', ' +
                _pluriel(c.copies, 'copie', 'copies') + ', environ ' + _formaterTaille(c.taille) + '.\n' +
                'Son archive, vérifiée le ' + _jour(c.dateVerification) + ', le garde tel quel : « Faire revenir » le ramènera.\n' +
                'Garde bien cette archive : c\'est elle qui le conserve.\n' +
                'Les autres trimestres, les cours et les réglages ne sont pas touchés.';
        },
        confirmer: 'Renvoyer aux archives'
    },
    different: {
        titre: function(nom) { return nom + ' a changé depuis son archive'; },
        texte: function(c) {
            var parts = [];
            if (c.changees) parts.push(_pluriel(c.changees, 'donnée modifiée', 'données modifiées'));
            if (c.nees) parts.push(_pluriel(c.nees, 'donnée ajoutée', 'données ajoutées'));
            if (c.copiesAbsentes) parts.push(_pluriel(c.copiesAbsentes, 'copie ajoutée', 'copies ajoutées'));
            if (c.copiesDifferentes) parts.push(_pluriel(c.copiesDifferentes, 'copie modifiée', 'copies modifiées'));
            var lignes = ['Rien n\'a été retiré.', 'Depuis son archive du ' + _jour(c.dateArchive) + ' : ' + parts.join(', ') + '.'];
            if (c.reprise) {
                lignes.push('Fais-le revenir pour le consulter, puis archive-le de nouveau avant de le renvoyer.');
            } else {
                lignes.push('C\'est normal si tu l\'as consulté : l\'application recalcule certaines données à l\'ouverture.');
                lignes.push('Pour le renvoyer : archive-le de nouveau, vérifie la nouvelle archive, puis renvoie-le.');
            }
            return lignes.join('\n');
        },
        confirmer: 'Archiver de nouveau'
    },
    bilan: {
        titre: function(nom) { return nom + ' est renvoyé aux archives'; },
        texte: function(b) {
            return 'Il n\'est plus dans l\'application ; son archive le garde.\n' +
                'Pour le faire revenir : Réglages › Données › Archives, « Faire revenir ».\n' +
                _pluriel(b.copies, 'copie retirée', 'copies retirées') + '.' +
                (b.taille ? ' Ton prochain codex sera plus léger d\'environ ' + _formaterTaille(b.taille) + '.' : '');
        }
    },
    interrompu: {
        titre: 'Renvoi inachevé',
        texte: function(b) {
            return 'Le renvoi de ' + b.nom + ' s\'est arrêté en cours de route. Rien n\'est perdu : son archive garde tout.\n' +
                'Pour finir : Réglages › Données › Archives, ligne de ' + b.nom + ', « ' + MOTS.reprise.bouton + ' ».\n' +
                'Pour annuler : « Faire revenir », au même endroit.';
        }
    },
    reprise: {
        bouton: 'Terminer le renvoi',
        infobulle: 'Le renvoi s\'est arrêté en cours de route : retirer ce qui reste',
        titre: function(nom) { return 'Terminer le renvoi de ' + nom + ' ?'; },
        texte: function(c) {
            return 'Une partie de ' + c.nom + ' est restée dans l\'application, identique à son archive. Elle sera retirée ; l\'archive garde tout.';
        }
    },
    refus: {
        titre: 'Trimestre non renvoyé',
        introuvable: 'Ce trimestre n\'est pas dans la bibliothèque.',
        pasClos: 'Seul un trimestre clos peut être renvoyé aux archives. Clos-le, puis archive-le.',
        actif: 'C\'est le trimestre actif : active un autre trimestre d\'abord.',
        sansArchive: 'Ce trimestre n\'a pas d\'archive dans la liste. Archive-le d\'abord, puis vérifie l\'archive.',
        nonVerifiee: 'Son archive n\'est pas vérifiée dans ce navigateur. Vérifie-la d\'abord (Réglages › Données › Archives).',
        // Un seul message pour les deux cas (mots de Grégoire, 5 oct.).
        changeeDepuis: 'Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n\'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau.',
        copiesAbsentes: 'Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n\'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau.',
        sansEmpreintes: 'Cette archive est trop ancienne pour un renvoi. Archive le trimestre de nouveau.',
        pasUnTrimestre: 'Cette archive n\'est pas celle de ce trimestre.',
        rien: 'Ce trimestre n\'est plus dans l\'application : il n\'y a rien à renvoyer.',
        sansMagasin: 'Le stockage des copies n\'est pas disponible dans cette page.'
    }
};

/* ===============================
   UTILITAIRES
   =============================== */

var RE_TRIMESTRE = /^[aeh]\d{4}$/;
var PREFIXE_SEANCE = 'seancesCompletes_gc_';
var SAISONS = { a: 'Automne', h: 'Hiver', e: 'Été' };

function _a(objet, cle) { return Object.prototype.hasOwnProperty.call(objet, cle); }

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

async function _octets(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

function _registre() {
    var liste = window.db.getSync('trimestres', []) || [];
    return Array.isArray(liste) ? liste : [];
}

function _entreeRegistre(trimestre) {
    return _registre().find(function(t) { return t && t.id === trimestre; }) || null;
}

function _nomDe(trimestre) {
    var t = _entreeRegistre(trimestre);
    if (t && t.nom) return t.nom;
    var s = String(trimestre || '');
    return RE_TRIMESTRE.test(s) ? SAISONS[s.charAt(0)] + ' ' + s.slice(1) : s;
}

function _estActif(trimestre) {
    var t = _entreeRegistre(trimestre);
    if (t && t.actif === true) return true;
    var actif = window.db.getSync('trimestreActif', null);
    return actif === trimestre;
}

/** Toutes les clés que l'application connaît : IndexedDB, et ce que getSync voit. */
async function _toutesLesCles() {
    var cles = new Set(await window.db.keys());
    if (typeof window.db.keysSync === 'function') window.db.keysSync().forEach(function(k) { cles.add(k); });
    return cles;
}

/** Sans attente : reste-t-il une clé `<trimestre>_*` ? */
function _resteDesCles(trimestre) {
    var prefixe = trimestre + '_';
    var cles = typeof window.db.keysSync === 'function' ? window.db.keysSync() : [];
    return cles.some(function(k) { return typeof k === 'string' && k.indexOf(prefixe) === 0; });
}

/** L'entrée de la liste des archives pour l'archive de ce trimestre entier, ou null. */
function entreeArchive(trimestre) {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.lireManifesteLocal !== 'function' || !window.ReserveTrimestre) return null;
    var dossier = window.ReserveTrimestre.nomDossier(trimestre);
    var e = Reserve.lireManifesteLocal().archives[dossier];
    if (!e || e.type_archive !== 'trimestre' || e.trimestre !== trimestre) return null;
    return Object.assign({ dossier: dossier }, e);
}

/**
 * Le refus, lu dans l'application seule (sans l'archive), SANS attente : le sélecteur de
 * fichier doit partir du clic lui-même (#995, Safari). null s'il n'y en a pas.
 * Un trimestre absent du registre dont il reste des clés est un renvoi inachevé : permis.
 */
function refusImmediat(trimestre) {
    if (!RE_TRIMESTRE.test(trimestre || '')) return 'introuvable';
    var t = _entreeRegistre(trimestre);
    if (!t) {
        if (!_resteDesCles(trimestre)) return 'rien';
    } else {
        if (t.archive !== true) return 'pasClos';
        if (_estActif(trimestre)) return 'actif';
    }
    var e = entreeArchive(trimestre);
    if (!e) return 'sansArchive';
    if (!window.ReserveVerifier || !window.ReserveVerifier.etatVerification(e).verifiee) return 'nonVerifiee';
    return null;
}

/** Le renvoi en cours de ce trimestre est-il inachevé (absent du registre, des clés restent) ? */
function estInacheve(trimestre) {
    return RE_TRIMESTRE.test(trimestre || '') && !_entreeRegistre(trimestre) && _resteDesCles(trimestre);
}

class Abandon extends Error {
    constructor(raison) { super(raison); this.name = 'Abandon'; this.raison = raison; }
}

/* ===============================
   LA COMPARAISON (lecture seule)
   =============================== */

/**
 * L'archive du trimestre, telle qu'elle a été vérifiée, relue AU MOMENT DU GESTE : meta.json à
 * l'empreinte retenue par « Vérifier », donnees.json à la sienne, chaque copie promise présente,
 * puis le CONTENU de chaque copie relu et empreinté, une à la fois. N'écrit rien.
 * Partagée avec « Archiver les copies » (#1028, reserve-copies.js) : les deux gestes font de
 * l'archive l'unique exemplaire de ce qu'ils retirent.
 * @returns {Promise<Object>} { motif } (refus) ou { meta, empreintesCles, empreintesCopies }
 */
async function relireArchive(source, trimestre, entree, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    await source.ouvrir();
    var metaTexte = await source.lireTexte('meta.json');
    if (metaTexte == null) throw new Error(RV.MOTS.erreurs.sansMeta);
    var meta;
    try { meta = JSON.parse(metaTexte); } catch (e) { throw new Error(RV.MOTS.erreurs.metaIllisible); }
    if (!meta || typeof meta !== 'object') throw new Error(RV.MOTS.erreurs.metaIllisible);
    if (meta.type_archive !== 'trimestre' || meta.trimestre !== trimestre) return { motif: 'pasUnTrimestre' };
    if (entree.uuid && meta.uuid !== entree.uuid) return { motif: 'changeeDepuis' };
    if ((await RV.sha256Texte(metaTexte)) !== entree.verification.meta_sha256) return { motif: 'changeeDepuis' };
    var integrite = meta.integrite || {};
    var empreintesCles = integrite.cles_sha256;
    var empreintesCopies = integrite.travaux_sha256;
    if (!empreintesCles || typeof empreintesCles !== 'object' || !empreintesCopies || typeof empreintesCopies !== 'object') {
        return { motif: 'sansEmpreintes' };
    }
    var donneesTexte = await source.lireTexte('donnees.json');
    if (donneesTexte == null || (await RV.sha256Texte(donneesTexte)) !== integrite.donnees_json_sha256) return { motif: 'changeeDepuis' };
    donneesTexte = null;
    var listees = {};
    (await source.listerCopies()).forEach(function(x) { listees[x.nom] = true; });
    var nomsArchive = Object.keys(empreintesCopies).sort();
    var manquantes = nomsArchive.filter(function(n) { return !listees[n]; }).length;
    if (manquantes) return { motif: 'copiesAbsentes', manquantes: manquantes };

    // Le CONTENU de chaque copie de l'archive, relu et empreinté maintenant, une à la fois, y
    // compris celles que l'application n'a plus (une reprise). Verdict de Cowork (5 oct., 7 h 19,
    // correction 1) : le renvoi est le seul moment où l'archive devient l'unique exemplaire, et
    // « vérifiée » peut dater de semaines (iCloud évince ou remplace un fichier sans que la liste
    // change). Une seule illisible, tronquée ou différente → refus, rien retiré.
    for (var q = 0; q < nomsArchive.length; q++) {
        onProg(q, nomsArchive.length * 2);
        var lu = await source.lireCopie(nomsArchive[q]);
        if (!lu || lu.probleme) return { motif: 'changeeDepuis' };
        var empreinteArchive = await RV.sha256(lu.octets);
        lu = null;
        if (empreinteArchive !== empreintesCopies[nomsArchive[q]]) return { motif: 'changeeDepuis' };
        if (q % 5 === 4) await _yield();
    }
    return { meta: meta, empreintesCles: empreintesCles, empreintesCopies: empreintesCopies };
}

/**
 * Relit l'archive, puis compare le trimestre à l'archive. N'écrit rien.
 * @param {Object} source - ReserveVerifier.sourceFichier(...) ou sourceDossier(...)
 * @param {string} trimestre
 * @param {Function} [onProg] - (fait, total)
 * @returns {Promise<Object>} etat ∈ identique | different | refus ; et ce qu'il faudra retirer
 */
async function comparer(source, trimestre, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    var res = {
        etat: null, motif: null, trimestre: trimestre, nom: _nomDe(trimestre), reprise: !_entreeRegistre(trimestre),
        differences: [], copiesAbsentesArchive: 0,
        aRetirer: { registre: false, copies: [], vignettes: [], seances: [], cles: [] },
        taille: 0, tailles: {}, etudiants: 0, entree: null
    };
    function refus(motif, extra) { res.etat = 'refus'; res.motif = motif; if (extra) Object.assign(res, extra); return res; }

    if (!window.travauxStockage || typeof window.travauxStockage.supprimerBlob !== 'function') return refus('sansMagasin');
    var motif = refusImmediat(trimestre);
    if (motif) return refus(motif);
    var entree = entreeArchive(trimestre);
    res.entree = entree;

    var archive = await relireArchive(source, trimestre, entree, onProg);
    if (archive.motif) return refus(archive.motif, archive.manquantes ? { manquantes: archive.manquantes } : null);
    var empreintesCles = archive.empreintesCles;
    var empreintesCopies = archive.empreintesCopies;
    var nomsArchive = Object.keys(empreintesCopies).sort();
    res.empreintes = empreintesCles; // le retrait recompare chaque clé juste avant de la retirer

    // ── Les clés : celles du trimestre, et les séances de ses groupes (archive et application) ──
    var prefixe = trimestre + '_';
    var presentes = await _toutesLesCles();
    var aComparer = [];
    presentes.forEach(function(k) { if (typeof k === 'string' && k.indexOf(prefixe) === 0) aComparer.push(k); });
    var seances = {};
    Object.keys(empreintesCles).forEach(function(k) { if (k.indexOf(PREFIXE_SEANCE) === 0) seances[k] = true; });
    var gcs = presentes.has(prefixe + 'groupesCours') ? await window.db.get(prefixe + 'groupesCours', []) : [];
    if (Array.isArray(gcs)) gcs.forEach(function(g) { if (g && g.id) seances[PREFIXE_SEANCE + g.id] = true; });
    Object.keys(seances).sort().forEach(function(k) { if (presentes.has(k)) aComparer.push(k); });

    for (var c = 0; c < aComparer.length; c++) {
        var cle = aComparer[c];
        var valeur = await window.db.get(cle, null);
        // Une clé vide ne garde rien, et E1 ne l'archive pas : elle part avec les autres, jamais
        // « née depuis » (verdict de Cowork, correction 2 : sinon le retrait la disait nouvelle,
        // le renvoi était refusé en boucle, et une clé vide restée faisait « inachevé » à jamais).
        if (valeur === null || valeur === undefined) {
            if (cle.indexOf(prefixe) === 0) res.aRetirer.cles.push(cle); else res.aRetirer.seances.push(cle);
            continue;
        }
        if (!_a(empreintesCles, cle)) { res.differences.push({ type: 'nee', cle: cle }); continue; }
        if ((await RV.sha256Texte(JSON.stringify(valeur))) !== empreintesCles[cle]) { res.differences.push({ type: 'changee', cle: cle }); continue; }
        if (cle.indexOf(prefixe) === 0) res.aRetirer.cles.push(cle); else res.aRetirer.seances.push(cle);
        if (cle === prefixe + 'groupeEtudiants' && Array.isArray(valeur)) res.etudiants = valeur.length;
    }

    // ── Les copies : celles que l'application a, à leur empreinte dans l'archive ──
    var nomDansArchive = {};
    Object.keys(empreintesCopies).forEach(function(n) { nomDansArchive[RV.idDeLaCopie(n)] = n; });
    var ids = {};
    Object.keys(nomDansArchive).forEach(function(id) { ids[id] = true; });
    for (var l = 0, listes = ['fichiersTravaux', 'corbeilleFichiers']; l < listes.length; l++) {
        if (!presentes.has(prefixe + listes[l])) continue;
        var v = await window.db.get(prefixe + listes[l], []);
        if (Array.isArray(v)) v.forEach(function(f) { if (f && f.id) ids[f.id] = true; });
    }
    var tousLesIds = Object.keys(ids).sort();
    for (var p = 0; p < tousLesIds.length; p++) {
        var id = tousLesIds[p];
        onProg(nomsArchive.length + Math.round((p / Math.max(tousLesIds.length, 1)) * nomsArchive.length), nomsArchive.length * 2);
        var ici = null;
        try { ici = await window.travauxStockage.recupererBlob(id); } catch (e) { ici = null; }
        if (ici) {
            if (!(ici instanceof Blob)) ici = new Blob([ici]);
            if (!nomDansArchive[id]) {
                res.differences.push({ type: 'copieAbsente', id: id });
            } else {
                var taille = ici.size || 0;
                var empreinte = await RV.sha256(await _octets(ici));
                if (empreinte !== empreintesCopies[nomDansArchive[id]]) res.differences.push({ type: 'copieDifferente', id: id });
                else { res.aRetirer.copies.push(id); res.taille += taille; res.tailles[id] = taille; }
            }
            ici = null;
        }
        if (nomDansArchive[id] && presentes.has('thumbnail_' + id)) res.aRetirer.vignettes.push(id);
        if (p % 5 === 4) await _yield();
    }
    onProg(1, 1);

    res.aRetirer.registre = !!_entreeRegistre(trimestre);
    res.etat = res.differences.length ? 'different' : 'identique';
    return res;
}

/* ===============================
   LE RETRAIT
   =============================== */

/**
 * Retire ce que la comparaison a trouvé identique. S'arrête à la première écriture refusée.
 * Les clés sont recomparées juste avant (rien ne doit être né ni avoir changé entre-temps).
 * @param {Object} res - le résultat de comparer(), à l'état « identique »
 * @returns {Promise<Object>} bilan : etat ∈ fait | interrompu | different
 */
async function retirer(res, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    var trimestre = res.trimestre;
    var prefixe = trimestre + '_';
    var a = res.aRetirer;
    var bilan = { etat: null, motif: null, trimestre: trimestre, nom: res.nom, cles: 0, copies: 0, taille: 0, reste: null };
    if (res.etat !== 'identique') throw new Error('retirer() n\'accepte qu\'une comparaison identique');

    // Rien n'est né depuis la comparaison (une clé du trimestre de plus) : sinon, on ne retire rien.
    var presentes = await _toutesLesCles();
    var connues = {};
    a.cles.forEach(function(k) { connues[k] = true; });
    var nouvelles = [];
    presentes.forEach(function(k) { if (typeof k === 'string' && k.indexOf(prefixe) === 0 && !connues[k]) nouvelles.push(k); });
    // Ni changé : chaque clé recomparée AVANT le premier retrait (une différence découverte au
    // milieu laisserait un reste qui ne concorde plus, que ni la reprise ni « Faire revenir »
    // ne sauraient finir).
    var changees = [];
    var aRelire = a.seances.concat(a.cles);
    for (var r = 0; r < aRelire.length; r++) {
        var val = await window.db.get(aRelire[r], null);
        if (val === null || val === undefined) continue;
        if ((await RV.sha256Texte(JSON.stringify(val))) !== res.empreintes[aRelire[r]]) changees.push(aRelire[r]);
    }
    if (nouvelles.length || changees.length) {
        res.etat = 'different';
        nouvelles.forEach(function(k) { res.differences.push({ type: 'nee', cle: k }); });
        changees.forEach(function(k) { res.differences.push({ type: 'changee', cle: k }); });
        bilan.etat = 'different';
        return bilan;
    }

    var total = (a.registre ? 1 : 0) + a.copies.length + a.seances.length + a.cles.length;
    var fait = 0;
    try {
        // 1. Le registre : le trimestre quitte la bibliothèque.
        if (a.registre) {
            var liste = await window.db.get('trimestres', []);
            if (Array.isArray(liste) && liste.some(function(t) { return t && t.id === trimestre; })) {
                await window.db.set('trimestres', liste.filter(function(t) { return !t || t.id !== trimestre; }));
                var relu = await window.db.get('trimestres', []);
                if (Array.isArray(relu) && relu.some(function(t) { return t && t.id === trimestre; })) throw new Abandon('nonRetire');
            }
            onProg(++fait, total);
        }
        // 2. Les fichiers des copies, chacun avec sa vignette.
        var vignettes = {};
        a.vignettes.forEach(function(id) { vignettes[id] = true; });
        for (var i = 0; i < a.copies.length; i++) {
            var id = a.copies[i];
            await window.travauxStockage.supprimerBlob(id);
            if (await window.travauxStockage.recupererBlob(id)) throw new Abandon('nonRetire');
            bilan.copies++;
            bilan.taille += (res.tailles && res.tailles[id]) || 0;
            if (vignettes[id]) { await _retirerVignette(id); delete vignettes[id]; }
            onProg(++fait, total);
            if (i % 5 === 4) await _yield();
        }
        // Les vignettes de copies déjà parties (un renvoi repris, une suppression d'avant).
        var restantes = Object.keys(vignettes);
        for (var v = 0; v < restantes.length; v++) await _retirerVignette(restantes[v]);
        // 3. Les séances vivantes de ses groupes, recomparées.
        for (var s = 0; s < a.seances.length; s++) {
            await _retirerCle(a.seances[s]);
            bilan.cles++;
            onProg(++fait, total);
        }
        // 4. EN DERNIER, ses clés : tant qu'il en reste, le renvoi se sait inachevé.
        for (var k = 0; k < a.cles.length; k++) {
            await _retirerCle(a.cles[k]);
            bilan.cles++;
            onProg(++fait, total);
            if (k % 10 === 9) await _yield();
        }
        if (typeof window.db.flush === 'function') await window.db.flush();
    } catch (err) {
        if (!(err instanceof Abandon)) console.error('[Archives] Renvoi interrompu :', err);
        bilan.etat = 'interrompu';
        bilan.motif = err instanceof Abandon ? err.raison : 'nonRetire';
        if (typeof window.db.flush === 'function') {
            try { await window.db.flush(); } catch (e) { console.warn('[Archives] flush après arrêt :', e && e.message || e); }
        }
        bilan.reste = await _inventaire(res);
        return bilan;
    }

    // #1028 : le trimestre a quitté l'application ; la marque de ses copies aux archives n'a
    // plus d'objet (son archive garde tout). Une marque restée serait sans effet : levée sans arrêt.
    if (window.ReserveCopies) {
        try { await window.ReserveCopies.lever(trimestre, true); } catch (e) { console.warn('[Archives] Marque des copies non levée :', e && e.message || e); }
    }
    bilan.etat = 'fait';
    if (typeof window.signalerEcritureUsager === 'function') window.signalerEcritureUsager('trimestres');
    return bilan;
}

/**
 * Retire une clé, et s'assure qu'elle est partie.
 * `db.remove` attend le commit d'IndexedDB, en rend l'échec, et vide le cache mémoire depuis
 * #845 (mesuré le 5 oct. sur 394 copies : avant, le renvoi s'arrêtait à `h2026_fichiersTravaux`,
 * que `getSync` voyait encore).
 */
async function _retirerCle(cle) {
    await window.db.remove(cle);
    if (window.db.getSync(cle, null) !== null) throw new Abandon('nonRetire');
}

async function _retirerVignette(id) {
    // Le cache des vignettes de travauxStockage, puis la clé (même raison que _retirerCle).
    if (typeof window.travauxStockage.supprimerThumbnail === 'function') await window.travauxStockage.supprimerThumbnail(id);
    await _retirerCle('thumbnail_' + id);
}

/** Ce qui reste du trimestre dans l'application (sans empreinte : un compte). */
async function _inventaire(res) {
    var a = res.aRetirer;
    var presentes = await _toutesLesCles();
    var cles = a.cles.concat(a.seances).filter(function(k) { return presentes.has(k); }).length;
    var copies = 0;
    for (var i = 0; i < a.copies.length; i++) {
        var b = null;
        try { b = await window.travauxStockage.recupererBlob(a.copies[i]); } catch (e) { b = null; }
        if (b) copies++;
    }
    return { cles: cles, copies: copies, registre: !!_entreeRegistre(res.trimestre) };
}

/**
 * Compare, puis retire si identique. Le point d'entrée des bancs et de l'écran.
 * @returns {Promise<Object>} { comparaison, bilan|null }
 */
async function renvoyer(source, trimestre, options) {
    options = options || {};
    var res = await comparer(source, trimestre, options.onProgComparaison);
    if (res.etat !== 'identique') return { comparaison: res, bilan: null };
    if (options.confirmer && !(await options.confirmer(res))) return { comparaison: res, bilan: null, annule: true };
    var bilan = await retirer(res, options.onProgRetrait);
    return { comparaison: res, bilan: bilan };
}

/* ===============================
   LE COMPTE RENDU À L'USAGER
   =============================== */

function _compter(differences) {
    var c = { total: differences.length, changees: 0, nees: 0, copiesAbsentes: 0, copiesDifferentes: 0 };
    differences.forEach(function(d) {
        if (d.type === 'changee') c.changees++;
        else if (d.type === 'nee') c.nees++;
        else if (d.type === 'copieAbsente') c.copiesAbsentes++;
        else if (d.type === 'copieDifferente') c.copiesDifferentes++;
    });
    return c;
}

/** Le texte d'un refus ou d'une différence (comparaison), ou d'un bilan (retrait). */
function compteRendu(comparaison, bilan) {
    if (comparaison.etat === 'refus') {
        var m = MOTS.refus[comparaison.motif];
        return { titre: MOTS.refus.titre, message: typeof m === 'function' ? m(comparaison.manquantes || 0) : (m || '') };
    }
    if (comparaison.etat === 'different' || (bilan && bilan.etat === 'different')) {
        return {
            titre: MOTS.different.titre(comparaison.nom),
            message: MOTS.different.texte(Object.assign(_compter(comparaison.differences), {
                nom: comparaison.nom, dateArchive: comparaison.entree && comparaison.entree.date_archive, reprise: comparaison.reprise
            }))
        };
    }
    if (bilan && bilan.etat === 'interrompu') {
        return {
            titre: MOTS.interrompu.titre,
            message: MOTS.interrompu.texte({ nom: bilan.nom })
        };
    }
    return { titre: MOTS.bilan.titre(bilan.nom), message: MOTS.bilan.texte({ copies: bilan.copies, taille: bilan.taille }) };
}

/** La fenêtre qui offre le geste (comparaison identique). */
function fenetreIdentique(res) {
    if (res.reprise) {
        return {
            titre: MOTS.reprise.titre(res.nom),
            message: MOTS.reprise.texte({ nom: res.nom }),
            texteConfirmer: MOTS.reprise.bouton
        };
    }
    return {
        titre: MOTS.fenetre.titre(res.nom),
        message: MOTS.fenetre.texte({
            nom: res.nom, etudiants: res.etudiants, copies: res.aRetirer.copies.length, taille: res.taille,
            dateArchive: res.entree && res.entree.date_archive,
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
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        try { window.populerDropdownTrimestreV2(); } catch (e) { /* la bibliothèque se relit à son ouverture */ }
    }
    if (window.ReserveReglages && typeof window.ReserveReglages.rafraichir === 'function') {
        try { window.ReserveReglages.rafraichir(); } catch (e) { /* la liste se relit à son ouverture */ }
    }
}

/** Comparer (progression), puis la fenêtre, puis le retrait, puis le bilan. La source est déjà choisie. */
async function _executer(trimestre, source) {
    var res;
    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.enCours, _nomDe(trimestre));
    _prog(0, MOTS.enCours, '');
    try {
        res = await comparer(source, trimestre, function(n, m) { _prog(m ? Math.round((n / m) * 100) : 100, MOTS.enCours, n + ' / ' + m); });
    } catch (e) {
        _masquer();
        console.error('[Archives] Renvoi impossible :', e);
        notifications.erreur(window.ReserveVerifier.MOTS.illisible.titre, e.message || String(e));
        return null;
    }
    _masquer();

    if (res.etat === 'refus') { await _informer(compteRendu(res)); return { comparaison: res }; }
    if (res.etat === 'different') {
        var cr = compteRendu(res);
        // Archiver de nouveau : offert seulement si le trimestre est encore au registre (E1 le refuse sinon).
        if (!res.reprise && window.ReserveTrimestre && window.uiDialogues && typeof window.uiDialogues.confirmerAction === 'function') {
            var archiver = await window.uiDialogues.confirmerAction({
                titre: cr.titre, message: cr.message, texteConfirmer: MOTS.different.confirmer, preformate: true
            });
            if (archiver) window.ReserveTrimestre.actionArchiver(trimestre);
        } else {
            await _informer(cr);
        }
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

/** L'archive du trimestre, puis le geste. Le refus immédiat se dit AVANT de demander le fichier. */
function _lancer(trimestre) {
    var Reserve = window.Reserve;
    var RV = window.ReserveVerifier;
    var motif = refusImmediat(trimestre);
    if (motif) {
        _informer(compteRendu({ etat: 'refus', motif: motif }));
        return;
    }
    var entree = entreeArchive(trimestre);
    if (entree.mode_archive === 'fsapi' && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()) {
        Reserve.obtenirHandle().then(function(handle) {
            if (!handle) return;
            return _executer(trimestre, RV.sourceDossier(handle, entree.dossier));
        }).catch(function(e) {
            if (e && e.name === 'DossierRefuse') return; // le garde-fou du dossier a déjà parlé
            console.error('[Archives] Renvoi (dossier) échoué :', e);
            notifications.erreur(RV.MOTS.illisible.titre, e && e.message || String(e));
        });
        return;
    }
    RV.choisirFichier(function(fichier) {
        _executer(trimestre, RV.sourceFichier(fichier));
    });
}

/** Menu ⋮ d'une carte close de la bibliothèque des trimestres (data-param = id du trimestre). */
function actionRenvoyer(trimestre) {
    if (typeof window.fermerModalBibliothequeTrimestres === 'function') {
        try { window.fermerModalBibliothequeTrimestres(); } catch (e) { /* la modale peut être déjà fermée */ }
    }
    _lancer(trimestre);
}

/** « Terminer le renvoi » d'une ligne de la liste des archives (data-param = dossier). */
function actionReprendre(dossier) {
    var Reserve = window.Reserve;
    if (!dossier || !Reserve || typeof Reserve.lireManifesteLocal !== 'function') return;
    var e = Reserve.lireManifesteLocal().archives[dossier];
    if (!e || e.type_archive !== 'trimestre') return;
    _lancer(e.trimestre);
}

window.ReserveRenvoyer = {
    MOTS: MOTS,
    ACTION: 'ReserveRenvoyer.actionRenvoyer',
    refusImmediat: refusImmediat,
    estInacheve: estInacheve,
    entreeArchive: entreeArchive,
    relireArchive: relireArchive,
    comparer: comparer,
    retirer: retirer,
    renvoyer: renvoyer,
    compteRendu: compteRendu,
    fenetreIdentique: fenetreIdentique,
    executer: _executer,
    actionRenvoyer: actionRenvoyer,
    actionReprendre: actionReprendre
};

})();
