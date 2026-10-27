/* ===============================
   MODULE COMPOSEUR-CALCUL — « Composer ton propre calcul » et « Retoucher ce calcul »
   Date : 27 octobre 2026 (étape 4b du critère algorithmique ; consigne
   `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4b.md`, ébauche validée
   `plans de travail/EBAUCHE-2026-10-26-calculs.html`, qui fait foi pour ce que l'enseignant·e voit)

   Vocation
     Sous les cartes de l'étape « Note calculée », le composeur : un nom, la zone « Note = » et ses
     pastilles, les données, un nombre, les opérations ; la ligne « Sur la copie fictive : … » et
     « Quand une donnée de la copie vaut 0 » ; « Garder ce calcul » et « Annuler ».

   CE QUI VIT EN MÉMOIRE, JAMAIS DANS LA GRILLE
     Le BROUILLON, par critère (la clé de l'atelier : cible et critère), et l'ouverture du composeur.
     Poser un bloc, taper le nom ou un nombre ne redessinent que le composeur : le gabarit, le focus et le
     défilement restent. Rien n'est écrit avant « Garder », que porte `grilles.js` (`garderCalculAlgo`) :
     le calcul, ses règles et ses messages sont ceux du registre (`formulesAlgo`).

   Sécurité : le nom d'un calcul est un texte de l'enseignant·e : échappé dans le rendu en chaîne (`_esc`)
   ou posé par `textContent` (règle 1) ; les écouteurs sont délégués, aucun gestionnaire en ligne (règle 2).
   Dépendances (lues à l'appel) : formulesAlgo, enoncesAlgo, atelierAlgo (la copie fictive).
   =============================== */

(function() {
'use strict';

function _F() { return (typeof window !== 'undefined' && window.formulesAlgo) || require('./evaluation-formules.js'); }
function _E() { return (typeof window !== 'undefined' && window.enoncesAlgo) || require('./evaluation-enonces.js'); }

/** Les mots du composeur : ceux de l'ébauche validée (26 oct.), au caractère près. */
var TEXTES = {
    titre: 'Composer ton propre calcul ',
    avance: '(fonction avancée)',
    intro: 'Comme dans un tableur : tu poses les données de la copie, tes nombres et les opérations. Le résultat se voit sur la copie fictive pendant que tu écris.',
    nom: 'Nom du calcul',
    exemple: function(N) { return 'ex. : taux pour 100 ' + N.mots.pluriel; },
    note: 'Note =',
    vide: 'Vide : touche une donnée, un nombre ou une opération.',
    donnees: 'Données',
    nombre: 'Nombre',
    exempleNombre: 'ex. : 100',
    poser: 'Poser ce nombre',
    operations: 'Opérations',
    nomsOperations: { '+': 'plus', '−': 'moins', '×': 'multiplié par', '÷': 'divisé par', '(': 'ouvrir une parenthèse', ')': 'fermer la parenthèse' },
    retirerDernier: 'Retirer le dernier',
    toutEffacer: 'Tout effacer',
    copie: 'Sur la copie fictive : ',
    casTitre: 'Quand une donnée de la copie vaut 0',
    casDivise: 'Une division par une donnée qui vaut 0 n’a pas de résultat : tu dis ce que vaut alors la note.',
    garder: 'Garder ce calcul',
    garderChangements: 'Garder les changements',
    annuler: 'Annuler'
};
var OPERATIONS = ['+', '−', '×', '÷', '(', ')'];

var brouillons = {};
var ouverts = {};
var messages = {};   // la ligne « Calcul « X » gardé… », ou un refus, dite une fois en tête de l'étape
var retraits = {};   // la confirmation de « Retirer ce calcul » en cours, par critère

function cle(cible, critere, index) {
    return cible + ':' + ((critere && critere.id) || ('critere-' + index));
}
function _cleCtx(ctx, critere) {
    return cle(ctx.mode === 'temp' ? 'temp' : ctx.grilleId, critere, ctx.index);
}

function _esc(t) {
    var s = String(t == null ? '' : t);
    if (typeof window !== 'undefined' && typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Le brouillon du critère (vide au départ). */
function brouillonDe(k) {
    if (!brouillons[k]) brouillons[k] = { id: null, nom: '', jetons: [], cas: {} };
    return brouillons[k];
}

/** « Retoucher ce calcul » / « Modifier ce calcul » : le brouillon prérempli, le composeur ouvert. */
function ouvrirAvec(k, brouillon) {
    if (!brouillon) return;
    brouillons[k] = brouillon;
    ouverts[k] = true;
}

/** Après « Garder » ou « Annuler » : plus de brouillon, le composeur replié. */
function fermer(k) {
    delete brouillons[k];
    ouverts[k] = false;
}

function dire(k, message) { messages[k] = message || ''; }
/** Le message de l'étape, une seule fois. */
function prendreMessage(k) {
    var m = messages[k] || '';
    delete messages[k];
    return m;
}
function retraitDe(k) { return retraits[k] || null; }
function poserRetrait(k, id) { if (id) retraits[k] = id; else delete retraits[k]; }

/** Le nombre tapé, virgule acceptée (« 2,5 ») ; null s'il ne se lit pas. */
function lireNombre(texte) {
    var t = String(texte == null ? '' : texte).trim().replace(/\s/g, '').replace(',', '.');
    if (!t || !/^-?\d*\.?\d+$/.test(t)) return null;
    var v = Number(t);
    return isFinite(v) ? v : null;
}

/* ---------------------------------------------------------------------
   Le rendu (une chaîne, insérée par grilles.js dans l'étape « Note calculée »)
   --------------------------------------------------------------------- */

function _pastilles(critere, jetons) {
    return _F().blocsDesJetons(critere, jetons).map(function(b) {
        return b.genre === 'operation'
            ? '<span class="calc-op">' + _esc(b.texte) + '</span>'
            : '<span class="repere-enonce repere-enonce--' + (b.genre === 'donnee' ? 'remplie' : 'posee') + '">' + _esc(b.texte) + '</span>';
    }).join(' ');
}

function _boutons(critere) {
    var F = _F();
    var donnees = F.DONNEES.map(function(d) {
        return '<button type="button" class="calc-btn-donnee repere-enonce repere-enonce--' + (d === 'ponderation' ? 'posee' : 'remplie')
            + '" data-composeur-geste="donnee" data-valeur="' + _esc(d) + '">' + _esc(F.nomDonnee(d, critere)) + '</button>';
    }).join('');
    var ops = OPERATIONS.map(function(o) {
        return '<button type="button" class="btn btn-secondaire calc-btn-op" data-composeur-geste="operation" data-valeur="' + _esc(o)
            + '" aria-label="' + _esc(TEXTES.nomsOperations[o]) + '">' + _esc(o) + '</button>';
    }).join('');
    return '<div class="calc-boutons" role="group" aria-label="Les données"><span class="calc-groupe">' + _esc(TEXTES.donnees) + '</span>' + donnees + '</div>'
        + '<div class="calc-boutons" role="group" aria-label="Un nombre"><span class="calc-groupe">' + _esc(TEXTES.nombre) + '</span>'
        + '<input type="text" class="controle-form calc-nombre" inputmode="decimal" autocomplete="off" aria-label="' + _esc(TEXTES.nombre) + '" placeholder="' + _esc(TEXTES.exempleNombre) + '" data-composeur-champ="nombre">'
        + '<button type="button" class="btn btn-secondaire" data-composeur-geste="nombre">' + _esc(TEXTES.poser) + '</button></div>'
        + '<div class="calc-boutons" role="group" aria-label="Les opérations"><span class="calc-groupe">' + _esc(TEXTES.operations) + '</span>' + ops + '</div>'
        + '<div class="calc-boutons"><button type="button" class="table-cas-lien" data-composeur-geste="retirer">' + _esc(TEXTES.retirerDernier) + '</button>'
        + '<button type="button" class="table-cas-lien" data-composeur-geste="effacer">' + _esc(TEXTES.toutEffacer) + '</button></div>';
}

function _cas(critere, b) {
    var off = _F().casDuBrouillon(critere, b);
    if (!off.rangees.length) return '';
    var rangees = off.rangees.map(function(r) {
        return '<div class="calc-cas-rangee"><span>Si <span class="repere-enonce repere-enonce--remplie">' + _esc(r.nom) + '</span> vaut 0</span>'
            + '<select class="controle-form" aria-label="Si ' + _esc(r.nom) + ' vaut 0" data-composeur-cas="' + _esc(r.donnee) + '">'
            + r.choix.map(function(o) { return '<option value="' + _esc(o.valeur) + '"' + (o.valeur === r.actuel ? ' selected' : '') + '>' + _esc(o.libelle) + '</option>'; }).join('')
            + '</select></div>';
    }).join('');
    return '<div class="calc-cas"><p class="calc-cas-titre">' + _esc(TEXTES.casTitre) + '</p>' + rangees
        + (off.divise ? '<p class="calc-legende">' + _esc(TEXTES.casDivise) + '</p>' : '') + '</div>';
}

/** Le corps du composeur (redessiné seul à chaque geste). */
function _corps(critere, ctx, k) {
    var b = brouillonDe(k), F = _F();
    var cible = ctx.mode === 'temp' ? 'temp' : ctx.grilleId;
    var refus = F.refusDuBrouillon(critere, b);
    var zone = b.jetons.length ? _pastilles(critere, b.jetons) : '<span class="calc-rien">' + _esc(TEXTES.vide) + '</span>';
    return '<p class="calc-legende">' + _esc(TEXTES.intro) + '</p>'
        + '<div class="groupe-form calc-param"><label for="' + _esc('compNom-' + k) + '">' + _esc(TEXTES.nom) + '</label>'
        + '<input type="text" class="controle-form" id="' + _esc('compNom-' + k) + '" maxlength="80" autocomplete="off" value="' + _esc(b.nom) + '" placeholder="' + _esc(TEXTES.exemple(_E().noms(critere))) + '" data-composeur-champ="nom"></div>'
        + '<div class="calc-formule calc-zone" aria-live="polite"><span class="calc-op">' + _esc(TEXTES.note) + '</span> ' + zone + '</div>'
        + _boutons(critere)
        + (b.jetons.length ? '<p class="calc-copie"><span class="calc-legende">' + _esc(TEXTES.copie) + '</span><span data-composeur-copie></span></p>' + _cas(critere, b) : '')
        + '<div class="calc-boutons calc-composeur-fin">'
        + '<button type="button" class="btn btn-principal" data-action="garderCalculAlgo" data-cible="' + _esc(cible) + '" data-critere-index="' + _esc(ctx.index) + '"'
        + (refus ? ' aria-disabled="true"' : '') + '>' + _esc(b.id ? TEXTES.garderChangements : TEXTES.garder) + '</button>'
        + '<button type="button" class="btn btn-secondaire" data-composeur-geste="annuler">' + _esc(TEXTES.annuler) + '</button>'
        + '<span class="calc-legende calc-composeur-refus" data-composeur-refus>' + _esc(refus) + '</span></div>';
}

/** Le composeur d'un critère : `<details>` replié sous les cartes, ouvert tant qu'un brouillon y est en cours. */
function rendre(critere, ctx) {
    var k = _cleCtx(ctx, critere);
    return '\n                <details class="calc-composeur" data-composeur="' + _esc(k) + '"' + (ouverts[k] ? ' open' : '') + '>'
        + '<summary>' + _esc(TEXTES.titre) + '<span class="calc-legende">' + _esc(TEXTES.avance) + '</span></summary>'
        + '<div class="calc-composeur-corps">' + _corps(critere, ctx, k) + '</div></details>';
}

/* ---------------------------------------------------------------------
   Les gestes (la page) : rien n'est écrit dans la grille
   --------------------------------------------------------------------- */

function _atelierDe(el) { return el && el.closest ? el.closest('.gabarit-algo[data-atelier-algo]') : null; }

/** La ligne « Sur la copie fictive : … » du brouillon, avec la copie de l'atelier. */
function remplirLigne(atelier) {
    if (!atelier || !atelier._critere) return;
    var det = atelier.querySelector('details[data-composeur]');
    var x = det ? det.querySelector('[data-composeur-copie]') : null;
    if (!x || !window.atelierAlgo || typeof window.atelierAlgo.donneesDeLaCopie !== 'function') return;
    var d = window.atelierAlgo.donneesDeLaCopie(atelier);
    x.textContent = d ? _F().ligneDuBrouillon(atelier._critere, brouillonDe(det.dataset.composeur), d) : '';
}

/** Redessine le corps du composeur seul ; le focus revient au contrôle du même geste, le défilement ne bouge pas. */
function _redessiner(det, focus) {
    var atelier = _atelierDe(det);
    if (!atelier || !atelier._critere || !atelier._ctx) return;
    var y = window.scrollY;
    det.querySelector('.calc-composeur-corps').innerHTML = _corps(atelier._critere, atelier._ctx, det.dataset.composeur);
    remplirLigne(atelier);
    var cible = focus ? det.querySelector(focus) : null;
    if (cible) { try { cible.focus({ preventScroll: true }); } catch (e) { cible.focus(); } }
    if (window.scrollY !== y) window.scrollTo(window.scrollX, y);
}

function _selecteur(el) {
    if (el.dataset.composeurGeste) {
        return '[data-composeur-geste="' + el.dataset.composeurGeste + '"]'
            + (el.dataset.valeur ? '[data-valeur="' + el.dataset.valeur.replace(/"/g, '\\"') + '"]' : '');
    }
    return el.dataset.composeurCas ? '[data-composeur-cas="' + el.dataset.composeurCas + '"]' : null;
}

function _poser(b, j) {
    if (b.jetons.length >= 60) return false;
    b.jetons.push(j);
    return true;
}

/** Un geste du composeur ; rend vrai s'il faut redessiner. */
function _geste(det, el, b) {
    var g = el.dataset.composeurGeste, v = el.dataset.valeur;
    if (g === 'donnee') return _poser(b, { t: 'd', k: v });
    if (g === 'operation') return _poser(b, (v === '(' || v === ')') ? { t: v } : { t: 'o', v: v });
    if (g === 'nombre') {
        var champ = det.querySelector('[data-composeur-champ="nombre"]');
        var n = lireNombre(champ && champ.value);
        return n !== null && _poser(b, { t: 'n', v: n });
    }
    if (g === 'retirer') { b.jetons.pop(); return true; }
    if (g === 'effacer') { b.jetons = []; return true; }
    return false;
}

/** « Retoucher ce calcul » et « Modifier ce calcul », sur une carte : le composeur s'ouvre, prérempli. */
function _ouvrirDepuisCarte(el) {
    var atelier = _atelierDe(el);
    var det = atelier ? atelier.querySelector('details[data-composeur]') : null;
    if (!det) return;
    var F = _F(), c = atelier._critere;
    var b = el.dataset.composeurGeste === 'retoucher' ? F.brouillonRetouche(c, el.dataset.valeur) : F.brouillonDuCalcul(c, el.dataset.valeur);
    if (!b) return;
    ouvrirAvec(det.dataset.composeur, b);
    det.open = true;
    _redessiner(det, null);
    var nom = det.querySelector('[data-composeur-champ="nom"]');
    if (nom) { try { nom.focus({ preventScroll: true }); } catch (e) { nom.focus(); } }
    det.scrollIntoView({ block: 'start', behavior: _sansMouvement() ? 'auto' : 'smooth' });
}

function _sansMouvement() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function _brancher() {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    document.addEventListener('click', function(e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-composeur-geste]') : null;
        if (!el) return;
        var g = el.dataset.composeurGeste;
        if (g === 'retoucher' || g === 'modifier') { _ouvrirDepuisCarte(el); return; }
        var det = el.closest('details[data-composeur]');
        if (!det) return;
        var k = det.dataset.composeur;
        if (g === 'annuler') { fermer(k); det.open = false; _redessiner(det, null); return; }
        if (_geste(det, el, brouillonDe(k))) _redessiner(det, _selecteur(el));
    });
    document.addEventListener('input', function(e) {
        var x = e.target;
        if (!x || !x.dataset || x.dataset.composeurChamp !== 'nom') return;
        var det = x.closest('details[data-composeur]');
        if (!det) return;
        brouillonDe(det.dataset.composeur).nom = x.value;
        _majRefus(det);
        remplirLigne(_atelierDe(det));
    });
    document.addEventListener('keydown', function(e) {
        var x = e.target;
        if (e.key !== 'Enter' || !x || !x.dataset || x.dataset.composeurChamp !== 'nombre') return;
        e.preventDefault();
        var b = x.closest('details[data-composeur]');
        var bouton = b ? b.querySelector('[data-composeur-geste="nombre"]') : null;
        if (bouton) bouton.click();
    });
    document.addEventListener('change', function(e) {
        var x = e.target;
        if (!x || !x.dataset || !x.dataset.composeurCas) return;
        var det = x.closest('details[data-composeur]');
        if (!det) return;
        var b = brouillonDe(det.dataset.composeur);
        b.cas = Object.assign({}, b.cas);
        b.cas[x.dataset.composeurCas] = x.value;
        _redessiner(det, _selecteur(x));
    });
    // `toggle` ne remonte pas : écouté en capture. L'ouverture survit au redessin du gabarit.
    document.addEventListener('toggle', function(e) {
        var det = e.target;
        if (det && det.dataset && det.dataset.composeur) ouverts[det.dataset.composeur] = det.open;
    }, true);
}

/** Le refus de « Garder » suit la frappe du nom, sans redessin (le focus reste dans le champ). */
function _majRefus(det) {
    var atelier = _atelierDe(det);
    if (!atelier || !atelier._critere) return;
    var refus = _F().refusDuBrouillon(atelier._critere, brouillonDe(det.dataset.composeur));
    var span = det.querySelector('[data-composeur-refus]');
    if (span) span.textContent = refus;
    var garder = det.querySelector('[data-action="garderCalculAlgo"]');
    if (garder) { if (refus) garder.setAttribute('aria-disabled', 'true'); else garder.removeAttribute('aria-disabled'); }
}

/** Après un refus de « Garder » : le composeur dit pourquoi, sans redessin du gabarit. */
function refuser(k, message) {
    var det = document.querySelector('details[data-composeur="' + String(k).replace(/"/g, '\\"') + '"]');
    var span = det ? det.querySelector('[data-composeur-refus]') : null;
    if (span) span.textContent = message;
}

var api = {
    TEXTES: TEXTES,
    cle: cle,
    brouillonDe: brouillonDe,
    ouvrirAvec: ouvrirAvec,
    fermer: fermer,
    dire: dire,
    prendreMessage: prendreMessage,
    retraitDe: retraitDe,
    poserRetrait: poserRetrait,
    lireNombre: lireNombre,
    rendre: rendre,
    remplirLigne: remplirLigne,
    refuser: refuser
};

if (typeof window !== 'undefined') {
    window.composeurCalcul = api;
    _brancher();
}
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
