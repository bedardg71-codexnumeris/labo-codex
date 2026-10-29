/* ===============================
   MODULE EVALUATION-ENONCES — Registre des modèles d'énoncé algorithmique

   RAISON D'ÊTRE (#581, 2026-09-02)
   Un critère algorithmique compte des erreurs et engendre des phrases. Ces
   phrases nommaient la discipline de leur auteur : « Ta rédaction contient 12
   erreurs de français pour 500 mots. » Un enseignant de chimie qui compte des
   erreurs de calcul voyait donc son critère rebaptisé « Français écrit » dans
   le PDF remis à son élève, et lisait « rédaction » là où il n'y a pas de texte.

   Ce module est le troisième d'une même famille, après #667 (les formules) et
   #668 (la projection) : ce qui appartient à la pratique d'une personne remonte
   dans le gabarit de la grille ; le code ne garde que la mécanique.

   ⚠ LE DISCRIMINANT EST LE NOM DU CRITÈRE, ET C'EST UNE DÉVIATION ASSUMÉE
   PAR RAPPORT AU PATRON DE #668.
   Le patron migre TOUT critère sans réglage vers le texte d'hier, reproduit au
   caractère près. Appliqué ici, il laisserait « français » sortir chez
   l'enseignant de chimie : le défaut que ce lot corrige survivrait à sa
   correction. Un critère sans réglage est donc lu selon SON NOM :
     · le nom dit « français »  ⮕ modèle `discipline_francais`, textes d'hier
       AU CARACTÈRE PRÈS. Les élèves de qui a nommé son critère ainsi ne voient
       aucun changement — c'est la fidélité du patron, appliquée là où elle a
       un sens ;
     · le nom dit autre chose   ⮕ modèle `generique`, qui ne nomme aucune
       discipline. Il porte le nom du critère là où la phrase le demande
       (le défi prioritaire, ce qui reste à travailler) et PAS dans le
       décompte — décision de Grégoire du 2 septembre 2026 : le nom titre
       déjà le panneau et la ligne du PDF où cette phrase s'affiche.
   ⮕ Ce n'est pas une devinette : le nom est une donnée écrite par
   l'utilisateur, et `modeleEnonces` écrit dans le gabarit le supplante
   toujours. Le code ne fait que choisir un défaut, jamais un verdict.

   MODÈLE DE DONNÉES SUR LE CRITÈRE (SSOT)
     critere.modeleEnonces : string — identifiant du modèle
     critere.enonces       : objet  — {cle: texte}, textes libres de l'auteur
     critere.noms          : objet  — LES DEUX NOMS DE L'ENSEIGNANT·E (étape 2a,
                             22 oct. 2026) : { erreurs: {singulier, pluriel},
                             mots: {singulier, pluriel} } — ce qu'il compte, et ce
                             à quoi il le rapporte. Les CLÉS sont les identifiants
                             des données (`erreurs`, `mots`), qui ne changent pas :
                             un identifiant n'est pas un libellé. Voir `noms`.

   LES JETONS
     {critere}  le nom du critère, tel qu'il est dans la grille
     {erreurs}  le nombre d'erreurs
     {s}        « s » quand {erreurs} est au pluriel, vide sinon — lu dans les
                textes d'hier, plus offert (étape 2a : les noms ont leurs deux formes)
     {mots}     le nombre de mots
     {points}   la mention pondérée, avec son espace de tête, ou vide
     {nomErreurs}  le nom de ce qu'on compte, accordé à {erreurs} (étape 2a)
     {nomMots}     le nom de ce à quoi on le rapporte, accordé à {mots} (étape 2a)
   ⚠ Un jeton que l'appel ne fournit pas est retiré du texte, jamais rendu
   littéralement : un élève ne doit pas lire « {critere} » sur son PDF.

   LES REPÈRES POSABLES (le texte troué, étape 1 — 3 septembre 2026)
     Le gabarit n'exige plus de TAPER un jeton : chaque zone offre des repères
     qu'un clic pose au curseur (`insererRepere`). La palette est `REPERES` ;
     {s} n'en fait pas partie — c'est un accord qui suit {erreurs}, pas un
     geste. Chaque zone n'offre que les repères qu'un site d'appel remplit
     réellement (`CLES[].reperes`, mesuré sur les appels de `enonce`) : un
     repère offert là où il vaudra toujours vide est un piège.
   ⚠ Le format du gabarit ne change pas : `critere.enonces` reste du texte
   libre, un jeton tapé à la main vaut un repère posé, et `rendre` ne sait
   rien des repères.

   ⚠ CE MODULE N'ENGENDRE QUE DES PHRASES. Le nom qui TITRE une section
   (l'en-tête du PDF, le titre du décompte) n'est pas un énoncé réglable : c'est
   le nom du critère, lu tel quel. `libelleCritere` le rend, et ne passe par
   aucun modèle — voir §2(1) de la consigne : « aucun registre à créer ».

   Aucune dépendance : ni DOM, ni db, ni evaluationEnCours. Testable en Node.
   =============================== */

(function() {
'use strict';

// #1137 (22 oct. 2026) : les nombres affichés passent par js/note-pourcentage.js, que index.html
// charge avant ce module ; un banc Node (`require`) le requiert.
var _formaterNombre = (typeof window !== 'undefined' && typeof window.formaterNombre === 'function')
    ? window.formaterNombre : require('./note-pourcentage.js').formaterNombre;

// ---------------------------------------------------------------------
// Le nom qui titre — volet (A), sans modèle
// ---------------------------------------------------------------------

// Ce que porte une section de décompte quand AUCUN critère algorithmique n'est
// lisible. Ce n'est pas un nom de discipline : c'est la description de ce que
// la section contient, vraie pour tout le monde.
var LIBELLE_SANS_CRITERE = 'Erreurs annotées';

// Ce que porte {critere} A L'INTERIEUR D'UNE PHRASE quand aucun nom n'est
// lisible. ⚠ CE N'EST PAS `LIBELLE_SANS_CRITERE`, ET LA DISTINCTION EST
// MESUREE : le repli de titre donnait « Concentre-toi sur Erreurs annotées »,
// une phrase qui ne veut rien dire, remise à un élève. Un titre nomme ce que
// la section contient ; une phrase s'adresse à quelqu'un. Les deux replis
// disent la même absence, pas dans la même grammaire.
var CRITERE_SANS_NOM = 'ce critère';

/**
 * Le nom à afficher au-dessus d'un décompte d'erreurs.
 *
 * @param {object|null} critere - le critère algorithmique, s'il est connu
 * @returns {string} son nom, ou un libellé neutre. Jamais une discipline.
 */
function libelleCritere(critere) {
    var nom = (critere && typeof critere.nom === 'string') ? critere.nom.trim() : '';
    return nom || LIBELLE_SANS_CRITERE;
}

/**
 * Le critère algorithmique d'une grille — celui qui compte des erreurs.
 *
 * ⚠ LE PREMIER, ET C'EST DIT PLUTÔT QUE SUPPOSÉ. Rien n'interdit deux critères
 * algorithmiques dans une grille. Les sites qui appellent ceci titrent UNE
 * section de décompte d'annotations, qui n'est rattachée à aucun critère par
 * les données : les erreurs sont des annotations sur la copie, pas des entrées
 * de grille. Prendre le premier reproduit ce que fait déjà
 * `_detecterAlgoA0Bilan` (evaluation-retroaction.js), qui écrase sa variable à
 * chaque tour de boucle et garde donc le DERNIER. Les deux se valent tant
 * qu'il n'y en a qu'un ; le jour où il y en a deux, aucun des deux n'a raison,
 * et c'est le modèle de données qu'il faudra corriger, pas ce choix-ci.
 *
 * @returns {object|null} le critère, ou `null` si la grille n'en porte aucun.
 */
function critereAlgorithmique(grille) {
    return criteresAlgorithmiques(grille)[0] || null;
}

/**
 * #1132 (22 oct. 2026) — TOUS les critères algorithmiques d'une grille, dans l'ordre. Les codes posés
 * ne vont qu'au premier (ci-dessus) ; l'éditeur de grille et la palette d'Annoter le DISENT quand il y
 * en a plusieurs. Router chaque code vers son critère demande de changer le modèle (un code posé ne
 * porte pas son critère) : décision de Grégoire, 22 oct., on dit la limite, la fiche reste ouverte.
 */
function criteresAlgorithmiques(grille) {
    var criteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
    return criteres.filter(function(c) { return !!c && c.type === 'algorithmique'; });
}

/**
 * #686 — LE CRITÈRE ALGORITHMIQUE DE LA GRILLE, SINON CELUI QUE L'ÉVALUATION NOMME.
 *
 * Quand la grille d'une évaluation est introuvable (les grilles désappariées d'un ancien
 * trimestre, une grille supprimée), les appelants passaient `null` au registre : sans
 * `nom`, `_nomDitFrancais` répond non, et un critère qui S'APPELLE « Français écrit »
 * recevait les mots du modèle générique — sur le PDF de l'élève aussi. Le nom existe
 * pourtant ailleurs : l'évaluation enregistrée le porte (`criteres[].critereNom`, écrit
 * à chaque sauvegarde). On le LIT ; aucune grille n'est réécrite, et le registre ne
 * change pas de règle — il reçoit un `{ nom }` au lieu de rien.
 *
 * ▣ Avec `critereId` : ce critère-là. Sans : le critère algorithmique de l'évaluation,
 * reconnu à ce que `donneesAlgorithmiques` porte une entrée à son identifiant (le
 * premier, comme `critereAlgorithmique`).
 *
 * @returns {object|null} le critère de la grille, ou `{ nom }`, ou `null`.
 */
function critereAlgorithmiqueOuNomme(grille, evaluation, critereId) {
    var criteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
    if (critereId) {
        for (var i = 0; i < criteres.length; i++) {
            if (criteres[i] && criteres[i].id === critereId) return criteres[i];
        }
    } else {
        var deGrille = critereAlgorithmique(grille);
        if (deGrille) return deGrille;
    }
    if (grille) return null;   // la grille est là et ne porte pas ce critère : rien à deviner

    var entrees = (evaluation && Array.isArray(evaluation.criteres)) ? evaluation.criteres : [];
    var algo = (evaluation && evaluation.donneesAlgorithmiques) || {};
    for (var j = 0; j < entrees.length; j++) {
        var e = entrees[j];
        if (!e || !e.critereNom) continue;
        if (critereId ? e.critereId === critereId : Object.prototype.hasOwnProperty.call(algo, e.critereId)) {
            return { nom: e.critereNom };
        }
    }
    return null;
}

// ---------------------------------------------------------------------
// Les jetons
// ---------------------------------------------------------------------

var JETON_CRITERE = '{critere}';
var JETON_ERREURS = '{erreurs}';
var JETON_PLURIEL = '{s}';
var JETON_MOTS    = '{mots}';
var JETON_POINTS  = '{points}';
// Étape 2a (22 oct. 2026) : les deux noms de l'enseignant·e. Remplis par CE module, comme
// {critere} — jamais par l'appelant : la source des noms est le critère.
var JETON_NOM_ERREURS = '{nomErreurs}';
var JETON_NOM_MOTS    = '{nomMots}';

var JETONS = [JETON_CRITERE, JETON_ERREURS, JETON_PLURIEL, JETON_MOTS, JETON_POINTS,
              JETON_NOM_ERREURS, JETON_NOM_MOTS];

// ---------------------------------------------------------------------
// Les deux noms de l'enseignant·e — étape 2a (22 oct. 2026)
// ---------------------------------------------------------------------
// Décision de Grégoire (16 h 59) : AUCUN NOM PAR DÉFAUT. Un critère neuf naît avec ses
// deux noms à remplir ; « Partir de la liste du français écrit » les remplit
// (`NOMS_FRANCAIS_ECRIT`). Un critère existant se LIT « erreur » et « mot » : rien n'est
// réécrit, ni au chargement, ni par migration (tarir n'est pas réparer).
//
// Trois lectures, par paire (ce qu'on compte ; ce à quoi on le rapporte) :
//   · les deux formes écrites            ⮕ celles de l'enseignant·e ;
//   · sinon, critère d'avant l'étape 2a  ⮕ « erreur / erreurs », « mot / mots » — le texte
//     d'hier, au caractère près (sentinelle de l'invariant du stock) ;
//   · sinon, critère né depuis ce lot (`nomsAttendus`) ⮕ le REPLI, qui ne nomme
//     aucune discipline : jamais un nom vide ni un jeton nu sous les yeux d'un élève.
// ⚠ PAS LA MARQUE DES CODES (`codesSousCriteresSeulement`) — relecture de Cowork, 22 oct.,
// 17 h 40 : celle-là est en ligne depuis la 1.213.0 et dit « né depuis le 21 oct. » ; la
// lire ici changeait sans geste ce que lisent les élèves des critères créés en 1.213 et 1.214.
// Les noms ont leur propre marque, posée à la naissance à partir de l'étape 2a.
// ⚠ UNE PAIRE À MOITIÉ ÉCRITE SE LIT COMME ABSENTE : « 2 calculs » et « 1 unité » ne
// viennent pas de deux sources.
var CHAMPS_NOMS = ['erreurs', 'mots'];
var NOMS_FRANCAIS_ECRIT = {
    erreurs: { singulier: 'erreur', pluriel: 'erreurs' },
    mots:    { singulier: 'mot',    pluriel: 'mots' }
};
// Ce que lit l'élève d'un critère neuf évalué sans ses noms : « Ta production contient 5 éléments
// relevés pour 12 éléments examinés. » Décision de Grégoire, 22 oct. 2026, 18 h 29 (l'étendue) ;
// textes validés (TEXTES-2026-10-22-noms-critere-algorithmique.md).
var NOMS_DE_REPLI = {
    erreurs: { singulier: 'élément relevé',  pluriel: 'éléments relevés' },
    mots:    { singulier: 'élément examiné', pluriel: 'éléments examinés' }
};
// La borne des deux schémas qui voyagent (import, partage), et celle de l'éditeur.
var MAX_NOM = 40;
// La marque d'un critère né depuis l'étape 2a (22 oct. 2026) : il attend ses deux noms. Posée
// par `marquerNomsAttendus`, au geste qui fait naître un critère algorithmique
// (`grilles.js`, `avecProjectionNeuve`), jamais à la lecture.
var MARQUE_NOMS = 'nomsAttendus';

function _forme(x) {
    return (typeof x === 'string') ? x.trim() : '';
}

function _copiePaire(p) {
    return { singulier: p.singulier, pluriel: p.pluriel };
}

/** Le critère est-il né depuis l'étape 2a (22 oct. 2026) ? Sa marque à lui, et elle seule. */
function _estNeuf(critere) {
    return !!critere && critere[MARQUE_NOMS] === true;
}

/**
 * Pose la marque des noms sur un critère qui DEVIENT algorithmique — appelé par le site qui
 * décide de la naissance (`grilles.js`), au même geste que `codesAnnotation.marquerNeuf`.
 * Rend le critère, muté.
 */
function marquerNomsAttendus(critere) {
    if (critere && critere.type === 'algorithmique') critere[MARQUE_NOMS] = true;
    return critere;
}

/** Ce que l'enseignant·e a ÉCRIT, formes vides comprises — pour l'éditeur. */
function nomsSaisis(critere) {
    var src = (critere && critere.noms && typeof critere.noms === 'object') ? critere.noms : {};
    var r = {};
    CHAMPS_NOMS.forEach(function(k) {
        var p = (src[k] && typeof src[k] === 'object') ? src[k] : {};
        r[k] = { singulier: _forme(p.singulier), pluriel: _forme(p.pluriel) };
    });
    return r;
}

function _paireComplete(p) {
    return !!(p && p.singulier && p.pluriel);
}

/**
 * Les noms que le critère LIT — jamais vides. Voir les trois lectures, plus haut.
 * @returns {{erreurs: {singulier, pluriel}, mots: {singulier, pluriel}}}
 */
function noms(critere) {
    var s = nomsSaisis(critere);
    var repli = _estNeuf(critere) ? NOMS_DE_REPLI : NOMS_FRANCAIS_ECRIT;
    var r = {};
    CHAMPS_NOMS.forEach(function(k) {
        r[k] = _copiePaire(_paireComplete(s[k]) ? s[k] : repli[k]);
    });
    return r;
}

/**
 * Les paires à nommer encore (`['erreurs', 'mots']`, ou moins) : pour un critère NEUF, toute
 * paire incomplète ; pour un critère d'avant l'étape 2a, seulement une paire À MOITIÉ écrite
 * — sans rien d'écrit, il se lit « erreur » et « mot », et ne manque de rien.
 */
function nomsManquants(critere) {
    var neuf = _estNeuf(critere);
    var s = nomsSaisis(critere);
    return CHAMPS_NOMS.filter(function(k) {
        if (_paireComplete(s[k])) return false;
        return neuf || !!(s[k].singulier || s[k].pluriel);
    });
}

/** Le critère attend-il ses noms (né depuis l'étape 2a) ? Pour l'éditeur : champs vides ou lus. */
function estNeuf(critere) {
    return _estNeuf(critere);
}

/**
 * LA RÈGLE DU PLURIEL, LA SEULE (étape 2a) : le singulier sous 2, le pluriel à partir de 2 —
 * « 0 erreur », « 1 erreur », « 1,5 erreur », « 2 erreurs ». Le PDF disait `> 1`, la mention
 * pondérée `>= 2` : tous les sites lisent celle-ci. Un nombre illisible prend le singulier.
 */
function estPluriel(n) {
    var x = Number(n);
    return (n !== null && n !== undefined && n !== '' && isFinite(x) && Math.abs(x) >= 2);
}

/** La forme d'une paire de noms qui s'accorde avec `n`. */
function accorder(n, paire) {
    return estPluriel(n) ? paire.pluriel : paire.singulier;
}

/**
 * « 3 erreurs », « 1 unité manquante » : le compte et le nom de ce qu'on compte, accordé. Une
 * source pour les deux sites jumeaux de « Tous les critères sont maîtrisés » (le bilan de l'app,
 * le PDF de synthèse), qui doivent rendre les mêmes mots (`copierToutRetroaction`). Du texte brut :
 * l'appelant l'échappe.
 */
function nombreEtNom(n, critere) {
    return n + ' ' + accorder(n, noms(critere).erreurs);
}

/** Les noms du français écrit — ce que pose « Partir de la liste du français écrit ». */
function nomsFrancaisEcrit() {
    return { erreurs: _copiePaire(NOMS_FRANCAIS_ECRIT.erreurs), mots: _copiePaire(NOMS_FRANCAIS_ECRIT.mots) };
}

/**
 * Écrit les noms sur le critère — appelé par l'éditeur, au geste de l'enseignant·e, jamais à
 * la lecture. `saisie` : {erreurs?: {singulier?, pluriel?}, mots?: …} ; une forme absente
 * garde celle du critère, une forme vide l'efface. Une paire vide part ; des noms vides
 * partent (le critère redevient sans noms). Une forme trop longue est REFUSÉE : rien n'est
 * écrit, et le refus est rendu.
 * @returns {{critere, refuse: string|null}}
 */
function appliquerNoms(critere, saisie) {
    critere = critere || {};
    var actuels = nomsSaisis(critere);
    var src = (saisie && typeof saisie === 'object') ? saisie : {};
    var refuse = null;
    CHAMPS_NOMS.forEach(function(k) {
        var p = (src[k] && typeof src[k] === 'object') ? src[k] : {};
        ['singulier', 'pluriel'].forEach(function(f) {
            if (typeof p[f] !== 'string') return;
            var v = p[f].trim();
            if (v.length > MAX_NOM) { refuse = refuse || ('Un nom fait ' + MAX_NOM + ' caractères au plus'); return; }
            actuels[k][f] = v;
        });
    });
    if (refuse) return { critere: critere, refuse: refuse };
    var ecrits = {};
    CHAMPS_NOMS.forEach(function(k) {
        var p = actuels[k];
        if (!p.singulier && !p.pluriel) return;
        ecrits[k] = {};
        if (p.singulier) ecrits[k].singulier = p.singulier;
        if (p.pluriel) ecrits[k].pluriel = p.pluriel;
    });
    if (Object.keys(ecrits).length) critere.noms = ecrits;
    else delete critere.noms;
    return { critere: critere, refuse: null };
}

/** Majuscule initiale — pour une étiquette (« Unités manquantes »), jamais dans une phrase. */
function enEtiquette(texte) {
    var t = String(texte || '');
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

// ---------------------------------------------------------------------
// Les repères posables — le texte troué, étape 1 (3 septembre 2026)
// ---------------------------------------------------------------------
// Ce que le gabarit OFFRE à la pose, d'un clic, dans une zone d'énoncé. Ce
// n'est PAS la liste des jetons : {s} n'y est pas. C'est un accord grammatical
// qui suit {erreurs} — « un texte qui ne porte pas {erreurs} ne porte pas {s}
// non plus » — jamais un geste de l'enseignant·e. S'il doit apparaître, c'est
// en conséquence de {erreurs}, tapé à la main : la zone reste du texte libre.
//
// Deux familles, arrêtées au cadrage du 2 septembre 2026 et tenues distinctes
// à l'écran :
//   posee    la valeur est ÉCRITE par l'enseignant·e, une fois, dans la
//            grille — le nom du critère ;
//   remplie  la valeur vient de la CORRECTION, copie par copie — elle
//            n'existe pas avant, et personne n'a à la saisir dans la grille.
//
// `espaceDeTete` : {points} arrive avec son espace de tête (« (3,5 après pondération) »
// précédé d'une espace, ou vide — voir `mentionPonderee`).
// Un repère posé après un mot reçoit une espace ; celui-là en aurait deux.
var REPERES = [
    { jeton: JETON_CRITERE, famille: 'posee',   libelle: 'nom du critère',
      aide: 'Le nom de ce critère, tel qu\'il est écrit dans la grille.' },
    { jeton: JETON_ERREURS, famille: 'remplie', libelle: 'nombre d\'erreurs',
      aide: 'Le nombre d\'erreurs comptées sur la copie, à la correction.' },
    { jeton: JETON_MOTS,    famille: 'remplie', libelle: 'nombre de mots',
      aide: 'Le nombre de mots de la production, saisi à la correction.' },
    { jeton: JETON_POINTS,  famille: 'remplie', libelle: 'somme pondérée', espaceDeTete: true,
      aide: 'Entre parenthèses, le nombre après pondération : « (5 après pondération) ». Il ne paraît que si un sous-critère ne pèse pas 1 ; place-le juste après le nombre. Une phrase sans lui ne montre que le nombre posé, mais la ligne du calcul, dans le PDF, montre la parenthèse.' },
    // Étape 2a (22 oct. 2026) — les deux noms, ÉCRITS dans la grille comme le nom du critère (famille
    // `posee`), remplis par ce module à chaque appel. Ils remplacent {s}, qui n'est plus offert : hors de
    // la palette, le composeur les montrerait en texte brut dans le décompte par défaut.
    // Libellés et aides validés le 22 oct. (TEXTES-2026-10-22-…) : aucun exemple propre à une discipline.
    { jeton: JETON_NOM_ERREURS, famille: 'posee', libelle: 'ce que tu comptes',
      aide: 'Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2.' },
    { jeton: JETON_NOM_MOTS,    famille: 'posee', libelle: 'ce à quoi tu le rapportes',
      aide: 'Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2.' }
];

// ---------------------------------------------------------------------
// LES ÉNONCÉS D'HIER — repris des quatre sites au caractère près
// ---------------------------------------------------------------------
// Chaque clé nomme un ENDROIT où une phrase sort, pas une phrase :
//   decompte     la rétroaction du critère, mode simple et mode catégories
//                (evaluation-calcul.js:502 et :680)
//   priorite     le défi mis en tête du bilan (evaluation-retroaction.js:785)
//   concentre    ce qui reste à travailler quand tout est maîtrisé
//                (evaluation-retroaction.js:854 et
//                 synthese-retroaction-data.js:728 — MÊMES MOTS OBLIGATOIRES,
//                 `copierToutRetroaction` copie l'un dans le document de l'autre)
//   aucune       l'état vide du volet « spécifique » (evaluation-retroaction.js:487)
//
// ⚠ Les apostrophes sont typographiques ou ASCII SELON LE SITE D'ORIGINE. Ne
// pas uniformiser : la reproduction au caractère près est ce qui garantit
// qu'aucun élève de Grégoire ne reçoit un texte différent d'hier.
var ENONCES_FRANCAIS = {
    decompte:  'Ta rédaction contient ' + JETON_ERREURS + ' erreur' + JETON_PLURIEL + ' de français' + JETON_POINTS + ' pour ' + JETON_MOTS + ' mots.',
    priorite:  'la qualité du français écrit est à travailler en priorité',
    concentre: 'Concentre-toi sur la qualité du français',
    aucune:    'Aucun tampon ni erreur de français annotés.'
};

// Les mêmes énoncés, sans discipline.
//
// ⚠ « rédaction » DISPARAÎT AUSSI, et pour la même raison que « français » :
// un critère qui compte des erreurs de calcul ne s'applique pas à une
// rédaction, et qui corrige une partition n'en lit aucune. « production » est
// le mot que l'application emploie partout ailleurs pour ce que l'élève remet
// — ce n'est pas un mot neuf.
//
// ⚠ CES QUATRE TEXTES SONT DE LA PROSE QUE DES ÉLÈVES LIRONT. Ils ne se
// changent pas au jugement d'une session : `CLAUDE.md` les met dans ce qui
// remonte à Grégoire. Ceux-ci ont été arrêtés par lui le 2 septembre 2026.
var ENONCES_GENERIQUES = {
    // ⚠ LE DECOMPTE NE PORTE PAS {critere}, ET C'EST UNE DECISION DE GREGOIRE
    // (2 septembre 2026), prise sur les trois formulations rendues côte à côte.
    // « en {critere} » était bancal (« 12 erreurs en Notation musicale ») et
    // forçait un repli là où la grille est illisible. Le nom du critère titre
    // déjà le panneau au-dessus de cette phrase, et la section du PDF : le
    // répéter dans la phrase ne dit rien de plus à l'élève.
    // ⚠ ÉTAPE 2a (22 oct. 2026) : LA STRUCTURE DU 2 SEPT. NE CHANGE PAS — seuls les deux
    // noms deviennent des jetons. Aucun « de » devant eux : l'élision ne se pose pas.
    // Un critère sans noms les lit « erreur(s) » et « mot(s) » : la phrase d'hier.
    decompte:  'Ta production contient ' + JETON_ERREURS + ' ' + JETON_NOM_ERREURS + JETON_POINTS + ' pour ' + JETON_MOTS + ' ' + JETON_NOM_MOTS + '.',
    priorite:  JETON_CRITERE + ' est à travailler en priorité',
    concentre: 'Concentre-toi sur ' + JETON_CRITERE,
    // « annotés » s'accorde au masculin pluriel avec « tampon » : juste avec tout nom.
    aucune:    'Aucun tampon ni ' + JETON_NOM_ERREURS + ' annotés.'
};

// ↻ LOT 3a DE LA TABLE DE CAS (26 oct. 2026, consigne § 3.5) — « Quand tout est maîtrisé » d'un critère
// NEUF (la marque des noms, `_estNeuf`) : le texte tranché par Grégoire le 25 oct., SANS POINT FINAL — les
// deux sites du bilan écrivent après lui « (3 unités manquantes). » (supposition 7 de l'ébauche, acceptée).
// ⚠ `ENONCES_GENERIQUES.concentre` NE CHANGE PAS : `normaliser` lit le défaut du modèle à chaque rendu, le
// changer changerait le stock. Le modèle générique a donc DEUX défauts pour cette clé, choisis par la marque
// (`_enoncesParDefautDe`) ; « Revenir au modèle » rend celui du critère (`defautEnonce`).
var CONCENTRE_NEUF = 'Tu pourrais encore raffiner : ' + JETON_CRITERE;

// L'ordre et les libellés des clés, pour le gabarit de la grille.
//
// `reperes` : ce que CHAQUE zone offre à la pose — et rien d'autre. ⚠ MESURÉ
// SUR LES SITES D'APPEL, pas décidé : `enonce(critere, cle, valeurs)` ne
// remplit que ce que l'appelant lui donne, et {critere} vient toujours d'ici.
//   decompte   evaluation-calcul.js — {erreurs, mots, points} (mode catégories)
//              et {erreurs, mots} (mode simple)
//   priorite   evaluation-retroaction.js — {} ; concentre — {} (deux sites) ;
//   aucune     evaluation-retroaction.js — {}
// Étape 2a : {nomErreurs} et {nomMots} viennent toujours d'ici, comme {critere} ; offerts là où la
// phrase parle de ce qu'on compte (le décompte, « Aucune annotation »), pas ailleurs.
// Une zone qui offrirait {erreurs} là où l'appel ne le fournit pas proposerait
// de composer une phrase avec un nombre toujours vide — le cas qui a fait
// trancher Grégoire le 3 septembre : « Aucune annotation » s'affiche quand la
// copie ne porte NI tampon NI erreur. La sentinelle du texte troué relit les
// sites et rougit si cette table s'en écarte, dans un sens comme dans l'autre.
var CLES = [
    { cle: 'decompte',  libelle: 'Décompte des erreurs',        aide: 'La phrase engendrée sous le critère, et reprise dans le PDF de l\'étudiant·e.',
      reperes: [JETON_CRITERE, JETON_ERREURS, JETON_NOM_ERREURS, JETON_MOTS, JETON_NOM_MOTS, JETON_POINTS] },
    { cle: 'priorite',  libelle: 'Défi prioritaire',            aide: 'Mise en tête du bilan quand ce critère est effondré.',
      reperes: [JETON_CRITERE] },
    { cle: 'concentre', libelle: 'Quand tout est maîtrisé',     aide: 'Ce qui reste à travailler lorsque tous les critères sont acquis.',
      reperes: [JETON_CRITERE] },
    { cle: 'aucune',    libelle: 'Aucune annotation',           aide: 'Affiché à l\'enseignant·e quand la copie ne porte ni tampon ni erreur.',
      reperes: [JETON_CRITERE, JETON_NOM_ERREURS] }
];

// ---------------------------------------------------------------------
// LES MODÈLES
// ---------------------------------------------------------------------

var MODELES = [
    {
        id: 'generique',
        nom: 'Générique (nom du critère)',
        description: 'Les phrases nomment le critère tel qu\'il est écrit dans la grille. Convient à toute discipline.',
        enoncesParDefaut: ENONCES_GENERIQUES
    },
    {
        id: 'discipline_francais',
        nom: 'Français écrit',
        description: 'Les phrases parlent du français écrit (« erreurs de français », « la qualité du français »). Pour un critère d\'une autre discipline, choisis « Générique », qui nomme le critère tel qu\'il est écrit dans la grille.',
        enoncesParDefaut: ENONCES_FRANCAIS
    }
];

var MODELE_PAR_DEFAUT = 'generique';

/**
 * Le nom d'un critère annonce-t-il le français écrit ?
 *
 * ⚠ MESURÉ, PAS DEVINÉ. Ce prédicat ne sert QU'À CHOISIR UN DÉFAUT pour un
 * critère qui n'a jamais été réglé. Il ne décide d'aucun texte dès que
 * `modeleEnonces` est écrit dans le gabarit — c'est-à-dire dès que
 * l'utilisateur a exprimé un choix.
 *
 * Accents et casse sont neutralisés : « Français écrit », « FRANCAIS »,
 * « Qualité du français » passent tous. Un critère nommé « Franchise » ne
 * passe pas — la frontière est le mot, pas la sous-chaîne.
 *
 * ⚠ LA FORME FLÉCHIE COMPTE, ET SON ABSENCE ÉTAIT UN DÉFAUT SILENCIEUX.
 * Trouvé par la relecture croisée du 2 septembre 2026 : le motif exigeait un
 * non-alphabétique APRÈS « francais », si bien que « Maîtrise de la langue
 * FRANÇAISE » — un nom courant au collégial — basculait sur le générique sans
 * rien dire, et le texte reçu par l'élève changeait. Pour un lecteur humain,
 * « française » dit français ; le code devait le dire aussi.
 */
function _nomDitFrancais(nom) {
    if (typeof nom !== 'string' || !nom) return false;
    var nu = nom.toLowerCase();
    // Neutralisation d'accents sans dépendre de String.normalize (absent de
    // certains moteurs anciens) : seules les voyelles accentuées du français
    // écrit nous intéressent ici.
    nu = nu.replace(/[àâä]/g, 'a').replace(/[çÇ]/g, 'c').replace(/[éèêë]/g, 'e')
           .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u');
    return /(^|[^a-z])francais(e|es)?([^a-z]|$)/.test(nu);
}

/** Les défauts d'un modèle POUR CE CRITÈRE : le générique d'un critère neuf a son « Quand tout est maîtrisé ». */
function _enoncesParDefautDe(modele, critere) {
    if (modele.id !== 'generique' || !_estNeuf(critere)) return modele.enoncesParDefaut;
    var d = {};
    Object.keys(modele.enoncesParDefaut).forEach(function(k) { d[k] = modele.enoncesParDefaut[k]; });
    d.concentre = CONCENTRE_NEUF;
    return d;
}

/**
 * Le texte du modèle pour une clé de CE critère — ce que « Revenir au modèle » remet (lot 3a). Le modèle
 * est celui que le critère lit (`normaliser`), jamais un autre.
 */
function defautEnonce(critere, cleEnonce) {
    var p = normaliser(critere);
    var d = _enoncesParDefautDe(obtenirModele(p.modeleId), critere);
    return (typeof d[cleEnonce] === 'string') ? d[cleEnonce] : '';
}

function listerModeles() {
    return MODELES.map(function(m) {
        return { id: m.id, nom: m.nom, description: m.description };
    });
}

function obtenirModele(id) {
    for (var i = 0; i < MODELES.length; i++) if (MODELES[i].id === id) return MODELES[i];
    return null;
}

/** Les clés d'énoncé et leurs libellés, pour le gabarit. */
function listerCles() {
    return CLES.map(function(c) {
        return { cle: c.cle, libelle: c.libelle, aide: c.aide, reperes: c.reperes.slice() };
    });
}

// ---------------------------------------------------------------------
// Les repères — palette, contrat par zone, pose au curseur
// ---------------------------------------------------------------------

function _copieRepere(r) {
    return { jeton: r.jeton, famille: r.famille, libelle: r.libelle, aide: r.aide,
             espaceDeTete: !!r.espaceDeTete };
}

/**
 * Le repère d'un jeton, dans SA palette. Sans palette : celle des énoncés.
 * Étape 2 (4 sept. 2026) : la pose est commune aux énoncés et aux paliers de
 * projection ; chaque registre déclare ses repères, celui-ci déclare le geste.
 */
function _repere(jeton, palette) {
    var liste = (Array.isArray(palette) && palette.length) ? palette : REPERES;
    for (var i = 0; i < liste.length; i++) if (liste[i] && liste[i].jeton === jeton) return liste[i];
    return null;
}

/** Le repère qui OUVRE un texte (le texte commence par son jeton), s'il y en a un. */
function _repereEnTete(texte, palette) {
    var liste = (Array.isArray(palette) && palette.length) ? palette : REPERES;
    for (var i = 0; i < liste.length; i++) if (liste[i] && texte.indexOf(liste[i].jeton) === 0) return liste[i];
    return null;
}

/** La palette des repères posables — jamais {s}. */
function listerReperes() {
    return REPERES.map(_copieRepere);
}

/**
 * Les repères qu'une zone offre — ceux qu'un appel remplit, et seulement eux.
 * Une clé inconnue n'offre rien.
 */
function reperesDeCle(cle) {
    for (var i = 0; i < CLES.length; i++) {
        if (CLES[i].cle !== cle) continue;
        return CLES[i].reperes.map(_repere).filter(Boolean).map(_copieRepere);
    }
    return [];
}

/**
 * Pose un repère dans un texte, à la place du curseur ou de la sélection.
 *
 * Le geste que ça remplace : taper `{erreurs}` — et le 2 septembre, Grégoire
 * a tapé `[service]` ; le texte avait l'air juste, l'élève aurait lu le
 * crochet. Un repère posé ne se tape pas, cette classe d'erreur disparaît.
 *
 * ⚠ LE RÉSULTAT EST DU TEXTE ORDINAIRE : ce que cette fonction rend, `rendre`
 * le lit exactement comme s'il avait été tapé. Rien d'autre ne change.
 *
 * Les espaces : sur iPad, toucher un mot pose le curseur à sa FIN, collé à la
 * dernière lettre. Sans une espace ajoutée, le repère s'y soude
 * (« contient{erreurs} » ⮕ « contient12 »). Une espace est donc ajoutée
 * avant le repère quand il suit une lettre, un chiffre ou une ponctuation qui
 * ferme, ou un autre repère (deux repères soudés rendraient « 5003 ») —
 * jamais après une espace, une ouvrante ou une apostrophe (« l'{critere} » se
 * dit) — et après lui quand un mot ou un repère le suit directement.
 * {points} fait exception des deux côtés : il porte déjà son espace de tête.
 *
 * ⚠ UN REPÈRE NE COUPE JAMAIS UN MOT — essai iPad de Grégoire sur 1.114.0 :
 * « fran {critere} çais ». Sur iPad comme à la souris, le curseur peut tomber
 * entre deux lettres. Un point d'insertion à l'intérieur d'un mot est ramené
 * à la frontière LA PLUS PROCHE de ce mot — son début ou sa fin — et, à
 * distance égale, à sa fin : on pose un repère après ce qu'on vient de lire.
 * Un point d'insertion à l'intérieur d'un repère déjà posé ({cri|tere}) est
 * ramené après lui. Une sélection n'est pas déplacée : elle est voulue.
 *
 * @param {string} texte - le texte de la zone
 * @param {number} debut - début de la sélection (le curseur, si égal à `fin`)
 * @param {number} fin - fin de la sélection
 * @param {string} jeton - un repère de `listerReperes()`, avec ses accolades
 * @param {Array} [palette] - étape 2 : les repères d'un AUTRE registre (ceux de
 *          `projectionAlgo.listerReperes()`) ; sans elle, ceux des énoncés.
 *          Le jeton doit appartenir à la palette donnée, sinon `null`.
 * @returns {{texte: string, curseur: number}|null} le nouveau texte et la
 *          position du curseur après le repère ; `null` si `jeton` n'est pas
 *          posable — le texte n'est alors pas touché.
 */
/** Une lettre, un chiffre, une apostrophe ou un trait d'union : ce qui tient un mot ensemble. */
var _CAR_MOT = /[\p{L}\p{N}'’-]/u;

/**
 * Le point d'insertion ramené hors d'un mot ou d'un repère (voir `insererRepere`).
 * Rend `a` inchangé quand il est déjà à une frontière.
 */
function _horsDuMot(t, a) {
    // À l'intérieur d'un repère déjà posé : après lui.
    var ouvrante = t.lastIndexOf('{', a - 1);
    if (ouvrante !== -1) {
        var fermante = t.indexOf('}', ouvrante);
        if (fermante !== -1 && a > ouvrante && a <= fermante) return fermante + 1;
    }
    var gauche = a > 0 && _CAR_MOT.test(t.charAt(a - 1));
    var droite = a < t.length && _CAR_MOT.test(t.charAt(a));
    if (!gauche || !droite) return a;
    var debutMot = a;
    while (debutMot > 0 && _CAR_MOT.test(t.charAt(debutMot - 1))) debutMot--;
    var finMot = a;
    while (finMot < t.length && _CAR_MOT.test(t.charAt(finMot))) finMot++;
    return (a - debutMot < finMot - a) ? debutMot : finMot;
}

function insererRepere(texte, debut, fin, jeton, palette) {
    var r = _repere(jeton, palette);
    if (!r) return null;
    var t = (typeof texte === 'string') ? texte : '';
    var n = t.length;
    // Une position absente ou hors bornes vaut la fin du texte : un repère
    // posé sans curseur connu s'ajoute, il ne s'intercale pas au hasard.
    var borne = function(x) {
        return (typeof x === 'number' && isFinite(x)) ? Math.min(Math.max(Math.round(x), 0), n) : n;
    };
    var a = borne(debut), b = borne(fin);
    if (a > b) { var tmp = a; a = b; b = tmp; }
    if (a === b) { a = b = _horsDuMot(t, a); }
    var avant = t.slice(0, a), apres = t.slice(b);
    var espaceAvant = (!r.espaceDeTete && /[\p{L}\p{N}}.,;:!?)»…%]$/u.test(avant)) ? ' ' : '';
    var suitUnMot = /^[\p{L}\p{N}]/u.test(apres);
    // Un repère qui porte déjà son espace de tête ({points}) n'en reçoit pas une seconde.
    var enTete = _repereEnTete(apres, palette);
    var suitUnRepere = apres.charAt(0) === '{' && !(enTete && enTete.espaceDeTete);
    var espaceApres = (suitUnMot || suitUnRepere) ? ' ' : '';
    var insere = espaceAvant + r.jeton + espaceApres;
    return { texte: avant + insere + apres, curseur: avant.length + insere.length };
}

// ---------------------------------------------------------------------
// Lecture d'un critère
// ---------------------------------------------------------------------

/**
 * Lit les énoncés d'un critère, en migrant à la lecture ceux d'avant #581.
 *
 * @returns {{modeleId, enonces, herite}} `herite` dit si le modèle a été
 *          choisi faute de champ `modeleEnonces`.
 */
function normaliser(critere) {
    critere = critere || {};
    var declare = typeof critere.modeleEnonces === 'string' ? critere.modeleEnonces.trim() : '';
    var modele = declare ? obtenirModele(declare) : null;
    var herite = false;

    if (!modele) {
        // Critère d'avant #581, ou identifiant venu d'une version plus récente.
        // Le NOM tranche — voir la déviation nommée en tête de fichier.
        modele = obtenirModele(_nomDitFrancais(critere.nom) ? 'discipline_francais' : MODELE_PAR_DEFAUT);
        herite = true;
    }

    var source = (critere.enonces && typeof critere.enonces === 'object') ? critere.enonces : {};
    var defauts = _enoncesParDefautDe(modele, critere);
    var enonces = {};
    CLES.forEach(function(c) {
        var brut = source[c.cle];
        // Une chaîne VIDE est un choix : elle fait taire l'énoncé. C'est
        // `undefined` — l'absence de réglage — qui retombe sur le défaut.
        enonces[c.cle] = (typeof brut === 'string') ? brut : defauts[c.cle];
    });

    return { modeleId: modele.id, enonces: enonces, herite: herite };
}

// ---------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------

/** Échappe une chaîne pour un usage dans une RegExp littérale. */
function _echapperRegExp(texte) {
    return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remplit les jetons d'un texte.
 *
 * ⚠ UN JETON NON FOURNI EST RETIRÉ, PAS RENDU. Un texte du gabarit peut porter
 * un jeton que le site d'appel ne connaît pas ({points} hors du mode pondéré,
 * par exemple) : le laisser en place mettrait « {points} » sous les yeux d'un
 * élève. Il part, et le texte reste une phrase.
 *
 * @param {string} texte
 * @param {object} valeurs - les jetons fournis, sans leurs accolades
 */
function rendre(texte, valeurs) {
    if (typeof texte !== 'string' || !texte) return '';
    var v = (valeurs && typeof valeurs === 'object') ? valeurs : {};
    var sortie = texte;

    JETONS.forEach(function(jeton) {
        var cle = jeton.slice(1, -1);
        var brut = v[cle];
        var vide = (brut === undefined || brut === null || brut === '');
        // ⚠ UN JETON VIDE EMPORTE L'ESPACE QUI LE PRÉCÈDE, ET RIEN D'AUTRE.
        // La version d'avant repassait sur TOUT le texte
        // (`.replace(/\s+([.,;:!?])/g, '$1')`) pour refermer le trou. Mesuré le
        // 2 septembre 2026 : « Attention : 3 erreurs ; revois ! » ressortait
        // « Attention: 3 erreurs; revois! » — le registre RÉÉCRIVAIT la
        // typographie française du texte que l'enseignant·e avait tapé, dans un
        // lot dont tout l'objet est de respecter sa prose. L'espace fine avant
        // « ; : ! ? » est correcte en français ; seul un trou laissé par un
        // jeton retiré doit être refermé, et il se referme ici, localement.
        var motif = vide
            ? new RegExp('[ \\t]?' + _echapperRegExp(jeton), 'g')
            : new RegExp(_echapperRegExp(jeton), 'g');
        sortie = sortie.replace(motif, vide ? '' : String(brut));
    });

    return remplirCalculs(sortie, v).trim();
}

// Étape 4c (27 oct. 2026) — LE JETON D'UN CALCUL POUR LES PHRASES : `{calcN}` (l'identifiant du calcul, `formulesAlgo`).
var JETON_CALCUL = /([ \t]?)\{(calc[1-9][0-9]{0,3})\}/g;

/**
 * Remplit les jetons des calculs d'un texte : `{calc3}` reçoit `valeurs.calc3`. Un jeton que l'appel ne remplit pas
 * (calcul sans valeur, retiré, introuvable après un import) part AVEC L'ESPACE QUI LE PRÉCÈDE, comme tout jeton vide
 * de `rendre` : jamais « {calc3} » sur le PDF d'un·e étudiant·e. Un texte sans tel jeton est rendu à l'octet. Ne trime pas.
 */
function remplirCalculs(texte, valeurs) {
    if (typeof texte !== 'string' || texte.indexOf('{calc') < 0) return (typeof texte === 'string') ? texte : '';
    var v = (valeurs && typeof valeurs === 'object') ? valeurs : {};
    return texte.replace(JETON_CALCUL, function(tout, espace, id) {
        var brut = Object.prototype.hasOwnProperty.call(v, id) ? v[id] : undefined;
        return (brut === undefined || brut === null || brut === '') ? '' : espace + String(brut);
    });
}

/** Le texte porte-t-il un jeton de calcul (`{calcN}`) ? */
function porteUnCalcul(texte) {
    return typeof texte === 'string' && /\{calc[1-9][0-9]{0,3}\}/.test(texte);
}

/**
 * L'énoncé d'un critère pour une clé donnée, jetons remplis.
 *
 * @param {object} critere - le critère de grille (porte le modèle et les textes)
 * @param {string} cle - une des clés de `listerCles()`
 * @param {object} valeurs - les jetons ({erreurs}, {mots}, {points}…)
 * @returns {string} la phrase, ou '' si l'énoncé a été vidé par l'utilisateur.
 *
 * ⚠ `{critere}` est fourni PAR CE MODULE, jamais par l'appelant : il n'y a
 * qu'une source pour le nom d'un critère, et c'est le critère.
 */
function enonce(critere, cle, valeurs) {
    var p = normaliser(critere);
    var texte = p.enonces[cle];
    if (typeof texte !== 'string') return '';

    var v = {};
    if (valeurs && typeof valeurs === 'object') {
        Object.keys(valeurs).forEach(function(k) { v[k] = valeurs[k]; });
    }
    // ⚠ LE REPLI DE PHRASE, PAS CELUI DE TITRE — voir `CRITERE_SANS_NOM`.
    var nomCritere = (critere && typeof critere.nom === 'string') ? critere.nom.trim() : '';
    v.critere = nomCritere || CRITERE_SANS_NOM;
    // Le pluriel suit le décompte d'erreurs, et seulement lui. Un énoncé qui
    // ne porte pas {erreurs} ne porte pas {s} non plus. Étape 2a : la règle unique
    // (`estPluriel`, le singulier sous 2) — `> 1` ne différait que pour un nombre entre 1 et 2.
    if (v.s === undefined) v.s = estPluriel(v.erreurs) ? 's' : '';
    // Étape 2a — les deux noms, comme {critere} : du critère, jamais de l'appelant.
    var n = noms(critere);
    v.nomErreurs = accorder(v.erreurs, n.erreurs);
    v.nomMots = accorder(v.mots, n.mots);
    return rendre(texte, v);
}

/**
 * Écrit le modèle et les énoncés sur le critère. Le gabarit appelle ceci ; le
 * module ne touche jamais aux données de son propre chef.
 *
 * ⚠ N'ÉCRIT QUE CE QUI DIFFÈRE DU DÉFAUT. Recopier les défauts dans les
 * données les figerait : une correction du registre n'atteindrait plus les
 * grilles déjà enregistrées, et chaque grille partagée transporterait quatre
 * phrases que personne n'a écrites. Même règle qu'au §`appliquerAuCritere` de
 * `evaluation-projection.js`.
 */
function appliquerAuCritere(critere, modeleId, enonces) {
    critere = critere || {};
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    critere.modeleEnonces = modele.id;

    var source = (enonces && typeof enonces === 'object') ? enonces : {};
    var defauts = _enoncesParDefautDe(modele, critere);
    var propres = {};
    var aQuelqueChose = false;
    CLES.forEach(function(c) {
        var brut = source[c.cle];
        if (typeof brut !== 'string') return;
        if (brut === defauts[c.cle]) return;
        propres[c.cle] = brut;
        aQuelqueChose = true;
    });

    if (aQuelqueChose) {
        critere.enonces = propres;
    } else {
        delete critere.enonces;
    }
    return critere;
}

/**
 * Ce que l'enseignant·e a RÉDIGÉ, à conserver quand le modèle change.
 *
 * ⚠ CHANGER DE MODÈLE NE JETTE PAS DE LA PROSE. Le patron de #668 remet tout
 * aux défauts du nouveau modèle : il le peut, parce qu'il remet des SEUILS
 * NUMÉRIQUES, qui se retrouvent. Quatre phrases rédigées ne se retrouvent pas,
 * et le geste est atteignable en un clic sur un `<select>`. Relecture croisée
 * du 2 septembre 2026 : « ce qu'un utilisateur détruit, il l'a voulu » —
 * ici il ne l'aurait pas voulu.
 *
 * ⮕ Ce qui est rédigé est exactement ce que `appliquerAuCritere` a jugé digne
 * d'être écrit : les clés de `critere.enonces`. Une zone restée au défaut n'y
 * est pas, et prendra donc le défaut du NOUVEAU modèle — c'est bien le
 * changement demandé. Une zone VIDÉE y est, parce que la vider est un choix.
 */
function enoncesRediges(critere) {
    var source = (critere && critere.enonces && typeof critere.enonces === 'object')
        ? critere.enonces : {};
    var propres = {};
    CLES.forEach(function(c) {
        if (typeof source[c.cle] === 'string') propres[c.cle] = source[c.cle];
    });
    return propres;
}

/**
 * LA MENTION PONDÉRÉE — décision de Grégoire, 21 oct. 2026 (8 h 38 et 8 h 39, consigne
 * `CONSIGNE-LOT-2026-10-21-critere-algorithmique-dit-vrai.md`) : la formule reçoit la somme
 * PONDÉRÉE des codes posés ; quand elle diffère du nombre d'erreurs, l'élève lit les deux.
 * Rend la parenthèse AVEC son espace de tête (la valeur du jeton {points}, et de la ligne du
 * PDF), ou '' quand les deux nombres sont égaux — tous les poids à 1 : rien ne change dans ce
 * que l'élève lit. Virgule décimale, deux décimales au plus.
 * ↻ DÉCISION DE GRÉGOIRE, 22 oct. 2026, 17 h : LA PARENTHÈSE NE S'ACCORDE PLUS —
 * « 5 erreurs (3,5 après pondération) sur 400 mots », juste avec tout nom que l'enseignant·e
 * donne, masculin ou féminin. Elle remplace « (3,5 une fois pondérées) » pour tous les
 * critères ; les PDF déjà remis gardent l'ancienne forme.
 * Une seule source pour la phrase du décompte (les deux modes) et pour le PDF.
 */
function mentionPonderee(brut, pondere) {
    var b = Number(brut), p = Number(pondere);
    if (brut === null || brut === undefined || pondere === null || pondere === undefined) return '';
    if (!isFinite(b) || !isFinite(p) || Math.abs(p - b) < 0.005) return '';
    var arrondi = Math.round(p * 100) / 100;
    return ' (' + _formaterNombre(arrondi) + ' après pondération)';
}

/** Les énoncés par défaut d'un modèle — pour préremplir le gabarit. */
function enoncesParDefaut(modeleId) {
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    return JSON.parse(JSON.stringify(modele.enoncesParDefaut));
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    MODELE_PAR_DEFAUT: MODELE_PAR_DEFAUT,
    LIBELLE_SANS_CRITERE: LIBELLE_SANS_CRITERE,
    CRITERE_SANS_NOM: CRITERE_SANS_NOM,
    JETON_CRITERE: JETON_CRITERE,
    JETON_ERREURS: JETON_ERREURS,
    JETON_PLURIEL: JETON_PLURIEL,
    JETON_MOTS: JETON_MOTS,
    JETON_POINTS: JETON_POINTS,
    JETON_NOM_ERREURS: JETON_NOM_ERREURS,
    JETON_NOM_MOTS: JETON_NOM_MOTS,
    MAX_NOM: MAX_NOM,
    MARQUE_NOMS: MARQUE_NOMS,
    marquerNomsAttendus: marquerNomsAttendus,
    NOMS_DE_REPLI: { erreurs: _copiePaire(NOMS_DE_REPLI.erreurs), mots: _copiePaire(NOMS_DE_REPLI.mots) },
    noms: noms,
    nomsSaisis: nomsSaisis,
    nomsManquants: nomsManquants,
    estNeuf: estNeuf,
    nomsFrancaisEcrit: nomsFrancaisEcrit,
    appliquerNoms: appliquerNoms,
    estPluriel: estPluriel,
    accorder: accorder,
    nombreEtNom: nombreEtNom,
    enEtiquette: enEtiquette,
    listerModeles: listerModeles,
    listerCles: listerCles,
    listerReperes: listerReperes,
    reperesDeCle: reperesDeCle,
    insererRepere: insererRepere,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    rendre: rendre,
    remplirCalculs: remplirCalculs,   // étape 4c
    porteUnCalcul: porteUnCalcul,
    enonce: enonce,
    mentionPonderee: mentionPonderee,
    libelleCritere: libelleCritere,
    critereAlgorithmique: critereAlgorithmique,
    criteresAlgorithmiques: criteresAlgorithmiques,
    critereAlgorithmiqueOuNomme: critereAlgorithmiqueOuNomme,
    appliquerAuCritere: appliquerAuCritere,
    defautEnonce: defautEnonce,
    enoncesRediges: enoncesRediges,
    enoncesParDefaut: enoncesParDefaut
};

if (typeof window !== 'undefined') window.enoncesAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
