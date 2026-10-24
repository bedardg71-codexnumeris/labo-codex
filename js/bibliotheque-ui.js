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
     * #291 (23 août 2026) — La puce d'identifiant affichée sur une carte.
     *
     * « J'ai une information m'indiquant que j'ai des doublons […] ils ne sont
     * pas affichés ! » Le bandeau citait des IDs tronqués (#b209ef, #6fdd43…)
     * que RIEN dans la liste ne portait : il décrivait des objets qu'aucun
     * geste ne permettait de retrouver. Cette puce est la moitié manquante.
     *
     * L'ID complet part en `title` — contexte d'ATTRIBUT, donc
     * `echapperAttribut` et non `echapperHtml` (CT-29 : la seconde n'encode
     * pas les guillemets).
     *
     * @param {string} id - identifiant complet
     * @returns {string} HTML de la puce ('' si pas d'id)
     */
    BibliothequeUI.renderPuceId = function (id) {
        if (!id) return '';
        return '<code class="biblio-id-court" title="Identifiant complet : ' +
            echapperAttribut(id) + '">#' +
            echapperHtml(BibliothequeUI.genererIdCourt(id)) + '</code>';
    };

    /**
     * L'attribut d'ancrage qui rend « Voir » possible (#291, §3.3).
     *
     * Sans ancre stable sur la carte, « les rechercher manuellement par leur ID
     * est laborieux » reste vrai : le bandeau saurait nommer l'objet mais pas
     * y conduire.
     */
    function _ancreItem(id) {
        return id ? ' data-biblio-item-id="' + echapperAttribut(id) + '"' : '';
    }

    /**
     * Détermine si un item est un exemple démo.
     * Détection par flag isDemo ou par auteur démo `'Demo Labo Codex'`.
     *
     * #296 (19 juin 2026) — tri catégoriel tranché : seuls les items d'infra
     * démo portent désormais `'Demo Labo Codex'`. Le marqueur legacy
     * `'Labo Codex'` n'est PLUS traité comme « démo » : les gabarits, défauts
     * génériques et exemples par discipline (echelles.js, gabarits-utils.js,
     * spe-specifications.js, pratiques-predefines.js) qui le portaient étaient
     * du contenu de bibliothèque FONCTIONNEL, masqué à tort — ils redeviennent
     * visibles en mode normal. Audit : `Rapports/AUDIT-296-seeds-labo-codex-2026-06-19.md`.
     */
    BibliothequeUI.estItemDemo = function (item) {
        if (!item) return false;
        if (item.isDemo === true) return true;
        return item.auteur === 'Demo Labo Codex';
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
     * #326 axe D (SPEC §3.2/§4 ; R1 : « essai » → « maquette ») — Maquette. Une
     * pratique marquée `estMaquette === true` vit dans le Labo › Exploration des
     * pratiques ; elle est MASQUÉE de la sidebar (sélection) et de la bibliothèque
     * propre (Conception › Pratiques), pour ne pas polluer les pratiques abouties.
     * Flag transitoire, basculé à l'adoption (jamais une donnée détruite — juste masquée).
     */
    BibliothequeUI.estMaquette = function (item) {
        return !!(item && item.estMaquette === true);
    };

    /**
     * #326 axe D — Filtre une collection : retire les maquettes. À appeler avant
     * tout rendu de la sidebar de pratiques ou de la bibliothèque propre (PAS dans
     * le Labo › Exploration, qui montre justement les maquettes). Préserve l'ordre.
     * Les maquettes ne sont PAS supprimées du stockage.
     */
    BibliothequeUI.filtrerParMaquette = function (items) {
        if (!Array.isArray(items)) return items;
        return items.filter(function (item) { return !BibliothequeUI.estMaquette(item); });
    };

    /**
     * BACKLOG #293 (28 mai 2026) — Toggle « Masquer les items déjà dans la
     * barre latérale » en Section 2 des modales biblio. Préférence globale
     * partagée par les 5 modales (grilles, échelles, cartouches, productions,
     * pratiques). Persistance via db (clé `biblio-masquer-deja-present`).
     */
    var CLE_MASQUER_DEJA_PRESENT = 'biblio-masquer-deja-present';

    BibliothequeUI.estMasquerDejaPresentActif = function () {
        if (typeof db === 'undefined' || !db.getSync) return false;
        return db.getSync(CLE_MASQUER_DEJA_PRESENT, null) === 'true';
    };

    /**
     * Filtre une collection d'objets-carte Section 2 : retire ceux dont
     * `dejaPresent === true` quand la préférence est active. Préserve l'ordre.
     */
    BibliothequeUI.filtrerParDejaPresent = function (cartes) {
        if (!Array.isArray(cartes)) return cartes;
        if (!BibliothequeUI.estMasquerDejaPresentActif()) return cartes;
        return cartes.filter(function (c) { return !(c && c.dejaPresent === true); });
    };

    /**
     * Génère le HTML du toggle (case à cocher + label). Le data-action
     * route via le dispatcher main.js vers basculerMasquerDejaPresent qui
     * lit data-refresh-fn pour rafraîchir la bonne modale.
     */
    BibliothequeUI.renderToggleMasquerDejaPresent = function (refreshFnName) {
        var actif = BibliothequeUI.estMasquerDejaPresentActif();
        return '<div class="biblio-toggle-deja-present u-mb-15">' +
            '<label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: var(--gris-moyen); font-size: 0.9rem;">' +
                '<input type="checkbox" ' +
                    'data-on-change="BibliothequeUI.basculerMasquerDejaPresent" ' +
                    'data-refresh-fn="' + refreshFnName + '" ' +
                    (actif ? 'checked' : '') + '>' +
                'Masquer les éléments déjà dans ta sélection' +
            '</label>' +
        '</div>';
    };

    /**
     * Bascule la préférence + rafraîchit la modale en cours via la fonction
     * de re-render dont le nom est passé via data-refresh-fn. Le re-render
     * reconstruit la modale entière (creerModal retire l'ancienne avant
     * insertion). Reçoit l'élément directement (dispatcher data-on-change).
     */
    BibliothequeUI.basculerMasquerDejaPresent = function (elementOuNom) {
        var refreshFnName = null;
        if (typeof elementOuNom === 'string') {
            refreshFnName = elementOuNom;
        } else if (elementOuNom && elementOuNom.getAttribute) {
            refreshFnName = elementOuNom.getAttribute('data-refresh-fn');
        }
        var actuel = BibliothequeUI.estMasquerDejaPresentActif();
        if (typeof db !== 'undefined' && db.setSync) {
            db.setSync(CLE_MASQUER_DEJA_PRESENT, (!actuel).toString());
        }
        if (refreshFnName && typeof window[refreshFnName] === 'function') {
            window[refreshFnName]();
        }
    };

    /**
     * Construit la métadonnée `inspireDe` à poser sur toute copie forkée
     * d'un item existant (respect CC BY — on trace l'origine quelle que
     * soit la source). Retourne { nom, auteur, date, sourceId } avec date au
     * format YYYY-MM-DD.
     *
     * `sourceId` (axe D / #326, SPEC §3.1) = id de la source. Sert à la fois
     * l'attribution CC (permanente, jamais effacée) ET la navigation de l'arbre
     * de filiation (souche → variantes). Optionnel : omis si la source n'a pas
     * d'id (les filiations antérieures sans id restent valides, l'arbre les
     * ignore proprement). Sous-schéma transversal (grilles, échelles,
     * cartouches, pratiques) — cohérent avec import-export.js (SCHEMA_INSPIRE_DE).
     */
    BibliothequeUI.forgerInspireDe = function (itemSource) {
        var meta = {
            nom: (itemSource && itemSource.nom) || 'Inconnu',
            auteur: BibliothequeUI.resoudreAuteurSource(itemSource),
            date: new Date().toISOString().slice(0, 10)
        };
        if (itemSource && itemSource.id) meta.sourceId = itemSource.id;
        return meta;
    };

    /**
     * Retrouve l'auteur d'un item, où qu'il soit rangé (#457, 18 août 2026).
     *
     * `forgerInspireDe` ne lisait que `item.auteur`. Or ce champ racine n'existe
     * QUE sur les copies faites par `dupliquerGrille` / `dupliquerPratique…` :
     * un item créé par le chemin normal (`sauvegarderGrilleTemplate` et ses
     * équivalents échelles / cartouches / pratiques) range son auteur dans
     * `metadata_cc.auteur_original`, et un item reçu d'un autre enseignant le
     * range dans `auteurOriginal`. Le fallback « Inconnu » mordait donc à tous
     * les coups sur le matériel réel — la trace CC BY perdait précisément ce
     * qu'elle existe pour conserver.
     *
     * Trouvé par la porte terrain 1.1 du 18 août : « Inspiré de Grille-5
     * FR-HOLIS-30 A25 par Inconnu ». Le nom était juste, l'auteur non.
     *
     * Ordre : `auteur` (le plus spécifique, posé à la duplication) →
     * `metadata_cc.auteur_original` (bloc CC canonique, chemin de création) →
     * `auteurOriginal` (matériel importé) → 'Inconnu'.
     *
     * @param {Object} itemSource - grille, échelle, cartouche ou pratique
     * @returns {string} l'auteur, ou 'Inconnu' si aucune source ne le porte
     */
    BibliothequeUI.resoudreAuteurSource = function (itemSource) {
        if (!itemSource) return 'Inconnu';
        return itemSource.auteur
            || (itemSource.metadata_cc && itemSource.metadata_cc.auteur_original)
            || itemSource.auteurOriginal
            || 'Inconnu';
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
        optgroup.label = titreOptgroup || 'Démo (par Labo Codex – à dupliquer pour utiliser)';
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
        // #467 — l'auteur vient du fichier reçu ; la ligne part dans le HTML de la carte.
        return 'par ' + echapperHtml(auteur) + suffixe;
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
     * #1042 — « + Nouvelle … » ouvre le MÊME formulaire qu'un exemple vient peut-être de
     * verrouiller : chaque création le déverrouille par ici AVANT de remettre ses champs à
     * neuf (sinon le nom ne se saisit pas et le bandeau de l'exemple reste). Avant, pas
     * après : ce déverrouillage rouvre tous les champs, et la création pose ensuite les
     * siens (menus de la cartouche, etc.).
     *
     * @param {HTMLElement} conteneur - Le conteneur passé à appliquerModeLectureSeuleDemo
     */
    BibliothequeUI.quitterModeLectureSeuleDemo = function (conteneur) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneur, null, '');
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
     * T5 (chantier du démo, 6 oct. 2026) — `options.cible` : la clé où l'écriture va
     * atterrir. Une écriture DANS le namespace démo (`demo_…`, trimestre actif « demo »)
     * peut désigner le matériel du pack : c'est même tout l'objet de la présentation.
     * Sans ça, verrouiller une évaluation de démo était refusé (M2, mesuré le 6 oct.).
     * Hors démo, rien ne change.
     *
     * @param {Array<{id:string, collection:string, labelType:string}>} references
     * @param {{cible?: string}} [options]
     * @returns {Object|null} { type, nom, message } si violation, null sinon
     */
    var TYPES_FEMININS = ['grille', 'échelle', 'pratique', 'production'];
    function debutMessage(labelType) {
        var type = labelType || 'élément';
        if (/^[aeéèêiouh]/i.test(type)) return 'L\'' + type;   // l'échelle, l'élément, l'horaire
        return TYPES_FEMININS.indexOf(type) !== -1 ? 'La ' + type : 'Le ' + type;
    }
    BibliothequeUI.verifierReferencesPasDemo = function (references, options) {
        if (!references || !references.length) return null;
        if (options && typeof options.cible === 'string' && options.cible.indexOf('demo_') === 0) return null;
        for (var i = 0; i < references.length; i++) {
            var ref = references[i];
            if (!ref || !ref.id) continue;

            // Préfixe démo (Phase 2, option disabled dans dropdown natif)
            if (typeof ref.id === 'string' && ref.id.indexOf('demo-') === 0) {
                return {
                    type: ref.labelType || 'élément',
                    nom: '',
                    message: debutMessage(ref.labelType) + (TYPES_FEMININS.indexOf(ref.labelType) !== -1 ? ' sélectionnée' : ' sélectionné') + ' est un exemple fourni par Labo Codex. Clique sur « Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l\'utiliser.'
                };
            }

            // Lookup dans la collection — via cle() : #464/CO-02 (21 août 2026).
            // La collection était lue en clé NUE alors que grillesTemplates/
            // echellesTemplates/pratiquesConfigurables sont namespacées (#358,
            // 24 mai) : le lookup ne résolvait plus rien, la garde était inerte
            // aux trois quarts (hypothèse session 1, confirmée session 2).
            if (ref.collection && typeof db !== 'undefined' && db.getSync) {
                var cleCollection = (typeof cle === 'function') ? cle(ref.collection) : ref.collection;
                var items = db.getSync(cleCollection, []) || [];
                var item = items.find(function (x) { return x && x.id === ref.id; });
                if (item && BibliothequeUI.estItemDemo(item)) {
                    var nom = item.nom || item.titre || '';
                    return {
                        type: ref.labelType || 'élément',
                        nom: nom,
                        message: debutMessage(ref.labelType) + (nom ? ' « ' + nom + ' »' : '') + ' est un exemple fourni par Labo Codex. Clique sur « Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l\'utiliser.'
                    };
                }
            }
        }
        return null;
    };

    /**
     * Fabrique la copie d'un item de bibliothèque.
     *
     * @param {Object} source
     * @param {string} [prefixeId]
     * @param {Array} [nomsExistants] - collection où la copie va atterrir.
     *        Sert à sauter au premier rang libre (CO-24) ; facultatif, la
     *        normalisation du suffixe fonctionne sans.
     */
    BibliothequeUI.forkerItem = function (source, prefixeId, nomsExistants) {
        var genererId = window.genererIdUnique || function (p) {
            return (p || 'ITEM_') + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        };
        var auteurActif = (typeof obtenirIdentiteCCUtilisateur === 'function')
            ? obtenirIdentiteCCUtilisateur()
            : 'Utilisateur·trice de Labo Codex';
        // Clone profond pour éviter tout partage de références (ex. tableaux
        // `criteres`, `niveaux`, `commentaires`) entre la source démo et la copie.
        var copie = JSON.parse(JSON.stringify(source));
        copie.id = genererId(prefixeId || 'ITEM_');
        // CO-24 — dupliquer une copie donnait « X (copie) (copie) (copie) ».
        // `nommerCopie` normalise le suffixe au lieu de l'empiler.
        //
        // ✅ D9 (arbitrage du 24 août) — ON RENOMME LE CHAMP QUI EXISTE, ET LUI SEUL.
        // Avant, la ligne était `copie.nom = nommerCopie(source.nom || source.titre)` :
        // une production, qui se nomme par `titre` et n'a pas de `nom`, se voyait
        // POSER un `nom` que sa source n'avait pas. La copie portait deux champs de
        // nom, l'originale un seul — et son `titre`, lui, restait à renommer par
        // l'appelant, à la main et par concaténation nue.
        var champNom = (source.nom !== undefined && source.nom !== null) ? 'nom' : 'titre';
        copie[champNom] = nommerCopie(source[champNom], nomsExistants);
        copie.auteur = auteurActif;
        copie.isDemo = false;
        copie.inspireDe = BibliothequeUI.forgerInspireDe(source);
        copie.dansBibliotheque = true;
        copie.dateCreation = new Date().toISOString();
        delete copie.metadata_cc;
        delete copie.auteurOriginal;
        delete copie.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source
        // ✅ D7 (arbitrage du 24 août) — la copie d'un gabarit n'est plus un
        // gabarit. Verdict de Grégoire : c'est le comportement de
        // `dupliquerPratiqueBibliotheque` qui fait foi. Avant, `forkerItem` ne
        // connaissait pas ce drapeau, si bien que « Dupliquer et éditer » rendait
        // une copie encore marquée gabarit là où sa voisine la libérait.
        delete copie.estGabarit;
        return copie;
    };

    /**
     * Met le curseur dans le champ de nom fraîchement chargé, texte sélectionné,
     * pour que l'utilisateur puisse renommer la copie sans un clic de plus.
     *
     * @param {string} idChamp - id DOM du champ de nom de la famille
     */
    BibliothequeUI.focaliserChamp = function (idChamp) {
        if (!idChamp) return;
        var champ = document.getElementById(idChamp);
        if (champ) {
            champ.focus();
            champ.select();
        }
    };

    /**
     * #476 volet 2 — LE CHEMIN « DUPLIQUER ET ÉDITER », POUR LES CINQ FAMILLES.
     *
     * Les cinq `dupliquerEtEditerX` (grilles, échelles, cartouches, productions,
     * pratiques) exécutaient la MÊME séquence, recopiée cinq fois :
     *   lire la liste → trouver la source → forker → pousser → écrire →
     *   rafraîchir la liste → charger la copie en édition → focus du champ de nom.
     * Elles ne différaient que par leur plomberie (quelle clé, quel préfixe d'ID,
     * quelles fonctions de rafraîchissement) — jamais par leur logique.
     *
     * Zéro-dette : la séquence vit ICI, une seule fois. Chaque famille n'apporte
     * plus que son descripteur. Les fonctions de rafraîchissement sont INTERNES à
     * l'IIFE de leur module et ne peuvent donc pas être atteintes d'ici : elles
     * arrivent en rappels, ce qui est aussi ce qui garde chaque famille maîtresse
     * de son UI.
     *
     * ⚠ NE REND RIEN VOLONTAIREMENT. Les cinq appelants d'origine rendaient
     * `undefined` ; rendre la copie serait un changement de contrat, hors du
     * mandat « refactor pur » du volet 2. Le banc de caractérisation
     * (tests/integration/carac-476-volet2-duplication.spec.js) fige ce point.
     *
     * @param {Object} d                    - descripteur de famille
     * @param {string} d.id                 - id de l'item à dupliquer
     * @param {string} d.prefixeId          - préfixe d'ID de la famille ('GRILLE_'…)
     * @param {Function} d.modifierListe    - (mutateur) => Promise, sérialisé par
     *   `db.modifier` : le mutateur reçoit la liste lue et rend la liste à
     *   écrire, ou `undefined` pour annuler l'écriture. #522 lot 4.
     * @param {Function} [d.repliSource]    - (id) => source, si absente de la liste
     * @param {Function} [d.retoucherCopie] - (copie, source) => void, après forkerItem
     * @param {Function} [d.rafraichirListe]- () => void, avant le chargement en édition
     * @param {Function} [d.chargerPourModif] - (idCopie) => void
     * @param {string} [d.champFocus]       - id DOM du champ de nom
     */
    BibliothequeUI.dupliquerEtEditerItem = async function (d) {
        // #522 lot 4 — la copie naît DANS la section critique ; elle en ressort
        // par cette variable, parce que `db.modifier` rend la liste écrite, pas
        // l'élément ajouté, et que le chargement en édition a besoin de son id.
        var copieCreee = null;

        await d.modifierListe(async function (liste) {
            if (!Array.isArray(liste)) liste = [];

            var source = liste.find(function (x) { return x && x.id === d.id; });
            if (!source && typeof d.repliSource === 'function') {
                source = await d.repliSource(d.id);
            }
            // `undefined` ANNULE l'écriture : rien n'est touché, la file passe
            // à l'opération suivante. C'est l'ancien `return` sec.
            if (!source) return undefined;

            var copie = BibliothequeUI.forkerItem(source, d.prefixeId, liste);
            if (typeof d.retoucherCopie === 'function') d.retoucherCopie(copie, source);

            liste.push(copie);
            copieCreee = copie;
            return liste;
        });

        if (!copieCreee) return;
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(d.prefixeId || 'duplication');   // lot F : geste hors témoin (Dupliquer)

        // ⚠ HORS de la section critique, et il faut que ça le reste : ces trois
        // rappels touchent l'UI (rafraîchissement, chargement du formulaire,
        // focus). Les tenir dans le mutateur retiendrait la file de la clé
        // pendant un rendu, pour rien.
        if (typeof d.rafraichirListe === 'function') await d.rafraichirListe();
        if (typeof d.chargerPourModif === 'function') await d.chargerPourModif(copieCreee.id);
        BibliothequeUI.focaliserChamp(d.champFocus);
    };

    /**
     * #476 volet 2 — LE CHEMIN « DUPLIQUER DEPUIS LA BIBLIOTHÈQUE », POUR LES
     * CINQ FAMILLES.
     *
     * Les cinq `dupliquerXBibliotheque` faisaient la même chose : copier la
     * source, lui donner une identité neuve, l'attribuer à l'utilisateur
     * courant, poser la trace de provenance, la ranger dans la bibliothèque,
     * retirer les métadonnées de partage, écrire, rafraîchir. Une seule
     * séquence, recopiée cinq fois.
     *
     * ⚠ CE QUI RESTE PARAMÉTRÉ EST UNE DETTE, PAS UNE FONCTIONNALITÉ. Les
     * rappels `nommerLaCopie` et `forgerProvenance` existent parce que les cinq
     * familles ont DIVERGÉ sans que personne le décide — pas parce qu'on
     * voudrait qu'elles diffèrent. Les rassembler ici est justement ce qui rend
     * l'écart visible et la convergence décidable (BACKLOG #476, les neuf
     * écarts). Le volet 2 étant un refactor PUR, chaque écart est reconduit à
     * l'identique et signalé chez l'appelant.
     *
     * @param {Object} d
     * @param {string} d.id                  - id de l'item source
     * @param {string} d.prefixeId           - préfixe d'ID de la famille
     * @param {Function} d.modifierListe     - (mutateur) => Promise, sérialisé par
     *   `db.modifier` : le mutateur reçoit la liste lue et rend la liste à
     *   écrire, ou `undefined` pour annuler l'écriture. #522 lot 4.
     * @param {Function} d.nommerLaCopie     - (copie, source, liste) => void
     * @param {Function} d.forgerProvenance  - (source) => objet `inspireDe`
     * @param {boolean} [d.cloneProfond]     - clone JSON au lieu d'un étalement
     * @param {Function} [d.siIntrouvable]   - () => void, message d'absence
     * @param {Function} [d.retoucherCopie]  - (copie, source) => void, en fin de course
     * @param {Function} [d.rafraichirUI]    - () => void
     * @returns {Object|null} la copie écrite, ou null si la source est absente
     */
    BibliothequeUI.dupliquerVersBibliotheque = async function (d) {
        // #522 lot 4 — voir dupliquerEtEditerItem : la copie et le cas « source
        // absente » sortent de la section critique par ces deux variables.
        var copieCreee = null;
        var sourceIntrouvable = false;

        await d.modifierListe(async function (liste) {
            if (!Array.isArray(liste)) liste = [];

            var source = liste.find(function (x) { return x && x.id === d.id; });
            if (!source) {
                sourceIntrouvable = true;
                return undefined;   // annule l'écriture
            }

            var genererId = window.genererIdUnique || function (p) {
                return (p || 'ITEM_') + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            };

            // Étalement ou clone profond : seules les pratiques exigent le second
            // (sous-objets `configuration` / `jetons` partagés sinon — invariant
            // « source immuable », durcissement de la Brique C).
            var copie = d.cloneProfond
                ? JSON.parse(JSON.stringify(source))
                : Object.assign({}, source);

            copie.id = genererId(d.prefixeId);
            d.nommerLaCopie(copie, source, liste);
            copie.auteur = BibliothequeUI.obtenirAuteurActif();
            copie.isDemo = false;
            copie.inspireDe = d.forgerProvenance(source);
            copie.dansBibliotheque = true;
            copie.dateCreation = new Date().toISOString();

            // La copie devient un original de l'utilisateur : les métadonnées de
            // partage de la source n'ont plus cours.
            delete copie.metadata_cc;
            delete copie.auteurOriginal;
            delete copie.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source
            if (typeof d.retoucherCopie === 'function') d.retoucherCopie(copie, source);

            liste.push(copie);
            copieCreee = copie;
            return liste;
        });

        // ⚠ Le message d'absence est posé APRÈS la file, pas dedans : le tenir
        // dans le mutateur retiendrait la clé pendant un rendu d'UI. L'ordre vu
        // par l'utilisateur est inchangé.
        if (sourceIntrouvable) {
            if (typeof d.siIntrouvable === 'function') d.siIntrouvable();
            return null;
        }
        if (!copieCreee) return null;
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(d.prefixeId || 'duplication');   // lot F : geste hors témoin (Dupliquer)

        if (typeof d.rafraichirUI === 'function') await d.rafraichirUI();
        return copieCreee;
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

        // #467 : l'ancien repli sur `item.auteur` est retiré — formaterAttribution le lit déjà.
        var att = BibliothequeUI.formaterAttribution(item);
        if (att) parts.push(att);

        var disc = null;
        if (opts.discipline === true && item) disc = item.discipline;
        else if (typeof opts.discipline === 'string') disc = opts.discipline;
        if (disc) parts.push(echapperHtml(disc));   // #467

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
     *   Section 2 a déjà un message « Déjà dans ta sélection » quand applicable)
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
     *
     * ⚠ CONTEXTE D'ATTRIBUT (CT-29, 25 août 2026) — `echapperAttribut`, pas
     * `echapperHtml` : la seconde n'encode pas les guillemets. Les `param*`
     * portent des identifiants venus du stockage, et depuis la Voûte certains
     * viennent d'un `.lcz` reçu d'un tiers : la validation d'import refuse le
     * HTML brut (`/<[a-zA-Z!\/]/`) mais laisse passer un `"` seul, qui
     * suffirait à sortir de `data-param2="…"` et à greffer des attributs sur
     * le bouton. `el.dataset.param*` décode les entités : le dispatcher de
     * main.js lit exactement la même valeur qu'avant.
     *
     * @param {Object} btn - {label, classe, title, onclick?, action?, param?}
     * @returns {string} attributs HTML du bouton
     */
    function _btnAttrs(btn) {
        if (btn.action) {
            var attrs = 'data-action="' + echapperAttribut(btn.action) + '"';
            if (btn.param != null) attrs += ' data-param="' + echapperAttribut(btn.param) + '"';
            if (btn.param2 != null) attrs += ' data-param2="' + echapperAttribut(btn.param2) + '"';
            if (btn.param3 != null) attrs += ' data-param3="' + echapperAttribut(btn.param3) + '"';
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
            ' data-param="' + echapperHtml(menuId) + '"' +
            ' aria-haspopup="menu" aria-expanded="false"' +
            ' aria-label="Plus d\'actions" title="Plus d\'actions">⋮</button>' +
            '<div id="' + echapperHtml(menuId) + '" class="biblio-menu-popover" role="menu">' +   // #467 : contextId peut venir d'un id importé
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
     * @param {string} opts.nom - Nom de l'item (HTML autorisé : badges) — #467 : le nom
     *        reçu s'échappe AVANT, chez l'appelant (`echapperHtml`) ; ce rendu ne le fait pas.
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

        var puceId = opts.afficherId ? BibliothequeUI.renderPuceId(opts.id) : '';

        return '<div class="biblio-carte biblio-carte--selection"' + _ancreItem(opts.id) + '>' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    ligneInspireDe +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + puceId + '</div>' +
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
     * @param {string} opts.nom - Nom de l'item (HTML autorisé : badges) — #467 : le nom
     *        reçu s'échappe AVANT, chez l'appelant (`echapperHtml`) ; ce rendu ne le fait pas.
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

        var puceId = opts.afficherId ? BibliothequeUI.renderPuceId(opts.id) : '';

        return '<div class="' + classeItem + ' biblio-carte biblio-carte--disponible" ' + dataAttrs + _ancreItem(opts.id) + ' style="' + opacite + styleExtra + '">' +
            '<div class="biblio-carte-contenu">' +
                '<div style="flex: 1;">' +
                    '<div class="biblio-carte-titre">' +
                        badgesPratiques +
                        opts.nom +
                        ' ' + opts.badgeSource +
                    '</div>' +
                    ligneInspireDe +
                    '<div class="biblio-carte-meta">' + opts.metadonnees + puceId + '</div>' +
                    descHTML +
                    (opts.dejaPresent ? '<div class="biblio-carte-deja">Déjà dans ta sélection</div>' : '') +
                '</div>' +
                actionsHTML +
            '</div>' +
        '</div>';
    };

    /* ===========================================================
       #291 — LE BANDEAU DÉSIGNE, IL NE DÉCRIT PLUS
       ===========================================================

       CE QUI ÉTAIT SERVI JUSQU'AU 23 AOÛT 2026 :

         « ⚠️ 4 doublon(s) potentiel(s) détecté(s) […] Survole un ID pour voir
           sa valeur complète — IDs identiques = vraies copies, IDs différents
           = homonymes légitimes. »

       Les deux moitiés de cette consigne étaient FAUSSES :

         · « IDs identiques » ne pouvait JAMAIS se produire : les détecteurs
           dédupliquaient par `id` avant de regrouper, donc la branche était
           morte ;
         · « IDs différents = homonymes légitimes » était servi aussi bien à
           une COPIE qu'à deux entités réellement distinctes. L'application
           affirmait donc que ses propres copies étaient des homonymes.

       La consigne n'est pas reformulée : elle est SUPPRIMÉE. À la place, la
       catégorie est CALCULÉE (`analyserDoublons`, js/identite-item.js) et
       chaque exemplaire est nommé, daté, identifié et atteignable.

       ⚠ AUCUNE CASE À COCHER NE PORTE UN VERDICT (règle des portes terrain) :
       la catégorie est calculée et affichée, jamais laissée à un interrupteur.
       =========================================================== */

    var _CATEGORIES_DOUBLON = {
        'collision-id': {
            puce: '🔴',
            titre: 'Collision d\'identifiant',
            classe: 'biblio-doublon-groupe--collision',
            explication: function (n) {
                return 'Anomalie de données : ' + n + ' entrées portent le même identifiant. ' +
                    'Ce n\'est pas une duplication ordinaire — signale-le.';
            }
        },
        'copie': {
            puce: '🟠',
            titre: 'Copies',
            classe: 'biblio-doublon-groupe--copie',
            explication: function (n) {
                return n + ' exemplaires issus du même original. Tu peux n\'en garder qu\'un.';
            }
        },
        'homonymes': {
            puce: '🔵',
            titre: 'Homonymes',
            classe: 'biblio-doublon-groupe--homonymes',
            explication: function (n) {
                return n + ' entités distinctes portant le même nom. Ce n\'est pas un défaut — ' +
                    'renomme-les seulement si tu veux les distinguer d\'un coup d\'œil.';
            }
        }
    };

    /**
     * Date d'affichage d'un item, dans l'ordre où le corpus la range.
     * Coupe à AAAA-MM-JJ : une heure n'aide personne à trancher un doublon.
     */
    function _dateItem(item) {
        if (!item) return '';
        var brute = item.dateModification || item.dateCreation ||
                    item.dateAjoutBiblio || item.dateImport || item.dateAjout || '';
        return brute ? String(brute).slice(0, 10) : '';
    }

    /**
     * Un bouton d'action de ligne d'exemplaire. Zéro handler inline.
     * Les `data-param*` portent des identifiants venus du stockage : contexte
     * d'attribut, donc `echapperAttribut` (CT-29).
     */
    function _boutonExemplaire(btn) {
        var attrs = ' data-action="' + echapperAttribut(btn.action) + '"';
        if (btn.param != null) attrs += ' data-param="' + echapperAttribut(btn.param) + '"';
        if (btn.param2 != null) attrs += ' data-param2="' + echapperAttribut(btn.param2) + '"';
        return '<button type="button"' + attrs +
            ' class="btn ' + (btn.classe || 'btn-secondaire') + ' biblio-doublon-action"' +
            ' title="' + echapperAttribut(btn.title || btn.label) + '">' +
            echapperHtml(btn.label) + '</button>';
    }

    /**
     * Rend le bandeau des groupes de même nom, catégorie par catégorie.
     *
     * @param {Array} groupes - sortie de `analyserDoublons` (js/identite-item.js)
     * @param {Object} [opts]
     * @param {Array}  [opts.itemsSelection] - items actuellement dans la barre
     *        latérale : décide si la ligne propose « Retirer / Supprimer »
     *        (l'item est à toi) ou « Supprimer de la bibliothèque ».
     * @param {Object} [opts.actions] - noms des actions EXISTANTES de la famille :
     *        {retirer, supprimer, supprimerPartagee, champParam2}
     *        `champParam2` nomme le champ de l'item à passer en 2e paramètre
     *        (cartouches : 'grilleId'). On ne crée aucune action neuve.
     * @returns {string} HTML du bandeau ('' si rien à signaler)
     */
    BibliothequeUI.renderAvertissementDoublons = function (groupes, opts) {
        if (!groupes || groupes.length === 0) return '';
        opts = opts || {};
        var actions = opts.actions || {};
        var selection = Array.isArray(opts.itemsSelection) ? opts.itemsSelection : [];

        function estDansSelection(item) {
            if (!item) return false;
            if (item.dansBibliotheque === false) return false;
            return selection.some(function (x) {
                return x === item || (x && x.id && item.id && x.id === item.id);
            });
        }

        var blocsHTML = groupes.map(function (groupe) {
            var meta = _CATEGORIES_DOUBLON[groupe.categorie] || _CATEGORIES_DOUBLON.homonymes;

            // Un numéro de lignée n'a de sens que s'il y en a plusieurs à
            // distinguer : sur un groupe d'une seule lignée, il n'apporterait
            // qu'un chiffre de plus à lire.
            var nbLignees = new Set(groupe.exemplaires.map(function (e) { return e.lignee; })).size;

            var lignesHTML = groupe.exemplaires.map(function (ex) {
                var item = ex.item || {};
                var dansSelection = estDansSelection(item);
                var param2 = actions.champParam2 ? item[actions.champParam2] : null;

                var boutons = [{
                    label: 'Voir',
                    action: 'BibliothequeUI.voirItemDoublon',
                    param: ex.id,
                    classe: 'btn-secondaire',
                    title: 'Aller à cette carte dans la liste et la mettre en évidence'
                }];

                if (dansSelection && actions.retirer) {
                    boutons.push({
                        label: 'Retirer', action: actions.retirer, param: ex.id, param2: param2,
                        classe: 'btn-secondaire',
                        title: 'Retirer de ta sélection (données conservées)'
                    });
                }
                if (dansSelection && actions.supprimer) {
                    boutons.push({
                        label: 'Supprimer', action: actions.supprimer, param: ex.id, param2: param2,
                        classe: 'btn-supprimer', title: 'Supprimer définitivement'
                    });
                } else if (!dansSelection && actions.supprimerPartagee) {
                    boutons.push({
                        label: 'Supprimer', action: actions.supprimerPartagee, param: ex.id,
                        classe: 'btn-supprimer',
                        title: 'Supprimer définitivement de la Bibliothèque'
                    });
                }

                var date = _dateItem(item);
                var reperes = '';
                if (nbLignees > 1) {
                    reperes += '<span class="biblio-doublon-lignee">Lignée ' + ex.lignee + '</span>';
                }
                if (ex.collisionId) {
                    reperes += '<span class="biblio-doublon-collision">identifiant en double</span>';
                }

                return '<li class="biblio-doublon-exemplaire">' +
                    '<span class="biblio-doublon-desc">' +
                        '<strong>' + echapperHtml(ex.nomAffiche) + '</strong> ' +
                        BibliothequeUI.renderPuceId(ex.id) +
                        (date ? '<span class="biblio-doublon-date">modifié le ' + echapperHtml(date) + '</span>' : '') +
                        BibliothequeUI.genererBadgeSource(item) +
                        (dansSelection ? '<span class="biblio-doublon-lieu">Dans ta sélection</span>'
                                       : '<span class="biblio-doublon-lieu biblio-doublon-lieu--partagee">Bibliothèque</span>') +
                        reperes +
                    '</span>' +
                    '<span class="biblio-doublon-actions">' +
                        boutons.map(_boutonExemplaire).join('') +
                    '</span>' +
                '</li>';
            }).join('');

            return '<div class="biblio-doublon-groupe ' + meta.classe + '">' +
                '<div class="biblio-doublon-titre">' +
                    meta.puce + ' ' + echapperHtml(meta.titre) +
                    ' — « ' + echapperHtml(groupe.nom) + ' »' +
                '</div>' +
                '<p class="biblio-doublon-explication">' +
                    echapperHtml(meta.explication(groupe.count)) +
                '</p>' +
                '<ul class="biblio-doublon-exemplaires">' + lignesHTML + '</ul>' +
            '</div>';
        }).join('');

        return '<div class="biblio-doublons">' +
            '<div class="biblio-doublons-entete">' +
                groupes.length + ' groupe(s) portent le même nom' +
            '</div>' +
            '<p class="biblio-doublons-intro">' +
                'Un même nom n\'est pas forcément un défaut. Voici ce qu\'est chaque groupe, ' +
                'et de quoi trancher sur place.' +
            '</p>' +
            blocsHTML +
        '</div>';
    };

    /**
     * #291 §3.3 — « Voir » amène à la carte au lieu de la décrire.
     *
     * « Les rechercher manuellement par leur ID est laborieux. » Ce n'est plus
     * à l'utilisateur de faire la correspondance : on l'y conduit.
     *
     * Plusieurs cartes peuvent porter le même identifiant — c'est exactement le
     * cas « collision » — donc on les met TOUTES en évidence et on défile vers
     * la première.
     *
     * @param {string} id - identifiant complet de l'exemplaire
     */
    BibliothequeUI.voirItemDoublon = function (id) {
        if (!id) return;

        var resultat = BibliothequeUI.pointerVersItems([id]);

        if (!resultat.trouves.length) {
            // Un filtre actif ou un dossier replié peut masquer la carte : le
            // dire, plutôt que de ne rien faire et laisser croire à une panne.
            if (typeof notifications !== 'undefined' && notifications.info) {
                notifications.info('Cette carte n\'est pas affichée en ce moment.',
                    'Vide le champ de recherche ou les filtres, puis réessaie.');
            }
        }
    };

    /**
     * Conduit l'œil à un ou plusieurs items de la modale ouverte : défilement
     * vers le premier, surbrillance de tous pendant 2,2 s.
     *
     * ⚠ MESURÉ LE 8 SEPTEMBRE 2026, rapport testeur « la bibliothèque n'est pas
     * rafraîchie au moment de l'importation d'une grille ». Elle L'ÉTAIT : sur
     * une bibliothèque de 60 grilles, la carte importée arrivait 61e sur 61, à
     * 8 548 px sous le bas de la fenêtre, sur une modale que la reconstruction
     * remet en haut (scrollTop 0, contenu de 9 326 px pour 646 px visibles).
     * L'écriture était bonne, le rendu aussi ; c'est le RÉSULTAT qui n'était
     * jamais sous les yeux. Un rafraîchissement qu'on ne voit pas ne se
     * distingue pas d'une panne.
     *
     * Plusieurs cartes peuvent porter le même identifiant — c'est le cas
     * « collision » de #291 — donc on les met TOUTES en évidence.
     *
     * @param {string[]} ids - identifiants complets des exemplaires visés
     * @returns {{trouves: string[], absents: string[]}} `absents` = les ids
     *   qu'aucune carte ne porte : filtre actif, dossier replié, ou item écrit
     *   en base mais masqué au rendu. L'appelant peut alors le DIRE au lieu
     *   d'annoncer un succès que l'écran ne montre pas.
     */
    BibliothequeUI.pointerVersItems = function (ids) {
        var resultat = { trouves: [], absents: [] };
        if (!Array.isArray(ids) || !ids.length || typeof document === 'undefined') return resultat;

        var cibles = [];
        ids.forEach(function (id) {
            if (!id) return;
            var trouvees = document.querySelectorAll(
                '[data-biblio-item-id="' + String(id).replace(/["\\]/g, '\\$&') + '"]');
            if (trouvees.length) {
                resultat.trouves.push(id);
                Array.prototype.push.apply(cibles, Array.prototype.slice.call(trouvees));
            } else {
                resultat.absents.push(id);
            }
        });

        if (!cibles.length) return resultat;

        cibles[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cibles.forEach(function (el) { el.classList.add('biblio-carte--pointee'); });
        setTimeout(function () {
            cibles.forEach(function (el) { el.classList.remove('biblio-carte--pointee'); });
        }, 2200);

        return resultat;
    };

    /**
     * #793 (11 oct. 2026) — APRÈS UN IMPORT, CONDUIRE L'ŒIL AU RÉSULTAT, pour les cinq
     * familles. Le geste des grilles (rapport testeur du 8 sept.) : la bibliothèque ouverte
     * est redessinée, puis les cartes importées sont pointées. Si l'écriture a réussi mais
     * qu'aucune carte ne la porte ET que la case « Masquer… » est là, cochée, dans la modale
     * redessinée, la phrase qui le dit est rendue. Relecture de Cowork (11 oct.) : la préférence
     * est commune aux cinq familles, mais la case n'existe que dans trois modales, et un
     * élément rangé dans un dossier n'a pas de carte visible non plus ; ailleurs, on se tait
     * plutôt que de renvoyer à une case ou à un filtre absents. Seules les GRILLES gardent leur
     * phrase d'avant (`options.repliFiltre`, 8 sept., le filtre démo, éprouvé par leur spec) :
     * elle n'est pas neuve chez elles. Bibliothèque fermée : rien.
     *
     * @param {string} modalId - id de la modale de bibliothèque de la famille
     * @param {Function} rafraichir - redessine la bibliothèque (async ou non)
     * @param {string[]} ids - ids des éléments importés
     * @param {{repliFiltre?: boolean}} [options] - grilles seulement : la phrase générique d'avant
     * @returns {Promise<string|null>} la phrase « masqué par un filtre », ou null
     */
    BibliothequeUI.conduireAuxImportes = async function (modalId, rafraichir, ids, options) {
        if (typeof document === 'undefined' || !document.getElementById(modalId)) return null;
        await rafraichir();
        var pointage = BibliothequeUI.pointerVersItems(ids);
        if (pointage.trouves.length > 0 || pointage.absents.length === 0) return null;
        var modal = document.getElementById(modalId);
        var caseMasquer = (modal && typeof modal.querySelector === 'function')
            ? modal.querySelector('.biblio-toggle-deja-present input[type="checkbox"]') : null;
        if (caseMasquer && caseMasquer.checked) {
            return 'Aucune n\'apparaît dans la liste : décoche « Masquer les éléments déjà dans ta sélection » pour les voir.';
        }
        return (options && options.repliFiltre)
            ? 'Aucune n\'apparaît dans la liste : un filtre d\'affichage les masque ici.'
            : null;
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
     * @param {string} [config.sectionPartages] - HTML optionnel de la section
     *        « Partagés par des collègues » (#329 P4, partageSection.genererSectionHTML)
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

                (config.sectionPartages || '') +

            '</div>' +
        '</div>';

        document.body.insertAdjacentHTML('beforeend', html);
    };

    /* =====================================================================
       SECTION « IMPORTER DEPUIS UN AUTRE TRIMESTRE » — SURVIVRE À LA
       RECONSTRUCTION DU MODAL (24 août 2026)

       Retour de Grégoire : « la section se referme aussitôt que je clique pour
       importer une cartouche. Je dois l'ouvrir à chaque cartouche. » Mesuré : le
       défaut est le MÊME dans les cinq bibliothèques — importer un élément
       rafraîchit la liste en appelant `afficherBibliothequeX()`, qui reconstruit
       le modal de zéro. Le trimestre choisi, l'aperçu déplié et la position de
       défilement disparaissent avec l'ancien DOM.

       Importer dix cartouches demandait donc dix fois : rouvrir la biblio,
       redérouler le menu, recliquer « Voir les cartouches », refaire défiler.

       Le remède est volontairement MINIMAL : on ne touche pas au cycle de
       reconstruction (le refaire en place toucherait cinq modules et cinq
       rendus). On capture l'état AVANT, on le repose APRÈS. Deux fonctions,
       un seul endroit.
       ===================================================================== */

    /**
     * Capture l'état de la section d'import AVANT reconstruction du modal.
     *
     * @param {Object} config
     * @param {string} config.modalId - ex. 'modalBibliothequeCartouches'
     * @param {string[]} config.selects - ids des <select> à restaurer, dans
     *        l'ordre de dépendance (le trimestre d'abord ; productions a un
     *        second select de cours qui en dépend).
     * @param {string} config.apercu - id du conteneur d'aperçu
     * @returns {Object|null} état opaque, à passer à `restaurerImportTrimestre`
     */
    BibliothequeUI.capturerImportTrimestre = function (config) {
        if (!config || !config.selects || !config.selects.length) return null;

        var valeurs = {};
        config.selects.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) valeurs[id] = el.value;
        });

        var apercu = config.apercu ? document.getElementById(config.apercu) : null;
        var contenu = document.querySelector('#' + config.modalId + ' .modal-js-contenu');

        return {
            modalId: config.modalId,
            selects: config.selects,
            apercu: config.apercu,
            valeurs: valeurs,
            // Un aperçu replié n'a pas à se rouvrir tout seul : on repose
            // exactement ce qui était à l'écran, jamais davantage.
            apercuOuvert: !!(apercu && !apercu.classList.contains('u-hide')),
            defilement: contenu ? contenu.scrollTop : 0
        };
    };

    /**
     * Repose l'état capturé APRÈS reconstruction du modal.
     *
     * @param {Object|null} etat - retour de `capturerImportTrimestre`
     * @param {Function} [rouvrirApercu] - la fonction « Voir les X » du module
     * @param {Function} [repeuplerDependants] - appelée après avoir reposé le
     *        PREMIER select, pour les modules dont un second en dépend
     *        (productions : le filtre de cours, peuplé par un handler onchange
     *        que la restauration programmatique ne déclenche pas).
     */
    BibliothequeUI.restaurerImportTrimestre = async function (etat, rouvrirApercu, repeuplerDependants) {
        if (!etat) return;

        for (var i = 0; i < etat.selects.length; i++) {
            var id = etat.selects[i];
            var el = document.getElementById(id);
            if (!el) continue;
            var valeur = etat.valeurs[id];
            if (valeur === undefined || valeur === '') continue;
            // Ne poser que des valeurs qui existent encore : un trimestre peut
            // avoir disparu de la liste entre-temps (plus rien à en importer).
            var existe = Array.prototype.some.call(el.options, function (o) { return o.value === valeur; });
            if (!existe) continue;
            el.value = valeur;
            if (i === 0 && typeof repeuplerDependants === 'function') {
                await repeuplerDependants();
            }
        }

        if (etat.apercuOuvert && typeof rouvrirApercu === 'function') {
            await rouvrirApercu();
        }

        // Le défilement se repose EN DERNIER : rouvrir l'aperçu change la
        // hauteur du contenu, donc un scrollTop posé avant serait écrasé.
        var contenu = document.querySelector('#' + etat.modalId + ' .modal-js-contenu');
        if (contenu && etat.defilement) contenu.scrollTop = etat.defilement;
    };

    /* =====================================================================
       #327 — RÉPERTOIRES DE CLASSEMENT : couche UI GÉNÉRIQUE (transversale).
       Généralise l'UI livrée pour les pratiques en #320 (zone « Mes dossiers »
       repliable, pool groupé en selects compacts, assignation) à TOUTES les
       bibliothèques. Le moteur (js/repertoires-bibliotheque.js) est déjà
       paramétré par `biblio` ; ici on mutualise le rendu et les handlers.

       Chaque bibliothèque s'enregistre une fois via `enregistrer(biblio, cfg)`
       en fournissant ses callbacks spécifiques (rafraîchir la modale, ajouter /
       supprimer un item, libeller un item). Les handlers génériques reçoivent
       la `biblio` en premier data-param, sans jamais utiliser `this`
       (le dispatcher data-action appelle fn(param, param2, param3)).

       Garde-fous : aucune mutation des items (couche par-dessus, par identité) ;
       noms échappés (echapperHtml) ; data-action (CSP). Cf. SKILL_integrite_globaux.
       ===================================================================== */
    (function () {
        // Registre des bibliothèques (callbacks spécifiques par `biblio`).
        var _config = {};
        // État (mémoire de session) du dépliage de la zone, PAR bibliothèque :
        // repliée par défaut s'il existe des dossiers, dépliée s'il n'y en a aucun.
        var _deplie = {};

        function _cfg(biblio) {
            return _config[biblio] || {};
        }

        function _moteur() {
            return window.repertoiresBibliotheque;
        }

        function _reps(biblio) {
            var m = _moteur();
            return (m && typeof m.obtenir === 'function') ? m.obtenir(biblio) : [];
        }

        function _labelPluriel(biblio) {
            return _cfg(biblio).labelPluriel || 'éléments';
        }

        // Libellé d'affichage d'un item dans un select (callback ou défaut).
        function _labelItem(biblio, item) {
            var fn = _cfg(biblio).labelItem;
            if (typeof fn === 'function') return fn(item);
            return BibliothequeUI.formaterTitre((item && item.nom) || 'Sans titre');
        }

        async function _rafraichir(biblio) {
            var fn = _cfg(biblio).rafraichir;
            if (typeof fn === 'function') await fn();
        }

        /**
         * Enregistre une bibliothèque et ses callbacks spécifiques.
         * @param {string} biblio  clé de bibliothèque ('pratiques', 'grilles'…)
         * @param {Object} cfg
         *   - rafraichir   {Function}  ré-affiche la modale après mutation (async ok)
         *   - ajouterItem  {Function}  (id) => ajoute l'item à la sélection (optionnel)
         *   - supprimerItem{Function}  (id) => supprime l'item de la biblio (optionnel)
         *   - labelItem    {Function}  (item) => texte d'option de select (optionnel)
         *   - labelPluriel {string}    pour les textes d'aide/confirmation ('pratiques'…)
         */
        BibliothequeUI.repertoires = {};

        BibliothequeUI.repertoires.enregistrer = function (biblio, cfg) {
            _config[biblio] = cfg || {};
        };

        // --- Zone « Mes dossiers » (repliable) -------------------------------

        /** HTML de la zone « Mes dossiers » (créer / renommer / supprimer). */
        BibliothequeUI.repertoires.genererZone = function (biblio) {
            var reps = _reps(biblio);
            var deplie = _deplie[biblio] || reps.length === 0;
            var pluriel = _labelPluriel(biblio);

            var lignes = reps.map(function (r) {
                var id = echapperHtml(r.id);
                var b = echapperHtml(biblio);
                return '<div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">' +
                    '<input type="text" data-rep-biblio="' + b + '" data-rep-id="' + id + '" value="' + echapperHtml(r.nom || '') + '" class="controle-form" style="flex:1;" aria-label="Nom du dossier" />' +
                    '<button data-action="BibliothequeUI.repertoires.renommer" data-param="' + b + '" data-param2="' + id + '" class="btn btn-secondaire btn-mini">Renommer</button>' +
                    // Lot C (5 sept. 2026) : la corbeille, comme partout — le geste et sa confirmation ne changent pas.
                    window.boutonRetirerBloc({ action: 'BibliothequeUI.repertoires.supprimer', param: biblio, param2: r.id, titre: 'Supprimer le dossier',
                                               confirm: 'Supprimer ce dossier ? Son contenu n\'est pas supprimé : les ' + pluriel + ' repassent en « non classées ».' }) +
                    '</div>';
            }).join('');

            if (!lignes) {
                lignes = '<p style="color: var(--gris-clair); font-style: italic; margin:0 0 6px;">Aucun dossier pour l\'instant. Crée-en un pour ranger tes ' + pluriel + '.</p>';
            }

            var b = echapperHtml(biblio);
            return '<div style="border:1px solid var(--bordure, #ddd); border-radius:8px; padding:12px; margin-bottom:15px; background:var(--surface-carte, #fff);">' +
                '<button type="button" data-action="BibliothequeUI.repertoires.basculer" data-param="' + b + '" aria-expanded="' + deplie + '" style="background:none; border:none; padding:0; cursor:pointer; font:inherit; font-weight:600; color:var(--texte-principal, #222); display:flex; align-items:center; gap:6px;">' +
                    '<span id="rep-' + b + '-zone-icone" aria-hidden="true">' + (deplie ? '▾' : '▸') + '</span> Mes dossiers' + (reps.length ? ' (' + reps.length + ')' : '') +
                '</button>' +
                '<div id="rep-' + b + '-zone-contenu" style="' + (deplie ? 'margin-top:8px;' : 'display:none;') + '">' +
                    '<div id="rep-' + b + '-liste">' + lignes + '</div>' +
                    '<div style="display:flex; gap:6px; margin-top:8px;">' +
                        '<input type="text" id="rep-' + b + '-nouveau-nom" class="controle-form" placeholder="Nom d\'un nouveau dossier" style="flex:1;" aria-label="Nom du nouveau dossier" />' +
                        '<button data-action="BibliothequeUI.repertoires.creer" data-param="' + b + '" class="btn btn-principal btn-mini">Créer le dossier</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        };

        /** Replie/déplie « Mes dossiers » sans re-rendu (préserve le scroll). */
        BibliothequeUI.repertoires.basculer = function (biblio) {
            _deplie[biblio] = !_deplie[biblio];
            var contenu = document.getElementById('rep-' + biblio + '-zone-contenu');
            var icone = document.getElementById('rep-' + biblio + '-zone-icone');
            if (contenu) {
                contenu.style.display = _deplie[biblio] ? '' : 'none';
                if (_deplie[biblio]) contenu.style.marginTop = '8px';
            }
            if (icone) icone.textContent = _deplie[biblio] ? '▾' : '▸';
        };

        // --- Mutations sur les dossiers --------------------------------------

        BibliothequeUI.repertoires.creer = async function (biblio) {
            var input = document.getElementById('rep-' + biblio + '-nouveau-nom');
            if (!input) return;
            if (!input.value || !input.value.trim()) {
                if (window.notifications && typeof notifications.info === 'function') notifications.info('Donne un nom au dossier.');
                return;
            }
            _moteur().creer(input.value, biblio);
            _deplie[biblio] = true; // rester déplié pendant la gestion
            await _rafraichir(biblio);
        };

        BibliothequeUI.repertoires.renommer = async function (biblio, repId) {
            var input = document.querySelector('input[data-rep-biblio="' + biblio + '"][data-rep-id="' + repId + '"]');
            if (!input || !input.value || !input.value.trim()) return;
            _moteur().renommer(repId, input.value);
            _deplie[biblio] = true;
            await _rafraichir(biblio);
        };

        BibliothequeUI.repertoires.supprimer = async function (biblio, repId) {
            _moteur().supprimer(repId);
            _deplie[biblio] = true;
            await _rafraichir(biblio);
        };

        /** Range un item dans un dossier (exclusif), puis rafraîchit. */
        BibliothequeUI.repertoires.classer = async function (biblio, itemId, repId) {
            _moteur().assigner(itemId, repId, biblio);
            await _rafraichir(biblio);
        };

        /** Sort un item de son dossier (repasse en non classées), puis rafraîchit. */
        BibliothequeUI.repertoires.retirer = async function (biblio, itemId) {
            _moteur().retirerItem(itemId, biblio);
            await _rafraichir(biblio);
        };

        // --- Ligne compacte d'un dossier : select + Ajouter + menu ⋮ ----------
        // Actions agissant sur l'item SÉLECTIONNÉ dans le select du dossier.

        function _idSelectionne(selectId) {
            var s = document.getElementById(selectId);
            return s && s.value ? s.value : null;
        }

        /**
         * Rend la ligne compacte d'un groupe-dossier : un select de ses items +
         * bouton « Ajouter » + menu ⋮ (déplacer vers un autre dossier / retirer /
         * supprimer). `groupe` = { id, titre, items } issu de repertoiresBibliotheque.grouper.
         * Gagne de l'espace vertical vs une carte par item.
         */
        BibliothequeUI.repertoires.renderLigneDossierSelect = function (biblio, groupe) {
            var selectId = 'rep-' + biblio + '-select-' + groupe.id;
            var b = echapperHtml(biblio);
            var sid = echapperHtml(selectId);
            var options = groupe.items.map(function (item) {
                return '<option value="' + echapperHtml(item.id) + '">' + echapperHtml(_labelItem(biblio, item)) + '</option>';
            }).join('');

            var actions = [];
            _reps(biblio).forEach(function (r) {
                if (r.id !== groupe.id) {
                    actions.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classerSel', param: biblio, param2: selectId, param3: r.id, classe: 'btn-secondaire', title: 'Déplacer vers ce dossier' });
                }
            });
            actions.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirerSel', param: biblio, param2: selectId, classe: 'btn-secondaire', title: 'Sortir du dossier (repasse en non classées)' });
            if (typeof _cfg(biblio).supprimerItem === 'function') {
                actions.push({ label: 'Supprimer de la bibliothèque', action: 'BibliothequeUI.repertoires.supprimerSel', param: biblio, param2: selectId, classe: 'btn-supprimer', title: 'Supprimer définitivement', showAlways: true });
            }

            var boutonAjouter = (typeof _cfg(biblio).ajouterItem === 'function')
                ? '<button data-action="BibliothequeUI.repertoires.ajouterSel" data-param="' + b + '" data-param2="' + sid + '" class="btn btn-principal btn-mini">Ajouter</button>'
                : '';

            return '<div style="display:flex; gap:6px; align-items:center; margin-bottom:10px;">' +
                '<select id="' + sid + '" class="controle-form" style="flex:1;" aria-label="' + echapperHtml(_labelPluriel(biblio)) + ' du dossier ' + echapperHtml(groupe.titre) + '">' + options + '</select>' +
                boutonAjouter +
                BibliothequeUI.renderMenuActions(actions, selectId) +
            '</div>';
        };

        /** Ajoute à la sélection l'item choisi dans le select du dossier. */
        BibliothequeUI.repertoires.ajouterSel = async function (biblio, selectId) {
            var id = _idSelectionne(selectId);
            var fn = _cfg(biblio).ajouterItem;
            if (id && typeof fn === 'function') await fn(id);
        };

        /** Déplace l'item choisi vers un autre dossier (exclusif). */
        BibliothequeUI.repertoires.classerSel = async function (biblio, selectId, repId) {
            var id = _idSelectionne(selectId);
            if (!id) return;
            _moteur().assigner(id, repId, biblio);
            await _rafraichir(biblio);
        };

        /** Sort l'item choisi de son dossier (repasse en non classées). */
        BibliothequeUI.repertoires.retirerSel = async function (biblio, selectId) {
            var id = _idSelectionne(selectId);
            if (!id) return;
            _moteur().retirerItem(id, biblio);
            await _rafraichir(biblio);
        };

        /** Supprime de la bibliothèque l'item choisi dans le select. */
        BibliothequeUI.repertoires.supprimerSel = async function (biblio, selectId) {
            var id = _idSelectionne(selectId);
            var fn = _cfg(biblio).supprimerItem;
            if (id && typeof fn === 'function') await fn(id);
        };
    })();

    // Exposer globalement
    window.BibliothequeUI = BibliothequeUI;
})();
