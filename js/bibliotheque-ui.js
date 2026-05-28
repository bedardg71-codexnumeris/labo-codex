/**
 * BibliothequeUI — Composant générique pour les modales de bibliothèque
 * Extrait des 4 modules (grilles, échelles, productions, cartouches) pour
 * éliminer ~1167 lignes de code dupliqué.
 *
 * API :
 *   BibliothequeUI.creerModal(config)
 *   BibliothequeUI.renderCarteSelection(opts)
 *   BibliothequeUI.renderCarteDisponible(opts)
 *   BibliothequeUI.fermerModal(modalId)
 *   BibliothequeUI.genererBadgeSource(item, itemsLocaux)
 *   BibliothequeUI.genererIdCourt(id)
 */
(function () {
    'use strict';

    const BibliothequeUI = {};

    /**
     * Génère un ID court (6 derniers caractères) pour affichage
     */
    BibliothequeUI.genererIdCourt = function (id) {
        if (!id || id.length < 6) return id || '?';
        return id.slice(-6);
    };

    /**
     * Détermine si un item est un exemple démo.
     * Détection par flag isDemo ou par auteur démo. Deux chaînes acceptées
     * pendant la transition (cf. BACKLOG #296) :
     *   - 'Labo Codex' (legacy, encore présent dans echelles.js,
     *     spe-specifications.js, gabarits-utils.js, demo-namespace.js, etc.)
     *   - 'Demo Labo Codex' (nouvelle convention, voir #290 du 28 mai 2026)
     * Le tri catégoriel (vraies démos vs canevas génériques vs résidus de
     * tests) sera tranché par #296 post-AQPC, puis cette fonction sera
     * réduite à la nouvelle chaîne uniquement.
     */
    BibliothequeUI.estItemDemo = function (item) {
        if (!item) return false;
        if (item.isDemo === true) return true;
        return item.auteur === 'Labo Codex' || item.auteur === 'Demo Labo Codex';
    };

    /**
     * Phase A.0 — Mode démo actif (Beta 99.39, audit biblios 2026-05-09).
     * Source de vérité : flag `demo-actif` géré par js/demo-activation.js.
     */
    BibliothequeUI.modeDemoActif = function () {
        if (typeof db === 'undefined' || !db.getSync) return false;
        return db.getSync('demo-actif', null) === 'true';
    };

    /**
     * Phase A.0 — Filtre une collection : retire les items démo lorsque le
     * mode démo est OFF. Préserve l'ordre. À appeler avant tout rendu de
     * carte (sidebar ou pool). Les items démo ne sont PAS supprimés du
     * stockage — juste masqués pour l'utilisateur en mode normal.
     */
    BibliothequeUI.filtrerParModeDemo = function (items) {
        if (!Array.isArray(items)) return items;
        if (BibliothequeUI.modeDemoActif()) return items;
        return items.filter(function (item) { return !BibliothequeUI.estItemDemo(item); });
    };

    /**
     * Construit la métadonnée `inspireDe` à poser sur toute copie forkée
     * d'un item existant (respect CC BY — on trace l'origine quelle que
     * soit la source). Retourne { nom, auteur, date } avec date au
     * format YYYY-MM-DD.
     */
    BibliothequeUI.forgerInspireDe = function (itemSource) {
        return {
            nom: (itemSource && itemSource.nom) || 'Inconnu',
            auteur: (itemSource && itemSource.auteur) || 'Inconnu',
            date: new Date().toISOString().slice(0, 10)
        };
    };

    /**
     * Retourne l'auteur de l'utilisateur actif depuis le profil enseignant
     * actif (cc-license.js). Fallback « Inconnu » si indisponible.
     */
    BibliothequeUI.obtenirAuteurActif = function () {
        if (typeof obtenirProfilAuteurActifSync !== 'function') return 'Inconnu';
        var profil = obtenirProfilAuteurActifSync();
        return (profil && profil.auteur_original) || 'Inconnu';
    };

    /**
     * Ajoute un <optgroup> « Démo » à un <select> natif. Les items démo
     * sont ajoutés avec option.disabled = true pour signaler visuellement
     * qu'ils sont des exemples non utilisables directement — il faut les
     * dupliquer d'abord dans la section appropriée. Cohérent avec
     * l'interdiction des références mixtes (Plan 1 Phase 4).
     *
     * No-op si selectElement introuvable ou demoItems vide.
     *
     * @param {HTMLSelectElement} selectElement - Le select à enrichir
     * @param {Array} demoItems - Tableau d'items démo (avec .id et .nom ou équivalent)
     * @param {Function} extraireTexte - Fonction (item) => string pour le label
     * @param {string} [titreOptgroup] - Label de l'optgroup (défaut explicite)
     */
    BibliothequeUI.ajouterOptgroupDemo = function (selectElement, demoItems, extraireTexte, titreOptgroup) {
        if (!selectElement || !demoItems || demoItems.length === 0) return;
        var optgroup = document.createElement('optgroup');
        optgroup.label = titreOptgroup || 'Démo (par Labo Codex — à dupliquer pour utiliser)';
        demoItems.forEach(function(item) {
            var option = document.createElement('option');
            option.value = 'demo-' + (item.id || '');
            option.textContent = (typeof extraireTexte === 'function')
                ? extraireTexte(item)
                : (item.nom || item.titre || 'Sans titre');
            option.disabled = true;
            option.title = 'Exemple fourni par Labo Codex. Duplique-le dans la section appropriée pour en créer ta propre version.';
            if (item.id) option.dataset.demoId = item.id;
            optgroup.appendChild(option);
        });
        selectElement.appendChild(optgroup);
    };

    /**
     * Format d'attribution « par <auteur> [+N contrib.] » pour affichage
     * dans les métadonnées de carte. Retourne '' si aucun auteur connu.
     * Lit meta.contributeurs ou item.contributeurs (respecte la licence CC BY).
     */
    BibliothequeUI.formaterAttribution = function (item) {
        if (!item) return '';
        var meta = item.metadata_cc || item.metadata || {};
        var auteur = meta.auteur_original || item.auteur || '';
        if (!auteur) return '';
        var contribs = meta.contributeurs || item.contributeurs || [];
        var suffixe = '';
        if (contribs.length === 1) suffixe = ' +1 contrib.';
        else if (contribs.length > 1) suffixe = ' +' + contribs.length + ' contrib.';
        return 'par ' + auteur + suffixe;
    };

    /**
     * Formate la trace d'origine d'un item forké. Retourne
     * « Inspiré de <nom> par <auteur> » si item.inspireDe est présent,
     * '' sinon. Snapshot figé au moment du fork (cf. Plan 1 §4.3).
     */
    BibliothequeUI.formaterInspireDe = function (item) {
        if (!item || !item.inspireDe) return '';
        var src = item.inspireDe;
        var nom = src.nom || 'Inconnu';
        var auteur = src.auteur || 'Inconnu';
        return 'Inspiré de ' + nom + ' par ' + auteur;
    };

    /**
     * Bascule un formulaire d'édition en mode lecture seule pour items démo
     * (Plan 1 §3.1, Phase 4.B). Disable les inputs, injecte/retire un bandeau
     * en tête du conteneur avec un bouton « Dupliquer » qui lance l'action
     * de fork redirigeant vers l'édition de la copie.
     *
     * Toggle idempotent : rappel avec `estDemo = false` nettoie tout.
     *
     * @param {HTMLElement} conteneur - Conteneur du formulaire
     * @param {Object} item - L'item en cours d'édition
     * @param {string} dupliquerAction - Nom de l'action data-action du bouton
     * @param {string} [labelBouton] - Label personnalisé du bouton (défaut
     *        « Dupliquer pour créer ma version »)
     * @param {string} [texteBandeau] - Texte du bandeau (défaut générique)
     */
    BibliothequeUI.appliquerModeLectureSeuleDemo = function (conteneur, item, dupliquerAction, labelBouton, texteBandeau) {
        if (!conteneur) return;
        var estDemo = BibliothequeUI.estItemDemo(item);

        conteneur.classList.toggle('demo-readonly', estDemo);

        var controls = conteneur.querySelectorAll('input, select, textarea');
        controls.forEach(function (c) {
            c.disabled = estDemo;
        });

        var banner = conteneur.querySelector('.bandeau-demo-readonly');
        if (estDemo) {
            var idEchappe = (typeof echapperHtml === 'function') ? echapperHtml(item.id || '') : (item.id || '');
            var label = labelBouton || 'Dupliquer pour créer ma version';
            var texte = texteBandeau || 'Exemple fourni par Labo Codex (lecture seule). Duplique-le pour créer ta propre version.';
            var bannerHTML = '<span class="bandeau-demo-readonly-texte">' + ((typeof echapperHtml === 'function') ? echapperHtml(texte) : texte) + '</span>' +
                '<button type="button" class="btn btn-confirmer bandeau-demo-readonly-btn" data-action="' + dupliquerAction + '" data-param="' + idEchappe + '">' + ((typeof echapperHtml === 'function') ? echapperHtml(label) : label) + '</button>';
            if (!banner) {
                banner = document.createElement('div');
                banner.className = 'bandeau-demo-readonly';
                conteneur.insertBefore(banner, conteneur.firstChild);
            }
            banner.innerHTML = bannerHTML;
        } else if (banner) {
            banner.remove();
        }
    };

    /**
     * Fork générique : crée une copie d'un item avec `inspireDe` (Plan §4.3),
     * retire le flag `isDemo`, remplace l'auteur par l'identité CC utilisateur,
     * et purge les métadonnées héritées (`metadata_cc`, `auteurOriginal`).
     * Ne persiste pas : retourne la copie, c'est au caller de sauvegarder.
     *
     * @param {Object} source - Item à forker (grille, échelle, etc.)
     * @param {string} prefixeId - Préfixe d'ID (ex. 'GRILLE_')
     * @returns {Object} Copie prête à être sauvegardée
     */
    /**
     * Phase 4.C : vérifie qu'aucune des références ne pointe vers un item
     * démo (matériel CC livré par Labo Codex). Empêche une entité réelle
     * de référencer un item démo non forké (Plan 1 §3.4).
     *
     * Détection en 2 passes :
     *   1. Préfixe `demo-` sur l'id (convention Phase 2 pour dropdowns natifs)
     *   2. Lookup dans la collection + flag `isDemo` ou auteur « Labo Codex »
     *
     * @param {Array<{id:string, collection:string, labelType:string}>} references
     * @returns {Object|null} { type, nom, message } si violation, null sinon
     */
    BibliothequeUI.verifierReferencesPasDemo = function (references) {
        if (!references || !references.length) return null;
        for (var i = 0; i < references.length; i++) {
            var ref = references[i];
            if (!ref || !ref.id) continue;

            // Préfixe démo (Phase 2, option disabled dans dropdown natif)
            if (typeof ref.id === 'string' && ref.id.indexOf('demo-') === 0) {
                return {
                    type: ref.labelType || 'élément',
                    nom: '',
                    message: 'Le ' + (ref.labelType || 'élément') + ' sélectionné est un exemple fourni par Labo Codex. Clique sur « Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l\'utiliser.'
                };
            }

            // Lookup dans la collection
            if (ref.collection && typeof db !== 'undefined' && db.getSync) {
                var items = db.getSync(ref.collection, []) || [];
                var item = items.find(function (x) { return x && x.id === ref.id; });
                if (item && BibliothequeUI.estItemDemo(item)) {
                    var nom = item.nom || item.titre || '';
                    return {
                        type: ref.labelType || 'élément',
                        nom: nom,
                        message: 'Le ' + (ref.labelType || 'élément') + (nom ? ' « ' + nom + ' »' : '') + ' est un exemple fourni par Labo Codex. Clique sur « Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l\'utiliser.'
                    };
                }
            }
        }
        return null;
    };

    BibliothequeUI.forkerItem = function (source, prefixeId) {
        var genererId = window.genererIdUnique || function (p) {
            return (p || 'ITEM_') + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        };
        var auteurActif = (typeof obtenirIdentiteCCUtilisateur === 'function')
            ? obtenirIdentiteCCUtilisateur()
            : 'Utilisateur de Labo Codex';
        // Clone profond pour éviter tout partage de références (ex. tableaux
        // `criteres`, `niveaux`, `commentaires`) entre la source démo et la copie.
        var copie = JSON.parse(JSON.stringify(source));
        copie.id = genererId(prefixeId || 'ITEM_');
        copie.nom = (source.nom || source.titre || 'Sans titre') + ' (copie)';
        copie.auteur = auteurActif;
        copie.isDemo = false;
        copie.inspireDe = BibliothequeUI.forgerInspireDe(source);
        copie.dansBibliotheque = true;
        copie.dateCreation = new Date().toISOString();
        delete copie.metadata_cc;
        delete copie.auteurOriginal;
        return copie;
    };

    /**
     * Phase A.3 (audit biblios 2026-05-09) — Strippe les préfixes type
     * en tête de titre : `[STD]`, `[SPE]`, `[SOM]`, `[DEN]`, `[Multi]`,
     * `[MULTI]`, `[Démo]`, etc. La typologie est déjà communiquée par les
     * badges de pratique colorés à gauche du titre (ou supprimée par le
     * filtrage démo en mode normal). Préfixe de titre = bruit redondant.
     *
     * Conserve l'ancien nom `formaterTitreDemo` comme alias pour
     * compatibilité avec les callers existants (le 2e argument est ignoré).
     */
    BibliothequeUI.formaterTitre = function (nom) {
        if (!nom) return nom;
        return String(nom).replace(/^\[[^\]]+\]\s*/, '');
    };

    BibliothequeUI.formaterTitreDemo = function (nom /*, estDemo */) {
        return BibliothequeUI.formaterTitre(nom);
    };

    /**
     * Phase D (audit biblios 2026-05-09) — Construit la ligne de
     * métadonnées d'une carte biblio dans un ordre fixe :
     *   quantité · auteur · discipline
     *
     * @param {Object} item - L'item rendu (grille, échelle, cartouche…)
     * @param {Object} [opts]
     * @param {string|Function} [opts.quantite] - Texte de quantité
     *        (ex. "3 critère(s)"). Si Function, appelée avec (item).
     * @param {boolean|string} [opts.discipline] - true pour utiliser
     *        item.discipline ; string pour valeur explicite ; falsy
     *        pour ne pas afficher.
     * @returns {string} Métadonnées jointes par ' • ' (vide si rien).
     */
    BibliothequeUI.formaterMetadonnees = function (item, opts) {
        opts = opts || {};
        var parts = [];

        var qte = (typeof opts.quantite === 'function')
            ? opts.quantite(item)
            : opts.quantite;
        if (qte) parts.push(qte);

        var att = BibliothequeUI.formaterAttribution(item);
        if (att) parts.push(att);
        else if (item && item.auteur) parts.push('par ' + item.auteur);

        var disc = null;
        if (opts.discipline === true && item) disc = item.discipline;
        else if (typeof opts.discipline === 'string') disc = opts.discipline;
        if (disc) parts.push(disc);

        return parts.join(' • ');
    };

    /**
     * Phase D (audit biblios 2026-05-09) — Tronque une description pour
     * affichage compact en carte biblio. Coupe au dernier espace si la
     * coupure tombe au-delà de 70% de la longueur cible (sinon coupe net).
     * Ajoute « … » quand tronqué.
     */
    BibliothequeUI.tronquerDescription = function (desc, max) {
        if (!desc) return '';
        var s = String(desc);
        var n = max || 120;
        if (s.length <= n) return s;
        var coupe = s.slice(0, n);
        var lastSpace = coupe.lastIndexOf(' ');
        if (lastSpace > n * 0.7) coupe = coupe.slice(0, lastSpace);
        return coupe.replace(/\s+$/, '') + '…';
    };

    /**
     * Génère le badge source HTML. Phase A.2 + A.4 (audit biblios 2026-05-09) :
     * - Plus de badge `Bibliothèque` (no-op contextuel — la modale s'appelle déjà ainsi)
     * - Plus de badge violet `Démo` (items démo filtrés par A.0 en mode normal)
     * - Plus de badge `Locale` (redondant : Section 1 par définition tous locaux ;
     *   Section 2 a déjà un message « Déjà dans la barre latérale » quand applicable)
     * Ne reste que `Retirée` (état distinct, signal d'action utile).
     * Le 2e argument `itemsLocaux` est conservé pour compatibilité API.
     */
    BibliothequeUI.genererBadgeSource = function (item /*, itemsLocaux */) {
        if (item && item.dansBibliotheque === false) {
            return '<span class="badge-source badge-source--retiree">Retirée</span>';
        }
        return '';
    };

    /**
     * Ferme et supprime une modale du DOM
     */
    BibliothequeUI.fermerModal = function (modalId) {
        var modal = document.getElementById(modalId);
        if (modal) modal.remove();
    };

    /**
     * Convertit une chaine onclick legacy en attributs data-action.
     * Ex: "fn('a')" -> 'data-action="fn" data-param="a"'
     *     "fn('a', 'b')" -> 'data-action="fn" data-param="a" data-param2="b"'
     */
    function onclickToDataAttrs(onclickStr) {
        if (!onclickStr) return '';
        var m = onclickStr.match(/^([a-zA-Z0-9_.]+)\(([^)]*)\)$/);
        if (!m) return 'data-action="' + onclickStr.replace(/[()'"]/g, '') + '"';
        var fnName = m[1];
        var argsStr = m[2].trim();
        if (!argsStr) return 'data-action="' + fnName + '"';
        var args = argsStr.split(/,\s*/).map(function(a) { return a.replace(/^['"]|['"]$/g, ''); });
        var attrs = 'data-action="' + fnName + '" data-param="' + args[0] + '"';
        if (args[1] !== undefined) attrs += ' data-param2="' + args[1] + '"';
        if (args[2] !== undefined) attrs += ' data-param3="' + args[2] + '"';
        return attrs;
    }

    /**
     * Génère les attributs d'un bouton : supporte {action, param} (délégué) ou {onclick} (legacy)
     * @param {Object} btn - {label, classe, title, onclick?, action?, param?}
     * @returns {string} attributs HTML du bouton
     */
    function _btnAttrs(btn) {
        if (btn.action) {
            var attrs = 'data-action="' + btn.action + '"';
            if (btn.param != null) attrs += ' data-param="' + btn.param + '"';
            if (btn.param2 != null) attrs += ' data-param2="' + btn.param2 + '"';
            return attrs;
        }
        // Legacy onclick string → convertir en data-action via parsing
        if (btn.onclick) {
            return onclickToDataAttrs(btn.onclick);
        }
        return '';
    }

    // ============================================================
    // Phase C #267 (audit biblios) — Menu d'actions secondaires ⋮
    // Trigger ⋮ → popover absolute. Une seule instance ouverte à la
    // fois. Click ailleurs ou ESC ferme. Click sur item → action via
    // dispatcher data-action puis fermeture.
    // ============================================================

    var _menuOuvertCourant = null;
    var _menuCompteur = 0;

    function _genererMenuId() {
        _menuCompteur += 1;
        return 'biblio-menu-' + Date.now().toString(36) + '-' + _menuCompteur;
    }

    BibliothequeUI.fermerTousLesMenus = function () {
        var menus = document.querySelectorAll('.biblio-menu-popover.actif');
        for (var i = 0; i < menus.length; i++) menus[i].classList.remove('actif');
        var triggers = document.querySelectorAll('.biblio-menu-trigger[aria-expanded="true"]');
        for (var j = 0; j < triggers.length; j++) triggers[j].setAttribute('aria-expanded', 'false');
        _menuOuvertCourant = null;
    };

    BibliothequeUI.toggleMenuActions = function (menuId) {
        if (typeof menuId !== 'string') return;
        var popover = document.getElementById(menuId);
        if (!popover) return;
        var dejaOuvert = popover.classList.contains('actif');
        BibliothequeUI.fermerTousLesMenus();
        if (!dejaOuvert) {
            popover.classList.add('actif');
            var trigger = document.querySelector('.biblio-menu-trigger[data-param="' + menuId + '"]');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            _menuOuvertCourant = menuId;
        }
    };

    /**
     * Rend le bloc trigger + popover. Renvoie '' si actions vide.
     * @param {Array} actions - [{label, action, param, classe?, title?}]
     * @param {string} [contextId] - ID stable optionnel (sinon généré)
     */
    BibliothequeUI.renderMenuActions = function (actions, contextId) {
        if (!actions || actions.length === 0) return '';
        var menuId = contextId ? 'biblio-menu-' + contextId : _genererMenuId();
        var itemsHTML = '';
        for (var i = 0; i < actions.length; i++) {
            var a = actions[i];
            var classeExtra = a.classe === 'btn-supprimer' ? ' biblio-menu-item--danger' : '';
            itemsHTML += '<button type="button" ' + _btnAttrs(a) +
                ' class="biblio-menu-item' + classeExtra + '"' +
                (a.title ? ' title="' + echapperHtml(a.title) + '"' : '') +
                ' role="menuitem">' +
                echapperHtml(a.label) + '</button>';
        }
        return '<span class="biblio-menu-wrapper">' +
            '<button type="button" class="biblio-menu-trigger btn btn-mini"' +
            ' data-action="BibliothequeUI.toggleMenuActions"' +
            ' data-param="' + menuId + '"' +
            ' aria-haspopup="menu" aria-expanded="false"' +
            ' aria-label="Plus d\'actions" title="Plus d\'actions">⋮</button>' +
            '<div id="' + menuId + '" class="biblio-menu-popover" role="menu">' +
                itemsHTML +
            '</div>' +
        '</span>';
    };

    // Listeners globaux : click ailleurs / ESC ferment ; click sur un item ferme aussi
    if (typeof document !== 'undefined') {
        document.addEventListener('click', function (e) {
            // Click sur le trigger : laisse le dispatcher gérer (toggle)
            if (e.target.closest('.biblio-menu-trigger')) return;
            // Click sur un item : ferme (le dispatcher exécutera l'action en bubble)
            if (e.target.closest('.biblio-menu-item')) {
                BibliothequeUI.fermerTousLesMenus();
                return;
            }
            // Click ailleurs : ferme si un menu est ouvert
            if (_menuOuvertCourant) BibliothequeUI.fermerTousLesMenus();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && _menuOuvertCourant) {
                BibliothequeUI.fermerTousLesMenus();
            }
        });
    }

    /**
     * Phase C #267 (audit biblios) — Rend la HTML d'un bouton primaire de
     * carte. Échappe le label et le title (sécurité — texte utilisateur).
     */
    function _renderBoutonPrincipal(p) {
        if (!p) return '';
        return '<button type="button" ' + _btnAttrs(p) +
            ' class="btn ' + (p.classe || 'btn-confirmer') + ' btn-mini"' +
            (p.title ? ' title="' + echapperHtml(p.title) + '"' : '') + '>' +
            echapperHtml(p.label) + '</button>';
    }

    /**
     * Rend une carte d'item en Section 1 (dans la sélection).
     * Phase C #267 — API : bouton principal + menu d'actions secondaires.
     *
     * @param {Object} opts
     * @param {string} opts.nom - Nom de l'item (HTML autorisé : badges)
     * @param {string} opts.id - ID complet (sert de contextId pour le menu)
     * @param {string} opts.badgeSource - HTML du badge source
     * @param {string} opts.metadonnees - Ligne de métadonnées
     * @param {string} [opts.description] - Description (auto-tronquée + échappée)
     * @param {string} [opts.inspireDe] - Trace d'origine
     * @param {string} [opts.badgesPratiques] - HTML des badges de pratique
     * @param {Object} [opts.boutonPrincipal] - {label, action, param, classe, title}
     * @param {Array}  [opts.actionsMenu] - [{label, action, param, classe, title}]
     */
    BibliothequeUI.renderCarteSelection = function (opts) {
        var badgesPratiques = opts.badgesPratiques || '';

        var actionsHTML = '<div class="biblio-carte-actions">' +
            _renderBoutonPrincipal(opts.boutonPrincipal) +
            BibliothequeUI.renderMenuActions(opts.actionsMenu, opts.id) +
            '</div>';

        var ligneInspireDe = opts.inspireDe
            ? '<div class="biblio-carte-inspire">' + echapperHtml(opts.inspireDe) + '</div>'
            : '';

        var descTronquee = BibliothequeUI.tronquerDescription(opts.description);
        var descHTML = descTronquee
            ? '<div class="biblio-carte-desc">' + echapperHtml(descTronquee) + '</div>'
            : '';

        return '<div class="biblio-carte biblio-carte--selection">' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    ligneInspireDe +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + '</div>' +
                    descHTML +
                '</div>' +
                actionsHTML +
            '</div>' +
        '</div>';
    };

    /**
     * Rend une carte d'item en Section 2 (disponible à ajouter).
     * Phase C #267 — API : bouton principal + menu d'actions secondaires.
     *
     * @param {Object} opts
     * @param {string} opts.nom - Nom de l'item (HTML autorisé : badges)
     * @param {string} opts.id - ID complet (sert de contextId pour le menu)
     * @param {string} opts.badgeSource - HTML du badge source
     * @param {string} opts.metadonnees - Ligne de métadonnées
     * @param {string} [opts.description] - Description (auto-tronquée + échappée)
     * @param {string} [opts.inspireDe] - Trace d'origine
     * @param {boolean} opts.dejaPresent - true si déjà dans la sélection
     * @param {string} [opts.badgesPratiques] - HTML des badges de pratique
     * @param {string} [opts.styleExtra] - Style CSS supplémentaire
     * @param {string} [opts.dataAttrs] - Attributs data- supplémentaires
     * @param {string} [opts.classeItem] - Classe CSS pour l'item (filtrage)
     * @param {Object} [opts.boutonPrincipal] - {label, action, param, classe, title, showAlways}.
     *        Si dejaPresent et !showAlways, primaire masqué.
     * @param {Array}  [opts.actionsMenu] - [{label, action, param, classe, title, showAlways}].
     *        Si dejaPresent, items sans showAlways filtrés.
     */
    BibliothequeUI.renderCarteDisponible = function (opts) {
        var badgesPratiques = opts.badgesPratiques || '';
        var opacite = opts.dejaPresent ? 'opacity: 0.5;' : '';
        var styleExtra = opts.styleExtra || '';
        var dataAttrs = opts.dataAttrs || '';
        var classeItem = opts.classeItem || '';

        var primaire = opts.boutonPrincipal;
        if (opts.dejaPresent && primaire && !primaire.showAlways) primaire = null;

        var actionsMenu = opts.actionsMenu;
        if (opts.dejaPresent && Array.isArray(actionsMenu)) {
            actionsMenu = actionsMenu.filter(function (a) { return a && a.showAlways; });
        }

        var actionsHTML = '<div class="biblio-carte-actions">' +
            _renderBoutonPrincipal(primaire) +
            BibliothequeUI.renderMenuActions(actionsMenu, opts.id) +
            '</div>';

        var ligneInspireDe = opts.inspireDe
            ? '<div class="biblio-carte-inspire">' + echapperHtml(opts.inspireDe) + '</div>'
            : '';

        var descTronquee = BibliothequeUI.tronquerDescription(opts.description);
        var descHTML = descTronquee
            ? '<div class="biblio-carte-desc">' + echapperHtml(descTronquee) + '</div>'
            : '';

        return '<div class="' + classeItem + ' biblio-carte biblio-carte--disponible" ' + dataAttrs + ' style="' + opacite + styleExtra + '">' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    ligneInspireDe +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + '</div>' +
                    descHTML +
                    (opts.dejaPresent ? '<div class="biblio-carte-deja">Déjà dans la barre latérale</div>' : '') +
                '</div>' +
                actionsHTML +
            '</div>' +
        '</div>';
    };

    /**
     * Génère le bloc d'avertissement doublons
     */
    BibliothequeUI.renderAvertissementDoublons = function (doublons, fnIdCourt) {
        if (!doublons || doublons.length === 0) return '';

        var genId = fnIdCourt || BibliothequeUI.genererIdCourt;
        var nomChamp = doublons[0].nom !== undefined ? 'nom' : 'titre';

        var listeHTML = doublons.map(function (d) {
            var nom = d[nomChamp] || 'Sans titre';
            var idsStr = '';
            if (d.ids) {
                idsStr = ' (IDs: ' + d.ids.map(function (id) {
                    return '<span title="ID complet : ' + id + '" style="cursor: help; text-decoration: underline dotted;">#' + genId(id) + '</span>';
                }).join(', ') + ')';
            }
            return '<li><strong>' + nom + '</strong> : ' + d.count + ' exemplaire(s)' + idsStr + '</li>';
        }).join('');

        return '<div class="info-box info-box--attention" style="margin-bottom: 20px;">' +
            '<div style="font-weight: bold; margin-bottom: 8px;">' +
                '⚠️ ' + doublons.length + ' doublon(s) potentiel(s) détecté(s)' +
            '</div>' +
            '<p style="font-size: 0.9em; margin: 0 0 8px 0;">' +
                'Des éléments avec des noms similaires existent en plusieurs exemplaires.' +
            '</p>' +
            '<p style="font-size: 0.85em; margin: 0 0 10px 0; color: var(--texte-secondaire, #8aa4b0);">' +
                '<strong>Pour résoudre :</strong> repère les exemplaires au même nom dans la liste ci-dessous, ouvre leur menu ⋮ et choisis « Retirer » (déplace hors de la barre latérale, données conservées) ou « Supprimer » (suppression définitive). Survole un ID pour voir sa valeur complète — IDs identiques = vraies copies, IDs différents = homonymes légitimes.' +
            '</p>' +
            '<details style="font-size: 0.85em;">' +
                '<summary style="cursor: pointer; font-weight: 500;">Voir les détails</summary>' +
                '<ul style="margin: 10px 0 0 0; padding-left: 20px;">' + listeHTML + '</ul>' +
            '</details>' +
        '</div>';
    };

    /**
     * Crée et injecte une modale complète de bibliothèque
     * @param {Object} config
     * @param {string} config.modalId - ID unique du modal (ex: "modalBibliothequeGrilles")
     * @param {string} config.titre - Titre H2
     * @param {string} config.sousTitre - Description sous le titre
     * @param {string} config.onFermer - Nom de la fonction de fermeture
     * @param {string} config.doublonsHTML - HTML de l'avertissement doublons (ou '')
     * @param {string} config.titreSection1 - Titre de la Section 1
     * @param {string} config.contenuSection1 - HTML du contenu de la Section 1
     * @param {string} config.boutonsApresSection1 - HTML des boutons après Section 1
     * @param {string} [config.sectionImportTrimestre] - HTML optionnel pour import trimestre
     * @param {string} config.titreSection2 - Titre de la Section 2
     * @param {string} config.filtresSection2 - HTML des filtres avant Section 2
     * @param {string} config.contenuSection2 - HTML du contenu de la Section 2
     * @param {string} [config.contenuIdListe2] - ID du conteneur Section 2
     */
    BibliothequeUI.creerModal = function (config) {
        // Idempotence : si une instance avec ce modalId existe déjà (cas typique
        // d'un rafraîchissement après import), la retirer avant d'en créer une
        // nouvelle. Sinon `insertAdjacentHTML('beforeend', …)` empile deux
        // modales partageant le même id, ce qui double le backdrop et oblige
        // à fermer 2 fois pour que la modale disparaisse.
        var existant = document.getElementById(config.modalId);
        if (existant) existant.remove();

        var fermerAttr = 'data-action="' + (config.onFermerAction || config.onFermer) + '"';
        var html = '<div id="' + config.modalId + '" class="modal-js-overlay" style="z-index: 10000;">' +
            '<div class="modal-js-contenu" style="max-width: 800px;">' +
                '<button ' + fermerAttr + ' class="modal-js-btn-fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">' +
                    '<h2 style="margin: 0; color: var(--accent-primaire);">' + config.titre + '</h2>' +
                    '<button class="btn-aide-contextuelle" data-aide="bibliotheque-fonctionnement" title="Comment fonctionne la bibliothèque"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button>' +
                '</div>' +
                '<p style="color: var(--gris-clair); margin-bottom: 20px;">' + config.sousTitre + '</p>' +

                config.doublonsHTML +

                '<h3 class="biblio-section-titre">' + config.titreSection1 + '</h3>' +
                '<div style="margin-bottom: 30px;">' +
                    '<div id="' + (config.contenuIdListe1 || '') + '">' +
                        config.contenuSection1 +
                    '</div>' +
                    config.boutonsApresSection1 +
                '</div>' +

                (config.sectionImportTrimestre || '') +

                '<h3 class="biblio-section-titre">' + config.titreSection2 + '</h3>' +
                config.filtresSection2 +
                '<div id="' + (config.contenuIdListe2 || '') + '">' +
                    config.contenuSection2 +
                '</div>' +

            '</div>' +
        '</div>';

        document.body.insertAdjacentHTML('beforeend', html);
    };

    // Exposer globalement
    window.BibliothequeUI = BibliothequeUI;
})();
