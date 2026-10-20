/**
 * bareme.js — Le BARÈME d'un critère analytique : ce que valent ses points, tranche par tranche.
 *
 * Plan : `plans de travail/PLAN-2026-10-19-bareme.md` ; consigne du lot 1 :
 * `plans de travail/CONSIGNE-LOT-2026-10-20-bareme-1-editeur.md` (#1120, geste 1).
 *
 * LE MODÈLE. `critere.bareme` : une liste de tranches `{ id, nom, pointsMin, pointsMax, texte }`.
 * `id` stable, indépendant des points ; `pointsMin`/`pointsMax`, des NOMBRES (jamais une chaîne
 * relue), égaux pour une tranche d'une seule valeur ; `null` tous deux pour une tranche « à
 * compléter » (une ancienne réponse lue sans points). Seuls les critères analytiques en portent un.
 *
 * LA LECTURE UNIQUE (invariant 2). `tranchesDuCritere` est la seule façon de lire un barème :
 * l'éditeur, l'import, la grille du PDF (`export-pdf.js`, `tableauDesCriteres`) et, plus tard,
 * l'évaluation passent par elle. Elle lit `bareme`,
 * sinon l'ancien `descripteurs.parNiveau` SANS `echelleId` (les « réponses » écrites par la
 * dissection, lot 13), sans rien écrire : rien ne se convertit sans geste (invariant 5). La
 * première modification d'un critère écrit ce que cette lecture rend (`grilles.js`).
 *
 * ⚠ AUCUN CALCUL NE LIT LE BARÈME (invariant 1) : ni la note, ni P, ni le Comparateur, ni
 * l'export, ni le dépistage — tous lisent les points (`pointsAnalytiques`), comme avant.
 * ⚠ LE ZÉRO EST UNE VALEUR (invariant 3) : « 0 point » se lit 0 ; « Partiel » n'a pas de
 * points (`null`, pas 0) ; la virgule décimale se lit.
 *
 * DEUX JEUX DE REFUS. `refusStructure` : ce qu'un barème doit être pour entrer, à l'import comme
 * à l'écriture (types, 20 tranches, 5 000 caractères, des bornes dans l'ordre). Les refus de
 * SAISIE (`modifierPoints`) y ajoutent ce que l'enseignant écrit lui-même : des points lisibles, de 0
 * à la pondération, sans chevauchement. Des points effacés ne sont pas refusés : la tranche redevient
 * « à compléter » (`null`), comme une tranche neuve (C1 du verdict du 20 oct. : rien n'est inventé,
 * et aucun texte n'attend ses points pour s'enregistrer). Un barème du stock peut porter une
 * tranche sans points, deux tranches qui se chevauchent (des réponses « 3-4 » et « 4-5 ») ou une
 * tranche au-delà d'une pondération baissée après coup : il reste lisible, et voyage tel quel.
 *
 * Module PUR : aucun accès au stockage, aucun effet. Textes des refus : voir `REFUS`.
 */
(function () {
    'use strict';

    var B = {};

    B.MAX_TRANCHES = 20;
    B.MAX_TEXTE = 5000;
    B.MAX_NOM = 200;
    B.MAX_ID = 100;

    // Les refus de l'éditeur, lus par le témoin commun (« Non enregistré : ‹raison›. »).
    // D4 à D10 : validé G. 20 oct. 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md), tels quels. `trop` et
    // `texteLong` reprennent ceux des réponses (lot 13, validés G. 19 oct. 19 h 29), le mot « réponse » devenu « tranche ».
    B.REFUS = {
        trop: 'Au plus 20 tranches par critère',
        texteLong: 'Une tranche fait 5 000 caractères au plus',
        nomLong: 'Le nom d’une tranche fait 200 caractères au plus',
        pointsIllisibles: 'Ces points ne se lisent pas : écris un nombre (3 ou 2,5) ou deux bornes (3 à 4)',
        pointsNegatifs: 'Les points d’une tranche commencent à 0 : corrige-les',
        pointsHorsBornes: function (max) {
            return 'Les points d’une tranche vont de 0 à ' + B.nombreEnTexte(max) + ', la pondération du critère : corrige-les, ou change la pondération';
        },
        chevauchement: function (autre) {
            var qui = String(autre.nom || '').trim() ? '« ' + String(autre.nom).trim() + ' » (' + B.pointsEnTexte(autre) + ')' : B.pointsEnTexte(autre);
            return 'Ces points chevauchent ceux de la tranche ' + qui + ' : choisis des points qu’aucune autre tranche ne couvre';
        }
    };

    // ------------------------------------------------------------------
    // Les points écrits → des nombres
    // ------------------------------------------------------------------

    var NOMBRE = '(\\d+(?:[.,]\\d+)?)';
    var UNITE = '(?:\\s*(?:points?|pts?\\.?))?';
    // Deux bornes : trait court, demi-cadratin, ou « à » (mesure préalable du plan).
    var POINTS = new RegExp('^' + NOMBRE + UNITE + '(?:\\s*(?:-|–|à)\\s*' + NOMBRE + UNITE + ')?$', 'i');

    function nombre(s) { return parseFloat(String(s).replace(',', '.')); }

    /**
     * Des points écrits par l'enseignant (« 3 », « 2,5 », « 3-4 », « 4 – 5 pts », « 3 à 4 ») →
     * `{ pointsMin, pointsMax }` ; rien d'écrit → `{ vide: true }` ; autre chose → `{ illisible: true }`.
     * Deux bornes à l'envers se lisent dans l'ordre (« 4-3 » : de 3 à 4).
     */
    B.lirePoints = function (saisie) {
        var s = String(saisie == null ? '' : saisie).trim();
        if (!s) return { vide: true };
        var m = POINTS.exec(s);
        if (!m) return /^[-−]\s*\d/.test(s) ? { negatif: true } : { illisible: true };
        var a = nombre(m[1]), b = m[2] === undefined ? a : nombre(m[2]);
        return { pointsMin: Math.min(a, b), pointsMax: Math.max(a, b) };
    };

    /**
     * La CLÉ d'une ancienne réponse → ce qu'elle dit. Le suffixe « (n) » d'une clé dédoublée tombe ;
     * « Réponse N » (une réponse lue sans points) ne nomme rien ; des points lisibles donnent la
     * tranche ; tout le reste (un nom de niveau, « Partiel », une clé illisible) devient son NOM,
     * sans points : rien n'est inventé, rien ne se perd.
     */
    B.lireCle = function (cleLue) {
        var s = String(cleLue == null ? '' : cleLue).trim().replace(/\s*\(\d+\)$/, '');
        if (/^Réponse \d+$/.test(s)) return { nom: '', pointsMin: null, pointsMax: null };
        var p = B.lirePoints(s);
        if (p.pointsMin !== undefined) return { nom: '', pointsMin: p.pointsMin, pointsMax: p.pointsMax };
        return { nom: s, pointsMin: null, pointsMax: null };
    };

    // ------------------------------------------------------------------
    // La lecture unique
    // ------------------------------------------------------------------

    function fini(v) { return typeof v === 'number' && isFinite(v) ? v : null; }

    /** Une tranche lue telle quelle, en copie : des chaînes, des nombres finis ou `null`. */
    function normaliser(t) {
        var o = t && typeof t === 'object' ? t : {};
        var min = fini(o.pointsMin), max = fini(o.pointsMax);
        // Une seule borne écrite : la tranche vaut cette valeur (la lecture la plus proche de l'écrit).
        if (min === null) min = max;
        if (max === null) max = min;
        return { id: String(o.id == null ? '' : o.id), nom: String(o.nom == null ? '' : o.nom),
            pointsMin: min, pointsMax: max, texte: String(o.texte == null ? '' : o.texte) };
    }

    /** L'ancien format : des réponses sans échelle (`descripteurs.parNiveau`, sans `echelleId`). */
    function ancien(critere) {
        var d = critere && critere.descripteurs;
        return !!(d && d.parNiveau && typeof d.parNiveau === 'object' && !d.echelleId);
    }

    /** Vrai si le critère porte encore ses réponses d'avant, lues comme un barème mais pas écrites. */
    B.estAncien = function (critere) {
        return !!critere && critere.type === 'analytique' && !Array.isArray(critere.bareme) && ancien(critere);
    };

    /**
     * Les tranches d'un critère, dans l'ordre écrit ; `[]` pour un critère qui n'est pas analytique.
     * Lues d'une ancienne réponse, elles prennent l'identifiant `TR_lu_<rang>` : il ne dépend que de
     * l'ordre écrit, alors l'éditeur vise la même tranche avant et après la conversion.
     */
    B.tranchesDuCritere = function (critere) {
        if (!critere || critere.type !== 'analytique') return [];
        if (Array.isArray(critere.bareme)) return critere.bareme.map(normaliser);
        if (!ancien(critere)) return [];
        var par = critere.descripteurs.parNiveau;
        return Object.keys(par).map(function (k, i) {
            var lu = B.lireCle(k);
            return { id: 'TR_lu_' + (i + 1), nom: lu.nom, pointsMin: lu.pointsMin, pointsMax: lu.pointsMax,
                texte: String(par[k] == null ? '' : par[k]) };
        });
    };

    /** La tranche que des points désignent, ou `null` (aucune, ou des points absents). Le zéro en est. */
    B.trancheDesPoints = function (tranches, points) {
        if (typeof points !== 'number' || !isFinite(points)) return null;
        var liste = Array.isArray(tranches) ? tranches : [];
        for (var i = 0; i < liste.length; i++) {
            var t = liste[i];
            if (t && t.pointsMin !== null && t.pointsMin !== undefined && points >= t.pointsMin && points <= t.pointsMax) return t;
        }
        return null;
    };

    /** Une tranche qui n'a pas encore ses points. */
    B.aCompleter = function (t) { return !t || t.pointsMin === null || t.pointsMin === undefined; };

    /** Une tranche au-delà du maximum du critère (une pondération baissée après coup). */
    B.horsBareme = function (t, max) {
        var m = Number(max);
        return !B.aCompleter(t) && max !== null && max !== '' && isFinite(m) && t.pointsMax > m;
    };

    // ------------------------------------------------------------------
    // L'affichage des points
    // ------------------------------------------------------------------

    B.nombreEnTexte = function (n) { return String(n).replace('.', ','); };

    /** « 3 », « 2,5 », « 3 à 4 » ; « » pour une tranche à compléter. */
    B.pointsEnTexte = function (t) {
        if (B.aCompleter(t)) return '';
        return t.pointsMin === t.pointsMax ? B.nombreEnTexte(t.pointsMin) : B.nombreEnTexte(t.pointsMin) + ' à ' + B.nombreEnTexte(t.pointsMax);
    };

    /**
     * Les points d'une tranche avec leur unité, comme l'élève les lit : « 1 point », « 3-4 points »,
     * « 2,5 points » ; « » pour une tranche à compléter. Le trait court entre les bornes est celui de
     * la décision de Grégoire (20 oct., 16 h 58) ; le singulier sous 2, la règle C1 de la dissection
     * (`avecUnite`, materiel-dissection-lecture.js) ; une plage s'accorde à sa borne haute (« 0-1 point »).
     */
    B.pointsAvecUnite = function (t) {
        if (B.aCompleter(t)) return '';
        var n = t.pointsMin === t.pointsMax ? B.nombreEnTexte(t.pointsMin) : B.nombreEnTexte(t.pointsMin) + '-' + B.nombreEnTexte(t.pointsMax);
        return n + (t.pointsMax < 2 ? ' point' : ' points');
    };

    /**
     * Ce que l'élève lit d'une tranche (#1120, la grille du PDF) : ses points, puis son texte, SANS
     * SON NOM — « 3-4 points : Résume l'essentiel » (décision de Grégoire, 20 oct., 16 h 58). Une
     * tranche à compléter montre son texte seul : aucun chiffre n'est inventé (supposition de Cowork,
     * réversible). Rien à lire → « ». Le deux-points tient à ses points (espace insécable).
     */
    B.ligneEleve = function (t) {
        var points = B.pointsAvecUnite(t);
        var texte = String(t && t.texte != null ? t.texte : '').trim();
        if (points && texte) return points + '\u00a0: ' + texte;
        return points || texte;
    };

    // ------------------------------------------------------------------
    // Les refus de structure : à l'import comme à l'écriture
    // ------------------------------------------------------------------

    /**
     * Ce qu'un barème doit être pour entrer : `null` s'il est recevable, sinon la raison (technique,
     * pour le rapport d'un import). Une tranche sans points, deux qui se chevauchent, des points
     * au-delà de la pondération : recevables (voir l'en-tête).
     */
    B.refusStructure = function (bareme) {
        if (!Array.isArray(bareme)) return 'le barème doit être une liste';
        if (bareme.length > B.MAX_TRANCHES) return bareme.length + ' tranches > max ' + B.MAX_TRANCHES;
        var ids = {};
        for (var i = 0; i < bareme.length; i++) {
            var raison = refusTranche(bareme[i], ids);
            if (raison) return 'tranche ' + (i + 1) + ' : ' + raison;
        }
        return null;
    };

    /** Une tranche : ses champs, ses points (deux nombres, ou deux `null`) ; `ids` retient les identifiants vus. */
    function refusTranche(t, ids) {
        if (!t || typeof t !== 'object' || Array.isArray(t)) return 'objet attendu';
        if (typeof t.id !== 'string' || !t.id || t.id.length > B.MAX_ID) return 'identifiant manquant ou trop long';
        if (ids[t.id]) return 'identifiant en double (' + t.id + ')';
        ids[t.id] = true;
        if (typeof t.nom !== 'string' || t.nom.length > B.MAX_NOM) return 'nom absent ou > ' + B.MAX_NOM + ' caractères';
        if (typeof t.texte !== 'string' || t.texte.length > B.MAX_TEXTE) return 'texte absent ou > ' + B.MAX_TEXTE + ' caractères';
        return refusPoints(t);
    }

    /** Deux `null` (à compléter), ou deux nombres finis, positifs, dans l'ordre. */
    function refusPoints(t) {
        if (t.pointsMin === null && t.pointsMax === null) return null;
        if (fini(t.pointsMin) === null || fini(t.pointsMax) === null) return 'des points : deux nombres, ou deux null';
        if (t.pointsMin < 0) return 'des points négatifs';
        if (t.pointsMin > t.pointsMax) return 'des bornes à l’envers';
        return null;
    }

    // ------------------------------------------------------------------
    // Les gestes de l'éditeur : `{ tranches }` (une liste NEUVE), `{ refuse: raison }`, ou
    // `{ refuse: null }` quand la tranche visée n'est plus là (rien n'est écrit, rien n'est dit).
    // ------------------------------------------------------------------

    function copie(tranches) { return (tranches || []).map(normaliser); }

    function indexDe(tranches, id) {
        for (var i = 0; i < tranches.length; i++) if (tranches[i].id === id) return i;
        return -1;
    }

    /** Des points saisis, contrôlés contre le maximum et les autres tranches (sauf `id`). */
    function pointsSaisis(tranches, id, saisie, max) {
        var p = B.lirePoints(saisie);
        if (p.vide) return { pointsMin: null, pointsMax: null };   // à compléter
        if (p.negatif) return { refuse: B.REFUS.pointsNegatifs };
        if (p.illisible) return { refuse: B.REFUS.pointsIllisibles };
        var m = Number(max);
        if (max !== null && max !== undefined && max !== '' && isFinite(m) && p.pointsMax > m) return { refuse: B.REFUS.pointsHorsBornes(m) };
        for (var i = 0; i < tranches.length; i++) {
            var t = tranches[i];
            if (t.id === id || B.aCompleter(t)) continue;
            if (p.pointsMin <= t.pointsMax && t.pointsMin <= p.pointsMax) return { refuse: B.REFUS.chevauchement(t) };
        }
        return { pointsMin: p.pointsMin, pointsMax: p.pointsMax };
    }

    B.modifierNom = function (tranches, id, valeur) {
        var liste = copie(tranches), i = indexDe(liste, id);
        if (i < 0) return { refuse: null };
        var nom = String(valeur == null ? '' : valeur).trim();
        if (nom.length > B.MAX_NOM) return { refuse: B.REFUS.nomLong };
        liste[i].nom = nom;
        return { tranches: liste };
    };

    B.modifierTexte = function (tranches, id, valeur) {
        var liste = copie(tranches), i = indexDe(liste, id);
        if (i < 0) return { refuse: null };
        var texte = String(valeur == null ? '' : valeur).trim();
        if (texte.length > B.MAX_TEXTE) return { refuse: B.REFUS.texteLong };
        liste[i].texte = texte;
        return { tranches: liste };
    };

    B.modifierPoints = function (tranches, id, saisie, max) {
        var liste = copie(tranches), i = indexDe(liste, id);
        if (i < 0) return { refuse: null };
        var p = pointsSaisis(liste, id, saisie, max);
        if (p.refuse !== undefined) return p;
        liste[i].pointsMin = p.pointsMin;
        liste[i].pointsMax = p.pointsMax;
        return { tranches: liste };
    };

    /**
     * Une tranche neuve, en dernier, vide et sans points (« à compléter ») : elle s'écrit aussitôt,
     * son nom, ses points et son texte au fil de la saisie (C1 du verdict du 20 oct.).
     */
    B.ajouter = function (tranches, id) {
        var liste = copie(tranches);
        if (liste.length >= B.MAX_TRANCHES) return { refuse: B.REFUS.trop };
        liste.push({ id: String(id), nom: '', pointsMin: null, pointsMax: null, texte: '' });
        return { tranches: liste };
    };

    B.retirer = function (tranches, id) {
        var liste = copie(tranches), i = indexDe(liste, id);
        if (i < 0) return { refuse: null };
        liste.splice(i, 1);
        return { tranches: liste };
    };

    // ------------------------------------------------------------------
    // L'écriture d'un critère : la conversion, à sa première modification
    // ------------------------------------------------------------------

    /**
     * Pose `tranches` sur le critère (en place), dans la même écriture que le geste : `bareme`
     * écrit, et l'ancien `parNiveau` retiré de CE critère s'il était lu (sans `echelleId`). Un
     * barème vide retire `bareme`. Rend le critère.
     */
    B.ecrireSurCritere = function (critere, tranches) {
        if (tranches.length) critere.bareme = tranches.map(normaliser);
        else delete critere.bareme;
        if (ancien(critere)) {
            delete critere.descripteurs.parNiveau;
            if (!Object.keys(critere.descripteurs).length) delete critere.descripteurs;
        }
        return critere;
    };

    window.bareme = B;
})();
