/**
 * materiel-devis.js — Conception › « Apporter mon matériel » : numériser un devis ministériel.
 *
 * Lot « Le devis ministériel dans Apporter mon matériel » (28 nov. 2026, demande de Grégoire, 7 h 26 à 7 h 55 ;
 * correctif de 8 h 08, ses mots : « numériser ne touche aucun cours et c'est la création du cours qui vient puiser
 * dans le devis numérisé »). L'enseignant·e colle son devis ; voit ce qui a été lu, rangé comme le tableau d'origine ;
 * corrige sur place ; accepte. Le devis se range alors dans la RÉSERVE DE DEVIS (`devisMinisteriels`, clé globale,
 * hors trimestre). L'accueil montre les devis rangés ; chacun se rouvre pour être relu et corrigé.
 *
 * ⛔ AUCUNE FICHE DE COURS N'EST TOUCHÉE : ce fichier ne lit ni n'écrit `cours`.
 * ⛔ LA LECTURE NE S'ENREGISTRE JAMAIS D'OFFICE. Une seule écriture (`ranger`), derrière le bouton d'acceptation ; et
 * quand un devis du même code est déjà rangé, derrière un second accord, l'ancien et le nouveau côte à côte. Rien ne
 * se supprime : ce lot n'offre aucun geste pour retirer un devis de la réserve.
 *
 * La lecture, les gestes de correction et le rangement sont des fonctions pures (`devis-lecture.js`). Rien n'est
 * gardé en brouillon : une lecture non acceptée se perd au rechargement de la page.
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
        titre: 'Numériser un devis ministériel',
        intro: 'Colle ici le devis d’une compétence : tu verras ce qui a été lu, tu corrigeras au besoin, puis tu le rangeras parmi tes devis. Il ne touche aucun cours : c’est à la création d’un cours que tu viendras y puiser. Rien ne s’enregistre avant ton accord.',
        retourAccueil: 'Revenir à l’accueil',
        retourEtiquetage: 'Revenir à mon étiquetage',
        etiquetteCollage: 'Colle ton devis ici',
        consigneCollage: 'Dans le PDF du ministère, sélectionne tout le devis de la compétence, toutes ses pages comprises, copie-le d’un seul geste, puis colle-le (⌘ V).',
        lire: 'Lire mon devis',
        erreurVide: 'Il n’y a rien à lire. Copie ton devis dans le PDF du ministère, puis colle-le dans la zone.',
        erreurRien: 'L’application n’a rien reconnu d’un devis dans ce que tu as collé : ni « Code : », ni « Énoncé de la compétence », ni élément numéroté. Vérifie que tu as copié le devis en entier, ou compose-le à la main.',
        composerMain: 'Composer le devis à la main',
        titreLecture: 'Voici ce que l’application a lu',
        titreRouvert: 'Ton devis rangé',
        consigneLecture: 'Compare avec ton devis. Retouche un texte en écrivant dedans. Pour une ligne mal rangée, choisis où elle va dans son menu « Déplacer ». Rien n’est enregistré tant que tu n’as pas rangé le devis.',
        ceQuiEstLu: 'Lu :',
        activites: 'Activités d’apprentissage',
        activitesAide: 'Quand le devis les porte (en formation générale). Laisse vide ce qu’il ne dit pas.',
        champsActivites: { discipline: 'Discipline', ponderation: 'Pondération', unites: 'Unités', heures: 'Heures ou périodes', precisions: 'Précisions' },
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
        deCoteAide: 'Ce qui ne fait pas partie de la compétence (pied de page, en-tête) ou que tu as retiré. Rien de ceci ne sera rangé. Une ligne mise de côté à tort se replace par son menu « Déplacer ».',
        annuler: 'Annuler le dernier geste',
        accepter: 'Ranger ce devis',
        collerAutre: 'Coller un autre devis',
        confirmerQuitter: 'Ta lecture corrigée n’est pas rangée : elle sera perdue. Continuer ?',
        erreurSansCode: 'Donne le numéro de la compétence avant de ranger ce devis : c’est par lui qu’il se retrouve.',
        erreurConflit: 'Un autre devis rangé porte déjà ce numéro. Corrige le numéro, ou rouvre l’autre devis depuis l’accueil.',
        titreComparer: 'Un devis de ce numéro est déjà rangé',
        consigneComparer: 'Si tu acceptes, ce que tu apportes remplace le devis déjà rangé. Tes autres devis et tes cours ne changent pas.',
        colonneAncien: 'Le devis déjà rangé',
        colonneNouveau: 'Ce que tu apportes',
        remplacer: 'Remplacer le devis déjà rangé',
        revenirLecture: 'Revenir à ma lecture',
        rien: 'Rien',
        titreRange: 'Ton devis est rangé',
        erreurEcriture: 'Le devis n’a pas pu être rangé. Rien n’a changé ; essaie de nouveau.',
        autreDevis: 'Numériser un autre devis',
        rangesTitre: 'Tes devis rangés',
        rouvrir: 'Rouvrir',
        exporter: 'Exporter mes devis',
        exporterAide: 'Un fichier à passer à un·e collègue, qui l’ouvre par « Importer » : il ne porte que tes devis.',
        rangesDemo: 'Tu es dans la démonstration : les devis que tu ranges ici restent dans la démonstration.',
        importTitre: 'Devis ministériels',
        importSousTitre: 'Les devis numérisés que porte ce fichier',
        importNeuf: 'nouveau',
        importIdentique: 'déjà rangé chez toi, identique : rien à importer',
        importDifferent: 'Un devis de ce numéro est déjà rangé chez toi, et son contenu diffère. Compare les deux ; il ne sera remplacé que si tu coches cette case.',
        importComparer: 'Comparer les deux devis',
        importColonneAncien: 'Ton devis rangé',
        importColonneNouveau: 'Le devis du fichier',
        importNote: 'Un devis importé se range parmi tes devis. Aucun cours n’est touché.'
    };

    var etat = etatNeuf();
    var reserve = [];

    function etatNeuf() {
        return { ecran: 'ferme', idOuvert: '', modele: null, historique: [], ancien: null, erreur: '', annonce: '', resume: null };
    }

    function L() { return window.devisLecture; }
    function e(v) { return echapperHtml(v == null ? '' : v); }
    function el(id) { return document.getElementById(id); }
    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
    function court(t, n) { t = String(t || '').trim(); return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; }

    // ------------------------------------------------------------------
    // Les rendus (tout texte passe par `e`)
    // ------------------------------------------------------------------

    function tete(titre, id) {
        return '<div class="devis-tete"><h2 id="' + id + '" tabindex="-1">' + e(titre) + '</h2>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.fermer"' + confirmer() + '>' + e(motDuRetour()) + '</button></div>';
    }

    /** Quitter une lecture qui n'est pas rangée : la question se pose d'abord (`data-confirm`, dispatcher de main.js). */
    function confirmer() {
        return (etat.ecran === 'lecture' || etat.ecran === 'comparer') ? ' data-confirm="' + e(T.confirmerQuitter) + '"' : '';
    }

    function erreurHtml() {
        return '<p id="devis-erreur" class="alerte alerte-erreur' + (etat.erreur ? '' : ' u-hide') + '" role="alert">' + e(etat.erreur) + '</p>';
    }

    /** Le retour mène à l'étiquetage quand une grille y est en brouillon (elle se rouvre telle quelle), sinon à l'accueil. */
    function motDuRetour() {
        var d = window.materielDissection;
        return d && typeof d.aUnBrouillon === 'function' && d.aUnBrouillon() ? T.retourEtiquetage : T.retourAccueil;
    }

    function enDemo() { return typeof window.estEnModeDemo === 'function' && window.estEnModeDemo(); }

    /** La réserve où lire et ranger : celle de la démonstration quand on y est, sinon la vraie. Jamais les deux. */
    function cleReserve() { return enDemo() ? L().CLE_RESERVE_DEMO : L().CLE_RESERVE; }

    function collerHtml() {
        return tete(T.titre, 'devis-titre') + '<p class="devis-intro">' + e(T.intro) + '</p>' +
            '<div class="materiel-collage">' +
            '<label for="devis-zone-collage">' + e(T.etiquetteCollage) + '</label>' +
            '<p id="devis-consigne" class="devis-consigne">' + e(T.consigneCollage) + '</p>' +
            '<textarea id="devis-zone-collage" class="controle-form materiel-zone devis-zone" rows="8" aria-describedby="devis-consigne"></textarea>' +
            erreurHtml() +
            '<div class="materiel-actions">' +
            '<button type="button" class="btn btn-principal" data-action="materielDevis.lire">' + e(T.lire) + '</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.composer">' + e(T.composerMain) + '</button>' +
            '</div></div>' +
            // Les devis rangés se montrent ici aussi : depuis un étiquetage en brouillon, l'accueil reste caché.
            '<div class="materiel-collage materiel-devis-entree devis-ranges-ecran">' + rangesHtml() + '</div>';
    }

    /** Sur l'accueil : les devis déjà rangés, chacun avec son bouton « Rouvrir ». Rien quand la réserve est vide. */
    function rangesHtml() {
        if (!reserve.length) return '';
        return '<h4>' + e(T.rangesTitre) + '</h4>' + (enDemo() ? '<p class="devis-consigne">' + e(T.rangesDemo) + '</p>' : '') + '<ul class="devis-ranges">' + reserve.map(function (d) {
            var n = L().compter(d);
            return '<li><span class="devis-range-texte"><strong>' + e(d.code) + '</strong> ' + e(d.enonce) +
                ' <span class="devis-range-compte">' + e(pluriel(n.elements, 'élément', 'éléments') + ', ' + pluriel(n.criteres, 'critère de performance', 'critères de performance')) + '</span></span>' +
                '<button type="button" class="btn btn-secondaire btn-compact" data-action="materielDevis.rouvrir" data-param-id="' + e(d.id) + '" aria-label="' + e(T.rouvrir + ' le devis ' + d.code) + '">' + e(T.rouvrir) + '</button></li>';
        }).join('') + '</ul>' +
            '<div class="devis-ranges-pied"><button type="button" class="btn btn-secondaire btn-compact" data-action="materielDevis.exporter">' + e(T.exporter) + '</button>' +
            '<span class="devis-consigne">' + e(T.exporterAide) + '</span></div>';
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

    /** Les activités d'apprentissage : cinq champs libres, que la création d'un cours viendra lire. */
    function activitesHtml(m) {
        return '<section class="devis-section" aria-labelledby="devis-t-activites"><h3 id="devis-t-activites">' + e(T.activites) + '</h3>' +
            '<p class="devis-consigne">' + e(T.activitesAide) + '</p><div class="devis-activites">' +
            L().CHAMPS_ACTIVITES.map(function (c) {
                var id = 'devis-activite-' + c;
                return '<div class="groupe-form' + (c === 'precisions' ? ' devis-activite-large' : '') + '"><label for="' + id + '">' + e(T.champsActivites[c]) + '</label>' +
                    '<textarea id="' + id + '" class="controle-form devis-champ" rows="' + (c === 'precisions' ? 2 : 1) + '" data-devis-champ="1" data-zone="activite" data-champ="' + c + '">' + e(m.activites[c]) + '</textarea></div>';
            }).join('') + '</div></section>';
    }

    function lectureHtml() {
        var m = etat.modele, n = L().compter(m);
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
        return tete(etat.idOuvert ? T.titreRouvert : T.titreLecture, 'devis-titre') +
            '<p class="devis-intro">' + e(T.consigneLecture) + '</p>' +
            '<p class="devis-compte">' + e(T.ceQuiEstLu) + ' ' +
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
            bouton('ajouterElement', T.ajouterElement) + '</section>' + activitesHtml(m) + cote + '</div>' +
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
            }).join('') + '</ol>' : rien) + '</dd>' +
            L().CHAMPS_ACTIVITES.filter(function (c) { return m.activites && m.activites[c]; }).map(function (c) {
                return '<dt>' + e(T.champsActivites[c]) + '</dt><dd>' + e(m.activites[c]) + '</dd>';
            }).join('') + '</dl>';
    }

    /** Un devis de la réserve (ou ce qui va y entrer), sous la forme que lit `apercuHtml`. */
    function enApercu(d) {
        return { numero: d.code, enonce: d.enonce, contexte: d.contexte, elements: d.elements, activites: d.activites };
    }

    function comparerHtml() {
        return tete(T.titreComparer, 'devis-titre') +
            '<p class="devis-intro">' + e(T.consigneComparer) + '</p>' +
            '<div class="devis-comparaison">' +
            '<section class="devis-colonne" aria-labelledby="devis-col-ancien"><h3 id="devis-col-ancien">' + e(T.colonneAncien) + '</h3>' + apercuHtml(enApercu(etat.ancien)) + '</section>' +
            '<section class="devis-colonne devis-colonne-neuve" aria-labelledby="devis-col-neuf"><h3 id="devis-col-neuf">' + e(T.colonneNouveau) + '</h3>' + apercuHtml(enApercu(L().pourReserve(etat.modele))) + '</section>' +
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
            '<p>' + e('Le devis ' + r.modele.numero + ' est rangé parmi tes devis, avec ' +
                pluriel(r.n.elements, 'élément', 'éléments') + ' et ' + pluriel(r.n.criteres, 'critère de performance', 'critères de performance') +
                (r.n.contexte ? ', et son contexte de réalisation' : '') + '. Aucun cours n’a changé : tu y puiseras en créant un cours.') + '</p>' +
            apercuHtml(r.modele) +
            '<div class="materiel-actions devis-pied">' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.ouvrir">' + e(T.autreDevis) + '</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materielDevis.fermer">' + e(motDuRetour()) + '</button></div></section>';
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

    /** Lit la réserve de devis (clé globale) et rend la liste de l'accueil. */
    async function chargerReserve() {
        var lue = null;
        try { lue = await db.get(cleReserve()); }
        catch (err) { console.warn('[Devis] Réserve de devis illisible :', err); }
        reserve = L().reserveSure(lue);
        var zone = el('materiel-devis-ranges');
        if (zone) zone.innerHTML = rangesHtml();   // security-ok: tout texte passe par echapperHtml
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
        if (d.champ !== undefined) a.champ = d.champ;
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
        });
    }

    function ouvrirLecture(modele, idOuvert) {
        etat.modele = L().copie(modele);
        etat.idOuvert = idOuvert || '';
        etat.historique = [];
        etat.annonce = '';
        etat.erreur = '';
        etat.coteOuvert = false;
        etat.ecran = 'lecture';
        rendre('devis-titre');
    }

    function idNeuf() {
        return 'DEVIS_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    /** La SEULE écriture de ce fichier : la réserve relue au moment d'écrire, le devis rangé, rien d'autre ne bouge. */
    async function ranger() {
        var devis = L().pourReserve(etat.modele), opts = { idOuvert: etat.idOuvert, idNeuf: idNeuf(), maintenant: new Date().toISOString() };
        var ecrit = null;
        try {
            ecrit = await window.modifierEtAnnoncer(cleReserve(), function (lue) {
                var neuve = L().ranger(lue, devis, opts);
                return neuve === null ? undefined : neuve;
            }, [], { geste: 'Ranger le devis' });
        } catch (err) {
            console.error('[Devis] Écriture de la réserve échouée :', err);
        }
        if (!ecrit) { dire(T.erreurEcriture); return; }
        var modele = enApercu(devis);
        etat = etatNeuf();
        etat.ecran = 'range';
        etat.resume = { modele: modele, n: L().compter(modele) };
        await chargerReserve();
        rendre('devis-titre');
    }

    var materielDevis = {
        /** Geste 1 : depuis l'accueil, l'entrée du devis. */
        ouvrir: async function () {
            var vue = el('materiel-devis');
            if (!vue || !L()) return;
            brancher(vue);
            await chargerReserve();
            etat = etatNeuf();
            etat.ecran = 'coller';
            rendre('devis-titre');
        },
        /**
         * Depuis l'en-tête de l'étiquetage d'une grille (second amendement, 28 nov.) : l'étiquetage se ferme SANS perdre
         * son brouillon (`materielDissection.fermer` l'écrit d'abord), et se rouvre tel quel au retour (`fermer`, plus bas).
         */
        ouvrirDepuisEtiquetage: async function () {
            if (window.materielDissection && window.materielDissection.estOuverte()) window.materielDissection.fermer();
            await materielDevis.ouvrir();
        },
        /** Retour à l'accueil d'« Apporter mon matériel » ; une lecture non acceptée n'a rien écrit. */
        fermer: function () {
            etat = etatNeuf();
            rendre();
            if (window.materiel && typeof window.materiel.revenirDissection === 'function') window.materiel.revenirDissection();
            else { var a = el('materiel-accueil'); if (a) a.classList.remove('u-hide'); }
        },
        /** Lire le collage, montrer ce qui a été lu. */
        lire: function () {
            var zone = el('devis-zone-collage'), texte = zone ? zone.value : '';
            if (!texte.trim()) { dire(T.erreurVide); if (zone) zone.focus(); return; }
            var m = L().lire(texte);
            if (!m.reconnu) { dire(T.erreurRien); return; }
            ouvrirLecture(m, '');
        },
        /** Le devis composé à la main : la même feuille, vide. */
        composer: function () { ouvrirLecture(L().modeleVide(), ''); },
        /** Un devis rangé se rouvre sur la même feuille, pour être relu et corrigé (`data-param-id` : l'id n'est pas un nombre). */
        rouvrir: async function (bouton) {
            var id = bouton && bouton.dataset ? bouton.dataset.paramId : String(bouton);
            var vue = el('materiel-devis');
            if (!vue || !L()) return;
            brancher(vue);
            await chargerReserve();
            var d = reserve.find(function (x) { return x.id === id; });
            if (!d) return;
            etat = etatNeuf();
            ouvrirLecture(L().depuisReserve(d), d.id);
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
            etat = etatNeuf();
            etat.ecran = 'coller';
            rendre('devis-zone-collage');
        },
        /** Accepter. Un devis de ce code est déjà rangé : l'ancien et le nouveau côte à côte, d'abord. */
        accepter: async function () {
            var devis = L().pourReserve(etat.modele);
            if (!devis.code) { dire(T.erreurSansCode); if (el('devis-numero')) el('devis-numero').focus(); return; }
            await chargerReserve();   // la réserve d'aujourd'hui, pas celle de l'ouverture
            var p = L().place(reserve, devis, etat.idOuvert);
            if (p.conflit) { dire(T.erreurConflit); return; }
            if (p.ancien) {
                etat.ancien = p.ancien;
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
        /**
         * Un fichier qui ne porte que les devis rangés (`{ devisMinisteriels: [...] }`), pour les passer à un·e collègue
         * sans donner tout son codex ; il s'ouvre par l'import par cases (`devisImport`). Rien n'est écrit ici.
         */
        exporter: async function () {
            await chargerReserve();
            if (!reserve.length || !window.FichierSortant) return;
            var contenu = {};
            contenu[L().CLE_RESERVE] = reserve;
            window.FichierSortant.telecharger(new Blob([JSON.stringify(contenu, null, 2)], { type: 'application/json' }),
                'devis-ministeriels-' + new Date().toISOString().slice(0, 10) + '.json');
        },
        /** La réserve de devis telle qu'elle est maintenant (celle de la démonstration quand on y est), lue sans attendre. */
        reserveCourante: function () { return L() ? L().reserveSure(db.getSync(cleReserve(), [])) : []; },
        /**
         * Depuis la fiche d'un cours (js/cours-devis.js) : ouvrir « Apporter mon matériel » sur le devis de ce code. Un
         * étiquetage en brouillon se ferme sans rien perdre, comme par son propre bouton.
         */
        rouvrirParCode: async function (code) {
            if (typeof window.afficherSection === 'function') window.afficherSection('conception');
            if (typeof window.afficherSousSection === 'function') window.afficherSousSection('conception-materiel');
            await chargerReserve();
            var d = reserve.find(function (x) { return x.code === String(code); });
            if (!d) return;
            if (window.materielDissection && window.materielDissection.estOuverte()) window.materielDissection.fermer();
            var bouton = { dataset: { paramId: d.id } };
            await materielDevis.rouvrir(bouton);
        },
        estOuvert: function () { return etat.ecran !== 'ferme'; },
        /** L'accueil vient de s'afficher : la liste des devis rangés suit la réserve. */
        rafraichirAccueil: chargerReserve,
        textes: T
    };

    function initialiser() {
        if (typeof window.auDbPret === 'function') window.auDbPret(chargerReserve);
        if (typeof window.addEventListener !== 'function') return;
        window.addEventListener('sectionAffichee', function (ev) {
            if (ev.detail && ev.detail.idSousSection === 'conception-materiel' && typeof window.auDbPret === 'function') window.auDbPret(chargerReserve);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    // ------------------------------------------------------------------
    // L'import par cases (js/import-export.js) : les devis d'un fichier reçu
    // ------------------------------------------------------------------

    /** Les devis du fichier (`devisMinisteriels`, parfois en texte JSON), confrontés à la réserve lue à l'instant. */
    function confrontes(config) {
        var v = config ? config[L().CLE_RESERVE] : null;
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (err) { v = null; } }
        return L().confronter(db.getSync(cleReserve(), []), v);
    }

    function ligneImportHtml(c, i) {
        var n = L().compter(c.devis), case_ = '', etat = '';
        var texte = '<strong>' + e(c.devis.code) + '</strong> ' + e(c.devis.enonce) + ' <span class="devis-range-compte">' +
            e(pluriel(n.elements, 'élément', 'éléments') + ', ' + pluriel(n.criteres, 'critère de performance', 'critères de performance')) + '</span>';
        if (c.etat === 'identique') etat = '<span class="devis-import-etat">' + e(T.importIdentique) + '</span>';
        else case_ = '<input type="checkbox" class="import-item-devis" data-item-id="' + i + '"' + (c.etat === 'neuf' ? ' checked' : '') + ' aria-label="' + e('Importer le devis ' + c.devis.code) + '">';
        if (c.etat === 'neuf') etat = '<span class="devis-import-etat">' + e(T.importNeuf) + '</span>';
        var comparaison = c.etat !== 'different' ? '' : '<p class="devis-import-alerte">' + e(T.importDifferent) + '</p>' +
            '<details class="devis-import-comparer"><summary>' + e(T.importComparer) + '</summary><div class="devis-comparaison">' +
            '<section class="devis-colonne"><h4>' + e(T.importColonneAncien) + '</h4>' + apercuHtml(enApercu(c.ancien)) + '</section>' +
            '<section class="devis-colonne devis-colonne-neuve"><h4>' + e(T.importColonneNouveau) + '</h4>' + apercuHtml(enApercu(c.devis)) + '</section>' +
            '</div></details>';
        return '<li class="devis-import-ligne"><label class="devis-import-tete">' + case_ + '<span>' + texte + ' ' + etat + '</span></label>' + comparaison + '</li>';
    }

    var devisImport = {
        /** Combien de devis ce fichier propose (pour que la fenêtre d'import ne se dise pas vide). */
        compter: function (config) { return L() ? confrontes(config).length : 0; },
        /** La section de la fenêtre d'import ; rien quand le fichier ne porte aucun devis. Tout texte échappé. */
        sectionHtml: function (config) {
            var liste = L() ? confrontes(config) : [];
            if (!liste.length) return '';
            return '<div class="devis-import"><h3>' + e(T.importTitre) + ' <span>' + e(T.importSousTitre) + '</span></h3>' +
                '<ul class="devis-import-liste">' + liste.map(ligneImportHtml).join('') + '</ul>' +
                '<p class="devis-consigne">' + e(T.importNote) + '</p></div>';
        },
        /**
         * Range les devis cochés. Une case cochée sur un devis `different` EST l'accord de remplacement : la fenêtre a
         * montré l'ancien et le nouveau. Un devis `identique` n'a pas de case. La réserve est relue au moment d'écrire.
         * @param {Object} config - le fichier
         * @param {Array<string>} coches - les `data-item-id` des cases cochées
         * @returns {Promise<number>} le nombre de devis rangés
         */
        importer: async function (config, coches) {
            var choisis = confrontes(config).filter(function (c, i) { return c.etat !== 'identique' && (coches || []).map(String).indexOf(String(i)) !== -1; });
            if (!choisis.length) return 0;
            var maintenant = new Date().toISOString();
            var ecrit = await window.modifierEtAnnoncer(cleReserve(), function (lue) {
                var liste = lue;
                choisis.forEach(function (c) {
                    var neuve = L().ranger(liste, c.devis, { idNeuf: idNeuf(), maintenant: maintenant });
                    if (neuve) liste = neuve;
                });
                return liste === lue ? undefined : liste;
            }, [], { geste: 'Importer des devis', discret: true });
            return ecrit ? choisis.length : 0;
        }
    };

    window.devisImport = devisImport;
    window.materielDevis = materielDevis;
})();
