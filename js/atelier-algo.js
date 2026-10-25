/* ===============================
   MODULE ATELIER-ALGO — La présentation du critère algorithmique
   Date : 24 octobre 2026 (#1150, lot 4 ; consigne
   `plans de travail/CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md`, maquette validée
   `plans de travail/MAQUETTE-2026-10-24-critere-algorithmique.html`)

   Vocation
     Sous les champs d'en-tête d'un critère « Algorithmique », un atelier en trois colonnes : la palette
     des blocs (étape 2b, rendue par grilles.js), les ÉTAPES du critère, et « Ce que l'élève lira ». En
     tête, la chaîne des cinq étapes (`ChaineEtapes`) : Ce que tu comptes → Codes → Note → Paliers →
     Ce que l'élève lit (le point d'arrivée). Une seule étape ouverte à la fois.

   LA PRÉSENTATION CHANGE, RIEN DE CE QUI EST CALCULÉ NI ENREGISTRÉ
     Le contenu des étapes est celui des blocs de grilles.js, déplacé. La copie fictive se calcule par
     `miroirAlgo.essayer` (le calcul de l'évaluation) ; les phrases sont celles qu'il rend, découpées
     par leur source pour « Montrer d'où vient chaque phrase » — le découpage se vérifie : leur
     assemblage redonne la phrase entière, sinon la phrase reste d'un seul morceau.

   CE QUI VIT EN MÉMOIRE, JAMAIS DANS LA GRILLE
     L'étape ouverte, la copie fictive réglée (par critère : `etats`), la bascule des sources et le
     tiroir réduit (pour la page). Le gabarit se redessine à chaque modification enregistrée : il relit
     ces états, la section ouverte et la copie réglée ne sautent pas. Rien ne voyage à l'export.

   Sécurité : tout ce qui vient de la grille est échappé dans le rendu en chaîne (`esc`) ou posé par
   `textContent` (règle 1) ; les écouteurs sont délégués, aucun gestionnaire en ligne (règle 2).
   Dépendances (lues à l'appel, sur `window` ou par `require`) : enoncesAlgo, formulesAlgo,
   projectionAlgo, miroirAlgo, codesAnnotation, paletteAlgo ; dans la page : ChaineEtapes,
   composeurBadges, et `deciblerPaletteAlgo` (grilles.js).
   =============================== */

(function() {
'use strict';

function _reg(nom, fichier) {
    if (typeof window !== 'undefined' && window[nom]) return window[nom];
    if (typeof require === 'function') {
        try { return require(fichier); } catch (err) { return null; }
    }
    return null;
}
function _E() { return _reg('enoncesAlgo', './evaluation-enonces.js'); }
function _F() { return _reg('formulesAlgo', './evaluation-formules.js'); }
function _P() { return _reg('projectionAlgo', './evaluation-projection.js'); }
function _M() { return _reg('miroirAlgo', './miroir-algo.js'); }
function _C() { return _reg('codesAnnotation', './codes-annotation.js'); }
function _Pal() { return _reg('paletteAlgo', './palette-algo.js'); }

/* Les mots de l'atelier : ceux de la maquette validée (24 oct.), sauf ceux que la maquette n'avait pas
   à dire (un critère d'avant sans noms, les codes qui vont au premier critère algorithmique). */
var TEXTES = {
    chaine: 'Les étapes du critère algorithmique',
    etapes: {
        compte: 'Ce que tu comptes',
        codes: 'Codes',
        note: 'Note',
        paliers: 'Paliers',
        eleve: 'Ce que l\'élève lit'
    },
    buts: {
        codes: 'Ce que tu poses sur la copie dans Annoter. Chaque code posé compte pour son poids.',
        note: 'Comment le compte devient une note, sur la pondération du critère.',
        paliers: 'Où la copie se situe face à une norme externe, et ce que tu en dis à l\'élève à chaque palier.',
        eleve: 'Les phrases que l\'app écrit à ta place pour chaque copie. Le verdict de chaque palier s\'écrit dans l\'étape Paliers.'
    },
    apercu: {
        titre: 'Ce que l\'élève lira',
        reduire: 'Réduire',
        toutVoir: 'Tout voir',
        copie: 'Copie fictive',
        references: 'Copies de référence',
        moins: 'Une de moins',
        plus: 'Une de plus',
        compte: 'Nombre compté',
        longueur: 'Longueur',
        pour: 'pour',
        curseur: 'Glisser pour changer le compte',
        note: 'Note',
        aucuneNote: 'aucune',
        palier: 'Palier',
        pdf: 'Sous le critère, dans son PDF',
        bilan: 'Dans son bilan',
        siEffondre: 'Si ce critère est effondré, en tête :',
        siAcquis: 'Si tous ses critères sont acquis :',
        toi: 'Pour toi seul·e',
        siAucunCode: 'Si la copie ne porte aucun code :',
        sources: 'Montrer d\'où vient chaque phrase',
        astuce: 'Clique une phrase : la zone qui l\'écrit s\'ouvre.',
        aucunePhrase: 'Aucune phrase.',
        rien: 'Rien ne s\'affiche.',
        engendre: 'Ajoutée par l\'app. Elle disparaît dès que le verdict porte un bloc : « Mots par erreur » remet ce nombre où tu veux.',
        codesPoses: 'Codes posés : '
    },
    copies: { aucune: 'Aucune', quelques: 'Quelques', beaucoup: 'Beaucoup', ponderee: 'Pondérée' },
    sources: {
        decompte: 'Décompte',
        prefixe: 'ajoutée par l\'app',
        verdict: function(libelle) { return libelle ? 'Verdict · ' + libelle : 'Verdict'; },
        aide: 'Recommandation',
        priorite: 'Défi prioritaire',
        concentre: 'Quand tout est maîtrisé',
        aucune: 'Aucune annotation'
    }
};

/** L'ordre des étapes : celui de la chaîne. */
var ORDRE = ['compte', 'codes', 'note', 'paliers', 'eleve'];

/** Le nom court d'une formule (l'info de l'étape « Note ») ; un modèle inconnu : son nom. */
var FORMULES_COURTES = {
    penalite_normalisee: 'pénalité normalisée',
    ratio_cible: 'ratio visé',
    penalite_par_erreur: 'pénalité fixe'
};

function _pluriel(n, singulier, pluriel) { return n + ' ' + (n > 1 ? pluriel : singulier); }
function _fmt(n) {
    if (typeof window !== 'undefined' && typeof window.formaterNombre === 'function') return window.formaterNombre(n);
    return String(n);
}

/* ---------------------------------------------------------------------
   Fonctions pures — éprouvées en Vitest
   --------------------------------------------------------------------- */

/* Une fonction par étape : son état (réglée), son info (sous le nœud de la chaîne), son résumé (l'en-tête fermé). */

/** Ce que tu comptes — la règle de l'invitation des noms (`nomsManquants`) : un critère d'avant, qui lit
 *  « erreur » et « mot », est réglé ; un critère neuf l'est quand ses quatre formes sont écrites. */
function _etapeCompte(c) {
    var n = _E().noms(c);
    var manquent = _E().nomsManquants(c).length > 0;
    return { id: 'compte', reglee: !manquent,
        info: manquent ? 'à nommer' : n.erreurs.pluriel + ' / ' + n.mots.pluriel,
        resume: manquent ? 'Nomme ce que tu comptes et ce à quoi tu le rapportes'
            : '« ' + n.erreurs.pluriel + ' » par rapport aux « ' + n.mots.pluriel + ' »' };
}

/** Codes — non activés (la palette générale d'Annoter), ou au moins un code posable ; les codes ne vont
 *  qu'au premier critère algorithmique de la grille (#1132) : le suivant tape son nombre. */
function _etapeCodes(c, criteres) {
    var E = _E(), C = _C();
    var algos = E.criteresAlgorithmiques ? E.criteresAlgorithmiques({ criteres: criteres || [c] }) : [c];
    if (algos.length > 1 && algos[0] !== c) {
        return { id: 'codes', reglee: true, info: 'nombre tapé',
            resume: 'Les codes vont au premier critère algorithmique : ici, le nombre se tape' };
    }
    var actif = C ? C.donneSesCodes(c) : c.codesDepuisSousCriteres === true;
    if (!actif) return { id: 'codes', reglee: true, info: 'palette générale', resume: 'La palette générale d\'Annoter' };
    var nb = C.apercuCodes(c).length;
    return { id: 'codes', reglee: nb > 0, info: _pluriel(nb, 'code', 'codes'),
        resume: nb === 0 ? 'Aucun sous-critère ne sert encore de code'
            : (nb > 1 ? nb + ' sous-critères servent de codes' : '1 sous-critère sert de code') };
}

/** Note — une pondération et chaque paramètre de la formule au-dessus de 0. ⚠ Mesuré (25 oct.) : on lit ce que
 *  le calcul applique (`normaliser`). Deux formules sur trois bornent leur paramètre à 1 (pénalité normalisée,
 *  ratio visé : un 0 devient 1) ; la pénalité fixe admet 0 point par erreur (`min: 0`), que l'étape signale
 *  « à régler » — la pleine note à toute copie, rien n'est refusé ni écrit. La pondération, elle, peut manquer. */
function _etapeNote(c) {
    var f = _F().normaliser(c);
    var pond = Number(c.ponderation);
    var pondOk = isFinite(pond) && pond > 0;
    var paramsOk = (f.modele.parametres || []).every(function(p) { var v = Number(f.params[p.cle]); return isFinite(v) && v > 0; });
    var court = FORMULES_COURTES[f.modeleId] || String(f.modele.nom || '').toLowerCase();
    return { id: 'note', reglee: pondOk && paramsOk, info: court,
        resume: 'Formule : ' + court + (pondOk ? ', sur ' + _fmt(pond) : ', sans pondération') };
}

/** Paliers — aucune projection, ou une longueur et une tolérance au-dessus de 0 (même bornage mesuré : la
 *  règle tient pour un registre qui laisserait passer 0). */
function _etapePaliers(c) {
    var p = _P().normaliser(c);
    if (!(p.modele && p.modele.projette)) return { id: 'paliers', reglee: true, info: 'aucun', resume: 'Aucune projection' };
    var nb = _pluriel((p.paliers || []).length, 'palier', 'paliers');
    return { id: 'paliers', reglee: Number(p.params.motsReference) > 0 && Number(p.params.erreursTolerees) > 0,
        info: nb, resume: p.modele.nom + ', ' + nb };
}

/** Ce que l'élève lit (le point d'arrivée) — au moins un des trois textes non vide. */
function _etapeEleve(c) {
    var en = _E().normaliser(c).enonces;
    var n = ['decompte', 'priorite', 'concentre'].filter(function(k) { return String(en[k] || '').trim(); }).length;
    return { id: 'eleve', arrivee: true, reglee: n > 0, info: _pluriel(n, 'texte', 'textes'),
        resume: 'Décompte et bilan : ' + _pluriel(n, 'texte', 'textes') };
}

/**
 * Les cinq étapes d'un critère, avec leur état. `criteres` : la liste de la grille (les codes ne vont
 * qu'au premier critère algorithmique, #1132).
 * @returns {Array<{id, libelle, info, resume, reglee, arrivee}>}
 */
function etapes(critere, criteres) {
    var c = critere || {};
    return [_etapeCompte(c), _etapeCodes(c, criteres), _etapeNote(c), _etapePaliers(c), _etapeEleve(c)].map(function(e) {
        e.libelle = TEXTES.etapes[e.id];
        e.arrivee = !!e.arrivee;
        return e;
    });
}

/** L'étape qui porte une zone d'écriture (son `dataset`) : un palier, « Aucune annotation », ou un énoncé. */
function etapeDeZone(zone) {
    var d = zone || {};
    if (d.palierIndex !== undefined) return 'paliers';
    if (d.enonceCle === 'aucune') return 'codes';
    if (d.enonceCle !== undefined) return 'eleve';
    return null;
}

/** Les étapes dont une zone accepte un bloc (le crayon de la chaîne), dans l'ordre de la chaîne. */
function etapesDuJeton(critere, jeton) {
    var E = _E(), Pal = _Pal();
    if (!Pal) return [];
    var zones = E.listerCles().map(function(c) { return { enonceCle: c.cle }; });
    if (Pal.aDesPaliers(critere)) zones.push({ palierIndex: '0', champ: 'texte' });
    var ids = {};
    zones.forEach(function(z) {
        if (Pal.reperesDeZone(critere, z).some(function(r) { return r.jeton === jeton; })) ids[etapeDeZone(z)] = true;
    });
    return ORDRE.filter(function(id) { return ids[id]; });
}

/** Les copies de référence du miroir, nommées : « Aucune », « Quelques », « Beaucoup » (et « Pondérée »). */
function copiesDeReference(critere) {
    return _M().copies(critere).map(function(c) {
        return Object.assign({}, c, { libelle: TEXTES.copies[c.cle] || c.cle });
    });
}

/** La copie fictive de départ : « Quelques » du miroir ; sans pondération, aucune erreur sur l'étendue. */
function copieDeDepart(critere) {
    var refs = _M().copies(critere);
    var choisie = refs.filter(function(c) { return c.cle === 'quelques'; })[0]
        || refs.filter(function(c) { return c.cle === 'beaucoup'; })[0] || refs[0];
    if (choisie) return Object.assign({}, choisie, { codes: (choisie.codes || []).slice() });
    return { cle: null, erreurs: 0, erreursFormule: 0, mots: _M().etendue(critere), codes: [] };
}

/**
 * La copie réglée à la main : un nouveau compte la rend ordinaire (le compte EST ce que la formule
 * reçoit, sans codes) ; une nouvelle longueur garde le reste. Rien sous 0.
 */
function copieAvec(copie, changement) {
    var c = Object.assign({ erreurs: 0, erreursFormule: 0, mots: null, codes: [] }, copie || {});
    var x = changement || {};
    if (x.erreurs !== undefined) {
        var e = Math.max(0, Math.round(Number(x.erreurs) || 0));
        c = Object.assign({}, c, { cle: null, erreurs: e, erreursFormule: e, codes: [] });
    }
    if (x.mots !== undefined) {
        var brut = x.mots;
        var m = (brut === '' || brut === null || !isFinite(Number(brut))) ? null : Math.max(0, Number(brut));
        c = Object.assign({}, c, { mots: m });
    }
    return c;
}

/**
 * Ce que l'élève lira pour une copie, rangé par destination. Les phrases sortent de
 * `miroirAlgo.essayer` et de `enoncesAlgo.enonce` (comme l'évaluation : `{}` pour le bilan).
 * @returns {{essai, palier, pdf: Array<{source, texte, etape?, zone?, engendre?, palier?}>, priorite, concentre, aucune}}
 */
function lecture(critere, copie) {
    var E = _E(), P = _P();
    var essai = _M().essayer(critere, copie);
    var pdf = [];
    if (essai.decompte) pdf.push({ source: 'decompte', etape: 'eleve', zone: { enonceCle: 'decompte' }, texte: essai.decompte });

    var proj = P.calculer(critere, { erreurs: copie.erreurs, mots: copie.mots || 0 });
    var palier = (proj.applicable && proj.palier) ? (proj.palier.libelle || proj.palier.cle || '') : '';
    if (essai.projection) {
        var morceaux = _morceauxDeLaProjection(proj, essai.projection);
        morceaux.forEach(function(m) { pdf.push(m); });
    }
    return {
        essai: essai,
        palier: palier,
        pdf: pdf,
        priorite: E.enonce(critere, 'priorite', {}),
        concentre: E.enonce(critere, 'concentre', {}),
        aucune: E.enonce(critere, 'aucune', {})
    };
}

/**
 * La phrase de projection, découpée : le préfixe engendré, le verdict, la recommandation. Le verdict
 * est le texte du palier rempli par le module (`remplir`, ce que `_texteDuPalier` fait) ; si les
 * morceaux ne redonnent pas la phrase entière, elle reste un seul morceau, rattaché au verdict.
 */
function _morceauxDeLaProjection(proj, phrase) {
    var indice = String((proj.paliers || []).indexOf(proj.palier));
    var libelle = proj.palier ? (proj.palier.libelle || proj.palier.cle || '') : '';
    var entiere = [{ source: 'verdict', etape: 'paliers', zone: { palierIndex: indice, champ: 'texte' }, palier: libelle, texte: phrase }];
    var x = _decouperProjection(proj, phrase);
    if (!x) return entiere;
    var d = [];
    if (x.prefixe) d.push({ source: 'prefixe', engendre: true, texte: x.prefixe });
    if (x.verdict) d.push({ source: 'verdict', etape: 'paliers', zone: { palierIndex: indice, champ: 'texte' }, palier: libelle, texte: x.verdict });
    if (x.aide) d.push({ source: 'aide', etape: 'paliers', zone: { palierIndex: indice, champ: 'texteAide' }, texte: x.aide });
    return (d.map(function(m) { return m.texte; }).join(' ') === phrase) ? d : entiere;
}

/** Les trois parties de la phrase ({prefixe, verdict, aide}), ou null si la phrase ne commence pas par son verdict. */
function _decouperProjection(proj, phrase) {
    var prefixe = (proj.prefixe && phrase.indexOf(proj.prefixe) === 0) ? proj.prefixe : '';
    var corps = prefixe ? phrase.slice(prefixe.length).trim() : phrase;
    var verdict = _P().remplir(proj.palier ? (proj.palier.texte || '') : '', proj.jetons || {});
    if (corps === verdict) return { prefixe: prefixe, verdict: verdict, aide: '' };
    if (!verdict) return { prefixe: prefixe, verdict: '', aide: corps };
    if (corps.indexOf(verdict + ' ') === 0) return { prefixe: prefixe, verdict: verdict, aide: corps.slice(verdict.length + 1) };
    return null;
}

/** La clé d'une zone, telle que la porte un morceau cliquable : `enonce:<cle>` ou `palier:<i>:<champ>`. */
function cleDeZone(zone) {
    var d = zone || {};
    if (d.palierIndex !== undefined) return 'palier:' + d.palierIndex + ':' + (d.champ || 'texte');
    return 'enonce:' + d.enonceCle;
}

/* ---------------------------------------------------------------------
   Le rendu en chaîne (grilles.js l'insère dans la rangée du critère)
   --------------------------------------------------------------------- */

var etats = {};
var page = { sources: true, reduit: null };

function _cle(ctx, critere) {
    var cible = (ctx && ctx.mode === 'grille') ? ctx.grilleId : 'temp';
    return cible + ':' + ((critere && critere.id) || ('critere-' + (ctx ? ctx.index : 0)));
}
function _etat(ctx, critere) {
    var k = _cle(ctx, critere);
    if (!etats[k]) etats[k] = { ouverte: 'eleve', copie: null };
    return etats[k];
}

function _esc(t) {
    var s = String(t == null ? '' : t);
    if (typeof window !== 'undefined' && typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * L'atelier d'un critère : la chaîne (dessinée au montage), la palette, les cinq étapes, l'aperçu
 * (rempli au montage). `contenus` : le HTML de la palette et de chaque étape, rendu par grilles.js.
 */
function rendre(critere, ctx, contenus) {
    var k = contenus || {};
    var etat = _etat(ctx, critere);
    var i = _esc(ctx.index);
    var liste = etapes(critere, ctx.criteres);
    var sections = liste.map(function(e) {
        var ouverte = etat.ouverte === e.id;
        var idCorps = 'atelier-algo-' + i + '-' + e.id;
        var but = TEXTES.buts[e.id];
        return '\n                    <section class="atelier-algo-etape' + (e.reglee ? ' atelier-algo-etape--reglee' : '') + '" data-etape="' + e.id + '"' + (ouverte ? ' data-ouverte' : '') + '>'
            + '\n                        <h3 class="atelier-algo-etape-titre"><button type="button" class="atelier-algo-etape-tete" data-action="atelierAlgo.basculerEtape" aria-expanded="' + ouverte + '" aria-controls="' + idCorps + '">'
            + '<span class="atelier-algo-etape-noeud" aria-hidden="true">✓</span>'
            + '<span class="atelier-algo-etape-titres"><span class="atelier-algo-etape-nom">' + _esc(e.libelle) + '</span><span class="atelier-algo-etape-resume" data-resume>' + _esc(e.resume) + '</span></span>'
            + '<span class="u-lecteur-ecran" data-etat>' + (e.reglee ? ', réglée' : ', à régler') + '</span>'
            + '<span class="atelier-algo-etape-chevron" aria-hidden="true">▾</span></button></h3>'
            + '\n                        <div class="atelier-algo-etape-corps" id="' + idCorps + '"' + (ouverte ? '' : ' hidden') + '>'
            + (but ? '\n                            <p class="atelier-algo-etape-but">' + _esc(but) + '</p>' : '')
            + (k[e.id] || '')
            + '\n                        </div>\n                    </section>';
    }).join('');
    var A = TEXTES.apercu;
    var id = function(x) { return 'apercu-algo-' + i + '-' + x; };
    var apercu = '\n                <aside class="apercu-algo" data-apercu-algo="' + i + '" aria-label="' + _esc(A.titre) + '"'
        + (page.sources ? '' : ' data-sans-sources') + (_reduit() ? ' data-reduit' : '') + '>'
        + '\n                    <div class="apercu-algo-tete"><h3 class="apercu-algo-titre">' + _esc(A.titre) + '</h3>'
        + '<button type="button" class="btn btn-secondaire btn-tres-compact apercu-algo-reduire" data-apercu-geste="reduire" aria-expanded="' + !_reduit() + '">' + _esc(_reduit() ? A.toutVoir : A.reduire) + '</button></div>'
        + '\n                    <div class="apercu-algo-copie apercu-algo-detail">'
        + '<span class="apercu-algo-copie-titre">' + _esc(A.copie) + '</span>'
        + '<div class="apercu-algo-references" role="group" aria-label="' + _esc(A.references) + '"></div>'
        + '<div class="apercu-algo-ligne">'
        + '<button type="button" class="apercu-algo-pas" data-apercu-geste="moins" aria-label="' + _esc(A.moins) + '">−</button>'
        + '<label class="u-lecteur-ecran" for="' + id('erreurs') + '">' + _esc(A.compte) + '</label>'
        + '<input type="number" class="controle-form apercu-algo-nombre" id="' + id('erreurs') + '" min="0" step="1" data-apercu-champ="erreurs">'
        + '<button type="button" class="apercu-algo-pas" data-apercu-geste="plus" aria-label="' + _esc(A.plus) + '">+</button>'
        + '<span data-apercu-nom="erreurs"></span><span>' + _esc(A.pour) + '</span>'
        + '<label class="u-lecteur-ecran" for="' + id('mots') + '">' + _esc(A.longueur) + '</label>'
        + '<input type="number" class="controle-form apercu-algo-nombre" id="' + id('mots') + '" min="0" step="10" data-apercu-champ="mots">'
        + '<span data-apercu-nom="mots"></span></div>'
        + '<label class="u-lecteur-ecran" for="' + id('curseur') + '">' + _esc(A.curseur) + '</label>'
        + '<input type="range" class="apercu-algo-curseur" id="' + id('curseur') + '" min="0" step="1" data-apercu-champ="curseur">'
        + '<small class="apercu-algo-codes"></small><small class="apercu-algo-etendue"></small></div>'
        + '\n                    <div class="apercu-algo-resultats"></div><small class="apercu-algo-raison"></small>'
        + '\n                    <div class="apercu-algo-lecture"><h4>' + _esc(A.pdf) + '</h4><p class="apercu-algo-texte" data-lecture="pdf"></p></div>'
        + '\n                    <div class="apercu-algo-lecture apercu-algo-detail"><h4>' + _esc(A.bilan) + '</h4>'
        + '<div class="apercu-algo-condition"><span class="apercu-algo-si">' + _esc(A.siEffondre) + '</span><p class="apercu-algo-texte" data-lecture="priorite"></p></div>'
        + '<div class="apercu-algo-condition"><span class="apercu-algo-si">' + _esc(A.siAcquis) + '</span><p class="apercu-algo-texte" data-lecture="concentre"></p></div></div>'
        + '\n                    <div class="apercu-algo-lecture apercu-algo-detail"><h4>' + _esc(A.toi) + '</h4>'
        + '<div class="apercu-algo-condition"><span class="apercu-algo-si">' + _esc(A.siAucunCode) + '</span><p class="apercu-algo-texte" data-lecture="aucune"></p></div></div>'
        + '\n                    <label class="apercu-algo-bascule apercu-algo-detail"><input type="checkbox" data-apercu-champ="sources"' + (page.sources ? ' checked' : '') + '> ' + _esc(A.sources) + '</label>'
        + '\n                    <p class="apercu-algo-astuce apercu-algo-detail">' + _esc(A.astuce) + '</p>'
        + '\n                </aside>';
    return '\n            <div class="gabarit-algo" data-atelier-algo="' + i + '" data-critere-id="' + _esc((critere && critere.id) || '') + '">'
        + '\n                <nav class="atelier-algo-chaine" aria-label="' + _esc(TEXTES.chaine) + '"></nav>'
        + '\n                <div class="gabarit-algo-plan">'
        + '\n                <div class="gabarit-algo-centre"><div class="gabarit-algo-atelier">' + (k.palette || '')
        + '\n                    <div class="gabarit-algo-corps">' + sections + '\n                    </div>'
        + '\n                </div></div>' + apercu
        + '\n                </div>\n            </div>';
}

/* ---------------------------------------------------------------------
   Le montage et les gestes (la page)
   --------------------------------------------------------------------- */

var TIROIR = '(max-width: 759px)';
function _sousTiroir() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(TIROIR).matches;
}
/** Le tiroir réduit : réduit au départ sous 760 px, puis ce que le geste a choisi. */
function _reduit() {
    if (page.reduit === null) return _sousTiroir();
    return page.reduit;
}

function _ateliers(racine) {
    var r = racine || (typeof document !== 'undefined' ? document : null);
    return r ? Array.prototype.slice.call(r.querySelectorAll('.gabarit-algo[data-atelier-algo]')) : [];
}
function _atelierDe(index) {
    return _ateliers().filter(function(a) { return a.dataset.atelierAlgo === String(index); })[0] || null;
}
function _etatDe(atelier) { return _etat(atelier._ctx, atelier._critere); }
function _copieDe(atelier) {
    var etat = _etatDe(atelier);
    return etat.copie || copieDeDepart(atelier._critere);
}

/** Les zones d'écriture d'un atelier, et l'élément qu'on voit de chacune (la vue à badges, sinon le champ). */
function _zones(atelier) {
    return Array.prototype.slice.call(atelier.querySelectorAll('textarea[data-enonce-cle], textarea[data-palier-index]'));
}
function _visible(zone) {
    var C = (typeof window !== 'undefined') ? window.composeurBadges : null;
    return (C && typeof C.vueDe === 'function' && C.vueDe(zone)) || zone;
}
function _cachee(el) { return !el || !!el.closest('.atelier-algo-etape-corps[hidden]'); }

/**
 * Après chaque rendu du gabarit (`afficherCriteresTemp`, `afficherCriteresGrille`) : la chaîne et
 * l'aperçu de chaque atelier du conteneur. `criteres` : la liste dont les index des ateliers sont les rangs.
 */
function monter(container, criteres, ctx) {
    _ateliers(container).forEach(function(atelier) {
        var index = parseInt(atelier.dataset.atelierAlgo, 10);
        var critere = (criteres || [])[index];
        if (!critere) return;
        atelier._critere = critere;
        atelier._ctx = Object.assign({}, ctx, { index: index, criteres: criteres });
        _dessinerChaine(atelier);
        _remplirApercu(atelier);
    });
    _observerTiroirs();
}

/** Un critère changé sans redessin (la pondération, un bloc posé) : la chaîne, les en-têtes, l'aperçu. */
function suivre(index, critere) {
    var atelier = _atelierDe(index);
    if (!atelier || !critere) return;
    atelier._critere = critere;
    var liste = etapes(critere, atelier._ctx && atelier._ctx.criteres);
    liste.forEach(function(e) {
        var s = atelier.querySelector('.atelier-algo-etape[data-etape="' + e.id + '"]');
        if (!s) return;
        s.classList.toggle('atelier-algo-etape--reglee', e.reglee);
        s.querySelector('[data-resume]').textContent = e.resume;
        s.querySelector('[data-etat]').textContent = e.reglee ? ', réglée' : ', à régler';
    });
    _dessinerChaine(atelier);
    _remplirApercu(atelier);
}

function _dessinerChaine(atelier) {
    var nav = atelier.querySelector('.atelier-algo-chaine');
    if (!nav || typeof window.ChaineEtapes === 'undefined') return;
    var ouverte = _etatDe(atelier).ouverte;
    var liste = etapes(atelier._critere, atelier._ctx && atelier._ctx.criteres).map(function(e) {
        return { id: e.id, libelle: e.libelle, info: e.info, reglee: e.reglee, arrivee: e.arrivee, ouverte: e.id === ouverte };
    });
    window.ChaineEtapes.dessiner(nav, liste, {
        libelle: TEXTES.chaine, crayons: true,
        surClic: function(id) { ouvrir(atelier, id, true); }
    });
}

/** Ouvre une étape (les autres se ferment) ; `null` les ferme toutes. `defiler` : y descendre. */
function ouvrir(atelier, id, defiler) {
    if (!atelier) return;
    _etatDe(atelier).ouverte = id || null;
    atelier.querySelectorAll('.atelier-algo-etape').forEach(function(s) {
        var o = s.dataset.etape === id;
        if (o) s.setAttribute('data-ouverte', ''); else s.removeAttribute('data-ouverte');
        var tete = s.querySelector('.atelier-algo-etape-tete');
        if (tete) tete.setAttribute('aria-expanded', String(o));
        var corps = s.querySelector('.atelier-algo-etape-corps');
        if (corps) corps.hidden = !o;
    });
    // La palette ne vise pas une zone qu'on ne voit plus (elle a pu la suivre dans l'étape fermée).
    var palette = atelier.querySelector('.palette-algo');
    if (palette && palette._zoneCible && _cachee(_visible(palette._zoneCible)) && typeof window.deciblerPaletteAlgo === 'function') {
        window.deciblerPaletteAlgo(palette);
    }
    _dessinerChaine(atelier);
    if (defiler && id) {
        var s = atelier.querySelector('.atelier-algo-etape[data-etape="' + id + '"]');
        if (s && typeof s.getBoundingClientRect === 'function') {
            var haut = s.getBoundingClientRect().top;
            if (haut < 0 || haut > window.innerHeight * 0.5) s.scrollIntoView({ behavior: _sansMouvement() ? 'auto' : 'smooth', block: 'start' });
        }
    }
}

/** L'en-tête d'une étape (`data-action`) : ouvre, ou ferme l'étape ouverte. */
function basculerEtape(el) {
    var s = el && el.closest ? el.closest('.atelier-algo-etape') : null;
    var atelier = s ? s.closest('.gabarit-algo') : null;
    if (!atelier) return;
    ouvrir(atelier, s.hasAttribute('data-ouverte') ? null : s.dataset.etape, false);
}

function _sansMouvement() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Un bloc survolé ou parcouru : les zones visibles qui l'acceptent s'allument, le crayon marque ses étapes. */
function montrer(atelier, jeton, oui) {
    if (!atelier) return;
    var Pal = window.paletteAlgo;
    _zones(atelier).forEach(function(z) {
        var v = _visible(z);
        var offert = !!(oui && Pal && !_cachee(v) && Pal.reperesDeZone(null, z.dataset).some(function(r) { return r.jeton === jeton; }));
        v.classList.toggle('atelier-algo-peut', offert);
    });
    var nav = atelier.querySelector('.atelier-algo-chaine');
    if (nav && window.ChaineEtapes && typeof window.ChaineEtapes.marquer === 'function') {
        window.ChaineEtapes.marquer(nav, oui ? etapesDuJeton(atelier._critere, jeton) : []);
    }
}

/** Un morceau de phrase touché : son étape s'ouvre, sa zone vient sous les yeux, le curseur au bout. */
function allerA(atelier, cleZone) {
    var parties = String(cleZone || '').split(':');
    var zone = null;
    _zones(atelier).forEach(function(z) {
        if (parties[0] === 'enonce' && z.dataset.enonceCle === parties[1]) zone = z;
        if (parties[0] === 'palier' && z.dataset.palierIndex === parties[1] && z.dataset.champ === parties[2]) zone = z;
    });
    if (!zone) return;
    ouvrir(atelier, etapeDeZone(zone.dataset), false);
    var v = _visible(zone);
    if (typeof v.scrollIntoView === 'function') v.scrollIntoView({ behavior: _sansMouvement() ? 'auto' : 'smooth', block: 'center' });
    try { v.focus({ preventScroll: true }); } catch (err) { /* rien : la zone est montrée */ }
    _curseurAuBout(v);
    v.classList.remove('atelier-algo-allume');
    void v.offsetWidth;
    v.classList.add('atelier-algo-allume');
}

function _curseurAuBout(el) {
    if (el.tagName === 'TEXTAREA') {
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (err) { /* moteur sans sélection */ }
        return;
    }
    var sel = window.getSelection ? window.getSelection() : null;
    if (!sel || typeof document.createRange !== 'function') return;
    var r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
}

/* ---------- L'aperçu ---------- */

function _el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined) e.textContent = texte;
    return e;
}

/** La note de la copie fictive, comme le miroir la disait : « 15/20 (75 %) » (js/note-pourcentage.js, #1137). */
function _texteNote(essai, critere) {
    return window.formaterNoteNombre(essai.points) + '/' + window.formaterNoteNombre(Number(critere.ponderation))
        + ' (' + window.formaterNotePourcentage(essai.pourcentage) + ')';
}

function _remplirApercu(atelier) {
    var ap = atelier.querySelector('.apercu-algo');
    var critere = atelier._critere;
    if (!ap || !critere || !_M()) return;
    var copie = _copieDe(atelier);
    var lec = lecture(critere, copie);
    _remplirCopie(ap, critere, copie);
    _remplirResultats(ap, critere, lec);
    _remplirPhrases(ap, lec);
}

/** La copie fictive : les copies de référence, les deux nombres, le curseur, les codes posés, l'étendue. */
function _remplirCopie(ap, critere, copie) {
    var A = TEXTES.apercu, E = _E(), M = _M();
    var L = M.libelles(critere), N = E.noms(critere);
    var refs = copiesDeReference(critere);
    var boite = ap.querySelector('.apercu-algo-references');
    boite.textContent = '';
    refs.forEach(function(r) {
        var b = _el('button', 'apercu-algo-reference', r.libelle);
        b.type = 'button';
        b.dataset.apercuGeste = 'reference';
        b.dataset.copie = r.cle;
        b.setAttribute('aria-pressed', String(copie.cle === r.cle));
        boite.appendChild(b);
    });
    var beaucoup = refs.filter(function(r) { return r.cle === 'beaucoup'; })[0];
    ap.querySelector('[data-apercu-champ="curseur"]').max = String(Math.max(60, beaucoup ? beaucoup.erreurs * 2 : 0, copie.erreurs));
    var sansEtendue = copie.mots === null || copie.mots === undefined;
    _poserChamp(ap, 'erreurs', String(copie.erreurs));
    _poserChamp(ap, 'mots', sansEtendue ? '' : String(copie.mots));
    _poserChamp(ap, 'curseur', String(copie.erreurs));
    ap.querySelector('[data-apercu-nom="erreurs"]').textContent = E.accorder(copie.erreurs, N.erreurs);
    ap.querySelector('[data-apercu-nom="mots"]').textContent = E.accorder(copie.mots || 0, N.mots);
    var codes = (copie.codes || []).map(function(x) { return L.code(x.nombre, x.nom, x.poids); }).join(', ');
    var mention = (copie.erreursFormule !== copie.erreurs) ? E.mentionPonderee(copie.erreurs, copie.erreursFormule).trim() : '';
    ap.querySelector('.apercu-algo-codes').textContent = codes ? A.codesPoses + codes + (mention ? ' ' + mention : '') : '';
    ap.querySelector('.apercu-algo-etendue').textContent = sansEtendue ? L.sansEtendue
        : (M.sourceEtendue(critere).origine === 'facteur' ? L.etendueDuFacteur : '');
}

/** Un champ de la copie, sauf celui qu'on est en train de taper (le curseur y resterait au mauvais endroit). */
function _poserChamp(ap, champ, valeur) {
    var x = ap.querySelector('[data-apercu-champ="' + champ + '"]');
    if (x && x !== document.activeElement) x.value = valeur;
}

/** La note (et le plancher), le palier atteint ; sans note, la phrase du miroir qui dit pourquoi. */
function _remplirResultats(ap, critere, lec) {
    var A = TEXTES.apercu, L = _M().libelles(critere);
    var res = ap.querySelector('.apercu-algo-resultats');
    res.textContent = '';
    var pilule = _el('span', 'apercu-algo-resultat');
    pilule.append(_el('span', 'apercu-algo-resultat-nom', A.note), ' ', lec.essai.applicable ? _texteNote(lec.essai, critere) : A.aucuneNote);
    if (lec.essai.plancher) pilule.append(' ', _el('span', 'apercu-algo-resultat-nom', L.plancher));
    res.appendChild(pilule);
    if (lec.palier) {
        var p = _el('span', 'apercu-algo-resultat apercu-algo-resultat--palier');
        p.append(_el('span', 'apercu-algo-resultat-nom', A.palier), ' ', lec.palier);
        res.appendChild(p);
    }
    var pond = Number(critere.ponderation);
    ap.querySelector('.apercu-algo-raison').textContent = lec.essai.applicable ? ''
        : ((isFinite(pond) && pond > 0) ? L.noteImpossible : L.sansPonderation);
}

/** Les phrases, rangées par destination : le PDF (par morceaux), le bilan, « Pour toi seul·e ». */
function _remplirPhrases(ap, lec) {
    var A = TEXTES.apercu;
    var pdf = ap.querySelector('[data-lecture="pdf"]');
    pdf.textContent = '';
    if (!lec.pdf.length) pdf.appendChild(_el('span', 'apercu-algo-rien', A.aucunePhrase));
    lec.pdf.forEach(function(m, n) {
        if (n) pdf.appendChild(document.createTextNode(' '));
        var nom = m.source === 'verdict' ? TEXTES.sources.verdict(m.palier) : TEXTES.sources[m.source];
        pdf.appendChild(_segment(m.engendre ? null : cleDeZone(m.zone), nom, m.texte));
    });
    [['priorite', lec.priorite], ['concentre', lec.concentre], ['aucune', lec.aucune]].forEach(function(x) {
        var boite = ap.querySelector('[data-lecture="' + x[0] + '"]');
        boite.textContent = '';
        boite.appendChild(x[1] ? _segment('enonce:' + x[0], TEXTES.sources[x[0]], x[1]) : _el('span', 'apercu-algo-rien', A.rien));
    });
}

/** Un morceau de phrase : un bouton qui mène à sa zone, ou (engendré par l'app) un simple texte. */
function _segment(cleZone, source, texte) {
    var s;
    if (cleZone) {
        s = _el('button', 'apercu-algo-segment');
        s.type = 'button';
        s.dataset.versZone = cleZone;
    } else {
        s = _el('span', 'apercu-algo-segment apercu-algo-segment--engendre');
        s.title = TEXTES.apercu.engendre;
    }
    s.appendChild(_el('span', 'apercu-algo-source', source));
    s.appendChild(document.createTextNode(texte));
    return s;
}

/** Sous 760 px, « Ce que l'élève lira » devient un tiroir collé en bas : celui du premier atelier à l'écran. */
var _observateur = null;
var _aLEcran = new Set();
function _observerTiroirs() {
    if (typeof IntersectionObserver !== 'function') return;
    if (!_observateur) {
        _observateur = new IntersectionObserver(function(entrees) {
            entrees.forEach(function(e) { if (e.isIntersecting) _aLEcran.add(e.target); else _aLEcran.delete(e.target); });
            _poserTiroir();
        });
    }
    _observateur.disconnect();
    _aLEcran.clear();
    document.querySelectorAll('.gabarit-algo-plan').forEach(function(p) { _observateur.observe(p); });
}
function _poserTiroir() {
    var premier = null;
    document.querySelectorAll('.gabarit-algo-plan').forEach(function(p) {
        if (!premier && _aLEcran.has(p)) premier = p;
        if (p !== premier) p.removeAttribute('data-tiroir');
    });
    if (premier) premier.setAttribute('data-tiroir', '');
}

function _changerCopie(atelier, changement) {
    var etat = _etatDe(atelier);
    etat.copie = copieAvec(_copieDe(atelier), changement);
    _remplirApercu(atelier);
}

function _brancher() {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    var atelierDe = function(el) { return el && el.closest ? el.closest('.gabarit-algo[data-atelier-algo]') : null; };

    document.addEventListener('click', function(e) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var seg = t.closest('.apercu-algo-segment[data-vers-zone]');
        if (seg) { allerA(atelierDe(seg), seg.dataset.versZone); return; }
        var geste = t.closest('[data-apercu-geste]');
        if (!geste) return;
        var atelier = atelierDe(geste);
        var g = geste.dataset.apercuGeste;
        if (g === 'reduire') {
            page.reduit = !_reduit();
            document.querySelectorAll('.apercu-algo').forEach(function(ap) {
                if (page.reduit) ap.setAttribute('data-reduit', ''); else ap.removeAttribute('data-reduit');
                var b = ap.querySelector('[data-apercu-geste="reduire"]');
                if (b) { b.textContent = page.reduit ? TEXTES.apercu.toutVoir : TEXTES.apercu.reduire; b.setAttribute('aria-expanded', String(!page.reduit)); }
            });
            return;
        }
        if (!atelier) return;
        var copie = _copieDe(atelier);
        if (g === 'moins') _changerCopie(atelier, { erreurs: copie.erreurs - 1 });
        else if (g === 'plus') _changerCopie(atelier, { erreurs: copie.erreurs + 1 });
        else if (g === 'reference') {
            var r = copiesDeReference(atelier._critere).filter(function(x) { return x.cle === geste.dataset.copie; })[0];
            if (r) { _etatDe(atelier).copie = r; _remplirApercu(atelier); }
        }
    });

    document.addEventListener('input', function(e) {
        var x = e.target;
        if (!x || !x.dataset || !x.dataset.apercuChamp || x.dataset.apercuChamp === 'sources') return;
        var atelier = atelierDe(x);
        if (!atelier) return;
        if (x.dataset.apercuChamp === 'mots') _changerCopie(atelier, { mots: x.value });
        else if (x.value !== '') _changerCopie(atelier, { erreurs: x.value });
    });

    document.addEventListener('change', function(e) {
        var x = e.target;
        if (!x || !x.dataset || x.dataset.apercuChamp !== 'sources') return;
        page.sources = !!x.checked;
        document.querySelectorAll('.apercu-algo').forEach(function(ap) {
            if (page.sources) ap.removeAttribute('data-sans-sources'); else ap.setAttribute('data-sans-sources', '');
            var c = ap.querySelector('[data-apercu-champ="sources"]');
            if (c) c.checked = page.sources;
        });
    });

    // Survoler une phrase allume sa zone ; survoler (ou parcourir) un bloc allume les zones qui l'acceptent.
    var survol = function(e, oui) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var seg = t.closest('.apercu-algo-segment[data-vers-zone]');
        if (seg) {
            if (!oui && e.relatedTarget && seg.contains(e.relatedTarget)) return;
            var a = atelierDe(seg);
            var p = String(seg.dataset.versZone).split(':');
            if (a) _zones(a).forEach(function(z) {
                var vise = (p[0] === 'enonce' && z.dataset.enonceCle === p[1]) || (p[0] === 'palier' && z.dataset.palierIndex === p[1] && z.dataset.champ === p[2]);
                if (vise) _visible(z).classList.toggle('atelier-algo-montree', oui);
            });
            return;
        }
        var bloc = t.closest('.palette-algo-bloc');
        if (!bloc) return;
        if (!oui && e.relatedTarget && bloc.contains(e.relatedTarget)) return;
        montrer(atelierDe(bloc), bloc.dataset.jeton, oui);
    };
    document.addEventListener('pointerover', function(e) { survol(e, true); });
    document.addEventListener('pointerout', function(e) { survol(e, false); });
    document.addEventListener('focusin', function(e) { if (e.target && e.target.classList && e.target.classList.contains('palette-algo-bloc')) survol(e, true); });
    document.addEventListener('focusout', function(e) { if (e.target && e.target.classList && e.target.classList.contains('palette-algo-bloc')) survol(e, false); });
    // Un bloc posé (le clic) : l'allumage du survol s'éteint, la zone garde le curseur.
    document.addEventListener('animationend', function(e) {
        if (e.target && e.target.classList) e.target.classList.remove('atelier-algo-allume');
    });
}

var api = {
    TEXTES: TEXTES,
    ORDRE: ORDRE,
    etapes: etapes,
    etapeDeZone: etapeDeZone,
    etapesDuJeton: etapesDuJeton,
    copiesDeReference: copiesDeReference,
    copieDeDepart: copieDeDepart,
    copieAvec: copieAvec,
    lecture: lecture,
    cleDeZone: cleDeZone,
    rendre: rendre,
    monter: monter,
    suivre: suivre,
    ouvrir: ouvrir,
    basculerEtape: basculerEtape,
    montrer: montrer,
    allerA: allerA
};

if (typeof window !== 'undefined') {
    window.atelierAlgo = api;
    _brancher();
}
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
