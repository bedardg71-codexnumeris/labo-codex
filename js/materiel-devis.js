/**
 * materiel-devis.js — Conception › « Apporter mon matériel » : le devis ministériel du cours.
 *
 * Lot « Le devis ministériel dans Apporter mon matériel » (28 nov. 2026, demande de Grégoire, 7 h 26 à 7 h 55).
 * Six gestes : l'accueil offre l'entrée ; l'enseignant·e choisit le cours ; colle son devis ; voit ce qui a été lu,
 * rangé comme le tableau d'origine ; corrige sur place ; accepte. La fiche du cours (`CoursEntite`) reçoit alors le
 * numéro, l'énoncé, les éléments (`elementsCompetence`, le texte libre que ses lecteurs découpent par lignes) et
 * `devisCompetence` (le contexte de réalisation, et les critères de performance sous chaque élément).
 *
 * ⛔ LA LECTURE NE S'ENREGISTRE JAMAIS D'OFFICE. Une seule écriture dans ce fichier (`ranger`), derrière le bouton
 * d'acceptation ; et quand la fiche porte déjà quelque chose, derrière un second accord, l'ancien et le nouveau
 * côte à côte. Ce lot ne crée ni cible ni critère d'évaluation : il range le devis.
 *
 * La lecture et les gestes de correction sont des fonctions pures (`devis-lecture.js`). Rien n'est gardé en
 * brouillon : une lecture non acceptée se perd au rechargement de la page.
 *
 * Sécurité (règle 1 du projet) : rien de collé n'entre dans le DOM sans `echapperHtml()` ; les valeurs des champs
 * sont posées par `.value`. Actions par `data-action` (dispatcher de main.js), saisies par des écouteurs délégués.
 *
 * LES MOTS : des mots de travail (Claude Code, 28 nov.), tous dans `T`, tous à relire par Grégoire :
 * plans de travail/TEXTES-2026-11-28-devis-ministeriel.md.
 */
(function () {
    'use strict';

    var T = {
        titre: 'Le devis de ton cours',
        intro: 'Le devis ministériel décrit la compétence de ton cours. Colle-le ici : tu verras ce qui a été lu, tu corrigeras au besoin, puis tu le rangeras dans la fiche de ton cours. Rien ne s’enregistre avant ton accord.',
        retourAccueil: 'Revenir à l’accueil',
        etiquetteCours: 'À quel cours ce devis se rattache-t-il ?',
        choisirCours: 'Choisis un cours',
        aucunCours: 'Tu n’as pas encore de cours. Crée d’abord sa fiche dans Réglages, puis reviens coller son devis.',
        dejaPorte: 'La fiche de ce cours porte déjà une compétence.',
        revoirFiche: 'Voir et corriger ce que la fiche porte',
        etiquetteCollage: 'Colle ton devis ici',
        consigneCollage: 'Dans le PDF du ministère, sélectionne tout le devis de la compétence, toutes ses pages comprises, copie-le d’un seul geste, puis colle-le (⌘ V).',
        lire: 'Lire mon devis',
        erreurCours: 'Choisis d’abord le cours auquel ce devis se rattache.',
        erreurVide: 'Il n’y a rien à lire. Copie ton devis dans le PDF du ministère, puis colle-le dans la zone.',
        erreurRien: 'Je n’ai rien reconnu d’un devis dans ce que tu as collé : ni « Code : », ni « Énoncé de la compétence », ni élément numéroté. Vérifie que tu as copié le devis en entier, ou compose-le à la main.',
        composerMain: 'Composer le devis à la main',
        titreLecture: 'Voici ce que j’ai lu',
        titreFiche: 'Ce que la fiche porte',
        consigneLecture: 'Compare avec ton devis. Retouche un texte en écrivant dedans. Pour une ligne mal rangée, choisis où elle va dans son menu « Déplacer ». Rien n’est enregistré tant que tu n’as pas rangé le devis dans la fiche.',
        pourLeCours: 'Pour le cours',
        numero: 'Numéro de la compétence',
        enonce: 'Énoncé de la compétence',
        contexte: 'Contexte de réalisation',
        contexteVide: 'Aucune ligne. Ce devis n’a peut-être pas de contexte de réalisation.',
        ajouterContexte: 'Ajouter une ligne au contexte',
        elements: 'Éléments de la compétence',
        elementsVide: 'Aucun élément lu.',
        element: 'Élément',
        criteres: 'Critères de performance',
        criteresVide: 'Aucun critère de performance sous cet élément.',
        ajouterCritere: 'Ajouter un critère',
        ajouterElement: 'Ajouter un élément',
        monter: 'Monter',
        descendre: 'Descendre',
        retirerElement: 'Retirer cet élément',
        deplacer: 'Déplacer',
        deplacerPlaceholder: 'Déplacer…',
        groupeUne: 'Cette ligne seulement',
        groupeSuite: 'Cette ligne et les suivantes',
        versContexte: 'Vers le contexte de réalisation',
        versElement: 'Sous l’élément',
        versCote: 'Retirer (mettre de côté)',
        enElement: 'En faire un élément',
        deCote: 'Lignes mises de côté',
        deCoteAide: 'Ce qui ne fait pas partie de la compétence (pied de page, activités d’apprentissage) ou que tu as retiré. Rien de ceci n’ira dans la fiche. Une ligne mise de côté par erreur se replace par son menu « Déplacer ».',
        annuler: 'Annuler le dernier geste',
        accepter: 'Ranger ce devis dans la fiche du cours',
        collerAutre: 'Coller un autre devis',
        confirmerQuitter: 'Ce devis n’est pas rangé dans la fiche du cours : ce que tu as lu et corrigé sera perdu. Continuer ?',
        erreurIncomplet: 'Il n’y a rien à ranger : ni numéro, ni énoncé, ni élément.',
        titreComparer: 'La fiche de ce cours porte déjà une compétence',
        consigneComparer: 'Si tu acceptes, ce que tu apportes remplace ce que la fiche porte. Rien d’autre ne change dans la fiche.',
        colonneAncien: 'Ce que la fiche porte',
        colonneNouveau: 'Ce que tu apportes',
        remplacer: 'Remplacer ce que la fiche porte',
        revenirLecture: 'Revenir à ma lecture',
        rien: 'Rien',
        titreRange: 'Le devis est rangé dans la fiche du cours',
        erreurEcriture: 'Le devis n’a pas pu être rangé dans la fiche. Rien n’a changé ; essaie de nouveau.',
        erreurCoursParti: 'Cette fiche de cours n’existe plus. Reviens à l’accueil et choisis un autre cours.',
        autreDevis: 'Apporter le devis d’un autre cours'
    };

    var etat = etatNeuf();
    var listeCours = [];

    function etatNeuf() {
        return { ecran: 'ferme', coursId: '', modele: null, source: 'collage', historique: [], ancien: null, erreur: '', annonce: '', resume: null };
    }

    function L() { return window.devisLecture; }
    function e(v) { return echapperHtml(v == null ? '' : v); }
    function el(id) { return document.getElementById(id); }
    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
    function libelle(c) { return window.CoursEntite ? window.CoursEntite.genererLibelle(c) : (c.codeCours || '') + ' ' + (c.nomCours || ''); }
    function coursChoisi() { return listeCours.find(function (c) { return c.id === etat.coursId; }) || null; }
    function court(t, n) { t = String(t || '').trim(); return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; }

    // ------------------------------------------------------------------
    // Les rendus (tout texte passe par `e`)
    // ------------------------------------------------------------------

    function tete(titre, id) {
        return '<div class="devis-tete"><h2 id="' + id + '" tabindex="-1">' + e(titre) + '</h2>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.fermer"' + confirmer() + '>' + e(T.retourAccueil) + '</button></div>';
    }

    /** Quitter une lecture qui n'est pas rangée : la question se pose d'abord (`data-confirm`, dispatcher de main.js). */
    function confirmer() {
        return (etat.ecran === 'lecture' || etat.ecran === 'comparer') ? ' data-confirm="' + e(T.confirmerQuitter) + '"' : '';
    }

    function erreurHtml() {
        return '<p id="devis-erreur" class="alerte alerte-erreur' + (etat.erreur ? '' : ' u-hide') + '" role="alert">' + e(etat.erreur) + '</p>';
    }

    function collerHtml() {
        if (!listeCours.length) {
            return tete(T.titre, 'devis-titre') + '<p class="devis-intro">' + e(T.intro) + '</p><p class="alerte alerte-information">' + e(T.aucunCours) + '</p>';
        }
        var c = coursChoisi();
        var deja = c && L().depuisFiche(c).aDuContenu;
        return tete(T.titre, 'devis-titre') + '<p class="devis-intro">' + e(T.intro) + '</p>' +
            '<div class="materiel-collage">' +
            '<label for="devis-cours">' + e(T.etiquetteCours) + '</label>' +
            '<select id="devis-cours" class="controle-form devis-select-cours"><option value="">' + e(T.choisirCours) + '</option>' +
            listeCours.map(function (x) { return '<option value="' + e(x.id) + '"' + (x.id === etat.coursId ? ' selected' : '') + '>' + e(libelle(x)) + '</option>'; }).join('') +
            '</select>' +
            (deja ? '<p class="devis-deja">' + e(T.dejaPorte) + ' <button type="button" class="materiel-btn-lien" data-action="materielDevis.revoirFiche">' + e(T.revoirFiche) + '</button></p>' : '') +
            '<label for="devis-zone-collage">' + e(T.etiquetteCollage) + '</label>' +
            '<p id="devis-consigne" class="devis-consigne">' + e(T.consigneCollage) + '</p>' +
            '<textarea id="devis-zone-collage" class="controle-form materiel-zone devis-zone" rows="8" aria-describedby="devis-consigne"></textarea>' +
            erreurHtml() +
            '<div class="materiel-actions">' +
            '<button type="button" class="btn btn-principal" data-action="materielDevis.lire">' + e(T.lire) + '</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.composer">' + e(T.composerMain) + '</button>' +
            '</div></div>';
    }

    /** Le menu « Déplacer » d'une ligne : où elle peut aller, seule ou avec celles qui la suivent. */
    function menuHtml(adr, nbDansListe) {
        var m = etat.modele, cibles = [];
        if (adr.zone !== 'contexte') cibles.push(['contexte', T.versContexte]);
        m.elements.forEach(function (x, k) {
            if (adr.zone === 'element' && adr.e === k) return;
            cibles.push(['element:' + k, T.versElement + ' ' + (k + 1) + (x.texte.trim() ? ' : ' + court(x.texte, 44) : '')]);
        });
        var une = cibles.slice();
        if (adr.zone === 'ecartees') une.push(['nouvelElement', T.enElement]);
        else une.push(['ecartees', T.versCote]);
        var suite = adr.i < nbDansListe - 1 ? cibles.concat(adr.zone === 'ecartees' ? [] : [['ecartees', T.versCote]]) : [];
        var opt = function (prefixe) { return function (c) { return '<option value="' + prefixe + '|' + e(c[0]) + '">' + e(c[1]) + '</option>'; }; };
        return '<select class="controle-form devis-menu" aria-label="' + e(T.deplacer) + '" data-devis-menu="1" data-zone="' + adr.zone + '"' +
            (adr.zone === 'element' ? ' data-e="' + adr.e + '"' : '') + ' data-i="' + adr.i + '">' +
            '<option value="">' + e(T.deplacerPlaceholder) + '</option>' +
            '<optgroup label="' + e(T.groupeUne) + '">' + une.map(opt('0')).join('') + '</optgroup>' +
            (suite.length ? '<optgroup label="' + e(T.groupeSuite) + '">' + suite.map(opt('1')).join('') + '</optgroup>' : '') +
            '</select>';
    }

    function champ(adr, texte, etiquette, classe) {
        return '<textarea class="controle-form devis-champ' + (classe ? ' ' + classe : '') + '" rows="' + Math.max(1, Math.ceil(String(texte).length / 64)) + '" aria-label="' + e(etiquette) + '"' +
            ' data-devis-champ="1" data-zone="' + adr.zone + '"' + (adr.e !== undefined ? ' data-e="' + adr.e + '"' : '') + (adr.i !== undefined ? ' data-i="' + adr.i + '"' : '') + '>' + e(texte) + '</textarea>';
    }

    function ligneHtml(adr, texte, nb, etiquette) {
        return '<li class="devis-ligne">' + champ(adr, texte, etiquette) + menuHtml(adr, nb) + '</li>';
    }

    function lectureHtml() {
        var m = etat.modele, c = coursChoisi(), n = L().compter(m);
        var bouton = function (action, texte, param, classe) {
            return '<button type="button" class="btn ' + (classe || 'btn-secondaire') + '" data-action="materielDevis.' + action + '"' + (param !== undefined ? ' data-param="' + param + '"' : '') + '>' + e(texte) + '</button>';
        };
        var contexte = m.contexte.length
            ? '<ul class="devis-liste">' + m.contexte.map(function (t, i) { return ligneHtml({ zone: 'contexte', i: i }, t, m.contexte.length, T.contexte + ', ligne ' + (i + 1)); }).join('') + '</ul>'
            : '<p class="devis-vide">' + e(T.contexteVide) + '</p>';
        var elements = m.elements.map(function (x, k) {
            return '<li class="devis-element" id="devis-element-' + k + '">' +
                '<div class="devis-element-tete"><span class="devis-element-numero">' + (k + 1) + '</span>' +
                champ({ zone: 'elementTexte', e: k }, x.texte, T.element + ' ' + (k + 1), 'devis-champ-element') +
                '<div class="devis-element-gestes">' +
                (k > 0 ? '<button type="button" class="btn btn-secondaire btn-compact" data-action="materielDevis.monter" data-param="' + k + '" aria-label="' + e(T.monter + ' l’élément ' + (k + 1)) + '">↑</button>' : '') +
                (k < m.elements.length - 1 ? '<button type="button" class="btn btn-secondaire btn-compact" data-action="materielDevis.descendre" data-param="' + k + '" aria-label="' + e(T.descendre + ' l’élément ' + (k + 1)) + '">↓</button>' : '') +
                '<button type="button" class="btn btn-secondaire btn-compact" data-action="materielDevis.retirerElement" data-param="' + k + '">' + e(T.retirerElement) + '</button>' +
                '</div></div>' +
                '<div class="devis-criteres"><h4>' + e(T.criteres) + '</h4>' +
                (x.criteres.length
                    ? '<ul class="devis-liste">' + x.criteres.map(function (t, i) { return ligneHtml({ zone: 'element', e: k, i: i }, t, x.criteres.length, 'Critère ' + (i + 1) + ' de l’élément ' + (k + 1)); }).join('') + '</ul>'
                    : '<p class="devis-vide">' + e(T.criteresVide) + '</p>') +
                bouton('ajouterCritere', T.ajouterCritere, k, 'btn-secondaire btn-compact') + '</div></li>';
        }).join('');
        var cote = m.ecartees.length
            ? '<details class="devis-cote"' + (etat.coteOuvert ? ' open' : '') + '><summary>' + e(T.deCote) + ' (' + m.ecartees.length + ')</summary>' +
              '<p class="devis-consigne">' + e(T.deCoteAide) + '</p><ul class="devis-liste">' +
              m.ecartees.map(function (t, i) { return ligneHtml({ zone: 'ecartees', i: i }, t, m.ecartees.length, 'Ligne mise de côté ' + (i + 1)); }).join('') + '</ul></details>'
            : '';
        return tete(etat.source === 'fiche' ? T.titreFiche : T.titreLecture, 'devis-titre') +
            '<p class="devis-intro">' + e(T.consigneLecture) + '</p>' +
            '<p class="devis-cours-choisi">' + e(T.pourLeCours) + ' <strong>' + e(c ? libelle(c) : '') + '</strong> · ' +
            e(pluriel(n.elements, 'élément', 'éléments') + ', ' + pluriel(n.criteres, 'critère de performance', 'critères de performance')) + '</p>' +
            '<div class="devis-feuille">' +
            '<div class="devis-entete"><div class="groupe-form"><label for="devis-numero">' + e(T.numero) + '</label>' +
            '<input type="text" id="devis-numero" class="controle-form" data-devis-champ="1" data-zone="numero"></div>' +
            '<div class="groupe-form"><label for="devis-enonce">' + e(T.enonce) + '</label>' +
            '<textarea id="devis-enonce" class="controle-form devis-champ" rows="2" data-devis-champ="1" data-zone="enonce">' + e(m.enonce) + '</textarea></div></div>' +
            '<section class="devis-section" aria-labelledby="devis-t-contexte"><h3 id="devis-t-contexte" tabindex="-1">' + e(T.contexte) + '</h3>' + contexte +
            bouton('ajouterContexte', T.ajouterContexte, undefined, 'btn-secondaire btn-compact') + '</section>' +
            '<section class="devis-section" aria-labelledby="devis-t-elements"><h3 id="devis-t-elements" tabindex="-1">' + e(T.elements) + '</h3>' +
            (m.elements.length ? '<ol class="devis-elements">' + elements + '</ol>' : '<p class="devis-vide">' + e(T.elementsVide) + '</p>') +
            bouton('ajouterElement', T.ajouterElement) + '</section>' + cote + '</div>' +
            '<p id="devis-annonce" class="devis-annonce" role="status" aria-live="polite">' + e(etat.annonce) + '</p>' + erreurHtml() +
            '<div class="materiel-actions devis-pied">' +
            bouton('accepter', T.accepter, undefined, 'btn-principal') +
            (etat.historique.length ? bouton('annuler', T.annuler) : '') +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.collerAutre"' + confirmer() + '>' + e(T.collerAutre) + '</button></div>';
    }

    /** Le devis en lecture seule : la comparaison, et la confirmation. */
    function apercuHtml(m) {
        var rien = '<span class="devis-vide">' + e(T.rien) + '</span>';
        var liste = function (a) { return '<ul>' + a.map(function (t) { return '<li>' + e(t) + '</li>'; }).join('') + '</ul>'; };
        var el2 = m.elements.filter(function (x) { return x.texte.trim() || x.criteres.length; });
        return '<dl class="devis-apercu">' +
            '<dt>' + e(T.numero) + '</dt><dd>' + (m.numero ? e(m.numero) : rien) + '</dd>' +
            '<dt>' + e(T.enonce) + '</dt><dd>' + (m.enonce ? e(m.enonce) : rien) + '</dd>' +
            '<dt>' + e(T.contexte) + '</dt><dd>' + (m.contexte.length ? liste(m.contexte) : rien) + '</dd>' +
            '<dt>' + e(T.elements) + '</dt><dd>' + (el2.length ? '<ol>' + el2.map(function (x) {
                return '<li>' + e(x.texte) + (x.criteres.length ? liste(x.criteres) : '') + '</li>';
            }).join('') + '</ol>' : rien) + '</dd></dl>';
    }

    /** Le modèle tel que la fiche le recevra (lignes vides parties), pour la colonne « Ce que tu apportes ». */
    function modeleNet(m) {
        var f = L().versFiche(m);
        return { numero: f.numeroCompetence, enonce: f.competence, contexte: f.devisCompetence.contexte, elements: f.devisCompetence.elements };
    }

    function comparerHtml() {
        var c = coursChoisi();
        return tete(T.titreComparer, 'devis-titre') +
            '<p class="devis-intro">' + e(T.consigneComparer) + '</p>' +
            '<p class="devis-cours-choisi">' + e(T.pourLeCours) + ' <strong>' + e(c ? libelle(c) : '') + '</strong></p>' +
            '<div class="devis-comparaison">' +
            '<section class="devis-colonne" aria-labelledby="devis-col-ancien"><h3 id="devis-col-ancien">' + e(T.colonneAncien) + '</h3>' + apercuHtml(etat.ancien) + '</section>' +
            '<section class="devis-colonne devis-colonne-neuve" aria-labelledby="devis-col-neuf"><h3 id="devis-col-neuf">' + e(T.colonneNouveau) + '</h3>' + apercuHtml(modeleNet(etat.modele)) + '</section>' +
            '</div>' + erreurHtml() +
            '<div class="materiel-actions devis-pied">' +
            '<button type="button" class="btn btn-principal" data-action="materielDevis.remplacer">' + e(T.remplacer) + '</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.revenirLecture">' + e(T.revenirLecture) + '</button></div>';
    }

    function rangeHtml() {
        var r = etat.resume;
        return '<section class="materiel-confirmation" aria-labelledby="devis-titre">' +
            '<div class="materiel-confirmation-titre"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"></circle><path d="M14 25l7 7 13-15"></path></svg>' +
            '<h2 id="devis-titre" tabindex="-1">' + e(T.titreRange) + '</h2></div>' +
            '<p>' + e('La fiche de « ' + r.cours + ' » porte maintenant la compétence ' + (r.modele.numero || '') + ', avec ' +
                pluriel(r.n.elements, 'élément', 'éléments') + ' et ' + pluriel(r.n.criteres, 'critère de performance', 'critères de performance') +
                (r.n.contexte ? ', et son contexte de réalisation' : '') + '. Rien d’autre n’a changé dans l’application.') + '</p>' +
            apercuHtml(r.modele) +
            '<div class="materiel-actions devis-pied">' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.ouvrir">' + e(T.autreDevis) + '</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.fermer">' + e(T.retourAccueil) + '</button></div></section>';
    }

    // ------------------------------------------------------------------
    // La page
    // ------------------------------------------------------------------

    /** Rend l'écran courant. `focus` : l'id (ou l'élément) qui reçoit le focus ; par défaut, rien ne bouge. */
    function rendre(focus) {
        var vue = el('materiel-devis'), accueil = el('materiel-accueil'), confirmation = el('materiel-lecture');
        if (!vue) return;
        if (etat.ecran === 'ferme') {
            vue.innerHTML = '';
            vue.classList.add('u-hide');
            return;
        }
        var y = window.scrollY;
        vue.innerHTML = etat.ecran === 'coller' ? collerHtml() : etat.ecran === 'lecture' ? lectureHtml()   // security-ok: tout texte passe par echapperHtml
            : etat.ecran === 'comparer' ? comparerHtml() : rangeHtml();
        var numero = el('devis-numero');
        if (numero && etat.modele) numero.value = etat.modele.numero;
        vue.classList.remove('u-hide');
        if (accueil) accueil.classList.add('u-hide');
        if (confirmation) confirmation.classList.add('u-hide');
        if (window.MaterielAide) window.MaterielAide.regler();
        var cible = typeof focus === 'string' ? (el(focus) || vue.querySelector(focus)) : null;
        if (cible) {
            cible.focus({ preventScroll: focus !== 'devis-titre' });
            if (focus !== 'devis-titre') window.scrollTo(0, y);
        }
    }

    function dire(erreur) {
        etat.erreur = erreur || '';
        var p = el('devis-erreur');
        if (!p) return;
        p.textContent = etat.erreur;
        p.classList.toggle('u-hide', !etat.erreur);
    }

    async function chargerCours() {
        var tous = window.CoursEntite ? (await window.CoursEntite.obtenirTous()) : [];
        listeCours = (tous || []).filter(function (c) { return c && c.nature !== 'service' && c.dansBibliotheque !== false; });
    }

    /** Un geste de correction : le modèle d'avant reste dans l'historique (« Annuler le dernier geste »). */
    function appliquer(neuf, annonce, focus) {
        etat.historique.push(etat.modele);
        if (etat.historique.length > 50) etat.historique.shift();
        etat.modele = neuf;
        etat.annonce = annonce || '';
        etat.erreur = '';
        var cote = document.querySelector('#materiel-devis .devis-cote');
        etat.coteOuvert = !!(cote && cote.open);
        rendre(focus);
    }

    function adresse(noeud) {
        var d = noeud.dataset, a = { zone: d.zone };
        if (d.e !== undefined) a.e = Number(d.e);
        if (d.i !== undefined) a.i = Number(d.i);
        return a;
    }

    function nomCible(vers) {
        return vers.zone === 'contexte' ? 'le contexte de réalisation' : vers.zone === 'ecartees' ? 'les lignes mises de côté' : 'l’élément ' + (vers.e + 1);
    }

    function surMenu(menu) {
        var v = menu.value;
        if (!v) return;
        var de = adresse(menu), suite = v.charAt(0) === '1', cible = v.slice(2);
        if (cible === 'nouvelElement') {
            appliquer(L().enElement(etat.modele, de.i), 'Ligne devenue l’élément ' + (etat.modele.elements.length + 1) + '.', '#devis-element-' + etat.modele.elements.length + ' textarea');
            return;
        }
        var vers = cible.indexOf('element:') === 0 ? { zone: 'element', e: Number(cible.slice(8)) } : { zone: cible };
        var avant = etat.modele, neuf = L().deplacer(avant, de, vers, suite);
        var source = de.zone === 'contexte' ? avant.contexte : de.zone === 'ecartees' ? avant.ecartees : avant.elements[de.e].criteres;
        var nb = suite ? source.length - de.i : 1;
        if (vers.zone === 'ecartees') etat.coteOuvert = true;
        appliquer(neuf, pluriel(nb, 'ligne déplacée', 'lignes déplacées') + ' vers ' + nomCible(vers) + '.',
            vers.zone === 'contexte' ? 'devis-t-contexte' : vers.zone === 'element' ? '#devis-element-' + vers.e + ' textarea' : '.devis-cote summary');
    }

    /** Une frappe retouche le modèle sans rien rendre de nouveau : le curseur reste où il est. */
    function surSaisie(champ) {
        if (etat.ecran !== 'lecture' || !etat.modele) return;
        etat.modele = L().retoucher(etat.modele, adresse(champ), champ.value);
    }

    function brancher(vue) {
        if (vue.dataset.devisBranche) return;
        vue.dataset.devisBranche = '1';
        vue.addEventListener('input', function (ev) {
            var t = ev.target;
            if (t && t.dataset && t.dataset.devisChamp) surSaisie(t);
        });
        vue.addEventListener('change', function (ev) {
            var t = ev.target;
            if (!t || !t.dataset) return;
            if (t.dataset.devisMenu) surMenu(t);
            else if (t.id === 'devis-cours') {
                var zone = el('devis-zone-collage'), texte = zone ? zone.value : '';
                etat.coursId = t.value;
                etat.erreur = '';
                rendre('devis-cours');
                if (el('devis-zone-collage')) el('devis-zone-collage').value = texte;
            }
        });
    }

    function ouvrirLecture(modele, source) {
        etat.modele = L().copie(modele);
        etat.source = source;
        etat.historique = [];
        etat.annonce = '';
        etat.erreur = '';
        etat.coteOuvert = false;
        etat.ecran = 'lecture';
        rendre('devis-titre');
    }

    async function ranger() {
        var fiche = L().versFiche(etat.modele), id = etat.coursId, cours = coursChoisi();
        var ecrit = null;
        try {
            var ecrire = function () { return window.CoursEntite.mettreAJour(id, fiche); };
            ecrit = typeof window.ecrireEtAnnoncer === 'function'
                ? await window.ecrireEtAnnoncer(window.CoursEntite.CLE, ecrire, { geste: 'Ranger le devis' })
                : await ecrire();
        } catch (err) {
            console.error('[Devis] Écriture de la fiche échouée :', err);
        }
        if (!ecrit) { dire(T.erreurEcriture); return; }
        var modele = modeleNet(etat.modele);
        etat = etatNeuf();
        etat.ecran = 'range';
        etat.resume = { cours: libelle(ecrit || cours), modele: modele, n: L().compter(modele) };
        await chargerCours();
        rendre('devis-titre');
    }

    var materielDevis = {
        /** Geste 1 : depuis l'accueil, l'entrée du devis. */
        ouvrir: async function () {
            var vue = el('materiel-devis');
            if (!vue || !L()) return;
            brancher(vue);
            await chargerCours();
            etat = etatNeuf();
            etat.ecran = 'coller';
            rendre('devis-titre');
        },
        /** Retour à l'accueil d'« Apporter mon matériel » ; une lecture non acceptée n'a rien écrit. */
        fermer: function () {
            etat = etatNeuf();
            rendre();
            if (window.materiel && typeof window.materiel.revenirDissection === 'function') window.materiel.revenirDissection();
            else { var a = el('materiel-accueil'); if (a) a.classList.remove('u-hide'); }
        },
        /** Gestes 3 et 4 : lire le collage, montrer ce qui a été lu. */
        lire: function () {
            var zone = el('devis-zone-collage'), texte = zone ? zone.value : '';
            if (!etat.coursId) { dire(T.erreurCours); if (el('devis-cours')) el('devis-cours').focus(); return; }
            if (!texte.trim()) { dire(T.erreurVide); if (zone) zone.focus(); return; }
            var m = L().lire(texte);
            if (!m.reconnu) { dire(T.erreurRien); return; }
            ouvrirLecture(m, 'collage');
        },
        /** Le devis composé à la main : la même feuille, vide. */
        composer: function () {
            if (!etat.coursId) { dire(T.erreurCours); if (el('devis-cours')) el('devis-cours').focus(); return; }
            ouvrirLecture(L().modeleVide(), 'collage');
        },
        /** Ce que la fiche porte déjà, sur la même feuille : le devis se revoit et se corrige après coup. */
        revoirFiche: function () {
            var c = coursChoisi();
            if (c) ouvrirLecture(L().depuisFiche(c), 'fiche');
        },
        ajouterContexte: function () {
            appliquer(L().ajouterLigne(etat.modele, { zone: 'contexte' }), '', '.devis-section .devis-liste > li:last-child textarea');
        },
        ajouterCritere: function (k) {
            appliquer(L().ajouterLigne(etat.modele, { zone: 'element', e: Number(k) }), '', '#devis-element-' + Number(k) + ' .devis-liste > li:last-child textarea');
        },
        ajouterElement: function () {
            appliquer(L().ajouterElement(etat.modele), '', '#devis-element-' + etat.modele.elements.length + ' textarea');
        },
        retirerElement: function (k) {
            etat.coteOuvert = true;
            appliquer(L().retirerElement(etat.modele, Number(k)), 'Élément ' + (Number(k) + 1) + ' retiré : son texte et ses critères sont mis de côté.', 'devis-t-elements');
        },
        monter: function (k) { k = Number(k); appliquer(L().bougerElement(etat.modele, k, -1), 'Élément monté.', '#devis-element-' + (k - 1) + ' textarea'); },
        descendre: function (k) { k = Number(k); appliquer(L().bougerElement(etat.modele, k, 1), 'Élément descendu.', '#devis-element-' + (k + 1) + ' textarea'); },
        annuler: function () {
            if (!etat.historique.length) return;
            etat.modele = etat.historique.pop();
            etat.annonce = 'Dernier geste annulé.';
            rendre('devis-annonce');
        },
        collerAutre: function () {
            var id = etat.coursId;
            etat = etatNeuf();
            etat.ecran = 'coller';
            etat.coursId = id;
            rendre('devis-zone-collage');
        },
        /** Geste 6 : accepter. La fiche porte déjà quelque chose : l'ancien et le nouveau côte à côte, d'abord. */
        accepter: async function () {
            var f = L().versFiche(etat.modele);
            if (!f.numeroCompetence && !f.competence && !f.devisCompetence.elements.length) { dire(T.erreurIncomplet); return; }
            var cours = window.CoursEntite ? await window.CoursEntite.obtenirParId(etat.coursId) : null;   // la fiche d'aujourd'hui, pas celle de l'ouverture
            if (!cours) { dire(T.erreurCoursParti); return; }
            var ancien = L().depuisFiche(cours);
            if (ancien.aDuContenu) {
                etat.ancien = ancien;
                etat.erreur = '';
                etat.ecran = 'comparer';
                rendre('devis-titre');
                return;
            }
            await ranger();
        },
        remplacer: async function () { if (etat.ecran === 'comparer') await ranger(); },
        revenirLecture: function () {
            etat.ecran = 'lecture';
            etat.ancien = null;
            etat.erreur = '';
            rendre('devis-titre');
        },
        estOuvert: function () { return etat.ecran !== 'ferme'; },
        textes: T
    };

    window.materielDevis = materielDevis;
})();
