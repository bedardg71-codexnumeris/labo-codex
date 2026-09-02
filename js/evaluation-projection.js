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
   ⚠ Ne pas confondre avec `PALIERS_GABARIT_NEUF`, plus bas : le gabarit livré
   aux NOUVEAUX utilisateurs ne charrie aucune particularité d'établissement.

   Aucune dépendance : ni DOM, ni db, ni evaluationEnCours. Testable en Node.
   =============================== */

(function() {
'use strict';

// ---------------------------------------------------------------------
// Le jeton de substitution du nom de service
// ---------------------------------------------------------------------
// Le nom du service d'aide est un PARAMÈTRE, pas une constante : au collège de
// Grégoire, le « Centre d'aide en français (CAF) » est devenu « Passerelle + »
// et la transition n'est pas finie. L'application disait donc à des élèves de
// s'inscrire à un service disparu — l'exemple type de ce que ce chantier
// corrige. Le texte du palier porte le jeton, le registre y met le nom réglé.
var JETON_SERVICE = '{service}';

/** Formate un nombre pour un libellé (pas de décimale inutile). */
function _nb(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) return '?';
    var arrondi = Math.round(valeur * 100) / 100;
    return String(arrondi);
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

// Le gabarit « critères EUF » proposé aux NOUVEAUX utilisateurs. Mêmes seuils,
// mais aucun nom d'établissement : ni « CAF », ni « Passerelle + ». Le nom du
// service se règle dans le gabarit, il ne s'hérite pas de la pratique d'un
// autre. Voir §6 de la consigne : deux voies, à ne pas confondre.
//
// ⚠ LA PRÉPOSITION VOYAGE AVEC LE NOM, PAS AVEC LE CODE. « t'inscrire AU
// Centre d'aide » se dit ; « t'inscrire AU Passerelle + » ne se dit pas. La
// phrase de recommandation est donc du texte libre, éditable à côté du nom :
// changer l'un sans relire l'autre produit une phrase fautive, et aucun code
// ne peut deviner le genre d'un nom que l'utilisateur n'a pas encore écrit.
// Le gabarit neuf emploie une tournure qui n'impose rien : deux-points.
var PALIERS_GABARIT_NEUF = PALIERS_MIGRATION.map(function(p) {
    return {
        cle: p.cle,
        libelle: p.libelle,
        sansErreur: p.sansErreur,
        ratioMax: p.ratioMax,
        texte: p.texte.replace(/En prévision de l'EUF/g, 'En prévision de l\'épreuve uniforme'),
        // Sans jeton : la phrase générique se rend telle quelle, sans nom à
        // fournir. Un nouvel utilisateur qui inscrit le sien réécrit la phrase
        // en même temps — les deux champs sont côte à côte dans le gabarit.
        texteAide: p.texteAide
            ? p.texteAide.split('au ' + JETON_SERVICE + '.')
                         .join('au service d\'aide de ton collège : ' + JETON_SERVICE + '.')
            : ''
    };
});

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
        nom: 'Norme externe (épreuve uniforme)',
        description: 'Situe l\'élève face à une norme indépendante du cours, exprimée en erreurs tolérées pour une longueur de référence.',
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
        description: 'Le critère est noté, mais aucune projection n\'est proposée à l\'élève. À employer partout où la grille algorithmique ne sert pas une rédaction.',
        projette: false,
        parametres: [],
        paliersParDefaut: [],
        seuil: function() { return null; }
    }
];

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

/** Nettoie un paramètre selon sa déclaration. Ne devine jamais : borne. */
function _valeurParametre(p, brut) {
    if (p.type === 'texte') {
        var texte = (brut === undefined || brut === null) ? p.defaut : String(brut);
        if (p.max !== undefined && texte.length > p.max) texte = texte.slice(0, p.max);
        return texte;
    }
    var valeur = (brut === undefined || brut === null || brut === '') ? p.defaut : Number(brut);
    if (isNaN(valeur)) valeur = p.defaut;
    if (p.min !== undefined && valeur < p.min) valeur = p.min;
    if (p.max !== undefined && valeur > p.max) valeur = p.max;
    return valeur;
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
            texteAide: (typeof p.texteAide === 'string') ? p.texteAide : ''
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
    modele.parametres.forEach(function(p) {
        params[p.cle] = _valeurParametre(p, source[p.cle]);
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

/** Compose le texte d'un palier : verdict, puis recommandation si un service est nommé. */
function _texteDuPalier(palier, params) {
    var texte = palier.texte || '';
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
            palier: sansErreur, indice: 0, params: p.params, mots: mots
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
        palier: choisi, indice: indice, params: p.params, mots: mots,
        seuilMotsParErreur: seuilMotsParErreur
    });
}

function _nonApplicable(base, raison) {
    return {
        applicable: false, raison: raison,
        ratio: null, motsParErreur: null, palier: null, indicePalier: -1,
        texte: '', prefixe: '',
        modeleId: base.modeleId, params: base.params, paliers: base.paliers,
        herite: base.herite, lienServiceAide: base.lienServiceAide
    };
}

function _resultat(base, x) {
    // Le préfixe est ENGENDRÉ : il porte la mesure, jamais un verdict. Il est
    // absent du palier « zéro erreur », comme aujourd'hui.
    var prefixe = (x.motsParErreur === null)
        ? ''
        : 'Tu fais en moyenne 1 erreur à chaque ' + Math.round(x.motsParErreur) + ' mots.';
    var verdict = _texteDuPalier(x.palier, x.params);
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
        modeleId: base.modeleId, params: base.params, paliers: base.paliers,
        herite: base.herite, lienServiceAide: base.lienServiceAide
    };
}

// ---------------------------------------------------------------------
// Libellés pour le gabarit
// ---------------------------------------------------------------------

/** Le seuil dit dans les DEUX unités — comme libelleSymbolique dit la formule. */
function libelleSeuil(critere) {
    var p = normaliser(critere);
    if (!p.modele.projette) return '';
    var seuil = p.modele.seuil(p.params);
    if (!seuil || !isFinite(seuil)) return '';
    return '1 erreur à chaque ' + _nb(seuil) + ' mots ('
        + _nb(p.params.erreursTolerees) + ' erreurs pour ' + _nb(p.params.motsReference) + ' mots)';
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
    modele.parametres.forEach(function(p) {
        propres[p.cle] = _valeurParametre(p, source[p.cle]);
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
 * Le fragment de critère à écrire dans le gabarit « critères EUF » livré aux
 * NOUVEAUX utilisateurs.
 *
 * ⚠ Pourquoi ce n'est PAS le défaut du modèle. `normaliser` ne peut pas
 * distinguer un critère d'avant #668 d'un critère tout neuf : les deux n'ont
 * aucun champ de projection. Le défaut déclaré du modèle est donc ce que lit
 * TOUT critère migré ; le gabarit neuf, lui, ÉCRIT ses valeurs (`nomServiceAide`
 * vide) : c'est un artefact livré, pas une lecture.
 *
 * ↻ CORRIGÉ LE 2 SEPT. 2026 (#690). Ce paragraphe disait que le défaut « doit
 * rester celui de la MIGRATION (Centre d'aide en français (CAF)), sans quoi la
 * reproduction au mot près tombe ». Ce n'est plus vrai, et ça ne l'était qu'à
 * moitié : le golden de la sentinelle #668 HÉRITAIT tacitement de ce défaut au
 * lieu de déclarer le nom d'alors. Il le déclare maintenant, et ses vingt
 * chaînes n'ont pas bougé d'un caractère. Le défaut, lui, est devenu « Centre
 * d'aide du collège » — décision de Grégoire : le service nommé n'existe plus,
 * et un enseignant dont l'établissement n'a ni CAF ni services adaptés lisait
 * ces mots quand même. ⚠ TARIR N'EST PAS RÉPARER : ce changement tarit la
 * SOURCE. Un enseignant qui a déjà réglé son `nomServiceAide` porte sa valeur
 * en base, elle n'est pas touchée, et c'est voulu.
 */
function gabaritNeuf() {
    return {
        modeleProjection: 'norme_externe',
        paramsProjection: {
            motsReference: 900,
            erreursTolerees: 30,
            nomServiceAide: '',
            lienServiceAide: ''
        },
        paliersProjection: paliersGabaritNeuf()
    };
}

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
    listerModeles: listerModeles,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    calculer: calculer,
    libelleSeuil: libelleSeuil,
    motsParErreurDuRatio: motsParErreurDuRatio,
    appliquerAuCritere: appliquerAuCritere,
    paliersGabaritNeuf: paliersGabaritNeuf,
    gabaritNeuf: gabaritNeuf,
    paliersMigration: paliersMigration
};

if (typeof window !== 'undefined') window.projectionAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
