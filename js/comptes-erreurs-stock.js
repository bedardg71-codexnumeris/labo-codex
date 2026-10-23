/* ===============================
   MODULE COMPTES-ERREURS-STOCK — #1142 : mesurer, et réparer sur accord, les comptes d'erreurs
   qu'une autre copie a écrits (23 oct. 2026)

   LE STOCK. Le correctif de #1142 (travaux-outils.js, `copieEstCelleDeLEvaluationEnCours` ;
   evaluation.js, des copies au lieu des objets de la base) TARIT LA SOURCE. Il ne touche pas ce
   qui est déjà écrit chez Grégoire : mesuré par Cowork le 23 oct., 21 copies sur 24 de l'Artefact 4
   portent dans `donneesAlgorithmiques[<critère>]` le compte de la copie suivante, alors que la phrase
   du critère, son niveau et `noteFinale` portent le vrai (CLAUDE.md, « tarir n'est pas réparer »).

   À LA CONSOLE de l'onglet, sur le modèle de `Codex.purgerEspacePrecedent()` :
     await ComptesErreurs.verifier()                    → la liste ; n'écrit RIEN
     await ComptesErreurs.verifier({ reparer: true })   → réécrit les seules copies proposées
   ⛔ La réparation écrit dans ses données : elle ne tourne que sur l'accord de Grégoire, après
   qu'il a vu la liste, et exige un codex à jour (`Codex.estAJour`).

   CE QUI EST COMPARÉ, pour chaque critère algorithmique en mode simple (le mode des codes par
   catégorie n'est pas touché par le défaut : son champ n'est pas celui que les annotations
   remplissent) :
     enregistre  `donneesAlgorithmiques[c].erreurs` — la donnée suspecte
     phrase      le compte que dit la phrase enregistrée du critère (`criteres[].retroaction`),
                 relu par l'énoncé « décompte » du critère ; null si elle ne se relit pas
     codes       le total des codes posés sur la copie (même règle que l'écran,
                 `travauxOutils.compterCodesAnnotation`) ; null sans code posé — un compte tapé à
                 la main reste possible — et pour un 2e critère algorithmique de la grille (les
                 annotations ne remplissent que le premier champ)
     niveau      `criteres[].niveauSelectionne` du critère
     noteFinale  et la note que la grille redonne pour une valeur (`porteeDepuisEvaluation`,
                 la règle de `calculerNote`, plafond d'une reprise ciblée compris)
   PROPOSITION (règle posée le 23 oct. par Claude Code, à relire) : une valeur v ≠ enregistré est
   proposée si TOUTES les sources lisibles parmi {phrase, codes} donnent v (au moins une), et si le
   niveau ET `noteFinale` redonnent v. Sinon la copie est listée SANS proposition : elle revient à
   Grégoire. Une copie où tout s'accorde avec l'enregistré n'est pas listée.

   ⛔ TRIMESTRE ACTIF SEULEMENT, et jamais A2025 ni H2026 (décision du 1er sept. 2026 : ces notes ne
   sont pas rouvertes). Aucun nom d'élève dans ce qui est rendu : l'identifiant de l'évaluation.
   Spec : tests/integration/comptes-erreurs-stock-1142.spec.js.
   =============================== */

(function() {
'use strict';

var TRIMESTRES_FERMES = ['a2025', 'h2026'];   // 1er sept. 2026 : ces notes ne sont pas rouvertes
var TOLERANCE_NOTE = 0.01;

function _copie(v) { return JSON.parse(JSON.stringify(v)); }

/** Le compte que dit la phrase du critère, relu par son énoncé « décompte » ; null s'il ne se relit pas. */
function compteDeLaPhrase(phrase, critere, mots, candidats) {
    if (typeof phrase !== 'string' || !phrase || !window.enoncesAlgo) return null;
    // La mention « (x après pondération) » dépend des poids : la relecture la retire des deux côtés.
    var sansMention = phrase.replace(/\s\([^()]*après pondération\)/g, '');
    var nombres = (sansMention.match(/\d+/g) || []).map(Number).concat(candidats.filter(function(n) { return typeof n === 'number'; }));
    var vus = {};
    for (var i = 0; i < nombres.length; i++) {
        var n = nombres[i];
        if (vus[n]) continue;
        vus[n] = true;
        var decompte = window.enoncesAlgo.enonce(critere, 'decompte', { erreurs: n, mots: mots, points: '' });
        if (decompte && sansMention.indexOf(decompte) !== -1) return n;
    }
    return null;
}

/** Les codes posés sur la copie de l'évaluation : `{ total, compteurs }`, ou null sans copie ni annotation. */
function codesDeLaCopie(evaluation) {
    var res = window.travauxResolution, ts = window.travauxStockage, outils = window.travauxOutils;
    if (!res || !ts || !outils || typeof outils.compterCodesAnnotation !== 'function') return null;
    var fichier = res.trouverFichierPourEvaluation(evaluation);
    if (!fichier) return null;
    var annotation = ts.obtenirAnnotationFichier(fichier.id);
    if (!annotation) return null;
    var compteurs = outils.compterCodesAnnotation(annotation);
    var total = Object.keys(compteurs).reduce(function(s, id) { return s + compteurs[id]; }, 0);
    return { total: total, compteurs: compteurs };
}

/** Ce que la formule du critère rend pour `entree` erreurs (la somme pondérée, ou le nombre brut). */
function calculer(critere, entree, mots) {
    var r = window.formulesAlgo.calculer(critere, { ponderation: critere.ponderation, erreurs: entree, mots: mots });
    return r && r.applicable ? r : null;
}

/** La note que l'évaluation redonne si le critère algorithmique valait `pourcentage` (la règle de `calculerNote`). */
function noteRedonnee(evaluation, grille, niveaux, critereId, pourcentage) {
    var ev = _copie(evaluation);
    ev.donneesAlgorithmiques[critereId].pourcentage = pourcentage;
    var portee = window.porteeDepuisEvaluation(ev, grille, niveaux);
    var total = 0, poids = 0;
    portee.criteresComptes.forEach(function(c) {
        var p = (c.critere.ponderation || 0) / 100;
        total += c.valeur * p;
        poids += p;
    });
    if (poids <= 0) return null;
    var note = total / poids;
    if (evaluation.plafondNoteCiblee) {
        var plafond = niveaux.find(function(n) { return n.code === evaluation.plafondNoteCiblee; });
        if (plafond && note > plafond.max) note = plafond.max;
    }
    return note;
}

/**
 * Ce qu'une valeur v redonne : par la somme pondérée des codes (si v est leur total et qu'elle
 * diffère), sinon par le nombre brut — une évaluation enregistrée avant les poids (21 oct.) a été
 * calculée sur le brut. Rend la première lecture où le niveau ET la note s'accordent, sinon la brute.
 */
function lecture(v, ctx) {
    var entrees = [];
    if (ctx.codes && v === ctx.codes.total && window.codesAnnotation) {
        var pondere = window.codesAnnotation.sommePonderee(ctx.grille, ctx.codes.compteurs);
        if (Math.abs(pondere - v) >= 0.005) entrees.push(pondere);
    }
    if (v === ctx.enregistre && typeof ctx.donnees.sommePonderee === 'number') entrees.push(ctx.donnees.sommePonderee);
    entrees.push(v);
    var premiere = null;
    for (var i = 0; i < entrees.length; i++) {
        var r = calculer(ctx.critere, entrees[i], ctx.mots);
        if (!r) continue;
        var niveau = window.niveauDuPourcentage(r.pctBorne, ctx.niveaux, { sansNiveauZero: true });
        var note = noteRedonnee(ctx.evaluation, ctx.grille, ctx.niveaux, ctx.critere.id, r.pctBorne);
        var l = { entree: entrees[i], resultat: r, niveau: niveau,
            niveauAccorde: niveau === ctx.niveauEnregistre,
            noteAccordee: note !== null && typeof ctx.evaluation.noteFinale === 'number' && Math.abs(note - ctx.evaluation.noteFinale) < TOLERANCE_NOTE,
            note: note };
        if (l.niveauAccorde && l.noteAccordee) return l;
        if (!premiere) premiere = l;
    }
    return premiere;
}

function _arrondi(n) { return (typeof n === 'number') ? Math.round(n * 100) / 100 : n; }

/** Le total des codes posés, ou null sans code : un compte tapé à la main reste possible. */
function _totalOuNull(codes) { return (codes && codes.total > 0) ? codes.total : null; }

/** Les sources d'UN critère algorithmique : null s'il est absent, en mode des codes, ou sain. */
function lireSources(evaluation, critere, premierAlgo) {
    var donnees = evaluation.donneesAlgorithmiques && evaluation.donneesAlgorithmiques[critere.id];
    if (!donnees || Array.isArray(donnees.codes)) return null;   // absent, ou mode des codes par catégorie
    var enregistre = Number(donnees.erreurs !== undefined ? donnees.erreurs : donnees.totalErreurs);
    if (!isFinite(enregistre)) return null;
    var mots = Number(donnees.mots) || 0;
    var entree = (evaluation.criteres || []).find(function(c) { return c && c.critereId === critere.id; }) || {};
    var codes = premierAlgo ? codesDeLaCopie(evaluation) : null;
    var codesTotal = _totalOuNull(codes);
    var phrase = compteDeLaPhrase(entree.retroaction, critere, mots, [enregistre, codesTotal]);
    var accordePhrase = phrase === null || phrase === enregistre;
    var accordeCodes = codesTotal === null || codesTotal === enregistre;
    if (accordePhrase && accordeCodes) return null;   // sain
    return { donnees: donnees, enregistre: enregistre, mots: mots, codes: codes, codesTotal: codesTotal, phrase: phrase,
        niveauEnregistre: entree.niveauSelectionne || '' };
}

/** Pourquoi le candidat n'est pas proposé : ce que le niveau et la note redonnent à sa place. */
function motifSansProposition(candidat, src, l, noteFinale) {
    var sources = [src.phrase !== null ? 'phrase' : '', src.codesTotal !== null ? 'codes posés' : ''].filter(Boolean).join(' et ');
    if (!l) return candidat + ' (' + sources + ') : la formule ne s\'applique pas';
    var refus = [];
    if (!l.niveauAccorde) refus.push('le niveau ' + (src.niveauEnregistre || '(aucun)') + ' ne le redonne pas (' + l.niveau + ')');
    if (!l.noteAccordee) refus.push('la note ' + noteFinale + ' ne le redonne pas (' + _arrondi(l.note) + ')');
    return candidat + ' (' + sources + ') : ' + refus.join(', et ');
}

/** Examine UN critère algorithmique d'une évaluation ; null s'il est sain ou hors de la mesure. */
function examiner(evaluation, grille, niveaux, critere, premierAlgo) {
    var src = lireSources(evaluation, critere, premierAlgo);
    if (!src) return null;
    var ctx = Object.assign({ evaluation: evaluation, grille: grille, niveaux: niveaux, critere: critere }, src);
    var ligne = {
        evaluation: evaluation.id, production: evaluation.productionId, critere: critere.id,
        verrouillee: evaluation.verrouillee === true,
        enregistre: src.enregistre, phrase: src.phrase, codes: src.codesTotal, mots: src.mots,
        niveau: src.niveauEnregistre, noteFinale: _arrondi(evaluation.noteFinale),
        proposition: null, pourquoi: ''
    };
    var lEnregistre = lecture(src.enregistre, ctx);
    ligne.niveauDeLEnregistre = lEnregistre ? lEnregistre.niveau : null;
    ligne.noteDeLEnregistre = lEnregistre ? _arrondi(lEnregistre.note) : null;
    var lisibles = [src.phrase, src.codesTotal].filter(function(n) { return n !== null; });
    if (!lisibles.every(function(n) { return n === lisibles[0]; })) {
        ligne.pourquoi = 'la phrase (' + src.phrase + ') et les codes posés (' + src.codesTotal + ') ne disent pas le même compte';
        return ligne;
    }
    var candidat = lisibles[0];
    var l = lecture(candidat, ctx);
    ligne.niveauDuCandidat = l ? l.niveau : null;
    ligne.noteDuCandidat = l ? _arrondi(l.note) : null;
    if (!l || !l.niveauAccorde || !l.noteAccordee) {
        ligne.pourquoi = motifSansProposition(candidat, src, l, ligne.noteFinale);
        return ligne;
    }
    ligne.proposition = candidat;
    ligne._entree = l.entree;
    ligne._resultat = l.resultat;
    ligne._niveau = l.niveau;
    ligne.pourquoi = 'phrase ' + (src.phrase !== null ? src.phrase : '(illisible)') + ', codes posés ' + (src.codesTotal !== null ? src.codesTotal : '(aucun)')
        + ', niveau ' + ligne.niveau + ' et note ' + ligne.noteFinale + ' redonnent ' + candidat + ' ; l\'enregistré ' + src.enregistre
        + ' redonnerait ' + (lEnregistre ? lEnregistre.niveau + ' et ' + _arrondi(lEnregistre.note) : '(rien)');
    return ligne;
}

/** La mesure, sans rien écrire. */
function mesurer(evaluations) {
    var grilles = db.getSync(cle('grillesTemplates'), []) || [];
    var rapport = { trimestre: window.obtenirTrimestreId(), examinees: 0, proposees: [], sansProposition: [], horsMesure: 0 };
    (evaluations || []).forEach(function(evaluation) {
        if (!evaluation || evaluation.remplaceeParId || !evaluation.donneesAlgorithmiques) return;
        var grille = grilles.find(function(g) { return g.id === evaluation.grilleId; });
        var algos = (grille && Array.isArray(grille.criteres)) ? grille.criteres.filter(function(c) { return c && c.type === 'algorithmique'; }) : [];
        var aExaminer = algos.filter(function(c) { return evaluation.donneesAlgorithmiques[c.id]; });
        if (aExaminer.length === 0) {
            if (Object.keys(evaluation.donneesAlgorithmiques).length) rapport.horsMesure++;   // grille ou critère introuvable
            return;
        }
        var echelle = window.resoudreEchelleEvaluation(evaluation.echelleId);
        var niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        rapport.examinees++;
        aExaminer.forEach(function(critere) {
            var ligne = examiner(evaluation, grille, niveaux, critere, critere === algos[0]);
            if (ligne) (ligne.proposition !== null ? rapport.proposees : rapport.sansProposition).push(ligne);
        });
    });
    return rapport;
}

/** La réparation : `donneesAlgorithmiques[c]` des seules copies proposées, par le calcul de l'application. */
function reparer(evaluations, proposees) {
    var grilles = db.getSync(cle('grillesTemplates'), []) || [];
    var ecrites = [];
    proposees.forEach(function(ligne) {
        var evaluation = evaluations.find(function(e) { return e && e.id === ligne.evaluation; });
        var grille = grilles.find(function(g) { return evaluation && g.id === evaluation.grilleId; });
        var critere = grille && grille.criteres.find(function(c) { return c.id === ligne.critere; });
        if (!evaluation || !critere) return;
        var v = ligne.proposition;
        var neuves = Object.assign(_copie(evaluation.donneesAlgorithmiques[critere.id]), {
            erreurs: v,
            mots: ligne.mots,
            noteCalculee: ligne._resultat.note,
            pourcentage: ligne._resultat.pctBorne,
            niveau: ligne._niveau,
            retroaction: window.phraseDecompteAlgo(critere, critere, v, ligne._entree, ligne.mots)
        });
        if (Math.abs(ligne._entree - v) >= 0.005) neuves.sommePonderee = ligne._entree;
        else delete neuves.sommePonderee;
        var algo = _copie(evaluation.donneesAlgorithmiques);
        algo[critere.id] = neuves;
        evaluation.donneesAlgorithmiques = algo;   // rien d'autre : ni `criteres`, ni `noteFinale`, ni le verrou
        ecrites.push({ evaluation: ligne.evaluation, critere: ligne.critere, avant: ligne.enregistre, apres: v });
    });
    return ecrites;
}

function _sansInterne(ligne) {
    var l = {};
    Object.keys(ligne).forEach(function(k) { if (k.charAt(0) !== '_') l[k] = ligne[k]; });
    return l;
}

/**
 * La fonction de console. Sans paramètre : la mesure, rien d'écrit. `{ reparer: true }` : la
 * réparation des copies proposées par la MÊME mesure, refaite au moment d'écrire.
 * @param {{reparer?: boolean}} [options]
 * @returns {Promise<Object|null>} le rapport (et `ecrites` après une réparation) ; null sur refus
 */
async function verifier(options) {
    var trimestre = (typeof window.obtenirTrimestreId === 'function') ? window.obtenirTrimestreId() : null;
    if (!trimestre || TRIMESTRES_FERMES.indexOf(String(trimestre).toLowerCase()) !== -1) {
        console.warn('[#1142] Refusé : le trimestre actif (' + trimestre + ') n\'est pas mesuré. Les notes d\'A2025 et d\'H2026 ne sont pas rouvertes.');
        return null;
    }
    var evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
    var rapport = mesurer(evaluations);
    var sortie = {
        trimestre: rapport.trimestre, examinees: rapport.examinees, horsMesure: rapport.horsMesure,
        proposees: rapport.proposees.map(_sansInterne), sansProposition: rapport.sansProposition.map(_sansInterne)
    };
    console.warn('[#1142] ' + rapport.examinees + ' évaluation(s) examinée(s) dans ' + rapport.trimestre + ' : '
        + rapport.proposees.length + ' compte(s) à réparer proposé(s), ' + rapport.sansProposition.length + ' sans proposition (à toi de trancher).');
    sortie.proposees.forEach(function(l) { console.warn('[#1142] ' + l.evaluation + ' · ' + l.critere + ' : ' + l.enregistre + ' → ' + l.proposition + ' — ' + l.pourquoi); });
    sortie.sansProposition.forEach(function(l) { console.warn('[#1142] SANS PROPOSITION ' + l.evaluation + ' · ' + l.critere + ' : enregistré ' + l.enregistre + ' — ' + l.pourquoi); });
    if (!options || options.reparer !== true) return sortie;

    // ⛔ L'ÉCRITURE : un codex à jour d'abord, et rien d'autre que les copies proposées.
    if (typeof window.Codex === 'undefined' || typeof window.Codex.estAJour !== 'function' || !window.Codex.estAJour()) {
        console.warn('[#1142] Réparation refusée : mets d\'abord ton codex à jour (menu Codex), puis relance. Rien n\'est écrit.');
        return null;
    }
    if (rapport.proposees.length === 0) {
        sortie.ecrites = [];
        return sortie;
    }
    // Sur une copie du tableau : au-delà de 25 Ki, celui que `getSync` rend EST le cache mémoire, et un
    // échec d'écriture y laisserait la réparation sans qu'elle soit écrite.
    var aEcrire = _copie(evaluations);
    var ecrites = reparer(aEcrire, rapport.proposees);
    if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', aEcrire, { geste: 'Réparation des comptes d\'erreurs (#1142)' }) !== true) {
        console.warn('[#1142] L\'écriture a échoué : rien n\'est réparé.');
        return null;
    }
    console.warn('[#1142] ' + ecrites.length + ' compte(s) réparé(s). Les PDF de ces copies sont à refaire.');
    sortie.ecrites = ecrites;
    return sortie;
}

window.ComptesErreurs = { verifier: verifier, compteDeLaPhrase: compteDeLaPhrase };

})();
