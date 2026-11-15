/* =================================================================
   LE PANNEAU « ASSISTANCE » — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md ; esquisse 73, validée.

   Une seule entrée du menu, « Assistance », remplace « Visite guidée » et la ligne à
   interrupteur. Elle porte en petit le rang du parcours en cours ou à venir (« 2 sur 3 »),
   plus rien quand tout est fait, et ouvre ce panneau : « Aide dans les pages » et
   l'interrupteur d'avant (même préférence ; en haut depuis le 10 nov. 2026), puis les
   parcours, reliés comme des étapes.

   Les parcours s'inscrivent eux-mêmes, dans l'ordre (Assistance.enregistrer) : la liste
   est construite pour qu'un troisième s'y ajoute avec son lot, sans toucher à ce fichier.
   Lot du neuvième parcours (8 nov. 2026, nuit) : deux champs facultatifs d'une définition,
   `rang` (sa place, même si ceux d'avant ne sont pas livrés) et `refus()` (le motif qui
   empêche de le lancer, dit dans le panneau).
   Leur état vit dans UNE préférence, `parcoursAssistance` :
     { <id>: { etat: 'a-faire' | 'en-cours' | 'fait', etape: <index de 0> } }
   Rien ne démarre de lui-même : un parcours se lance par « Commencer », « Reprendre »
   ou « Refaire ».

   LE REFUS MONTRE OÙ COMMENCER (Grégoire, 11 nov. 2026, sur l'iPad : le toucher semblait ne rien faire) : une
   définition déclare `prealable` (l'id du parcours qu'il faut avoir fait, ou une fonction du motif qui le rend) ;
   au refus, la pulsation des parcours va sur le bouton du premier parcours non fait de la chaîne des préalables.
   Le motif reste dessous, mot pour mot ; lui ne pulse pas, on ne le touche pas.

   LES DEUX TEMPS (décisions de Grégoire, 11, 12 et 14 nov. 2026) : un parcours se fait d'abord dans la démo, avec le
   matériel de la démo (la Modélisation), puis sur ses vraies données (la Pratique guidée). Une définition déclare
   `lancerModele()` et `totalModele` quand elle a sa Modélisation : sa carte porte alors DEUX états, un par temps
   (à faire, en cours, fait), chacun avec son bouton (« Commencer », « Reprendre », « Refaire »). Sans Modélisation,
   la carte est celle d'avant : un état, un bouton. Le choix unique « Modélisation / Pratique guidée » du 12 nov. est
   retiré (14 nov., 9 h 21 : deux états par parcours).
   L'état des Modélisations reste sur l'appareil (`localStorage`, clé `laboCodex.assistance`, HORS de `db`, comme
   `laboCodex.vue`) : ce qu'on fait dans la démo n'écrit rien dans les données.
   « REFAIRE » (15 nov. 2026) : celui d'une Pratique guidée rejoue le parcours EN VISITE (js/parcours-moteur.js : rien
   ne s'écrit). Celui d'une Modélisation rejoue ses gestes dans la démo (Grégoire, 14 nov., 10 h 56). Pour cela la démo
   revient à son état de départ : elle est REMISE À NEUF, après une confirmation qui le dit, et les modèles se rejouent
   depuis le premier (le modèle d'« Évaluer » se joue sur le groupe que monte celui de « Mettre ta classe en place » :
   défaire un modèle sans défaire ceux qui en dépendent laisserait la démo dans un état qu'aucun modèle n'a produit).
   « Remettre la démo à neuf » (Grégoire, 12 nov., 8 h 15) reste offert sous « Tes parcours ».

   Un parcours qui déclare `grandEcranSeulement: true` (lot « La bulle sur téléphone »,
   9 nov. 2026) n'est pas proposé sur téléphone (ParcoursMoteur.surTelephone, 500 px) : sous son
   titre, le texte validé par Grégoire, et son bouton ne lance rien.
   ================================================================= */
(function () {
    'use strict';

    var CLE_PREF = 'parcoursAssistance';
    // Validé par Grégoire le 9 nov. 2026 (Cowork), mot pour mot.
    var TEXTE_GRAND_ECRAN = 'Ce parcours se fait sur un écran plus grand : une tablette ou un ordinateur.';

    function tropPetitPour(def) {
        return !!def.grandEcranSeulement && surTelephone();
    }
    var registre = [];
    var focusAvant = null;

    // ---------- L'état des Modélisations : sur l'appareil, hors des données ----------

    var CLE_APPAREIL = 'laboCodex.assistance';
    // Décidés par Grégoire (12 nov. 2026, 14 h 46 à 15 h 08), mot pour mot : le nom, et dessous, en plus petit, le matériel.
    var MOTS_TEMPS = {
        modele: { nom: 'Modélisation', sous: 'avec le matériel de la démo' },
        pratique: { nom: 'Pratique guidée', sous: 'avec mon matériel' }
    };
    var MOTS_NEUF = {
        bouton: 'Remettre la démo à neuf',
        question: 'Tout ce que tu as fait dans la démo s\'efface : ce que tu y as créé, modifié, évalué ou importé. '
            + 'La démo revient telle qu\'elle était au départ. Tes données, elles, ne bougent pas.',
        confirmer: 'Remettre à neuf',
        fait: 'La démo est remise à neuf.',
        rate: 'La démo n\'a pas pu être remise à neuf. Rien n\'a été effacé.'
    };
    // « Refaire » une Modélisation (15 nov. 2026) : textes PROPOSÉS, lus par l'enseignant·e.
    var MOTS_REFAIRE = {
        titre: 'Refaire ce modèle',
        seul: 'Pour refaire ce modèle, la démo est remise à neuf : tout ce que tu y as fait s\'efface. '
            + 'Tes données, elles, ne bougent pas.',
        depuis: function (titre) {
            return 'Pour refaire ce modèle, la démo est remise à neuf : tout ce que tu y as fait s\'efface, et les modèles '
                + 'se rejouent depuis le premier, « ' + titre + ' ». Tes données, elles, ne bougent pas.';
        },
        confirmer: 'Remettre à neuf et refaire'
    };

    var appareil = null; // relu une fois ; le repli quand le stockage refuse l'écriture

    function etatAppareil() {
        if (appareil) return appareil;
        try {
            var v = JSON.parse(localStorage.getItem(CLE_APPAREIL) || 'null');
            appareil = v && typeof v === 'object' ? v : {};
        } catch (e) { appareil = {}; }
        return appareil;
    }

    function ecrireAppareil(v) {
        appareil = v;
        try { localStorage.setItem(CLE_APPAREIL, JSON.stringify(v)); } catch (e) { /* stockage indisponible : le choix vaut pour la page */ }
    }

    function etatModeleDe(id) {
        var e = (etatAppareil().modeles || {})[id];
        if (!e || (e.etat !== 'en-cours' && e.etat !== 'fait')) return { etat: 'a-faire', etape: 0 };
        return { etat: e.etat, etape: typeof e.etape === 'number' ? e.etape : 0 };
    }

    function definirEtatModele(id, etatParcours, etape) {
        var modeles = Object.assign({}, etatAppareil().modeles || {});
        modeles[id] = { etat: etatParcours, etape: etape || 0 };
        ecrireAppareil(Object.assign({}, etatAppareil(), { modeles: modeles }));
    }

    /** La démo remise à neuf : ses modélisations sont à refaire. */
    function oublierModeles() {
        ecrireAppareil(Object.assign({}, etatAppareil(), { modeles: {} }));
    }

    /** Le premier parcours qui a sa Modélisation : celui d'où les modèles se rejouent. */
    function premierModele() {
        return registre.find(function (p) { return typeof p.lancerModele === 'function'; }) || null;
    }

    function lireTout() {
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_PREF) : null;
        return v && typeof v === 'object' ? v : {};
    }

    function etatDe(id) {
        var e = lireTout()[id];
        if (!e || (e.etat !== 'en-cours' && e.etat !== 'fait')) return { etat: 'a-faire', etape: 0 };
        return { etat: e.etat, etape: typeof e.etape === 'number' ? e.etape : 0 };
    }

    function definirEtat(id, etatParcours, etape) {
        var tout = Object.assign({}, lireTout());
        tout[id] = { etat: etatParcours, etape: etape || 0 };
        if (typeof definirPreference === 'function') definirPreference(CLE_PREF, tout);
        majMenu();
    }

    /**
     * Le rang d'un parcours dans la liste. Un parcours qui déclare `rang` (le neuvième, lot du 8 nov.) garde sa
     * place même quand ceux d'avant ne sont pas encore livrés : la liste suit les rangs, le compte du menu aussi.
     * Sans `rang`, l'ordre d'inscription.
     */
    var rangs = {};

    function rangDe(def) {
        return rangs[def.id];
    }

    function totalParcours() {
        return registre.reduce(function (n, def) { return Math.max(n, rangDe(def)); }, registre.length);
    }

    function enregistrer(def) {
        if (registre.some(function (p) { return p.id === def.id; })) return;
        rangs[def.id] = typeof def.rang === 'number' ? def.rang : registre.length + 1;
        registre.push(def);
        registre.sort(function (a, b) { return rangDe(a) - rangDe(b); });
        majMenu();
    }

    /** Le rang du parcours en cours (le premier), sinon du premier à faire ; rien si tout est fait. */
    function rangAAfficher() {
        if (!registre.length) return '';
        var idx = -1;
        for (var k = 0; k < registre.length; k++) {
            if (etatDe(registre[k].id).etat === 'en-cours') { idx = k; break; }
        }
        if (idx === -1) {
            for (var j = 0; j < registre.length; j++) {
                if (etatDe(registre[j].id).etat !== 'fait') { idx = j; break; }
            }
        }
        return idx === -1 ? '' : rangDe(registre[idx]) + ' sur ' + totalParcours();
    }

    function majMenu() {
        var el = document.getElementById('assistance-menu-rang');
        if (el) el.textContent = rangAAfficher();
    }

    // ---------- Le panneau ----------

    function hautEntete() {
        var e = document.querySelector('header.entete');
        return e ? Math.max(0, e.getBoundingClientRect().bottom) : 0;
    }

    function libelleDuBouton(e) {
        return e.etat === 'fait' ? 'Refaire' : e.etat === 'en-cours' ? 'Reprendre' : 'Commencer';
    }

    function etatDit(e, total) {
        return e.etat === 'fait' ? 'Fait' : e.etat === 'en-cours' ? 'Étape ' + (e.etape + 1) + ' sur ' + total : 'À faire';
    }

    /**
     * Le bouton de la Pratique guidée (et d'un parcours sans Modélisation) : « Commencer », « Reprendre » ou
     * « Refaire ». Le parcours fait se rejoue en visite : sa définition le décide (`lancer`).
     */
    function creerBoutonParcours(def, o) {
        var e = o.etat, refuse = o.refuse;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assistance-parcours-bouton' + (e.etat === 'en-cours' ? ' assistance-parcours-bouton--plein' : '');
        btn.textContent = libelleDuBouton(e);
        btn.setAttribute('aria-describedby', o.titre.id + (o.temps ? ' ' + o.temps.id : '') + (refuse ? ' assistance-parcours-grand-ecran-' + def.id : ''));
        // Sur téléphone, un parcours pour grand écran : le bouton reste lisible, il ne lance rien.
        if (refuse) btn.setAttribute('aria-disabled', 'true');
        btn.addEventListener('click', function () {
            if (tropPetitPour(def)) return;
            // La condition d'entrée d'un parcours (`refus`, lot du septième parcours, 9 nov. 2026) :
            // lue dans les données au toucher. Refusé, le parcours ne part pas : le panneau reste
            // ouvert et dit pourquoi, sous le bouton.
            var raison = typeof def.refus === 'function' ? def.refus() : null;
            if (raison) { direRefus(o.corps, raison); appelerPrealable(def, raison); return; }
            var depuis = e.etat === 'en-cours' ? e.etape : 0;
            fermerPanneau({ sansRetourFocus: true });
            def.lancer(depuis);
        });
        return btn;
    }

    /**
     * Le bouton de la Modélisation. Elle se joue dans la démo : les conditions d'entrée (`refus`) lisent les vraies
     * données, elles ne la concernent pas. Elle a la sienne (`refusModele`, 13 nov. 2026) : le modèle d'« Évaluer » se
     * joue sur le groupe que monte celui de « Mettre ta classe en place ». Faite, « Refaire » rejoue ses gestes : la
     * démo est d'abord remise à neuf (`refaireModele`).
     */
    function creerBoutonModele(def, o) {
        var e = o.etat, refuse = o.refuse;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assistance-modele-bouton' + (e.etat === 'en-cours' ? ' assistance-parcours-bouton--plein' : '');
        btn.textContent = libelleDuBouton(e);
        btn.setAttribute('aria-describedby', o.titre.id + ' ' + o.temps.id + (refuse ? ' assistance-parcours-grand-ecran-' + def.id : ''));
        if (refuse) btn.setAttribute('aria-disabled', 'true');
        btn.addEventListener('click', function () {
            if (tropPetitPour(def)) return;
            if (e.etat === 'fait') { refaireModele(def); return; }
            var raison = typeof def.refusModele === 'function' ? def.refusModele() : null;
            if (raison) { direRefus(o.corps, raison); appelerPrealable(def, raison, true); return; }
            fermerPanneau({ sansRetourFocus: true });
            def.lancerModele();
        });
        return btn;
    }

    /** Un temps d'une carte à deux temps : son nom, son matériel, son état, son bouton. */
    function creerTemps(def, quel, e, total, bouton) {
        var bloc = document.createElement('div');
        bloc.className = 'assistance-temps';
        bloc.dataset.temps = quel;
        bloc.dataset.etat = e.etat;
        var mots = document.createElement('p');
        mots.className = 'assistance-temps-mots';
        mots.id = 'assistance-temps-' + quel + '-' + def.id;
        ['nom', 'sous'].forEach(function (partie) {
            var sp = document.createElement('span');
            sp.className = 'assistance-temps-' + partie;
            sp.textContent = MOTS_TEMPS[quel][partie];
            mots.appendChild(sp);
            mots.appendChild(document.createTextNode(' '));
        });
        var etatTxt = document.createElement('span');
        // L'état de la Pratique guidée garde la classe de l'état d'une carte à un temps : c'est le même état.
        etatTxt.className = quel === 'pratique' ? 'assistance-parcours-etat' : 'assistance-modele-etat';
        etatTxt.textContent = etatDit(e, total);
        bloc.appendChild(mots);
        bloc.appendChild(etatTxt);
        bloc.appendChild(bouton(mots));
        return bloc;
    }

    function creerParcoursItem(def) {
        var aModele = typeof def.lancerModele === 'function';
        var e = etatDe(def.id);
        var li = document.createElement('li');
        li.className = 'assistance-parcours-item';
        // L'état de la carte est celui du parcours sur les vraies données (le rang du menu le lit aussi).
        li.dataset.etat = e.etat;
        li.dataset.parcours = def.id;

        var pastille = document.createElement('span');
        pastille.className = 'assistance-pastille';
        pastille.setAttribute('aria-hidden', 'true');
        if (e.etat === 'fait') {
            pastille.textContent = '✓';
        } else {
            pastille.textContent = String(rangDe(def));
        }
        li.appendChild(pastille);

        var corps = document.createElement('div');
        corps.className = 'assistance-parcours-corps';

        var l1 = document.createElement('div');
        l1.className = 'assistance-parcours-ligne1';
        var h = document.createElement('h3');
        h.className = 'assistance-parcours-titre';
        h.id = 'assistance-parcours-titre-' + def.id;
        h.textContent = def.titre;
        l1.appendChild(h);
        if (!aModele) {
            var etatTxt = document.createElement('span');
            etatTxt.className = 'assistance-parcours-etat';
            etatTxt.textContent = etatDit(e, def.total);
            l1.appendChild(etatTxt);
        }
        corps.appendChild(l1);

        // Lu à la construction pour l'affichage ; relu au toucher (la fenêtre a pu changer de largeur),
        // et la liste se redessine quand le seuil est franchi panneau ouvert (rafraichirListe).
        var refuse = tropPetitPour(def);
        if (refuse) {
            li.dataset.ecran = 'trop-petit';
            var avisEcran = document.createElement('p');
            avisEcran.className = 'assistance-parcours-grand-ecran';
            avisEcran.id = 'assistance-parcours-grand-ecran-' + def.id;
            avisEcran.textContent = TEXTE_GRAND_ECRAN;
            corps.appendChild(avisEcran);
        }

        // Parcours 3 : sa ligne n'est pas encore validée par Grégoire ; sans ligne, rien ne s'écrit.
        if (def.ligne) {
            var p = document.createElement('p');
            p.className = 'assistance-parcours-ligne';
            p.textContent = def.ligne;
            corps.appendChild(p);
        }

        if (!aModele) {
            corps.appendChild(creerBoutonParcours(def, { etat: e, refuse: refuse, titre: h, corps: corps }));
        } else {
            // Deux temps, deux états, chacun son bouton (Grégoire, 14 nov. 2026, 9 h 21).
            li.dataset.temps = 'deux';
            var em = etatModeleDe(def.id);
            corps.appendChild(creerTemps(def, 'modele', em, def.totalModele, function (mots) {
                return creerBoutonModele(def, { etat: em, refuse: refuse, titre: h, temps: mots, corps: corps });
            }));
            corps.appendChild(creerTemps(def, 'pratique', e, def.total, function (mots) {
                return creerBoutonParcours(def, { etat: e, refuse: refuse, titre: h, temps: mots, corps: corps });
            }));
        }

        li.appendChild(corps);
        return li;
    }

    var listeTelephone = null; // la largeur (téléphone ou non) pour laquelle la liste est dessinée

    function surTelephone() {
        return !!window.ParcoursMoteur && typeof window.ParcoursMoteur.surTelephone === 'function'
            && window.ParcoursMoteur.surTelephone();
    }

    function remplirListe(liste) {
        liste.textContent = '';
        listeTelephone = surTelephone();
        registre.forEach(function (def) { liste.appendChild(creerParcoursItem(def)); });
    }

    /** Panneau ouvert, la fenêtre franchit le seuil du téléphone : la liste suit (refus, bouton). */
    function rafraichirListe() {
        var liste = document.getElementById('assistance-parcours-liste');
        if (!liste || surTelephone() === listeTelephone) return;
        var focusDedans = liste.contains(document.activeElement)
            ? document.activeElement.closest('[data-parcours]') : null;
        var id = focusDedans ? focusDedans.dataset.parcours : null;
        remplirListe(liste);
        if (id) {
            var b = liste.querySelector('[data-parcours="' + id + '"] .assistance-parcours-bouton');
            if (b) b.focus();
        }
    }

    /** Ce que dit le panneau quand un parcours ne peut pas partir : sous son bouton, annoncé (role status). */
    function direRefus(corps, texte) {
        var p = corps.querySelector('.assistance-parcours-refus');
        if (!p) {
            p = document.createElement('p');
            p.className = 'assistance-parcours-refus';
            p.setAttribute('role', 'status');
            corps.appendChild(p);
        }
        p.textContent = texte;
    }

    function definitionDe(id) {
        return registre.find(function (p) { return p.id === id; }) || null;
    }

    function prealableDe(def, raison) {
        if (!def) return null;
        return (typeof def.prealable === 'function' ? def.prealable(raison) : def.prealable) || null;
    }

    /**
     * Le parcours à faire d'abord : le premier non fait de la chaîne des préalables, en partant de sa racine. Une
     * chaîne toute faite (les données ont pu changer depuis) : le préalable direct. Rien si aucun n'est déclaré.
     */
    function parcoursAFaireDAbord(def, raison) {
        var chaine = [];
        var id = prealableDe(def, raison);
        while (id && chaine.indexOf(id) === -1 && definitionDe(id)) {
            chaine.unshift(id);
            id = prealableDe(definitionDe(id));
        }
        if (!chaine.length) return null;
        return chaine.find(function (x) { return etatDe(x).etat !== 'fait'; }) || chaine[chaine.length - 1];
    }

    /** Au refus : la pulsation sur le bouton du parcours à faire d'abord, et sur lui seul. */
    function appelerPrealable(def, raison, modele) {
        var liste = document.getElementById('assistance-parcours-liste');
        if (!liste) return;
        [].forEach.call(liste.querySelectorAll('.assistance-parcours-bouton--appel'), function (b) {
            b.classList.remove('assistance-parcours-bouton--appel');
        });
        // Une Modélisation refusée appelle la Modélisation à faire d'abord (son préalable direct), pas la Pratique guidée.
        var id = modele ? prealableDe(def, raison) : parcoursAFaireDAbord(def, raison);
        var b = id ? liste.querySelector('[data-parcours="' + id + '"] ' + (modele ? '.assistance-modele-bouton' : '.assistance-parcours-bouton')) : null;
        if (!b) return;
        b.classList.add('assistance-parcours-bouton--appel');
        if (typeof b.scrollIntoView === 'function') b.scrollIntoView({ block: 'nearest' });
    }

    // ---------- La présentation en quatre temps ----------
    // Texte de Grégoire (14 nov. 2026, 9 h 21 et 10 h 58, validé) ; les chiffres visibles : décision de Cowork.

    var QUATRE_TEMPS = {
        titre: "Apprendre l'application, en quatre temps.",
        temps: [
            ['1. Découvrir par toi-même :', 'explore la démo et son groupe fictif.'],
            ['2. Modélisation :', 'un parcours te guide, avec le matériel de la démo.'],
            ['3. Pratique guidée :', 'refais le parcours avec ton matériel.'],
            ['4. Continuer en autonomie :', "l'aide dans les pages reste là."]
        ]
    };

    /** L'espace insécable du français, devant les deux-points et dans les guillemets. */
    function typo(t) {
        return String(t).replace(/ :/g, '\u00a0:').replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»');
    }

    function grasPuisTexte(balise, gras, texte) {
        var el = document.createElement(balise);
        var b = document.createElement('strong');
        b.textContent = typo(gras);
        el.appendChild(b);
        if (texte) el.appendChild(document.createTextNode(' ' + typo(texte)));
        return el;
    }

    function construireIntro() {
        var intro = document.createElement('div');
        intro.className = 'assistance-intro';
        var tete = grasPuisTexte('p', QUATRE_TEMPS.titre, '');
        tete.className = 'assistance-intro-titre';
        intro.appendChild(tete);
        var ol = document.createElement('ul');
        ol.className = 'assistance-intro-temps';
        QUATRE_TEMPS.temps.forEach(function (t) { ol.appendChild(grasPuisTexte('li', t[0], t[1])); });
        intro.appendChild(ol);
        return intro;
    }

    // ---------- « Remettre la démo à neuf », et « Refaire » une Modélisation ----------

    async function remettreANeuf() {
        var accepte = await window.uiDialogues.confirmerAction({
            titre: MOTS_NEUF.bouton,
            message: typo(MOTS_NEUF.question),
            texteAnnuler: 'Annuler',
            texteConfirmer: MOTS_NEUF.confirmer,
            variante: 'danger'   // « Annuler » a le focus ; Entrée le suit
        });
        if (accepte !== true || typeof window.remettreDemoANeuf !== 'function') return;
        fermerPanneau({ sansRetourFocus: true });
        await remettreEtDire();
    }

    /** La démo remise à neuf, ses Modélisations oubliées, et le mot qui le dit. @returns {Promise<boolean>} */
    async function remettreEtDire() {
        var fait = await window.remettreDemoANeuf();
        if (fait) oublierModeles();
        if (window.notifications) {
            if (fait && typeof window.notifications.succes === 'function') window.notifications.succes(MOTS_NEUF.fait);
            if (!fait && typeof window.notifications.warning === 'function') window.notifications.warning(MOTS_NEUF.bouton, MOTS_NEUF.rate);
        }
        return !!fait;
    }

    /**
     * « Refaire » une Modélisation faite (voir « REFAIRE », en tête) : une confirmation dit que la démo sera remise à
     * neuf et d'où les modèles se rejouent ; acceptée, la démo est remise à neuf et le PREMIER modèle part, gestes
     * compris. Refusée, ou la remise à neuf ratée : rien ne change, rien ne part. Rien ne sort jamais de la démo.
     */
    async function refaireModele(def) {
        var premier = premierModele();
        if (!premier || typeof window.remettreDemoANeuf !== 'function') return;
        var accepte = await window.uiDialogues.confirmerAction({
            titre: MOTS_REFAIRE.titre,
            message: typo(premier.id === def.id ? MOTS_REFAIRE.seul : MOTS_REFAIRE.depuis(premier.titre)),
            texteAnnuler: 'Annuler',
            texteConfirmer: MOTS_REFAIRE.confirmer,
            variante: 'danger'   // « Annuler » a le focus ; Entrée le suit
        });
        if (accepte !== true) return;
        fermerPanneau({ sansRetourFocus: true });
        if (!(await remettreEtDire())) return;
        premier.lancerModele();
    }

    function construireBoutonNeuf() {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'assistance-demo-neuf';
        b.id = 'assistance-demo-neuf';
        b.textContent = MOTS_NEUF.bouton;
        b.addEventListener('click', function () { remettreANeuf(); });
        return b;
    }

    function construirePanneau() {
        var voile = document.createElement('div');
        voile.className = 'assistance-voile';
        voile.id = 'assistance-voile';
        voile.addEventListener('click', function () { fermerPanneau(); });

        var panneau = document.createElement('aside');
        panneau.className = 'assistance-panneau est-entrant';
        panneau.id = 'panneau-assistance';
        panneau.setAttribute('role', 'dialog');
        panneau.setAttribute('aria-modal', 'true');
        panneau.setAttribute('aria-labelledby', 'assistance-titre');

        var tete = document.createElement('div');
        tete.className = 'assistance-tete';
        var h = document.createElement('h2');
        h.className = 'assistance-titre';
        h.id = 'assistance-titre';
        h.textContent = 'Assistance';
        var fermerBtn = document.createElement('button');
        fermerBtn.type = 'button';
        fermerBtn.className = 'assistance-fermer';
        fermerBtn.setAttribute('aria-label', 'Fermer');
        var img = document.createElement('img');
        img.src = 'icons/icon-close-window.svg';
        img.alt = '';
        img.className = 'modal-close-icon';
        fermerBtn.appendChild(img);
        fermerBtn.addEventListener('click', function () { fermerPanneau(); });
        tete.appendChild(h);
        tete.appendChild(fermerBtn);
        panneau.appendChild(tete);

        panneau.appendChild(construireIntro());

        // 10 nov. 2026 (Grégoire, 20 h, sur captures) : « Aide dans les pages » monte en haut du panneau,
        // juste sous la présentation, avant « Tes parcours ». Aucun mot ne change ; le filet sépare.
        var aide = document.createElement('div');
        aide.className = 'assistance-aide';
        var aideTexte = document.createElement('div');
        aideTexte.className = 'assistance-aide-texte';
        var aideTitre = document.createElement('p');
        aideTitre.className = 'assistance-aide-titre';
        aideTitre.id = 'assistance-aide-titre';
        aideTitre.textContent = 'Aide dans les pages';
        var aideLigne = document.createElement('p');
        aideLigne.className = 'assistance-aide-ligne';
        aideLigne.id = 'assistance-aide-ligne';
        aideLigne.textContent = 'Infobulles et flèches qui expliquent ce que tu touches.';
        aideTexte.appendChild(aideTitre);
        aideTexte.appendChild(aideLigne);
        var inter = document.createElement('button');
        inter.type = 'button';
        inter.id = 'assistance-interrupteur';
        inter.className = 'assistance-interrupteur';
        inter.setAttribute('role', 'switch');
        inter.setAttribute('aria-labelledby', 'assistance-aide-titre');
        inter.setAttribute('aria-describedby', 'assistance-aide-ligne');
        inter.addEventListener('click', function () {
            if (typeof window.basculerAssistance === 'function') window.basculerAssistance();
        });
        aide.appendChild(aideTexte);
        aide.appendChild(inter);
        panneau.appendChild(aide);

        var filet = document.createElement('div');
        filet.className = 'assistance-filet';
        filet.setAttribute('aria-hidden', 'true');
        panneau.appendChild(filet);

        var intitule = document.createElement('p');
        intitule.className = 'assistance-intitule';
        intitule.id = 'assistance-intitule';
        intitule.textContent = 'Tes parcours';
        panneau.appendChild(intitule);

        // La remise à neuf de la démo (12 nov. 2026), au-dessus de la liste.
        panneau.appendChild(construireBoutonNeuf());

        var liste = document.createElement('ol');
        liste.className = 'assistance-parcours';
        liste.id = 'assistance-parcours-liste';
        liste.setAttribute('aria-labelledby', 'assistance-intitule');
        remplirListe(liste);
        panneau.appendChild(liste);


        panneau.addEventListener('keydown', pieger);
        return { voile: voile, panneau: panneau };
    }

    /** Le focus reste dans le panneau tant qu'il est ouvert (aria-modal). */
    function pieger(ev) {
        if (ev.key === 'Escape') { ev.stopPropagation(); fermerPanneau(); return; }
        if (ev.key !== 'Tab') return;
        var p = document.getElementById('panneau-assistance');
        var f = [].slice.call(p.querySelectorAll('button:not([disabled])'));
        if (!f.length) return;
        var premier = f[0], dernier = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === premier) { ev.preventDefault(); dernier.focus(); }
        else if (!ev.shiftKey && document.activeElement === dernier) { ev.preventDefault(); premier.focus(); }
    }

    function surEchapDocument(ev) {
        if (ev.key === 'Escape' && document.getElementById('panneau-assistance')) {
            ev.stopPropagation();
            fermerPanneau();
        }
    }

    function ouvrirPanneau() {
        fermerPanneau({ sansRetourFocus: true });
        // Le menu à trois traits se referme : le panneau prend sa place.
        var menu = document.getElementById('entete-menu-panneau');
        var menuBtn = document.getElementById('entete-menu-bouton');
        if (menu && !menu.hidden) {
            menu.hidden = true;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
        // Le focus revient où il était ; s'il était dans le menu (refermé), au bouton du menu.
        var actif = document.activeElement;
        focusAvant = actif && actif !== document.body && !(menu && menu.contains(actif)) ? actif : menuBtn;
        var els = construirePanneau();
        // Sous l'en-tête : sa hauteur change avec la largeur (la bande du groupe, l'iPhone).
        els.voile.style.top = els.panneau.style.top = hautEntete() + 'px';
        document.body.appendChild(els.voile);
        document.body.appendChild(els.panneau);
        if (typeof window.synchroniserControlesAssistance === 'function') window.synchroniserControlesAssistance();
        document.addEventListener('keydown', surEchapDocument, true);
        window.addEventListener('resize', rafraichirListe);
        requestAnimationFrame(function () { els.panneau.classList.remove('est-entrant'); });
        var titre = els.panneau.querySelector('.assistance-fermer');
        if (titre) titre.focus();
    }

    function fermerPanneau(opts) {
        var p = document.getElementById('panneau-assistance');
        var v = document.getElementById('assistance-voile');
        document.removeEventListener('keydown', surEchapDocument, true);
        window.removeEventListener('resize', rafraichirListe);
        if (!p && !v) return;
        if (p) p.remove();
        if (v) v.remove();
        if (!(opts && opts.sansRetourFocus) && focusAvant && focusAvant.isConnected) {
            try { focusAvant.focus(); } catch (e) { /* rien */ }
        }
        focusAvant = null;
    }

    /** Le parcours qui suit `id` dans la liste (rien : c'était le dernier). */
    function suivantDe(id) {
        var k = registre.findIndex(function (p) { return p.id === id; });
        return k !== -1 && registre[k + 1] ? registre[k + 1] : null;
    }

    /**
     * Lance un parcours comme le fait son bouton dans le panneau (« Parcours suivant », à la fin d'un parcours,
     * 14 nov. 2026) : mêmes gardes. Refusé (l'écran trop petit, la condition d'entrée), il ne part pas : le panneau
     * s'ouvre et dit pourquoi, sous son bouton.
     * @returns {boolean} true s'il est parti
     */
    function lancerParcours(id) {
        var def = definitionDe(id);
        if (!def) return false;
        var petit = tropPetitPour(def);
        var raison = petit ? null : (typeof def.refus === 'function' ? def.refus() : null);
        if (petit || raison) {
            ouvrirPanneau();
            var corps = document.querySelector('#panneau-assistance [data-parcours="' + id + '"] .assistance-parcours-corps');
            if (corps && raison) { direRefus(corps, raison); appelerPrealable(def, raison); }
            return false;
        }
        var e = etatDe(id);
        fermerPanneau({ sansRetourFocus: true });
        def.lancer(e.etat === 'en-cours' ? e.etape : 0);
        return true;
    }

    window.Assistance = {
        suivantDe: suivantDe,
        lancerParcours: lancerParcours,
        enregistrer: enregistrer,
        etatDe: etatDe,
        definirEtat: definirEtat,
        ouvrirPanneau: ouvrirPanneau,
        fermerPanneau: fermerPanneau,
        majMenu: majMenu,
        // Les deux temps (12 nov. 2026) : l'état des Modélisations (sur l'appareil).
        etatModeleDe: etatModeleDe,
        definirEtatModele: definirEtatModele,
        parcours: function () { return registre.slice(); }
    };
    // Le dispatcher data-action de main.js : le menu, « À propos », l'aide de la visite.
    window.ouvrirPanneauAssistance = ouvrirPanneau;

    // Les préférences se lisent après le démarrage : le rang se recalcule aussi à chaque section.
    window.addEventListener('sectionAffichee', majMenu);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', majMenu);
    else majMenu();
})();
