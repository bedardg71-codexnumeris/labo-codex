/* =================================================================
   LE MOTEUR DES PARCOURS — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, « Le principe, pour les deux ».

   Un parcours n'est pas une visite : la personne fait le geste elle-même sur ce qui est
   désigné. Le moteur pose (lot « Les flèches des parcours », 10 nov. 2026,
   plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md ; le voile percé de trous est retiré,
   la page reste lisible et touchable partout) :
   · une flèche manuscrite, à l'encre du texte, de la bulle vers ce dont elle parle (les zones) ;
   · une pulsation dans l'orange de l'aide autour de ce qu'il faut toucher (le contour) : dans un
     parcours, l'orange veut dire « ce que tu toucheras » ;
   · une mise en évidence de la section actuelle, dans le menu ou la barre d'onglets du contour ;
   · une bulle au bord de l'écran le plus éloigné de ce dont elle parle, sans couvrir ses zones ni le
     contour (Grégoire, 11 nov. 2026, sur l'iPad : la flèche fait le lien) : titre, « n sur N », poignée
     pour la déplacer, texte, geste, boutons, lien de sortie. Elle prend le focus et s'annonce (aria-live poli).
   LES FLÈCHES VONT À CE QUE NOMME LA BULLE (11 nov. 2026) : l'élément précis (la ligne, pas la carte), et la
   section dans le menu quand la bulle présente une section. CE QU'IL FAUT TOUCHER REÇOIT SA FLÈCHE DÈS L'OUVERTURE
   DE L'ÉTAPE (Grégoire, 11 nov. 2026, 11 h 45, quatrième aperçu : « Ta compétence », « Pourquoi un codex »,
   « Ta grille » restaient sans flèche jusqu'au premier toucher) : une étape qui a un contour n'est jamais sans flèche ;
   les sujets qui ne sont pas le contour gardent la leur. Une étape qui ne nomme QUE ce qu'il faut toucher le déclare
   (`nommeLeContour`) : la flèche va alors au contour, et à lui seul ; ses zones, la bulle les évite encore.
   NI FLÈCHE NI PULSATION SUR CE QUI NE SE VOIT PAS (`seVoit`, 11 nov. 2026, capture 25) : ce qu'une palette flottante,
   une fenêtre ou la bulle couvre en entier ; pas de flèche vers un sujet tout entier hors de l'écran (`aLEcran`,
   capture 31). Ce qu'il faut toucher qui change dans l'étape (le geste suivant) est amené à l'écran (`suivreContour`).
   LES BOUTONS QUI ATTENDENT (Grégoire, 11 nov. 2026, 12 h 05, captures 32 à 34 : « je ne sais pas ce qu'il faut faire
   pour voir le bouton « Continuer » ») : un bouton de bulle qui attend une condition le déclare (`attend`, qui rend la
   phrase de ce qui manque, ou rien) ; il reste visible, inactif tant qu'elle manque, la phrase dessous ; le contour de
   l'étape va à ce qui manque.
   L'ÉCRAN CHANGE DANS UNE ÉTAPE (11 nov. 2026, capture 18 : « Actions › Évaluer » touché, l'écran d'évaluation ouvert,
   la bulle restait à sa page 1/2, qui redisait de toucher « Actions › Évaluer », et le premier critère, sous le bas de
   l'écran, portait le halo sans qu'on le voie) : une étape à plusieurs écrans dit, par un passage de son texte, de quoi
   parle l'écran visible (`pageQuiDit`). Quand ce passage change, la bulle passe à la page qui le porte, et ce que
   l'étape désigne est amené dans la vue, une fois, comme à l'entrée de l'étape.
   L'AVIS (11 nov. 2026, capture 19) : une phrase sous le texte, que l'étape pose quand la page n'est pas dans l'état
   qu'elle attend (`avis`) ; elle part quand l'état revient. Le texte de l'étape, lui, ne change pas.
   LA LIGNE DU GESTE SUIT L'ÉTAT (12 nov. 2026, la dissection sur l'iPad : « nommer, pointer, passer par les étapes une
   après l'autre ») : un `geste` qui change pendant l'étape (un getter : « Ta grille » suit le premier manque de la
   dissection) est relu à chaque passage de la sonde ; changé, il remplace la ligne du geste et s'annonce. La bulle n'est
   pas refaite : ni focus déplacé, ni page tournée.
   LES FORMULAIRES (Grégoire, 11 nov. 2026, 8 h 26) : dans une étape qui montre un formulaire (`formulaire`), les
   flèches vont aux champs obligatoires (astérisque rouge `.champ-requis`, `required`, `aria-required`) ENCORE VIDES,
   une par champ, sans fusion ni plafond ; chacune disparaît quand son champ est rempli ; quand il n'en reste aucun,
   les flèches vont à ce que l'étape déclare dans `fleches` (« Ta production » : l'échelle d'une grille par niveaux
   restée à « Aucune », 11 nov. 2026, 9 h 35) ; le bouton à toucher a la sienne dès l'ouverture (la règle du contour). La bulle évite TOUS les champs obligatoires, remplis ou non : elle ne saute pas
   d'un coin à l'autre pendant qu'on remplit, et elle ne couvre pas un champ qu'on voudrait corriger.
   LE ZOOM AU PINCEMENT (11 nov. 2026, second essai sur l'iPad : « la bulle se déplace un peu partout ») : sous
   Safari iPad, innerWidth × innerHeight suivent la partie VISIBLE de la page pendant le zoom, alors que la bulle, le
   halo et les flèches sont fixés dans la page entière. La sonde replaçait donc la bulle à chaque image du pincement
   (et la croyait sur un téléphone sous 500 px de large). Pendant un pincement (deux doigts posés) et tant que la page
   reste zoomée (`visualViewport.scale` ≠ 1), le moteur NE REPLACE RIEN : la bulle garde sa place, la hauteur gardée est
   celle d'avant le zoom ; le halo et les flèches suivent leurs cibles. Revenue à l'échelle 1, la sonde la replace
   comme avant. Playwright ne pince pas : jugé sur l'iPad.
   LA LARGEUR (12 nov. 2026, 12 h 54, l'iPad en paysage : « la carte […] semble bloquer au centre ») : elle se lit sur la
   mise en page (`document.documentElement.clientWidth`, `largeurPage`), jamais sur innerWidth ni sur un écran gardé —
   la place de la bulle, son glisser, la forme de téléphone et la couche des flèches. Banc : bulle-largeur-ipad-2026-11-12.
   LES COORDONNÉES : la couche des flèches est fixée en (0, 0) et dimensionnée en px sur
   la largeur de la mise en page × innerHeight à chaque passage, SANS viewBox : le même repère que le contour (des px
   lus par getBoundingClientRect). Une sentinelle Vitest l'exige (le voile, lui, était en 100vh).
   Une étape avance quand l'état attendu est ATTEINT (`atteint()`), quel que soit le chemin :
   le moteur le sonde, il n'écoute pas le toucher d'un bouton précis.

   Une étape :
     { titre, texte, geste?, centre?: bool,
       avant?: async () => void,   // place la page (idempotent : sert aussi à la reprise)
       zones?: () => Element[],    // ce dont parle la bulle (la flèche y va)
       fleches?: () => Element[],  // parmi les zones, celles où vont les flèches (groupées) ; les autres, la bulle les
                                   // évite seulement (les noms de la saisie des présences, qu'il faut voir pour noter)
       formulaire?: () => Element, // l'étape montre un formulaire : ses zones sont ses champs obligatoires, une flèche
                                   // par champ ENCORE VIDE ; tous remplis, une par élément de `fleches`
       contour?: () => Element,    // où toucher (la pulsation, et une flèche dès l'ouverture)
       nommeLeContour?: bool | () => bool, // la bulle ne nomme que ce qu'il faut toucher : la flèche va au contour, seule
       pageQuiDit?: () => string,  // un passage du texte, celui dont parle l'écran visible (null : rien ne change)
       avis?: () => string,        // une phrase sous le texte, tant que la page n'est pas dans l'état attendu
       aussiEviter?: () => Element[], // ce que la bulle ne couvre pas non plus, pesé comme le contour, sans flèche
                                   // (les boutons du geste suivant dans une fenêtre que la bulle doit couvrir)
       atteint?: () => bool,       // l'état qui fait avancer
       boutons?: [{ libelle, primaire?, action, attend?: () => string }], // attend : ce qui manque (rien : actif)
       complement?: () => [{ titre?, texte }], // des consignes à la suite du texte, en pages (voir « LE COMPLÉMENT »)
       sansSortie?: bool }
   Une définition : { id, etapes, lienSortie?, sansRang?: bool (pas de « n sur N » : une carte qui n'est pas un parcours),
       sansEchap?: bool (Échap reste à la page : la carte ne se ferme que par son lien de sortie) }.
   LE COMPLÉMENT (lot « La carte d'aide dans Apporter mon matériel », 13 nov. 2026) : les consignes d'une page entrent
   dans la bulle, à la suite du texte de l'étape, comme des pages de plus (« ← 2/3 → ») : une liste numérotée, un item
   seul sans numéro. Elles suivent l'écran : relues à chaque passage de la sonde ; changées, la découpe est refaite, la
   bulle passe à leur première page et les annonce. Une page de consignes ne dépasse pas LIGNES_PAR_PAGE lignes quand
   ses items le permettent : la bulle n'est jamais plus haute qu'avec son texte seul.
   LE SIGNAL : au lancement et à la fermeture, `document` reçoit « parcoursMoteur » ({ actif }) ; la carte d'une page
   s'y règle (elle se retire devant un parcours, revient après lui).
   API : window.ParcoursMoteur.lancer(def, { depuis, surEtape, surQuitter, surEchap, verifier }),
         .fermer(), .actif(), .etapeCourante(), .joue(def), .surTelephone().

   LA BULLE SUR TÉLÉPHONE (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulle-sur-telephone.md) :
   · jusqu'à 500 px de large (SEUIL_TELEPHONE, la largeur de la fenêtre et non l'appareil : un iPad
     en écran partagé étroit est traité comme un téléphone), la bulle se range au bord de l'écran,
     pleine largeur. Une étape qui désigne quoi toucher sur la page (un contour) l'ouvre REPLIÉE
     (titre et « n sur N ») ; une étape dont le geste est dans la bulle (« Continuer ») ou sans
     rien d'éclairé l'ouvre dépliée. La tête de la bulle est un bouton :
     un toucher déplie, un toucher replie ; repliée, toute la bulle est ce bouton.
   · Repliée ou dépliée, elle ne couvre pas la zone éclairée : en bas par défaut (au début d'une
     étape et à chaque dépliement, le moteur fait défiler la page s'il le faut, pendant REGLAGE_MS
     et jusqu'au premier geste de la personne) ; en haut si la zone occupe le bas ; si la zone prend
     tout l'écran, elle en couvre une partie, au mieux sans toucher au contour, et son texte défile.
   · Le témoin « Enregistré » (en bas à gauche) passe au-dessus d'une bulle rangée en bas
     (--parcours-reserve-bas, lue par css/parcours.css).
   LE FILET DE TOUTES LES BULLES (ajout du 9 nov., 9 h 51) : à toutes les largeurs, une bulle plus
   haute que l'espace disponible (fenêtre courte, clavier ouvert) s'y limite ; seul son texte
   défile, le titre, « n sur N », le geste et les boutons restent visibles. Une bulle qui tient
   reste telle quelle.
   LES BULLES EN PAGES (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulles-en-pages.md) :
   · un texte de plus de LIGNES_PAR_PAGE lignes, à la largeur de la bulle, se coupe en deux pages (trois
     au plus si une page dépasse encore), à la fin d'une phrase hors d'une citation entre guillemets, au
     plus près du milieu. Aucun mot ne change ; sans fin de phrase où couper, le texte reste entier.
   · Sous le texte, « ← 1/3 → » (décision de Grégoire, 9 nov., 17 h 55 : la tête ne garde que « n sur N ») ;
     au clavier, les flèches gauche et droite quand la bulle a le focus. Au changement de page, le lecteur
     d'écran entend « page 2 de 3 », sans le texte de l'étape.
   · Toutes les pages restent dans le texte de la bulle, dans l'ordre : celles qu'on ne voit pas sont
     cachées à l'œil (u-lecteur-ecran), pas au lecteur d'écran ; l'annonce dit le texte entier.
   · La ligne du geste, les boutons et le lien de sortie ne bougent pas ; l'étape avance sur l'état
     atteint, quelle que soit la page. Le filet (le texte qui défile) reste le dernier recours.
   · La découpe suit la largeur de la bulle : un parcours qui la change (une sonde d'étape) la refait
     dans le même passage de la sonde, la page affichée gardée si elle existe encore.
   ================================================================= */
(function () {
    'use strict';

    var SONDE_MS = 120;
    var MARGE = 8;
    var ECART = 12;
    var FLECHE_MIN = 24;       // en deçà, une flèche ne se lit pas : elle n'est pas tracée
    var FLECHE_RETRAIT = 6;    // la pointe s'arrête à quelques px du bord de la cible
    var FLECHES_MAX = 3;       // au-delà de trois cibles, une seule flèche vers leur union
    var POIDS_CONTOUR = 10000; // couvrir ce qu'il faut toucher coûte dix mille fois plus : seulement faute de mieux
    var FUSION = 20;           // des cibles à moins de 20 px (les champs d'une même rangée) n'en font qu'une
    var PAS_CLAVIER = 16;      // un pas de la poignée, au clavier
    var SEUIL_TELEPHONE = 500; // px de large de la fenêtre : en deçà, la bulle prend sa forme de téléphone
    var REGLAGE_MS = 1200;     // sur téléphone, le temps où le moteur peut faire défiler pour ranger la bulle en bas
    var LIGNES_PAR_PAGE = 10;  // au-delà, à la largeur de la bulle, le texte se coupe en pages
    var PAGES_MAX = 3;

    // PROPOSÉ (10 nov. 2026, à valider par Grégoire) : le nom de la poignée pour le lecteur d'écran.
    var LIBELLE_POIGNEE = 'Déplacer la bulle';

    var etat = null; // { def, i, opts, timer, elements, enTransition }

    function visible(el) {
        if (!el || !el.isConnected) return false;
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        var s = getComputedStyle(el);
        return s.visibility !== 'hidden' && s.display !== 'none';
    }

    function premierVisible(liste) {
        for (var k = 0; k < liste.length; k++) {
            var el = typeof liste[k] === 'string' ? document.querySelector(liste[k]) : liste[k];
            if (visible(el)) return el;
        }
        return null;
    }

    function mouvementReduit() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function rectsDe(els) {
        return (els || []).filter(visible).map(function (el) { return el.getBoundingClientRect(); });
    }

    var CONTROLES = 'input, select, textarea';

    /**
     * Les champs obligatoires visibles d'un formulaire, dans l'ordre du document : `required`, `aria-required`, ou
     * une astérisque rouge (`.champ-requis`) visible dans leur étiquette (le contrôle nommé par `for`, sinon le
     * premier de l'étiquette ou de son conteneur).
     */
    function champsObligatoires(form) {
        if (!visible(form)) return [];
        var liste = [];
        var ajouter = function (c) { if (c && !c.disabled && visible(c) && liste.indexOf(c) === -1) liste.push(c); };
        [].forEach.call(form.querySelectorAll('[required], [aria-required="true"]'), ajouter);
        [].forEach.call(form.querySelectorAll('.champ-requis'), function (a) {
            var lab = visible(a) ? a.closest('label') : null;
            if (!lab) return;
            var c = lab.htmlFor ? document.getElementById(lab.htmlFor) : lab.querySelector(CONTROLES);
            ajouter(c || (lab.parentElement ? lab.parentElement.querySelector(CONTROLES) : null));
        });
        return liste.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    }

    function champVide(c) {
        if (c.type === 'file') return !(c.files && c.files.length);
        if (c.type === 'checkbox' || c.type === 'radio') return !c.checked;
        return String(c.value == null ? '' : c.value).trim() === '';
    }

    /**
     * Ce que l'étape désigne : `zones` (ce que la bulle évite) et `fleches` (où vont les flèches ; `null` : les zones).
     * `une` : une flèche par élément, sans fusion ni plafond (une étape à formulaire : ses champs obligatoires, et les
     * flèches à ceux qui sont encore vides) ; sinon les cibles sont groupées.
     */
    function designe(etape) {
        var zones = etape.zones ? (etape.zones() || []).filter(Boolean) : [];
        var n = etape.nommeLeContour;
        var auContour = typeof n === 'function' ? !!n() : !!n;
        if (etape.formulaire) {
            var champs = champsObligatoires(etape.formulaire());
            var vides = champs.filter(champVide);
            // Les champs obligatoires remplis : les flèches vont à ce que l'étape déclare ensuite.
            var ensuite = !vides.length && etape.fleches ? (etape.fleches() || []).filter(Boolean) : [];
            return { zones: champs.concat(zones, ensuite), fleches: vides.concat(ensuite), une: true, auContour: auContour };
        }
        return { zones: zones, fleches: etape.fleches ? (etape.fleches() || []).filter(Boolean) : null, une: false, auContour: auContour };
    }

    function union(rects) {
        if (!rects.length) return null;
        var u = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        rects.forEach(function (r) {
            u.left = Math.min(u.left, r.left); u.top = Math.min(u.top, r.top);
            u.right = Math.max(u.right, r.right); u.bottom = Math.max(u.bottom, r.bottom);
        });
        u.width = u.right - u.left; u.height = u.bottom - u.top;
        return u;
    }

    /** La hauteur de l'en-tête collant : ce qui est dessous est caché par lui. */
    function hautEntete() {
        var e = document.querySelector('header.entete');
        if (!e) return 0;
        var r = e.getBoundingClientRect();
        return r.bottom > 0 ? r.bottom : 0;
    }

    /** Un pincement en cours (deux doigts posés), ou la page zoomée : le moteur ne replace rien. */
    function sousLeZoom() {
        var vv = window.visualViewport;
        return !!(etat && etat.doigts >= 2) || !!(vv && Math.abs(vv.scale - 1) > 0.01);
    }

    /**
     * La largeur de la mise en page, où se posent la bulle, le halo et les flèches (`position: fixed`) : celle de la
     * racine, qui ne suit ni le zoom au pincement ni un état gardé. Pas `innerWidth` : sous Safari iPad, il suit la
     * partie visible, et la bulle restait dans les deux tiers gauches de l'écran en paysage (Grégoire, 12 nov. 2026,
     * 12 h 54 : « elle semble bloquer au centre » ; posée à left ≈ 433 = 820 − 8 − 380, sur un écran de 1180).
     */
    function largeurPage() {
        var r = document.documentElement;
        return (r && r.clientWidth) || window.innerWidth;
    }

    /**
     * L'écran de la page : la largeur de la mise en page ; la hauteur d'avant le zoom tant qu'il dure (innerHeight
     * suit la partie visible).
     */
    function ecranGarde() {
        var hauteur = etat && etat.hauteurGardee && sousLeZoom() ? etat.hauteurGardee : window.innerHeight;
        return { largeur: largeurPage(), hauteur: hauteur };
    }

    /**
     * Les doigts posés. Un `touchend` va à la cible du `touchstart` même quand elle a quitté le DOM ; il ne remonte
     * alors plus jusqu'à `window`, et le compte restait à 2 : le moteur se croyait sous le zoom et ne replaçait plus
     * rien. La cible écoute donc aussi la fin de son toucher (banc : bulle-largeur-ipad-2026-11-12).
     */
    function compterDoigts(ev) {
        if (!etat) return;
        etat.doigts = ev.touches ? ev.touches.length : 0;
        var t = ev.target;
        if (ev.type !== 'touchstart' || !t || typeof t.addEventListener !== 'function') return;
        var fin = function (e) {
            t.removeEventListener('touchend', fin, true);
            t.removeEventListener('touchcancel', fin, true);
            if (etat) etat.doigts = e.touches ? e.touches.length : 0;
        };
        t.addEventListener('touchend', fin, { capture: true, passive: true });
        t.addEventListener('touchcancel', fin, { capture: true, passive: true });
    }

    /** La largeur du téléphone : la fenêtre, pas l'appareil (l'iPad en écran partagé étroit en est). */
    function surTelephone() {
        return ecranGarde().largeur <= SEUIL_TELEPHONE;   // sous le zoom, l'écran d'avant (pas la partie visible)
    }

    /**
     * Le bas visible : au-dessus du clavier à l'écran quand il est ouvert (même mesure que le témoin
     * « Enregistré », js/temoin-enregistrement.js ; ignorée sous un zoom au pincement).
     */
    function basVisible() {
        var vv = window.visualViewport;
        if (sousLeZoom()) return ecranGarde().hauteur;
        if (!vv) return window.innerHeight;
        return Math.min(window.innerHeight, Math.round(vv.offsetTop + vv.height));
    }

    /** Le bas utile de l'écran : au-dessus du bandeau de la démo, fixé en bas, quand il est là. */
    function basEcran() {
        var bas = basVisible();
        var b = document.getElementById('bandeau-demo');
        if (b && visible(b)) return Math.min(bas, b.getBoundingClientRect().top);
        return bas;
    }

    /**
     * Amène les éléments dans la vue, sous l'en-tête, en laissant la place de la bulle
     * dessous quand c'est possible : leur union est alors posée juste sous l'en-tête.
     * Si elle ne tient pas avec la bulle, elle est posée seule ; si elle ne tient pas
     * du tout, c'est le premier élément qui est amené.
     */
    function amenerDansLaVue(els, hauteurBulle) {
        var rs = rectsDe(els);
        if (!rs.length) return;
        var u = union(rs);
        var haut = hautEntete() + 16;
        var bas = basEcran() - 16;
        var dispo = bas - haut;
        var avecBulle = u.height + ECART + (hauteurBulle || 0) <= dispo;
        var dejaBien = u.top >= haut && (avecBulle ? u.bottom + ECART + hauteurBulle <= bas : u.bottom <= bas);
        if (dejaBien) return;
        var cible = u.height <= dispo ? u.top : rs[0].top;
        window.scrollTo({ top: Math.max(0, window.scrollY + cible - haut), behavior: 'auto' });
    }

    // ---------- Les éléments du moteur ----------

    function creerElements() {
        var ns = 'http://www.w3.org/2000/svg';
        // La couche des flèches : jamais de viewBox (voir « LES COORDONNÉES », en tête).
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'parcours-fleches');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('id', 'parcours-fleches');

        var contour = document.createElement('div');
        contour.className = 'parcours-contour';
        contour.id = 'parcours-contour';
        contour.hidden = true;

        var bulle = document.createElement('div');
        bulle.className = 'parcours-bulle';
        bulle.id = 'parcours-bulle';
        bulle.setAttribute('role', 'dialog');
        bulle.setAttribute('aria-modal', 'false');
        bulle.setAttribute('aria-labelledby', 'parcours-bulle-titre');
        bulle.tabIndex = -1;
        bulle.addEventListener('keydown', surToucheBulle);

        var annonce = document.createElement('div');
        annonce.className = 'u-lecteur-ecran';
        annonce.id = 'parcours-annonce';
        annonce.setAttribute('aria-live', 'polite');

        document.body.appendChild(svg);
        document.body.appendChild(contour);
        document.body.appendChild(bulle);
        document.body.appendChild(annonce);
        return { svg: svg, contour: contour, bulle: bulle, annonce: annonce };
    }

    function retirerElements() {
        ['parcours-fleches', 'parcours-contour', 'parcours-bulle', 'parcours-annonce'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    // ---------- Les pages d'une bulle ----------

    /**
     * Les positions où le texte peut se couper : juste après une fin de phrase (. ! ? …) suivie d'une
     * espace et d'une majuscule (ou d'un guillemet, d'un chiffre), hors d'une citation « … ». Pure.
     * @returns {number[]} les index de coupe (la page suivante commence après l'espace)
     */
    function coupuresPossibles(texte) {
        var res = [];
        var profondeur = 0;
        for (var i = 0; i < texte.length; i++) {
            var c = texte.charAt(i);
            if (c === '«') profondeur++;
            else if (c === '»') profondeur = Math.max(0, profondeur - 1);
            else if (profondeur === 0 && '.!?…'.indexOf(c) !== -1 && texte.charAt(i + 1) === ' '
                && /[A-ZÀ-ÖØ-ÞŒ«0-9]/.test(texte.charAt(i + 2))) res.push(i + 1);
        }
        return res;
        // Limite connue (relecture du 9 nov.) : une abréviation suivie d'une majuscule ou d'un chiffre
        // (« M. Untel », « p. 12 », « chap. 3 ») passe pour une fin de phrase, et une phrase entre
        // parenthèses n'est pas protégée. Aucun texte de parcours n'en a ; à reprendre si l'un en a.
    }

    /**
     * Le texte en `n` pages, chaque coupe à la fin de phrase la plus proche de j × longueur / n (au plus
     * près du milieu pour deux pages). Rend null si les fins de phrase ne suffisent pas. Pure.
     */
    function partager(texte, coupes, n) {
        var choisies = [];
        var avant = 0;
        for (var j = 1; j < n; j++) {
            var cible = j * texte.length / n;
            var restantes = n - 1 - j; // les coupes qu'il faudra encore après celle-ci
            var candidates = coupes.filter(function (c) { return c > avant; });
            if (candidates.length <= restantes) return null;
            candidates = candidates.slice(0, candidates.length - restantes);
            var meilleure = candidates.reduce(function (m, c) { return Math.abs(c - cible) < Math.abs(m - cible) ? c : m; });
            choisies.push(meilleure);
            avant = meilleure;
        }
        var pages = [];
        var debut = 0;
        choisies.concat([texte.length]).forEach(function (fin) {
            pages.push(texte.slice(debut, fin).trim());
            debut = fin;
        });
        return pages;
    }

    /** Le nombre de lignes que `texte` prend dans `p`, à sa largeur. */
    function lignesDe(p, texte) {
        p.textContent = texte;
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        return Math.round(p.scrollHeight / ligne);
    }

    /**
     * Les pages du texte, à la largeur de `p` : une seule s'il tient en LIGNES_PAR_PAGE lignes. Sinon la
     * première découpe (deux pages, puis trois) dont chaque page tient ; à défaut, celle dont la plus haute
     * page est la plus basse, si elle épargne au moins un tiers des lignes (une découpe qui laisse une page
     * presque aussi longue que le tout coûterait une navigation sans épargner le défilement : le filet suffit).
     */
    function decouperEnPages(p, texte) {
        p.style.minHeight = '';
        p.style.flexBasis = '';
        var total = lignesDe(p, texte);
        if (total <= LIGNES_PAR_PAGE) return [texte];
        var coupes = coupuresPossibles(texte);
        var meilleure = null;
        for (var n = 2; n <= PAGES_MAX; n++) {
            var pages = partager(texte, coupes, n);
            if (!pages) break;
            var plusHaute = Math.max.apply(null, pages.map(function (pg) { return lignesDe(p, pg); }));
            if (!meilleure || plusHaute < meilleure.plusHaute) meilleure = { pages: pages, plusHaute: plusHaute };
            if (plusHaute <= LIGNES_PAR_PAGE) break;
        }
        if (!meilleure || (meilleure.plusHaute > LIGNES_PAR_PAGE && meilleure.plusHaute > total * 2 / 3)) return [texte];
        return meilleure.pages;
    }

    /**
     * Le contenu d'une page, posé dans `cible` : un texte, ou les items d'un complément (une liste : des blocs dans le
     * paragraphe, chacun son rang quand ils sont plusieurs, son titre en gras s'il en a un).
     */
    function remplirPage(cible, contenu) {
        cible.textContent = '';
        if (typeof contenu === 'string') { cible.textContent = contenu; return; }
        contenu.forEach(function (item, k) {
            if (k > 0) cible.appendChild(document.createTextNode(' '));   // lu d'un trait (l'annonce, une copie), les items restent séparés
            var bloc = document.createElement('span');
            bloc.className = 'parcours-bulle-item' + (item.n ? '' : ' parcours-bulle-item--seul');
            bloc.setAttribute('role', 'listitem');
            if (item.n) {
                var rang = document.createElement('span');
                rang.className = 'parcours-bulle-item-rang';
                rang.textContent = item.n + '.';
                bloc.appendChild(rang);
                bloc.appendChild(document.createTextNode(' '));
            }
            if (item.titre) {
                var t = document.createElement('strong');
                t.textContent = item.titre;
                bloc.appendChild(t);
                bloc.appendChild(document.createTextNode(' '));
            }
            bloc.appendChild(document.createTextNode(item.texte));
            cible.appendChild(bloc);
        });
    }

    /** Le texte d'une page de complément, à plat (l'annonce, `pageQuiDit`). */
    function texteDesItems(items) {
        return items.map(function (x) { return (x.titre ? x.titre + ' ' : '') + x.texte; }).join(' ');
    }

    /** Le complément de l'étape, lu : ses items typographiés, numérotés quand ils sont plusieurs. */
    function itemsDuComplement(etape) {
        var liste = [];
        try { liste = etape.complement ? (etape.complement() || []) : []; } catch (e) { liste = []; }
        liste = liste.filter(function (x) { return x && x.texte; });
        return liste.map(function (x, k) {
            return { n: liste.length > 1 ? k + 1 : 0, titre: x.titre ? typographier(x.titre) : '', texte: typographier(x.texte) };
        });
    }

    /**
     * Les pages du complément, à la largeur de `p` : ses items dans l'ordre, une page tant qu'ils tiennent sous le
     * `plafond` ; un item plus haut que lui a sa page à lui. Le plafond : la hauteur de la plus haute page du texte de
     * l'étape (le complément ne grandit pas la bulle : mesuré sous WebKit le 13 nov. 2026, à 820 × 1180, neuf lignes au
     * lieu de huit, et « Ta grille » couvrait la zone de collage) ; sans texte, LIGNES_PAR_PAGE lignes.
     */
    function pagesDuComplement(p, items, textes) {
        if (!items.length) return [];
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        var plafond = LIGNES_PAR_PAGE * ligne + 1;
        if (textes.length) plafond = Math.max.apply(null, textes.map(function (t) { p.textContent = t; return p.scrollHeight; })) + 1;
        var pages = [], page = [];
        items.forEach(function (item) {
            remplirPage(p, page.concat([item]));
            if (page.length && p.scrollHeight > plafond) { pages.push(page); page = []; }
            page.push(item);
        });
        pages.push(page);
        return pages;
    }

    /**
     * Toutes les pages prennent la hauteur de la plus haute (sa base flex) : « ← » et « → » ne bougent pas
     * sous le doigt d'une page à l'autre. Sous la contrainte du filet, le texte se resserre encore.
     */
    function egaliserPages(p, contenus) {
        p.style.flexBasis = '';
        if (contenus.length < 2) return;
        var haute = 0;
        contenus.forEach(function (c) { remplirPage(p, c); haute = Math.max(haute, p.scrollHeight); });
        p.style.flexBasis = haute + 'px';
    }

    /** Pose les pages dans le texte de la bulle : toutes, dans l'ordre ; celle qu'on lit est visible. */
    function ecrirePages(p, contenus) {
        p.textContent = '';
        contenus.forEach(function (c, k) {
            if (k > 0) p.appendChild(document.createTextNode(' '));
            var span = document.createElement('span');
            var liste = typeof c !== 'string';
            span.className = 'parcours-bulle-page' + (liste ? ' parcours-bulle-page--liste' : '');
            if (liste) span.setAttribute('role', 'list');
            span.dataset.page = String(k);
            remplirPage(span, c);
            p.appendChild(span);
        });
    }

    /** Le plancher du filet : le texte se resserre, jamais sous trois lignes (ou sa hauteur). */
    function poserPlancher(p) {
        p.style.minHeight = '';
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        p.style.minHeight = Math.min(p.scrollHeight, Math.ceil(3 * ligne)) + 'px';
    }

    /** Montre la page `k` (bornée) : sa partie du texte, « k/n », les flèches. */
    function montrerPage(k) {
        var b = etat.elements.bulle;
        var n = etat.pages.length;
        etat.page = Math.max(0, Math.min(k, n - 1));
        var p = b.querySelector('.parcours-bulle-texte');
        if (p) {
            [].forEach.call(p.querySelectorAll('.parcours-bulle-page'), function (span) {
                span.classList.toggle('u-lecteur-ecran', Number(span.dataset.page) !== etat.page);
            });
            p.scrollTop = 0;
            poserPlancher(p);
        }
        var indice = b.querySelector('.parcours-bulle-pages');
        if (indice) indice.textContent = (etat.page + 1) + '/' + n;
        var prec = b.querySelector('.parcours-bulle-page-prec');
        var suiv = b.querySelector('.parcours-bulle-page-suiv');
        var avaitFocus = document.activeElement;
        if (prec) prec.disabled = etat.page === 0;
        if (suiv) suiv.disabled = etat.page === n - 1;
        // Un bouton devenu inactif perd le focus : il passe à l'autre flèche.
        if (avaitFocus && avaitFocus.disabled) {
            var autre = avaitFocus === prec ? suiv : prec;
            try { (autre && !autre.disabled ? autre : b).focus({ preventScroll: true }); } catch (e) { b.focus(); }
        }
    }

    /**
     * Change de page ; la bulle se replace à sa nouvelle hauteur. Le lecteur d'écran entend « page 2 de 3 »,
     * sans le texte de l'étape (déjà annoncé au rendu, et lisible en entier dans la bulle).
     */
    function changerPage(delta) {
        if (!etat || !etat.pages || etat.pages.length < 2) return false;
        var k = Math.max(0, Math.min(etat.page + delta, etat.pages.length - 1));
        if (k === etat.page) return false;
        montrerPage(k);
        etat.elements.annonce.textContent = 'page ' + (k + 1) + ' de ' + etat.pages.length;
        sonder();
        return true;
    }

    /**
     * Les flèches gauche et droite, quand la bulle (ou l'un de ses boutons) a le focus. Pas avec un
     * modificateur (Alt ou Cmd + ← : la page précédente du navigateur), ni la bulle repliée (rien ne
     * se verrait changer).
     */
    function surToucheBulle(ev) {
        if (!etat || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
        if (ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        if (etat.elements.bulle.classList.contains('est-repliee')) return;
        if (!etat.elements.bulle.contains(document.activeElement)) return;
        if (changerPage(ev.key === 'ArrowRight' ? 1 : -1)) ev.preventDefault();
    }

    /**
     * Découpe le texte de la bulle (lu une fois, au rendu de l'étape : `etat.texte`) à la largeur actuelle
     * et pose ses pages ; la page `garder` reste affichée si elle existe encore ; la largeur mesurée est
     * gardée (`largeurPages`).
     */
    function paginer(garder) {
        var b = etat.elements.bulle;
        var p = b.querySelector('.parcours-bulle-texte');
        if (!p) return;
        etat.largeurPages = p.offsetWidth;
        // Le texte de l'étape (aucun : la carte d'une page n'a que ses consignes), puis les pages de son complément.
        p.hidden = false;
        p.style.minHeight = '';   // une hauteur gardée fausserait la mesure (scrollHeight ne descend pas sous elle)
        p.style.flexBasis = '';
        var textes = etat.texte ? decouperEnPages(p, etat.texte) : [];
        var listes = pagesDuComplement(p, etat.complement || [], textes);
        var contenus = textes.concat(listes);
        etat.pages = textes.concat(listes.map(texteDesItems));
        etat.pageComplement = listes.length ? textes.length : -1;
        p.hidden = !contenus.length;
        egaliserPages(p, contenus);
        ecrirePages(p, contenus);
        var plusieurs = etat.pages.length > 1;
        var nav = b.querySelector('.parcours-bulle-nav');
        if (nav) nav.hidden = !plusieurs;
        montrerPage(plusieurs ? (garder || 0) : 0);
    }

    /**
     * À chaque passage de la sonde : si la largeur du texte a changé (une sonde d'étape qui change la
     * forme de la bulle, une fenêtre redimensionnée), la découpe est refaite. Un texte caché (forme
     * réduite d'un parcours, bulle repliée) n'est pas mesuré.
     */
    function suivreLargeurDesPages() {
        var p = etat.elements.bulle.querySelector('.parcours-bulle-texte');
        if (!p || !p.offsetWidth || p.offsetWidth === etat.largeurPages) return false;
        paginer(etat.page);
        return true;
    }

    // ---------- Le rendu d'une étape ----------

    function etapeCourante() {
        return etat ? etat.def.etapes[etat.i] : null;
    }

    /** Sur téléphone : la classe de la bulle et l'état du bouton de la tête suivent `etat.replie`. */
    function appliquerRepli() {
        var b = etat.elements.bulle;
        b.classList.toggle('est-repliee', etat.telephone && etat.replie);
        var bascule = b.querySelector('.parcours-bulle-bascule');
        if (bascule) bascule.setAttribute('aria-expanded', etat.replie ? 'false' : 'true');
    }

    function basculerRepli() {
        if (!etat || !etat.telephone) return;
        etat.replie = !etat.replie;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        appliquerRepli();
        if (!etat.replie) amenerDansLaVue(elementsVises(etapeCourante()), hauteurNaturelle());
        sonder();
    }

    /**
     * À l'intérieur des guillemets, une espace insécable : un guillemet ne passe jamais seul à la ligne (décision de
     * Cowork, 9 nov. 2026, 17 h 58 ; mesuré à 820 px : « Importer » se coupait avant son guillemet fermant). Pour toutes
     * les bulles, au rendu : les textes validés, et les sentinelles qui les lisent, gardent leurs espaces ordinaires.
     */
    function typographier(t) {
        return String(t == null ? '' : t).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»');
    }

    /** « n sur N », dans la tête ; rien pour une carte qui n'est pas un parcours (`sansRang`). */
    function rangDeLEtape(total) {
        if (etat.def.sansRang) return [];
        var rang = document.createElement('span');
        rang.className = 'parcours-bulle-rang';
        rang.textContent = (etat.i + 1) + ' sur ' + total;
        return [rang];
    }

    function rendreBulle(opts) {
        var etape = etapeCourante();
        var b = etat.elements.bulle;
        var total = etat.def.etapes.length;
        b.textContent = '';
        etat.telephone = surTelephone();
        b.className = 'parcours-bulle' + (etat.telephone ? ' parcours-bulle--telephone' : '');
        b.style.maxHeight = '';
        // Sur téléphone, la largeur est posée AVANT de mesurer le texte (son plancher de trois lignes).
        b.style.left = etat.telephone ? MARGE + 'px' : b.style.left;
        b.style.right = etat.telephone ? MARGE + 'px' : '';

        var tete = document.createElement('div');
        tete.className = 'parcours-bulle-tete';
        var h = document.createElement('h2');
        h.className = 'parcours-bulle-titre';
        h.id = 'parcours-bulle-titre';
        h.textContent = typographier(etape.titre);
        tete.appendChild(h);
        rangDeLEtape(total).forEach(function (rang) { tete.appendChild(rang); });
        if (etat.telephone) {
            // Un bouton posé sur la tête (une tête de section ne va pas DANS un bouton) : son nom
            // est le titre, son état dit si la bulle est dépliée.
            var bascule = document.createElement('button');
            bascule.type = 'button';
            bascule.className = 'parcours-bulle-bascule';
            bascule.setAttribute('aria-labelledby', 'parcours-bulle-titre');
            bascule.addEventListener('click', basculerRepli);
            tete.appendChild(bascule);
        } else {
            // La poignée (hors téléphone) : glisser la bulle à la souris, au doigt, au stylet ; au clavier, les flèches.
            var poignee = document.createElement('button');
            poignee.type = 'button';
            poignee.className = 'parcours-bulle-poignee';
            poignee.textContent = '\u283f';
            poignee.setAttribute('aria-label', LIBELLE_POIGNEE);
            poignee.addEventListener('pointerdown', debutGlisser);
            poignee.addEventListener('pointermove', surGlisser);
            poignee.addEventListener('pointerup', finGlisser);
            poignee.addEventListener('pointercancel', finGlisser);
            poignee.addEventListener('keydown', surTouchePoignee);
            tete.appendChild(poignee);
        }
        etat.glisse = null;
        if (etat.telephone) etat.deplacee = null;
        b.appendChild(tete);

        var p = document.createElement('p');
        p.className = 'parcours-bulle-texte';
        b.appendChild(p);

        // Sous le texte, « ← 1/3 → » ; caché tant que le texte tient en une page. Le compteur est pour
        // l'œil : au changement de page, le lecteur d'écran entend « page 2 de 3 » (changerPage).
        var nav = document.createElement('div');
        nav.className = 'parcours-bulle-nav';
        nav.hidden = true;
        var fleche = function (classe, signe, nom, delta) {
            var f = document.createElement('button');
            f.type = 'button';
            f.className = 'parcours-bulle-fleche ' + classe;
            f.textContent = signe;
            f.setAttribute('aria-label', nom);
            f.addEventListener('click', function () { changerPage(delta); });
            return f;
        };
        var compteur = document.createElement('span');
        compteur.className = 'parcours-bulle-pages';
        compteur.setAttribute('aria-hidden', 'true');
        nav.appendChild(fleche('parcours-bulle-page-prec', '←', 'Page précédente', -1));
        nav.appendChild(compteur);
        nav.appendChild(fleche('parcours-bulle-page-suiv', '→', 'Page suivante', 1));
        b.appendChild(nav);

        // Les pages, à la largeur de la bulle (le filet : jamais sous trois lignes, posé par montrerPage).
        // Seule la forme change (le seuil du téléphone franchi) : la page affichée reste.
        // Les espaces insécables des guillemets (typographier) avant la découpe : les pages les gardent.
        etat.texte = typographier(etape.texte);
        etat.complement = itemsDuComplement(etape);
        etat.signatureComplement = JSON.stringify(etat.complement);
        paginer(opts && opts.sansAnnonce ? etat.page : 0);

        if (etape.geste) {
            var g = document.createElement('p');
            g.className = 'parcours-bulle-geste';
            g.textContent = typographier(etape.geste);
            b.appendChild(g);
        }

        if (etape.boutons && etape.boutons.length) {
            var zone = document.createElement('div');
            zone.className = 'parcours-bulle-boutons';
            etape.boutons.forEach(function (def) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn ' + (def.primaire ? 'btn-principal' : 'btn-secondaire');
                btn.textContent = def.libelle;
                btn.addEventListener('click', function () { if (!btn.disabled) def.action(api); });
                zone.appendChild(btn);
            });
            b.appendChild(zone);
            // Ce qu'attend un bouton conditionnel (`attend`), dit sous les boutons (voir « LES BOUTONS QUI ATTENDENT »).
            var attente = document.createElement('p');
            attente.className = 'parcours-bulle-attente';
            attente.setAttribute('role', 'status');
            attente.hidden = true;
            b.appendChild(attente);
        }

        if (!etape.sansSortie && etat.def.lienSortie) {
            var sortie = document.createElement('button');
            sortie.type = 'button';
            sortie.className = 'parcours-bulle-sortie';
            sortie.textContent = etat.def.lienSortie;
            sortie.addEventListener('click', quitter);
            b.appendChild(sortie);
        }

        // L'annonce : le titre et le texte, puis le geste. Vidée d'abord, pour qu'un même
        // texte soit relu s'il revient. Pas d'annonce quand seule la forme change (le seuil franchi).
        if (opts && opts.sansAnnonce) { appliquerRepli(); return; }
        annoncerEtape(etape);
        appliquerRepli();
    }

    /** L'annonce d'une étape : son titre, son texte, son complément, puis son geste. */
    function annoncerEtape(etape) {
        var a = etat.elements.annonce;
        a.textContent = '';
        setTimeout(function () {
            if (!etat) return;
            var suite = (etat.complement || []).length ? ' ' + texteDesItems(etat.complement) : '';
            a.textContent = etape.titre + '. ' + etape.texte + suite + (etape.geste ? ' ' + etape.geste : '');
        }, 50);
    }

    /** La hauteur de la bulle si son texte ne défilait pas (le texte est la seule zone qui défile). */
    function hauteurNaturelle() {
        var b = etat.elements.bulle;
        var t = b.querySelector('.parcours-bulle-texte');
        var h = b.offsetHeight;
        if (t && !b.classList.contains('est-repliee')) h += Math.max(0, t.scrollHeight - t.clientHeight);
        return h;
    }

    // ---------- La géométrie des flèches et du déplacement : des fonctions pures (tests/unit) ----------

    /** Des cibles qui se touchent (à `pad` px près) n'en font qu'une : une seule flèche. Pure. */
    function fondreCibles(rects, pad) {
        var liste = rects.map(function (r) { return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
        var change = true;
        while (change) {
            change = false;
            for (var a = 0; a < liste.length && !change; a++) {
                for (var b = a + 1; b < liste.length && !change; b++) {
                    var A = liste[a], B = liste[b];
                    // À MOINS de `pad` px : deux champs côte à côte à 20 px tout juste (les deux façons d'importer de
                    // « Ta classe », 4) gardent chacun sa flèche (11 nov. 2026).
                    var touche = !(A.right + pad <= B.left || B.right + pad <= A.left ||
                                   A.bottom + pad <= B.top || B.bottom + pad <= A.top);
                    if (touche) {
                        liste[a] = { left: Math.min(A.left, B.left), top: Math.min(A.top, B.top),
                                     right: Math.max(A.right, B.right), bottom: Math.max(A.bottom, B.bottom) };
                        liste.splice(b, 1);
                        change = true;
                    }
                }
            }
        }
        return liste;
    }

    /** Les cibles des flèches : fondues quand elles se touchent (à FUSION px près) ; au-delà de `max`, leur union seule. Pure. */
    function grouperCibles(rects, max) {
        var liste = fondreCibles(rects, FUSION);
        if (liste.length <= max) return liste;
        return [liste.reduce(function (u, r) {
            return { left: Math.min(u.left, r.left), top: Math.min(u.top, r.top),
                     right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) };
        })];
    }

    function borne(v, min, max) { return Math.min(Math.max(min, v), Math.max(min, max)); }
    function arrondi(v) { return Math.round(v * 10) / 10; }

    function dansRect(p, r) { return p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom; }

    /**
     * Une courbe de Bézier légèrement bombée de (sx, sy) à (ex, ey), raccourcie de `retrait` à l'arrivée, bombée du
     * côté `sens` (1 : à gauche du sens de la marche ; -1 : à droite), et sa pointe en deux traits ouverts. Null si
     * elle est trop courte pour se lire. `points` : neuf points de la courbe, pour savoir ce qu'elle croise. Pure.
     */
    function courbe(sx, sy, ex, ey, retrait, sens, ecran) {
        var vx = ex - sx, vy = ey - sy;
        var len = Math.sqrt(vx * vx + vy * vy);
        if (len - retrait < FLECHE_MIN) return null;
        var ux = vx / len, uy = vy / len;
        ex -= ux * retrait; ey -= uy * retrait; len -= retrait;
        var bombe = sens * Math.min(28, len * 0.18);
        // Le point de contrôle reste dans l'écran.
        var kx = borne((sx + ex) / 2 + uy * bombe, 4, ecran.largeur - 4);
        var ky = borne((sy + ey) / 2 - ux * bombe, 4, ecran.hauteur - 4);
        // La pointe : deux traits ouverts, de part et d'autre de la tangente à l'arrivée.
        var tx = ex - kx, ty = ey - ky;
        var tl = Math.sqrt(tx * tx + ty * ty) || 1;
        tx /= tl; ty /= tl;
        var aile = Math.min(12, len * 0.35), cos = Math.cos(0.5), sin = Math.sin(0.5);
        var ax = ex - aile * (tx * cos - ty * sin), ay = ey - aile * (ty * cos + tx * sin);
        var bx = ex - aile * (tx * cos + ty * sin), by = ey - aile * (ty * cos - tx * sin);
        var points = [];
        for (var n = 1; n <= 9; n++) {
            var t = n / 10, q = 1 - t;
            points.push({ x: q * q * sx + 2 * q * t * kx + t * t * ex, y: q * q * sy + 2 * q * t * ky + t * t * ey });
        }
        var d = 'M' + arrondi(sx) + ',' + arrondi(sy) + ' Q' + arrondi(kx) + ',' + arrondi(ky) + ' ' + arrondi(ex) + ',' + arrondi(ey) +
            ' M' + arrondi(ax) + ',' + arrondi(ay) + ' L' + arrondi(ex) + ',' + arrondi(ey) + ' L' + arrondi(bx) + ',' + arrondi(by);
        return { d: d, depart: { x: arrondi(sx), y: arrondi(sy) }, pointe: { x: arrondi(ex), y: arrondi(ey) },
                 controle: { x: arrondi(kx), y: arrondi(ky) }, points: points, longueur: len };
    }

    /**
     * La flèche, du bord de la bulle vers la cible. Pure et déterministe : les mêmes rectangles rendent le même tracé
     * (la sonde tourne toutes les 120 ms, la flèche ne frémit pas).
     *  · d'abord le plus court : du point de la bulle le plus proche de la cible au point de la cible le plus proche ;
     *  · la cible sortie de l'écran : la flèche va au bord de l'écran, du côté de la cible ;
     *  · la cible sous la bulle : null ; le plus court trop court pour se lire (FLECHE_MIN) : un autre bord de la
     *    cible, comme pour un obstacle ; aucun bord assez loin : null ;
     *  · la pointe s'arrête à FLECHE_RETRAIT px du bord de la cible ; deux traits ouverts, pas de triangle ;
     *  · si ce tracé passe sur un obstacle (une autre cible, ce qu'il faut toucher), le bombement change de côté ;
     *    sinon la flèche arrive par un autre bord de la cible, par le chemin le plus court qui ne croise rien ; si
     *    tout croise, le plus court est gardé.
     * @param {{left,top,right,bottom}} bulle
     * @param {{left,top,right,bottom}} cible
     * @param {{largeur:number, hauteur:number}} ecran  la largeur de la mise en page × innerHeight (ecranGarde)
     * @param {Array<{left,top,right,bottom}>} [obstacles]  ce que la flèche évite de croiser
     * @returns {null|{d:string, depart:{x,y}, pointe:{x,y}, controle:{x,y}, horsEcran:boolean}}
     */
    function tracerFleche(bulle, cible, ecran, obstacles) {
        var W = ecran.largeur, H = ecran.hauteur;
        obstacles = obstacles || [];
        var hors = cible.right <= 0 || cible.bottom <= 0 || cible.left >= W || cible.top >= H;
        var c = hors ? cible : { left: Math.max(0, cible.left), top: Math.max(0, cible.top),
                                 right: Math.min(W, cible.right), bottom: Math.min(H, cible.bottom) };
        var cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2;
        // Le départ : le point du bord de la bulle le plus proche du centre de la cible.
        var sx = borne(cx, bulle.left, bulle.right), sy = borne(cy, bulle.top, bulle.bottom);
        var f = hors ? versLeBordDeLEcran(bulle, sx, sy, cx, cy, ecran)
            // Le centre de la cible sous la bulle : elle est cachée, pas de flèche.
            : (sx === cx && sy === cy) ? null : versLaCible(bulle, c, sx, sy, ecran, obstacles);
        if (!f && !hors) f = faute(bulle, c, sx, sy, cx, cy, ecran, obstacles);
        if (!f) return null;
        f.horsEcran = hors;
        delete f.points;
        delete f.longueur;
        return f;
    }

    /**
     * Faute de tracé : d'abord sans les obstacles (passer sur une autre cible vaut mieux qu'aucune flèche) ; puis, la
     * bulle posée sur la cible (aucune place libre : les bandes de « Ta classe d'un coup d'œil », la fiche plus haute que
     * l'écran de « Ton intervention », captures 28 et 29), la partie que la bulle laisse voir. Pure.
     */
    function faute(bulle, c, sx, sy, cx, cy, ecran, obstacles) {
        var f = obstacles.length && !(sx === cx && sy === cy) ? versLaCible(bulle, c, sx, sy, ecran, []) : null;
        return f || (seCroisent(bulle, c, 0) ? versLaPartieVisible(bulle, c, ecran) : null);
    }

    /**
     * La cible que la bulle chevauche : la plus grande des quatre bandes de la cible hors de la bulle (à gauche, à droite,
     * au-dessus, au-dessous) ; la flèche part du bord de la bulle le plus proche du milieu de cette bande et y entre. Null
     * si aucune bande n'a FLECHE_MIN px dans ses deux sens. Pure.
     */
    function versLaPartieVisible(bulle, c, ecran) {
        var bandes = [
            { left: c.left, top: c.top, right: Math.min(c.right, bulle.left), bottom: c.bottom },
            { left: Math.max(c.left, bulle.right), top: c.top, right: c.right, bottom: c.bottom },
            { left: c.left, top: c.top, right: c.right, bottom: Math.min(c.bottom, bulle.top) },
            { left: c.left, top: Math.max(c.top, bulle.bottom), right: c.right, bottom: c.bottom }
        ].filter(function (b) { return b.right - b.left >= FLECHE_MIN && b.bottom - b.top >= FLECHE_MIN; });
        if (!bandes.length) return null;
        var b = bandes.reduce(function (m, x) {
            return (x.right - x.left) * (x.bottom - x.top) > (m.right - m.left) * (m.bottom - m.top) ? x : m;
        });
        var mx = (b.left + b.right) / 2, my = (b.top + b.bottom) / 2;
        return courbe(borne(mx, bulle.left, bulle.right), borne(my, bulle.top, bulle.bottom), mx, my, 0, 1, ecran);
    }

    /** La cible sortie de l'écran : la flèche va au bord de l'écran, du côté de la cible. Pure. */
    function versLeBordDeLEcran(bulle, sx, sy, cx, cy, ecran) {
        var bx = borne(cx, 10, ecran.largeur - 10), by = borne(cy, 10, ecran.hauteur - 10);
        if (dansRect({ x: bx, y: by }, bulle)) return null;
        return courbe(sx, sy, bx, by, 0, 1, ecran);
    }

    function croise(f, rects) {
        return f.points.some(function (p) { return rects.some(function (r) { return dansRect(p, r); }); });
    }

    /**
     * Le plus court, du départ au point de la cible le plus proche ; s'il croise un obstacle, bombé de l'autre côté ;
     * s'il croise encore, ou s'il est trop court pour se lire (FLECHE_MIN), par un autre bord de la cible. Pure.
     */
    function versLaCible(bulle, c, sx, sy, ecran, obstacles) {
        var ex = borne(sx, c.left, c.right), ey = borne(sy, c.top, c.bottom);
        var direct = courbe(sx, sy, ex, ey, FLECHE_RETRAIT, 1, ecran);
        if (direct && !croise(direct, obstacles)) return direct;
        var envers = direct && courbe(sx, sy, ex, ey, FLECHE_RETRAIT, -1, ecran);
        if (envers && !croise(envers, obstacles)) return envers;
        return parUnAutreBord(bulle, c, ecran, obstacles) || direct;
    }

    /**
     * Par un autre bord de la cible : le point de ce bord le plus proche de la bulle, à 16 px des coins (au milieu d'un
     * bord plus court), la pointe à FLECHE_RETRAIT du bord ; le plus court qui ne croise rien, sinon null. Pure.
     */
    function parUnAutreBord(bulle, c, ecran, obstacles) {
        var bcx = (bulle.left + bulle.right) / 2, bcy = (bulle.top + bulle.bottom) / 2;
        var mx = Math.min(16, (c.right - c.left) / 2), my = Math.min(16, (c.bottom - c.top) / 2);
        var px = borne(bcx, c.left + mx, c.right - mx), py = borne(bcy, c.top + my, c.bottom - my);
        var R = FLECHE_RETRAIT;
        var arrivees = [{ x: px, y: c.top - R }, { x: px, y: c.bottom + R }, { x: c.left - R, y: py }, { x: c.right + R, y: py }];
        var interdits = obstacles.concat([c, bulle]);
        var meilleure = null;
        arrivees.forEach(function (a) {
            var dx = borne(a.x, bulle.left, bulle.right), dy = borne(a.y, bulle.top, bulle.bottom);
            [1, -1].forEach(function (sens) {
                var f = courbe(dx, dy, a.x, a.y, 0, sens, ecran);
                if (f && !croise(f, interdits) && (!meilleure || f.longueur < meilleure.longueur - 0.5)) meilleure = f;
            });
        });
        return meilleure;
    }

    /**
     * La place d'une bulle déplacée, gardée dans l'écran utile (`cadre` : sous l'en-tête, au-dessus du bandeau de la
     * démo et du clavier). Une bulle plus grande que le cadre se cale en haut à gauche. Pure.
     */
    function bornerDeplacement(x, y, largeur, hauteur, cadre) {
        return { x: Math.round(borne(x, cadre.gauche, cadre.droite - largeur)),
                 y: Math.round(borne(y, cadre.haut, cadre.bas - hauteur)) };
    }

    function seCroisent(a, b, marge) {
        return !(a.right + marge <= b.left || b.right + marge <= a.left || a.bottom + marge <= b.top || b.bottom + marge <= a.top);
    }

    /** Le haut d'où une bulle peut commencer : sous l'en-tête. */
    function hautUtile() {
        return Math.max(MARGE, hautEntete() + MARGE);
    }

    /**
     * La réserve du témoin « Enregistré » : la hauteur occupée par une bulle rangée en bas. Bornée
     * pour que le témoin (~40 px) reste dans l'écran quand la bulle prend presque toute la hauteur :
     * il passe alors sur le haut de la bulle plutôt que hors de l'écran.
     */
    function poserReserveBas(px) {
        var plafond = Math.max(0, window.innerHeight - 64);
        document.documentElement.style.setProperty('--parcours-reserve-bas', Math.round(Math.min(plafond, Math.max(0, px))) + 'px');
    }

    /** Un geste de la personne (molette, doigt, clavier) arrête le réglage : le moteur ne lutte pas. */
    function arreterReglage() {
        if (etat) etat.reglerJusqua = 0;
    }

    /**
     * Sur téléphone : la bulle pleine largeur, rangée en bas ; en haut si la zone éclairée occupe
     * le bas ; si aucun côté ne contient sa hauteur, le côté du contour, sinon le plus grand, et le
     * texte défile. Jamais plus haute que l'écran utile (la cible peut être hors de l'écran).
     */
    /** Le côté où la bulle tient (en bas d'abord), sinon le plus grand des deux. */
    function choisirCote(naturelle, sous, dessus) {
        if (naturelle <= sous) return { cote: 'bas', max: sous };
        if (naturelle <= dessus) return { cote: 'haut', max: dessus };
        return sous >= dessus ? { cote: 'bas', max: sous } : { cote: 'haut', max: dessus };
    }

    /**
     * En bas d'abord : pendant le réglage (début d'étape, dépliement, jusqu'au premier geste), si
     * faire défiler la page laisse la place sous la zone, le moteur la fait défiler. Rend la zone
     * telle qu'elle est après ce défilement.
     */
    function reglerDefilement(cibleRect, naturelle, haut, bas) {
        var manque = Math.ceil(naturelle - (bas - (cibleRect.bottom + ECART)));
        if (manque <= 0 || Date.now() >= etat.reglerJusqua) return cibleRect;
        if ((cibleRect.top - ECART) - haut < manque) return cibleRect;
        var avant = window.scrollY;
        window.scrollBy(0, manque);
        var fait = window.scrollY - avant;
        return { top: cibleRect.top - fait, bottom: cibleRect.bottom - fait };
    }

    /**
     * Le côté de la bulle sur téléphone. La zone éclairée d'abord ; si elle prend tout l'écran, la
     * bulle en couvre une partie, au mieux sans toucher au contour (ce qu'il faut toucher) : le côté
     * du contour où elle tient, sinon le plus grand ; si les deux ont moins que sa tête (56 px), elle
     * couvre le bord du contour. Sans contour (le geste est dans la bulle) : en bas, à sa hauteur.
     */
    function coteTelephone(cibleRect, contourEl, naturelle, haut, bas) {
        var ecran = Math.max(0, bas - haut);
        if (!cibleRect) return { cote: 'bas', max: ecran };
        var z = reglerDefilement(cibleRect, naturelle, haut, bas);
        var place = choisirCote(naturelle, bas - (z.bottom + ECART), (z.top - ECART) - haut);
        if (naturelle <= place.max) return place;
        if (!contourEl) return { cote: 'bas', max: ecran };
        var rc = contourEl.getBoundingClientRect(); // lu maintenant : après le défilement éventuel
        return choisirCote(naturelle, bas - (rc.bottom + ECART), (rc.top - ECART) - haut);
    }

    /**
     * Sur téléphone : la bulle pleine largeur, au bord de l'écran (coteTelephone). Jamais plus haute
     * que l'écran utile (la cible peut être hors de l'écran) ; repliée, elle garde sa tête (56 px).
     */
    function placerBulleTelephone(cibleRect, contourEl) {
        var b = etat.elements.bulle;
        var haut = hautUtile();
        var bas = basEcran() - MARGE;
        var place = coteTelephone(cibleRect, contourEl, hauteurNaturelle(), haut, bas);
        b.style.maxHeight = Math.max(Math.round(Math.min(place.max, Math.max(0, bas - haut))), 56) + 'px';
        var bh = b.offsetHeight;
        var y = place.cote === 'bas' ? Math.max(MARGE, bas - bh) : haut;
        b.style.left = MARGE + 'px';
        b.style.right = MARGE + 'px';
        b.style.top = Math.round(y) + 'px';
        poserReserveBas(place.cote === 'bas' ? window.innerHeight - y : 0);
    }

    /** L'écran utile d'une bulle : sous l'en-tête, au-dessus du bandeau de la démo et du clavier. */
    function cadreUtile() {
        return { gauche: MARGE, haut: hautUtile(), droite: ecranGarde().largeur - MARGE, bas: basEcran() - MARGE };
    }

    /** La bulle déplacée par la personne : sa place gardée pour l'étape, ramenée dans l'écran utile s'il a changé. */
    function poserDeplacee() {
        var b = etat.elements.bulle;
        var p = bornerDeplacement(etat.deplacee.x, etat.deplacee.y, b.offsetWidth, b.offsetHeight, cadreUtile());
        b.style.left = p.x + 'px';
        b.style.top = p.y + 'px';
        return p;
    }

    function pese(r, poids) {
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, poids: poids };
    }

    /** L'aire de `p` couverte par les rectangles `rects`, chacun pesé de son `poids` (1 par défaut). Pure. */
    function aireCouverte(p, rects) {
        return rects.reduce(function (somme, r) {
            var l = Math.min(p.right, r.right) - Math.max(p.left, r.left);
            var h = Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top);
            return somme + (l > 0 && h > 0 ? l * h * (r.poids || 1) : 0);
        }, 0);
    }

    /** La distance de `p` au plus proche des rectangles (0 s'il en touche un ; l'infini sans rectangle). Pure. */
    function ecartA(p, rects) {
        return rects.reduce(function (min, r) {
            var dx = Math.max(r.left - p.right, p.left - r.right, 0), dy = Math.max(r.top - p.bottom, p.top - r.bottom, 0);
            return Math.min(min, Math.sqrt(dx * dx + dy * dy));
        }, Infinity);
    }

    /**
     * Les places essayées. Le recouvrement, en fonction de la place, est linéaire par morceaux dans chaque direction :
     * son minimum est atteint à un coin de la grille que tracent les bords de l'écran utile et, pour chaque zone, ses
     * bords et les places qui la touchent (à 0 ou à ECART px). Toutes ces places, plus les milieux des bords de l'écran
     * (pas son centre) ; toutes ramenées dans l'écran utile. Pure.
     */
    function placesEssayees(evites, bw, bh, cadre) {
        var g = cadre.gauche, h = cadre.haut, d = cadre.droite - bw, b = cadre.bas - bh;
        var mx = (g + d) / 2, my = (h + b) / 2;
        // À égale distance, la droite d'abord (la place de la bulle étroite à droite de l'aperçu, « Mettre tes données à
        // l'abri », 3) ; puis le haut.
        var xs = [d, mx, g], ys = [h, my, b];
        // Une place qui longe une zone s'arrondit du côté LIBRE (13 nov. 2026) : arrondie au plus proche, la place
        // collée sous un bord à 152,45 tombait à 152, mordait d'un demi-pixel sur le contour (pesé dix mille fois) et
        // perdait contre la place à ECART px, quatre pixels de recouvrement plus bas (parcours-8, 820 px, étape 2).
        var avant = Math.floor, apres = Math.ceil;
        evites.forEach(function (r) {
            xs.push(avant(r.left - bw), avant(r.left - ECART - bw), r.left, r.right - bw, apres(r.right), apres(r.right + ECART));
            ys.push(avant(r.top - bh), avant(r.top - ECART - bh), r.top, r.bottom - bh, apres(r.bottom), apres(r.bottom + ECART));
        });
        var places = [];
        xs.forEach(function (x) {
            ys.forEach(function (y) { if (x !== mx || y !== my) places.push({ x: Math.round(borne(x, g, d)), y: Math.round(borne(y, h, b)) }); });
        });
        return places;
    }

    /**
     * La place de la bulle (bw × bh) dans l'écran utile `cadre` : sans couvrir ce qu'elle évite (ses zones, le
     * contour), au bord le plus éloigné d'eux ; quand aucune place n'est libre (l'iPad en portrait), le moindre
     * recouvrement, chaque rectangle pesé de son `poids` (le contour : POIDS_CONTOUR), et la poignée sert. Pure et déterministe (la sonde la rappelle toutes les 120 ms).
     * @returns {{x:number, y:number, aire:number}}
     */
    function placerLoin(evites, bw, bh, cadre) {
        var meilleure = null;
        placesEssayees(evites, bw, bh, cadre).forEach(function (p) {
            var r = { left: p.x, top: p.y, right: p.x + bw, bottom: p.y + bh };
            var cand = { x: p.x, y: p.y, aire: aireCouverte(r, evites), ecart: ecartA(r, evites) };
            if (!meilleure || cand.aire < meilleure.aire - 1 || (cand.aire <= meilleure.aire + 1 && cand.ecart > meilleure.ecart + 0.5)) meilleure = cand;
        });
        return { x: meilleure.x, y: meilleure.y, aire: meilleure.aire };
    }

    /**
     * La bulle, hors téléphone : au bord le plus éloigné de ce qu'elle évite (`evites` : ses zones et le contour,
     * visibles) ; sans rien de désigné, au centre. Déplacée par la personne, elle garde sa place pour l'étape.
     */
    function placerBulle(evites) {
        var b = etat.elements.bulle;
        poserReserveBas(0);
        var vw = largeurPage(), vh = basEcran();
        // Le filet : jamais plus haute que l'écran utile ; au-delà, son texte défile.
        b.style.maxHeight = Math.max(0, vh - 2 * MARGE) + 'px';
        if (etat.deplacee) { poserDeplacee(); return; }
        var bw = b.offsetWidth, bh = b.offsetHeight;
        var place;
        if (!evites.length) {
            place = { x: (vw - bw) / 2, y: Math.max(hautEntete() + 16, (vh - bh) / 2) };
            if (place.y + bh > vh - MARGE) place.y = Math.max(MARGE, vh - bh - MARGE);
        } else {
            place = placerLoin(evites, bw, bh, cadreUtile());
        }
        b.style.left = Math.round(place.x) + 'px';
        b.style.top = Math.round(place.y) + 'px';
    }

    // ---------- La poignée : déplacer la bulle ----------

    /** Pose la bulle où la personne la veut (bornée à l'écran utile) ; les flèches suivent dans le même geste. */
    function deplacerBulle(x, y) {
        etat.deplacee = { x: x, y: y };
        // La place gardée est celle où la bulle s'est arrêtée (bornée), pas celle que le pointeur visait hors de l'écran.
        etat.deplacee = poserDeplacee();
        if (etat.vus) dessinerFleches(etat.vus.zones, etat.vus.contourEl, etat.vus.vise);
    }

    function debutGlisser(ev) {
        // Un seul pointeur déplace la bulle : un second doigt posé pendant le glissement ne prend pas la main.
        if (!etat || etat.telephone || etat.glisse || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        etat.glisse = { id: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top };
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* le pointeur a déjà été relâché */ }
        etat.elements.bulle.classList.add('est-glissee');
        ev.preventDefault();
    }

    function surGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        deplacerBulle(ev.clientX - etat.glisse.dx, ev.clientY - etat.glisse.dy);
        ev.preventDefault();
    }

    function finGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        etat.glisse = null;
        etat.elements.bulle.classList.remove('est-glissee');
        try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) { /* déjà relâché */ }
    }

    /**
     * Au clavier, la poignée déplace la bulle par pas de PAS_CLAVIER. L'événement ne remonte pas à la bulle :
     * les flèches gauche et droite n'y changent pas de page.
     */
    function surTouchePoignee(ev) {
        var pas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
        if (!etat || !pas || ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        deplacerBulle(r.left + pas[0] * PAS_CLAVIER, r.top + pas[1] * PAS_CLAVIER);
        ev.preventDefault();
        ev.stopPropagation();
    }

    // ---------- Les flèches, la section actuelle ----------

    /**
     * L'élément se voit-il ? Sa partie à l'écran n'est pas couverte en entier par autre chose : une palette flottante
     * (le « Planificateur » de la carte, 11 nov. 2026, capture 25), la bulle, une fenêtre. Le test de l'œil : en cinq
     * points de sa partie à l'écran, ce que le toucher y trouverait est lui ou l'un de ses descendants, au moins une
     * fois. Les couches du moteur ne comptent pas (elles ne prennent pas le toucher), la bulle, si. Un élément tout
     * entier hors de l'écran n'est pas jugé ici : sa flèche va au bord de l'écran, de son côté (`tracerFleche`).
     */
    function seVoit(el) {
        if (!visible(el)) return false;
        var r = el.getBoundingClientRect();
        var e = ecranGarde();
        var g = Math.max(0, r.left), h = Math.max(0, r.top), d = Math.min(e.largeur, r.right), b = Math.min(e.hauteur, r.bottom);
        if (d <= g || b <= h) return true;
        var points = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
        for (var k = 0; k < points.length; k++) {
            var t = document.elementFromPoint(g + (d - g) * points[k][0], h + (b - h) * points[k][1]);
            if (t && (t === el || el.contains(t))) return true;
        }
        return false;
    }

    /**
     * Ce dont parle la bulle : les zones qui ne sont pas ce qu'il faut toucher (ni dedans), à l'écran, et qui se voient.
     * Une zone qui contient le contour garde sa flèche (relais du 11 nov. 2026, 11 h 45 : « les zones de sujet qui ne sont
     * pas le contour gardent leur flèche »).
     */
    function sujets(zones, contourEl) {
        return (zones || []).filter(function (z) {
            return visible(z) && z !== contourEl && !(contourEl && contourEl.contains(z)) && aLEcran(z) && seVoit(z);
        });
    }

    /**
     * Une partie de l'élément est à l'écran. Un sujet tout entier hors de l'écran n'a pas de flèche (Grégoire, 11 nov.
     * 2026, capture 31 : « il faut défiler pour voir où pointe réellement la flèche du haut ») ; ce qu'il faut toucher,
     * lui, garde la sienne vers le bord de l'écran, de son côté, quand la personne l'a fait défiler hors de la vue.
     */
    function aLEcran(el) {
        var r = el.getBoundingClientRect();
        var e = ecranGarde();
        return r.right > 0 && r.bottom > 0 && r.left < e.largeur && r.top < e.hauteur;   // l'en-tête compris (ses sections)
    }

    /** Les cibles des sujets : groupées (fondues quand elles se touchent, leur union au-delà de FLECHES_MAX). */
    function ciblesDesFleches(zones, contourEl) {
        return grouperCibles(rectsDe(sujets(zones, contourEl)), FLECHES_MAX);
    }

    /**
     * Trace les flèches de la bulle vers ses cibles ; un tracé inchangé n'est pas réécrit. `vise.fleches` : où vont
     * les flèches parmi les zones ; `vise.une` (une étape à formulaire) : une par champ, sans fusion ni plafond.
     * LA RÈGLE DU CONTOUR (Grégoire, 11 nov. 2026, 11 h 45, quatrième aperçu) : ce qu'il faut toucher reçoit sa flèche
     * dès l'ouverture de l'étape, en plus de celles des sujets ; une étape qui a un contour n'est jamais sans flèche.
     * `nommeLeContour` : la sienne seule. Rien vers ce qui ne se voit pas (`seVoit`).
     */
    function dessinerFleches(zones, contourEl, vise) {
        var svg = etat.elements.svg;
        var b = etat.elements.bulle;
        var traces = [];
        if (visible(b)) {
            var rb = b.getBoundingClientRect();
            var ecran = ecranGarde();
            var fl = vise && vise.fleches;
            // (Un contour qui est aussi un champ du formulaire n'a qu'une flèche : `sujets` l'écarte des champs.)
            var auContour = visible(contourEl) && seVoit(contourEl) ? rectsDe([contourEl]) : [];
            var cibles = vise && vise.auContour ? auContour
                : (!fl ? ciblesDesFleches(zones, contourEl)
                    : vise.une ? rectsDe(sujets(fl, contourEl)) : ciblesDesFleches(fl, contourEl)).concat(auContour);
            // Une flèche évite de passer sur une autre cible, et sur ce qu'il faut toucher.
            var rc = visible(contourEl) ? contourEl.getBoundingClientRect() : null;
            cibles.forEach(function (r) {
                var obstacles = cibles.filter(function (o) { return o !== r; });
                if (rc && !seCroisent(rc, r, 0)) obstacles.push(rc);
                var t = tracerFleche(rb, r, ecran, obstacles);
                // La cible visée, pour les bancs (le relevé des ouvertures, tests/integration/harness/releve-bulle.js).
                if (t) traces.push({ d: t.d, cible: [r.left, r.top, r.right, r.bottom].map(Math.round).join(','), hors: t.horsEcran });
            });
        }
        var ns = 'http://www.w3.org/2000/svg';
        while (svg.childNodes.length > traces.length) svg.removeChild(svg.lastChild);
        while (svg.childNodes.length < traces.length) {
            var g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'parcours-fleche');
            ['parcours-fleche-fond', 'parcours-fleche-trait'].forEach(function (classe) {
                var chemin = document.createElementNS(ns, 'path');
                chemin.setAttribute('class', classe);
                g.appendChild(chemin);
            });
            svg.appendChild(g);
        }
        traces.forEach(function (t, k) {
            var g = svg.childNodes[k];
            g.setAttribute('data-cible', t.cible);
            if (t.hors) g.setAttribute('data-hors-ecran', ''); else g.removeAttribute('data-hors-ecran');
            if (g.getAttribute('data-trace') === t.d) return;
            g.setAttribute('data-trace', t.d);
            g.firstChild.setAttribute('d', t.d);
            g.lastChild.setAttribute('d', t.d);
        });
    }

    function effacerFleches() {
        var svg = etat.elements.svg;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    /**
     * La section actuelle : dans le menu ou la barre d'onglets qui contient le contour (son parent, ou le parent de
     * celui-ci), l'élément actif. Ni le contour lui-même, ni rien qui ne soit un bouton, un lien ou un onglet
     * (`.active` marque aussi les sections de la page).
     */
    function sectionActuelleDe(contourEl) {
        if (!visible(contourEl)) return null;
        var SEL = '.actif, .active, [aria-current]:not([aria-current="false"]), [aria-selected="true"]';
        var p = contourEl.parentElement;
        for (var n = 0; n < 2 && p && p !== document.body; n++, p = p.parentElement) {
            var liste = p.querySelectorAll(SEL);
            for (var k = 0; k < liste.length; k++) {
                var a = liste[k];
                if (a === contourEl || a.contains(contourEl) || contourEl.contains(a)) continue;
                if (a.matches('button, a, [role="tab"], [role="menuitem"], [role="option"]') && visible(a)) return a;
            }
        }
        return null;
    }

    /** Pose la mise en évidence sur la section actuelle, la retire de la précédente. Le moteur seul y touche. */
    function marquerSectionActuelle(el) {
        // Le même élément, qui porte encore sa marque (un rendu a pu réécrire ses classes) : rien à faire.
        if (etat.sectionActuelle === el && (!el || el.classList.contains('parcours-section-actuelle'))) return;
        if (etat.sectionActuelle) etat.sectionActuelle.classList.remove('parcours-section-actuelle');
        etat.sectionActuelle = el;
        if (el) el.classList.add('parcours-section-actuelle');
    }

    /**
     * La fenêtre a franchi le seuil du téléphone (rotation, écran partagé) : la bulle change de forme,
     * sans nouvelle annonce, et garde le focus si elle l'avait.
     */
    function suivreSeuil() {
        if (surTelephone() === etat.telephone) return;
        var avaitFocus = etat.elements.bulle.contains(document.activeElement);
        rendreBulle({ sansAnnonce: true });
        if (!avaitFocus) return;
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    /** La page de la bulle qui porte ce passage du texte (−1 : aucune). */
    function pageQuiPorte(passage) {
        var t = typographier(passage);
        for (var k = 0; k < (etat.pages || []).length; k++) if (etat.pages[k].indexOf(t) !== -1) return k;
        return -1;
    }

    /**
     * L'écran a changé dans l'étape (`pageQuiDit`, voir « L'ÉCRAN CHANGE DANS UNE ÉTAPE ») : la bulle passe à la page
     * qui en parle, et ce que l'étape désigne est amené dans la vue, une fois. Un passage inchangé ne fait rien : la
     * personne peut tourner les pages, défiler à son gré.
     */
    function suivreEcran(etape) {
        if (!etape.pageQuiDit) return;
        var passage = null;
        try { passage = etape.pageQuiDit() || null; } catch (e) { passage = null; }
        if (!passage || passage === etat.pageDite) return;
        etat.pageDite = passage;
        var k = pageQuiPorte(passage);
        if (k !== -1 && k !== etat.page) {
            montrerPage(k);
            etat.elements.annonce.textContent = 'page ' + (k + 1) + ' de ' + etat.pages.length;
        }
        amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
    }

    /** La ligne du geste, relue (voir « LA LIGNE DU GESTE SUIT L'ÉTAT ») : changée, elle s'annonce, seule. */
    function poserGeste(etape) {
        var g = etat.elements.bulle.querySelector('.parcours-bulle-geste');
        var texte = '';
        try { texte = etape.geste ? typographier(etape.geste) : ''; } catch (e) { texte = ''; }
        if (!g || !texte || g.textContent === texte) return;
        g.textContent = texte;
        etat.elements.annonce.textContent = texte;
    }

    /**
     * Le complément, relu (voir « LE COMPLÉMENT ») : changé avec l'écran, la découpe est refaite, la bulle passe à sa
     * première page et l'annonce. Inchangé : rien, la personne tourne les pages à son gré.
     */
    function suivreComplement(etape) {
        if (!etape.complement) return;
        var items = itemsDuComplement(etape), s = JSON.stringify(items);
        if (s === etat.signatureComplement) return;
        etat.complement = items;
        etat.signatureComplement = s;
        paginer(etat.page);
        if (etat.pageComplement === -1) return;
        montrerPage(etat.pageComplement);
        etat.elements.annonce.textContent = texteDesItems(items);
    }

    /** L'avis de l'étape (voir « L'AVIS ») : posé sous le texte, changé, ou retiré ; annoncé par son rôle. */
    function poserAvis(etape) {
        var b = etat.elements.bulle;
        var texte = '';
        try { texte = etape.avis ? typographier(etape.avis() || '') : ''; } catch (e) { texte = ''; }
        var p = b.querySelector('.parcours-bulle-avis');
        if (!texte) { if (p) p.remove(); return; }
        if (!p) {
            p = document.createElement('p');
            p.className = 'parcours-bulle-avis';
            p.setAttribute('role', 'status');
            var nav = b.querySelector('.parcours-bulle-nav');
            b.insertBefore(p, nav ? nav.nextSibling : null);
        }
        if (p.textContent !== texte) p.textContent = texte;
    }

    /**
     * Les boutons qui attendent (`attend`, voir « LES BOUTONS QUI ATTENDENT ») : visibles toujours, inactifs tant que la
     * condition manque, et la raison dite dessous. Un bouton sans `attend` reste actif.
     */
    function poserAttentes(etape) {
        var b = etat.elements.bulle;
        var zone = b.querySelector('.parcours-bulle-boutons');
        var ligne = b.querySelector('.parcours-bulle-attente');
        if (!zone || !ligne || !etape.boutons) return;
        var raisons = etape.boutons.map(function (def, k) {
            var btn = zone.children[k], r = '';
            try { r = btn && def.attend ? def.attend() || '' : ''; } catch (e) { r = ''; }
            if (btn && def.attend && btn.disabled !== !!r) btn.disabled = !!r;
            return r ? typographier(r) : '';
        });
        var texte = raisons.filter(Boolean).join(' ');
        if (ligne.textContent !== texte) ligne.textContent = texte;
        ligne.hidden = !texte;
    }

    /**
     * Ce qu'il faut toucher a changé dans l'étape (le geste suivant : un champ, puis un bouton) : il est amené à l'écran,
     * une fois, s'il n'y est pas (Grégoire, 11 nov. 2026, 12 h 05 : « nommer, pointer, passer par les étapes une après
     * l'autre » ; capture 32, la pondération défilée hors de l'écran). Reconnu par ce qu'il est, pas par son nœud : un
     * élément redessiné à l'identique ne fait rien défiler, et la personne garde la main sur le défilement.
     */
    function signatureDe(el) {
        if (!el) return '';
        // Pas son texte : il change sous les gestes (la dissection compte ses morceaux), et chaque changement relançait le
        // défilement (mesuré sous WebKit le 11 nov. 2026 : la palette de la dissection ne tenait plus en place).
        // `data-param` et `data-id` (12 nov. 2026, la dissection sur l'iPad) : les étiquettes de la palette partagent leur
        // action, les morceaux n'en ont pas ; sans eux, passer d'une étiquette (ou d'un morceau) à une autre ne se voyait pas.
        return [el.tagName, el.id, el.getAttribute('data-action') || '', el.getAttribute('name') || '',
            el.getAttribute('data-param') || '', el.getAttribute('data-id') || ''].join('|');
    }
    /**
     * Le contour de l'ouverture vient d'être amené avec le reste : il n'est pas « neuf » pour `suivreContour`. S'il ne se
     * voit pas encore (dans un tableau qui défile de côté : « Actions »), `suivreContour` l'amènera.
     */
    function retenirContourDOuverture(etape) {
        var c0 = etape.contour ? etape.contour() : null;
        etat.contourSuivi = visible(c0) && aLAise(c0) ? signatureDe(c0) : '';
    }
    /** Tout entier à l'écran, sous l'en-tête, et vu (rien ne le couvre). */
    function aLAise(el) {
        var r = el.getBoundingClientRect();
        var haut = hautEntete(), bas = basEcran();
        // Plus haut que l'écran (une zone de collage, une fiche) : amené dès qu'il y entre.
        if (r.height > bas - haut) return r.bottom > haut && r.top < bas && !rogne(el);
        return r.top >= haut && r.bottom <= bas && r.left >= 0 && r.right <= ecranGarde().largeur && !rogne(el);
    }
    /**
     * Rogné par son propre conteneur (un tableau qui défile de côté : « Actions ») : en son milieu, le toucher trouve un
     * de ses ancêtres. Couvert par autre chose (une palette flottante), il n'est pas « rogné » : défiler n'y changerait
     * rien, et la page bougerait sans fin.
     */
    function rogne(el) {
        var r = el.getBoundingClientRect();
        var t = document.elementFromPoint(Math.min(Math.max((r.left + r.right) / 2, 0), ecranGarde().largeur - 1),
            Math.min(Math.max((r.top + r.bottom) / 2, 0), ecranGarde().hauteur - 1));
        return !!t && t !== el && t.contains(el);
    }
    function suivreContour(contourEl) {
        var s = visible(contourEl) ? signatureDe(contourEl) : '';
        if (s === etat.contourSuivi) return;
        etat.contourSuivi = s;
        if (!s || aLAise(contourEl)) return;
        try { contourEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch (e) { contourEl.scrollIntoView(); }
    }

    /** La pulsation autour de ce qu'il faut toucher ; pas sur ce que couvre une palette flottante (11 nov. 2026, capture 25). */
    function poserPulsation(contourEl) {
        var c = etat.elements.contour;
        if (!visible(contourEl) || !seVoit(contourEl)) { c.hidden = true; return; }
        var r = contourEl.getBoundingClientRect();
        c.hidden = false;
        c.style.left = (r.left - 5) + 'px';
        c.style.top = (r.top - 5) + 'px';
        c.style.width = (r.width + 10) + 'px';
        c.style.height = (r.height + 10) + 'px';
    }

    /** Un passage de la sonde : contour, section actuelle, bulle, flèches, puis l'état atteint. */
    function sonder() {
        if (!etat || etat.enTransition) return;
        var etape = etapeCourante();
        if (etat.opts.verifier && !etat.opts.verifier()) { fermer(); return; }
        var zoom = sousLeZoom();
        if (!zoom) {
            suivreSeuil();
            etat.hauteurGardee = window.innerHeight;
        }

        poserGeste(etape);
        suivreComplement(etape);
        poserAvis(etape);
        poserAttentes(etape);
        if (!zoom) suivreEcran(etape);

        var vise = designe(etape);
        var zones = vise.zones;
        var contourEl = etape.contour ? etape.contour() : null;
        if (!zoom) suivreContour(contourEl);
        etat.vus = { zones: zones, contourEl: contourEl, vise: vise };
        etat.passages = (etat.passages || 0) + 1;

        // La couche des flèches : en px, sur la largeur de la mise en page × innerHeight, à chaque passage (le repère du
        // contour et de la bulle). Sous le zoom, elle garde l'écran d'avant : innerHeight n'en est plus que la partie visible.
        var svg = etat.elements.svg;
        if (!zoom) {
            svg.setAttribute('width', String(largeurPage()));
            svg.setAttribute('height', String(window.innerHeight));
            svg.style.width = largeurPage() + 'px';
            svg.style.height = window.innerHeight + 'px';
        }

        poserPulsation(contourEl);
        marquerSectionActuelle(sectionActuelleDe(contourEl));

        if (zoom) {
            // Sous le zoom : rien ne se replace ; les flèches suivent leurs cibles depuis la bulle où elle est.
            dessinerFleches(zones, contourEl, vise);
            if (etape.atteint) suivreAtteint(etape, zones, contourEl, vise);
            return;
        }
        // La découpe suit la largeur de la bulle (une sonde d'étape a pu la changer), avant sa place.
        suivreLargeurDesPages();
        placerSelonEtape(zones, contourEl, vise);
        if (etape.atteint) suivreAtteint(etape, zones, contourEl, vise);
    }

    /**
     * La bulle loin de ce qu'elle évite (ses zones et le contour), puis ses flèches. Sur téléphone, rien ne change : la
     * bulle rangée au bord évite les zones ET le contour.
     */
    function placerSelonEtape(zones, contourEl, vise) {
        var c = visible(contourEl) ? contourEl : null;
        var evites = rectsDe(zones.concat(c ? [c] : []));
        if (etat.telephone) placerBulleTelephone(union(evites), c);
        else placerBulleLoin(zones, prioritaires(c));
        dessinerFleches(zones, contourEl, vise);
    }

    /** Ce que la bulle évite : ses zones, pesées 1, et ce qu'elle ne couvre que faute de mieux, pesé POIDS_CONTOUR. */
    function placerBulleLoin(zones, prio) {
        var autres = zones.filter(function (z) { return prio.indexOf(z) === -1; });
        placerBulle(rectsDe(autres).concat(rectsDe(prio).map(function (r) { return pese(r, POIDS_CONTOUR); })));
    }

    /** Ce que la bulle ne couvre que faute de mieux : le contour, et ce que l'étape déclare dans `aussiEviter`. */
    function prioritaires(c) {
        var etape = etapeCourante();
        var autres = etape && etape.aussiEviter ? (etape.aussiEviter() || []) : [];
        return (c ? [c] : []).concat(autres.filter(Boolean));
    }

    /**
     * L'état atteint : l'étape suivante. Sinon, la sonde d'étape a pu changer la forme de la bulle (le
     * neuvième parcours la pose dans `atteint`) : la découpe et la place suivent dans le même passage,
     * sans image périmée.
     */
    function suivreAtteint(etape, zones, contourEl, vise) {
        var hauteur = etat.elements.bulle.offsetHeight;
        var ok = false;
        try { ok = !!etape.atteint(); } catch (e) { ok = false; }
        if (ok) { allerA(etat.i + 1); return; }
        if (sousLeZoom()) return;
        // La hauteur aussi (10 nov. 2026) : une étape qui fait paraître un bouton à la vérification (« Continuer » du
        // huitième parcours) fait grandir la bulle ; replacée seulement au passage suivant, le bouton sautait sous le
        // doigt (le toucher sur le bouton, le relâcher sur la bulle). Banc : bouton-de-bulle-ne-saute-pas-2026-11-10.
        var largeur = suivreLargeurDesPages();
        if (largeur || etat.elements.bulle.offsetHeight !== hauteur) placerSelonEtape(zones, contourEl, vise);
    }

    /** Prépare la page pour l'étape i (`avant`), puis attend deux images qu'elle soit dessinée. */
    async function preparer(etape, i) {
        try {
            if (etape.avant) await etape.avant();
        } catch (e) {
            console.warn('[parcours] préparation de l’étape ' + (i + 1) + ' :', e);
        }
        await new Promise(function (fin) { requestAnimationFrame(function () { requestAnimationFrame(fin); }); });
    }

    /**
     * Ce que l'étape désigne puis éclaire, pour l'amener dans la vue. Le contour d'abord :
     * si l'ensemble ne tient pas à l'écran, c'est ce qu'il faut toucher qui y est amené.
     */
    function elementsVises(etape) {
        var vise = etape.contour ? [etape.contour()] : [];
        return vise.concat(designe(etape).zones).filter(Boolean);
    }

    async function allerA(i) {
        if (!etat) return;
        if (i >= etat.def.etapes.length) { fermer(); return; }
        etat.enTransition = true;
        etat.i = i;
        if (etat.opts.surEtape) etat.opts.surEtape(i);
        var etape = etapeCourante();
        etat.elements.contour.hidden = true;
        // L'étape suivante reprend le placement automatique ; ses flèches et sa section actuelle seront les siennes.
        etat.deplacee = null;
        etat.glisse = null;
        etat.vus = null;
        effacerFleches();
        marquerSectionActuelle(null);
        await preparer(etape, i);
        // Le parcours a pu être fermé, ou avancé ailleurs, pendant la préparation.
        if (!etat || etat.i !== i) return;
        // Sur téléphone, une étape qui désigne quoi toucher sur la page (un contour) ouvre la bulle
        // repliée ; quand le geste est dans la bulle (« Continuer »), elle s'ouvre dépliée.
        etat.replie = !!etape.contour;
        rendreBulle();
        // L'écran où l'étape s'ouvre (une reprise peut tomber sur le second) : sa page, sans défilement de plus.
        etat.pageDite = etape.pageQuiDit ? (etape.pageQuiDit() || null) : null;
        if (etat.pageDite && pageQuiPorte(etat.pageDite) > 0) montrerPage(pageQuiPorte(etat.pageDite));
        if (!etape.centre || etat.telephone) amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
        retenirContourDOuverture(etape);
        etat.enTransition = false;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        sonder();
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    function surTouche(ev) {
        if (!etat || ev.key !== 'Escape' || etat.def.sansEchap) return;
        var etape = etapeCourante();
        ev.stopPropagation();
        ev.preventDefault();
        if (!etape.sansSortie) quitter();
        else if (etat.opts.surEchap) etat.opts.surEchap(api);
    }

    function surRedimension() { sonder(); }

    function lancer(def, opts) {
        if (etat) fermer();
        retirerElements();
        etat = { def: def, i: 0, opts: opts || {}, elements: creerElements(), enTransition: false,
                 telephone: surTelephone(), replie: false, reglerJusqua: 0, texte: '', pages: [], page: 0, largeurPages: 0,
                 deplacee: null, glisse: null, vus: null, sectionActuelle: null, doigts: 0, hauteurGardee: 0, pageDite: null,
                 contourSuivi: '', complement: [], signatureComplement: '[]', pageComplement: -1 };
        document.body.classList.add('parcours-actif');
        signaler();
        if (window.transitions && typeof window.transitions.fermerBandeau === 'function') window.transitions.fermerBandeau();
        // 9 nov. 2026 : une flèche didactique déjà ouverte se retire, sans être marquée vue (la bulle parle seule).
        if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') window.accompagnement.masquerFleche();
        document.addEventListener('keydown', surTouche, true);
        window.addEventListener('resize', surRedimension);
        // En capture : le défilement d'un conteneur (une fiche, une fenêtre, le canevas) redessine aussi, sans attendre la sonde.
        window.addEventListener('scroll', surRedimension, { passive: true, capture: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', surRedimension);
            window.visualViewport.addEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, arreterReglage, { passive: true, capture: true }); });
        ['touchstart', 'touchend', 'touchcancel'].forEach(function (t) { window.addEventListener(t, compterDoigts, { passive: true, capture: true }); });
        etat.timer = setInterval(sonder, SONDE_MS);
        var depuis = Math.max(0, Math.min((opts && opts.depuis) || 0, def.etapes.length - 1));
        return allerA(depuis);
    }

    function fermer() {
        if (!etat) return;
        clearInterval(etat.timer);
        document.removeEventListener('keydown', surTouche, true);
        window.removeEventListener('resize', surRedimension);
        window.removeEventListener('scroll', surRedimension, { passive: true, capture: true });
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', surRedimension);
            window.visualViewport.removeEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.removeEventListener(t, arreterReglage, { passive: true, capture: true }); });
        ['touchstart', 'touchend', 'touchcancel'].forEach(function (t) { window.removeEventListener(t, compterDoigts, { passive: true, capture: true }); });
        marquerSectionActuelle(null);
        etat = null;
        retirerElements();
        document.documentElement.style.removeProperty('--parcours-reserve-bas');
        document.body.classList.remove('parcours-actif');
        signaler();
    }

    /** Le signal du moteur (voir « LE SIGNAL ») : lancé ou fermé. */
    function signaler() {
        try { document.dispatchEvent(new CustomEvent('parcoursMoteur', { detail: { actif: !!etat } })); } catch (e) { /* rien à dire */ }
    }

    function quitter() {
        if (!etat) return;
        var rappel = etat.opts.surQuitter;
        var i = etat.i;
        fermer();
        if (rappel) rappel(i);
    }

    var api = {
        lancer: lancer,
        fermer: fermer,
        quitter: quitter,
        actif: function () { return !!etat; },
        etapeCourante: function () { return etat ? etat.i : null; },
        // Le parcours joué est-il celui-là ? Pour les gardes d'une définition (un écouteur à elle, hors de l'étape).
        joue: function (def) { return !!etat && etat.def === def; },
        // Les bulles en pages : la page affichée et leur nombre (0 et 1 quand le texte tient).
        pageCourante: function () { return etat ? { page: etat.page, pages: etat.pages.length, largeur: etat.largeurPages } : null; },
        allerA: function (i) { return allerA(i); },
        // Utilitaires pour les définitions de parcours.
        visible: visible,
        seVoit: seVoit,
        premierVisible: premierVisible,
        surTelephone: surTelephone,
        mouvementReduit: mouvementReduit,
        // La géométrie des flèches et du déplacement, en fonctions pures (tests/unit).
        geometrie: { tracerFleche: tracerFleche, grouperCibles: grouperCibles, bornerDeplacement: bornerDeplacement, placerLoin: placerLoin },
        // Pour le relevé des bancs (tests/integration/harness/releve-bulle.js) : ce que l'étape désigne, la bulle
        // déplacée ou non, l'écran utile. Lecture seule.
        placement: function () {
            if (!etat || !etat.vus) return null;
            return { zones: etat.vus.zones.slice(), contour: etat.vus.contourEl, prioritaires: prioritaires(etat.vus.contourEl),
                     deplacee: !!etat.deplacee, passages: etat.passages || 0, zoom: sousLeZoom(),
                     telephone: etat.telephone, cadre: cadreUtile() };
        }
    };

    window.ParcoursMoteur = api;
})();
