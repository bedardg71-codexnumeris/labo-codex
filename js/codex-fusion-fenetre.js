/* ===============================
   MODULE : LA FENÊTRE DE FUSION EN DEUX COLONNES
   Date : 29 octobre 2026 (#1186)
   Consigne : plans de travail/CONSIGNE-LOT-2026-10-29-fenetre-de-fusion.md (Cowork, 29 oct., 20 h 59)
   Ébauche approuvée par Grégoire (29 oct., 20 h 57) : https://claude.ai/artifact/Xq457R7bW6F7sdUBbuckbF

   Vocation
     Remplace les deux invites à chiffres de la fusion (« Entrer 1, 2, 3 ou 4 », puis un chiffre
     par conflit) : à gauche « Ici », à droite « L'autre codex », une rangée par conflit, ses deux
     versions côte à côte. Ce qu'elle montre est calculé par codex.js (`_modeleDeLaFenetre`) ;
     ce module ne fait que le montrer et recueillir les choix.

   Les règles de Grégoire (29 oct.)
     - Rien de choisi d'office : l'utilisateur peut vouloir récupérer une ancienne version.
       « La plus récente » est une mention ; « Prendre les plus récentes » un raccourci offert.
     - « Fusionner » est désactivé tant qu'un choix manque ; « Annuler » n'écrit rien.

   Pourquoi une fenêtre sœur, et pas BibliothequeUI.creerFenetreDeuxColonnes
     Celle-ci est une bibliothèque (dossiers, filtres, passages d'une colonne à l'autre, aperçus) ;
     elle ne porte pas des rangées alignées. Cette fenêtre en reprend les jetons et les classes
     (`biblio2-fenetre`, `biblio2-entete`, `biblio2-titre`, `biblio2-fermer`, `biblio2-btn-texte`,
     `biblio2-passage`), les cibles de 44 px et la requête de conteneur.

   Sécurité : tout ce qui vient des données passe par `echapperHtml` ; aucun handler inline
   (un seul écouteur délégué, sur la fenêtre, lit `data-fusion`).
   =============================== */

(function() {
'use strict';

var ID = 'fusion-codex-fenetre';

function _e(s) { return echapperHtml(String(s == null ? '' : s)); }

function _cellule(r, i, cote) {
    var cote2 = cote === 'local' ? r.ici : r.autre;
    var recente = r.recente === cote ? '<span class="fusion2-recente">La plus récente</span>' : '';
    return '<div class="fusion2-cellule" data-cote="' + cote + '">' +
        '<div class="fusion2-cellule-tete"><span class="fusion2-etiquette">' + (cote === 'local' ? 'Ici' : 'L\'autre codex') + '</span>' + recente + '</div>' +
        '<p class="fusion2-texte">' + _e(cote2.texte) + '</p>' +
        (cote2.detail ? '<p class="fusion2-detail">' + _e(cote2.detail) + '</p>' : '') +
        '<button type="button" class="btn btn-neutre fusion2-garder" aria-pressed="false" data-fusion="garder" data-rangee="' + i + '" data-cote="' + cote + '">Garder celle-ci</button>' +
    '</div>';
}

function _rangee(r, i) {
    return '<li class="fusion2-rangee" data-rangee="' + i + '">' +
        '<div class="fusion2-rangee-tete"><h4 class="fusion2-rangee-titre">' + _e(r.titre) + '</h4>' +
            (r.qui ? '<span class="fusion2-qui">' + _e(r.qui) + '</span>' : '') + '</div>' +
        '<div class="fusion2-cotes">' + _cellule(r, i, 'local') + _cellule(r, i, 'externe') + '</div>' +
    '</li>';
}

function _colonne(cote, info) {
    return '<div class="fusion2-colonne' + (cote === 'ici' ? ' fusion2-colonne--ici' : '') + '">' +
        '<p class="fusion2-etiquette">' + (cote === 'ici' ? 'Ici' : 'L\'autre codex') + '</p>' +
        (info.appareil ? '<p class="fusion2-appareil">' + _e(info.appareil) + '</p>' : '') +
        '<p class="fusion2-sous">' + _e(info.sous) + '</p>' +
    '</div>';
}

function _conflits(modele) {
    var n = modele.conflits.length;
    if (n === 0) return '';
    return '<div class="fusion2-section-tete">' +
            '<h3 class="fusion2-section-titre">Différent des deux côtés (' + n + ')</h3>' +
            '<p class="fusion2-consigne">Choisis, pour chaque ligne, la version à garder.</p>' +
            '<div class="fusion2-raccourcis">' +
                '<button type="button" class="biblio2-btn-texte" data-fusion="recentes">Prendre les plus récentes</button>' +
                '<button type="button" class="biblio2-btn-texte" data-fusion="tout" data-cote="local">Tout garder d\'ici</button>' +
                '<button type="button" class="biblio2-btn-texte" data-fusion="tout" data-cote="externe">Tout prendre de l\'autre codex</button>' +
            '</div>' +
        '</div>' +
        '<div class="fusion2-colonnes">' + _colonne('ici', modele.ici) + _colonne('autre', modele.autre) + '</div>' +
        '<ul class="fusion2-rangees">' + modele.conflits.map(_rangee).join('') + '</ul>';
}

function _html(modele) {
    return '<div id="' + ID + '" class="modal-js-overlay">' +
        '<section class="modal-js-contenu biblio2-fenetre fusion2-fenetre" role="dialog" aria-modal="true" aria-labelledby="' + ID + '-titre" tabindex="-1">' +
            '<header class="biblio2-entete">' +
                '<h2 id="' + ID + '-titre" class="biblio2-titre">Fusionner avec un codex</h2>' +
                '<span class="biblio2-entete-droite"><button type="button" class="biblio2-fermer" data-fusion="annuler" aria-label="Fermer sans fusionner" title="Fermer">' +
                    '<img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button></span>' +
            '</header>' +
            '<div class="fusion2-resume">' +
                '<p class="fusion2-resume-fort">' + _e(modele.phrases.fort) + '</p>' +
                '<p class="fusion2-resume-fin">' + _e(modele.phrases.fin) + '</p>' +
            '</div>' +
            _conflits(modele) +
            '<footer class="fusion2-pied">' +
                '<p class="fusion2-reste" aria-live="polite"></p>' +
                '<span class="fusion2-pied-droite">' +
                    '<button type="button" class="btn btn-neutre" data-fusion="annuler">Annuler</button>' +
                    '<button type="button" class="btn biblio2-passage" data-fusion="fusionner">Fusionner</button>' +
                '</span>' +
            '</footer>' +
        '</section>' +
    '</div>';
}

/** Redessine ce qui dépend des choix : les deux boutons de chaque rangée, le compte, « Fusionner ». */
function _peindre(fenetre, modele, choix) {
    modele.conflits.forEach(function(r, i) {
        ['local', 'externe'].forEach(function(cote) {
            var garde = choix[r.cle] === cote;
            var bouton = fenetre.querySelector('.fusion2-garder[data-rangee="' + i + '"][data-cote="' + cote + '"]');
            bouton.setAttribute('aria-pressed', garde ? 'true' : 'false');
            bouton.textContent = garde ? '✓ Gardée' : 'Garder celle-ci';
            bouton.closest('.fusion2-cellule').classList.toggle('fusion2-cellule--gardee', garde);
        });
    });
    var reste = modele.conflits.filter(function(r) { return !choix[r.cle]; }).length;
    var phrase = fenetre.querySelector('.fusion2-reste');
    phrase.textContent = modele.conflits.length === 0 ? '' : (reste > 0 ? 'Il te reste ' + reste + ' choix à faire.' : 'Tout est choisi.');
    phrase.classList.toggle('fusion2-reste--complet', reste === 0);
    fenetre.querySelector('[data-fusion="fusionner"]').disabled = reste > 0;
}

/** Ce que fait un bouton de la fenêtre ; rend `true` quand la fenêtre se ferme. */
function _agir(el, modele, choix, repondre) {
    var quoi = el.getAttribute('data-fusion');
    var cote = el.getAttribute('data-cote');
    if (quoi === 'annuler') { repondre(true); return; }
    if (quoi === 'fusionner') { if (!el.disabled) repondre(false); return; }
    if (quoi === 'garder') choix[modele.conflits[Number(el.getAttribute('data-rangee'))].cle] = cote;
    if (quoi === 'tout') modele.conflits.forEach(function(r) { choix[r.cle] = cote; });
    if (quoi === 'recentes') modele.conflits.forEach(function(r) { if (r.recente) choix[r.cle] = r.recente; });
}

/**
 * Ouvre la fenêtre. `modele` : { phrases: {fort, fin}, conflits: [{cle, titre, qui, ici, autre,
 * recente}], ici: {appareil, sous}, autre: {appareil, sous} } (codex.js, `_modeleDeLaFenetre`).
 * @returns {Promise<{choix: Object<string, 'local'|'externe'>, annule: boolean}>}
 */
function ouvrir(modele) {
    return new Promise(function(resolve) {
        var ancienne = document.getElementById(ID);
        if (ancienne) ancienne.remove();
        var focusPrecedent = document.activeElement;
        document.body.insertAdjacentHTML('beforeend', _html(modele));
        var voile = document.getElementById(ID);
        var fenetre = voile.querySelector('.fusion2-fenetre');
        var choix = {};
        var fini = false;
        function repondre(annule) {
            if (fini) return;
            fini = true;
            document.removeEventListener('keydown', surTouche, true);
            voile.remove();
            if (focusPrecedent && typeof focusPrecedent.focus === 'function') focusPrecedent.focus();
            resolve({ choix: annule ? {} : choix, annule: annule });
        }
        function surTouche(e) {
            if (e.key === 'Escape') { e.preventDefault(); repondre(true); }
        }
        fenetre.addEventListener('click', function(e) {
            var el = e.target.closest('[data-fusion]');
            if (!el) return;
            _agir(el, modele, choix, repondre);
            if (!fini) _peindre(fenetre, modele, choix);
        });
        document.addEventListener('keydown', surTouche, true);
        _peindre(fenetre, modele, choix);
        fenetre.focus({ preventScroll: true });
    });
}

window.CodexFusionFenetre = { ouvrir: ouvrir, ID: ID };

})();
