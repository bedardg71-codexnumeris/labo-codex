/* ===============================
   MODULE CODES-ANNOTATION — la liste des codes d'annotation d'une copie

   ⚠ NOMENCLATURE, arrêtée par Grégoire le 3 septembre 2026 : « Les CODES sont
   des numéros auxquels on associe un type d'erreur ou un commentaire ; les
   TAMPONS servent à la rétroaction. Le tampon commente le travail, tandis que
   le code identifie des éléments de ce travail, associés aux critères
   d'évaluation. » Ce module ne connaît que les CODES — ① Syntaxe, ② Accord…,
   numérotés, comptés, rattachés aux critères. Les tampons (Repérage, Rupture,
   Relation… : `#travaux-palette-tampons`, `AUTOCOLLANTS`) sont une autre
   palette, hors d'ici.

   RAISON D'ÊTRE (3 septembre 2026 — cadrage « les codes cessent d'être une
   liste de français, longue de dix »)
   Les codes d'erreur qu'on pose sur une copie étaient DIX, écrits dans le code
   source (`travaux-outils.js`), et ils disaient le français : un enseignant de
   philosophie qui voulait poser « thèse non dégagée » n'avait aucun chemin.
   Or la grille portait DÉJÀ une liste par code : les SOUS-CRITÈRES de son
   critère algorithmique — {code, nom, pondération, rétroaction} — que
   l'évaluation lit par le code (`evaluation-calcul.js`, mode « catégories »).
   Deux listes, alignées à la main par le numéro. Décision de Grégoire, le
   3 septembre : « les codes sont les sous-critères ».

   CE QUE CE MODULE REND — une seule source de lecture
     listeCodes(grille)     les codes de CETTE grille, dans l'ordre d'affichage
     code(grille, id)       l'entrée d'un identifiant posé, JAMAIS null
     estActive(grille)      le drapeau est posé ET au moins un sous-critère pèse
     apercuCodes(critere)   ce que les sous-critères donneraient, geste ou non (gabarit)
     grilleDeCopie(fichier) la grille d'une copie, via sa production, ou null
     sommePonderee(grille, compteurs) la somme des codes posés, chacun à son poids

   Chaque code : { id, code, numero, nom, couleur, retroaction, source, poids }
     id        ce qui est écrit sur la copie : `errfr_<code>`. ⚠ LE PRÉFIXE RESTE,
               ET C'EST DIT PLUTÔT QUE RENOMMÉ : il vit dans les annotations déjà
               posées, un identifiant n'est pas un libellé, et personne ne le lit.
     numero    ce que l'élève voit dans le cercle. Sous une grille activée, c'est
               le CODE du sous-critère ; en repli, la POSITION dans l'ordre
               personnalisé — exactement hier (`dessinerErreurFrancais`, le
               curseur, le PDF et la palette suivaient tous l'ordre, pas l'id).
     poids     ce que pèse un code posé dans la formule (décision de Grégoire,
               21 oct. 2026, 8 h 38) : la pondération de son sous-critère sous une
               grille activée ; 1 en repli et pour un code inconnu — comme hier.

   LE REPLI = HIER, AU CARACTÈRE PRÈS
   Une grille sans le geste d'activation (`codesDepuisSousCriteres`), une copie
   orpheline, une grille sans critère algorithmique : les dix codes d'hier, avec
   les quatre clés globales que l'écran Annoter › palette continue de régler —
   `personnalisationErreursFr` (noms, couleurs), `ordreErreursFr`,
   `retroactionsErreursFr` (textes) ; `errfrModeSynthese` reste à son écran.
   ⛔ Ce module ne les ÉCRIT jamais. Tarir n'est pas réparer, et ici il n'y a
   rien à tarir : sans geste, rien ne change pour personne.

   ⚠ ACTIVATION PAR GESTE, PARTOUT — décision de Grégoire (3 sept.). Sans elle,
   la palette lirait ses sous-critères dès la livraison : ses codes prendraient
   les noms courts de sa grille et ses élèves liraient les rétroactions de la
   grille au lieu de ses textes personnalisés. Ce que les élèves lisent ne change
   pas sans qu'il l'ait voulu.

   ⚠ UN CRITÈRE NÉ DEPUIS LE 21 OCTOBRE 2026 NE REÇOIT PLUS LE REPLI (consigne
   `CONSIGNE-LOT-2026-10-21-critere-algorithmique-etape-0.md` ; principe de Grégoire,
   9 h 20 : « ne rien coder en dur en fonction d'une discipline précise »). Les dix
   codes du repli sont ceux du français : un critère de chimie les recevait. Un
   critère qui DEVIENT algorithmique (naissance, changement de type) porte la
   MARQUE `codesSousCriteresSeulement` (`marquerNeuf`, posée par `grilles.js` au
   même geste que `projectionAlgo.poserDefautNeuf`) : ses codes sont ses
   sous-critères, et seulement eux — sans sous-critère, aucun code, et la palette
   d'Annoter le dit. ▣ Une clé NEUVE, pas `codesDepuisSousCriteres` : mesuré, un
   critère existant qui porte ce drapeau sans sous-critère qui pèse retombe sur le
   repli (ci-dessous) — le réutiliser aurait changé ce stock. Lecteurs de la
   marque : ce module seul (`estActive`, `donneSesCodes`), et le gabarit qui
   montre la case d'activation. ⛔ TARIR N'EST PAS RÉPARER : un critère existant
   n'a pas la marque et garde le repli, les codes déjà posés gardent leurs noms.
   ⚠ UN SOUS-CRITÈRE DE PONDÉRATION 0 N'EST PAS UN CODE — supposition nommée,
   une ligne à retourner : « 0 — Aucune erreur » (pondération 0) n'a aucun sens
   posé sur une copie.

   Lecture seule : `db.getSync` sur les clés globales, jamais d'écriture.
   Testable en Node avec un faux `db`.
   =============================== */

(function() {
'use strict';

var PREFIXE = 'errfr_';
var DRAPEAU = 'codesDepuisSousCriteres';
var MARQUE = 'codesSousCriteresSeulement';   // 21 oct. 2026 — voir l'en-tête

// ---------------------------------------------------------------------
// LE REPLI — les dix codes d'hier, repris de travaux-outils.js au caractère
// près (`CODES_ERREURS_FR` :557-568 pour id, code et nom ; `OUTILS.errfr_*`
// :276-285 pour la couleur). ⚠ Ne pas uniformiser les apostrophes :
// « d’usage » porte une apostrophe typographique, comme hier.
// ⚠ Le NOM COURT que portaient les dix entrées d'OUTILS (« Accord dans le
// GN »…) n'a pas été repris : mesuré le 3 sept. 2026 sur la relecture croisée
// de Cowork, aucun écran ne le lisait, et la personnalisation ne le touchait
// pas. Un code n'a qu'un nom, celui que la liste rend.
// ---------------------------------------------------------------------
var REPLI_DEFAUT = [
    { id: 'errfr_1',  code: 1,  nom: 'Construction syntaxique / accord du verbe',  couleur: '#c62828' },
    { id: 'errfr_2',  code: 2,  nom: 'Subordonnée employée seule',        couleur: '#c62828' },
    { id: 'errfr_3',  code: 3,  nom: 'Ponctuation / guillemets', couleur: '#e65100' },
    { id: 'errfr_4',  code: 4,  nom: 'Accord dans le groupe du nom',        couleur: '#1565c0' },
    { id: 'errfr_5',  code: 5,  nom: 'Accord du pronom / lien avec son antécédent',         couleur: '#1565c0' },
    { id: 'errfr_6',  code: 6,  nom: 'Accord du participe passé',       couleur: '#1565c0' },
    { id: 'errfr_7',  code: 7,  nom: 'Mot invariable',           couleur: '#7b1fa2' },
    { id: 'errfr_8',  code: 8,  nom: 'Déterminant',              couleur: '#7b1fa2' },
    { id: 'errfr_9',  code: 9,  nom: 'Vocabulaire / anglicisme', couleur: '#2e7d32' },
    { id: 'errfr_10', code: 10, nom: 'Orthographe d’usage / typographie',       couleur: '#2e7d32' }
];

// Les couleurs des dix, par position : c'est ce qu'un sous-critère sans
// couleur reçoit sous une grille activée (le 11e code reprend la première).
var COULEURS_DEFAUT = REPLI_DEFAUT.map(function(t) { return t.couleur; });

// Les rétroactions par défaut des dix codes — DÉPLACÉES de travaux-outils.js
// (`RETROACTIONS_ERREURS_FR_DEFAUT`), texte pour texte. Ce sont des phrases que
// des élèves lisent : elles ne se retouchent pas au jugement d'une session.
var RETROACTIONS_DEFAUT = {
    'errfr_1':  "La plupart des erreurs concernent la construction syntaxique (sujet, prédicat, complément de phrase ou autres compléments) ou l'accord du verbe (accord avec le sujet, conjugaison, etc.). Il arrive que certaines phrases sont incomplètes ou confuses, ou encore que le lien entre le verbe et son sujet soit erroné. Vérifie que chaque phrase a bien un sujet et un verbe (et parfois un complément) en les identifiant dans l'interligne. Assure-toi qu'il n'y a pas trop de compléments (ce qui pourrait rendre la phrase confuse). Vérifie également la conjugaison et l'accord des verbes en utilisant des tableaux de conjugaison.",
    'errfr_2':  "La plupart des erreurs sont causées par des subordonnées employées seules. Elles sont construites comme des compléments qui ne se rattachent à aucun prédicat. Relis la phrase pour vérifier sa clarté et assure-toi que chaque subordonnée est rattachée à une phrase principale par un mot de liaison. On peut parfois aussi ajuster la ponctuation pour y remédier.",
    'errfr_3':  "La plupart des erreurs concernent l'utilisation de la ponctuation. Elle peut être relative au coordonnant, au complément de phrase, au complément du nom, à l'organisateur textuel, à une énumération (dont la juxtaposition de phrases) ou encore à une citation. La ponctuation fautive vient embrouiller la structure et la clarté des idées. Vérifie les règles de ponctuation pour les différents types de phrases et de propositions. Certaines conjonctions rendent obligatoire l'usage de la virgule. Utilise des guides de ponctuation pour vérifier cet usage.",
    'errfr_4':  "La plupart des erreurs concernent l'accord en genre et en nombre dans le groupe du nom (déterminant, nom, adjectif). Il devient plus difficile de comprendre le lien entre les mots si ces accords ne sont pas faits. Identifie dans l'interligne le genre et le nombre du nom, puis assure-toi que tous les éléments du groupe concordent.",
    'errfr_5':  "La plupart des erreurs concernent l'accord du pronom ou le lien avec son antécédent. Il devient plus difficile de comprendre l'objet dont on parle ou ce à quoi on fait référence quand il y a de l'ambiguïté sur ce plan. Relis ta phrase pour clarifier à quoi ou à qui chaque pronom se réfère. Assure-toi qu'il n'y a pas d'autres noms qui pourraient faire écran entre les deux. Vérifie le lien du pronom avec son antécédent et assure-toi que l'accord est correct.",
    'errfr_6':  "La plupart des erreurs concernent l'accord du participe passé. Révise les règles d'accord du participe passé avec avoir (accord avec le COD s'il est placé avant) et avec être (accord avec le sujet). Identifie ces éléments dans l'interligne, fais des flèches et vérifie les accords.",
    'errfr_7':  "La plupart des erreurs concernent les mots invariables, plus précisément l'usage de la préposition, de l'adverbe ou de la conjonction. L'orthographe de ces mots ne change jamais. Consulte les listes de mots invariables et l'usage qu'on en fait. Vérifie surtout le sens de ces mots, car ils sont parfois confondus les uns avec les autres.",
    'errfr_8':  "La plupart des erreurs concernent l'usage du déterminant. Choisis le déterminant approprié en fonction du nom et du contexte, puis vérifie qu'il concorde en genre et en nombre avec le nom qu'il accompagne.",
    'errfr_9':  "La plupart des erreurs concernent le vocabulaire, c'est-à-dire le sens d'un mot ou son utilisation dans un certain contexte. L'utilisation inexacte d'une citation entre aussi dans cette catégorie. Utilise systématiquement un dictionnaire pour vérifier le sens des mots. Surtout, méfie-toi des synonymes parce qu'ils renvoient toujours à un contexte très précis qui n'est peut-être pas celui dans lequel tu écris. Vérifie tes citations en les relisant attentivement dans l'œuvre. Évite les anglicismes (dû à, mettre l'emphase, canceller).",
    'errfr_10': "La plupart des erreurs concernent l'orthographe d'usage (lettre, chiffre) ou des éléments de typographie (majuscule, minuscule, soulignement, italique, etc.). Relis ton texte et vérifie systématiquement dans le dictionnaire les mots dont l'orthographe est incertain. Dans le cas de mots étrangers ou de noms de personnages, relis bien ton œuvre. N'oublie pas également que les titres d'œuvres ou de chapitres requièrent respectivement l'italique ou le soulignement (les guillemets fonctionnent aussi)."
};

// ---------------------------------------------------------------------
// Lecture — jamais d'écriture
// ---------------------------------------------------------------------

function _lire(cleBrute, defaut) {
    try {
        if (typeof db !== 'undefined' && db && typeof db.getSync === 'function') {
            return db.getSync(cleBrute, defaut);
        }
    } catch (e) { /* une clé illisible vaut son défaut */ }
    return defaut;
}

/** Les données namespacées d'un nom (productions, grillesTemplates…), en mode réel ou démo. */
function _donnees(nom) {
    try {
        if (typeof obtenirDonneesSelonMode === 'function') return obtenirDonneesSelonMode(nom) || [];
        var k = (typeof cle === 'function') ? cle(nom) : nom;
        return _lire(k, []) || [];
    } catch (e) {
        return [];
    }
}

function _critereAlgo(grille) {
    var trouver = (typeof window !== 'undefined' && window.enoncesAlgo
        && typeof window.enoncesAlgo.critereAlgorithmique === 'function')
        ? window.enoncesAlgo.critereAlgorithmique : null;
    // Sans le registre #581 (chargé avant ce module par index.html), aucune
    // grille n'a de critère lisible : on retombe sur le repli, jamais sur une
    // devinette.
    return trouver ? trouver(grille) : null;
}

// ---------------------------------------------------------------------
// Le repli — hier, au caractère près
// ---------------------------------------------------------------------

/**
 * L'ordre des dix : `ordreErreursFr` s'il porte exactement dix entrées,
 * sinon l'ordre de départ — la règle d'`obtenirOrdreErreursFr` d'hier.
 */
function _ordreRepli() {
    var ids = REPLI_DEFAUT.map(function(t) { return t.id; });
    var ordre = _lire('ordreErreursFr', null);
    if (Array.isArray(ordre) && ordre.length === ids.length) return ordre.slice();
    return ids;
}

function _repli() {
    var pers = _lire('personnalisationErreursFr', null) || {};
    var textes = _lire('retroactionsErreursFr', null) || RETROACTIONS_DEFAUT;
    var parId = {};
    REPLI_DEFAUT.forEach(function(t) { parId[t.id] = t; });
    // Un identifiant inconnu dans l'ordre enregistré est ignoré, comme hier
    // (`obtenirCodesOrdonnes` filtrait). Le numéro suit la liste FILTRÉE.
    var liste = [];
    _ordreRepli().forEach(function(id) {
        var t = parId[id];
        if (!t) return;
        var p = pers[id] || {};
        liste.push({
            id: t.id,
            code: t.code,
            numero: String(liste.length + 1),
            nom: p.nom ? p.nom : t.nom,
            couleur: p.couleur ? p.couleur : t.couleur,
            retroaction: (typeof textes[id] === 'string') ? textes[id] : '',
            source: 'repli',
            poids: 1
        });
    });
    return liste;
}

// ---------------------------------------------------------------------
// La grille — ses sous-critères sont ses codes
// ---------------------------------------------------------------------

// Ce qu'un code peut être pour vivre dans un identifiant `errfr_<code>`, dans un
// attribut `data-*` et dans un sélecteur CSS : lettres, chiffres, tiret,
// souligné, vingt caractères au plus (la borne des deux schémas). Relecture
// croisée du 3 sept. 2026 : `sc.code` est un champ libre du gabarit ; un « " »
// dedans cassait un attribut de la palette et faisait lever le sélecteur des
// compteurs. Un code qui ne passe pas n'est pas posable — il ne devient pas
// un identifiant approximatif.
var CODE_VALIDE = /^[A-Za-z0-9_-]{1,20}$/;
// Une couleur est hexadécimale (#rgb, #rrggbb, #rrggbbaa) ou n'est pas :
// elle finit dans un `style="background:…"`.
var COULEUR_VALIDE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function _depuisSousCriteres(critere) {
    var vus = {};
    var liste = [];
    var scs = (critere && Array.isArray(critere.sousCriteres)) ? critere.sousCriteres : [];
    scs.forEach(function(sc) {
        if (!sc || !(Number(sc.ponderation) > 0)) return;
        var numero = (sc.code === undefined || sc.code === null) ? '' : String(sc.code).trim();
        // Sans numéro, ou un numéro qui ne peut pas vivre dans un identifiant :
        // rien à écrire sur la copie ; un numéro en double, le premier gagne —
        // deux codes de même identifiant seraient indiscernables.
        if (!numero || !CODE_VALIDE.test(numero) || vus[numero]) return;
        vus[numero] = true;
        var nom = (typeof sc.nom === 'string' && sc.nom.trim()) ? sc.nom.trim() : 'Code ' + numero;
        liste.push({
            id: PREFIXE + numero,
            code: numero,
            numero: numero,
            nom: nom,
            couleur: (typeof sc.couleur === 'string' && COULEUR_VALIDE.test(sc.couleur)) ? sc.couleur
                : COULEURS_DEFAUT[(liste.length) % COULEURS_DEFAUT.length],
            retroaction: (typeof sc.retroaction === 'string') ? sc.retroaction : '',
            source: 'grille',
            poids: Number(sc.ponderation)
        });
    });
    return liste;
}

/**
 * Un critère qui DEVIENT algorithmique porte la marque (21 oct. 2026) : ses codes
 * seront ses sous-critères, et seulement eux. Rend le critère, muté. Le site
 * d'appel décide de la naissance (`grilles.js`, `avecProjectionNeuve`) ; ce module
 * ne marque jamais un critère à la lecture.
 */
function marquerNeuf(critere) {
    if (critere && critere.type === 'algorithmique') critere[MARQUE] = true;
    return critere;
}

/** Le critère tire-t-il ses codes de ses sous-critères ? La marque (né depuis le 21 oct.), ou le geste d'activation. */
function donneSesCodes(critere) {
    return !!critere && (critere[MARQUE] === true || critere[DRAPEAU] === true);
}

/**
 * Une grille est activée quand son critère algorithmique porte la marque — même
 * sans sous-critère : aucun code, jamais le repli —, ou le drapeau ET au moins un
 * sous-critère qui pèse : un drapeau sur une liste vide retombe sur le repli
 * plutôt que d'offrir une palette sans rien (le stock d'avant la marque).
 */
function estActive(grille) {
    var critere = _critereAlgo(grille);
    if (!critere) return false;
    if (critere[MARQUE] === true) return true;
    if (critere[DRAPEAU] !== true) return false;
    return _depuisSousCriteres(critere).length > 0;
}

/**
 * Ce que les sous-critères d'un critère DONNERAIENT comme codes, geste posé ou
 * non — pour le gabarit, qui montre le compte et la couleur de chaque
 * sous-critère avant que l'enseignant·e n'active. Même règle que la liste
 * activée ; `[]` sans critère ou sans sous-critère qui pèse.
 */
function apercuCodes(critere) {
    return _depuisSousCriteres(critere);
}

/** Les codes de cette grille, dans l'ordre d'affichage. */
function listeCodes(grille) {
    if (estActive(grille)) return _depuisSousCriteres(_critereAlgo(grille));
    return _repli();
}

/**
 * L'entrée d'un identifiant posé sur une copie. ⚠ JAMAIS NULL : un code posé
 * ne disparaît pas d'une copie parce que sa grille ne le connaît plus — il
 * s'affiche avec son numéro et un nom neutre, jamais effacé, jamais muet.
 */
function code(grille, id) {
    var liste = listeCodes(grille);
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    var brut = (typeof id === 'string') ? id : String(id || '');
    var num = (brut.indexOf(PREFIXE) === 0) ? brut.slice(PREFIXE.length) : brut;
    return {
        id: brut, code: num, numero: num, nom: 'Code ' + num,
        couleur: '#888888', retroaction: '', source: 'inconnu', inconnu: true, poids: 1
    };
}

/**
 * LE POIDS DES CODES POSÉS (décision de Grégoire, 21 oct. 2026, 8 h 38) : la somme de
 * `compteurs` ({id: nombre}), chaque code pesant son `poids` sous `grille` — 1 en repli et
 * pour un code inconnu. Arrondie au dix-millième (des poids de 0,1 s'additionnent). La seule
 * définition (22 oct. 2026) : Annoter (`travauxOutils.sommePondereeErreurs`) et le miroir du
 * gabarit (`miroirAlgo`) la lisent toutes deux.
 */
function sommePonderee(grille, compteurs) {
    var somme = Object.keys(compteurs || {}).reduce(function(s, id) {
        var poids = Number(code(grille, id).poids);
        return s + (compteurs[id] || 0) * (isFinite(poids) ? poids : 1);
    }, 0);
    return Math.round(somme * 10000) / 10000;
}

/**
 * La grille d'une copie : copie → production → grille.
 *
 * Mesuré le 3 septembre 2026 : ce chemin n'est ni toujours vrai (une copie
 * sans `productionId` est orpheline), ni garanti par la donnée (la grille
 * d'une production se lit dans SES ÉVALUATIONS — `_modeleProductionPourEval`,
 * evaluation-chargement.js — et `prod.grilleId` n'est qu'un repli, parfois
 * périmé, #346). Chaque maillon manquant rend `null`, donc le repli.
 */
function grilleDeCopie(fichier) {
    if (!fichier || !fichier.productionId) return null;
    var prod = null;
    _donnees('productions').forEach(function(p) { if (!prod && p && p.id === fichier.productionId) prod = p; });
    if (!prod) return null;
    var ref = (typeof window !== 'undefined' && typeof window._modeleProductionPourEval === 'function')
        ? window._modeleProductionPourEval(prod)
        : { grilleId: prod.grilleId || '' };
    if (!ref || !ref.grilleId) return null;
    var grille = null;
    _donnees('grillesTemplates').forEach(function(g) { if (!grille && g && g.id === ref.grilleId) grille = g; });
    return grille;
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    PREFIXE: PREFIXE,
    DRAPEAU: DRAPEAU,
    MARQUE: MARQUE,
    marquerNeuf: marquerNeuf,
    donneSesCodes: donneSesCodes,
    REPLI_DEFAUT: REPLI_DEFAUT.map(function(t) {
        return { id: t.id, code: t.code, nom: t.nom, couleur: t.couleur };
    }),
    COULEURS_DEFAUT: COULEURS_DEFAUT.slice(),
    RETROACTIONS_DEFAUT: RETROACTIONS_DEFAUT,
    estActive: estActive,
    apercuCodes: apercuCodes,
    listeCodes: listeCodes,
    code: code,
    sommePonderee: sommePonderee,
    grilleDeCopie: grilleDeCopie
};

if (typeof window !== 'undefined') window.codesAnnotation = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
