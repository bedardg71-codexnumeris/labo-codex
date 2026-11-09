/* =================================================================
   LE PANNEAU « ASSISTANCE » — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md ; esquisse 73, validée.

   Une seule entrée du menu, « Assistance », remplace « Visite guidée » et la ligne à
   interrupteur. Elle porte en petit le rang du parcours en cours ou à venir (« 2 sur 3 »),
   plus rien quand tout est fait, et ouvre ce panneau : les parcours, reliés comme des
   étapes, puis « Aide dans les pages » et l'interrupteur d'avant (même préférence).

   Les parcours s'inscrivent eux-mêmes, dans l'ordre (Assistance.enregistrer) : la liste
   est construite pour qu'un troisième s'y ajoute avec son lot, sans toucher à ce fichier.
   Lot du neuvième parcours (8 nov. 2026, nuit) : deux champs facultatifs d'une définition,
   `rang` (sa place, même si ceux d'avant ne sont pas livrés) et `refus()` (le motif qui
   empêche de le lancer, dit dans le panneau).
   Leur état vit dans UNE préférence, `parcoursAssistance` :
     { <id>: { etat: 'a-faire' | 'en-cours' | 'fait', etape: <index de 0> } }
   Rien ne démarre de lui-même : un parcours se lance par « Commencer », « Reprendre »
   ou « Refaire ».
   ================================================================= */
(function () {
    'use strict';

    var CLE_PREF = 'parcoursAssistance';
    var registre = [];
    var focusAvant = null;

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

    function creerParcoursItem(def) {
        var e = etatDe(def.id);
        var li = document.createElement('li');
        li.className = 'assistance-parcours-item';
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
        var etatTxt = document.createElement('span');
        etatTxt.className = 'assistance-parcours-etat';
        etatTxt.textContent = e.etat === 'fait' ? 'Fait'
            : e.etat === 'en-cours' ? 'Étape ' + (e.etape + 1) + ' sur ' + def.total
            : 'À faire';
        l1.appendChild(h);
        l1.appendChild(etatTxt);
        corps.appendChild(l1);

        var p = document.createElement('p');
        p.className = 'assistance-parcours-ligne';
        p.textContent = def.ligne;
        corps.appendChild(p);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assistance-parcours-bouton' + (e.etat === 'en-cours' ? ' assistance-parcours-bouton--plein' : '');
        btn.textContent = e.etat === 'fait' ? 'Refaire' : e.etat === 'en-cours' ? 'Reprendre' : 'Commencer';
        btn.setAttribute('aria-describedby', h.id);
        // Un parcours qui suppose des données (`refus`, lot du neuvième parcours) : sans elles, le bouton ne le
        // lance pas, et le panneau dit par où commencer, sous le bouton.
        var refus = document.createElement('p');
        refus.className = 'assistance-parcours-refus';
        refus.id = 'assistance-parcours-refus-' + def.id;
        refus.setAttribute('role', 'status');
        refus.hidden = true;
        btn.addEventListener('click', function () {
            var motif = typeof def.refus === 'function' ? def.refus() : null;
            if (motif) {
                refus.textContent = motif;
                refus.hidden = false;
                return;
            }
            var depuis = e.etat === 'en-cours' ? e.etape : 0;
            fermerPanneau({ sansRetourFocus: true });
            def.lancer(depuis);
        });
        corps.appendChild(btn);
        corps.appendChild(refus);

        li.appendChild(corps);
        return li;
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

        var intro = document.createElement('p');
        intro.className = 'assistance-intro';
        intro.textContent = 'Des parcours où tu fais les gestes toi-même, accompagné·e pas à pas : quoi faire, comment le faire, et pourquoi.';
        panneau.appendChild(intro);

        var intitule = document.createElement('p');
        intitule.className = 'assistance-intitule';
        intitule.id = 'assistance-intitule';
        intitule.textContent = 'Tes parcours';
        panneau.appendChild(intitule);

        var liste = document.createElement('ol');
        liste.className = 'assistance-parcours';
        liste.setAttribute('aria-labelledby', 'assistance-intitule');
        registre.forEach(function (def) { liste.appendChild(creerParcoursItem(def)); });
        panneau.appendChild(liste);

        var filet = document.createElement('div');
        filet.className = 'assistance-filet';
        filet.setAttribute('aria-hidden', 'true');
        panneau.appendChild(filet);

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
        requestAnimationFrame(function () { els.panneau.classList.remove('est-entrant'); });
        var titre = els.panneau.querySelector('.assistance-fermer');
        if (titre) titre.focus();
    }

    function fermerPanneau(opts) {
        var p = document.getElementById('panneau-assistance');
        var v = document.getElementById('assistance-voile');
        document.removeEventListener('keydown', surEchapDocument, true);
        if (!p && !v) return;
        if (p) p.remove();
        if (v) v.remove();
        if (!(opts && opts.sansRetourFocus) && focusAvant && focusAvant.isConnected) {
            try { focusAvant.focus(); } catch (e) { /* rien */ }
        }
        focusAvant = null;
    }

    window.Assistance = {
        enregistrer: enregistrer,
        etatDe: etatDe,
        definirEtat: definirEtat,
        ouvrirPanneau: ouvrirPanneau,
        fermerPanneau: fermerPanneau,
        majMenu: majMenu,
        parcours: function () { return registre.slice(); }
    };
    // Le dispatcher data-action de main.js : le menu, « À propos », l'aide de la visite.
    window.ouvrirPanneauAssistance = ouvrirPanneau;

    // Les préférences se lisent après le démarrage : le rang se recalcule aussi à chaque section.
    window.addEventListener('sectionAffichee', majMenu);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', majMenu);
    else majMenu();
})();
