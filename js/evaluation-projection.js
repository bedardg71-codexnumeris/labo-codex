/* ===============================
   MODULE EVALUATION-PROJECTION — Registre des modèles de projection

   RAISON D'ÊTRE (#668, 2026-09-01)
   La rétroaction qui situe l'élève face au seuil de l'épreuve uniforme de
   français EXISTE et fonctionne depuis longtemps — mais elle était écrite en
   dur dans `genererRetroactionEUF` (evaluation-calcul.js), avec ses cinq
   verdicts, ses quatre seuils et le nom d'un service d'aide propre au collège
   de son auteur. Une enseignante d'un autre établissement ne pouvait ni la
   régler, ni la retirer, ni corriger le nom du service.

   Ce module est le prolongement direct de #667 : ce qui appartient à la
   pratique d'une personne remonte dans le gabarit de la grille ; le code ne
   garde que la mécanique.

   DEUX NORMES QUI NE DOIVENT JAMAIS ÊTRE CONFONDUES
     · La norme de NOTATION du cours — combien de points l'élève perd. Elle
       varie (601-101 : 600 mots, 601-102 : 700, 601-103 : 900) et vit dans
       `facteurNormalisation`, paramètre du modèle de FORMULE (#667).
     · La norme de l'EUF — où l'élève se situe face à l'épreuve ministérielle.
       30 erreurs pour 900 mots, soit 1 erreur / 30 mots. FIXE, indépendante
       du cours.
   ⚠ C'est tout l'intérêt du dispositif : en 101 l'élève est NOTÉ sur une base
   de 600 mots, et SITUÉ face à 900. En 103 les deux normes coïncident.
   ⮕ Ce module ne lit donc JAMAIS `facteurNormalisation`. Si un jour une
   ligne d'ici le lit, c'est un bug, pas une optimisation.

   MODÈLE DE DONNÉES SUR LE CRITÈRE (SSOT)
     critere.modeleProjection  : string — identifiant du modèle
     critere.paramsProjection  : objet  — paramètres du modèle
     critere.paliersProjection : tableau — les paliers et leurs textes

   POURQUOI LES SEUILS SONT STOCKÉS EN RATIO, PAS EN MOTS-PAR-ERREUR
   Un seuil écrit « 100 mots par erreur » perd son sens dès que l'utilisateur
   change la norme de référence : il faut alors réécrire les quatre seuils un
   à un, et rien ne prévient que l'ancien réglage est devenu faux. Un ratio
   normalisé (« 0,3 fois le seuil ») garde son sens quelle que soit la norme.
   Le gabarit affiche les DEUX unités ; seul le ratio est stocké.

   ⚠ MESURE, PAS RAISONNEMENT (1er septembre 2026). Passer de seuils sur
   `motsParErreur` à des seuils sur le ratio est une réécriture de comparaisons
   en virgule flottante : elle POURRAIT déplacer un verdict d'un côté à l'autre
   d'une frontière. Balayage de 2 700 000 couples (erreurs entières 1..300 et
   demi-entières, mots 1..3000) confrontant les deux chemins : AUCUN écart,
   frontières comprises. Les quatre divisions tombent juste au bit près
   (30/100 === 0.3, 30/75 === 0.4, 30/60 === 0.5, 30/30 === 1).

   MIGRATION À LA LECTURE (aucune écriture de masse, règle #667)
   Un critère d'avant #668 n'a ni modèle, ni paramètres, ni paliers. Il est lu
   comme « norme externe » avec les paliers et les TEXTES d'aujourd'hui, repris
   AU MOT PRÈS — nom du service compris, même si ce nom est devenu faux. La
   fidélité au comportement existant prime : corriger le texte est un geste de
   l'utilisateur dans le gabarit, pas une décision du code.
   ⚠ Ne pas confondre avec `PALIERS_GABARIT_NEUF`, plus bas : les paliers qu'un
   critère NEUF écrit quand il fixe sa limite (lot 3a, 26 oct. 2026) ne
   charrient ni discipline ni particularité d'établissement.

   LE TEXTE TROUÉ, ÉTAPE 2 (4 septembre 2026) — LES DEUX TEXTES D'UN PALIER SE
   COMPOSENT AVEC DES BADGES. Le registre déclare ses jetons (`REPERES`),
   les remplit par copie (`remplir`, `_valeursJetons`) et DIT ceux qu'il ne
   connaît pas (`jetonsInconnus`). Le format qui voyage ne change pas : `texte`
   et `texteAide` restent du texte libre avec accolades ; un texte sans jeton
   connu se rend à l'octet près comme avant ce lot — c'est le golden #668 qui
   le tient. Décisions de Grégoire (4 sept., 17 h 15) : les noms des badges, et
   le préfixe engendré qui devient `{moyenne}` — voir `_resultat`.
   ⚠ Le risque nommé de ce lot (carte du 4 sept., §d) : une version ANTÉRIEURE
   rend un jeton tel quel à l'élève, et le texte rendu est persisté à la
   correction. Le changelog nomme la contrainte « corrige avec l'application
   à jour ».

   Aucune dépendance : ni DOM, ni db, ni evaluationEnCours. Testable en Node.
   =============================== */

(function() {
'use strict';

// #1137 (22 oct. 2026) : les nombres affichés passent par js/note-pourcentage.js, que index.html
// charge avant ce module ; un banc Node (`require`) le requiert.
var _formaterNombre = (typeof formaterNombre === 'function')
    ? formaterNombre : require('./note-pourcentage.js').formaterNombre;

// Lot 3a (26 oct. 2026) : les deux noms de l'enseignant·e, lus À L'APPEL au registre des énoncés (leur
// source), sur `window` ou par `require` (un banc Node). Sans lui, les phrases d'hier.
function _E() {
    if (typeof window !== 'undefined' && window.enoncesAlgo) return window.enoncesAlgo;
    if (typeof require === 'function') {
        try { return require('./evaluation-enonces.js'); } catch (err) { return null; }
    }
    return null;
}

/**
 * LE CRITÈRE NEUF DU LOT 3a — la marque des noms (`nomsAttendus`, `enoncesAlgo.MARQUE_NOMS`), posée à la
 * naissance depuis l'étape 2a (22 oct. 2026). ⚠ PAS la marque des codes (`codesSousCriteresSeulement`),
 * que la consigne nommait : celle-là est en ligne depuis la 1.213.0, et la relecture de Cowork du 22 oct.
 * (17 h 40) l'a écartée pour tout ce que lit l'élève — la lire changerait sans geste les critères créés en
 * 1.213 et 1.214. Un critère sans la marque lit ce qu'il lit aujourd'hui.
 */
function estNeuf(critere) {
    return !!critere && critere.nomsAttendus === true;
}

// ---------------------------------------------------------------------
// Le jeton de substitution du nom de service
// ---------------------------------------------------------------------
// Le nom du service d'aide est un PARAMÈTRE, pas une constante : au collège de
// Grégoire, le « Centre d'aide en français (CAF) » est devenu « Passerelle + »
// et la transition n'est pas finie. L'application disait donc à des élèves de
// s'inscrire à un service disparu — l'exemple type de ce que ce chantier
// corrige. Le texte du palier porte le jeton, le registre y met le nom réglé.
var JETON_SERVICE = '{service}';

// ---------------------------------------------------------------------
// LES JETONS D'UN PALIER — le texte troué, étape 2 (4 septembre 2026)
// ---------------------------------------------------------------------
// Décision de Grégoire (4 sept., 17 h 15) : huit badges, dans les mots que
// les collègues lisent. Deux familles, tenues distinctes à l'écran (cadrage
// du 2 sept.) :
//   posee    la valeur est ÉCRITE dans le gabarit, une fois, pour tous les
//            élèves — le nom du service, les erreurs tolérées, la longueur
//            de référence ;
//   remplie  la valeur vient de la CORRECTION, copie par copie — elle
//            n'existe pas avant, personne n'a à la saisir dans la grille.
// ⚠ `palier` remplace le « niveau » de la maquette : « niveau » désigne déjà
// l'IDME partout dans l'application, et ce badge rend « Risqué », pas « D ».
// Le niveau IDME et la note sont calculés au site d'appel (evaluation-calcul.js)
// et jamais passés ici : pas offerts, ce serait toucher le calcul. Le lien du
// service voyage À PART (sentinelle #668 F) ; le facteur appartient à la
// FORMULE (voir l'en-tête) — pas offerts non plus.
// `{s}` est l'accord du pluriel qui suit `{erreurs}` : le rendu le connaît,
// la palette ne l'offre pas — même règle que les énoncés (#581).
var JETON_SEUIL      = '{seuil}';
var JETON_LONGUEUR   = '{longueur}';
var JETON_ERREURS    = '{erreurs}';
var JETON_MOTS       = '{mots}';
var JETON_MOYENNE    = '{moyenne}';
var JETON_PROJECTION = '{projection}';
var JETON_PALIER     = '{palier}';
var JETON_PLURIEL    = '{s}';
// Lot 3a de la table de cas (26 oct. 2026, consigne § 3.8) : les deux noms de l'enseignant·e, comme dans
// le décompte. ⚠ Ils ne font PAS tomber le préfixe engendré : seuls les jetons de projection le font
// (décision du 4 sept.) — `JETONS_PROJECTION`, plus bas.
var JETON_NOM_ERREURS = '{nomErreurs}';
var JETON_NOM_MOTS    = '{nomMots}';

var REPERES = [
    { jeton: JETON_SERVICE,    famille: 'posee',   libelle: 'nom du service',
      aide: 'Le nom du service d\'aide réglé plus haut. Vide : le badge disparaît.' },
    { jeton: JETON_SEUIL,      famille: 'posee',   libelle: 'erreurs tolérées',
      aide: 'Le nombre d\'erreurs tolérées sur la longueur de référence (30 pour l\'EUF).' },
    { jeton: JETON_LONGUEUR,   famille: 'posee',   libelle: 'longueur de référence',
      aide: 'La longueur de référence de l\'épreuve, en mots (900 pour l\'EUF).' },
    { jeton: JETON_ERREURS,    famille: 'remplie', libelle: 'nombre d\'erreurs',
      aide: 'Le nombre d\'erreurs comptées sur la copie, à la correction.' },
    { jeton: JETON_MOTS,       famille: 'remplie', libelle: 'nombre de mots',
      aide: 'Le nombre de mots de la production, saisi à la correction.' },
    { jeton: JETON_MOYENNE,    famille: 'remplie', libelle: 'mots par erreur',
      aide: 'En moyenne, 1 erreur à chaque N mots : c\'est ce N. Vide sur une copie sans erreur.' },
    { jeton: JETON_PROJECTION, famille: 'remplie', libelle: 'erreurs projetées',
      aide: 'Le nombre d\'erreurs que la copie ferait sur la longueur de référence, au même rythme.' },
    { jeton: JETON_PALIER,     famille: 'remplie', libelle: 'palier atteint',
      aide: 'Le nom du palier que la copie atteint, tel qu\'il est écrit dans la colonne « Palier ».' },
    { jeton: JETON_NOM_ERREURS, famille: 'posee', libelle: 'ce que tu comptes',
      aide: 'Le nom de ce que tu comptes : au singulier sous 2, au pluriel à partir de 2.' },
    { jeton: JETON_NOM_MOTS,    famille: 'posee', libelle: 'ce à quoi tu le rapportes',
      aide: 'Le nom de ce à quoi tu rapportes le compte : au singulier sous 2, au pluriel à partir de 2.' }
];

// Ce que le rendu CONNAÎT : les dix repères, plus l'accord du pluriel.
var JETONS = REPERES.map(function(r) { return r.jeton; }).concat([JETON_PLURIEL]);
// Ce qui fait tomber le préfixe engendré : les jetons de projection, pas les deux noms (consigne 3a, § 3.8).
var JETONS_PROJECTION = JETONS.filter(function(j) { return j !== JETON_NOM_ERREURS && j !== JETON_NOM_MOTS; });

/** La palette des badges posables dans les deux zones d'un palier — jamais {s}. */
function listerReperes() {
    return REPERES.map(function(r) {
        return { jeton: r.jeton, famille: r.famille, libelle: r.libelle, aide: r.aide, espaceDeTete: false };
    });
}

function _porteUnDe(texte, liste) {
    if (typeof texte !== 'string' || !texte) return false;
    for (var i = 0; i < liste.length; i++) if (texte.indexOf(liste[i]) !== -1) return true;
    return false;
}

/** Le texte porte-t-il au moins un jeton de PROJECTION (ce qui fait tomber le préfixe) ? Les deux noms n'en sont pas. */
function porteJetonConnu(texte) {
    return _porteUnDe(texte, JETONS_PROJECTION);
}

/**
 * Les jetons d'un texte que ce registre NE connaît PAS — « {truc} », ou un
 * badge d'une version plus récente de l'application. Le rendu les laisse en
 * place (un élève les lirait tels quels) ; le gabarit les DIT, sous le palier.
 * Même esprit que `herite` pour un modèle inconnu : rien ne se fait en douce.
 */
function jetonsInconnus(texte) {
    if (typeof texte !== 'string' || !texte) return [];
    var vus = texte.match(/\{[^{}\s]+\}/g) || [];
    var inconnus = [];
    vus.forEach(function(j) {
        // Étape 4c : le jeton d'un calcul (`{calcN}`) se remplit ou part au rendu, il ne reste jamais en place.
        if (JETONS.indexOf(j) === -1 && !/^\{calc[1-9][0-9]{0,3}\}$/.test(j) && inconnus.indexOf(j) === -1) inconnus.push(j);
    });
    return inconnus;
}

/** Échappe une chaîne pour un usage dans une RegExp littérale. */
function _echapperRegExp(texte) {
    return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remplit les jetons d'un texte de palier.
 *
 * ⚠ UN TEXTE SANS JETON CONNU EST RENDU À L'OCTET PRÈS — pas même un `trim`.
 * C'est ce qui garantit que les grilles d'avant ce lot rendent exactement ce
 * qu'elles rendent aujourd'hui (golden #668, vingt cas et une empreinte).
 * Un jeton connu SANS valeur part avec l'espace qui le précède, et rien
 * d'autre — la règle de `rendre` (evaluation-enonces.js) : on ne réécrit
 * jamais la typographie de l'enseignant·e. Un jeton INCONNU reste en place
 * (`jetonsInconnus`).
 */
function remplir(texte, valeurs) {
    var E = _E();
    var calcul = !!(E && E.porteUnCalcul(texte));
    if (!_porteUnDe(texte, JETONS) && !calcul) return (typeof texte === 'string') ? texte : '';
    var v = (valeurs && typeof valeurs === 'object') ? valeurs : {};
    // Étape 4c : les jetons des calculs des phrases (`{calcN}`), par la règle des énoncés — remplis, ou retirés avec leur espace.
    var sortie = calcul ? E.remplirCalculs(texte, v) : texte;
    JETONS.forEach(function(jeton) {
        var cle = jeton.slice(1, -1);
        var brut = v[cle];
        var vide = (brut === undefined || brut === null || brut === '');
        var motif = vide
            ? new RegExp('[ \\t]?' + _echapperRegExp(jeton), 'g')
            : new RegExp(_echapperRegExp(jeton), 'g');
        sortie = sortie.replace(motif, vide ? '' : String(brut));
    });
    return sortie.trim();
}

/**
 * Les valeurs des jetons pour UNE copie — ce que la projection sait par élève
 * (carte du 4 sept., §b), sans rien lire d'autre. Toutes des chaînes ; les
 * nombres passent par `_nb`, comme le seuil affiché dans le gabarit.
 */
function _valeursJetons(x) {
    var params = x.params || {};
    var nom = (typeof params.nomServiceAide === 'string') ? params.nomServiceAide.trim() : '';
    var erreurs = Number(x.erreurs);
    var mots = Number(x.mots);
    var projection = (isFinite(erreurs) && isFinite(mots) && mots > 0 && isFinite(Number(params.motsReference)))
        ? String(Math.round(Number(params.motsReference) * erreurs / mots))
        : '';
    // Les deux noms (lot 3a) : accordés au compte et à l'étendue, par la règle unique des énoncés.
    var n = x.noms;
    var E = _E();
    var accorder = function(k, paire) { return (E && paire) ? E.accorder(k, paire) : ''; };
    // Étape 4c : `x.calculs`, les jetons des calculs des phrases (`formulesAlgo.jetonsDesCalculs`), passés par l'appelant.
    return Object.assign({
        service: nom,
        // `== null` : un critère neuf aux champs vides (lot 3a) ne porte pas la valeur ; jamais « ? ».
        seuil: (params.erreursTolerees == null) ? '' : _nb(params.erreursTolerees),
        longueur: (params.motsReference == null) ? '' : _nb(params.motsReference),
        nomErreurs: n ? accorder(erreurs, n.erreurs) : '',
        nomMots: n ? accorder(mots, n.mots) : '',
        erreurs: isFinite(erreurs) ? _nb(erreurs) : '',
        mots: isFinite(mots) ? _nb(mots) : '',
        // Le nombre du préfixe engendré d'hier. Vide sur le palier « zéro
        // erreur », comme le préfixe l'était.
        moyenne: (x.motsParErreur === null || x.motsParErreur === undefined) ? '' : String(Math.round(x.motsParErreur)),
        // Le NOMBRE seul (« 23 »), pas « 23 erreurs pour 900 mots » : {longueur}
        // existe à côté, et la phrase est celle de l'enseignant·e (arrêté 3).
        projection: projection,
        palier: (x.palier && (x.palier.libelle || x.palier.cle)) || '',
        s: (isFinite(erreurs) && Math.abs(erreurs) > 1) ? 's' : ''
    }, x.calculs || {});
}

/** Formate un nombre pour un libellé (pas de décimale inutile). */
function _nb(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) return '?';
    return _formaterNombre(valeur) || '?';   // #1137 : à la virgule, deux décimales au plus
}

// ---------------------------------------------------------------------
// LES PALIERS D'AUJOURD'HUI — repris de genererRetroactionEUF au mot près
// ---------------------------------------------------------------------
// Chaque palier déclare :
//   cle       identifiant stable, écrit dans les données
//   libelle   mot court, pour la rangée de paliers du PDF (Lot 6)
//   ratioMax  borne INCLUSIVE en ratio normalisé ; null = palier terminal
//   texte     le verdict, texte libre de l'enseignant·e
//   texteAide phrase de recommandation, jointe SEULEMENT si un nom de service
//             est réglé. Séparée du verdict pour qu'un nom vide n'ouvre pas
//             une phrase que rien ne ferme.
//
// ⚠ Les apostrophes sont des apostrophes ASCII, comme dans le code d'origine :
// une apostrophe typographique romprait la reproduction au mot près.
var PALIERS_MIGRATION = [
    {
        cle: 'sans_erreur',
        libelle: 'Sans erreur',
        sansErreur: true,
        ratioMax: null,
        texte: 'En prévision de l\'EUF, l\'absence d\'erreur est exceptionnelle.',
        texteAide: ''
    },
    {
        cle: 'excellent',
        libelle: 'Excellent',
        ratioMax: 0.3,
        texte: 'En prévision de l\'EUF, ce ratio est excellent.',
        texteAide: ''
    },
    {
        cle: 'tres_bien',
        libelle: 'Très bien',
        ratioMax: 0.4,
        texte: 'En prévision de l\'EUF, ce ratio est très bien.',
        texteAide: ''
    },
    {
        cle: 'bien',
        libelle: 'Bien',
        ratioMax: 0.5,
        texte: 'En prévision de l\'EUF, ce ratio est bien.',
        texteAide: ''
    },
    {
        cle: 'risque',
        libelle: 'Risqué',
        ratioMax: 1,
        texte: 'En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec.',
        texteAide: 'Il est recommandé de t\'inscrire au ' + JETON_SERVICE + '.'
    },
    {
        cle: 'echec',
        libelle: 'Échec',
        ratioMax: null,
        texte: 'En prévision de l\'EUF, ce ratio mènerait à un échec automatique.',
        texteAide: 'Il est fortement recommandé de t\'inscrire au ' + JETON_SERVICE + '.'
    }
];

// LES PALIERS D'UN CRITÈRE NEUF QUI FIXE SA LIMITE (lot 3a, 26 oct. 2026) — les textes tranchés par
// Grégoire le 25 oct. à 17 h 19 (`TEXTES-2026-10-25-table-de-cas-a-corriger.md`), au caractère près de
// l'ébauche validée le 26. Ils s'ÉCRIVENT sur le critère au geste « Fixer une limite » (`fixerLimite`) :
// jamais à la lecture, jamais sur un critère sans la marque, qui garde `PALIERS_MIGRATION`.
// Aucune discipline, aucun accord sur les noms de l'enseignant·e, le conditionnel dans l'aide.
// ⚠ LA PRÉPOSITION VOYAGE AVEC LE NOM, PAS AVEC LE CODE : le service vient après un deux-points (une
// apposition), et sans nom de service la phrase s'arrête avant (`_texteDuPalier`).
// Seuils : ceux d'aujourd'hui (30, 40, 50, 100 % de la limite). La clé du terminal est neuve (`au_dela`) :
// un identifiant n'est pas un libellé, mais « échec » n'est plus ce que ce palier dit.
var PALIERS_GABARIT_NEUF = [
    { cle: 'sans_erreur', libelle: 'Aucune occurrence', sansErreur: true, ratioMax: null,
      texte: 'C’est exceptionnel.', texteAide: '' },
    { cle: 'excellent', libelle: 'Excellent', ratioMax: 0.3, texte: 'Ce rapport est excellent.', texteAide: '' },
    { cle: 'tres_bien', libelle: 'Très bien', ratioMax: 0.4, texte: 'Ce rapport est très bien.', texteAide: '' },
    { cle: 'bien', libelle: 'Bien', ratioMax: 0.5, texte: 'Ce rapport est bien.', texteAide: '' },
    { cle: 'risque', libelle: 'Risqué', ratioMax: 1, texte: 'Ce rapport est risqué : il approche de la limite.',
      texteAide: 'Il pourrait être utile de demander de l’aide : ' + JETON_SERVICE + '.' },
    { cle: 'au_dela', libelle: 'Au-delà', ratioMax: null, texte: 'Ce rapport dépasse la limite fixée.',
      texteAide: 'Il serait important de demander de l’aide : ' + JETON_SERVICE + '.' }
];

// ---------------------------------------------------------------------
// LES MODÈLES
// ---------------------------------------------------------------------
// Chaque modèle déclare :
//   id, nom, description  comme pour les modèles de formule (#667)
//   projette              le modèle produit-il un verdict ?
//   parametres            [{cle, type, libelle, aide, defaut, min, max}]
//   paliersParDefaut      les paliers appliqués faute de paliersProjection
//   seuil(params)         le ratio de référence, en mots par erreur
//
// ⚠ « Aucune projection » n'est PAS l'absence de modèle : c'est un modèle qui
// dit non. Les grilles algorithmiques ne servent que sur les rédactions ; là
// où l'enseignant·e n'a rien à dire de l'EUF, il choisit ce modèle. C'est la
// raison pour laquelle AUCUN réglage « afficher ou non » n'est ajouté ailleurs :
// le critère algorithmique est à lui seul le bon déclencheur.
var MODELES = [
    {
        id: 'norme_externe',
        // Lot 4 (4 sept. 2026) — « Projection à l'EUF », décision de Grégoire (contre la
        // recommandation de Cowork, réserve inscrite au cadrage « accordéons » : le modèle
        // est paramétrable et sert toute norme externe). Le NOM seul change ; l'`id`
        // `norme_externe` voyage avec les grilles partagées et ne bouge pas.
        nom: 'Projection à l\'EUF',
        description: 'Situe l\'étudiant·e face à une norme indépendante du cours, exprimée en erreurs tolérées pour une longueur de référence.',
        projette: true,
        parametres: [
            {
                cle: 'motsReference',
                type: 'nombre',
                libelle: 'Longueur de référence de l\'épreuve (mots)',
                aide: 'Longueur du texte demandé par l\'épreuve. 900 mots pour l\'EUF.',
                defaut: 900,
                min: 1,
                max: 100000
            },
            {
                cle: 'erreursTolerees',
                type: 'nombre',
                libelle: 'Erreurs tolérées sur cette longueur',
                aide: 'Nombre d\'erreurs au-delà duquel l\'épreuve est échouée. 30 pour l\'EUF.',
                defaut: 30,
                min: 1,
                max: 10000
            },
            {
                cle: 'nomServiceAide',
                type: 'texte',
                libelle: 'Nom du service d\'aide',
                aide: 'Affiché dans les paliers qui recommandent de s\'y inscrire. Laisser vide pour ne recommander aucun service.',
                defaut: 'Centre d\'aide du collège',
                max: 200
            },
            {
                // #790 — LE LIBELLÉ DU SIGNALEMENT, à côté du nom du service parce qu'il
                // se relit avec lui. Il ne s'adresse PAS à l'élève : c'est ce que
                // l'enseignant voit à côté du palier RàI, pour savoir qui contacter.
                // ⚠ VIDE PAR DÉFAUT, ET C'EST VOULU. Écrire « français » ici en dur
                // rejouerait le code disciplinaire retiré du dépistage — le gabarit
                // « critères EUF » livré en exemple porte la phrase du français parce
                // que c'est SON gabarit, pas parce que le code la connaît.
                cle: 'libelleSignalement',
                type: 'texte',
                libelle: 'Ce que le signalement affiche à l\'enseignant',
                aide: 'Une phrase courte, dans tes mots : « Aide en français recommandée », « Reprise du module 2 à prévoir »… Elle apparaît à côté du palier RàI de l\'étudiant·e, jamais sur sa copie. Laisser vide pour ne lever aucun signalement.',
                defaut: '',
                max: 200
            },
            {
                cle: 'lienServiceAide',
                type: 'texte',
                libelle: 'Lien d\'inscription au service (facultatif)',
                aide: 'Peut rester vide. Une mention de service sans lien est le cas normal, pas un cas incomplet.',
                defaut: '',
                max: 500
            }
        ],
        paliersParDefaut: PALIERS_MIGRATION,
        /** Le seuil, en mots par erreur. 900 / 30 = 30. */
        seuil: function(params) {
            return params.motsReference / params.erreursTolerees;
        }
    },
    {
        id: 'aucune',
        nom: 'Aucune projection',
        description: 'Le critère est noté, mais aucune projection n\'est proposée à l\'étudiant·e. À employer partout où la grille algorithmique ne sert pas une rédaction.',
        projette: false,
        parametres: [],
        paliersParDefaut: [],
        seuil: function() { return null; }
    }
];

// ⚠ C'est le défaut de LECTURE — ce que voit un critère d'avant #668, qui ne porte
// aucun champ. Il ne change pas (lot 4, C.3) : les critères existants gardent leur
// modèle. Le critère NEUF, lui, écrit « aucune » à sa naissance (`gabaritNeuf`,
// `poserDefautNeuf`) : c'est la seule façon de les distinguer.
var MODELE_PAR_DEFAUT = 'norme_externe';

function listerModeles() {
    return MODELES.map(function(m) {
        return { id: m.id, nom: m.nom, description: m.description, projette: m.projette, parametres: m.parametres };
    });
}

function obtenirModele(id) {
    for (var i = 0; i < MODELES.length; i++) if (MODELES[i].id === id) return MODELES[i];
    return null;
}

// ---------------------------------------------------------------------
// Lecture d'un critère
// ---------------------------------------------------------------------

/**
 * Nettoie un paramètre selon sa déclaration. Ne devine jamais : borne.
 * ↻ Lot 3a (consigne § 3.3) : `sansDefaut` — un critère NEUF (`estNeuf`) ne reçoit pas les défauts de
 * l'épreuve de français (900, 30, « Centre d'aide du collège ») : un nombre absent reste `null`, un
 * texte absent reste vide. Les critères existants lisent exactement ce qu'ils lisaient.
 */
function _valeurTexte(p, brut, sansDefaut) {
    var texte = (brut === undefined || brut === null) ? (sansDefaut ? '' : p.defaut) : String(brut);
    if (p.max !== undefined && texte.length > p.max) texte = texte.slice(0, p.max);
    return texte;
}

function _valeurParametre(p, brut, sansDefaut) {
    if (p.type === 'texte') return _valeurTexte(p, brut, sansDefaut);
    var absent = (brut === undefined || brut === null || brut === '');
    if (sansDefaut && (absent || isNaN(Number(brut)))) return null;
    var valeur = absent ? p.defaut : Number(brut);
    if (isNaN(valeur)) valeur = p.defaut;
    if (p.min !== undefined && valeur < p.min) valeur = p.min;
    if (p.max !== undefined && valeur > p.max) valeur = p.max;
    return valeur;
}

function _niveauDuSignalement(valeur) {
    return (valeur === 2 || valeur === 3) ? valeur : null;
}

/** Nettoie un palier venu des données. Un palier illisible est écarté, pas deviné. */
function _paliersRetenus(brut) {
    if (!Array.isArray(brut) || brut.length === 0) return null;
    var propres = [];
    brut.forEach(function(p) {
        if (!p || typeof p !== 'object') return;
        var cle = (typeof p.cle === 'string' && p.cle.trim()) ? p.cle.trim() : '';
        if (!cle) return;
        var max = (p.ratioMax === null || p.ratioMax === undefined || p.ratioMax === '') ? null : Number(p.ratioMax);
        if (max !== null && (isNaN(max) || max <= 0)) max = null;
        propres.push({
            cle: cle,
            libelle: (typeof p.libelle === 'string') ? p.libelle : cle,
            sansErreur: p.sansErreur === true,
            ratioMax: max,
            texte: (typeof p.texte === 'string') ? p.texte : '',
            texteAide: (typeof p.texteAide === 'string') ? p.texteAide : '',
            // #790 — CE PALIER LÈVE-T-IL UN SIGNALEMENT POUR L'ENSEIGNANT ?
            // C'est une CASE SUR LE PALIER, jamais un seuil écrit dans le code : un
            // `ratio <= 0,5` en dur rejouerait exactement le code disciplinaire que
            // #668 a retiré d'ici. L'enseignant de chimie coche les siens.
            // ⚠ `=== true` : un gabarit d'avant le 8 sept. 2026 n'a pas le champ, et
            // un champ absent ne lève rien. Aucune grille existante ne change.
            leveSignalement: p.leveSignalement === true,
            // Lot 3 des seuils (30 oct. 2026) — LE NIVEAU QUE CE PALIER FIXE : 2 ou 3, le choix de l'enseignant·e.
            // Absent d'un gabarit coché avant cette date : aucun défaut, le palier ne fixe rien.
            niveauSignalement: _niveauDuSignalement(p.niveauSignalement)
        });
    });
    if (!propres.length) return null;

    // ORDONNÉ À LA LECTURE, et rendu dans cet ordre. Le verdict se lit « le
    // premier palier dont le seuil est atteint » : une liste réordonnée à la
    // main dans le gabarit rendrait un verdict faux, en silence. On trie donc
    // ici — et `normaliser` rend CETTE liste, celle que le gabarit affichera.
    // Affichage et calcul sortent de la même source : c'est la règle de #667.
    var sansErreur = propres.filter(function(x) { return x.sansErreur; });
    var avecSeuil = propres.filter(function(x) { return !x.sansErreur && x.ratioMax !== null; })
                           .sort(function(a, b) { return a.ratioMax - b.ratioMax; });
    var terminaux = propres.filter(function(x) { return !x.sansErreur && x.ratioMax === null; });
    return sansErreur.concat(avecSeuil, terminaux);
}

/**
 * Lit la projection d'un critère, en migrant à la lecture les critères
 * d'avant #668.
 *
 * @returns {{modeleId, modele, params, paliers, herite}} `herite` dit si le
 *          modèle a été reconstitué faute de champ `modeleProjection`.
 */
function normaliser(critere) {
    critere = critere || {};
    var declare = typeof critere.modeleProjection === 'string' ? critere.modeleProjection.trim() : '';
    var modele = declare ? obtenirModele(declare) : null;
    var herite = false;

    if (!modele) {
        // Critère d'avant #668, ou identifiant venu d'une version plus récente.
        // Dans les deux cas on retombe sur la norme externe — et on le DIT.
        modele = obtenirModele(MODELE_PAR_DEFAUT);
        herite = true;
    }

    var source = (critere.paramsProjection && typeof critere.paramsProjection === 'object')
        ? critere.paramsProjection : {};
    var params = {};
    var neuf = estNeuf(critere);
    modele.parametres.forEach(function(p) {
        params[p.cle] = _valeurParametre(p, source[p.cle], neuf);
    });

    var paliers = _paliersRetenus(critere.paliersProjection) || modele.paliersParDefaut;

    return { modeleId: modele.id, modele: modele, params: params, paliers: paliers, herite: herite };
}

// ---------------------------------------------------------------------
// Calcul
// ---------------------------------------------------------------------

/** Le palier « zéro erreur », s'il y en a un dans la liste. */
function _palierSansErreur(paliers) {
    for (var i = 0; i < paliers.length; i++) if (paliers[i].sansErreur) return paliers[i];
    return null;
}

/** Les paliers ordonnés qui portent un seuil (le terminal en dernier). */
function _paliersDeRatio(paliers) {
    return paliers.filter(function(p) { return !p.sansErreur; });
}

/**
 * Compose le texte d'un palier : verdict, puis recommandation.
 *
 * Étape 2 du texte troué (4 sept. 2026) : les DEUX champs se remplissent. Dans
 * « Ce que l'élève lit » (`texte`), tous les jetons suivent la règle de
 * `remplir` — {service} compris : un nom vide l'efface avec son espace, comme
 * tout jeton sans valeur (décidé seul, dit : la règle de place ci-dessous
 * ferait tomber le VERDICT entier, ce qui est pire qu'une phrase à retoucher).
 * Dans la phrase de recommandation (`texteAide`), {service} RESTE CE QU'IL
 * EST (consigne du 4 sept.) : sa règle de place — apposition ou complément —
 * s'applique d'abord, puis les autres jetons se remplissent.
 */
function _texteDuPalier(palier, params, valeurs) {
    var texte = remplir(palier.texte || '', valeurs);
    var nom = (typeof params.nomServiceAide === 'string') ? params.nomServiceAide.trim() : '';
    var aide = palier.texteAide || '';
    if (!aide) return texte;

    // C'est le JETON QU'ON NE PEUT PAS REMPLIR qui fait tomber la phrase, pas
    // l'absence de nom. Une phrase générique (« le service d'aide de ton
    // collège »), qui ne porte aucun jeton, se rend toujours — c'est le cas du
    // gabarit neuf. Une phrase qui appelle un nom et n'en reçoit aucun part
    // ENTIÈRE, plutôt que de laisser « t'inscrire au . » : un nom vide est une
    // transition en cours, pas un cas dégradé à signaler à l'élève.
    if (aide.indexOf(JETON_SERVICE) !== -1) {
        if (nom) {
            aide = aide.split(JETON_SERVICE).join(nom);
        } else {
            // Nom absent : la façon de retirer le jeton dépend de sa PLACE dans
            // la phrase, et cette place est lisible mécaniquement.
            //   · en apposition (« … de ton collège : {service}. ») la phrase
            //     tient debout sans lui — on retire l'apposition seule ;
            //   · en complément grammatical (« t'inscrire au {service}. ») elle
            //     ne tient pas — on retire la phrase ENTIÈRE, plutôt que de
            //     laisser « t'inscrire au . » sous les yeux d'un élève.
            var apposition = new RegExp('\\s*[:\u2014\u2013-]\\s*' + JETON_SERVICE.replace(/[{}]/g, '\\$&'));
            if (apposition.test(aide)) {
                aide = aide.replace(apposition, '');
            } else {
                return texte;
            }
        }
    }
    aide = remplir(aide, valeurs);
    return texte ? (texte + ' ' + aide) : aide;
}

/**
 * Situe une copie face à la norme externe.
 *
 * @param {object} critere - le critère de grille (porte le modèle et ses paliers)
 * @param {object} donnees - {erreurs, mots}
 * @returns {object} `applicable: false` avec une `raison` nommée quand le code
 *          ne peut pas conclure. Il ne devine jamais un verdict.
 *
 * FIDÈLE À L'EXISTANT, SAUF SUR UN POINT NOMMÉ. Le comportement d'avant #668
 * est reproduit au caractère près partout, à une exception documentée : le
 * besoin en mots de la projection passe AVANT le palier zéro erreur. Voir la
 * déviation nommée dans le corps de la fonction, et §6bis de la consigne.
 */
function calculer(critere, donnees) {
    var p = normaliser(critere);
    var erreurs = Number(donnees && donnees.erreurs);
    var mots = Number(donnees && donnees.mots);
    if (isNaN(erreurs)) erreurs = 0;
    if (isNaN(mots)) mots = 0;
    // Étape 4c : les valeurs des calculs des phrases de la copie (`formulesAlgo.jetonsDesCalculs`) ; absentes, leurs jetons partent.
    var calculs = (donnees && donnees.calculs && typeof donnees.calculs === 'object') ? donnees.calculs : null;

    var base = {
        modeleId: p.modeleId,
        params: p.params,
        paliers: p.paliers,
        herite: p.herite,
        lienServiceAide: (typeof p.params.lienServiceAide === 'string') ? p.params.lienServiceAide.trim() : ''
    };

    if (!p.modele.projette) {
        return _nonApplicable(base, 'projection-desactivee');
    }

    // Lot 3a (§ 3.3) : la limite d'un critère neuf naît vide. Tant que la longueur ou la tolérance manque,
    // AUCUNE copie n'atteint de palier — pas même « Aucune occurrence ». Un critère existant a toujours ses
    // deux nombres (défauts bornés à 1) : cette garde ne le touche pas.
    if (!(Number(p.params.motsReference) > 0 && Number(p.params.erreursTolerees) > 0)) {
        return _nonApplicable(base, 'limite-incomplete');
    }
    base.noms = (function() { var E = _E(); return E ? E.noms(critere) : null; })();

    // ⚠ DÉVIATION NOMMÉE — LE BESOIN EN MOTS DE LA PROJECTION EST INCONDITIONNEL.
    //
    // L'ancienne fonction testait `erreurs === 0` AVANT `mots === 0` : une copie
    // sans aucun mot saisi, et sans erreur, recevait « l'absence d'erreur est
    // exceptionnelle ». C'était sans conséquence tant que le site d'appel
    // coupait sur `if (mots === 0) return;` — le cas était MORT.
    //
    // #667 l'a rendu vivant, le matin même : la garde du mode simple est passée
    // à `if (motsRequisSimple && mots === 0)`, où `motsRequisSimple` vient de
    // `modele.utiliseMots` — et le modèle neuf `penalite_par_erreur` porte
    // `utiliseMots: false`. Un critère où l'enseignant·e a dit « la longueur ne
    // compte pas ici », sans un mot saisi, annonçait donc à l'élève que son
    // absence d'erreur est exceptionnelle EN PRÉVISION D'UNE ÉPREUVE CALIBRÉE
    // SUR UN NOMBRE DE MOTS.
    //
    // ⮕ `utiliseMots` est un attribut du modèle de NOTE. La projection a son
    // propre besoin en mots, et il ne dépend d'aucune formule : « 1 erreur /
    // N mots » n'a aucun sens sans N. La garde vit donc ICI, au-dessus du palier
    // zéro — corriger au site d'appel reconduirait le couplage que #667 a créé
    // par accident, et le registre porterait une règle que son appelant
    // contredit.
    //
    // C'est la SEULE ligne du golden qui bouge, et elle porte sa justification
    // dans le fichier de test. Voir §6bis de la consigne.
    if (mots <= 0) return _nonApplicable(base, 'mots-absents');
    if (erreurs < 0) return _nonApplicable(base, 'erreurs-negatives');

    var sansErreur = _palierSansErreur(p.paliers);
    if (erreurs === 0) {
        if (!sansErreur) return _nonApplicable(base, 'palier-zero-erreur-absent');
        return _resultat(base, {
            applicable: true, ratio: 0, motsParErreur: null,
            palier: sansErreur, indice: 0, params: p.params, erreurs: erreurs, mots: mots, noms: base.noms, calculs: calculs
        });
    }

    var seuilMotsParErreur = p.modele.seuil(p.params);
    if (!seuilMotsParErreur || !isFinite(seuilMotsParErreur)) {
        return _nonApplicable(base, 'seuil-indeterminable');
    }

    // ratio = seuil / motsParErreur, écrit sans la division intermédiaire.
    // ratio = 1 : exactement au seuil. ratio > 1 : sous le seuil.
    var ratio = seuilMotsParErreur * erreurs / mots;
    var motsParErreur = mots / erreurs;

    var echelonnes = _paliersDeRatio(p.paliers);
    if (echelonnes.length === 0) return _nonApplicable(base, 'paliers-absents');

    var choisi = null;
    var indice = echelonnes.length - 1;
    for (var i = 0; i < echelonnes.length; i++) {
        if (echelonnes[i].ratioMax !== null && ratio <= echelonnes[i].ratioMax) {
            choisi = echelonnes[i];
            indice = i;
            break;
        }
    }
    if (!choisi) choisi = echelonnes[echelonnes.length - 1];

    return _resultat(base, {
        applicable: true, ratio: ratio, motsParErreur: motsParErreur,
        palier: choisi, indice: indice, params: p.params, erreurs: erreurs, mots: mots,
        seuilMotsParErreur: seuilMotsParErreur, noms: base.noms, calculs: calculs
    });
}

function _nonApplicable(base, raison) {
    return {
        applicable: false, raison: raison,
        ratio: null, motsParErreur: null, palier: null, indicePalier: -1,
        texte: '', prefixe: '', compose: false, jetons: null,
        modeleId: base.modeleId, params: base.params, paliers: base.paliers,
        herite: base.herite, lienServiceAide: base.lienServiceAide
    };
}

/**
 * Le préfixe engendré — « Tu fais en moyenne 1 erreur à chaque N mots. ». ↻ Lot 3a (consigne § 3.6, la
 * supposition 6 de l'ébauche, la seule qui touche ce que lit l'étudiant·e) : les noms de l'enseignant·e,
 * même structure — le singulier de ce qu'il compte, l'étendue accordée à N (`enoncesAlgo.accorder`).
 * ⚠ UN CRITÈRE QUI LIT « erreur » ET « mot » LIT LA PHRASE D'HIER, À L'OCTET (« 1 mots » compris) : le
 * critère d'avant sans noms, comme celui qui a écrit ces quatre formes.
 */
function prefixeMoyenne(n, noms) {
    var hier = 'Tu fais en moyenne 1 erreur à chaque ' + n + ' mots.';
    var E = _E();
    if (!noms || !E) return hier;
    var francais = noms.erreurs.singulier === 'erreur' && noms.erreurs.pluriel === 'erreurs'
        && noms.mots.singulier === 'mot' && noms.mots.pluriel === 'mots';
    if (francais) return hier;
    return 'Tu fais en moyenne 1 ' + noms.erreurs.singulier + ' à chaque ' + n + ' ' + E.accorder(n, noms.mots) + '.';
}

function _resultat(base, x) {
    var valeurs = _valeursJetons(x);
    // Le préfixe est ENGENDRÉ : il porte la mesure, jamais un verdict. Il est
    // absent du palier « zéro erreur », comme aujourd'hui.
    //
    // ↻ DÉCISION DE GRÉGOIRE (4 sept. 2026, 17 h 15) : une phrase SANS AUCUN
    // jeton connu garde le préfixe tel quel — les grilles existantes ne
    // changent pas ; dès qu'elle en porte un, elle est ENTIÈRE, et {moyenne}
    // remet la mesure où l'enseignant·e la veut. Le discriminant est « aucun
    // jeton CONNU », pas « aucune accolade » : un {truc} inconnu ne fait pas
    // tomber le préfixe. Il ne lit que « Ce que l'élève lit » (`texte`) : une
    // recommandation composée sous un verdict d'hier garde le préfixe d'hier.
    var compose = porteJetonConnu(x.palier.texte || '');
    var prefixe = (x.motsParErreur === null || compose) ? '' : prefixeMoyenne(Math.round(x.motsParErreur), x.noms);
    var verdict = _texteDuPalier(x.palier, x.params, valeurs);
    var texte = prefixe ? (verdict ? prefixe + ' ' + verdict : prefixe) : verdict;

    return {
        applicable: true, raison: '',
        ratio: x.ratio,
        motsParErreur: x.motsParErreur,
        seuilMotsParErreur: (x.seuilMotsParErreur === undefined) ? null : x.seuilMotsParErreur,
        palier: x.palier,
        indicePalier: x.indice,
        prefixe: prefixe,
        texte: texte,
        compose: compose,
        jetons: valeurs,
        modeleId: base.modeleId, params: base.params, paliers: base.paliers,
        herite: base.herite, lienServiceAide: base.lienServiceAide
    };
}

// ---------------------------------------------------------------------
// Libellés pour le gabarit
// ---------------------------------------------------------------------

/**
 * Le seuil dit dans les DEUX unités — comme libelleSymbolique dit la formule.
 * ↻ Lot 3a (§ 3.6) : avec `noms` (`enoncesAlgo.noms`), les noms de l'enseignant·e, accordés ; sans eux,
 * la ligne d'hier. Une limite incomplète (critère neuf) ne dit rien.
 */
function libelleSeuil(critere, noms) {
    var p = normaliser(critere);
    if (!p.modele.projette) return '';
    if (!(Number(p.params.motsReference) > 0 && Number(p.params.erreursTolerees) > 0)) return '';
    var seuil = p.modele.seuil(p.params);
    if (!seuil || !isFinite(seuil)) return '';
    var E = _E();
    if (!noms || !E) {
        return '1 erreur à chaque ' + _nb(seuil) + ' mots ('
            + _nb(p.params.erreursTolerees) + ' erreurs pour ' + _nb(p.params.motsReference) + ' mots)';
    }
    var t = p.params.erreursTolerees, l = p.params.motsReference;
    return '1 ' + noms.erreurs.singulier + ' à chaque ' + _nb(seuil) + ' ' + E.accorder(seuil, noms.mots) + ' ('
        + _nb(t) + ' ' + E.accorder(t, noms.erreurs) + ' pour ' + _nb(l) + ' ' + E.accorder(l, noms.mots) + ')';
}

/** La limite est-elle fixée (le critère projette) ? */
function limiteFixee(critere) {
    return !!normaliser(critere).modele.projette;
}

/** La limite fixée a-t-elle ses deux nombres (longueur et tolérance au-dessus de 0) ? Sans limite : vrai. */
function limiteComplete(critere) {
    var p = normaliser(critere);
    if (!p.modele.projette) return true;
    return Number(p.params.motsReference) > 0 && Number(p.params.erreursTolerees) > 0;
}

/**
 * « Fixer une limite » (lot 3a, § 3.1-3.4) — remplace le choix du modèle « Projection à l'EUF » au menu.
 * Trois cas, dans cet ordre :
 *   · le critère garde ce que « Retirer la limite » a laissé (paramètres ou paliers écrits) : on le
 *     RETROUVE, tel quel ;
 *   · un critère NEUF (`estNeuf`) : des champs vides (ni 900, ni 30, ni « Centre d'aide du collège ») et
 *     les paliers du 25 oct. (`PALIERS_GABARIT_NEUF`), écrits sur le critère ;
 *   · un critère existant : ce que le menu faisait — les défauts du modèle, les paliers de migration
 *     (lus, pas écrits).
 * Rend le critère, muté.
 */
function fixerLimite(critere) {
    critere = critere || {};
    var garde = (critere.paramsProjection && typeof critere.paramsProjection === 'object'
        && Object.keys(critere.paramsProjection).length > 0) || !!_paliersRetenus(critere.paliersProjection);
    if (garde) {
        critere.modeleProjection = 'norme_externe';
        return critere;
    }
    if (estNeuf(critere)) {
        appliquerAuCritere(critere, 'norme_externe', {}, paliersGabaritNeuf());
        return critere;
    }
    appliquerAuCritere(critere, 'norme_externe', null, null);
    delete critere.paliersProjection;
    return critere;
}

/**
 * « Retirer la limite » (lot 3a, § 3.1) — le critère cesse de projeter ; ce qui est écrit RESTE (longueur,
 * tolérance, service, signalement, lien, paliers) : « Fixer une limite » le retrouve. Grégoire : « je ne
 * veux pas qu'on efface des données de façon irréversible ». Sous « aucune », `normaliser` ignore ces
 * paramètres (le modèle n'en déclare aucun), `calculer` ne projette rien ; l'export et le partage les
 * acceptent (leurs schémas ne dépendent pas du modèle).
 */
function retirerLimite(critere) {
    critere = critere || {};
    critere.modeleProjection = 'aucune';
    return critere;
}

/** Le seuil d'un palier en POURCENTAGE de la limite, pour l'écran (arrondi au dixième) ; null sans seuil. */
function pourcentDuRatio(ratioMax) {
    if (ratioMax === null || ratioMax === undefined || ratioMax === '') return null;
    var r = Number(ratioMax);
    if (!isFinite(r)) return null;
    return Math.round(r * 1000) / 10;
}

/**
 * Le ratio enregistré (`ratioMax`) d'un pourcentage saisi : virgule ou point décimal, arrondi au
 * dixième de pour cent. ≤ 0 ou illisible : null — le geste est refusé, rien n'est écrit.
 */
function ratioDuPourcent(saisie) {
    var t = String(saisie == null ? '' : saisie).trim().replace(/\s|%/g, '').replace(',', '.');
    if (!t || !/^-?\d*\.?\d+$/.test(t)) return null;
    // En millièmes, pour que l'arrondi tombe juste (« 33,3 » donne 0,333, pas 0,33299…).
    var milliemes = Math.round(Number(t) * 10);
    if (!isFinite(milliemes) || milliemes <= 0) return null;
    return milliemes / 1000;
}

/**
 * Traduit un seuil en ratio vers des mots par erreur — l'unité que l'utilisateur
 * comprend. Le gabarit affiche les deux ; seul le ratio est stocké.
 */
function motsParErreurDuRatio(critere, ratioMax) {
    var p = normaliser(critere);
    if (!p.modele.projette || ratioMax === null || ratioMax === undefined) return null;
    var seuil = p.modele.seuil(p.params);
    var r = Number(ratioMax);
    if (!seuil || !isFinite(seuil) || isNaN(r) || r <= 0) return null;
    return seuil / r;
}

/**
 * Écrit le modèle, ses paramètres et ses paliers sur le critère. Le gabarit
 * appelle ceci ; le module ne touche jamais aux données de son propre chef.
 */
function appliquerAuCritere(critere, modeleId, params, paliers) {
    critere = critere || {};
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    critere.modeleProjection = modele.id;

    var source = (params && typeof params === 'object') ? params : {};
    var propres = {};
    var neuf = estNeuf(critere);
    modele.parametres.forEach(function(p) {
        var v = _valeurParametre(p, source[p.cle], neuf);
        // Un champ vide d'un critère neuf n'est pas ÉCRIT (lot 3a) : l'absence voyage sans `null`, que les
        // schémas d'import et de partage ne connaissent pas pour ces nombres.
        if (v !== null) propres[p.cle] = v;
    });
    critere.paramsProjection = propres;

    var retenus = _paliersRetenus(paliers);
    if (retenus) {
        critere.paliersProjection = retenus;
    } else if (!_paliersRetenus(critere.paliersProjection)) {
        // Aucun palier réglé, ni fourni ni déjà présent : on laisse le champ
        // ABSENT plutôt que d'écrire une copie des défauts. La migration à la
        // lecture s'en charge, et les défauts restent modifiables d'un seul
        // endroit.
        delete critere.paliersProjection;
    }
    return critere;
}

/** Les paliers d'un gabarit neuf — sans nom d'établissement. Voir l'en-tête. */
function paliersGabaritNeuf() {
    return JSON.parse(JSON.stringify(PALIERS_GABARIT_NEUF));
}

/**
 * Le fragment qu'un critère algorithmique NEUF écrit à sa naissance.
 *
 * ↻ LOT 4, C.3 — DÉCISION DE GRÉGOIRE (4 sept. 2026, 15 h 40) : « Par défaut, c'est
 * réglé à “sans projection” ». Un collègue de philosophie ne reçoit plus l'EUF
 * (900 mots / 30 erreurs) comme point de départ ; la norme externe se CHOISIT au
 * menu, et arrive alors avec ses défauts déclarés (`appliquerAuCritere`).
 *
 * ⚠ Pourquoi ce n'est PAS le défaut du modèle. `normaliser` ne peut pas
 * distinguer un critère d'avant #668 d'un critère tout neuf : les deux n'ont
 * aucun champ de projection. Le défaut déclaré (`MODELE_PAR_DEFAUT`) est donc ce
 * que lit TOUT critère existant — il ne change pas, les critères existants
 * gardent leur modèle — ; le critère neuf, lui, ÉCRIT son choix. TARIR N'EST PAS
 * RÉPARER : la source seulement, jamais le stock.
 *
 * ▣ MESURÉ le 4 sept. : jusqu'à ce lot, cette fonction n'avait AUCUN appelant
 * dans l'application — le « gabarit livré » (EUF, 900 / 30, paliers en apposition
 * `PALIERS_GABARIT_NEUF`) n'a jamais été écrit sur le critère de personne ; un
 * critère neuf lisait le repli de migration comme les anciens.
 * ↻ Lot 3a (26 oct. 2026) : ce qu'un critère neuf reçoit quand il fixe sa limite est décidé — des champs
 * vides et les paliers du 25 oct. (`fixerLimite`, `PALIERS_GABARIT_NEUF`).
 */
function gabaritNeuf() {
    return { modeleProjection: 'aucune', paramsProjection: {} };
}

/**
 * Pose le fragment neuf sur un critère qui DEVIENT algorithmique (naissance,
 * changement de type) et n'a pas encore choisi de modèle. Jamais à la lecture,
 * jamais sur un critère qui porte déjà un choix. Rend le critère, muté.
 */
function poserDefautNeuf(critere) {
    if (!critere || critere.type !== 'algorithmique') return critere;
    if (typeof critere.modeleProjection === 'string' && critere.modeleProjection.trim()) return critere;
    return Object.assign(critere, gabaritNeuf());
}

// ↻ Lot 3a (26 oct. 2026) : `copiesExemple` (une copie fictive par palier, pour la ligne « L'élève lira : »
// sous chaque palier) est RETIRÉE avec cette ligne. La simulation de l'atelier règle sa copie sur un palier
// (« Voir ce que l'étudiant·e lirait à ce palier », `atelierAlgo.copiePourPalier`), par le même `calculer`.

/** Les paliers de migration — reproduction au mot près de l'existant. */
function paliersMigration() {
    return JSON.parse(JSON.stringify(PALIERS_MIGRATION));
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    MODELE_PAR_DEFAUT: MODELE_PAR_DEFAUT,
    JETON_SERVICE: JETON_SERVICE,
    JETONS: JETONS.slice(),
    listerReperes: listerReperes,
    porteJetonConnu: porteJetonConnu,
    jetonsInconnus: jetonsInconnus,
    remplir: remplir,
    listerModeles: listerModeles,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    calculer: calculer,
    libelleSeuil: libelleSeuil,
    motsParErreurDuRatio: motsParErreurDuRatio,
    appliquerAuCritere: appliquerAuCritere,
    paliersGabaritNeuf: paliersGabaritNeuf,
    estNeuf: estNeuf,
    prefixeMoyenne: prefixeMoyenne,
    limiteFixee: limiteFixee,
    limiteComplete: limiteComplete,
    fixerLimite: fixerLimite,
    retirerLimite: retirerLimite,
    pourcentDuRatio: pourcentDuRatio,
    ratioDuPourcent: ratioDuPourcent,
    gabaritNeuf: gabaritNeuf,
    poserDefautNeuf: poserDefautNeuf,
    paliersMigration: paliersMigration
};

if (typeof window !== 'undefined') window.projectionAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
