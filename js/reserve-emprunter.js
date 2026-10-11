/* ===============================
   MODULE : ARCHIVES — EMPRUNTER UN TRIMESTRE
   Date : 4 octobre 2026 (E2 du plan « emprunter et rendre un trimestre », #1023)
   Plan : plans de travail/PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md
   Consigne : plans de travail/CONSIGNE-DU-JOUR.md (Cowork, 4 oct. 2026, 19 h 06)

   Vocation
     Depuis l'archive d'un trimestre entier (E1), VÉRIFIÉE dans ce navigateur, ramener ce
     trimestre — et seulement lui — dans l'application, CLOS. L'archive est l'exemplaire ;
     l'application n'en reçoit qu'une copie de prêt.

   Refus d'abord, rien d'écrit (décisions 2 et 3 de Cowork)
     - le trimestre est au registre `trimestres`, ou une seule clé `<trimestre>_*` existe ;
     - l'archive n'est pas celle qui a été vérifiée (uuid, empreinte de meta.json), ou une
       donnée, ou donnees.json, ne concorde plus avec son empreinte, recalculée AU MOMENT DU
       GESTE ;
     - une clé de l'archive n'est ni `<trimestre>_*` ni la séance vivante d'un de ses groupes
       (une clé globale n'entre jamais, même glissée dans une archive vérifiée) ;
     - une séance vivante, ou une copie, du trimestre est déjà dans le navigateur et DIFFÈRE
       de l'archive.
     ⚠ Écart à la décision 2, mesuré le 4 oct. : `supprimerTrimestre` laisse les séances
     vivantes (leur nom ne porte pas le trimestre) et les fichiers des copies (E0). Refuser
     dès qu'une séance existe refuserait donc tout emprunt après une suppression. Une séance
     ou une copie déjà là et IDENTIQUE à l'archive est laissée telle quelle (« déjà là »),
     jamais réécrite ni retirée ; différente, c'est le refus entier.
     E3 (#1024, 5 oct.) : la même règle vaut pour une clé `<trimestre>_*` restée là sans entrée
     au registre (un renvoi aux archives interrompu, reserve-renvoyer.js) : identique →
     laissée ; différente, ou absente de l'archive → refus « débris ».

   Ce qui est écrit, dans cet ordre (décision 4)
     1. les fichiers des copies (travail et corbeille), un à la fois, chacun recomparé à son
        empreinte avant d'être écrit, puis relu au magasin ;
     2. les clés `<trimestre>_*` et les séances, telles quelles, chacune relue et recomparée ;
     3. EN DERNIER l'entrée du trimestre au registre `trimestres` (depuis `pour_memoire`),
        AJOUTÉE sans toucher aux autres, marquée close. Le trimestre n'apparaît dans la
        bibliothèque qu'une fois tout écrit.
     Aucune autre clé globale (cours, profil, registre longitudinal, bibliothèques, vignettes).
     Les vignettes `thumbnail_<id>` ne sont pas refaites : mesuré sur 394 copies, environ une
     minute et 1,4 Go retenus par le processus graphique (WebKit, 4 oct.) ; inscrit (#1026).
     Les copies d'un·e étudiant·e supprimé·e ne reviennent pas (règle de « Faire revenir »).

   En cas d'échec en cours de route (décision 6)
     Seul ce que CE geste a écrit est retiré, dans l'ordre inverse (registre, clés, fichiers).
     Une copie de l'archive qui ne concorde pas est un échec de ce type : un seul passage
     dans l'archive (1,1 Go pour l'hiver 2026), et ce qui était déjà écrit est retiré.

   La mémoire
     Une copie à la fois, par les sources de « Vérifier » (le ZIP n'est jamais chargé en
     entier) ; donnees.json est lu en entier (26 Mo pour l'automne et l'hiver réunis).

   Dépendances
     - reserve-verifier.js (window.ReserveVerifier) : sources, empreintes, état « vérifiée »
     - reserve.js (window.Reserve) : lireManifesteLocal, supporteFSAPI, obtenirHandle
     - travaux-stockage.js (window.travauxStockage) : recupererBlob, stockerBlob, supprimerBlob
     - import-export.js (window.dasElevesEcartes) : les étudiant·es supprimé·es de l'archive
     - db.js, progression.js, ui-dialogues.js, utils-notifications.js
   =============================== */

(function() {
'use strict';

/* ===============================
   LES MOTS — UN SEUL ENDROIT
   ===============================
   Acceptés par Grégoire le 4 oct. 2026 (consigne de Cowork de 19 h 46) : le verbe est
   « Faire revenir », celui des copies d'un groupe dans la même liste ; aucun « emprunt » dans un
   texte que l'usager lit (sentinelle-e2-emprunter-trimestre). Les noms internes restent.
*/
function _pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

var MOTS = {
    bouton: 'Faire revenir',
    infobulle: 'Ramener ce trimestre dans l\'application, clos, pour le consulter',
    enCours: 'Retour du trimestre…',
    fenetre: {
        titre: function(nom) { return 'Faire revenir ' + nom + ' ?'; },
        texte: function(c) {
            return c.nom + ' revient dans l\'application tel qu\'il a été archivé, clos : ' +
                _pluriel(c.etudiants, 'étudiant·e', 'étudiant·es') + ', ' +
                _pluriel(c.copies, 'copie', 'copies') + '.\n\n' +
                'Rien d\'autre n\'est touché : les autres trimestres, les cours et les réglages restent tels quels.';
        },
        confirmer: 'Faire revenir'
    },
    bilan: {
        titre: 'Trimestre revenu',
        texte: function(b) {
            var lignes = [b.nom + ' est revenu, clos. Tu le trouves dans la bibliothèque des trimestres.', ''];
            lignes.push(_pluriel(b.revenues, 'copie revenue', 'copies revenues'));
            if (b.dejaLa) lignes.push(_pluriel(b.dejaLa, 'copie déjà là', 'copies déjà là'));
            if (b.supprimes) lignes.push(_pluriel(b.supprimes, 'copie d\'un·e étudiant·e supprimé·e, laissée dans l\'archive', 'copies d\'étudiant·es supprimé·es, laissées dans l\'archive'));
            if (b.sansFichier) lignes.push(_pluriel(b.sansFichier, 'fiche sans copie dans l\'archive', 'fiches sans copie dans l\'archive'));
            return lignes.join('\n');
        }
    },
    refus: {
        titre: 'Impossible de faire revenir le trimestre',
        // Le cas « déjà là » : refusé, sans option « remplacer » (décision de Grégoire, 4 oct.).
        dejaLa: function(nom) { return nom + ' est déjà dans l\'application : ouvre-le depuis la bibliothèque des trimestres. Rien n\'a été écrit.'; },
        debris: function(nom) { return 'Des données de ' + nom + ' sont déjà dans l\'application, sans qu\'il soit dans la bibliothèque des trimestres, et ne concordent pas avec l\'archive. Rien n\'a été écrit.'; },
        differe: function(nom) { return 'Une séance ou une copie de ' + nom + ' est déjà dans l\'application et ne concorde pas avec l\'archive. Rien n\'a été écrit.'; },
        nonVerifiee: 'Cette archive n\'est pas vérifiée dans ce navigateur. Vérifie-la d\'abord.',
        changeeDepuis: 'Cette archive ne concorde plus avec sa vérification. Rien n\'a été écrit. Vérifie-la de nouveau.',
        pasUnTrimestre: 'Cette archive n\'est pas celle d\'un trimestre entier.',
        sansEmpreintes: 'Cette archive ne porte pas les empreintes de ses données. Archive de nouveau ce trimestre.',
        sansMagasin: 'Le stockage des copies n\'est pas disponible dans cette page.'
    },
    echec: {
        titre: 'Impossible de faire revenir le trimestre',
        texte: function(raison) { return 'Le retour s\'est arrêté en cours de route (' + raison + '). Ce qu\'il avait écrit a été retiré : l\'application est comme avant.'; },
        resteEcrit: function(raison, cles, copies) {
            return 'Le retour s\'est arrêté en cours de route (' + raison + '), et ce qu\'il avait écrit n\'a pas pu être retiré en entier : ' +
                _pluriel(cles, 'donnée', 'données') + ' et ' + _pluriel(copies, 'copie', 'copies') + ' restent.';
        },
        copieAbimee: 'une copie de l\'archive ne concorde pas avec son empreinte',
        nonEcrite: 'l\'espace du navigateur a refusé une écriture',
        apparu: 'le trimestre est apparu pendant son retour'
    }
};

/* ===============================
   UTILITAIRES
   =============================== */

var RE_TRIMESTRE = /^[aeh]\d{4}$/;
var PREFIXE_SEANCE = 'seancesCompletes_gc_';

function _yield() {
    return new Promise(function(resolve) { setTimeout(resolve, 0); });
}

async function _octets(blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

function _a(objet, cle) { return Object.prototype.hasOwnProperty.call(objet, cle); }

var SAISONS = { a: 'Automne', h: 'Hiver', e: 'Été' };

/** « Hiver 2026 » pour « h2026 » : la liste des archives ne porte pas le nom du trimestre. */
function _nomDe(trimestre) {
    var t = String(trimestre || '');
    return RE_TRIMESTRE.test(t) ? SAISONS[t.charAt(0)] + ' ' + t.slice(1) : t;
}

function _registre() {
    var liste = window.db.getSync('trimestres', []) || [];
    return Array.isArray(liste) ? liste : [];
}

/** Toutes les clés que l'application connaît : IndexedDB, et ce que getSync voit. */
async function _toutesLesCles() {
    var cles = new Set(await window.db.keys());
    if (typeof window.db.keysSync === 'function') window.db.keysSync().forEach(function(k) { cles.add(k); });
    return cles;
}

/** Les DA des étudiant·es supprimé·es, selon les données DE L'ARCHIVE. */
function _supprimes(donnees, trimestre) {
    if (typeof window.dasElevesEcartes !== 'function') return new Set();
    return window.dasElevesEcartes(donnees[trimestre + '_elevesDesinscrits'] || [], donnees[trimestre + '_groupeEtudiants'] || []);
}

/**
 * Le refus « déjà là », lu dans l'application seule (sans l'archive) ; null s'il n'y en a pas.
 * Une clé `<trimestre>_*` sans entrée au registre n'est plus refusée ici (E3) : elle se juge
 * contre l'archive, dans emprunter().
 */
async function refusDejaLa(trimestre) {
    if (_registre().some(function(t) { return t && t.id === trimestre; })) return 'dejaLa';
    return null;
}

/**
 * Le même refus, SANS attente : le sélecteur de fichier doit partir du clic lui-même (#995,
 * Safari). Après le démarrage, keysSync voit toutes les clés d'IndexedDB (#389) ; emprunter()
 * refait le regard complet, de façon asynchrone, avant d'écrire.
 */
function refusDejaLaImmediat(trimestre) {
    if (_registre().some(function(t) { return t && t.id === trimestre; })) return 'dejaLa';
    return null;
}

/**
 * Le trimestre dont ce geste écrit les clés, le temps de l'étape 2 seulement ; null sinon. La
 * garde #340 (productions-namespace-garde.js) ne déroge que pour lui (verdict de Cowork, 4 oct.).
 */
var _enCours = null;
function trimestreEnCours() { return _enCours; }

class Abandon extends Error {
    constructor(raison) { super(raison); this.name = 'Abandon'; this.raison = raison; }
}

/* ===============================
   L'EMPRUNT
   =============================== */

/**
 * Emprunte le trimestre de l'archive. Refuse sans rien écrire, ou écrit tout, ou retire ce
 * qu'il a écrit.
 * @param {Object} source - ReserveVerifier.sourceFichier(...) ou sourceDossier(...)
 * @param {Object} entree - l'entrée de la liste locale (uuid, trimestre, verification, …)
 * @param {Function} [onProg] - (fait, total, etape)
 * @returns {Promise<Object>} bilan : etat ∈ fait | refus | echec
 */
async function emprunter(source, entree, onProg) {
    onProg = onProg || function() {};
    var RV = window.ReserveVerifier;
    var trimestre = entree && entree.trimestre;
    var bilan = {
        etat: null, motif: null, trimestre: trimestre, nom: _nomDe(trimestre),
        cles: [], seancesDejaLa: [], clesDejaLa: [], revenues: [], dejaLa: [], supprimes: [], sansFichier: [],
        registre: false, retire: null, resteEcrit: null
    };
    function refus(motif) { bilan.etat = 'refus'; bilan.motif = motif; return bilan; }

    if (!window.travauxStockage || typeof window.travauxStockage.stockerBlob !== 'function') return refus('sansMagasin');
    if (!entree || entree.type_archive !== 'trimestre' || !RE_TRIMESTRE.test(trimestre || '')) return refus('pasUnTrimestre');
    if (!RV.etatVerification(entree).verifiee) return refus('nonVerifiee');

    // Déjà là ? Avant même d'ouvrir l'archive.
    var deja = await refusDejaLa(trimestre);
    if (deja) return refus(deja);

    // ── L'archive, telle qu'elle a été vérifiée, recomparée maintenant ──
    await source.ouvrir();
    var metaTexte = await source.lireTexte('meta.json');
    if (metaTexte == null) throw new Error(RV.MOTS.erreurs.sansMeta);
    var meta;
    try { meta = JSON.parse(metaTexte); } catch (e) { throw new Error(RV.MOTS.erreurs.metaIllisible); }
    if (!meta || typeof meta !== 'object') throw new Error(RV.MOTS.erreurs.metaIllisible);
    bilan.nom = meta.nom_trimestre || bilan.nom;
    if (meta.type_archive !== 'trimestre' || meta.trimestre !== trimestre) return refus('pasUnTrimestre');
    if (entree.uuid && meta.uuid !== entree.uuid) return refus('changeeDepuis');
    if ((await RV.sha256Texte(metaTexte)) !== entree.verification.meta_sha256) return refus('changeeDepuis');
    var integrite = meta.integrite || {};
    var empreintesCles = integrite.cles_sha256;
    var empreintesCopies = integrite.travaux_sha256;
    if (!empreintesCles || typeof empreintesCles !== 'object' || !empreintesCopies || typeof empreintesCopies !== 'object') {
        return refus('sansEmpreintes');
    }

    var donneesTexte = await source.lireTexte('donnees.json');
    if (donneesTexte == null || (await RV.sha256Texte(donneesTexte)) !== integrite.donnees_json_sha256) return refus('changeeDepuis');
    var donnees;
    try { donnees = JSON.parse(donneesTexte); } catch (e) { return refus('changeeDepuis'); }
    donneesTexte = null;
    if (!donnees || typeof donnees !== 'object' || Array.isArray(donnees)) return refus('changeeDepuis');

    // Chaque clé : à son empreinte, et à sa place (le trimestre, ou la séance d'un de ses groupes).
    var prefixe = trimestre + '_';
    var groupes = Array.isArray(donnees[prefixe + 'groupesCours']) ? donnees[prefixe + 'groupesCours'] : [];
    var seancesPermises = {};
    groupes.forEach(function(g) { if (g && g.id) seancesPermises[PREFIXE_SEANCE + g.id] = true; });
    var cles = Object.keys(donnees).sort();
    if (cles.length !== Object.keys(empreintesCles).length) return refus('changeeDepuis');
    for (var c = 0; c < cles.length; c++) {
        var cle = cles[c];
        if (!_a(empreintesCles, cle)) return refus('changeeDepuis');
        if (cle.indexOf(prefixe) !== 0 && !seancesPermises[cle]) return refus('changeeDepuis');
        if ((await RV.sha256Texte(JSON.stringify(donnees[cle]))) !== empreintesCles[cle]) return refus('changeeDepuis');
    }

    // Les séances, et les clés du trimestre restées d'un renvoi interrompu (E3), déjà là :
    // identiques → laissées ; différentes → refus. Une clé du trimestre que l'archive n'a pas → débris.
    var presentes = await _toutesLesCles();
    for (var kp of presentes) {
        if (typeof kp !== 'string' || kp.indexOf(prefixe) !== 0 || _a(donnees, kp)) continue;
        // Une clé vide ne garde rien (E1 ne l'archive pas) : ni débris, ni réécrite.
        var vide = await window.db.get(kp, null);
        if (vide !== null && vide !== undefined) return refus('debris');
    }
    var aEcrire = [];
    for (var s = 0; s < cles.length; s++) {
        var k = cles[s];
        if (!presentes.has(k)) { aEcrire.push(k); continue; }
        var ici = await window.db.get(k, null);
        if ((await RV.sha256Texte(JSON.stringify(ici))) !== empreintesCles[k]) return refus(k.indexOf(prefixe) === 0 ? 'debris' : 'differe');
        if (k.indexOf(prefixe) === 0) bilan.clesDejaLa.push(k); else bilan.seancesDejaLa.push(k);
    }

    // Les copies : leur fiche (travail ou corbeille) dans l'archive, et ce que le navigateur a déjà.
    var fiches = {};
    ['fichiersTravaux', 'corbeilleFichiers'].forEach(function(liste) {
        var v = donnees[prefixe + liste];
        if (Array.isArray(v)) v.forEach(function(f) { if (f && f.id && !fiches[f.id]) fiches[f.id] = f; });
    });
    var supprimes = _supprimes(donnees, trimestre);
    var nomsArchive = {};
    Object.keys(empreintesCopies).forEach(function(n) { nomsArchive[RV.idDeLaCopie(n)] = n; });
    Object.keys(fiches).forEach(function(id) { if (!nomsArchive[id]) bilan.sansFichier.push(id); });
    var copiesAEcrire = [];
    var nomsCopies = Object.keys(empreintesCopies);
    for (var p = 0; p < nomsCopies.length; p++) {
        var nomCopie = nomsCopies[p];
        var id = RV.idDeLaCopie(nomCopie);
        var fiche = fiches[id];
        onProg(p, nomsCopies.length, 'avant');
        if (!fiche) continue; // une copie sans fiche dans l'archive n'a nulle part où revenir
        if (fiche.etudiantDA && supprimes.has(String(fiche.etudiantDA))) { bilan.supprimes.push(id); continue; }
        var chezNous = null;
        try { chezNous = await window.travauxStockage.recupererBlob(id); } catch (e) { chezNous = null; }
        if (chezNous) {
            if (!(chezNous instanceof Blob)) chezNous = new Blob([chezNous]);
            var empreinteIci = await RV.sha256(await _octets(chezNous));
            chezNous = null;
            if (empreinteIci !== empreintesCopies[nomCopie]) return refus('differe');
            bilan.dejaLa.push(id);
            continue;
        }
        copiesAEcrire.push({ id: id, nom: nomCopie, fiche: fiche });
        if (p % 5 === 4) await _yield();
    }

    // ── L'écriture. À partir d'ici, tout échec retire ce que ce geste a écrit. ──
    var ecrit = { copies: [], cles: [], registre: false };
    try {
        // 1. Les fichiers des copies, un à la fois.
        var listees = {};
        (await source.listerCopies()).forEach(function(x) { listees[x.nom] = true; });
        for (var i = 0; i < copiesAEcrire.length; i++) {
            var a = copiesAEcrire[i];
            onProg(i, copiesAEcrire.length, 'copies');
            if (!listees[a.nom]) throw new Abandon('copieAbimee');
            var lu = await source.lireCopie(a.nom);
            if (lu.probleme) throw new Abandon('copieAbimee');
            // Le Blob est fait AVANT l'empreinte : le calcul rend le tampon des octets.
            var blob = new Blob([lu.octets], { type: a.fiche.typeMIME || '' });
            var empreinte = await RV.sha256(lu.octets);
            lu = null;
            if (empreinte !== empreintesCopies[a.nom]) throw new Abandon('copieAbimee');
            ecrit.copies.push(a.id); // avant l'écriture : une écriture à moitié faite se retire aussi
            await window.travauxStockage.stockerBlob(a.id, blob, a.fiche.etudiantDA || '', a.fiche.productionId || '', { notifier: false });
            var relu = await window.travauxStockage.recupererBlob(a.id);
            if (!relu || (relu.size !== undefined && relu.size !== blob.size)) throw new Abandon('nonEcrite');
            bilan.revenues.push(a.id);
            blob = null;
            if (i % 5 === 4) await _yield();
        }

        // 2. Les clés du trimestre et les séances, telles quelles, chacune relue.
        _enCours = trimestre;
        try {
            for (var j = 0; j < aEcrire.length; j++) {
                var cleE = aEcrire[j];
                onProg(j, aEcrire.length, 'donnees');
                ecrit.cles.push(cleE);
                await window.db.set(cleE, donnees[cleE]);
                var relue = await window.db.get(cleE, null);
                if ((await RV.sha256Texte(JSON.stringify(relue))) !== empreintesCles[cleE]) throw new Abandon('nonEcrite');
                bilan.cles.push(cleE);
            }
        } finally {
            _enCours = null;
        }

        // 3. EN DERNIER, l'entrée du registre : ajoutée, close, sans toucher aux autres.
        var registre = _registre();
        if (registre.some(function(t) { return t && t.id === trimestre; })) throw new Abandon('apparu');
        var souvenir = meta.pour_memoire && meta.pour_memoire.trimestre;
        var entreeRegistre = souvenir && souvenir.id === trimestre
            ? JSON.parse(JSON.stringify(souvenir))
            : { id: trimestre, nom: bilan.nom };
        entreeRegistre.archive = true;
        delete entreeRegistre.actif;
        ecrit.registre = true;
        await window.db.set('trimestres', registre.concat([entreeRegistre]));
        var registreRelu = await window.db.get('trimestres', []);
        if (!Array.isArray(registreRelu) || !registreRelu.some(function(t) { return t && t.id === trimestre && t.archive === true; })) {
            throw new Abandon('nonEcrite');
        }
        bilan.registre = true;
        if (typeof window.db.flush === 'function') await window.db.flush();
    } catch (err) {
        bilan.etat = 'echec';
        bilan.motif = err instanceof Abandon ? err.raison : 'nonEcrite';
        if (!(err instanceof Abandon)) console.error('[Archives] Emprunt interrompu :', err);
        await _retirer(trimestre, ecrit, bilan);
        return bilan;
    }

    if (typeof window.signalerEcritureUsager === 'function') window.signalerEcritureUsager('trimestres');
    bilan.etat = 'fait';
    return bilan;
}

/** Retire, dans l'ordre inverse, ce que ce geste a écrit ; rien d'autre. */
async function _retirer(trimestre, ecrit, bilan) {
    var reste = { cles: 0, copies: 0 };
    if (ecrit.registre) {
        try {
            // #522 lot 7 : dans la file de la clé ; n'écrit que si le trimestre y est, comme avant.
            await window.db.modifier('trimestres', function(liste) {
                if (!(Array.isArray(liste) && liste.some(function(t) { return t && t.id === trimestre; }))) return undefined;
                return liste.filter(function(t) { return !t || t.id !== trimestre; });
            }, []);
        } catch (e) { console.warn('[Archives] Registre non rétabli :', e && e.message || e); reste.cles++; }
    }
    for (var i = ecrit.cles.length - 1; i >= 0; i--) {
        try { await window.db.remove(ecrit.cles[i]); }
        catch (e) { console.warn('[Archives] Clé non retirée : ' + ecrit.cles[i], e && e.message || e); reste.cles++; }
    }
    for (var j = ecrit.copies.length - 1; j >= 0; j--) {
        try { await window.travauxStockage.supprimerBlob(ecrit.copies[j]); }
        catch (e) { console.warn('[Archives] Copie non retirée : ' + ecrit.copies[j], e && e.message || e); reste.copies++; }
    }
    if (typeof window.db.flush === 'function') {
        try { await window.db.flush(); } catch (e) { console.warn('[Archives] flush après retrait :', e && e.message || e); }
    }
    bilan.retire = { cles: ecrit.cles.length, copies: ecrit.copies.length, registre: ecrit.registre };
    bilan.resteEcrit = (reste.cles || reste.copies) ? reste : null;
}

/* ===============================
   LE COMPTE RENDU À L'USAGER
   =============================== */

function compteRendu(bilan) {
    if (bilan.etat === 'refus') {
        var m = MOTS.refus[bilan.motif];
        return { titre: MOTS.refus.titre, message: typeof m === 'function' ? m(bilan.nom) : (m || '') };
    }
    if (bilan.etat === 'echec') {
        var raison = MOTS.echec[bilan.motif] || MOTS.echec.nonEcrite;
        return {
            titre: MOTS.echec.titre,
            message: bilan.resteEcrit
                ? MOTS.echec.resteEcrit(raison, bilan.resteEcrit.cles, bilan.resteEcrit.copies)
                : MOTS.echec.texte(raison)
        };
    }
    return {
        titre: MOTS.bilan.titre,
        message: MOTS.bilan.texte({
            nom: bilan.nom, revenues: bilan.revenues.length, dejaLa: bilan.dejaLa.length,
            supprimes: bilan.supprimes.length, sansFichier: bilan.sansFichier.length
        })
    };
}

/* ===============================
   LE GESTE, DEPUIS L'ÉCRAN « ARCHIVES »
   =============================== */

function _prog(pct, detail, stats) {
    if (typeof window.majProgression === 'function') window.majProgression(pct, detail, stats);
}

async function _informer(cr) {
    if (window.uiDialogues && typeof window.uiDialogues.informer === 'function') {
        await window.uiDialogues.informer({ titre: cr.titre, message: cr.message, preformate: true });
    }
}

/** La fenêtre, puis l'emprunt, puis le bilan. La source est déjà choisie (geste actif, #995). */
async function _executer(entree, source) {
    var nom = _nomDe(entree.trimestre);
    var confirme = window.uiDialogues && typeof window.uiDialogues.confirmerAction === 'function'
        ? await window.uiDialogues.confirmerAction({
            titre: MOTS.fenetre.titre(nom),
            message: MOTS.fenetre.texte({
                nom: nom,
                etudiants: entree.nombre_etudiants || 0,
                copies: entree.nombre_fichiers_travaux || 0
            }),
            texteConfirmer: MOTS.fenetre.confirmer,
            preformate: true
        })
        : true;
    if (!confirme) return null;

    if (typeof window.afficherProgression === 'function') window.afficherProgression(MOTS.enCours, entree.dossier || '');
    _prog(0, MOTS.enCours, '');
    var bilan;
    try {
        bilan = await emprunter(source, entree, function(n, m, etape) {
            var base = etape === 'avant' ? 0 : etape === 'copies' ? 30 : 85;
            var largeur = etape === 'avant' ? 30 : etape === 'copies' ? 55 : 15;
            _prog(base + (m ? Math.round((n / m) * largeur) : largeur), MOTS.enCours, n + ' / ' + m);
        });
    } catch (e) {
        if (typeof window.masquerProgression === 'function') window.masquerProgression();
        console.error('[Archives] Emprunt impossible :', e);
        notifications.erreur(window.ReserveVerifier.MOTS.illisible.titre, e.message || String(e));
        return null;
    }
    if (typeof window.masquerProgression === 'function') window.masquerProgression();
    await _informer(compteRendu(bilan));
    if (bilan.etat === 'fait' && typeof window.populerDropdownTrimestreV2 === 'function') {
        try { window.populerDropdownTrimestreV2(); } catch (e) { /* la bibliothèque se relit à son ouverture */ }
    }
    return bilan;
}

/**
 * Action du bouton « Emprunter » d'une ligne de la liste (data-action, data-param = dossier).
 * Offert seulement pour l'archive vérifiée d'un trimestre ; les gardes sont aussi dans emprunter().
 * Le refus « déjà là » se dit AVANT de demander le fichier : il ne dépend pas de l'archive.
 */
function actionEmprunter(dossier) {
    var Reserve = window.Reserve;
    var RV = window.ReserveVerifier;
    if (!dossier || !Reserve || typeof Reserve.lireManifesteLocal !== 'function' || !RV) return;
    var entree = Reserve.lireManifesteLocal().archives[dossier];
    if (!entree) {
        notifications.erreur(RV.MOTS.illisible.titre, RV.MOTS.erreurs.nonListee);
        return;
    }
    entree = Object.assign({ dossier: dossier }, entree);
    if (!RV.etatVerification(entree).verifiee) {
        _informer(compteRendu({ etat: 'refus', motif: 'nonVerifiee', nom: entree.trimestre }));
        return;
    }
    var deja = refusDejaLaImmediat(entree.trimestre);
    if (deja) {
        var t = _registre().find(function(x) { return x && x.id === entree.trimestre; });
        _informer(compteRendu({ etat: 'refus', motif: deja, nom: (t && t.nom) || _nomDe(entree.trimestre) }));
        return;
    }
    if (entree.mode_archive === 'fsapi' && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()) {
        Reserve.obtenirHandle().then(function(handle) {
            if (!handle) return;
            return _executer(entree, RV.sourceDossier(handle, dossier));
        }).catch(function(e) {
            if (e && e.name === 'DossierRefuse') return; // le garde-fou du dossier a déjà parlé
            console.error('[Archives] Emprunt (dossier) échoué :', e);
            notifications.erreur(RV.MOTS.illisible.titre, e && e.message || String(e));
        });
        return;
    }
    RV.choisirFichier(function(fichier) {
        _executer(entree, RV.sourceFichier(fichier));
    });
}

window.ReserveEmprunter = {
    MOTS: MOTS,
    refusDejaLa: refusDejaLa,
    refusDejaLaImmediat: refusDejaLaImmediat,
    trimestreEnCours: trimestreEnCours,
    emprunter: emprunter,
    compteRendu: compteRendu,
    executer: _executer,
    actionEmprunter: actionEmprunter
};

})();
