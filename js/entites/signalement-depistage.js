/* ===============================
   ENTITÉ : LE SIGNALEMENT DE DÉPISTAGE (#790)

   Un élève franchit un palier que l'enseignant a coché « lève un signalement » ?
   Alors son nom remonte, à côté de son palier RàI. Le palier peut aussi porter un niveau
   (lot 3 des seuils, 30 oct. 2026) : il le fixe jusqu'à la première note provisoire.

   ⚠ RIEN ICI N'EST DISCIPLINAIRE. Le déclencheur est une CASE SUR UN PALIER du
   gabarit de la grille ; le texte affiché est un PARAMÈTRE de ce même gabarit.
   Aucun seuil, aucune phrase, aucun nom de service n'est écrit dans ce fichier.
   Le cas fondateur est un texte corrigé sur le critère du français ; un enseignant
   de chimie coche ses propres paliers et écrit sa propre phrase.

   ── POURQUOI IL NE SE STOCKE PAS ────────────────────────────────────────────
   « Tarir n'est pas réparer » : une donnée DÉRIVÉE qu'on écrit devient du stock
   chez les utilisateurs — à migrer, à réparer, et à désynchroniser le jour où
   l'enseignant décoche un palier. Le signalement se RECALCULE à chaque lecture,
   depuis la copie et depuis le gabarit. Décocher un palier le fait disparaître
   partout, immédiatement, sans qu'une seule ligne n'ait été écrite nulle part.

   ── CE QU'IL N'EST PAS ──────────────────────────────────────────────────────
   · Ce n'est PAS un palier RàI. Sans niveau choisi sur le palier, il ne le modifie
     pas : une case cochée en septembre ne dit pas ce qu'elle ne disait pas. Avec un
     niveau, `determinerNiveauRaiPedagogique` le lit, puis la note prend le relais ; le
     signalement reste affiché à côté, trace de l'orientation.
   · Ce n'est PAS le champ « Mesure d'aide » de la fiche. Celui-là dit que l'élève
     EST inscrit ; celui-ci dit qu'il DEVRAIT être référé. Les fondre ferait perdre
     la trace de qui n'a jamais donné suite.

   ⛔ CE MODULE N'ÉCRIT RIEN. Fonctions pures sur ce qu'on lui passe.

   ⮕ ET IL LIT LES PRODUCTIONS DIAGNOSTIQUES — c'est même tout l'objet. Elles sont
   exclues des quatre calculs (`production-diagnostique.js`) ; le signalement est
   leur SEULE sortie. Y appliquer le filtre des quatre portes viderait le lot de
   son sens.

   Cadrage : `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`.
   =============================== */

(function() {
'use strict';

/**
 * Une évaluation compte-t-elle ? La règle unique du lot A (#706, `evaluationEntreDansLaNote`,
 * pratique-registre.js) : active, notée, ENREGISTRÉE.
 *
 * #905 (lot C, 17 sept. 2026) — UN BROUILLON NE LÈVE PAS DE SIGNALEMENT. Tranché par
 * Grégoire : il corrige souvent en plusieurs passes, et un signalement levé sur une copie
 * inachevée se lit comme un jugement. Ce site recopiait l'ancienne règle (active, notée)
 * et ne voyait pas le verrou ; il lit maintenant le prédicat, à l'appel.
 * ⚠ CE N'EST PAS LE FILTRE DES QUATRE PORTES : le prédicat ne connaît pas les productions
 * et ne peut donc pas écarter une production diagnostique (voir l'en-tête).
 * ⚠ `remplaceeParId` couvre les reprises ET les doublons réconciliés (#360).
 */
function _evaluationActive(e) {
    return window.evaluationEntreDansLaNote(e);
}

/**
 * La saisie du nombre écrit `erreurs` ; seul le mode des codes écrit `totalErreurs`. Même lecture que
 * `js/comptes-erreurs-stock.js`. Sans `erreurs`, une copie saisie comptait 0 : « sans erreur », jamais de signalement.
 */
function _compteDErreurs(saisie) {
    return saisie.erreurs !== undefined ? saisie.erreurs : saisie.totalErreurs;
}

/**
 * Les signalements que porte UNE évaluation, tous critères confondus.
 *
 * @param {Object} evaluation - une évaluation enregistrée
 * @param {Array} grilles - les grilles du trimestre
 * @param {Object} registre - `window.projectionAlgo` (injecté pour la testabilité)
 * @returns {Array<Object>}
 */
function _signalementsDUneEvaluation(evaluation, grilles, registre) {
    var trouves = [];
    if (!evaluation || !registre || typeof registre.calculer !== 'function') return trouves;

    var donnees = evaluation.donneesAlgorithmiques;
    if (!donnees || typeof donnees !== 'object') return trouves;

    var grille = (grilles || []).find(function(g) { return g && g.id === evaluation.grilleId; });
    var criteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
    if (criteres.length === 0) return trouves;

    Object.keys(donnees).forEach(function(critereId) {
        var critere = criteres.find(function(c) { return c && c.id === critereId; });
        if (!critere) return;

        var saisie = donnees[critereId] || {};
        var resultat = registre.calculer(critere, {
            erreurs: _compteDErreurs(saisie),
            mots: saisie.mots
        });
        // `applicable: false` couvre les cas nommés du registre — pas de mots
        // saisis, projection désactivée, seuil indéterminable. Le code ne devine
        // jamais un verdict, et donc jamais un signalement.
        if (!resultat || !resultat.applicable || !resultat.palier) return;
        if (resultat.palier.leveSignalement !== true) return;

        // ⚠ LE LIBELLÉ VIDE NE LÈVE RIEN, et c'est délibéré. Un palier coché sans
        // phrase à afficher produirait une pastille muette, que personne ne sait
        // lire. Les deux vont ensemble : la case dit QUAND, le libellé dit QUOI.
        var libelle = (resultat.params && typeof resultat.params.libelleSignalement === 'string')
            ? resultat.params.libelleSignalement.trim() : '';
        if (!libelle) return;

        trouves.push({
            libelle: libelle,
            palier: resultat.palier.libelle || resultat.palier.cle,
            palierCle: resultat.palier.cle,
            niveauFixe: resultat.palier.niveauSignalement,
            critereId: critereId,
            critereNom: critere.nom || critere.titre || '',
            productionId: evaluation.productionId || null,
            evaluationId: evaluation.id || null,
            ratio: resultat.ratio
        });
    });

    return trouves;
}

/**
 * Les signalements d'un élève, recalculés depuis ses copies et les gabarits.
 *
 * ⚠ DÉDOUBLONNÉ PAR LIBELLÉ. Un même élève peut franchir le palier sur plusieurs
 * copies, ou sur deux critères qui portent la même phrase : l'enseignant n'a pas
 * besoin de la lire trois fois pour contacter l'élève une seule. Le signalement le
 * plus récent gagne — c'est la copie qui dit l'état actuel.
 *
 * @param {string} da
 * @param {Object} ctx - {evaluations, grilles, registre}
 * @returns {Array<Object>} vide quand rien n'est levé — jamais `null`
 */
function pourEleve(da, ctx) {
    ctx = ctx || {};
    if (!da) return [];
    var registre = ctx.registre || (typeof window !== 'undefined' ? window.projectionAlgo : null);
    var evaluations = Array.isArray(ctx.evaluations) ? ctx.evaluations : [];
    var grilles = Array.isArray(ctx.grilles) ? ctx.grilles : [];

    var parLibelle = new Map();
    evaluations.forEach(function(e) {
        if (!_evaluationActive(e) || e.etudiantDA !== da) return;
        _signalementsDUneEvaluation(e, grilles, registre).forEach(function(s) {
            parLibelle.set(s.libelle, s);
        });
    });
    return Array.from(parLibelle.values());
}

/**
 * Combien d'élèves sont signalés, et lesquels — pour voir l'ampleur avant d'écrire
 * à qui que ce soit.
 *
 * Ses mots (7 sept.) : « À ce moment du trimestre je les connais très peu, mais je
 * veux avoir une incidence sur leur parcours. » Le compte sert à décider s'il écrit
 * à trois élèves ou à dix-sept, sur une capacité d'accueil limitée.
 *
 * @param {Array} etudiants
 * @param {Object} ctx - {evaluations, grilles, registre}
 * @returns {{total: number, parEleve: Object}} `parEleve` : DA → liste de signalements
 */
function pourGroupe(etudiants, ctx) {
    var parEleve = {};
    var total = 0;
    (Array.isArray(etudiants) ? etudiants : []).forEach(function(etudiant) {
        if (!etudiant || !etudiant.da) return;
        var s = pourEleve(etudiant.da, ctx);
        if (s.length === 0) return;
        parEleve[etudiant.da] = s;
        total++;
    });
    return { total: total, parEleve: parEleve };
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.SignalementDepistage = {
    pourEleve: pourEleve,
    pourGroupe: pourGroupe,
    // Exposé pour les sentinelles
    _signalementsDUneEvaluation: _signalementsDUneEvaluation
};

})();
