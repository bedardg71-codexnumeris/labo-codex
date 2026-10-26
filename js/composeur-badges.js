/**
 * composeur-badges.js — LE TEXTE TROUÉ, ÉTAPE 3 : le badge s'affiche dans la phrase
 * (lot D du 5 septembre 2026 ; carte `plans de travail/CARTE-2026-09-05-texte-troue-etape-3.md`,
 * relue par Cowork).
 *
 * Une zone qui offre des badges est un `<textarea>` : le badge cliqué y écrit
 * `{erreurs}` en clair, et ce texte brut est ce que la grille enregistre, ce que
 * le moteur lit, ce qui voyage. RIEN DE CELA NE CHANGE. Ce module pose, par-dessus
 * chaque `<textarea>`, une VUE éditable qui rend les `{jetons}` de sa palette
 * comme des pastilles (aux couleurs des blocs de la palette) et le reste comme du
 * texte. Le `<textarea>` reste la valeur — caché, il garde ses attributs, ses
 * handlers, son moment d'écriture (en quittant la zone) ; la vue s'y resynchronise.
 * Si la vue ne peut pas se construire, le `<textarea>` se montre et tout marche
 * comme avant.
 *
 * Deux couches :
 *   - PURE (testable en Node) : `segmenter`, `assembler`, `rendreHtml`, `lireNoeuds`,
 *     `entreesDe` — le texte ↔ ses segments ↔ le HTML de la vue, et la table des
 *     positions texte ↔ nœuds ;
 *   - DOM (sans handler inline) : `monter`, `lire`, `ecrire`, `curseur`, `placerCaret`,
 *     et les délégués `input` / `keydown` / `paste` / `focusout` / `pointerdown` sur
 *     `document`, scopés à `.composeur-badges`.
 *
 * Les sauts de ligne (réserve de Cowork, 5 sept.) : Entrée est intercepté et inséré
 * par `execCommand('insertText', '\n')` ; `\n` se rend `<br>` (plus un `<br>` de
 * fin, le placeholder, quand le texte finit par `\n`) ; `lire` compte `\n` pour
 * chaque `<br>` sauf le dernier enfant de son parent, et fait de tout BLOC une
 * frontière `\n` — ce que WebKit ou Blink produiraient si un Entrée leur échappait.
 *
 * Sécurité : tout texte repasse par `echapperHtml` (`rendreHtml`) ; un `{truc}` hors
 * palette est du texte ; coller ne rend que du `text/plain`.
 */
(function() {
'use strict';

// ------------------------------------------------------------------ couche PURE

var BLOCS = { DIV: true, P: true, LI: true, SECTION: true, BLOCKQUOTE: true, UL: true, OL: true, PRE: true };

// ↻ Porte iPad du 5 sept. (Grégoire, 10 h 27) : « quand je veux ajouter du texte après une
// pastille, le curseur apparaît hors du bloc ». CAUSE MESURÉE : une chip est
// `contenteditable="false"` ; quand elle est le DERNIER nœud de la vue — ou le dernier avant un
// `<br>` de fin de ligne —, le moteur n'a aucune position de caret éditable après elle, et le
// dessine hors du cadre. L'ANCRE : un espace de largeur nulle (U+200B) rendu comme nœud texte
// après toute chip terminale ; c'est là que le caret se pose et que la frappe entre. `lire` la
// retire de la valeur : elle ne fuit jamais dans le `<textarea>`, ni dans la grille.
var ANCRE = '\u200B';
var RE_ANCRE = /\u200B/g;

function _echapperRegExp(t) { return String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function _echapperDefaut(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function _echappeur(esc) {
    if (typeof esc === 'function') return function(t) { return esc(String(t == null ? '' : t)); };
    if (typeof window !== 'undefined' && typeof window.echapperHtml === 'function') return function(t) { return window.echapperHtml(String(t == null ? '' : t)); };
    return _echapperDefaut;
}

/** Les repères valides d'une palette : un jeton `{…}`, une famille, un libellé. */
function _reperesDe(palette) {
    return (Array.isArray(palette) ? palette : []).filter(function(r) {
        return r && typeof r.jeton === 'string' && r.jeton.length > 2 && r.jeton.charAt(0) === '{' && r.jeton.slice(-1) === '}';
    }).map(function(r) {
        return { jeton: r.jeton, famille: r.famille === 'posee' ? 'posee' : 'remplie', libelle: (typeof r.libelle === 'string') ? r.libelle : r.jeton.slice(1, -1) };
    });
}

/**
 * Pure — le texte en segments : `{ type: 'texte', valeur }` et `{ type: 'jeton', jeton,
 * famille, libelle }`, dans l'ordre. Seuls les jetons de la PALETTE font des segments
 * jeton ; `{truc}` hors palette, `{s}`, une accolade seule : du texte. Le plus long jeton
 * gagne quand deux se recouvrent en tête (`{service}` avant `{s}`).
 */
function segmenter(texte, palette) {
    var t = (typeof texte === 'string') ? texte : '';
    var reperes = _reperesDe(palette);
    if (!t) return [];
    if (!reperes.length) return [{ type: 'texte', valeur: t }];
    var motif = new RegExp(reperes.map(function(r) { return _echapperRegExp(r.jeton); })
        .sort(function(a, b) { return b.length - a.length; }).join('|'), 'g');
    var segments = [];
    var dernier = 0;
    var m;
    while ((m = motif.exec(t)) !== null) {
        if (m.index > dernier) segments.push({ type: 'texte', valeur: t.slice(dernier, m.index) });
        var r = null;
        for (var i = 0; i < reperes.length; i++) if (reperes[i].jeton === m[0]) { r = reperes[i]; break; }
        segments.push({ type: 'jeton', jeton: m[0], famille: r.famille, libelle: r.libelle });
        dernier = m.index + m[0].length;
    }
    if (dernier < t.length) segments.push({ type: 'texte', valeur: t.slice(dernier) });
    return segments;
}

/** Pure — les segments recollés, sans rien ajouter ni retirer. */
function assembler(segments) {
    return (Array.isArray(segments) ? segments : []).map(function(s) {
        return (s && s.type === 'jeton') ? s.jeton : ((s && typeof s.valeur === 'string') ? s.valeur : '');
    }).join('');
}

/**
 * Le HTML d'une chip — la pastille de la palette, sans `data-action`, non éditable, avec sa croix.
 * ↻ Étape 2b (22 oct. 2026) : elle montre le NOM du bloc (`libelle`), plus le nom de code ; le
 * jeton reste dans `data-jeton`, c'est lui que `lire` rend au texte.
 */
function _htmlChip(s, esc) {
    return '<span class="repere-enonce repere-enonce--' + esc(s.famille) + ' composeur-chip" contenteditable="false"'
        + ' data-jeton="' + esc(s.jeton) + '" title="' + esc(s.libelle) + '">'
        + esc(s.libelle)
        + '<span class="composeur-chip-croix" aria-hidden="true" title="Retirer ce badge">×</span></span>';
}

/**
 * Pure — le HTML de la vue pour un texte : les segments texte ÉCHAPPÉS (`\n` → `<br>`),
 * les jetons en chips. Un texte qui finit par `\n` reçoit un `<br>` de plus : le
 * placeholder sans lequel aucun moteur ne pose le caret sur la ligne vide.
 */
function rendreHtml(texte, palette, esc) {
    var e = _echappeur(esc);
    var t = (typeof texte === 'string') ? texte : '';
    var segments = segmenter(t, palette);
    var html = segments.map(function(s, i) {
        if (s.type !== 'jeton') return e(s.valeur).replace(/\n/g, '<br>');
        var suivant = segments[i + 1];
        var terminale = !suivant || (suivant.type === 'texte' && suivant.valeur.charAt(0) === '\n');
        return _htmlChip(s, e) + (terminale ? ANCRE : '');
    }).join('');
    if (t.length && t.charAt(t.length - 1) === '\n') html += '<br>';
    return html;
}

// --- les nœuds : ce qu'un DOM (vrai ou simulé) donne à lire ---------------

function _estTexte(n) { return !!n && n.nodeType === 3; }
function _nomDe(n) { return (n && typeof n.nodeName === 'string') ? n.nodeName.toUpperCase() : ''; }
function _estChip(n) {
    if (!n || n.nodeType !== 1) return false;
    if (n.dataset && typeof n.dataset.jeton === 'string') return true;
    return typeof n.getAttribute === 'function' && typeof n.getAttribute('data-jeton') === 'string';
}
function _jetonDe(n) {
    if (n.dataset && typeof n.dataset.jeton === 'string') return n.dataset.jeton;
    return n.getAttribute('data-jeton');
}
function _enfants(n) {
    var liste = n && n.childNodes;
    if (!liste) return [];
    return Array.prototype.slice.call(liste);
}

/**
 * Pure sur des nœuds — la liste plate de ce que la vue contient, dans l'ordre :
 * `{ type: 'texte' | 'jeton' | 'saut' | 'frontiere', texte, noeud, offsetTexte }`.
 * Un `<br>` compte `\n` sauf s'il est le dernier enfant de son parent (le
 * placeholder) ; un bloc pose une frontière `\n` avant son contenu quand quelque
 * chose le précède ; tout autre élément se lit par ses enfants.
 */
function entreesDe(racine) {
    var entrees = [];
    var dejaDuContenu = false;
    function visiter(n, dernierDeSonParent) {
        if (_estTexte(n)) {
            var brut = (typeof n.nodeValue === 'string') ? n.nodeValue : String(n.textContent || '');
            // L'ancre (U+200B) ne vaut rien dans le texte ; son nœud reste une entrée de
            // longueur 0, pour que le caret qui s'y trouve se traduise en position de texte.
            var v = brut.replace(RE_ANCRE, '');
            if (brut.length) {
                entrees.push({ type: 'texte', texte: v, brut: brut, noeud: n });
                if (v.length) dejaDuContenu = true;
            }
            return;
        }
        if (!n || n.nodeType !== 1) return;
        var nom = _nomDe(n);
        if (nom === 'BR') {
            if (!dernierDeSonParent) { entrees.push({ type: 'saut', texte: '\n', noeud: n }); dejaDuContenu = true; }
            return;
        }
        if (_estChip(n)) {
            entrees.push({ type: 'jeton', texte: _jetonDe(n), noeud: n });
            dejaDuContenu = true;
            return;
        }
        if (BLOCS[nom] && dejaDuContenu) {
            entrees.push({ type: 'frontiere', texte: '\n', noeud: n });
        }
        var enfants = _enfants(n);
        for (var i = 0; i < enfants.length; i++) visiter(enfants[i], i === enfants.length - 1);
    }
    var enfants = _enfants(racine);
    for (var i = 0; i < enfants.length; i++) visiter(enfants[i], i === enfants.length - 1);
    var debut = 0;
    for (var j = 0; j < entrees.length; j++) { entrees[j].debut = debut; debut += entrees[j].texte.length; }
    return entrees;
}

/** Pure sur des nœuds — le texte que porte la vue. */
function lireNoeuds(racine) {
    return entreesDe(racine).map(function(e) { return e.texte; }).join('');
}

// ------------------------------------------------------------------ couche DOM

function _document() { return (typeof document !== 'undefined') ? document : null; }

/**
 * Le composeur est-il disponible dans ce moteur ? Mesuré UNE fois (mémorisé) :
 * une sélection, un élément qui accepte `contentEditable`. ⛔ Pas une option.
 */
var _disponible = null;
function disponible(doc) {
    var d = doc || _document();
    if (doc === undefined && _disponible !== null) return _disponible;
    var ok = false;
    try {
        var win = (typeof window !== 'undefined') ? window : null;
        if (d && win && typeof win.getSelection === 'function' && typeof d.createElement === 'function') {
            var div = d.createElement('div');
            if (div && 'isContentEditable' in div) {
                div.contentEditable = 'true';
                ok = String(div.contentEditable) === 'true';
            }
        }
    } catch (err) {
        ok = false;
    }
    if (doc === undefined) _disponible = ok;
    return ok;
}

/** La palette d'une zone : celle des paliers, ou celle de l'énoncé qu'elle porte. */
function paletteDe(textarea) {
    if (!textarea || !textarea.dataset) return [];
    var win = (typeof window !== 'undefined') ? window : {};
    if (textarea.dataset.palierIndex !== undefined) {
        return (win.projectionAlgo && typeof win.projectionAlgo.listerReperes === 'function') ? win.projectionAlgo.listerReperes() : [];
    }
    // Lot 3b de la table de cas (26 oct. 2026) : le texte d'un cas offre ce qu'offre un palier, plus {points}.
    if (textarea.dataset.tableCas !== undefined) {
        return (win.paletteAlgo && typeof win.paletteAlgo.reperesDesTables === 'function') ? win.paletteAlgo.reperesDesTables() : [];
    }
    if (textarea.dataset.enonceCle !== undefined) {
        return (win.enoncesAlgo && typeof win.enoncesAlgo.reperesDeCle === 'function') ? win.enoncesAlgo.reperesDeCle(textarea.dataset.enonceCle) : [];
    }
    return [];
}

/** La palette que la vue d'une zone reçoit : celle que `nommer` rend (étape 2b), sinon celle des registres. */
function _paletteMontee(textarea, nommer) {
    return (typeof nommer === 'function') ? (nommer(textarea) || []) : paletteDe(textarea);
}

function vueDe(textarea) { return (textarea && textarea._composeurVue) || null; }
function textareaDe(vue) { return (vue && vue._composeurTextarea) || null; }

/** Le texte que porte une vue. */
function lire(vue) { return lireNoeuds(vue); }

/** Redessine la vue depuis un texte, met le `<textarea>` à jour, replace le caret. */
function ecrire(vue, texte, position) {
    var t = (typeof texte === 'string') ? texte : '';
    var textarea = textareaDe(vue);
    vue.innerHTML = rendreHtml(t, vue._composeurPalette, null);
    if (textarea) textarea.value = t;
    if (typeof position === 'number') placerCaret(vue, position);
}

/** La sélection courante, en positions de TEXTE ({ debut, fin }) ; null si elle n'est pas dans la vue. */
function curseur(vue) {
    var win = (typeof window !== 'undefined') ? window : null;
    if (!win || typeof win.getSelection !== 'function') return null;
    var sel = win.getSelection();
    if (!sel || !sel.rangeCount) return null;
    var range = sel.getRangeAt(0);
    if (!vue.contains(range.startContainer) || !vue.contains(range.endContainer)) return null;
    var entrees = entreesDe(vue);
    return { debut: _positionDe(vue, entrees, range.startContainer, range.startOffset),
             fin: _positionDe(vue, entrees, range.endContainer, range.endOffset) };
}

/** Dans un nœud texte, l'offset DOM → le nombre de caractères de TEXTE avant lui (les ancres ne comptent pas). */
function _positionTexte(brut, offsetDom) {
    return String(brut || '').slice(0, Math.max(0, offsetDom)).replace(RE_ANCRE, '').length;
}

/** Dans un nœud texte, une position de TEXTE → l'offset DOM, posé APRÈS les ancres qui la touchent. */
function _offsetDom(brut, positionTexte) {
    var b = String(brut || '');
    var i = 0, n = 0;
    while (i < b.length && (n < positionTexte || b.charAt(i) === ANCRE)) {
        if (b.charAt(i) !== ANCRE) n++;
        i++;
    }
    return i;
}

/** Un point (nœud, offset) du DOM → une position dans le texte de la vue. */
function _positionDe(vue, entrees, noeud, offset) {
    var total = entrees.length ? (entrees[entrees.length - 1].debut + entrees[entrees.length - 1].texte.length) : 0;
    if (_estTexte(noeud)) {
        for (var i = 0; i < entrees.length; i++) {
            if (entrees[i].noeud === noeud) return entrees[i].debut + Math.min(_positionTexte(entrees[i].brut, offset), entrees[i].texte.length);
        }
        return total;
    }
    // Dans une chip (non éditable) : après elle.
    var chip = (noeud && typeof noeud.closest === 'function') ? noeud.closest('.composeur-chip') : null;
    if (chip && chip !== vue) {
        for (var c = 0; c < entrees.length; c++) if (entrees[c].noeud === chip) return entrees[c].debut + entrees[c].texte.length;
    }
    // Un élément : la position du `offset`-ième enfant, ou la fin de l'élément.
    var enfants = _enfants(noeud);
    if (offset < enfants.length) {
        var cible = enfants[offset];
        for (var k = 0; k < entrees.length; k++) {
            if (entrees[k].noeud === cible || (typeof cible.contains === 'function' && cible !== vue && cible.contains(entrees[k].noeud))) return entrees[k].debut;
        }
        // L'enfant ne porte rien (placeholder, span vide) : la fin de ce qui le précède.
        for (var p = offset - 1; p >= 0; p--) {
            for (var q = entrees.length - 1; q >= 0; q--) {
                if (entrees[q].noeud === enfants[p] || (typeof enfants[p].contains === 'function' && enfants[p].contains(entrees[q].noeud))) return entrees[q].debut + entrees[q].texte.length;
            }
        }
        return 0;
    }
    if (noeud === vue) return total;
    for (var z = entrees.length - 1; z >= 0; z--) {
        if (typeof noeud.contains === 'function' && noeud.contains(entrees[z].noeud)) return entrees[z].debut + entrees[z].texte.length;
    }
    return total;
}

/** Pose le caret à une position de TEXTE dans la vue. */
function placerCaret(vue, position) {
    var d = _document();
    var win = (typeof window !== 'undefined') ? window : null;
    if (!d || !win || typeof win.getSelection !== 'function' || typeof d.createRange !== 'function') return false;
    var entrees = entreesDe(vue);
    var total = entrees.length ? (entrees[entrees.length - 1].debut + entrees[entrees.length - 1].texte.length) : 0;
    var pos = Math.max(0, Math.min(typeof position === 'number' ? position : total, total));
    var range = d.createRange();
    var pose = false;
    for (var i = 0; i < entrees.length && !pose; i++) {
        var e = entrees[i];
        var fin = e.debut + e.texte.length;
        if (pos < e.debut || pos > fin) continue;
        if (e.type === 'texte') { range.setStart(e.noeud, _offsetDom(e.brut, pos - e.debut)); pose = true; }
        else if (pos === e.debut && e.type !== 'frontiere') { range.setStartBefore(e.noeud); pose = true; }
        else if (e.type === 'frontiere') { if (pos === fin) { range.setStart(e.noeud, 0); pose = true; } }
        else if (e.type === 'jeton' && entrees[i + 1] && entrees[i + 1].type === 'texte' && entrees[i + 1].brut && entrees[i + 1].brut.charAt(0) === ANCRE) {
            // Après une chip terminale : DANS l'ancre, la seule position que le moteur dessine.
            range.setStart(entrees[i + 1].noeud, _offsetDom(entrees[i + 1].brut, 0)); pose = true;
        }
        else { range.setStartAfter(e.noeud); pose = true; }
    }
    if (!pose) {
        if (entrees.length && pos >= total) range.setStartAfter(entrees[entrees.length - 1].noeud);
        else range.setStart(vue, 0);
    }
    range.collapse(true);
    var sel = win.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
}

/**
 * Pose la vue par-dessus un `<textarea>` (qui se cache et garde tout). Rend la vue,
 * ou null si le composeur n'est pas disponible, si la zone n'offre aucune palette, ou
 * si le moteur refuse — le `<textarea>` reste alors visible pour cette zone.
 * `nommer` (étape 2b) : `function(textarea)` qui rend la palette de la zone, nommée pour son
 * critère (`paletteAlgo.reperesDeZone`) ; sans lui, celle des registres (`paletteDe`).
 */
function monter(textarea, nommer) {
    if (!textarea || !disponible()) return null;
    if (vueDe(textarea)) return vueDe(textarea);
    var palette = _paletteMontee(textarea, nommer);
    if (!palette.length) return null;
    var d = _document();
    try {
        var vue = d.createElement('div');
        vue.className = 'controle-form composeur-badges';
        vue.setAttribute('contenteditable', 'true');
        vue.setAttribute('role', 'textbox');
        vue.setAttribute('aria-multiline', 'true');
        if (textarea.getAttribute && textarea.getAttribute('aria-label')) vue.setAttribute('aria-label', textarea.getAttribute('aria-label'));
        if (textarea.placeholder) vue.setAttribute('data-placeholder', textarea.placeholder);
        vue._composeurTextarea = textarea;
        vue._composeurPalette = palette;
        textarea._composeurVue = vue;
        vue.innerHTML = rendreHtml(textarea.value || '', palette, null);
        textarea.parentNode.insertBefore(vue, textarea.nextSibling);
        textarea.hidden = true;
        textarea.dataset.composeur = '1';
        textarea.dataset.composeurEcrit = textarea.value || '';
        return vue;
    } catch (err) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[composeur-badges] la vue ne se construit pas, le champ reste tel quel :', err);
        if (textarea) { textarea.hidden = false; delete textarea._composeurVue; }
        return null;
    }
}

/** Pose une vue sur chaque zone à badges d'une racine (les paliers, les énoncés, les cas des tables). `nommer` : voir `monter`. */
function monterTout(racine, nommer) {
    var r = racine || _document();
    if (!r || typeof r.querySelectorAll !== 'function' || !disponible()) return 0;
    var zones = r.querySelectorAll('textarea[data-palier-index], textarea[data-enonce-cle], textarea[data-table-cas]');
    var n = 0;
    for (var i = 0; i < zones.length; i++) if (monter(zones[i], nommer)) n++;
    return n;
}

/** La vue → le `<textarea>` ; si la valeur a changé depuis la dernière écriture, `change` part du `<textarea>`. */
function _synchroniser(vue, emettreChange) {
    var textarea = textareaDe(vue);
    if (!textarea) return;
    var t = lire(vue);
    textarea.value = t;
    if (emettreChange && t !== (textarea.dataset.composeurEcrit || '')) {
        textarea.dataset.composeurEcrit = t;
        if (typeof Event === 'function' && typeof textarea.dispatchEvent === 'function') {
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

function _insererTexte(vue, texte) {
    var d = _document();
    var insere = false;
    try { insere = d.execCommand('insertText', false, texte); } catch (err) { insere = false; }
    if (!insere) {
        var c = curseur(vue);
        var t = lire(vue);
        var a = c ? c.debut : t.length;
        var b = c ? c.fin : t.length;
        ecrire(vue, t.slice(0, a) + texte + t.slice(b), a + texte.length);
    }
    _synchroniser(vue, false);
}

function _vueDeCible(cible) {
    return (cible && typeof cible.closest === 'function') ? cible.closest('.composeur-badges') : null;
}

// Les délégués — une fois, sur `document` ; zéro handler inline.
(function brancher() {
    var d = _document();
    if (!d || typeof d.addEventListener !== 'function') return;
    d.addEventListener('input', function(e) {
        var vue = _vueDeCible(e.target);
        if (vue) _synchroniser(vue, false);
    });
    d.addEventListener('keydown', function(e) {
        var vue = _vueDeCible(e.target);
        if (!vue || e.key !== 'Enter') return;
        e.preventDefault();
        _insererTexte(vue, '\n');
    });
    d.addEventListener('paste', function(e) {
        var vue = _vueDeCible(e.target);
        if (!vue) return;
        var presse = e.clipboardData || (typeof window !== 'undefined' && window.clipboardData);
        if (!presse) return;
        e.preventDefault();
        var texte = String(presse.getData('text/plain') || '').replace(/\r\n?/g, '\n');
        if (texte) _insererTexte(vue, texte);
    });
    d.addEventListener('focusout', function(e) {
        var vue = _vueDeCible(e.target);
        if (vue) _synchroniser(vue, true);
    });
    d.addEventListener('pointerdown', function(e) {
        var croix = (e.target && typeof e.target.closest === 'function') ? e.target.closest('.composeur-chip-croix') : null;
        if (!croix) return;
        var vue = _vueDeCible(croix);
        var chip = croix.closest('.composeur-chip');
        if (!vue || !chip) return;
        e.preventDefault();
        var entrees = entreesDe(vue);
        var position = 0;
        for (var i = 0; i < entrees.length; i++) if (entrees[i].noeud === chip) { position = entrees[i].debut; break; }
        chip.parentNode.removeChild(chip);
        var t = lire(vue);
        ecrire(vue, t, position);
        _synchroniser(vue, false);
    });
})();

var api = {
    segmenter: segmenter,
    assembler: assembler,
    rendreHtml: rendreHtml,
    entreesDe: entreesDe,
    lireNoeuds: lireNoeuds,
    disponible: disponible,
    paletteDe: paletteDe,
    monter: monter,
    monterTout: monterTout,
    lire: lire,
    ecrire: ecrire,
    curseur: curseur,
    placerCaret: placerCaret,
    vueDe: vueDe,
    textareaDe: textareaDe
};

if (typeof window !== 'undefined') window.composeurBadges = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
