/**
 * partage-format.js — Construction d'un package `labo-codex-partage-v1`
 *
 * Chantier #329 Voûte Phase 1, lot P1.
 * Spec : `docs/architecture/PLAN2-PHASE1-SPEC.md` §5.
 * Schémas : `js/partage-schemas.js` (chargé AVANT ce module).
 *
 * API : window.partageFormat.construirePackage(itemPrincipal, options)
 *   - `itemPrincipal` : objet entité interne (ex. une grille de
 *     `grillesTemplates`). L'objet n'est PAS modifié.
 *   - `options` :
 *       type               (REQUIS) — 'grille'|'echelle'|'cartouche'|
 *                          'production'|'pratique'. Les entités internes ne
 *                          portent pas leur type : il doit être explicite
 *                          (écart assumé avec la spec d'avril, qui ne disait
 *                          pas d'où le type venait).
 *       inclureDependances (défaut true) — embarque les entités liées
 *                          (voir « Modèle de dépendances » ci-dessous).
 *       identiteAuteur     (défaut obtenirIdentiteCCUtilisateur()) — chaîne
 *                          (nom) ou objet { nom, courriel, institution,
 *                          discipline }.
 *   - Retourne l'objet package complet (PAS un ZIP — la sérialisation `.lcz`
 *     est le lot P2). Aucune écriture storage.
 *
 * Modèle de dépendances RÉEL (≠ exemple « grille → échelle » de la spec
 * d'avril : les grilles ne référencent pas d'échelle dans le modèle de
 * données — écart documenté dans SESSION.md) :
 *   - grille      → ses cartouches (`cartouches_{grilleId}`, clé globale)
 *   - cartouche   → sa grille (grilleId)
 *   - production  → sa grille (si grilleId non vide) + cartouches de celle-ci
 *   - echelle, pratique → aucune (l'échelle d'une pratique est EMBARQUÉE
 *     dans l'entité, pas référencée)
 *
 * La projection sur les schémas fermés retire par construction tout champ
 * non déclaré : `auteur`, flags démo, champs locaux (coursId, dateEcheance),
 * champs `_*` — seuls les champs du schéma sont copiés.
 *
 * Le bloc signature du manifeste est présent dès la v1 (D2, anti-dette de
 * format) mais vaut null tant que le lot F (js/signature.js) n'est pas livré.
 */
(function () {
    'use strict';

    var partageFormat = {};

    function clonerProfond(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function estObjetPlat(v) {
        return v !== null && typeof v === 'object' && !Array.isArray(v);
    }

    /**
     * Clone un objet libre en retirant les clés préfixées `_` (état interne)
     * à tous les niveaux. Les autres valeurs sont clonées telles quelles.
     */
    function clonerObjetLibre(noeud) {
        if (Array.isArray(noeud)) return noeud.map(clonerObjetLibre);
        if (estObjetPlat(noeud)) {
            var copie = {};
            Object.keys(noeud).forEach(function (k) {
                if (k.charAt(0) === window.partageSchemas.PREFIXE_CHAMP_INTERDIT) return;
                copie[k] = clonerObjetLibre(noeud[k]);
            });
            return copie;
        }
        return noeud;
    }

    /**
     * Projette une valeur selon son descripteur de schéma. Asymétrie voulue
     * export/import : l'export ÉLAGUE tout ce qui n'est pas déclaré (les
     * données réelles portent des résidus de cycles legacy), l'import
     * (partage-validation) REJETTE tout champ inconnu.
     */
    function projeterValeur(valeur, desc) {
        if (valeur === null) return null;
        switch (desc.type) {
            case 'objet':
                if (!estObjetPlat(valeur)) return undefined;
                return projeterChamps(valeur, desc.schema);
            case 'objet-libre':
                if (!estObjetPlat(valeur)) return undefined;
                return clonerObjetLibre(valeur);
            case 'tableau':
                if (!Array.isArray(valeur)) return undefined;
                if (desc.schema) {
                    return valeur
                        .filter(estObjetPlat)
                        .map(function (item) { return projeterChamps(item, desc.schema); });
                }
                if (desc.element === 'chaine') {
                    return valeur.filter(function (item) { return typeof item === 'string'; });
                }
                return clonerProfond(valeur);
            case 'dictionnaire-chaines':
                if (!estObjetPlat(valeur)) return undefined;
                var dict = {};
                Object.keys(valeur).forEach(function (k) {
                    if (k.charAt(0) === window.partageSchemas.PREFIXE_CHAMP_INTERDIT) return;
                    if (typeof valeur[k] === 'string') dict[k] = valeur[k];
                });
                return dict;
            default:
                // chaine / nombre / booleen : copie par valeur.
                return valeur;
        }
    }

    /** Projette un objet sur un schéma fermé { champ: descripteur }. */
    function projeterChamps(objet, schemaChamps) {
        var projection = {};
        Object.keys(schemaChamps).forEach(function (champ) {
            if (objet[champ] === undefined) return;
            var valeur = projeterValeur(objet[champ], schemaChamps[champ]);
            if (valeur !== undefined) projection[champ] = valeur;
        });
        return projection;
    }

    /**
     * Projette une entité interne sur son schéma fermé, RÉCURSIVEMENT :
     * seuls les champs déclarés sont copiés, à tous les niveaux (les données
     * réelles portent des champs hérités de cycles legacy que la validation
     * fermée rejetterait — bug terrain du 10 juin, grilles réelles H2026).
     */
    function projeterEntite(item, type) {
        var schema = window.partageSchemas.SCHEMA_ENTITE[type];
        if (!schema) {
            throw new Error('[partage-format] Type d\'entité inconnu : ' + type);
        }
        return projeterChamps(item, schema.champs);
    }
    partageFormat.projeterEntite = projeterEntite;

    /**
     * Lecture défensive d'une collection du storage. Retourne [] si db
     * n'est pas disponible (contexte de test sans stub) ou si la clé est vide.
     */
    function lireCollection(cle) {
        if (typeof db === 'undefined' || !db.getSync) return [];
        var valeur = db.getSync(cle, []);
        return Array.isArray(valeur) ? valeur : [];
    }

    /**
     * Rassemble les dépendances d'un item selon le modèle réel. Retourne
     * { entites: { <clePluriel>: [...] }, references: [...] } — entités déjà
     * projetées sur leur schéma.
     */
    function rassemblerDependances(item, type) {
        var resultat = { entites: {}, references: [] };

        function ajouterCartouchesDeGrille(grilleId) {
            var cartouches = lireCollection('cartouches_' + grilleId);
            if (!cartouches.length) return;
            resultat.entites.cartouches = (resultat.entites.cartouches || []);
            cartouches.forEach(function (c) {
                resultat.entites.cartouches.push(projeterEntite(c, 'cartouche'));
                resultat.references.push({
                    depuis: { type: 'cartouche', id: c.id },
                    vers: { type: 'grille', id: grilleId },
                    nature: 'utilise'
                });
            });
        }

        function ajouterGrille(grilleId, depuisType, depuisId) {
            var grille = null;
            lireCollection('grillesTemplates').forEach(function (g) {
                if (g.id === grilleId) grille = g;
            });
            if (!grille) return;
            resultat.entites.grilles = (resultat.entites.grilles || []);
            resultat.entites.grilles.push(projeterEntite(grille, 'grille'));
            resultat.references.push({
                depuis: { type: depuisType, id: depuisId },
                vers: { type: 'grille', id: grilleId },
                nature: 'utilise'
            });
            ajouterCartouchesDeGrille(grilleId);
        }

        if (type === 'grille') {
            ajouterCartouchesDeGrille(item.id);
        } else if (type === 'cartouche' && item.grilleId) {
            ajouterGrille(item.grilleId, 'cartouche', item.id);
        } else if (type === 'production' && item.grilleId) {
            ajouterGrille(item.grilleId, 'production', item.id);
        }
        // echelle, pratique : aucune dépendance référencée.

        return resultat;
    }
    partageFormat.rassemblerDependances = rassemblerDependances;

    /**
     * Normalise `identiteAuteur` (chaîne ou objet) vers le schéma
     * manifest.auteur. Fallback : obtenirIdentiteCCUtilisateur() (cc-license.js).
     */
    function normaliserAuteur(identiteAuteur) {
        if (typeof identiteAuteur === 'string' && identiteAuteur) {
            return { nom: identiteAuteur };
        }
        if (identiteAuteur && typeof identiteAuteur === 'object' && identiteAuteur.nom) {
            var auteur = { nom: String(identiteAuteur.nom) };
            ['courriel', 'institution', 'discipline'].forEach(function (k) {
                if (identiteAuteur[k]) auteur[k] = String(identiteAuteur[k]);
            });
            return auteur;
        }
        if (typeof obtenirIdentiteCCUtilisateur === 'function') {
            return { nom: obtenirIdentiteCCUtilisateur() };
        }
        return { nom: 'Utilisateur de Labo Codex' };
    }

    /**
     * Chaîne d'attribution minimale v1 : un seul maillon, l'auteur original
     * tracé par metadata_cc s'il existe. La chaîne multi-niveaux complète
     * (préservation au fork, condensation) est le lot P5.
     */
    function construireChaineAttribution(item) {
        var meta = item.metadata_cc;
        if (!meta || !meta.auteur_original) return [];
        return [{
            niveau: 0,
            auteur: String(meta.auteur_original),
            nomItem: String(item.nom || item.titre || '')
        }];
    }

    /**
     * Construit un package `labo-codex-partage-v1` complet. Voir l'en-tête
     * du fichier pour le contrat. Lance une Error si `options.type` est
     * absent ou inconnu, ou si l'item n'a pas d'id.
     */
    partageFormat.construirePackage = function (itemPrincipal, options) {
        var schemas = window.partageSchemas;
        options = options || {};

        if (!itemPrincipal || typeof itemPrincipal !== 'object') {
            throw new Error('[partage-format] itemPrincipal absent ou non-objet');
        }
        if (!options.type || schemas.TYPES_ENTITES.indexOf(options.type) === -1) {
            throw new Error('[partage-format] options.type requis, parmi : ' + schemas.TYPES_ENTITES.join(', '));
        }
        if (!itemPrincipal.id) {
            throw new Error('[partage-format] itemPrincipal.id requis');
        }

        var type = options.type;
        var inclureDependances = options.inclureDependances !== false;

        var entites = {};
        schemas.TYPES_ENTITES.forEach(function (t) {
            entites[schemas.CLES_ENTITES[t]] = [];
        });
        entites[schemas.CLES_ENTITES[type]].push(projeterEntite(itemPrincipal, type));

        var references = [];
        if (inclureDependances) {
            var deps = rassemblerDependances(itemPrincipal, type);
            Object.keys(deps.entites).forEach(function (clePluriel) {
                deps.entites[clePluriel].forEach(function (entite) {
                    // Pas de doublon si la dépendance est déjà présente
                    // (ex. item principal lui-même).
                    var dejaLa = entites[clePluriel].some(function (e) { return e.id === entite.id; });
                    if (!dejaLa) entites[clePluriel].push(entite);
                });
            });
            references = deps.references;
        }

        return {
            format: schemas.FORMAT,
            manifest: {
                licence: schemas.LICENCE,
                licence_url: schemas.LICENCE_URL,
                dateExport: new Date().toISOString(),
                auteur: normaliserAuteur(options.identiteAuteur),
                item_principal: { type: type, id: String(itemPrincipal.id) },
                chaineAttribution: construireChaineAttribution(itemPrincipal),
                signature: null,
                clePublique: null,
                algorithme: null
            },
            entites: entites,
            references: references,
            medias: []
        };
    };

    /**
     * Variante signée : construit le package puis le signe avec l'identité
     * locale (signature.js, lot F — décision D2). Chemin que P2 utilisera ;
     * les mises à jour d'un package déjà publié repassent ici (R3), il n'y
     * a qu'un seul chemin de signature. Retourne une Promise<package signé>.
     */
    partageFormat.construirePackageSigne = function (itemPrincipal, options) {
        var pkg;
        try {
            pkg = partageFormat.construirePackage(itemPrincipal, options);
        } catch (e) {
            return Promise.reject(e);
        }
        if (!window.signaturePartage) {
            return Promise.reject(new Error('[partage-format] signature.js non chargé — package signé impossible'));
        }
        return window.signaturePartage.signerPackage(pkg);
    };

    window.partageFormat = partageFormat;
})();
