/**
 * ui-dialogues.js — Modales de dialogue ASYNC réutilisables (#315 / #316).
 *
 * Remplace les `confirm()` et `prompt()` natifs bloquants (incohérents visuellement,
 * non stylables, parfois supprimés par les navigateurs) par deux modales maison
 * qui rendent une Promise :
 *
 *   const ok = await uiDialogues.confirmerAction({ titre, message, variante });
 *   const saisie = await uiDialogues.demanderSaisie({ titre, message, valeurInitiale });
 *   const valeur = await uiDialogues.demanderChoix({ titre, message, choix, texteConfirmer });
 *
 * `confirmerAction` résout `true` (confirmer) / `false` (annuler, Échap, clic dehors).
 * `demanderSaisie`  résout la chaîne saisie / `null` (annuler, Échap, clic dehors)
 *   — même contrat que `prompt()` (null = annulation) pour une migration directe.
 * `demanderChoix`   résout la valeur de l'option cochée / `null` ; rien n'est
 *   présélectionné, et confirmer sans choix ne répond pas (#898).
 *
 * Design system : classes `.modal-overlay/.modal-contenu/.modal-titre/.modal-section/
 *   .modal-actions/.btn` (cf. modal-backup-reminder.js, styles.css). Deux modes
 *   (sombre/clair) hérités des variables CSS.
 *
 * Sécurité (CLAUDE.md) : construction par `createElement` + `textContent` (jamais
 * d'`innerHTML` sur des données → immunisé XSS sans dépendre d'`echapperHtml`) ;
 * aucun handler inline — uniquement `addEventListener` (CSP `script-src 'self'`).
 *
 * a11y : `role="dialog"` + `aria-modal` + `aria-labelledby`, focus déplacé dans la
 *   modale (option sûre = Annuler pour une action destructive), Échap ferme, Entrée
 *   confirme (sauf saisie multiligne) — dans `confirmerAction`, Entrée suit le bouton qui a
 *   le focus (#945), donc Annuler pour une action destructive —, focus rendu à l'élément
 *   précédent à la fermeture. Les trois autres modales n'ont aucune action destructive
 *   par défaut sur Entrée : saisie (renvoie la chaîne), information (ferme), choix
 *   (seulement après une option cochée à la main).
 */
(function () {
    'use strict';

    function _creer(tag, opts) {
        opts = opts || {};
        const el = document.createElement(tag);
        if (opts.className) el.className = opts.className;
        if (opts.id) el.id = opts.id;
        if (opts.texte != null) el.textContent = String(opts.texte);
        if (opts.attrs) {
            for (const k in opts.attrs) {
                if (Object.prototype.hasOwnProperty.call(opts.attrs, k)) el.setAttribute(k, opts.attrs[k]);
            }
        }
        return el;
    }

    function _rendreFocus(element) {
        if (element && typeof element.focus === 'function') {
            try { element.focus(); } catch (e) { /* élément détaché */ }
        }
    }

    // Squelette commun (overlay + modale + titre + section message).
    function _construireBase(options) {
        const overlay = _creer('div', { className: 'modal-overlay actif', id: 'overlay-ui-dialogue', attrs: { role: 'presentation' } });
        const modal = _creer('div', { className: 'modal-contenu modal-compact', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ui-dialogue-titre' } });

        const titre = _creer('h3', { className: 'modal-titre', id: 'ui-dialogue-titre', texte: options.titre || 'Confirmer' });
        modal.appendChild(titre);

        const section = _creer('div', { className: 'modal-section' });
        modal.appendChild(section);

        const actions = _creer('div', { className: 'modal-actions' });
        modal.appendChild(actions);
        overlay.appendChild(modal);

        return { overlay, modal, section, actions };
    }

    /**
     * Modale de confirmation (remplace `confirm()`).
     * @param {object} options
     * @param {string} [options.titre]          Titre court de la modale.
     * @param {string} [options.message]        Question / conséquence (1-2 phrases).
     * @param {string} [options.texteConfirmer] Libellé du bouton d'action (défaut « Confirmer »).
     * @param {string} [options.texteAnnuler]   Libellé du bouton d'annulation (défaut « Annuler »).
     * @param {string} [options.variante]       'danger' → bouton destructif rouge + focus sur Annuler.
     * @returns {Promise<boolean>} true si confirmé, false sinon.
     */
    function confirmerAction(options) {
        options = options || {};
        return new Promise(function (resolve) {
            const focusPrecedent = (typeof document !== 'undefined' && document.activeElement) || null;
            const base = _construireBase(options);

            if (options.message) {
                const p = _creer('p', { texte: options.message });
                // `preformate` : préserve les sauts de ligne (résumés multi-lignes, ex. fusion codex).
                if (options.preformate && p.style) p.style.whiteSpace = 'pre-wrap';
                base.section.appendChild(p);
            }

            const estDanger = options.variante === 'danger';
            const btnAnnuler = _creer('button', { className: 'btn btn-neutre', texte: options.texteAnnuler || 'Annuler' });
            const btnConfirmer = _creer('button', {
                className: 'btn ' + (estDanger ? 'btn-supprimer' : 'btn-principal'),
                texte: options.texteConfirmer || 'Confirmer'
            });

            let termine = false;
            function repondre(valeur) {
                if (termine) return;
                termine = true;
                document.removeEventListener('keydown', surTouche, true);
                if (base.overlay && base.overlay.remove) base.overlay.remove();
                _rendreFocus(focusPrecedent);
                resolve(valeur);
            }
            // #945 — Entrée fait ce que ferait le bouton qui a le focus ; hors des deux boutons,
            // l'action sûre de la variante (danger : annuler). Sans cela, un Entrée réflexe
            // confirmait la destruction alors que le focus était posé sur « Annuler ».
            function surTouche(e) {
                if (e.key === 'Escape') { e.preventDefault(); repondre(false); }
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    const focus = document.activeElement;
                    if (focus === btnConfirmer) repondre(true);
                    else if (focus === btnAnnuler) repondre(false);
                    else repondre(!estDanger);
                }
            }

            btnAnnuler.addEventListener('click', function () { repondre(false); });
            btnConfirmer.addEventListener('click', function () { repondre(true); });
            base.overlay.addEventListener('click', function (e) { if (e.target === base.overlay) repondre(false); });
            document.addEventListener('keydown', surTouche, true);

            base.actions.appendChild(btnAnnuler);
            base.actions.appendChild(btnConfirmer);
            document.body.appendChild(base.overlay);

            // Action destructive : focus l'option SÛRE (Annuler), pas la destruction.
            _rendreFocus(estDanger ? btnAnnuler : btnConfirmer);
        });
    }

    /**
     * Modale de saisie (remplace `prompt()`).
     * @param {object} options
     * @param {string} [options.titre]          Titre court.
     * @param {string} [options.message]        Libellé du champ.
     * @param {string} [options.valeurInitiale] Valeur pré-remplie.
     * @param {string} [options.placeholder]    Indice dans le champ vide.
     * @param {boolean}[options.multiligne]     true → <textarea> (Entrée n'envoie pas).
     * @param {string} [options.texteConfirmer] Libellé du bouton (défaut « OK »).
     * @param {string} [options.texteAnnuler]   Libellé d'annulation (défaut « Annuler »).
     * @returns {Promise<string|null>} la chaîne saisie, ou null si annulé.
     */
    function demanderSaisie(options) {
        options = options || {};
        return new Promise(function (resolve) {
            const focusPrecedent = (typeof document !== 'undefined' && document.activeElement) || null;
            const base = _construireBase(Object.assign({ titre: 'Saisie' }, options));

            if (options.message) {
                const lbl = _creer('label', { texte: options.message, attrs: { for: 'ui-dialogue-saisie' } });
                if (options.preformate && lbl.style) lbl.style.whiteSpace = 'pre-wrap';
                base.section.appendChild(lbl);
            }
            const champ = _creer(options.multiligne ? 'textarea' : 'input', {
                id: 'ui-dialogue-saisie',
                className: 'champ-formulaire'
            });
            if (!options.multiligne) champ.setAttribute('type', 'text');
            if (options.placeholder) champ.setAttribute('placeholder', options.placeholder);
            champ.value = options.valeurInitiale != null ? String(options.valeurInitiale) : '';
            base.section.appendChild(champ);

            const btnAnnuler = _creer('button', { className: 'btn btn-neutre', texte: options.texteAnnuler || 'Annuler' });
            const btnOk = _creer('button', { className: 'btn btn-principal', texte: options.texteConfirmer || 'OK' });

            let termine = false;
            function repondre(valeur) {
                if (termine) return;
                termine = true;
                document.removeEventListener('keydown', surTouche, true);
                if (base.overlay && base.overlay.remove) base.overlay.remove();
                _rendreFocus(focusPrecedent);
                resolve(valeur);
            }
            function valeurChamp() { return champ.value != null ? String(champ.value) : ''; }
            function surTouche(e) {
                if (e.key === 'Escape') { e.preventDefault(); repondre(null); }
                else if (e.key === 'Enter' && !options.multiligne) { e.preventDefault(); repondre(valeurChamp()); }
            }

            btnAnnuler.addEventListener('click', function () { repondre(null); });
            btnOk.addEventListener('click', function () { repondre(valeurChamp()); });
            base.overlay.addEventListener('click', function (e) { if (e.target === base.overlay) repondre(null); });
            document.addEventListener('keydown', surTouche, true);

            base.actions.appendChild(btnAnnuler);
            base.actions.appendChild(btnOk);
            document.body.appendChild(base.overlay);

            _rendreFocus(champ);
            if (typeof champ.select === 'function') { try { champ.select(); } catch (e) { /* détaché */ } }
        });
    }

    /**
     * Modale d'information (remplace les `alert()` informatifs multi-lignes que
     * le toast `notifications` rendrait illisibles : détails du codex, résumés de
     * fusion/export). Un seul bouton, résout quand l'utilisateur ferme.
     * @param {object} options { titre, message, preformate, texteConfirmer }
     * @returns {Promise<void>}
     */
    function informer(options) {
        options = options || {};
        return new Promise(function (resolve) {
            const focusPrecedent = (typeof document !== 'undefined' && document.activeElement) || null;
            const base = _construireBase(Object.assign({ titre: 'Information' }, options));

            if (options.message) {
                const p = _creer('p', { texte: options.message });
                if (options.preformate && p.style) p.style.whiteSpace = 'pre-wrap';
                base.section.appendChild(p);
            }

            const btnOk = _creer('button', { className: 'btn btn-principal', texte: options.texteConfirmer || 'Fermer' });

            let termine = false;
            function repondre() {
                if (termine) return;
                termine = true;
                document.removeEventListener('keydown', surTouche, true);
                if (base.overlay && base.overlay.remove) base.overlay.remove();
                _rendreFocus(focusPrecedent);
                resolve();
            }
            function surTouche(e) {
                if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); repondre(); }
            }

            btnOk.addEventListener('click', repondre);
            base.overlay.addEventListener('click', function (e) { if (e.target === base.overlay) repondre(); });
            document.addEventListener('keydown', surTouche, true);

            base.actions.appendChild(btnOk);
            document.body.appendChild(base.overlay);
            _rendreFocus(btnOk);
        });
    }

    /**
     * Modale de choix dans une liste (#898) : une question, des options radio, un
     * bouton d'action. RIEN n'est présélectionné et le bouton d'action reste inerte
     * tant qu'aucune option n'est cochée — la modale ne devine pas à la place de
     * l'utilisateur, même s'il n'y a qu'une option.
     * @param {object} options
     * @param {string} [options.titre]          Titre court.
     * @param {string} [options.message]        La question.
     * @param {Array<{valeur:string, libelle:string}>} options.choix  Options offertes.
     * @param {string} [options.texteConfirmer] Libellé du bouton d'action (défaut « Confirmer »).
     * @param {string} [options.texteAnnuler]   Libellé d'annulation (défaut « Annuler »).
     * @returns {Promise<string|null>} la valeur choisie, ou null (annuler, Échap, clic dehors).
     */
    function demanderChoix(options) {
        options = options || {};
        const choix = Array.isArray(options.choix) ? options.choix : [];
        return new Promise(function (resolve) {
            const focusPrecedent = (typeof document !== 'undefined' && document.activeElement) || null;
            const base = _construireBase(options);

            if (options.message) {
                base.section.appendChild(_creer('p', { id: 'ui-dialogue-question', texte: options.message }));
            }

            const btnAnnuler = _creer('button', { className: 'btn btn-neutre', texte: options.texteAnnuler || 'Annuler' });
            const btnConfirmer = _creer('button', { className: 'btn btn-principal', texte: options.texteConfirmer || 'Confirmer' });
            btnConfirmer.disabled = true;

            let valeurChoisie = null;
            const liste = _creer('div', { className: 'ui-dialogue-choix', attrs: { role: 'radiogroup', 'aria-labelledby': 'ui-dialogue-question' } });
            const radios = [];
            choix.forEach(function (c, i) {
                const ligne = _creer('label', { className: 'ui-dialogue-choix-ligne', attrs: { for: 'ui-dialogue-choix-' + i } });
                const radio = _creer('input', { id: 'ui-dialogue-choix-' + i, attrs: { type: 'radio', name: 'ui-dialogue-choix' } });
                radio.value = String(c.valeur);
                radio.addEventListener('change', function () {
                    if (!radio.checked) return;
                    valeurChoisie = String(c.valeur);
                    btnConfirmer.disabled = false;
                });
                ligne.appendChild(radio);
                ligne.appendChild(_creer('span', { texte: c.libelle }));
                liste.appendChild(ligne);
                radios.push(radio);
            });
            base.section.appendChild(liste);

            let termine = false;
            function repondre(valeur) {
                if (termine) return;
                termine = true;
                document.removeEventListener('keydown', surTouche, true);
                if (base.overlay && base.overlay.remove) base.overlay.remove();
                _rendreFocus(focusPrecedent);
                resolve(valeur);
            }
            // Sans choix, confirmer ne répond pas : la modale reste ouverte.
            function confirmer() { if (valeurChoisie !== null) repondre(valeurChoisie); }
            function surTouche(e) {
                if (e.key === 'Escape') { e.preventDefault(); repondre(null); }
                else if (e.key === 'Enter') { e.preventDefault(); confirmer(); }
            }

            btnAnnuler.addEventListener('click', function () { repondre(null); });
            btnConfirmer.addEventListener('click', confirmer);
            base.overlay.addEventListener('click', function (e) { if (e.target === base.overlay) repondre(null); });
            document.addEventListener('keydown', surTouche, true);

            base.actions.appendChild(btnAnnuler);
            base.actions.appendChild(btnConfirmer);
            document.body.appendChild(base.overlay);

            _rendreFocus(radios[0] || btnAnnuler);
        });
    }

    /* ─────────────────────────────────────────────────────────────────────────
     * Lot E1 de l'enregistrement (D0 point 4, D3 — 27 sept. 2026) : « Créer
     * quelque chose de neuf : un bouton qui nomme le geste. Tant qu'on n'a pas
     * cliqué, rien n'existe ; quitter avant avertit. »
     *
     * Chaque éditeur qui crée (grille, échelle, cartouche) déclare un prédicat :
     * « ma fiche est en création et porte une saisie ». Deux lecteurs :
     *   · `quitterCreationSiConfirme(genre)`, que l'éditeur appelle avant de fermer
     *     sa fiche ou d'en ouvrir une autre ;
     *   · un seul `beforeunload`, pour le rechargement et la fermeture de l'onglet.
     * ⚠ Changer de section passe par `navigation.js`, zone protégée : ce chemin-là
     * n'avertit pas (dit à Grégoire, lot E1).
     * ───────────────────────────────────────────────────────────────────────── */
    const _fichesEnCreation = new Map();

    function declarerFicheEnCreation(genre, predicat) {
        if (typeof predicat === 'function') _fichesEnCreation.set(genre, predicat);
    }

    function _saisieEnCreation(genre) {
        const predicat = _fichesEnCreation.get(genre);
        try { return !!(predicat && predicat()); } catch (e) { return false; }
    }

    // Mots de D3 (« Cette grille n'est pas encore créée. ») et de Cowork (boutons).
    // Lot E2 (28 sept. 2026) : les fiches du Cadre, mots proposés à Grégoire.
    const TITRES_CREATION = {
        grille: 'Cette grille n\'est pas encore créée.',
        echelle: 'Cette échelle n\'est pas encore créée.',
        cartouche: 'Cette cartouche n\'est pas encore créée.',
        enseignant: 'Ce profil n\'est pas encore créé.',
        horaire: 'Cet horaire n\'est pas encore créé.',
        groupeCours: 'Ce groupe-cours n\'est pas encore créé.',
        // Mots tranchés par Grégoire le 28 sept. (13 h 30) : « étudiant·e », comme partout dans l'application.
        eleve: 'Cet·te étudiant·e n\'est pas encore ajouté·e.',
        // Lot E3 (28 sept. 2026) : mots proposés à Grégoire.
        production: 'Cette production n\'est pas encore créée.'
    };
    // Le bouton qui quitte : « Quitter sans créer », sauf pour un geste qui ne « crée » pas.
    const QUITTER_SANS = { eleve: 'Quitter sans ajouter' };

    /**
     * @param {string} genre - 'grille' | 'echelle' | 'cartouche' | les fiches du Cadre (lot E2)
     * @param {string} [titre] - lot E2 : le titre, quand il dépend de la fiche (« Ce cours… » /
     *   « Ce service… », depuis mots-nature.js) ; sinon celui du genre
     * @returns {Promise<boolean>} true si on peut quitter (rien à perdre, ou
     *   « Quitter sans créer »), false si l'usager reste (« Rester », Échap, Entrée).
     */
    async function quitterCreationSiConfirme(genre, titre) {
        if (!_saisieEnCreation(genre)) return true;
        return confirmerAction({
            titre: titre || TITRES_CREATION[genre] || 'Ce n\'est pas encore créé.',
            message: 'Ce que tu as saisi n\'est gardé qu\'à l\'écran. Si tu quittes, il sera perdu.',
            texteAnnuler: 'Rester',
            texteConfirmer: QUITTER_SANS[genre] || 'Quitter sans créer',
            variante: 'danger'
        });
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('beforeunload', function (e) {
            for (const genre of _fichesEnCreation.keys()) {
                if (_saisieEnCreation(genre)) {
                    e.preventDefault();
                    e.returnValue = '';
                    return '';
                }
            }
        });
    }

    window.uiDialogues = {
        confirmerAction: confirmerAction,
        demanderSaisie: demanderSaisie,
        informer: informer,
        demanderChoix: demanderChoix,
        declarerFicheEnCreation: declarerFicheEnCreation,
        quitterCreationSiConfirme: quitterCreationSiConfirme
    };
})();
