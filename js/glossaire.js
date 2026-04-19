/**
 * glossaire.js — Moteur de rendu du glossaire contextuel
 *
 * Source des données : js/glossaire-data.js (48 termes validés le 19 avril 2026).
 *
 * Deux accès :
 *
 *  1) Micro-popup inline
 *     Tout élément portant l'attribut `data-glossaire="cle"` (et généralement
 *     la classe `.glossaire-terme`) ouvre au clic un micro-popup affichant le
 *     résumé (première phrase) + bouton «En savoir plus» vers la page dédiée.
 *
 *  2) Page dédiée (Aide)
 *     `window.glossaire.afficherDansConteneur(el)` rend la liste alphabétique
 *     filtrable par étape du parcours dans le conteneur passé.
 *     `window.glossaire.afficherTerme('cle')` ouvre directement une fiche.
 *
 * Utilitaire optionnel :
 *
 *  `window.glossaire.enrichirTermesGlossaire(html)` enveloppe la première
 *  occurrence de chaque terme connu dans le HTML passé par une balise
 *  `<span class="glossaire-terme" data-glossaire="cle">…</span>`. À utiliser
 *  avec parcimonie — limité aux popups et états vides pour éviter le bruit
 *  visuel sur les textes courts (infobulles, libellés).
 */

(function() {
'use strict';

function glossaire() {
    return (typeof window !== 'undefined' && window.GLOSSAIRE) || {};
}

function echapper(s) {
    if (typeof echapperHtml === 'function') return echapperHtml(s);
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

function resumeDefinition(definition) {
    // Première phrase (jusqu'au premier . suivi d'espace ou de fin de chaîne)
    if (!definition) return '';
    var m = definition.match(/^([^.!?]*[.!?])(\s|$)/);
    return (m ? m[1] : definition).trim();
}

// =========================================================================
// Micro-popup inline
// =========================================================================

var ID_POPUP = 'glossaire-micropopup';

function fermerMicroPopup() {
    var el = document.getElementById(ID_POPUP);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function afficherMicroPopup(terme, cible) {
    fermerMicroPopup();

    var popup = document.createElement('div');
    popup.id = ID_POPUP;
    popup.className = 'glossaire-micropopup';
    popup.setAttribute('role', 'tooltip');

    var titre = document.createElement('div');
    titre.className = 'glossaire-micropopup-titre';
    titre.textContent = terme.terme;
    popup.appendChild(titre);

    var resume = document.createElement('div');
    resume.className = 'glossaire-micropopup-resume';
    resume.textContent = resumeDefinition(terme.definition);
    popup.appendChild(resume);

    var actions = document.createElement('div');
    actions.className = 'glossaire-micropopup-actions';

    var lienEnSavoirPlus = document.createElement('button');
    lienEnSavoirPlus.type = 'button';
    lienEnSavoirPlus.className = 'glossaire-lien-ensavoirplus';
    lienEnSavoirPlus.textContent = 'En savoir plus';
    lienEnSavoirPlus.addEventListener('click', function(e) {
        e.stopPropagation();
        fermerMicroPopup();
        afficherTerme(terme.cle);
    });
    actions.appendChild(lienEnSavoirPlus);

    var btnFermer = document.createElement('button');
    btnFermer.type = 'button';
    btnFermer.className = 'glossaire-micropopup-fermer';
    btnFermer.setAttribute('aria-label', 'Fermer');
    btnFermer.textContent = '\u2715';
    btnFermer.addEventListener('click', function(e) {
        e.stopPropagation();
        fermerMicroPopup();
    });
    actions.appendChild(btnFermer);

    popup.appendChild(actions);
    document.body.appendChild(popup);

    positionnerProche(popup, cible);

    requestAnimationFrame(function() {
        popup.classList.add('visible');
    });
}

function positionnerProche(popup, cible) {
    if (!cible) return;
    var rect = cible.getBoundingClientRect();
    var pw = popup.offsetWidth || 320;
    var ph = popup.offsetHeight || 140;
    var marge = 8;
    var left = rect.left + window.scrollX;
    var top = rect.bottom + window.scrollY + marge;

    // Clamp horizontal au viewport
    var maxLeft = window.scrollX + document.documentElement.clientWidth - pw - marge;
    if (left > maxLeft) left = maxLeft;
    if (left < window.scrollX + marge) left = window.scrollX + marge;

    // Si déborde en bas, placer au-dessus de la cible
    var maxBottom = window.scrollY + document.documentElement.clientHeight - marge;
    if (top + ph > maxBottom) {
        top = rect.top + window.scrollY - ph - marge;
    }

    popup.style.left = Math.round(left) + 'px';
    popup.style.top = Math.round(top) + 'px';
}

// =========================================================================
// Page dédiée
// =========================================================================

function listerTermesTries() {
    var dict = glossaire();
    return Object.keys(dict).map(function(k) { return dict[k]; }).sort(function(a, b) {
        return a.terme.localeCompare(b.terme, 'fr');
    });
}

var ETAPE_LIBELLES = {
    'numerisation': 'Num\u00e9risation',
    'croisement':   'Croisement',
    'observation':  'Observation',
    'competence':   'Comp\u00e9tence',
    'transversal':  'Pratiques de notation',
    'interface':    'Interface'
};

var _etapeFiltre = ''; // '' = toutes

function rendreListeComplete(conteneur) {
    conteneur.innerHTML = '';
    conteneur.className = (conteneur.className || '') + ' glossaire-page';

    // Barre de filtres
    var barre = document.createElement('div');
    barre.className = 'glossaire-filtres';

    var boutons = [['', 'Tous']];
    Object.keys(ETAPE_LIBELLES).forEach(function(k) {
        boutons.push([k, ETAPE_LIBELLES[k]]);
    });

    boutons.forEach(function(b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'glossaire-filtre' + (b[0] === _etapeFiltre ? ' actif' : '');
        btn.setAttribute('data-etape', b[0]);
        btn.textContent = b[1];
        btn.addEventListener('click', function() {
            _etapeFiltre = b[0];
            rendreListeComplete(conteneur);
        });
        barre.appendChild(btn);
    });
    conteneur.appendChild(barre);

    // Liste
    var liste = document.createElement('div');
    liste.className = 'glossaire-liste';

    var termes = listerTermesTries();
    if (_etapeFiltre) {
        termes = termes.filter(function(t) { return t.etape === _etapeFiltre; });
    }

    if (termes.length === 0) {
        var vide = document.createElement('p');
        vide.className = 'glossaire-vide';
        vide.textContent = 'Aucun terme dans cette cat\u00e9gorie.';
        liste.appendChild(vide);
    } else {
        termes.forEach(function(t) {
            liste.appendChild(creerFiche(t));
        });
    }
    conteneur.appendChild(liste);
}

function creerFiche(t) {
    var fiche = document.createElement('article');
    fiche.className = 'glossaire-fiche';
    fiche.id = 'glossaire-' + t.cle;

    var enTete = document.createElement('header');
    enTete.className = 'glossaire-fiche-entete';

    var h = document.createElement('h3');
    h.className = 'glossaire-fiche-terme';
    h.textContent = t.terme;
    enTete.appendChild(h);

    var meta = document.createElement('div');
    meta.className = 'glossaire-fiche-meta';
    if (t.categorie) {
        var cat = document.createElement('span');
        cat.className = 'glossaire-fiche-categorie';
        cat.textContent = t.categorie;
        meta.appendChild(cat);
    }
    if (t.etape && ETAPE_LIBELLES[t.etape]) {
        var et = document.createElement('span');
        et.className = 'glossaire-fiche-etape glossaire-fiche-etape-' + t.etape;
        et.textContent = ETAPE_LIBELLES[t.etape];
        meta.appendChild(et);
    }
    enTete.appendChild(meta);
    fiche.appendChild(enTete);

    var corps = document.createElement('div');
    corps.className = 'glossaire-fiche-definition';
    // Support \n dans la définition → paragraphes
    var paras = t.definition.split(/\n\n+/);
    paras.forEach(function(p) {
        var pEl = document.createElement('p');
        pEl.textContent = p.trim();
        corps.appendChild(pEl);
    });
    fiche.appendChild(corps);

    if (t.voir) {
        var voir = document.createElement('div');
        voir.className = 'glossaire-fiche-voir';
        voir.innerHTML = '<strong>Voir\u00a0:</strong> ' + echapper(t.voir);
        fiche.appendChild(voir);
    }

    return fiche;
}

function afficherTerme(cle) {
    var t = glossaire()[cle];
    if (!t) return;
    // Navigue vers Aide > Glossaire et cible la fiche par ancre
    if (typeof afficherSection === 'function') afficherSection('aide');
    // TODO: sous-section glossaire à ajouter dans la navigation
    // Pour l'instant : défile vers la fiche si elle est déjà rendue
    setTimeout(function() {
        var fiche = document.getElementById('glossaire-' + cle);
        if (fiche) {
            fiche.scrollIntoView({ behavior: 'smooth', block: 'start' });
            fiche.classList.add('glossaire-fiche-active');
            setTimeout(function() { fiche.classList.remove('glossaire-fiche-active'); }, 1600);
        }
    }, 150);
}

function afficherDansConteneur(conteneur) {
    if (typeof conteneur === 'string') conteneur = document.getElementById(conteneur);
    if (!conteneur) return;
    rendreListeComplete(conteneur);
}

// =========================================================================
// Utilitaire : enrichir un HTML en marquant les termes du glossaire
// =========================================================================

var _regexEnrichissement = null;
function regexEnrichissement() {
    if (_regexEnrichissement) return _regexEnrichissement;
    var dict = glossaire();
    var termes = Object.keys(dict).map(function(k) { return dict[k].terme; });
    // Tri par longueur décroissante pour matcher les expressions les plus longues d'abord
    termes.sort(function(a, b) { return b.length - a.length; });
    var escaped = termes.map(function(t) {
        return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    });
    // \b marche en frontière mot ; pour termes avec espaces/ponctuation, on
    // utilise une recherche case-insensitive avec bordures simples.
    _regexEnrichissement = new RegExp('(' + escaped.join('|') + ')', 'gi');
    return _regexEnrichissement;
}

function trouverCleParTerme(termeCandidat) {
    var dict = glossaire();
    var cible = termeCandidat.toLowerCase();
    var keys = Object.keys(dict);
    for (var i = 0; i < keys.length; i++) {
        if (dict[keys[i]].terme.toLowerCase() === cible) return keys[i];
    }
    return null;
}

/**
 * Enveloppe la première occurrence de chaque terme connu dans le HTML donné.
 * @param {string} html - Fragment HTML à enrichir
 * @returns {string} HTML enrichi
 *
 * Prudence : n'utiliser que sur du contenu sous contrôle (pas de données
 * utilisateur non échappées). Les textes sources (popups, états vides) le
 * sont déjà.
 */
function enrichirTermesGlossaire(html) {
    if (typeof html !== 'string' || !html) return html;
    var regex = regexEnrichissement();
    var vus = {};
    return html.replace(regex, function(match) {
        var cle = trouverCleParTerme(match);
        if (!cle || vus[cle]) return match;
        vus[cle] = true;
        // Attributs a11y : role="button" + tabindex pour accès clavier
        return '<span class="glossaire-terme" data-glossaire="' + cle + '" role="button" tabindex="0">' + match + '</span>';
    });
}

// =========================================================================
// Délégation d'événements pour les termes marqués
// =========================================================================

var _initialise = false;

var _rendu_aide_reference_fait = false;

function initialiserGlossaire() {
    if (_initialise) return;
    _initialise = true;

    // Clic sur un terme marqué → micro-popup
    document.addEventListener('click', function(e) {
        var terme = e.target.closest('[data-glossaire]');
        if (terme) {
            e.preventDefault();
            e.stopPropagation();
            var cle = terme.getAttribute('data-glossaire');
            var entree = glossaire()[cle];
            if (entree) afficherMicroPopup(entree, terme);
            return;
        }
        // Clic ailleurs → fermer le micro-popup s'il est ouvert (sauf sur le popup lui-même)
        var popup = e.target.closest('#' + ID_POPUP);
        if (!popup) fermerMicroPopup();
    });

    // Clavier : Entrée / Espace sur un terme ouvre le micro-popup ; Échap le ferme
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fermerMicroPopup();
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            var terme = e.target.closest && e.target.closest('[data-glossaire]');
            if (terme) {
                e.preventDefault();
                var cle = terme.getAttribute('data-glossaire');
                var entree = glossaire()[cle];
                if (entree) afficherMicroPopup(entree, terme);
            }
        }
    });

    // Lazy render de la page dédiée dans Aide > Référence rapide
    window.addEventListener('sectionAffichee', function(e) {
        var id = e && e.detail && e.detail.idSousSection;
        if (id !== 'aide-reference') return;
        setTimeout(function() {
            var conteneur = document.getElementById('glossaire-rendu');
            if (conteneur && !_rendu_aide_reference_fait) {
                afficherDansConteneur(conteneur);
                _rendu_aide_reference_fait = true;
            }
        }, 150);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserGlossaire);
} else {
    initialiserGlossaire();
}

// =========================================================================
// Exports
// =========================================================================

window.glossaire = {
    afficherTerme: afficherTerme,
    afficherDansConteneur: afficherDansConteneur,
    afficherMicroPopup: afficherMicroPopup,
    fermerMicroPopup: fermerMicroPopup,
    enrichirTermesGlossaire: enrichirTermesGlossaire,
    listerTermesTries: listerTermesTries
};

})();
