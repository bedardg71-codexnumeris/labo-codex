/**
 * partage-section.js — Lot P4 : section « Partagés » dans les bibliothèques
 *
 * Chantier #329 Voûte Phase 1, lot P4 (avancé avant le jalon pilote,
 * décision Grégoire 10 juin 2026 — sans elle, un .lcz importé n'est
 * utilisable nulle part dans l'app).
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 *
 * Rôle : chaque modale de bibliothèque affiche une 3e section « Partagés
 * par des collègues » listant les items des clés `partage_*` (importés par
 * js/partage-import.js). Ces items sont NON MODIFIABLES : on ne les édite
 * pas, on les « Duplique vers mes documents », ce qui crée une copie
 * MODIFIABLE dans les collections de l'utilisateur. L'interdiction de
 * référencer un item partagé dans un assemblage est garantie PAR
 * CONSTRUCTION : les items partagés n'entrent jamais dans les collections
 * que lisent les sélecteurs.
 *
 * Non modifiable ne veut pas dire subi : le menu ⋮ de chaque carte porte
 * « Supprimer », qui retire la COPIE IMPORTÉE de `partage_*` (25 août 2026,
 * demande de Grégoire — voir le bloc « Suppression d'un item partagé »).
 *
 * DUPLICATION AVEC DÉPENDANCES (cohérent avec le modèle d'export) :
 *  - grille      → copie + SES cartouches partagées (grilleId remappé,
 *                  écrites dans `cartouches_{nouvelId}`)
 *  - cartouche   → duplique SA grille parente entière (une cartouche sans
 *                  sa grille est inutilisable — ancrage cartouches_{grilleId})
 *  - production  → copie + sa grille partagée (et les cartouches de
 *                  celle-ci) si grilleId pointe un item partagé
 *  - echelle, pratique → copie directe
 *
 * CONVENTIONS DE COPIE (mêmes que les `dupliquer*Bibliotheque` existants) :
 * id neuf via genererIdUnique, auteur = window.BibliothequeUI.obtenirAuteurActif(),
 * dansBibliotheque: true, metadata_cc retiré ; `inspireDe` posé à l'import
 * (auteur d'origine + idOriginal, D7) est CONSERVÉ — c'est la trace CC.
 * Les collections `partage_*` ne sont JAMAIS modifiées par la duplication.
 *
 * SÉCURITÉ : les noms viennent de packages importés (déjà sanitisés par
 * validerPackage niveau 5) — ré-échappés ici par défense en profondeur
 * avant insertion dans le HTML des cartes.
 *
 * Tests : tests/unit/partage-section-P4.test.js (duplication par type,
 * dépendances, invariant « la duplication n'écrit pas dans partage_* »,
 * suppression et sa cascade) + flux Playwright dans
 * tests/integration/partage-import-rendu.spec.js.
 */
(function () {
    'use strict';

    var partageSection = {};

    var CLES_STOCKAGE = {
        grille: 'partage_grilles',
        echelle: 'partage_echelles',
        cartouche: 'partage_cartouches',
        production: 'partage_productions',
        pratique: 'partage_pratiques'
    };

    var PREFIXES_ID = {
        grille: 'GRILLE_',
        echelle: 'ECH_',
        cartouche: 'CART_',
        production: 'PROD_',
        pratique: 'pratique_'
    };

    // Modale à rafraîchir après duplication, par type.
    var FONCTIONS_MODALE = {
        grille: 'afficherBibliothequeGrilles',
        echelle: 'afficherBibliothequeEchelles',
        cartouche: 'afficherBibliothequeCartouches',
        production: 'afficherBibliothequeProductions',
        pratique: 'afficherBibliothequePratiques'
    };

    var IDS_MODALE = {
        grille: 'modalBibliothequeGrilles',
        echelle: 'modalBibliothequeEchelles',
        cartouche: 'modalBibliothequeCartouches',
        production: 'modalBibliothequeProductions',
        pratique: 'modalBibliothequePratiques'
    };

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    function lire(cle) {
        if (typeof db === 'undefined' || !db.getSync) return [];
        var v = db.getSync(cle, []);
        return Array.isArray(v) ? v : [];
    }

    function ecrire(cle, valeur) {
        db.setSync(cle, valeur);
    }

    function echapper(s) {
        if (typeof echapperHtml === 'function') return echapperHtml(s);
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function nomDe(item) {
        return String(item.nom || item.titre || '(sans nom)');
    }

    function auteurDe(item) {
        return (item.inspireDe && item.inspireDe.auteur) ? String(item.inspireDe.auteur) : 'auteur inconnu';
    }

    /**
     * Copie « propre » d'un item partagé vers les documents de l'utilisateur :
     * id neuf, auteur actif, visible en sidebar, metadata_cc retiré,
     * inspireDe (trace de provenance posée à l'import, D7) conservé.
     */
    function copiePropre(item, type) {
        var copie = JSON.parse(JSON.stringify(item));
        copie.id = genererIdUnique(PREFIXES_ID[type]);
        copie.auteur = (window.BibliothequeUI && window.BibliothequeUI.obtenirAuteurActif)
            ? window.BibliothequeUI.obtenirAuteurActif() : 'Inconnu';
        copie.dansBibliotheque = true;
        copie.isDemo = false;
        copie.dateCreation = new Date().toISOString();
        copie.dateModification = copie.dateCreation;
        delete copie.metadata_cc;
        delete copie.dateAjoutBiblio;
        return copie;
    }

    function cleProductions() {
        if (typeof getCleProductions === 'function') return getCleProductions();
        return window.cle('productions');
    }

    function ajouterACollection(cle, item) {
        var collection = lire(cle);
        collection.push(item);
        ecrire(cle, collection);
    }

    // ------------------------------------------------------------------
    // Duplication (storage pur — testé en Vitest)
    // ------------------------------------------------------------------

    /**
     * Lecteur des cartouches SOURCE pour la Voûte : collection PLATE
     * partage_cartouches filtrée par grilleId. Lecteur par défaut de
     * dupliquerGrillePartagee.
     */
    function lireCartouchesPartageDe(grille) {
        return lire(CLES_STOCKAGE.cartouche).filter(function (c) {
            return c.grilleId === grille.id;
        });
    }

    /**
     * Duplique une grille (d'une SOURCE quelconque) + ses cartouches liées vers
     * les documents de l'utilisateur. Retourne { grille, nbCartouches }.
     *
     * Brique C (namespacing) : la lecture des cartouches liées est INJECTÉE via
     * lireCartouchesDe(grille), pour que la même mécanique serve deux sources aux
     * stockages différents — la Voûte (collection plate partage_cartouches, lecteur
     * par défaut) et un import inter-trimestre (cartouches par CLÉ cartouches_{grilleId},
     * lues via cleSource au pas 4). La source n'est JAMAIS mutée (copiePropre fait une
     * copie profonde). La destination = les collections du trimestre actif via cle()
     * (#358 Option A, Brique D : `cle('grillesTemplates')` = `<trim>_grillesTemplates`).
     * Les cartouches restent ancrées par `cartouches_{nouvelId}` (clé neuve, non
     * namespacée par modèle — hors périmètre #358).
     *
     * Report ASSUMÉ au pas 4 (D-C4) : une cartouche copiée conserve son echelleId
     * source (pas de remappage d'échelle ici) — verrouillé par un test-témoin.
     *
     * @param {Object} grilleSource - grille à copier (objet déjà résolu par le caller)
     * @param {Function} [lireCartouchesDe] - (grille) => Array des cartouches liées ;
     *                   défaut = lecteur Voûte (collection plate)
     */
    function dupliquerGrillePartagee(grilleSource, lireCartouchesDe) {
        var copie = copiePropre(grilleSource, 'grille');
        ajouterACollection(window.cle('grillesTemplates'), copie);

        var lecteur = (typeof lireCartouchesDe === 'function') ? lireCartouchesDe : lireCartouchesPartageDe;
        var cartouchesLiees = lecteur(grilleSource) || [];
        if (cartouchesLiees.length) {
            var copies = cartouchesLiees.map(function (c) {
                var cc = copiePropre(c, 'cartouche');
                cc.grilleId = copie.id;
                return cc;
            });
            // Clé neuve (ancrage de la grille copiée) — rien d'existant à préserver.
            ecrire('cartouches_' + copie.id, copies);
        }
        return { grille: copie, nbCartouches: cartouchesLiees.length };
    }

    /**
     * Duplique un item partagé vers les documents de l'utilisateur, avec
     * ses dépendances. Retourne { libelle, idNouveau } ou null si impossible
     * (item introuvable, cartouche orpheline).
     */
    partageSection.dupliquerVersMesDocuments = function (type, id) {
        var item = null;
        lire(CLES_STOCKAGE[type] || '').forEach(function (i) {
            if (i.id === id) item = i;
        });
        if (!item) {
            console.error('[partage-section] Item partagé introuvable :', type, id);
            return null;
        }

        if (type === 'grille') {
            var resG = dupliquerGrillePartagee(item, lireCartouchesPartageDe);
            return {
                idNouveau: resG.grille.id,
                libelle: 'Grille « ' + nomDe(item) + ' » copiée dans tes documents'
                    + (resG.nbCartouches ? ' (avec ' + resG.nbCartouches + ' cartouche' + (resG.nbCartouches > 1 ? 's' : '') + ')' : '')
            };
        }

        if (type === 'cartouche') {
            // Une cartouche est inutilisable sans sa grille (ancrage
            // cartouches_{grilleId}) : on duplique la grille parente entière.
            var parent = null;
            lire(CLES_STOCKAGE.grille).forEach(function (g) {
                if (g.id === item.grilleId) parent = g;
            });
            if (!parent) {
                alert('Cette cartouche est liée à une grille qui n\'est plus dans tes partagés — impossible de la dupliquer seule.');
                return null;
            }
            var resC = dupliquerGrillePartagee(parent, lireCartouchesPartageDe);
            return {
                idNouveau: resC.grille.id,
                libelle: 'Grille « ' + nomDe(parent) + ' » copiée avec ses ' + resC.nbCartouches
                    + ' cartouche' + (resC.nbCartouches > 1 ? 's' : '')
            };
        }

        if (type === 'production') {
            var copieP = copiePropre(item, 'production');
            var complement = '';
            if (copieP.grilleId) {
                var grilleLiee = null;
                lire(CLES_STOCKAGE.grille).forEach(function (g) {
                    if (g.id === copieP.grilleId) grilleLiee = g;
                });
                if (grilleLiee) {
                    var resPG = dupliquerGrillePartagee(grilleLiee, lireCartouchesPartageDe);
                    copieP.grilleId = resPG.grille.id;
                    complement = ' (avec sa grille' + (resPG.nbCartouches ? ' et ' + resPG.nbCartouches + ' cartouche' + (resPG.nbCartouches > 1 ? 's' : '') : '') + ')';
                } else if (copieP.grilleId.indexOf('PARTAGE_') === 0) {
                    // Référence partagée introuvable : ne JAMAIS laisser une
                    // copie utilisateur pointer vers le namespace partage_*.
                    console.warn('[partage-section] Grille partagée introuvable pour la production', id, '— référence vidée');
                    copieP.grilleId = '';
                    complement = ' (sa grille n\'était plus disponible : à réassocier)';
                }
            }
            ajouterACollection(cleProductions(), copieP);
            return {
                idNouveau: copieP.id,
                libelle: 'Production « ' + nomDe(item) + ' » copiée dans tes documents' + complement
            };
        }

        if (type === 'echelle') {
            var copieE = copiePropre(item, 'echelle');
            ajouterACollection(window.cle('echellesTemplates'), copieE);
            return { idNouveau: copieE.id, libelle: 'Échelle « ' + nomDe(item) + ' » copiée dans tes documents' };
        }

        if (type === 'pratique') {
            var copiePr = copiePropre(item, 'pratique');
            ajouterACollection(window.cle('pratiquesConfigurables'), copiePr);
            return { idNouveau: copiePr.id, libelle: 'Pratique « ' + nomDe(item) + ' » copiée dans tes documents' };
        }

        console.error('[partage-section] Type inconnu :', type);
        return null;
    };

    // ------------------------------------------------------------------
    // Suppression d'un item partagé (Grégoire, 25 août 2026)
    //
    // « Je voudrais pouvoir supprimer les cartouches partagées. Il n'y a pas
    // de menu pour le faire, comme dans les autres cartes. » La section
    // « Partagés » n'offrait QUE « Dupliquer » : un package importé une fois
    // ne pouvait plus être défait item par item — seulement en bloc, depuis
    // Réglages › Données, et à condition de savoir que cette carte existe.
    //
    // Ce qui est supprimé : la COPIE importée, dans les collections
    // `partage_*`. Jamais les documents de l'utilisateur, jamais ce qu'il a
    // déjà dupliqué, jamais le fichier .lcz d'origine — un réimport le
    // ramène tel quel.
    // ------------------------------------------------------------------

    function trouverPartage(type, id) {
        var trouve = null;
        lire(CLES_STOCKAGE[type] || '').forEach(function (i) {
            if (i.id === id) trouve = i;
        });
        return trouve;
    }

    /**
     * Ce qu'une suppression emporte, SANS RIEN ÉCRIRE — de quoi nommer les
     * conséquences dans la confirmation avant de les produire.
     *
     * Seule la grille a des dépendants dans le namespace partagé :
     *  - ses cartouches partagées, qui partent AVEC elle. Une cartouche
     *    partagée sans sa grille est une carte morte : `dupliquer` refuse
     *    (« liée à une grille qui n'est plus dans tes partagés »). La laisser
     *    derrière, ce serait laisser à l'écran un bouton qui échoue.
     *  - ses productions partagées, qui SURVIVENT : leur duplication sait
     *    déjà vider une référence de grille absente et le dire (« à
     *    réassocier »). On les nomme, on ne les détruit pas.
     *
     * ⚠ Divergence assumée avec la garde des grilles de l'utilisateur (1.95.4,
     * qui REFUSE de supprimer une grille portant des cartouches) : là-bas
     * l'objet détruit est du travail écrit par Grégoire, irrécupérable. Ici
     * tout est une copie réimportable depuis le .lcz — le coût d'une erreur
     * n'est pas le même, et un refus obligerait à supprimer 20 cartouches à
     * la main avant d'atteindre leur grille.
     *
     * @returns {Object|null} { item, cartouches: [], productions: [] }
     */
    partageSection.consequencesSuppression = function (type, id) {
        var item = trouverPartage(type, id);
        if (!item) return null;

        var cartouches = [];
        var productions = [];
        if (type === 'grille') {
            cartouches = lire(CLES_STOCKAGE.cartouche).filter(function (c) {
                return c.grilleId === item.id;
            });
            productions = lire(CLES_STOCKAGE.production).filter(function (p) {
                return p.grilleId === item.id;
            });
        }
        return { item: item, cartouches: cartouches, productions: productions };
    };

    /**
     * Retire un item partagé (et, pour une grille, ses cartouches partagées)
     * des collections `partage_*`, puis met le registre des packages importés
     * à jour pour qu'il n'annonce plus ce qui n'est plus là.
     *
     * @returns {Object|null} { nom, supprimes: {type: [ids]}, nbCartouches }
     */
    partageSection.supprimerDuPartage = function (type, id) {
        var conseq = partageSection.consequencesSuppression(type, id);
        if (!conseq) {
            console.error('[partage-section] Item partagé introuvable :', type, id);
            return null;
        }

        var supprimes = {};

        var idsCartouches = conseq.cartouches.map(function (c) { return c.id; });
        if (idsCartouches.length) {
            ecrire(CLES_STOCKAGE.cartouche, lire(CLES_STOCKAGE.cartouche).filter(function (c) {
                return idsCartouches.indexOf(c.id) === -1;
            }));
            supprimes.cartouche = idsCartouches;
        }

        ecrire(CLES_STOCKAGE[type], lire(CLES_STOCKAGE[type]).filter(function (i) {
            return i.id !== id;
        }));
        supprimes[type] = (supprimes[type] || []).concat([id]);

        if (window.partageImport && typeof window.partageImport.oublierEntites === 'function') {
            window.partageImport.oublierEntites(supprimes);
        }

        return { nom: nomDe(conseq.item), supprimes: supprimes, nbCartouches: idsCartouches.length };
    };

    /** Au plus 8 noms : une confirmation illisible n'est plus une confirmation. */
    function listerNoms(items) {
        var noms = items.slice(0, 8).map(function (i) { return '\u2022 ' + nomDe(i); });
        if (items.length > 8) noms.push('\u2022 … et ' + (items.length - 8) + ' autre'
            + (items.length - 8 > 1 ? 's' : ''));
        return noms.join('\n');
    }

    /** data-action="partageSection.supprimer" param=type param2=id */
    partageSection.supprimer = function (type, id) {
        var conseq = partageSection.consequencesSuppression(type, id);
        if (!conseq) return;

        var lignes = ['Supprimer « ' + nomDe(conseq.item) + ' » de tes partagés ?', ''];

        if (conseq.cartouches.length) {
            lignes.push('Ses ' + conseq.cartouches.length + ' cartouche'
                + (conseq.cartouches.length > 1 ? 's' : '') + ' partagée'
                + (conseq.cartouches.length > 1 ? 's partent' : ' part') + ' avec elle — '
                + 'sans sa grille, une cartouche partagée n\'est plus duplicable :');
            lignes.push(listerNoms(conseq.cartouches));
            lignes.push('');
        }
        if (conseq.productions.length) {
            lignes.push(conseq.productions.length + ' production'
                + (conseq.productions.length > 1 ? 's partagées perdront' : ' partagée perdra')
                + ' cette grille : il faudra lui en réassocier une à la duplication.');
            lignes.push('');
        }

        lignes.push('Seule la copie importée est retirée : tes propres documents, '
            + 'y compris ce que tu as déjà dupliqué, ne sont pas touchés. '
            + 'Tu pourras réimporter le fichier .lcz.');

        if (!confirm(lignes.join('\n'))) return;

        var resultat = partageSection.supprimerDuPartage(type, id);
        if (!resultat) return;

        if (typeof notifications !== 'undefined' && notifications.succes) {
            notifications.succes('« ' + resultat.nom + ' » supprimé de tes partagés'
                + (resultat.nbCartouches
                    ? ' (avec ' + resultat.nbCartouches + ' cartouche'
                        + (resultat.nbCartouches > 1 ? 's' : '') + ')'
                    : ''));
        }

        rafraichirApres(type);
    };

    /**
     * Rafraîchit ce que l'action vient de changer : la modale d'où elle part,
     * et — si la carte Réglages › Données est à l'écran — le tableau des
     * packages, dont la colonne « Contenu » vient de bouger.
     */
    function rafraichirApres(type) {
        var fn = window[FONCTIONS_MODALE[type]];
        if (typeof fn === 'function' && document.getElementById(IDS_MODALE[type])) {
            fn();
        }
        if (window.partageImport && typeof window.partageImport.rafraichirSection === 'function') {
            window.partageImport.rafraichirSection();
        }
    }

    // ------------------------------------------------------------------
    // Handler data-action (bouton « Dupliquer » des cartes)
    // ------------------------------------------------------------------

    /** data-action="partageSection.dupliquer" param=type param2=id */
    partageSection.dupliquer = function (type, id) {
        var resultat = partageSection.dupliquerVersMesDocuments(type, id);
        if (!resultat) return;
        if (typeof notifications !== 'undefined' && notifications.succes) {
            notifications.succes(resultat.libelle);
        }
        // Rafraîchir la modale d'où l'action vient (la copie apparaît en
        // Section 1 — elle est dansBibliotheque: true).
        rafraichirApres(type);
    };

    // ------------------------------------------------------------------
    // Rendu de la section « Partagés » (HTML pour creerModal)
    // ------------------------------------------------------------------

    function descriptionPour(type, item) {
        if (type === 'grille') {
            var nb = lire(CLES_STOCKAGE.cartouche).filter(function (c) {
                return c.grilleId === item.id;
            }).length;
            var nbCrit = (item.criteres || []).length;
            return nbCrit + ' critère' + (nbCrit > 1 ? 's' : '')
                + (nb ? ' · ' + nb + ' cartouche' + (nb > 1 ? 's' : '') + ' incluse' + (nb > 1 ? 's' : '') : '');
        }
        if (type === 'echelle') {
            var nbNiv = (item.niveaux || []).length;
            return nbNiv + ' niveau' + (nbNiv > 1 ? 'x' : '');
        }
        return String(item.description || item.contexte || item.objectif || '');
    }

    /**
     * HTML de la section « Partagés par des collègues » pour un type, à
     * passer à window.BibliothequeUI.creerModal via `sectionPartages`. Chaîne vide
     * s'il n'y a aucun item partagé de ce type (la section n'apparaît pas).
     */
    partageSection.genererSectionHTML = function (type) {
        var items = lire(CLES_STOCKAGE[type] || '');
        if (!items.length) return '';

        var cartes = items.map(function (item) {
            return window.BibliothequeUI.renderCarteDisponible({
                nom: echapper(window.BibliothequeUI.formaterTitre(nomDe(item))),
                id: item.id,
                badgeSource: '<span class="badge-source badge-source--partage">Partagé</span>',
                metadonnees: echapper('par ' + auteurDe(item)),
                description: descriptionPour(type, item),
                boutonPrincipal: {
                    label: type === 'cartouche' ? 'Dupliquer avec sa grille' : 'Dupliquer vers mes documents',
                    action: 'partageSection.dupliquer',
                    param: type,
                    param2: item.id,
                    classe: 'btn-confirmer',
                    title: 'Créer une copie modifiable dans tes documents (l\'original partagé reste intact)'
                },
                actionsMenu: [{
                    label: 'Supprimer',
                    action: 'partageSection.supprimer',
                    param: type,
                    param2: item.id,
                    classe: 'btn-supprimer',
                    title: 'Supprimer cette copie importée (tes documents ne sont pas touchés)'
                }]
            });
        }).join('');

        return '<h3 class="biblio-section-titre">Partagés par des collègues</h3>' +
            '<p style="color: var(--gris-clair); font-size: 0.9em; margin-bottom: 12px;">' +
                'Importés par fichier .lcz, non modifiables ici. « Dupliquer » crée une copie ' +
                'modifiable dans tes documents — l\'attribution d\'origine est conservée. ' +
                'Le menu ⋮ supprime la copie importée ; pour retirer un package entier : ' +
                'Réglages › Données.' +
            '</p>' +
            cartes;
    };

    // Exposé pour réutilisation (Brique C : l'import inter-trimestre du pas 4
    // l'appellera avec un lecteur de cartouches par CLÉ via cleSource) et pour
    // la sentinelle storage-pur. copiePropre reste interne tant qu'aucun caller externe.
    partageSection.dupliquerGrillePartagee = dupliquerGrillePartagee;

    window.partageSection = partageSection;
})();
