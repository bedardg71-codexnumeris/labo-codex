/* =================================================================
   LE PANNEAU « ASSISTANCE » — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md ; esquisse 73, validée.

   Une seule entrée du menu, « Assistance », remplace « Visite guidée » et la ligne à
   interrupteur. Elle porte en petit le rang du parcours en cours ou à venir (« 2 sur 3 »),
   plus rien quand tout est fait, et ouvre ce panneau : les parcours, reliés comme des
   étapes, puis « Aide dans les pages » et l'interrupteur d'avant (même préférence).

   Les parcours s'inscrivent eux-mêmes, dans l'ordre (Assistance.enregistrer) : la liste
   est construite pour qu'un troisième s'y ajoute avec son lot, sans toucher à ce fichier.
   Leur état vit dans UNE préférence, `parcoursAssistance` :
     { <id>: { etat: 'a-faire' | 'en-cours' | 'fait', etape: <index de 0> } }
   Rien ne démarre de lui-même : un parcours se lance par « Commencer », « Reprendre »
   ou « Refaire ».

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

    function enregistrer(def) {
        if (registre.some(function (p) { return p.id === def.id; })) return;
        registre.push(def);
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
        return idx === -1 ? '' : (idx + 1) + ' sur ' + registre.length;
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
            pastille.textContent = String(registre.indexOf(def) + 1);
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

        // Lu à la construction pour l'affichage ; relu au toucher (la fenêtre a pu changer de largeur),
        // et la liste se redessine quand le seuil est franchi panneau ouvert (rafraichirListe).
        var refuse = tropPetitPour(def);
        if (refuse) {
            li.dataset.ecran = 'trop-petit';
            var refus = document.createElement('p');
            refus.className = 'assistance-parcours-grand-ecran';
            refus.id = 'assistance-parcours-grand-ecran-' + def.id;
            refus.textContent = TEXTE_GRAND_ECRAN;
            corps.appendChild(refus);
        }

        var p = document.createElement('p');
        p.className = 'assistance-parcours-ligne';
        p.textContent = def.ligne;
        corps.appendChild(p);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assistance-parcours-bouton' + (e.etat === 'en-cours' ? ' assistance-parcours-bouton--plein' : '');
        btn.textContent = e.etat === 'fait' ? 'Refaire' : e.etat === 'en-cours' ? 'Reprendre' : 'Commencer';
        btn.setAttribute('aria-describedby', h.id + (refuse ? ' assistance-parcours-grand-ecran-' + def.id : ''));
        // Sur téléphone, un parcours pour grand écran : le bouton reste lisible, il ne lance rien.
        if (refuse) btn.setAttribute('aria-disabled', 'true');
        btn.addEventListener('click', function () {
            if (tropPetitPour(def)) return;
            // Parcours 6 : un parcours peut poser sa condition d'entrée (`condition`, qui rend
            // la phrase du refus, ou rien). Non remplie, le bouton ne lance rien : le panneau dit
            // pourquoi, sous le bouton, et le lecteur d'écran l'annonce.
            var refus = typeof def.condition === 'function' ? def.condition() : null;
            if (refus) {
                var dit = corps.querySelector('.assistance-parcours-condition');
                if (!dit) {
                    dit = document.createElement('p');
                    dit.className = 'assistance-parcours-condition';
                    dit.setAttribute('role', 'status');
                    corps.appendChild(dit);
                }
                dit.textContent = refus;
                return;
            }
            var depuis = e.etat === 'en-cours' ? e.etape : 0;
            fermerPanneau({ sansRetourFocus: true });
            def.lancer(depuis);
        });
        corps.appendChild(btn);

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
        liste.id = 'assistance-parcours-liste';
        liste.setAttribute('aria-labelledby', 'assistance-intitule');
        remplirListe(liste);
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
