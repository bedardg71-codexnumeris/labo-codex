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
     * Détermine si un item est un exemple démo (Labo Codex).
     * Détection par flag isDemo ou par auteur « Labo Codex » (chaîne
     * réservée au matériel CC livré avec l'application).
     */
    BibliothequeUI.estItemDemo = function (item) {
        return !!(item && (item.isDemo === true || item.auteur === 'Labo Codex'));
    };

    /**
     * Pour les items démo, remplace le préfixe de pratique en tête du nom
     * (ex. « [SPE] », « [STD] ») par « [Démo] ». L'abréviation de pratique
     * étant un doublon du badge de pratique, on la remplace utilement par
     * le marqueur démo. No-op sur les items non démo.
     */
    BibliothequeUI.formaterTitreDemo = function (nom, estDemo) {
        if (!estDemo || !nom) return nom;
        return nom.replace(/^\[(SPE|STD|SOM|PAN|PAN-S)\]\s*/, '[Démo] ');
    };

    /**
     * Génère le ou les badges source HTML.
     * Badge principal : Locale / Bibliothèque / Retirée.
     * Badge additionnel « Démo » si l'item provient du matériel CC Labo Codex.
     */
    BibliothequeUI.genererBadgeSource = function (item, itemsLocaux) {
        const estLocale = itemsLocaux.some(function (i) { return i.id === item.id; });
        const estRetiree = item.dansBibliotheque === false;
        const estDemo = BibliothequeUI.estItemDemo(item);

        let html;
        if (estRetiree) {
            html = '<span class="badge-source badge-source--retiree">Retirée</span>';
        } else if (estLocale) {
            html = '<span class="badge-source badge-source--locale">Locale</span>';
        } else {
            html = '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>';
        }

        if (estDemo) {
            html += ' <span class="badge-source badge-source--demo">Démo</span>';
        }

        return html;
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

    /**
     * Rend une carte d'item en Section 1 (dans la sélection)
     * @param {Object} opts
     * @param {string} opts.nom - Nom de l'item
     * @param {string} opts.id - ID complet
     * @param {string} opts.badgeSource - HTML du badge source
     * @param {string} opts.metadonnees - Ligne de métadonnées (ex: "3 critères • Français")
     * @param {string} [opts.badgesPratiques] - HTML des badges de pratique
     * @param {Array} opts.boutons - [{label, onclick, classe}]
     */
    BibliothequeUI.renderCarteSelection = function (opts) {
        var idCourt = BibliothequeUI.genererIdCourt(opts.id);
        var badgesPratiques = opts.badgesPratiques || '';

        var boutonsHTML = '<div class="biblio-carte-actions">';
        opts.boutons.forEach(function (btn) {
            boutonsHTML += '<button ' + _btnAttrs(btn) + ' class="btn ' + btn.classe + ' btn-tres-compact" title="' + (btn.title || '') + '">' + btn.label + '</button>';
        });
        boutonsHTML += '</div>';

        return '<div class="biblio-carte biblio-carte--selection">' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' <span class="badge-source badge-source--id" title="ID: ' + opts.id + '">#' + idCourt + '</span>' +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + '</div>' +
                '</div>' +
                boutonsHTML +
            '</div>' +
        '</div>';
    };

    /**
     * Rend une carte d'item en Section 2 (disponible à ajouter)
     * @param {Object} opts
     * @param {string} opts.nom - Nom de l'item
     * @param {string} opts.id - ID complet
     * @param {string} opts.badgeSource - HTML du badge source
     * @param {string} opts.metadonnees - Ligne de métadonnées
     * @param {string} [opts.description] - Description optionnelle
     * @param {boolean} opts.dejaPresent - true si déjà dans la sélection
     * @param {string} [opts.badgesPratiques] - HTML des badges de pratique
     * @param {string} [opts.styleExtra] - Style CSS supplémentaire
     * @param {string} [opts.dataAttrs] - Attributs data- supplémentaires
     * @param {string} [opts.classeItem] - Classe CSS pour l'item (filtrage)
     * @param {Array} opts.boutons - [{label, onclick, classe, showAlways}]
     */
    BibliothequeUI.renderCarteDisponible = function (opts) {
        var idCourt = BibliothequeUI.genererIdCourt(opts.id);
        var badgesPratiques = opts.badgesPratiques || '';
        var opacite = opts.dejaPresent ? 'opacity: 0.5;' : '';
        var styleExtra = opts.styleExtra || '';
        var dataAttrs = opts.dataAttrs || '';
        var classeItem = opts.classeItem || '';

        var boutonsHTML = '<div class="biblio-carte-actions biblio-carte-actions--vertical">';
        opts.boutons.forEach(function (btn) {
            if (!opts.dejaPresent || btn.showAlways) {
                boutonsHTML += '<button ' + _btnAttrs(btn) + ' class="btn ' + btn.classe + ' btn-tres-compact" title="' + (btn.title || '') + '">' + btn.label + '</button>';
            }
        });
        boutonsHTML += '</div>';

        return '<div class="' + classeItem + ' biblio-carte biblio-carte--disponible" ' + dataAttrs + ' style="' + opacite + styleExtra + '">' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' <span class="badge-source badge-source--id" title="ID: ' + opts.id + '">#' + idCourt + '</span>' +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + '</div>' +
                    (opts.description ? '<div class="biblio-carte-desc">' + opts.description + '</div>' : '') +
                    (opts.dejaPresent ? '<div class="biblio-carte-deja">Déjà dans la barre latérale</div>' : '') +
                '</div>' +
                boutonsHTML +
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
                idsStr = ' (IDs: ' + d.ids.map(function (id) { return '#' + genId(id); }).join(', ') + ')';
            }
            return '<li><strong>' + nom + '</strong> : ' + d.count + ' exemplaire(s)' + idsStr + '</li>';
        }).join('');

        return '<div class="info-box info-box--attention" style="margin-bottom: 20px;">' +
            '<div style="font-weight: bold; margin-bottom: 8px;">' +
                '⚠️ ' + doublons.length + ' doublon(s) potentiel(s) détecté(s)' +
            '</div>' +
            '<p style="font-size: 0.9em; margin: 0 0 10px 0;">' +
                'Des éléments avec des noms similaires existent en plusieurs exemplaires.' +
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
        var fermerAttr = 'data-action="' + (config.onFermerAction || config.onFermer) + '"';
        var html = '<div id="' + config.modalId + '" class="modal-js-overlay" style="z-index: 10000;">' +
            '<div class="modal-js-contenu" style="max-width: 800px;">' +
                '<button ' + fermerAttr + ' class="modal-js-btn-fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">' +
                    '<h2 style="margin: 0; color: var(--accent-primaire);">' + config.titre + '</h2>' +
                    '<button class="btn-aide-contextuelle" data-aide="bibliotheque-fonctionnement" title="Comment fonctionne la bibliothèque">✴️</button>' +
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
