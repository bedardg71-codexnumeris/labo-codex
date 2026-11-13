/**
 * materiel-aide.js — Conception › « Apporter mon matériel » : ce qui guide l'accueil et l'étiquetage, et la carte
 * d'aide de la page.
 *
 * Lot « La carte d'aide dans Apporter mon matériel » (13 nov. 2026 ; décision de Grégoire, 12 nov., 10 h 31 à 10 h 55).
 * L'étiquetage avait deux guides qui se superposaient : les consignes de la page et la carte du parcours « Évaluer une
 * première production ». Ils sont fusionnés : les consignes de la page entrent dans la carte et la complètent.
 *
 *   · UNE SEULE DÉFINITION, pour deux usages : ce qui guide l'accueil, l'étiquetage et l'exemple, et qui ne dépend que
 *     de la page (les zones, les flèches, ce que la carte évite, le halo, la ligne du geste, le complément). L'étape
 *     « Ta grille » du parcours (`parcours-evaluer.js`) et la carte de la page l'appellent toutes deux ; aucune copie.
 *   · LA CARTE DE LA PAGE passe par `ParcoursMoteur.lancer` : mêmes flèches, même halo, même place, même glisser. Elle
 *     n'est pas un parcours : elle n'entre pas dans la liste des parcours (`Assistance.enregistrer` n'est pas appelé),
 *     n'écrit ni progression ni reprise, n'allume aucune pastille. Elle suit l'écran ; sur la confirmation d'une grille
 *     créée ou sur une autre page, elle se ferme, et revient au retour si l'interrupteur est ouvert.
 *   · L'INTERRUPTEUR, en haut de la page (« M'accompagner pour étiqueter ma grille », mots de Grégoire) : ouvert à chaque
 *     arrivée dans la page tant qu'aucune grille n'a été créée par « Créer ma grille » dans l'étiquetage (jamais par
 *     l'exemple, qui ne crée rien), même fermé à la visite d'avant ; après, il garde l'état où la personne l'a laissé.
 *     Motif (Grégoire, 10 h 54) : fermé, l'écran ne dit plus qu'une étiquette de la légende se touche pour être choisie.
 *     Pendant un parcours, quel qu'il soit, il ne se montre pas et la carte de la page ne s'ouvre pas (une carte ouverte
 *     se ferme quand un parcours se lance : le moteur n'en joue qu'une). Fermer la carte par son lien de sortie ferme
 *     l'interrupteur : les deux ne se contredisent jamais.
 *   · CE QU'IL RETIENT : `laboCodex.aideMateriel` ({ grilleCreee, ouvert }), dans `localStorage`, hors de `db` et hors
 *     trimestre (du genre de `laboCodex.vue`) : une préférence d'interface de l'appareil, qui n'entre ni dans le codex ni
 *     dans les données de la personne. Aucune grille ne porte sa provenance : le fait est retenu à la création réussie.
 *     STOCK, assumé : qui a déjà créé une grille par l'étiquetage avant ce lot retrouve l'interrupteur ouvert à chaque
 *     arrivée jusqu'à sa prochaine création ; rien ne s'écrit dans ses données pour l'éviter.
 *   · SOUS UN BANC (`navigator.webdriver`), l'interrupteur arrive fermé tant qu'aucune grille n'est créée : les bancs de
 *     la page ouvrent une application neuve, et la carte se poserait sur ce qu'ils touchent (le précédent : la vue au
 *     démarrage, `vue-simple-donnees.js`). Le banc de ce lot éteint le drapeau pour éprouver la vraie règle.
 *   · VUE SIMPLE : sa navigation ne mène pas à cette page ; rien n'y est ajouté (ni interrupteur, ni carte).
 *
 * Les mots : ceux de l'accueil et de l'étiquetage sont ceux de la page, mot pour mot (les trois cartes de l'accueil ;
 * `materielDissection.consignes()`). PROPOSÉS le 13 nov. 2026, lus par l'enseignant·e, corrigeables : le titre de la
 * carte, son lien de sortie, la fin de la ligne de l'exemple hors du parcours (« Quitter l'exemple »).
 */
(function () {
    'use strict';

    var CLE = 'laboCodex.aideMateriel';

    function M() { return window.ParcoursMoteur; }
    function el(id) { return document.getElementById(id); }
    function qs(sel) { return document.querySelector(sel); }
    function vis(e) { var m = M(); return !!(e && m && m.visible(e)); }
    function dissection() { return window.materielDissection || null; }

    // ------------------------------------------------------------------
    // Ce qui guide la page (pour « Ta grille » et pour la carte de la page)
    // ------------------------------------------------------------------

    function pageVisible() { return vis(el('conception-materiel')); }
    function accueilVisible() { return vis(el('materiel-accueil')); }
    function dissectionOuverte() { return vis(el('materiel-dissection')); }
    function exempleOuvert() { var d = dissection(); return dissectionOuverte() && d ? d.exempleOuvert() : null; }

    /** L'aide de la dissection ouverte (celle de la personne, ou l'exercice de l'exemple), sinon null. */
    function aideOuverte() {
        var d = dissection();
        if (!dissectionOuverte() || !d || exempleOuvert() === 'complet') return null;
        return d.aide();
    }

    /** Ce que désigne l'aide : l'étiquette à prendre, le morceau où toucher, le champ sous la lecture. */
    function ciblesDeLAide(a) {
        return a ? [a.etiquetteEl, a.morceauEl, a.cibleEl].filter(vis) : [];
    }

    /** Le premier des deux gestes : prendre l'étiquette (si elle n'est pas en main), puis toucher le morceau, sinon le champ. */
    function premierGesteDeLAide(a) {
        if (!a) return null;
        if (vis(a.etiquetteEl) && !a.enMain) return a.etiquetteEl;
        if (vis(a.morceauEl)) return a.morceauEl;
        return vis(a.cibleEl) ? a.cibleEl : null;
    }

    /** La lecture de l'application (« la grille lue en dessous »), si une partie en est à l'écran. */
    function lectureALEcran() {
        var r = qs('#materiel-dissection .dissection-resultat');
        if (!vis(r)) return null;
        var b = r.getBoundingClientRect();
        return b.bottom > 0 && b.top < window.innerHeight ? r : null;
    }

    function zones() {
        if (dissectionOuverte()) {
            if (exempleOuvert() === 'complet') return [el('dissection-palette'), el('dissection-canevas')];
            // La palette aussi, sans flèche (`fleches` ne nomme que les cibles de l'aide) : la carte ne se pose pas sur
            // les étiquettes qu'on prend (mesuré sous WebKit le 12 nov. : elle couvrait « Points »).
            var c = ciblesDeLAide(aideOuverte());
            return (c.length ? c : [el('materiel-dissection')]).concat(vis(el('dissection-palette')) ? [el('dissection-palette')] : []);
        }
        return [qs('#materiel-accueil .materiel-collage')];
    }

    /** Les flèches : vers l'étiquette à prendre et le morceau (ou le champ) ; l'exemple complet : la légende et la grille. */
    function fleches() {
        if (!dissectionOuverte()) return null;
        if (exempleOuvert() === 'complet') return [el('dissection-palette'), el('dissection-canevas')];
        return ciblesDeLAide(aideOuverte());
    }

    /**
     * Dans la dissection, la carte ne couvre jamais ce que l'aide désigne (le halo ET l'autre geste). L'exemple complet
     * (essai du 12 nov., capture de 11 h 00 : la carte demandait de regarder « la grille lue en dessous » et en couvrait
     * une partie) : quand la lecture est à l'écran, la carte l'évite.
     */
    function aussiEviter() {
        // L'interrupteur (13 nov. 2026, sa place à droite) : la carte ne le couvre pas, il est ce qui la ferme.
        var i = [qs('#materiel-aide-interrupteur .interrupteur')].filter(vis);
        if (!dissectionOuverte()) return i;
        if (exempleOuvert() === 'complet') { var l = lectureALEcran(); return (l ? [l] : []).concat(i); }
        return ciblesDeLAide(aideOuverte()).concat(i);
    }

    function contour() {
        return dissectionOuverte() ? premierGesteDeLAide(aideOuverte()) : el('materiel-zone-collage');
    }

    // Lignes du geste PROPOSÉES (12 nov. 2026, à valider par Grégoire) : elles nomment les boutons tels qu'ils sont écrits.
    var GESTE_ACCUEIL = "Colle ta grille, montre ce qu'est chaque morceau, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».";
    // L'exemple ouvert : sa ligne nomme sa sortie. Dans la carte du parcours qui l'offre, « Passer à ma grille » (12 nov.) ;
    // dans la page, « Quitter l'exemple » (PROPOSÉES le 13 nov. 2026).
    var GESTE_EXEMPLE_COMPLET = "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Faire l'exercice soi-même » ou « Passer à ma grille ».";
    var GESTE_EXEMPLE_FAIT = "L'exemple est étiqueté : touche « Passer à ma grille ».";
    var GESTE_EXEMPLE_COMPLET_PAGE = "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Quitter l'exemple ».";
    var GESTE_EXEMPLE_FAIT_PAGE = "L'exemple est étiqueté : touche « Quitter l'exemple ».";

    /**
     * La ligne du geste : dans l'étiquetage, elle suit le premier manque (`materielDissection.aide()`) ; l'exemple
     * complet, sa ligne ; à l'accueil, la sienne. `exempleDuParcours` : l'exemple est celui que la carte du parcours
     * offre (sa sortie est dans la carte).
     */
    function geste(exempleDuParcours) {
        var a = aideOuverte();
        if (a) {
            if (exempleOuvert() && (a.sorte === 'pret' || a.sorte === 'pretCodes')) return exempleDuParcours ? GESTE_EXEMPLE_FAIT : GESTE_EXEMPLE_FAIT_PAGE;
            return a.phrase;
        }
        if (exempleOuvert() === 'complet') return exempleDuParcours ? GESTE_EXEMPLE_COMPLET : GESTE_EXEMPLE_COMPLET_PAGE;
        return GESTE_ACCUEIL;
    }

    // Les trois cartes de l'accueil, mot pour mot celles de la page (validées par Grégoire le 18 oct. 2026).
    var ETAPES_ACCUEIL = [
        { titre: 'Copie ton tableau', texte: 'Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier – pas seulement le texte de ses cases (ou ses cellules), mais bien le tableau –, puis copie-le. Le texte copié d’un PDF est accepté aussi, mais il arrive sans ses cases : le fichier d’origine donne un meilleur résultat.' },
        { titre: 'Colle-le ici', texte: 'Ta grille s’affiche telle quelle, chaque ligne de chaque case devenue un morceau.' },
        { titre: 'Étiquette, puis crée', texte: 'Avec les étiquettes de la légende, tu identifies tes sections, tes critères, tes points ; l’application te montre ensuite la grille telle qu’elle la comprend. Clique sur « Créer ma grille » afin de la ranger dans « Grilles de critères ».' }
    ];

    /**
     * Le complément de la carte : ce que la page disait de faire, selon l'écran. À l'accueil, ses trois cartes ; dans
     * l'étiquetage, ses trois étapes ; un outil en main, sa phrase ; l'exemple complet, rien (ses étiquettes sont posées :
     * sa ligne du geste dit quoi regarder).
     */
    function complement() {
        if (dissectionOuverte()) {
            var d = dissection(), c = d ? d.consignes() : null;
            if (!c) return null;
            if (c.outil) return [{ texte: c.outil }];
            if (exempleOuvert() === 'complet') return null;
            return c.etapes.map(function (t) { return { texte: t }; });
        }
        return accueilVisible() ? ETAPES_ACCUEIL : null;
    }

    // ------------------------------------------------------------------
    // La carte de la page
    // ------------------------------------------------------------------

    // PROPOSÉS (13 nov. 2026, lus par l'enseignant·e, corrigeables).
    var TITRE = 'Ta grille, pas à pas';
    var SORTIE = 'Fermer l’accompagnement';

    var DEF = {
        id: 'aide-materiel',
        sansRang: true,     // ce n'est pas un parcours : pas de « 1 sur 1 »
        sansEchap: true,    // Échap pose l'étiquette en main (la dissection) : il ne ferme pas la carte
        lienSortie: SORTIE,
        etapes: [{
            titre: TITRE,
            texte: '',
            get geste() { return geste(false); },
            complement: complement,
            zones: zones,
            fleches: fleches,
            aussiEviter: aussiEviter,
            contour: contour
        }]
    };

    // ------------------------------------------------------------------
    // L'interrupteur et ce qu'il retient
    // ------------------------------------------------------------------

    function lirePref() {
        try {
            var v = JSON.parse(window.localStorage.getItem(CLE) || 'null');
            return v && typeof v === 'object' ? v : {};
        } catch (e) { return {}; }
    }

    function ecrirePref(maj) {
        try { window.localStorage.setItem(CLE, JSON.stringify(Object.assign(lirePref(), maj))); } catch (e) { /* stockage refusé : l'état vaut pour la visite */ }
    }

    /** L'état de l'interrupteur à l'arrivée dans la page. */
    function aLArrivee() {
        var p = lirePref();
        if (p.grilleCreee === true) return p.ouvert !== false;
        return navigator.webdriver !== true;   // sous un banc : fermé (voir l'en-tête)
    }

    var ouvert = false;       // l'interrupteur, pour la visite en cours
    var surLaPage = false;    // la page était-elle affichée au dernier réglage ? (une arrivée : elle ne l'était pas)
    var prevu = false;

    function ecranGuide() { return accueilVisible() || dissectionOuverte(); }
    function vueSimple() { return !!(document.body && document.body.classList.contains('vue-simple')); }
    function joueLaCarte() { var m = M(); return !!(m && m.joue(DEF)); }
    function parcoursEnCours() { var m = M(); return !!(m && m.actif() && !m.joue(DEF)); }

    function fermerLaCarte() { if (joueLaCarte()) M().fermer(); }

    /** La carte tient tant que l'interrupteur est ouvert et que l'écran est l'accueil ou l'étiquetage. */
    function tient() { return ouvert && !vueSimple() && pageVisible() && ecranGuide(); }

    /** Le lien de sortie de la carte ferme l'interrupteur. */
    function surSortie() {
        ouvert = false;
        ecrirePref({ ouvert: false });
        planifier();
    }

    /**
     * La place de l'interrupteur (Grégoire, 13 nov. 2026, 10 h 00 : « après le paragraphe, à droite ») : à l'accueil,
     * sous le paragraphe d'introduction ; dans l'étiquetage, sous son en-tête. Un seul élément, déplacé : une seule
     * case à cocher, un seul état.
     */
    function placer(zone) {
        var apres = dissectionOuverte() ? qs('#materiel-dissection .dissection-tete')
            : accueilVisible() ? qs('#materiel-accueil .materiel-intro') : null;
        if (apres && zone.previousElementSibling !== apres) apres.insertAdjacentElement('afterend', zone);
    }

    /**
     * Règle l'interrupteur et la carte sur l'état de la page. Appelé après chaque changement : une sous-section
     * affichée, l'accueil ou la confirmation rendus, le moteur lancé ou fermé, l'interrupteur touché.
     */
    function regler() {
        prevu = false;
        var zone = el('materiel-aide-interrupteur'), bascule = el('materiel-aide-bascule');
        if (!zone || !bascule || !M()) return;
        if (!pageVisible() || vueSimple()) {
            surLaPage = false;
            zone.classList.add('u-hide');
            fermerLaCarte();
            return;
        }
        if (!surLaPage) { surLaPage = true; ouvert = aLArrivee(); }
        placer(zone);
        var parcours = parcoursEnCours();
        zone.classList.toggle('u-hide', parcours || !ecranGuide());
        bascule.checked = ouvert;
        if (parcours) return;
        if (!tient()) { fermerLaCarte(); return; }
        if (!joueLaCarte()) M().lancer(DEF, { surQuitter: surSortie, verifier: tient });
    }

    /** Au tour suivant : le moteur signale sa fermeture avant que la sortie de la carte ait fermé l'interrupteur. */
    function planifier() {
        if (prevu) return;
        prevu = true;
        setTimeout(regler, 0);
    }

    /** L'interrupteur touché (`data-on-change`). */
    function basculer(bascule) {
        ouvert = !!(bascule && bascule.checked);
        ecrirePref({ ouvert: ouvert });
        regler();
    }

    /** Une grille vient d'être créée par « Créer ma grille » dans l'étiquetage : l'interrupteur garde désormais son état. */
    function noterGrilleCreee() {
        ecrirePref({ grilleCreee: true, ouvert: ouvert });
    }

    function initialiser() {
        window.addEventListener('sectionAffichee', planifier);
        document.addEventListener('parcoursMoteur', planifier);
        planifier();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    window.MaterielAide = {
        // Ce qui guide la page (« Ta grille » du parcours et la carte de la page).
        dissectionOuverte: dissectionOuverte,
        exempleOuvert: exempleOuvert,
        zones: zones,
        fleches: fleches,
        aussiEviter: aussiEviter,
        contour: contour,
        geste: geste,
        complement: complement,
        // L'interrupteur.
        basculer: basculer,
        regler: planifier,
        noterGrilleCreee: noterGrilleCreee,
        // Pour les bancs (lecture seule) : la définition de la carte, la clé de la préférence, l'état.
        definition: function () { return DEF; },
        CLE: CLE,
        ouvert: function () { return ouvert; }
    };
})();
