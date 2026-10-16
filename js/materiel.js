/**
 * materiel.js — Conception › « Apporter mon matériel », lot 1 : l'accueil de l'onglet et
 * l'APERÇU, en lecture seule, de ce que l'application a reconnu dans une grille collée.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md`.
 * La lecture elle-même vit dans `materiel-lecture.js` (fonctions pures). Ce module-ci ne
 * fait que brancher la page : le collage, les trois boutons, le rendu de l'aperçu.
 *
 * Rien n'est écrit en base à ce lot : le modèle lu vit en mémoire, le temps de l'aperçu.
 * L'assistant et « Créer » viennent au lot 2.
 *
 * Sécurité (règle 1 du projet) : le HTML collé n'entre JAMAIS dans le DOM de la page
 * (`materielLecture.lireHtml` n'en retient que le texte) ; tout texte rendu ici passe par
 * `echapperHtml()`. Actions par `data-action` (dispatcher de main.js), aucun handler inline.
 *
 * Les textes affichés sont ceux du prototype validé le 16 oct. 2026, PROVISOIRES :
 * Grégoire relit les mots au lot 3.
 */
(function () {
    'use strict';

    var modele = null;

    var LIBELLES_ETAT = {
        complete: 'complété par l’application',
        propose: 'proposé : à vérifier',
        remplir: 'à remplir'
    };

    function e(v) { return echapperHtml(v); }

    /**
     * Une valeur du modèle, marquée de son état. « repris » est le défaut (sans marque) ;
     * les autres portent un cadre (la légende) ET leur nom en toutes lettres pour les
     * lecteurs d'écran — la couleur seule ne dit rien.
     */
    function valeur(p, texte) {
        var etat = (p && p.etat) || 'repris';
        var cls = 'materiel-valeur' + (LIBELLES_ETAT[etat] ? ' materiel-etat-' + etat : '');
        var sr = LIBELLES_ETAT[etat] ? '<span class="u-lecteur-ecran"> (' + e(LIBELLES_ETAT[etat]) + ')</span>' : '';
        return '<span class="' + cls + '">' + e(texte) + sr + '</span>';
    }

    function mention(etat, texte) {
        return '<span class="materiel-mention materiel-mention-' + e(etat) + '">' + e(texte) + '</span>';
    }

    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

    function enteteNiveau(n) {
        var plageOk = String(n.min.valeur).trim() && String(n.max.valeur).trim();
        var titre = n.titre.valeur || 'Niveau sans nom';
        var plage = plageOk
            ? valeur(n.min, String(n.min.valeur).replace('.', ',') + ' à ' + String(n.max.valeur).replace('.', ',') + ' %')
            : valeur({ etat: 'remplir' }, 'plage à remplir');
        return '<th scope="col" class="materiel-col-niveau">' +
            '<span class="materiel-niveau-titre">' + valeur(n.titre, titre) + '</span>' +
            '<span class="materiel-niveau-details">' + plage +
            ' <span class="materiel-code">' + e('code ' + n.code.valeur + ' · complété') + '</span></span>' +
            '</th>';
    }

    function rangeeCritere(c) {
        var pond = String(c.ponderation.valeur).trim()
            ? valeur(c.ponderation, String(c.ponderation.valeur).replace('.', ',') + ' %')
            : valeur({ etat: 'remplir' }, 'à remplir');
        var mentionPond = c.ponderation.etat === 'complete' ? mention('complete', 'complété : parts égales') : '';
        var cases = c.cases.map(function (d) {
            return '<td>' + (d.valeur ? '<span class="materiel-case">' + e(d.valeur) + '</span>'
                : '<span class="materiel-case-vide">(case vide)</span>') + '</td>';
        }).join('');
        return '<tr>' +
            '<th scope="row" class="materiel-col-critere">' + valeur(c.nom, c.nom.valeur || 'Critère sans nom') + '</th>' +
            '<td class="materiel-col-pond">' + pond + mentionPond + '</td>' +
            cases + '</tr>';
    }

    /**
     * Le HTML de l'aperçu (fonction pure : ni DOM ni stockage). Exposée pour les bancs, qui
     * vérifient que tout texte venu du document en sort échappé.
     * @param {Object} m - un modèle produit par materielLecture
     * @returns {string}
     */
    function apercuHtml(m) {
        var h = [];
        if (m.source === 'exemple') {
            h.push('<p class="alerte alerte-information materiel-bandeau">Exemple fictif, pour essayer. Tes vraies grilles se collent à l’accueil de l’onglet.</p>');
        }
        h.push('<h2 id="materiel-titre-apercu" tabindex="-1">Aperçu de ta grille</h2>');
        h.push('<p class="text-muted">Voici ce que l’application a reconnu dans ton document. Rien n’est encore créé.</p>');

        // Le nom et la nature des cases : les deux réponses que l'assistant fera vérifier.
        h.push('<dl class="materiel-resume">');
        h.push('<dt>Nom de la grille</dt><dd>' + (m.nom.valeur
            ? valeur(m.nom, m.nom.valeur) + ' ' + mention('propose', 'repris de la ligne au-dessus du tableau : à vérifier')
            : valeur({ etat: 'remplir' }, 'à remplir')) + '</dd>');
        if (m.nature) {
            var nat = m.nature.valeur === 'retroactions' ? 'elles s’adressent à l’étudiant·e (rétroactions)' : 'elles décrivent les niveaux (descripteurs)';
            h.push('<dt>Les cases</dt><dd>' + valeur(m.nature, nat) + '</dd>');
        }
        h.push('</dl>');

        if (m.enteteIrreguliere) {
            h.push('<p class="alerte alerte-attention" role="status">La première ligne de ton tableau contient des cases fusionnées : les niveaux pourraient être mal reconnus.</p>');
        }

        h.push('<div class="materiel-legende" role="note">' +
            '<span><span class="materiel-pastille" aria-hidden="true"></span>Repris de ton document</span>' +
            '<span><span class="materiel-pastille materiel-etat-complete" aria-hidden="true"></span>Complété par l’application</span>' +
            '<span><span class="materiel-pastille materiel-etat-remplir" aria-hidden="true"></span>À remplir</span>' +
            '</div>');

        // iPad : le tableau défile dans son cadre, la page non. Le cadre est focalisable
        // pour qu'on puisse le faire défiler au clavier.
        h.push('<div class="materiel-apercu-cadre" role="region" aria-label="Aperçu de ta grille" tabindex="0">');
        h.push('<table class="materiel-apercu"><caption class="u-lecteur-ecran">' +
            e(pluriel(m.criteres.length, 'critère', 'critères') + ', ' + pluriel(m.niveaux.length, 'niveau', 'niveaux')) +
            '</caption><thead><tr>' +
            '<th scope="col" class="materiel-col-critere">Critère</th>' +
            '<th scope="col" class="materiel-col-pond">Pondération</th>' +
            m.niveaux.map(enteteNiveau).join('') +
            '</tr></thead><tbody>' +
            m.criteres.map(rangeeCritere).join('') +
            '</tbody></table></div>');

        if (m.aClasser.length) {
            h.push('<section class="materiel-a-classer" aria-labelledby="materiel-titre-a-classer">');
            h.push('<h3 id="materiel-titre-a-classer">À classer (' + m.aClasser.length + ')</h3>');
            h.push('<p class="text-muted">Ces passages viennent de ton document, mais ne trouvent pas leur place dans le tableau. Rien n’est retiré sans toi : tu pourras les ranger ou les écarter.</p>');
            h.push('<ul>' + m.aClasser.map(function (a) {
                return '<li><span class="materiel-a-classer-texte">' + e(a.texte) + '</span>' +
                    '<span class="materiel-a-classer-raison">' + e(a.raison) + '</span></li>';
            }).join('') + '</ul></section>');
        }

        h.push('<div class="materiel-actions">' +
            '<button type="button" class="btn btn-secondaire" data-action="materiel.recommencer">← Recommencer</button>' +
            '</div>');
        return h.join('');
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

    function afficherApercu(m) {
        modele = m;
        var zone = el('materiel-lecture');
        var accueil = el('materiel-accueil');
        if (!zone || !accueil) return;
        zone.innerHTML = apercuHtml(m);   // security-ok: apercuHtml échappe tout texte (echapperHtml)
        accueil.classList.add('u-hide');
        zone.classList.remove('u-hide');
        var titre = el('materiel-titre-apercu');
        if (titre) titre.focus();   // règle SPA : le focus suit le changement de vue
    }

    function charger(lu, source) {
        var r = window.materielLecture.charger(lu, source);
        if (r.erreur) { montrerErreur(r.erreur); return false; }
        montrerErreur('');
        afficherApercu(r.modele);
        return true;
    }

    function surCollage(ev) {
        var cd = ev.clipboardData;
        if (!cd) return;
        var lu = window.materielLecture.lirePressePapiers({
            html: cd.getData('text/html'),
            texte: cd.getData('text/plain')
        });
        if (lu) {
            ev.preventDefault();
            charger(lu, 'colle');
        } else {
            // Le texte se colle quand même dans la zone : la personne voit ce qu'elle a collé.
            montrerErreur(window.materielLecture.MESSAGE_SANS_TABLEAU);
        }
    }

    var materiel = {
        reconnaitreTexte: function () {
            var zone = el('materiel-zone-collage');
            charger(window.materielLecture.lireTexte(zone ? zone.value : ''), 'colle');
        },
        essayerExemple: function () {
            charger(window.materielLecture.lireHtml(window.materielLecture.exempleHtml()), 'exemple');
        },
        taperMain: function () {
            montrerErreur('');
            afficherApercu(window.materielLecture.modeleVide());
        },
        recommencer: function () {
            modele = null;
            var zone = el('materiel-lecture');
            if (zone) { zone.innerHTML = ''; zone.classList.add('u-hide'); }
            var accueil = el('materiel-accueil');
            if (accueil) accueil.classList.remove('u-hide');
            var collage = el('materiel-zone-collage');
            if (collage) { collage.value = ''; collage.focus(); }
            montrerErreur('');
        },
        /** Le modèle lu en mémoire (null à l'accueil) — pour le lot 2 et les bancs. */
        modeleCourant: function () { return modele; },
        apercuHtml: apercuHtml
    };

    function initialiser() {
        var zone = el('materiel-zone-collage');
        if (zone && !zone.dataset.materielBranche) {
            zone.addEventListener('paste', surCollage);
            zone.dataset.materielBranche = '1';
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    window.materiel = materiel;
})();
