/**
 * materiel.js — Conception › « Apporter mon matériel » : l'accueil, et la confirmation d'une grille créée.
 *
 * Consignes : lot 1 (`CONSIGNE-LOT-2026-10-16-…-1.md`, l'accueil et la lecture), lot 2
 * (`CONSIGNE-LOT-2026-10-17-…-2.md`, la création), étape 6 (« Aller plus loin avec ta grille »).
 *
 * Un collage, le texte de la zone et l'exemple ouvrent la DISSECTION (`materiel-dissection.js`, depuis le
 * 18 oct.) ; « Taper ma grille à la main » mène vers Grilles de critères. La dissection crée la grille
 * (`materielCreation`), puis la confirmation s'affiche ici (`montrerCreee`). La dissection, lot 11 : à
 * l'ouverture de l'onglet, son brouillon la rouvre telle qu'elle était (`reprendreDissection`) ; « Coller une
 * autre grille » (`recommencer`) l'efface. #1119 : la confirmation la rouvre aussi (`revenirDissection`).
 *
 * ⚰ 19 oct. 2026 (`CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md`, décision de Grégoire, 13 h 51) :
 * l'assistant en sept étapes, débranché depuis le 18, est RETIRÉ — ses écrans, son état, ses gestes, et
 * dans `materiel-lecture.js` et `materiel-assistant.js` ce que lui seul appelait.
 *
 * Sécurité (règle 1 du projet) : le HTML collé n'entre JAMAIS dans le DOM de la page ; tout
 * texte rendu ici passe par `echapperHtml()`. Actions par `data-action` (dispatcher de main.js) :
 * aucun handler inline.
 */
(function () {
    'use strict';

    var etat = { ecran: 'accueil', resume: null };

    function e(v) { return echapperHtml(v); }
    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

    // ------------------------------------------------------------------
    // La confirmation
    // ------------------------------------------------------------------

    /**
     * La dissection, lot 9 : combien de critères ont été créés sans pondération, à compléter dans Grilles de
     * critères ; lot 9b : la note affichera « -- » d'ici là (la garde de `calculerPortee`). Textes validés G. 18 oct.
     * 20 h 08 ; rien quand il n'en manque pas.
     */
    function aCompleterHtml(r) {
        if (!r.aCompleter) return '';
        return '<p class="materiel-a-completer">' + e('Il te restera à donner ' + (r.enPoints ? 'des points' : 'une pondération') + ' à ' +
            pluriel(r.aCompleter, 'critère', 'critères') + ', dans « Grilles de critères ». D’ici là, la note d’une copie évaluée avec cette grille affichera « -- ».') + '</p>';
    }

    function confirmationHtml(r) {
        if (r.enPoints) return confirmationPointsHtml(r);
        var phrase = 'Elle est rangée dans tes grilles, avec ' + pluriel(r.nbC, 'critère', 'critères') + (r.descr ? ' et leurs descripteurs' : '') + '. Rien d’autre n’a changé dans l’application.';
        var carteGrille = pluriel(r.nbC, 'critère', 'critères') + (r.descr ? ', avec leurs descripteurs.' : '.');
        return '<section class="materiel-confirmation" aria-labelledby="materiel-titre-cree">' +
            '<div class="materiel-confirmation-titre"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"></circle><path d="M14 25l7 7 13-15"></path></svg>' +
            '<h2 id="materiel-titre-cree" tabindex="-1">Ta grille « ' + e(r.nom) + ' » est créée</h2></div>' +
            '<p>' + e(phrase) + '</p>' + aCompleterHtml(r) + '<div class="materiel-cartes-cree">' +
            carteCree('Ta grille', carteGrille, 'grille-criteres', 'La voir dans Grilles de critères') +
            carteCree('Ses niveaux', r.niveaux.join(' · '), 'echelle-performance', 'Les voir dans Échelles de performance') +
            '</div>' + plusLoinHtml(r) + '<div class="materiel-suite"><span>Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.</span>' +
            '<button type="button" class="btn btn-principal" data-action="materiel.voir" data-param="productions">Aller aux productions</button></div>' +
            retoursHtml() + '</section>';
    }

    /**
     * Étape 6 : « Aller plus loin avec ta grille », sous les cartes. Textes validés par Grégoire
     * (17 oct., 12 h 07), mot pour mot. Une grille à niveaux dont les cases étaient des rétroactions
     * (une cartouche vient d'être créée) n'a que la phrase commune : son paragraphe proposerait ce
     * qui est déjà fait (supposition de Cowork).
     * Le lien ouvre l'aide existante par sa clé du catalogue (`afficherAideContextuelle`) : le
     * déclencheur `.primo-aide[data-target]` de Grilles de critères est caché hors du mode aide, et
     * cherche un élément `#grille-type-critere-detail` que rien ne crée.
     */
    var PLUS_LOIN = {
        titre: 'Aller plus loin avec ta grille',
        enPoints: 'Ta grille note chaque critère en points. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en décrivant, pour un critère, ce qu’on attend à chaque niveau.',
        aNiveaux: 'Ta grille décrit ce qu’on attend à chaque niveau. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en associant une rétroaction à chaque niveau.',
        commune: 'Un critère peut s’évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul).',
        lien: 'Les trois façons d’évaluer un critère',
        aide: 'grille-type-critere-detail'
    };

    function plusLoinHtml(r) {
        // Étape 5b : une grille en points qui décrit déjà ses niveaux a, elle aussi, la phrase commune seule.
        var propre = r.enPoints ? (r.descr ? '' : PLUS_LOIN.enPoints) : PLUS_LOIN.aNiveaux;
        return '<aside class="materiel-plus-loin" aria-labelledby="materiel-titre-plus-loin">' +
            '<h3 id="materiel-titre-plus-loin">' + e(PLUS_LOIN.titre) + '</h3>' +
            (propre ? '<p>' + e(propre) + '</p>' : '') + '<p>' + e(PLUS_LOIN.commune) + '</p>' +
            '<button type="button" class="materiel-btn-lien" data-action="afficherAideContextuelle" data-param="' + e(PLUS_LOIN.aide) + '">' + e(PLUS_LOIN.lien) + '</button></aside>';
    }

    /**
     * Étape 5 : la carte « Grille » seule ; « Pour t'en servir… » inchangé. Textes PROVISOIRES (étape 7) ;
     * ceux de la carte « Ta grille » et du lien du bas : validé G. 18 oct. (« sur N points », ce jour-là).
     * La dissection, lot 2a : la confirmation garde « Coller une autre grille » (même geste), en points
     * comme en niveaux (lot 2b).
     */
    function confirmationPointsHtml(r) {
        return '<section class="materiel-confirmation" aria-labelledby="materiel-titre-cree">' +
            '<div class="materiel-confirmation-titre"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"></circle><path d="M14 25l7 7 13-15"></path></svg>' +
            '<h2 id="materiel-titre-cree" tabindex="-1">Ta grille « ' + e(r.nom) + ' » est créée</h2></div>' +
            '<p>' + e('Elle est rangée dans tes grilles, avec ' + pluriel(r.nbC, 'critère', 'critères') + ' notés en points. Rien d’autre n’a changé dans l’application.') + '</p>' +
            aCompleterHtml(r) + '<div class="materiel-cartes-cree">' +
            // Lot 9 : le total des seuls critères qui ont des points, et combien n'en ont pas encore (validé G. 18 oct. 20 h 08).
            carteCree('Ta grille', pluriel(r.nbC, 'critère', 'critères') + ', sur ' + formaterNombre(r.totalPoints) + (Math.abs(r.totalPoints) >= 2 ? ' points' : ' point') +
                (r.aCompleter ? ' ; ' + pluriel(r.aCompleter, 'critère', 'critères') + ' sans points pour l’instant.' : '.'), 'grille-criteres', 'La voir dans Grilles de critères') +
            '</div>' + plusLoinHtml(r) + '<div class="materiel-suite"><span>Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.</span>' +
            '<button type="button" class="btn btn-principal" data-action="materiel.voir" data-param="productions">Aller aux productions</button></div>' +
            retoursHtml() + '</section>';
    }

    /**
     * #1119 (consigne du 20 oct.) : « Revenir à mon étiquetage », à côté de « Coller une autre grille », seulement
     * si un brouillon existe ; il le rouvre par le chemin de la reprise (`revenirDissection`). Texte validé par
     * Grégoire le 28 oct. 2026 (#1152, lot 5, texte n° 12).
     */
    function retoursHtml() {
        var revenir = window.materielDissection && window.materielDissection.aUnBrouillon()
            ? '<button type="button" class="btn btn-secondaire" data-action="materiel.revenirDissection">' + e('Revenir à mon étiquetage') + '</button>' : '';
        return '<div class="materiel-retours">' + revenir +
            '<button type="button" class="materiel-btn-lien" data-action="materiel.recommencer">' + e('Coller une autre grille') + '</button></div>';
    }

    function carteCree(titre, txt, sousSection, bouton) {
        return '<div class="materiel-carte-cree"><strong>' + e(titre) + '</strong><span>' + e(txt) + '</span>' +
            '<button type="button" class="btn btn-secondaire" data-action="materiel.voir" data-param="' + e(sousSection) + '">' + e(bouton) + '</button></div>';
    }

    // ------------------------------------------------------------------
    // La page
    // ------------------------------------------------------------------

    function el(id) { return document.getElementById(id); }

    function montrerErreur(msg) {
        var p = el('materiel-erreur');
        if (!p) return;
        p.textContent = msg || '';
        p.classList.toggle('u-hide', !msg);
    }

    /** L'accueil, ou la confirmation d'une grille créée ; le focus suit le changement de vue (règle SPA). */
    function rendre() {
        var zone = el('materiel-lecture'), accueil = el('materiel-accueil');
        if (!zone || !accueil) return;
        if (etat.ecran === 'accueil') {
            zone.innerHTML = '';
            zone.classList.add('u-hide');
            accueil.classList.remove('u-hide');
            return;
        }
        zone.innerHTML = confirmationHtml(etat.resume);   // security-ok: tout texte passe par echapperHtml
        accueil.classList.add('u-hide');
        zone.classList.remove('u-hide');
        var titre = el('materiel-titre-cree');
        if (titre) titre.focus();
    }

    // Texte de Claude Code, validé G. 18 oct. (étape 3 du plan de la dissection).
    var MESSAGE_RIEN_A_LIRE = 'Rien de lisible dans ce que tu as collé. Copie le tableau de ta grille dans Word ou Pages, ou le texte d’un PDF, puis colle-le ici.';

    /** Un document disséqué ouvre la dissection ; rien de lisible, un message. */
    function ouvrirDissection(doc) {
        if (!doc) { montrerErreur(MESSAGE_RIEN_A_LIRE); return false; }
        montrerErreur('');
        return window.materielDissection.ouvrir(doc);
    }

    function surCollage(ev) {
        var cd = ev.clipboardData;
        if (!cd) return;
        var doc = window.materielDissectionLecture.docDepuisPressePapiers({ html: cd.getData('text/html'), texte: cd.getData('text/plain') });
        if (doc) ev.preventDefault();
        ouvrirDissection(doc);
    }

    function sousSection(id) {
        if (typeof window.afficherSousSection === 'function') window.afficherSousSection('conception-' + id);
    }

    var materiel = {
        reconnaitreTexte: function () {
            var zone = el('materiel-zone-collage');
            ouvrirDissection(window.materielDissectionLecture.docDepuisPressePapiers({ texte: zone ? zone.value : '' }));
        },
        essayerExemple: function () {
            ouvrirDissection(window.materielDissectionLecture.exempleDoc());
        },
        /** Vers l'éditeur de Grilles de critères : la façon de créer qui reste (« nous allons garder les deux »). */
        taperMain: function () {
            montrerErreur('');
            sousSection('grille-criteres');
        },
        /**
         * « Coller une autre grille » (dans la dissection, après sa confirmation, ou sur la confirmation d'une
         * grille créée) : retour à l'accueil. Lot 11 : c'est le geste qui efface le brouillon de la dissection
         * (supposition de Claude Code pour celui de la confirmation : le même mot, le même effet).
         */
        recommencer: function () {
            etat = { ecran: 'accueil', resume: null };
            if (window.materielDissection) {
                window.materielDissection.oublierBrouillon();
                window.materielDissection.fermer();
            }
            rendre();
            var collage = el('materiel-zone-collage');
            if (collage) { collage.value = ''; collage.focus(); }
            montrerErreur('');
        },
        /**
         * #1119 : depuis la confirmation, la dissection rouvre telle qu'elle était laissée (la reprise du lot 11) ;
         * le brouillon reste. Un nouveau « Créer ma grille » crée une SECONDE grille : la première ne change pas.
         */
        revenirDissection: function () {
            etat = { ecran: 'accueil', resume: null };
            rendre();
            montrerErreur('');
            reprendreDissection();
            if (window.materielDissection && window.materielDissection.estOuverte()) return;
            var collage = el('materiel-zone-collage');   // aucun ou illisible : l'accueil, et le focus y va
            if (collage) collage.focus();
        },
        /** La dissection, lot 2a : sa grille est créée ; la dissection se ferme, la confirmation s'affiche. */
        montrerCreee: function (resume) {
            if (window.materielDissection) window.materielDissection.fermer();
            etat = { ecran: 'cree', resume: resume };
            rendre();
        },
        /**
         * La sous-section, puis (lot 3b1) l'objet créé ouvert et sélectionné, par le chemin de la
         * bibliothèque de chaque outil (`ouvrir…DepuisListe`, qui garde une création en cours).
         */
        voir: async function (id) {
            id = String(id);
            sousSection(id);
            var ids = etat.ecran === 'cree' && etat.resume && etat.resume.ids;
            if (!ids) return;
            if (id === 'grille-criteres' && typeof window.ouvrirGrilleDepuisListe === 'function') await window.ouvrirGrilleDepuisListe(ids.grille);
            else if (id === 'echelle-performance' && typeof window.ouvrirEchelleDepuisListe === 'function') await window.ouvrirEchelleDepuisListe(ids.echelle);
        },
        confirmationHtml: confirmationHtml
    };

    /**
     * Lot 11 : l'onglet s'ouvre sur l'accueil, sans dissection en cours ; son brouillon lisible la rouvre
     * telle qu'elle était, sans question. Illisible : l'accueil, et un mot (le brouillon reste).
     */
    function reprendreDissection() {
        if (etat.ecran !== 'accueil' || !window.materielDissection || window.materielDissection.estOuverte()) return;
        if (window.materielDissection.reprendre() === 'illisible') montrerErreur(MESSAGE_BROUILLON_ILLISIBLE);
    }

    // Texte de Claude Code, 19 oct. (lot 11), validé G. 19 oct. 9 h 06.
    var MESSAGE_BROUILLON_ILLISIBLE = 'Ta dissection précédente n’a pas pu être relue : elle reste gardée telle quelle. Colle une grille pour en commencer une autre ; elle la remplacera.';

    function initialiser() {
        var zone = el('materiel-zone-collage');
        if (zone && !zone.dataset.materielBranche) {
            zone.addEventListener('paste', surCollage);
            zone.dataset.materielBranche = '1';
            // L'événement public de navigation.js (zone protégée, non touchée) ; le brouillon se lit DB prête.
            window.addEventListener('sectionAffichee', function (ev) {
                if (ev.detail && ev.detail.idSousSection === 'conception-materiel') window.auDbPret(reprendreDissection);
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    window.materiel = materiel;
})();
