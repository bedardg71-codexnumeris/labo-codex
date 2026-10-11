/**
 * partage-import.js — Lot P3 : pipeline d'import d'un package de partage
 *
 * Chantier #329 Voûte Phase 1, lot P3 (dernier lot avant le jalon pilote).
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 *
 * Rôle : la carte « Partage entre collègues » de Réglages › Données aboutit
 * ici. Chaîne complète (ordre du plan, SESSION.md 10 juin) :
 *   fichier .lcz → magic bytes ZIP → JSZip → validerZipSecurite()
 *   → package.json → JSON.parse strict → validerPackage() (6 niveaux)
 *   → verifierSignaturePackage() sur l'objet BRUT (la signature couvre le
 *     package tel qu'émis ; le nettoyage du niveau 5 altérerait le payload)
 *   → verifierConfianceTOFU() sur le packageNettoye (tout ce qui n'est pas
 *     la signature travaille sur le clone sanitisé — règle : signature =
 *     brut, le reste = nettoyé)
 *   → PRÉVISUALISATION obligatoire (auteur, statut de confiance, items,
 *     chaîne d'attribution)
 *   → intégration dans le namespace `partage_*` + memoriserContact() à
 *     l'ACCEPTATION seulement.
 *
 * INTÉGRATION (D7) — checklist SKILL_integrite_globaux :
 *  - IDs : préfixés `PARTAGE_{idImport}_` À LA CONCEPTION — collision
 *    impossible avec les items utilisateur ET entre deux imports (même
 *    package importé deux fois = suffixes distincts). L'ID source est
 *    conservé dans `inspireDe.idOriginal`.
 *  - Flags : AUCUN filtre par flag. Le retrait (« Retirer ») passe par
 *    l'IDENTITÉ : le registre `partage_packagesImportes` mémorise les IDs
 *    intégrés par package, et seuls ces IDs sont retirés.
 *  - Types : les clés cibles `partage_*` sont NEUVES et possédées par ce
 *    module (docs/DATA-OWNERSHIP.md) — aucun lecteur legacy à casser.
 *    L'import n'écrit JAMAIS dans les collections utilisateur
 *    (grillesTemplates, cartouches_*, etc.) ; la consultation/duplication
 *    depuis les sélecteurs est le lot P4.
 *  - Réversibilité : « Retirer » n'affecte que `partage_*` ; un package
 *    retiré peut être réimporté depuis son fichier.
 *
 * MISE À JOUR D'UN PACKAGE DÉJÀ IMPORTÉ (R3, critère 20) : un import dont
 * l'auteur (normalisé) et l'item principal d'origine correspondent à un
 * package déjà importé est traité comme une mise à jour — il repasse par
 * TOUTE la chaîne de vérification, et son acceptation REMPLACE la copie
 * précédente (retrait par identité, puis intégration neuve).
 *
 * SÉCURITÉ : toutes les modales et la liste sont construites en API DOM +
 * textContent (les noms viennent de packages importés), AUCUN innerHTML
 * dans ce module. Zéro handler inline ; écouteurs clavier défensifs.
 *
 * Vocabulaire UI : « partage » uniquement (D-V2 non tranchée — « Voûte »
 * n'apparaît nulle part dans l'interface, convention posée au lot P2).
 *
 * Tests : tests/unit/partage-import-P3.test.js (préfixage, remappage,
 * registre, retrait par identité) + tests/integration/partage-import-rendu
 * .spec.js (4 flux : valide, corrompu, signature invalide, clé changée) +
 * window._testPartageImportP3() (terrain Safari, sans fichier réel).
 */
(function () {
    'use strict';

    var partageImport = {};

    // ------------------------------------------------------------------
    // Constantes de stockage (propriétaire : ce module)
    // ------------------------------------------------------------------

    // Registre des packages importés — GLOBAL, jamais namespacé par
    // trimestre (une ressource partagée ne dépend pas du trimestre).
    var CLE_REGISTRE = 'partage_packagesImportes';
    partageImport.CLE_REGISTRE = CLE_REGISTRE;

    // Collections d'entités intégrées, par type (plates ; les cartouches y
    // gardent leur `grilleId` remappé — l'ancrage cartouches_{grilleId} est
    // réservé aux cartouches de l'utilisateur).
    var CLES_STOCKAGE = {
        grille: 'partage_grilles',
        echelle: 'partage_echelles',
        cartouche: 'partage_cartouches',
        production: 'partage_productions',
        pratique: 'partage_pratiques'
    };
    partageImport.CLES_STOCKAGE = CLES_STOCKAGE;

    // Garde d'entrée : un .lcz est un ZIP d'un package JSON ≤ 10 Mo — au-delà
    // de 12 Mo compressés, inutile d'ouvrir.
    var TAILLE_MAX_FICHIER = 12 * 1024 * 1024;
    partageImport.TAILLE_MAX_FICHIER = TAILLE_MAX_FICHIER;

    var LIBELLES_TYPE = {
        grille: ['grille', 'grilles'],
        echelle: ['échelle', 'échelles'],
        cartouche: ['cartouche', 'cartouches'],
        production: ['production', 'productions'],
        pratique: ['pratique de notation', 'pratiques de notation']
    };

    // ------------------------------------------------------------------
    // Helpers storage
    // ------------------------------------------------------------------

    function lireCollection(cle) {
        if (typeof db === 'undefined' || !db.getSync) return [];
        var v = db.getSync(cle, []);
        return Array.isArray(v) ? v : [];
    }

    function ecrire(cle, valeur) {
        if (typeof db === 'undefined' || !db.setSync) {
            throw new Error('[partage-import] db indisponible — écriture impossible');
        }
        db.setSync(cle, valeur);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle);   // lot F : geste hors témoin (ecrire)
    }

    function clonerProfond(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function normaliserNom(nom) {
        if (window.trustTofu && window.trustTofu.normaliserNomAuteur) {
            return window.trustTofu.normaliserNomAuteur(nom);
        }
        // Repli défensif (même règle que trust-tofu) — ne devrait pas servir.
        return String(nom).normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function genererIdImport() {
        var suffixe;
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            suffixe = crypto.randomUUID().split('-')[0];
        } else {
            suffixe = Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
        }
        return 'IMP_' + suffixe;
    }

    // ------------------------------------------------------------------
    // Préfixage des IDs (D7) — fonction pure, testée en Vitest
    // ------------------------------------------------------------------

    /**
     * Clone les entités d'un packageNettoye en préfixant chaque ID par
     * `PARTAGE_{suffixe de l'idImport}_` et en remappant les références
     * internes (cartouche.grilleId, production.grilleId) quand leur cible
     * fait partie du package. Pose `inspireDe.idOriginal` (D7) ; un
     * `inspireDe` déjà présent (lignée de l'auteur) est conservé et
     * seulement complété.
     * Retourne { parType, idsParType, idPrincipalNouveau, nbTotal }.
     */
    partageImport.prefixerEntites = function (pkgNettoye, idImport) {
        var schemas = window.partageSchemas;
        var manifest = pkgNettoye.manifest;
        var prefixe = 'PARTAGE_' + idImport.replace(/^IMP_/, '') + '_';

        // 1er passage : table de correspondance ancien → nouveau, par type.
        var correspondance = {};
        schemas.TYPES_ENTITES.forEach(function (type) {
            correspondance[type] = {};
            (pkgNettoye.entites[schemas.CLES_ENTITES[type]] || []).forEach(function (item) {
                correspondance[type][item.id] = prefixe + item.id;
            });
        });

        var dateOrigine = String(manifest.dateExport || '').slice(0, 10);
        var parType = {};
        var idsParType = {};
        var nbTotal = 0;

        schemas.TYPES_ENTITES.forEach(function (type) {
            var liste = pkgNettoye.entites[schemas.CLES_ENTITES[type]] || [];
            parType[type] = liste.map(function (original) {
                var item = clonerProfond(original);
                var idOriginal = item.id;
                item.id = correspondance[type][idOriginal];

                // Références internes : remapper seulement si la cible est
                // DANS le package (sinon la valeur reste telle quelle — ex.
                // production.grilleId === '' pour un portfolio sans grille).
                if ((type === 'cartouche' || type === 'production')
                    && item.grilleId && correspondance.grille[item.grilleId]) {
                    item.grilleId = correspondance.grille[item.grilleId];
                }
                // #663 : l'échelle d'une pratique, rangée sous `configuration` (le schéma de
                // partage n'a ni `config` ni `echelleId` à la racine) — même règle : seulement
                // si elle est dans le package. Le clone profond ci-dessus protège le package lu.
                if (type === 'pratique' && item.configuration
                    && item.configuration.echelleId
                    && correspondance.echelle[item.configuration.echelleId]) {
                    item.configuration.echelleId = correspondance.echelle[item.configuration.echelleId];
                }

                // Trace de provenance (D7) : idOriginal toujours posé ;
                // un inspireDe d'une lignée antérieure est complété, pas écrasé.
                var inspireDe = item.inspireDe || {
                    nom: String(item.nom || item.titre || ''),
                    auteur: String(manifest.auteur.nom),
                    date: dateOrigine
                };
                inspireDe.idOriginal = idOriginal;
                item.inspireDe = inspireDe;
                return item;
            });
            idsParType[type] = parType[type].map(function (i) { return i.id; });
            nbTotal += parType[type].length;
        });

        var ip = manifest.item_principal;
        return {
            parType: parType,
            idsParType: idsParType,
            idPrincipalNouveau: correspondance[ip.type][ip.id] || null,
            nbTotal: nbTotal
        };
    };

    // ------------------------------------------------------------------
    // Registre des packages importés
    // ------------------------------------------------------------------

    /** Liste les entrées du registre (clones, plus récent en premier). */
    partageImport.listerImports = function () {
        return lireCollection(CLE_REGISTRE).map(clonerProfond).reverse();
    };

    /**
     * Cherche un import existant correspondant au même package logique :
     * même auteur (nom normalisé) ET même item principal d'origine.
     * Retourne l'entrée (clone) ou null.
     */
    partageImport.trouverImportExistant = function (manifest) {
        var auteurNormalise = normaliserNom(manifest.auteur.nom);
        var ip = manifest.item_principal;
        var trouve = null;
        lireCollection(CLE_REGISTRE).forEach(function (entree) {
            if (entree.auteurNormalise === auteurNormalise
                && entree.itemPrincipal && entree.itemPrincipal.type === ip.type
                && entree.itemPrincipal.idOriginal === ip.id) {
                trouve = clonerProfond(entree);
            }
        });
        return trouve;
    };

    /**
     * Intègre un packageNettoye dans le namespace `partage_*` et inscrit
     * l'entrée au registre. AUCUNE écriture hors des clés `partage_*`.
     * Retourne l'entrée de registre (clone).
     */
    partageImport.integrerPackage = function (pkgNettoye, contexte) {
        contexte = contexte || {};
        var manifest = pkgNettoye.manifest;
        var idImport = genererIdImport();
        var resultat = partageImport.prefixerEntites(pkgNettoye, idImport);

        Object.keys(resultat.parType).forEach(function (type) {
            if (!resultat.parType[type].length) return;
            var cle = CLES_STOCKAGE[type];
            ecrire(cle, lireCollection(cle).concat(resultat.parType[type]));
        });

        var ip = manifest.item_principal;
        var itemPrincipalNom = '';
        (pkgNettoye.entites[window.partageSchemas.CLES_ENTITES[ip.type]] || []).forEach(function (item) {
            if (item.id === ip.id) itemPrincipalNom = String(item.nom || item.titre || '');
        });

        var nbParType = {};
        Object.keys(resultat.idsParType).forEach(function (type) {
            if (resultat.idsParType[type].length) nbParType[type] = resultat.idsParType[type].length;
        });

        var entree = {
            idImport: idImport,
            dateImport: new Date().toISOString(),
            auteur: clonerProfond(manifest.auteur),
            auteurNormalise: normaliserNom(manifest.auteur.nom),
            clePublique: manifest.clePublique,
            licence: manifest.licence,
            dateExport: manifest.dateExport,
            itemPrincipal: {
                type: ip.type,
                idOriginal: ip.id,
                idNouveau: resultat.idPrincipalNouveau,
                nom: itemPrincipalNom
            },
            statutConfiance: contexte.statutConfiance || null,
            chaineAttribution: clonerProfond(manifest.chaineAttribution || []),
            nbParType: nbParType,
            idsIntegres: resultat.idsParType
        };

        var registre = lireCollection(CLE_REGISTRE);
        registre.push(entree);
        ecrire(CLE_REGISTRE, registre);
        return clonerProfond(entree);
    };

    /**
     * Retire un package importé : supprime SES entités (par identité — les
     * IDs mémorisés dans `idsIntegres`, jamais par flag) des collections
     * `partage_*`, puis son entrée de registre. N'affecte rien d'autre.
     */
    partageImport.retirerImport = function (idImport) {
        var registre = lireCollection(CLE_REGISTRE);
        var entree = null;
        registre.forEach(function (e) {
            if (e.idImport === idImport) entree = e;
        });
        if (!entree) return false;

        Object.keys(entree.idsIntegres || {}).forEach(function (type) {
            var ids = entree.idsIntegres[type] || [];
            if (!ids.length || !CLES_STOCKAGE[type]) return;
            var collection = lireCollection(CLES_STOCKAGE[type]);
            var restants = collection.filter(function (item) {
                return ids.indexOf(item.id) === -1;
            });
            ecrire(CLES_STOCKAGE[type], restants);
        });

        ecrire(CLE_REGISTRE, registre.filter(function (e) {
            return e.idImport !== idImport;
        }));
        return true;
    };

    /**
     * Oublie des entités DANS LE REGISTRE seulement — les collections
     * `partage_*` restent la responsabilité de l'appelant.
     *
     * Demandé par la suppression à l'unité d'un partagé (25 août 2026) : sans
     * cela, la carte Réglages › Données continuerait d'annoncer « 4 grilles,
     * 12 cartouches » pour un package dont la moitié a été supprimée. Le
     * registre doit décrire ce qui EST là, pas ce qui est entré un jour.
     *
     * Une entrée dont il ne reste plus aucune entité est retirée : garder une
     * ligne « Contenu : — » avec un bouton « Retirer » qui n'a plus rien à
     * retirer serait le même mensonge à l'envers.
     *
     * @param {Object} idsParType - { grille: ['PARTAGE_…'], cartouche: [...] }
     * @returns {number} nombre d'IDs effectivement oubliés
     */
    partageImport.oublierEntites = function (idsParType) {
        if (!idsParType) return 0;
        var registre = lireCollection(CLE_REGISTRE);
        if (!registre.length) return 0;

        var oublies = 0;
        var restants = registre.filter(function (entree) {
            var ids = entree.idsIntegres || {};
            entree.nbParType = entree.nbParType || {};

            Object.keys(idsParType).forEach(function (type) {
                var aOublier = idsParType[type] || [];
                if (!aOublier.length || !Array.isArray(ids[type])) return;
                var gardes = ids[type].filter(function (id) {
                    return aOublier.indexOf(id) === -1;
                });
                if (gardes.length === ids[type].length) return;
                oublies += ids[type].length - gardes.length;
                ids[type] = gardes;
                if (gardes.length) entree.nbParType[type] = gardes.length;
                else delete entree.nbParType[type];
            });

            // L'entrée survit tant qu'il lui reste au moins une entité.
            return Object.keys(ids).some(function (type) {
                return (ids[type] || []).length > 0;
            });
        });

        if (oublies) ecrire(CLE_REGISTRE, restants);
        return oublies;
    };

    // ------------------------------------------------------------------
    // Lecture du fichier .lcz
    // ------------------------------------------------------------------

    /** Signature locale ZIP (PK\x03\x04) — un .lcz en a toujours une. */
    partageImport.verifierMagicBytesZip = function (arrayBuffer) {
        if (!arrayBuffer || arrayBuffer.byteLength < 4) return false;
        var octets = new Uint8Array(arrayBuffer.slice(0, 4));
        return octets[0] === 0x50 && octets[1] === 0x4B && octets[2] === 0x03 && octets[3] === 0x04;
    };

    /**
     * Ouvre un fichier .lcz et retourne Promise<objet package BRUT (parsé,
     * non validé)>. Rejette avec une Error à message utilisateur si le
     * conteneur est refusé (taille, magic bytes, sécurité ZIP, JSON).
     */
    partageImport.lirePackageDepuisFichier = function (fichier) {
        var limites = window.partageSchemas.LIMITES;
        if (!fichier) {
            return Promise.reject(new Error('Aucun fichier reçu.'));
        }
        if (fichier.size > TAILLE_MAX_FICHIER) {
            return Promise.reject(new Error('Fichier trop volumineux ('
                + Math.round(fichier.size / 1024 / 1024) + ' Mo). Un package de partage fait au plus 10 Mo.'));
        }
        return fichier.arrayBuffer().then(function (buffer) {
            if (!partageImport.verifierMagicBytesZip(buffer)) {
                throw new Error('Ce fichier n\'est pas un package .lcz (signature ZIP absente).');
            }
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip indisponible — import impossible.');
            }
            return JSZip.loadAsync(buffer);
        }).then(function (zip) {
            // validerZipSecurite (import-export.js) : path traversal, chemins
            // absolus, taille décompressée totale.
            if (typeof validerZipSecurite === 'function') {
                var controle = validerZipSecurite(zip);
                if (!controle.valide) throw new Error(controle.erreur);
            }
            var entree = zip.file('package.json');
            if (!entree) {
                throw new Error('Archive sans package.json à la racine — ce n\'est pas un package de partage.');
            }
            // Garde anti-bombe ciblée : taille décompressée déclarée du
            // package, quand JSZip l'expose.
            if (entree._data && entree._data.uncompressedSize > limites.tailleMaxPackageOctets) {
                throw new Error('package.json dépasse la taille maximale d\'un package (10 Mo).');
            }
            return entree.async('string');
        }).then(function (texte) {
            if (texte.length > limites.tailleMaxPackageOctets) {
                throw new Error('package.json dépasse la taille maximale d\'un package (10 Mo).');
            }
            try {
                return JSON.parse(texte);
            } catch (e) {
                throw new Error('package.json illisible (JSON invalide) : ' + e.message);
            }
        });
    };

    // ------------------------------------------------------------------
    // Modales (API DOM + textContent — données importées, zéro innerHTML)
    // ------------------------------------------------------------------

    function el(balise, classe, texte) {
        var noeud = document.createElement(balise);
        if (classe) noeud.className = classe;
        if (texte) noeud.textContent = texte;
        return noeud;
    }

    /**
     * Squelette commun des modales du module : overlay au-dessus des modales
     * de bibliothèque (--partage, bug terrain 10 juin), ESC/clic hors carte =
     * décision par défaut, boutons par [data-decision]. Retourne une Promise
     * résolue avec la décision.
     */
    function ouvrirModaleDecision(id, construireContenu, decisionDefaut, focusDecision) {
        return new Promise(function (resolve) {
            var overlay = el('div', 'modal-overlay modal-overlay--partage');
            overlay.id = id;

            var carte = el('div', 'modal-contenu modal-compact');
            carte.setAttribute('role', 'dialog');
            carte.setAttribute('aria-modal', 'true');
            construireContenu(carte);
            overlay.appendChild(carte);

            function conclure(decision) {
                document.removeEventListener('keydown', surClavier);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                resolve(decision);
            }

            // Écouteur global défensif : auto-détachement si la modale a
            // disparu du DOM par un autre chemin (convention projet).
            function surClavier(e) {
                if (!document.body.contains(overlay)) {
                    document.removeEventListener('keydown', surClavier);
                    return;
                }
                if (e.key === 'Escape') conclure(decisionDefaut);
            }

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { conclure(decisionDefaut); return; }
                var bouton = e.target.closest ? e.target.closest('[data-decision]') : null;
                if (bouton) conclure(bouton.getAttribute('data-decision'));
            });
            document.addEventListener('keydown', surClavier);

            document.body.appendChild(overlay);
            overlay.classList.add('actif');
            var focus = carte.querySelector('[data-decision="' + focusDecision + '"]');
            if (focus) focus.focus();
        });
    }

    /** Modale de refus : titre + raisons (max 6 affichées). */
    function afficherRejet(titre, raisons) {
        return ouvrirModaleDecision('modalPartageRejet', function (carte) {
            var h2 = el('h2', 'modal-titre', '⚠ ' + titre);
            h2.id = 'titrePartageRejet';
            carte.setAttribute('aria-labelledby', h2.id);
            carte.appendChild(h2);
            carte.appendChild(el('p', null, 'Rien n\'a été importé.'));
            var liste = el('ul');
            raisons.slice(0, 6).forEach(function (raison) {
                liste.appendChild(el('li', null, raison));
            });
            if (raisons.length > 6) {
                liste.appendChild(el('li', null, '… et ' + (raisons.length - 6) + ' autres problèmes (détail dans la console).'));
            }
            carte.appendChild(liste);
            var actions = el('div', 'modal-actions-centre');
            var btn = el('button', 'btn btn-principal', 'Fermer');
            btn.type = 'button';
            btn.setAttribute('data-decision', 'fermer');
            actions.appendChild(btn);
            carte.appendChild(actions);
        }, 'fermer', 'fermer');
    }

    /**
     * #583 (25 sept. 2026) — UN CHAMP INCONNU VIENT LE PLUS SOUVENT D'UNE VERSION
     * PLUS RÉCENTE. Le format `labo-codex-partage-v1` s'étend sans changer de nom
     * (décision de Grégoire, 25 sept.) : une page restée ouverte sur une version
     * antérieure refuse donc un paquet émis après l'extension. Le refus technique
     * (« champ inconnu (schéma fermé) ») ne disait pas quoi faire ; cette phrase
     * vient d'abord, le détail reste dessous.
     */
    // Texte validé par Grégoire le 25 sept. 2026. Sans raccourci clavier : il n'existe
    // pas sur iPad, et netlify.toml sert /*.html en `max-age=0, must-revalidate`
    // (chaque script porte son `?v=`) — un rechargement ordinaire suffit.
    var TEXTE_VERSION_PLUS_RECENTE = 'Ce fichier vient d\'une version plus récente de Labo Codex. '
        + 'Recharge la page, puis importe-le de nouveau.';
    partageImport.TEXTE_VERSION_PLUS_RECENTE = TEXTE_VERSION_PLUS_RECENTE;

    // #643 — texte proposé par Cowork le 26 sept. 2026, à valider par Grégoire.
    var TEXTE_TRIMESTRE_CARTOUCHES = 'Cartouches tirées du trimestre : ';
    partageImport.TEXTE_TRIMESTRE_CARTOUCHES = TEXTE_TRIMESTRE_CARTOUCHES;

    function formaterErreursValidation(erreurs) {
        var lignes = erreurs.map(function (e) {
            return '[' + e.code + '] ' + e.message + (e.champ ? ' (' + e.champ + ')' : '');
        });
        var inconnu = erreurs.some(function (e) { return e.champInconnu; });
        return inconnu ? [TEXTE_VERSION_PLUS_RECENTE].concat(lignes) : lignes;
    }
    partageImport.formaterErreursValidation = formaterErreursValidation;

    /**
     * Prévisualisation OBLIGATOIRE avant intégration. Affiche l'item
     * principal, l'auteur et son statut de confiance, la licence, le
     * contenu par type et la chaîne d'attribution. Promise<bool>.
     */
    function afficherPrevisualisation(pkgNettoye, preview, tofu, importExistant) {
        var manifest = pkgNettoye.manifest;
        var ip = manifest.item_principal;

        return ouvrirModaleDecision('modalPartagePreviz', function (carte) {
            var h2 = el('h2', 'modal-titre', 'Importer ce package ?');
            h2.id = 'titrePartagePreviz';
            carte.setAttribute('aria-labelledby', h2.id);
            carte.appendChild(h2);

            carte.appendChild(el('p', null,
                (LIBELLES_TYPE[ip.type] ? LIBELLES_TYPE[ip.type][0].charAt(0).toUpperCase() + LIBELLES_TYPE[ip.type][0].slice(1) : ip.type)
                + ' « ' + preview.nomItemPrincipal + ' », partagée par ' + manifest.auteur.nom
                + (manifest.auteur.institution ? ' (' + manifest.auteur.institution + ')' : '')
                + ', sous licence ' + manifest.licence + '.'));

            // Statut de confiance (textes du lot T, accord {nom} substitué).
            var texteConfiance;
            if (tofu.statut === 'verifiee') {
                texteConfiance = window.trustTofu.TEXTES_CONFIANCE.verifiee.replace(/\{nom\}/g, tofu.auteur);
            } else if (tofu.statut === 'nouveau') {
                texteConfiance = window.trustTofu.TEXTES_CONFIANCE.nouveau.replace(/\{nom\}/g, tofu.auteur);
            } else {
                // cle_changee acceptée explicitement en amont.
                texteConfiance = 'Tu as choisi de faire confiance à la NOUVELLE clé de '
                    + tofu.auteur + '. Elle remplacera la clé mémorisée si tu confirmes l\'import.';
            }
            var blocConfiance = el('p');
            blocConfiance.appendChild(el('strong', null,
                tofu.statut === 'verifiee' ? 'Signature vérifiée. '
                    : tofu.statut === 'nouveau' ? 'Premier contact. ' : 'Clé remplacée. '));
            blocConfiance.appendChild(document.createTextNode(texteConfiance));
            carte.appendChild(blocConfiance);

            // Contenu par type.
            var morceaux = [];
            Object.keys(preview.nbEntites || {}).forEach(function (clePluriel) {
                var nb = preview.nbEntites[clePluriel];
                if (!nb) return;
                var type = null;
                Object.keys(window.partageSchemas.CLES_ENTITES).forEach(function (t) {
                    if (window.partageSchemas.CLES_ENTITES[t] === clePluriel) type = t;
                });
                var libelles = LIBELLES_TYPE[type] || [clePluriel, clePluriel];
                morceaux.push(nb + ' ' + (nb > 1 ? libelles[1] : libelles[0]));
            });
            carte.appendChild(el('p', null, 'Contenu : ' + morceaux.join(', ')
                + '. Exporté le ' + formaterDate(manifest.dateExport) + '.'));

            // #643 — de quel trimestre de l'émettrice viennent les cartouches.
            if (preview.trimestreCartouches) {
                var blocTrimestre = el('p', null, TEXTE_TRIMESTRE_CARTOUCHES + preview.trimestreCartouches);
                blocTrimestre.id = 'partage-previz-trimestre';
                carte.appendChild(blocTrimestre);
            }

            // Chaîne d'attribution (si multi-niveaux).
            if ((preview.chaineAttribution || []).length) {
                var blocChaine = el('p', null, 'Chaîne d\'attribution :');
                var listeChaine = el('ul');
                preview.chaineAttribution.forEach(function (maillon) {
                    listeChaine.appendChild(el('li', null,
                        maillon.auteur + (maillon.nomItem ? ' — « ' + maillon.nomItem + ' »' : '')));
                });
                carte.appendChild(blocChaine);
                carte.appendChild(listeChaine);
            }

            // #583 — ce que la validation a retiré en chemin (un repère de
            // maîtrise qui ne désigne aucun niveau) : dit AVANT la décision.
            if ((preview.avertissements || []).length) {
                var blocAvert = el('div');
                blocAvert.id = 'partage-previz-avertissements';
                preview.avertissements.forEach(function (texte) {
                    blocAvert.appendChild(el('p', 'alerte alerte-attention', texte));
                });
                carte.appendChild(blocAvert);
            }

            if (importExistant) {
                var avert = el('p');
                avert.appendChild(el('strong', null, 'Tu as déjà importé ce package (le '
                    + formaterDate(importExistant.dateImport) + '). '));
                avert.appendChild(document.createTextNode(
                    'Confirmer remplacera la copie existante par cette version.'));
                carte.appendChild(avert);
            }

            carte.appendChild(el('p', 'u-texte-09',
                'Les items importés restent à part (section « Partagés ») : rien n\'est mélangé à tes propres documents.'));

            var actions = el('div', 'modal-actions-centre');
            var btnAnnuler = el('button', 'btn btn-annuler', 'Annuler');
            btnAnnuler.type = 'button';
            btnAnnuler.setAttribute('data-decision', 'annuler');
            var btnImporter = el('button', 'btn btn-principal',
                importExistant ? 'Remplacer par cette version' : 'Importer');
            btnImporter.type = 'button';
            btnImporter.setAttribute('data-decision', 'importer');
            actions.appendChild(btnAnnuler);
            actions.appendChild(btnImporter);
            carte.appendChild(actions);
        }, 'annuler', 'importer').then(function (decision) {
            return decision === 'importer';
        });
    }

    function formaterDate(iso) {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return String(iso || 'date inconnue').slice(0, 10);
        return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ------------------------------------------------------------------
    // Pipeline complet
    // ------------------------------------------------------------------

    /**
     * Chaîne d'import complète depuis un File/Blob .lcz. Ne rejette jamais :
     * résout avec { statut, ... } —
     *   'rejete_lecture' | 'rejete_validation' | 'rejete_signature' |
     *   'rejete_confiance' | 'refuse_cle' | 'annule' | 'importe' | 'erreur'.
     * Toute issue non importée laisse le storage INTACT.
     */
    partageImport.importerFichier = function (fichier) {
        return partageImport.lirePackageDepuisFichier(fichier)
            .then(function (pkgBrut) {
                return partageImport.importerObjet(pkgBrut);
            })
            .catch(function (e) {
                console.error('[partage-import] Lecture du fichier refusée :', e);
                return afficherRejet('Fichier refusé', [e.message]).then(function () {
                    return { statut: 'rejete_lecture', message: e.message };
                });
            });
    };

    /** Pipeline après parsing (réutilisé par le test console terrain). */
    partageImport.importerObjet = function (pkgBrut) {
        // 6 niveaux de validation — produit le packageNettoye à intégrer.
        var verdict = window.partageValidation.validerPackage(pkgBrut);
        if (!verdict.valide) {
            console.error('[partage-import] Validation refusée :', verdict.erreurs);
            return afficherRejet('Package refusé à la validation', formaterErreursValidation(verdict.erreurs))
                .then(function () { return { statut: 'rejete_validation', erreurs: verdict.erreurs }; });
        }
        var pkgNettoye = verdict.packageNettoye;

        // Signature (D2, critères 15-16) : vérifiée sur l'objet BRUT — le
        // payload signé est le package tel qu'émis. Non signé = rejeté.
        return window.signaturePartage.verifierSignaturePackage(pkgBrut).then(function (sig) {
            if (!sig.valide) {
                console.error('[partage-import] Signature refusée :', sig.code, sig.message);
                return afficherRejet('Signature refusée', [
                    sig.message + '.',
                    sig.code === 'SIGNATURE_ABSENTE'
                        ? 'Labo Codex n\'accepte que des packages signés : demande à la personne de regénérer son export.'
                        : 'Le fichier a pu être altéré après sa création — ne l\'importe pas, demande un nouvel envoi.'
                ]).then(function () { return { statut: 'rejete_signature', code: sig.code }; });
            }

            // Confiance TOFU (D3) — lecture seule ; mémorisation à l'acceptation.
            var tofu = window.trustTofu.verifierConfianceTOFU(pkgNettoye);
            if (tofu.statut === 'indeterminable') {
                // Défensif : impossible après validation + signature valides.
                return afficherRejet('Confiance indéterminable', [window.trustTofu.TEXTES_CONFIANCE.indeterminable])
                    .then(function () { return { statut: 'rejete_confiance' }; });
            }

            var promesseDecision = (tofu.statut === 'cle_changee')
                ? window.trustTofu.demanderDecisionCleChangee(tofu)
                : Promise.resolve('continuer');

            return promesseDecision.then(function (decision) {
                if (decision === 'refuser') {
                    return { statut: 'refuse_cle' };
                }
                var remplacerCle = (decision === 'faire_confiance');
                var importExistant = partageImport.trouverImportExistant(pkgNettoye.manifest);

                return afficherPrevisualisation(pkgNettoye, verdict.preview, tofu, importExistant)
                    .then(function (accepte) {
                        if (!accepte) return { statut: 'annule' };

                        var entree = partageImport.integrerPackage(pkgNettoye, { statutConfiance: tofu.statut });
                        if (importExistant) {
                            partageImport.retirerImport(importExistant.idImport);
                        }
                        // Le « First Use » du TOFU : la clé est mémorisée ICI,
                        // à l'acceptation — jamais avant (lot T).
                        window.trustTofu.memoriserContact(pkgNettoye, { remplacerCle: remplacerCle });

                        if (typeof notifications !== 'undefined' && notifications.succes) {
                            notifications.succes('Package de ' + pkgNettoye.manifest.auteur.nom + ' importé');
                        }
                        partageImport.rafraichirSection();
                        return { statut: 'importe', idImport: entree.idImport, remplace: !!importExistant };
                    });
            });
        }).catch(function (e) {
            console.error('[partage-import] Échec du pipeline :', e);
            return afficherRejet('L\'import a échoué', [e.message])
                .then(function () { return { statut: 'erreur', message: e.message }; });
        });
    };

    // ------------------------------------------------------------------
    // UI de la carte (Réglages › Données)
    // ------------------------------------------------------------------

    /** data-action — ouvre le sélecteur de fichier natif. */
    partageImport.ouvrirSelecteurFichier = function () {
        var input = document.getElementById('partage-fichier-import');
        if (input) input.click();
    };

    /** data-on-change de l'input file. */
    partageImport.surSelectionFichier = function (input) {
        if (!input || !input.files || !input.files.length) return;
        var fichier = input.files[0];
        input.value = ''; // permet de resélectionner le même fichier
        partageImport.importerFichier(fichier);
    };

    /** Bouton « Retirer » d'une ligne du registre. */
    partageImport.confirmerRetrait = function (idImport) {
        var entree = null;
        lireCollection(CLE_REGISTRE).forEach(function (e) {
            if (e.idImport === idImport) entree = e;
        });
        if (!entree) return;
        var nom = (entree.itemPrincipal && entree.itemPrincipal.nom) || 'ce package';
        if (!confirm('Retirer « ' + nom + ' » (partagé par ' + entree.auteur.nom + ') ?\n\n'
            + 'Seule la copie importée est retirée — tes propres documents ne sont pas touchés. '
            + 'Tu pourras réimporter le fichier .lcz plus tard.')) {
            return;
        }
        partageImport.retirerImport(idImport);
        if (typeof notifications !== 'undefined' && notifications.succes) {
            notifications.succes('Package retiré');
        }
        partageImport.rafraichirSection();
    };

    /**
     * Rafraîchit la liste « Packages importés » de la carte et câble le
     * dépôt par glisser-déposer (une seule fois — drag-and-drop n'est pas
     * couvert par la délégation data-action de main.js).
     */
    partageImport.rafraichirSection = function () {
        brancherZoneDepot();

        var conteneur = document.getElementById('partage-imports-liste');
        if (!conteneur) return;
        while (conteneur.firstChild) conteneur.removeChild(conteneur.firstChild);

        var imports = partageImport.listerImports();
        if (!imports.length) {
            var vide = el('p', 'text-muted', 'Aucun package importé pour l\'instant. '
                + 'Quand un·e collègue t\'envoie un fichier .lcz, dépose-le ci-dessus.');
            conteneur.appendChild(vide);
            return;
        }

        var table = el('table', 'table-ressources');
        var thead = el('thead');
        var ligneEntete = el('tr');
        ['Item principal', 'Partagé par', 'Importé le', 'Contenu', 'Actions'].forEach(function (titre) {
            ligneEntete.appendChild(el('th', null, titre));
        });
        thead.appendChild(ligneEntete);
        table.appendChild(thead);

        var tbody = el('tbody');
        imports.forEach(function (entree) {
            var tr = el('tr');

            var tdItem = el('td');
            tdItem.appendChild(el('strong', null, entree.itemPrincipal.nom || '(sans nom)'));
            var libelles = LIBELLES_TYPE[entree.itemPrincipal.type];
            tdItem.appendChild(el('br'));
            var petitType = el('small', 'text-muted', libelles ? libelles[0] : entree.itemPrincipal.type);
            tdItem.appendChild(petitType);
            tr.appendChild(tdItem);

            tr.appendChild(el('td', null, entree.auteur.nom));
            tr.appendChild(el('td', null, formaterDate(entree.dateImport)));

            var morceaux = [];
            Object.keys(entree.nbParType || {}).forEach(function (type) {
                var nb = entree.nbParType[type];
                var lib = LIBELLES_TYPE[type] || [type, type];
                morceaux.push(nb + ' ' + (nb > 1 ? lib[1] : lib[0]));
            });
            tr.appendChild(el('td', null, morceaux.join(', ') || '—'));

            var tdActions = el('td', 'actions-cell');
            var btnRetirer = el('button', 'btn btn-compact', 'Retirer');
            btnRetirer.type = 'button';
            btnRetirer.setAttribute('data-action', 'partageImport.confirmerRetrait');
            btnRetirer.setAttribute('data-param', entree.idImport);
            btnRetirer.title = 'Retirer cette copie importée (tes documents ne sont pas touchés)';
            tdActions.appendChild(btnRetirer);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        conteneur.appendChild(table);
    };

    function brancherZoneDepot() {
        var zone = document.getElementById('partage-zone-depot');
        if (!zone || zone.dataset.depotBranche === '1') return;
        zone.dataset.depotBranche = '1';

        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            zone.classList.add('partage-zone-depot--survol');
        });
        zone.addEventListener('dragleave', function () {
            zone.classList.remove('partage-zone-depot--survol');
        });
        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            zone.classList.remove('partage-zone-depot--survol');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                partageImport.importerFichier(e.dataTransfer.files[0]);
            }
        });
    }

    // ------------------------------------------------------------------
    // Test console terrain (Safari) — chaîne complète sans fichier réel
    // ------------------------------------------------------------------

    /**
     * Valide le pipeline P3 de bout en bout sur une entité réelle, avec un
     * auteur jetable : package signé → .lcz → File → importerFichier (la
     * préviz s'affiche : CLIQUER « Importer ») → vérification du préfixage,
     * du registre, du TOFU, puis RETRAIT (storage remis en état, fiche TOFU
     * nettoyée). Retourne une Promise<resultats[]>.
     */
    window._testPartageImportP3 = function (type, id) {
        var AUTEUR = 'Test P3 — auteur jetable';
        var resultats = [];
        function noter(nom, ok, detail) {
            resultats.push({ test: nom, ok: ok, detail: detail || '' });
        }
        if (!type) {
            type = 'grille';
            var grilles = ((typeof window.toutesGrillesTravail === 'function')
                ? window.toutesGrillesTravail() : lireCollection('grillesTemplates')).filter(function (g) {
                return !(window.BibliothequeUI && BibliothequeUI.estItemDemo && BibliothequeUI.estItemDemo(g));
            });
            if (!grilles.length) {
                console.error('[_testPartageImportP3] Aucune grille non-démo — passer (type, id) explicites');
                return Promise.resolve([]);
            }
            id = grilles[0].id;
        }
        var entite = window.partageExport.resoudreEntite(type, id);
        noter('1. entité résolue', !!entite, type + '/' + id);
        if (!entite) { console.table(resultats); return Promise.resolve(resultats); }

        window.trustTofu.oublierAuteur(AUTEUR);
        var idOriginal = entite.id;

        return window.partageFormat.construirePackageSigne(entite, { type: type, identiteAuteur: AUTEUR })
            .then(function (pkgSigne) {
                return window.partageExport.genererLcz(pkgSigne);
            })
            .then(function (blob) {
                console.warn('[_testPartageImportP3] Préviz à l\'écran — cliquer « Importer » pour poursuivre');
                return partageImport.importerFichier(new File([blob], 'test-p3.lcz'));
            })
            .then(function (resultat) {
                noter('2. import accepté', resultat.statut === 'importe', resultat.statut);
                if (resultat.statut !== 'importe') {
                    console.table(resultats);
                    window.trustTofu.oublierAuteur(AUTEUR);
                    return resultats;
                }
                var collection = lireCollection(CLES_STOCKAGE[type]);
                var integre = collection.filter(function (i) {
                    return i.inspireDe && i.inspireDe.idOriginal === idOriginal;
                })[0];
                noter('3. item intégré avec préfixe PARTAGE_', !!integre && integre.id.indexOf('PARTAGE_') === 0,
                    integre ? integre.id : 'absent');
                noter('4. inspireDe.idOriginal posé (D7)', !!integre && integre.inspireDe.idOriginal === idOriginal);
                var entree = partageImport.listerImports()[0];
                noter('5. registre : entrée présente', !!entree && entree.idImport === resultat.idImport);
                var tofu = window.trustTofu.verifierConfianceTOFU({ manifest: {
                    auteur: { nom: AUTEUR }, clePublique: entree.clePublique } });
                noter('6. TOFU mémorisé à l\'acceptation → verifiee', tofu.statut === 'verifiee', tofu.statut);
                var retire = partageImport.retirerImport(resultat.idImport);
                var apres = lireCollection(CLES_STOCKAGE[type]).filter(function (i) {
                    return i.inspireDe && i.inspireDe.idOriginal === idOriginal;
                });
                noter('7. retrait par identité : storage remis en état', retire && apres.length === 0);
                window.trustTofu.oublierAuteur(AUTEUR);
                partageImport.rafraichirSection();
                var verts = resultats.filter(function (r) { return r.ok; }).length;
                console.warn('[_testPartageImportP3] ' + verts + '/' + resultats.length + ' verts (auteur jetable nettoyé)');
                console.table(resultats);
                return resultats;
            })
            .catch(function (e) {
                console.error('[_testPartageImportP3] échec :', e);
                window.trustTofu.oublierAuteur(AUTEUR);
                console.table(resultats);
                throw e;
            });
    };

    window.partageImport = partageImport;
})();
