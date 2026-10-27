/**
 * partage-validation.js — Validation stricte d'un package `labo-codex-partage-v1`
 *
 * Chantier #329 Voûte Phase 1, lot P1.
 * Spec : `docs/architecture/PLAN2-PHASE1-SPEC.md` §4 (6 niveaux de contrôle).
 * Schémas : `js/partage-schemas.js` (doit être chargé AVANT ce module).
 *
 * API : window.partageValidation.validerPackage(pkgObj)
 *   → { valide, erreurs, preview, packageNettoye }
 *   - `erreurs` : [{ niveau, code, message, ... }] — vide si valide.
 *   - `preview` : résumé affichable (null si invalide).
 *   - `packageNettoye` : clone profond du package après sanitisation
 *     (flags démo retirés, HTML bénin ré-échappé). null si invalide.
 *     C'est CE clone que le pipeline d'import (P3) intégrera — jamais
 *     l'objet d'entrée, qui n'est PAS modifié.
 *
 * Réconciliation spec ↔ SKILL_Securite_donnees §9.4 (règle 14, obligatoire) :
 *   - pattern DANGEREUX (`<script`, `javascript:`, `onerror=`, `onload=`,
 *     `data:text/html`) dans n'importe quelle chaîne → REJET de l'import
 *     entier (code CONTENU_DANGEREUX) — la règle du skill prime ;
 *   - HTML bénin (balises sans pattern dangereux) → ré-échappement
 *     automatique sans rejet (spec §4 niveau 5).
 *
 * Aucun effet de bord : pas d'écriture storage, pas de DOM.
 */
(function () {
    'use strict';

    var partageValidation = {};

    // ------------------------------------------------------------------
    // Helpers purs
    // ------------------------------------------------------------------

    function estObjetPlat(v) {
        return v !== null && typeof v === 'object' && !Array.isArray(v);
    }

    function clonerProfond(v) {
        return JSON.parse(JSON.stringify(v));
    }

    /**
     * Échappement HTML local (même table que echapperHtml de config.js).
     * Redéfini ici pour garder le module pur (zéro dépendance hors schémas) —
     * config.js est une zone protégée et n'est pas chargé dans les sandbox
     * de test Vitest.
     */
    function echapperTexte(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // SKILL_Securite_donnees §9.4 règle 14 — détection → rejet de l'import.
    var PATTERNS_DANGEREUX = [
        /<script/i,
        /javascript:/i,
        /onerror\s*=/i,
        /onload\s*=/i,
        /data:text\/html/i
    ];

    function trouverPatternDangereux(s) {
        for (var i = 0; i < PATTERNS_DANGEREUX.length; i++) {
            if (PATTERNS_DANGEREUX[i].test(s)) return PATTERNS_DANGEREUX[i].source;
        }
        return null;
    }

    // HTML « bénin » : présence d'une balise ('<' suivi d'une lettre, '/' ou '!').
    function contientHtmlBrut(s) {
        return /<[a-zA-Z!\/]/.test(s);
    }

    function erreur(niveau, code, message, extras) {
        var e = { niveau: niveau, code: code, message: message };
        if (extras) {
            Object.keys(extras).forEach(function (k) { e[k] = extras[k]; });
        }
        return e;
    }

    // ------------------------------------------------------------------
    // Interprète générique des descripteurs de champ (partage-schemas.js)
    // ------------------------------------------------------------------

    /**
     * 'dictionnaire-chaines' : objet plat de chaînes bornées ; `maxCles` (facultatif) borne
     * le nombre de clés (« Apporter mon matériel », lot 1, 16 oct. 2026 : extrait de
     * validerValeur pour qu'elle ne monte pas en complexité).
     */
    function validerDictionnaire(valeur, desc, chemin, problemes) {
        if (!estObjetPlat(valeur)) {
            problemes.push({ champ: chemin, message: 'objet attendu' });
            return;
        }
        if (desc.maxCles && Object.keys(valeur).length > desc.maxCles) {
            problemes.push({ champ: chemin, message: 'nombre de clés > max ' + desc.maxCles });
        }
        Object.keys(valeur).forEach(function (k) {
            if (k.charAt(0) === window.partageSchemas.PREFIXE_CHAMP_INTERDIT) {
                problemes.push({ champ: chemin + '.' + k, message: 'clé préfixée « _ » interdite' });
            }
            if (typeof valeur[k] !== 'string') {
                problemes.push({ champ: chemin + '.' + k, message: 'chaîne attendue' });
            } else if (desc.maxLongueurElement && valeur[k].length > desc.maxLongueurElement) {
                problemes.push({ champ: chemin + '.' + k, message: 'longueur > max ' + desc.maxLongueurElement });
            }
        });
    }

    /**
     * Valide une valeur contre un descripteur. Pousse les problèmes dans
     * `problemes` sous forme { champ, message }.
     */
    function validerValeur(valeur, desc, chemin, problemes) {
        if (valeur === null) {
            if (desc.nullable) return;
            problemes.push({ champ: chemin, message: 'null non accepté' });
            return;
        }

        switch (desc.type) {
            case 'chaine':
                if (typeof valeur !== 'string') {
                    problemes.push({ champ: chemin, message: 'chaîne attendue, reçu ' + typeof valeur });
                    return;
                }
                if (desc.valeurExacte !== undefined && valeur !== desc.valeurExacte) {
                    problemes.push({ champ: chemin, message: 'valeur attendue « ' + desc.valeurExacte + ' », reçu « ' + valeur.slice(0, 80) + ' »' });
                }
                if (desc.valeurs && desc.valeurs.indexOf(valeur) === -1) {
                    problemes.push({ champ: chemin, message: 'valeur « ' + valeur.slice(0, 80) + ' » hors liste [' + desc.valeurs.join(', ') + ']' });
                }
                if (desc.max && valeur.length > desc.max) {
                    problemes.push({ champ: chemin, message: 'longueur ' + valeur.length + ' > max ' + desc.max });
                }
                break;

            case 'nombre':
                if (typeof valeur !== 'number' || !isFinite(valeur)) {
                    problemes.push({ champ: chemin, message: 'nombre fini attendu' });
                    return;
                }
                if (desc.minValeur !== undefined && valeur < desc.minValeur) {
                    problemes.push({ champ: chemin, message: 'valeur ' + valeur + ' < min ' + desc.minValeur });
                }
                if (desc.maxValeur !== undefined && valeur > desc.maxValeur) {
                    problemes.push({ champ: chemin, message: 'valeur ' + valeur + ' hors limites [' + (desc.minValeur || 0) + ', ' + desc.maxValeur + ']' });
                }
                break;

            case 'booleen':
                if (typeof valeur !== 'boolean') {
                    problemes.push({ champ: chemin, message: 'booléen attendu' });
                }
                break;

            case 'tableau':
                if (!Array.isArray(valeur)) {
                    problemes.push({ champ: chemin, message: 'tableau attendu' });
                    return;
                }
                if (desc.max && valeur.length > desc.max) {
                    problemes.push({ champ: chemin, message: valeur.length + ' items > max ' + desc.max });
                }
                valeur.forEach(function (item, i) {
                    var cheminItem = chemin + '[' + i + ']';
                    if (desc.schema) {
                        if (!estObjetPlat(item)) {
                            problemes.push({ champ: cheminItem, message: 'objet attendu' });
                            return;
                        }
                        validerObjetFerme(item, desc.schema, cheminItem, problemes, null);
                    } else if (desc.element === 'chaine') {
                        if (typeof item !== 'string') {
                            problemes.push({ champ: cheminItem, message: 'chaîne attendue' });
                        } else if (desc.maxLongueurElement && item.length > desc.maxLongueurElement) {
                            problemes.push({ champ: cheminItem, message: 'longueur > max ' + desc.maxLongueurElement });
                        }
                    }
                });
                break;

            case 'objet':
                if (!estObjetPlat(valeur)) {
                    problemes.push({ champ: chemin, message: 'objet attendu' });
                    return;
                }
                validerObjetFerme(valeur, desc.schema, chemin, problemes, null);
                break;

            case 'objet-libre':
                if (!estObjetPlat(valeur)) {
                    problemes.push({ champ: chemin, message: 'objet attendu' });
                    return;
                }
                validerObjetLibre(valeur, chemin, 0, problemes);
                break;

            case 'dictionnaire-chaines':
                validerDictionnaire(valeur, desc, chemin, problemes);
                break;

            default:
                problemes.push({ champ: chemin, message: 'descripteur de type inconnu : ' + desc.type });
        }
    }

    /**
     * Valide un objet contre un schéma FERMÉ : champ inconnu, champ interdit
     * ou clé préfixée `_` = problème. `champsInterdits` ne s'applique qu'au
     * niveau appelé (racine d'une entité) — PAS aux sous-objets : `auteur`
     * est interdit à la racine d'une entité mais légitime dans
     * `manifest.auteur` ou `metadata_cc.contributeurs[]`.
     */
    function validerObjetFerme(objet, schemaChamps, chemin, problemes, champsInterdits) {
        var schemas = window.partageSchemas;
        var interdits = champsInterdits || [];

        Object.keys(objet).forEach(function (k) {
            if (k.charAt(0) === schemas.PREFIXE_CHAMP_INTERDIT) {
                problemes.push({ champ: chemin + '.' + k, message: 'champ préfixé « _ » interdit' });
            } else if (interdits.indexOf(k) !== -1) {
                problemes.push({ champ: chemin + '.' + k, message: 'champ interdit dans un package' });
            } else if (!schemaChamps[k]) {
                // `inconnu` : ce champ peut venir d'une version PLUS RÉCENTE de
                // Labo Codex (#583) — partage-import.js le dit à l'enseignant·e.
                problemes.push({ champ: chemin + '.' + k, message: 'champ inconnu (schéma fermé)', inconnu: true });
            }
        });

        Object.keys(schemaChamps).forEach(function (k) {
            var desc = schemaChamps[k];
            if (!(k in objet)) {
                if (desc.requis) {
                    problemes.push({ champ: chemin + '.' + k, message: 'champ obligatoire absent' });
                }
                return;
            }
            validerValeur(objet[k], desc, chemin + '.' + k, problemes);
        });
    }

    /**
     * Validation STRUCTURELLE d'un objet libre (configurations de pratiques) :
     * types JSON purs uniquement, profondeur bornée, chaînes bornées, aucune
     * clé préfixée `_`.
     */
    function validerObjetLibre(noeud, chemin, profondeur, problemes) {
        var limites = window.partageSchemas.LIMITES;
        if (profondeur > limites.profondeurMaxObjetLibre) {
            problemes.push({ champ: chemin, message: 'profondeur > max ' + limites.profondeurMaxObjetLibre });
            return;
        }
        if (noeud === null) return;
        var t = typeof noeud;
        if (t === 'string') {
            if (noeud.length > limites.longueurMaxChaineLibre) {
                problemes.push({ champ: chemin, message: 'chaîne > max ' + limites.longueurMaxChaineLibre });
            }
            return;
        }
        if (t === 'number') {
            if (!isFinite(noeud)) problemes.push({ champ: chemin, message: 'nombre non fini' });
            return;
        }
        if (t === 'boolean') return;
        if (Array.isArray(noeud)) {
            noeud.forEach(function (item, i) {
                validerObjetLibre(item, chemin + '[' + i + ']', profondeur + 1, problemes);
            });
            return;
        }
        if (estObjetPlat(noeud)) {
            Object.keys(noeud).forEach(function (k) {
                if (k.charAt(0) === window.partageSchemas.PREFIXE_CHAMP_INTERDIT) {
                    problemes.push({ champ: chemin + '.' + k, message: 'clé préfixée « _ » interdite' });
                    return;
                }
                validerObjetLibre(noeud[k], chemin + '.' + k, profondeur + 1, problemes);
            });
            return;
        }
        // function, undefined, symbol… — impossible après JSON.parse, mais
        // construirePackage peut recevoir n'importe quoi.
        problemes.push({ champ: chemin, message: 'type non JSON : ' + t });
    }

    // ------------------------------------------------------------------
    // Parcours des chaînes d'un package (niveau 5)
    // ------------------------------------------------------------------

    /**
     * Visite récursivement toutes les chaînes d'un nœud et les remplace par
     * le retour du visiteur. Mute le nœud (à appeler sur un CLONE).
     */
    function transformerChaines(noeud, visiteur, chemin) {
        if (typeof noeud === 'string') return visiteur(noeud, chemin);
        if (Array.isArray(noeud)) {
            for (var i = 0; i < noeud.length; i++) {
                noeud[i] = transformerChaines(noeud[i], visiteur, chemin + '[' + i + ']');
            }
            return noeud;
        }
        if (estObjetPlat(noeud)) {
            Object.keys(noeud).forEach(function (k) {
                noeud[k] = transformerChaines(noeud[k], visiteur, chemin + '.' + k);
            });
            return noeud;
        }
        return noeud;
    }

    /**
     * #583 (25 sept. 2026) — UN REPÈRE QUI NE DÉSIGNE AUCUN NIVEAU N'ARRIVE PAS.
     *
     * Les deux repères de maîtrise sont des CODES de niveau. Un repère dont le
     * code n'est porté par aucun des niveaux transportés (paquet fabriqué à la
     * main, ou échelle dont un niveau a été renommé sans que le repère suive)
     * serait lu chez le destinataire comme « défini » — et le bilan de la
     * rétroaction classerait les critères contre un niveau introuvable.
     *
     * Règle : le repère est RETIRÉ de l'échelle nettoyée, le reste de l'échelle
     * est importé, et la prévisualisation le DIT. Refuser tout le paquet pour un
     * repère serait disproportionné : la personne peut le poser elle-même dans
     * l'éditeur d'échelle. Un repère vide est retiré sans un mot : vide se lit
     * « absent », c'est la règle de `modifierRepereEchelle` (echelles.js).
     *
     * Travaille sur le clone nettoyé : le paquet brut, que vérifie la
     * signature, n'est jamais touché.
     *
     * @param {Array} echelles - entites.echelles du package NETTOYÉ (muté)
     * @returns {Array<{id, champ, code, message}>}
     */
    // Les libellés de l'ÉCRAN (`REPERES_ECHELLE`, echelles.js) : « le repère de
    // suffisance » n'existe nulle part dans l'éditeur. Recopiés et non lus, parce
    // que ce module se charge sans echelles.js (bancs, auto-contrôle) ; un essai
    // de `partage-echelle-reperes-583.test.js` exige qu'ils restent identiques.
    var LIBELLES_REPERES = {
        seuilSuffisance: 'Suffisant à partir de',
        seuilMaitrise: 'Maîtrisé à partir de'
    };

    function retirerReperesOrphelins(echelles) {
        var avertissements = [];
        echelles.forEach(function (echelle) {
            var codes = (echelle.niveaux || []).map(function (n) { return n.code; });
            Object.keys(LIBELLES_REPERES).forEach(function (champ) {
                if (!(champ in echelle)) return;
                var code = echelle[champ];
                if (code !== '' && codes.indexOf(code) !== -1) return;
                delete echelle[champ];
                if (code === '') return;
                avertissements.push({
                    id: echelle.id,
                    champ: champ,
                    code: code,
                    // Texte validé par Grégoire le 25 sept. 2026.
                    message: 'Échelle « ' + echelle.nom + ' » : le repère « ' + LIBELLES_REPERES[champ]
                        + ' » désigne le niveau « ' + code + ' », qui n\'existe pas dans cette échelle. '
                        + 'Ce repère n\'est pas importé ; tu pourras le poser dans l\'éditeur d\'échelle.'
                });
            });
        });
        return avertissements;
    }
    partageValidation.retirerReperesOrphelins = retirerReperesOrphelins;
    partageValidation.LIBELLES_REPERES = LIBELLES_REPERES;

    // ------------------------------------------------------------------
    // validerPackage — les 6 niveaux
    // ------------------------------------------------------------------

    partageValidation.validerPackage = function (pkgObj) {
        var schemas = window.partageSchemas;
        var erreurs = [];

        function rejet() {
            return { valide: false, erreurs: erreurs, preview: null, packageNettoye: null };
        }

        // ---- Niveau 1 — structure de haut niveau --------------------------
        if (!estObjetPlat(pkgObj)) {
            erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Package absent ou non-objet'));
            return rejet();
        }
        if (pkgObj.format !== schemas.FORMAT) {
            erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Champ format attendu « ' + schemas.FORMAT + ' », reçu « ' + String(pkgObj.format).slice(0, 80) + ' »'));
        }
        Object.keys(pkgObj).forEach(function (k) {
            if (schemas.CLES_RACINE.indexOf(k) === -1) {
                erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Clé racine inconnue : « ' + k + ' »', { champInconnu: true }));
            }
        });
        ['format', 'manifest', 'entites'].forEach(function (k) {
            if (!(k in pkgObj)) {
                erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Clé racine obligatoire absente : « ' + k + ' »'));
            }
        });
        if (erreurs.length) return rejet();

        // Limite de taille globale (10 Mo — cf. partage-schemas.LIMITES).
        var tailleSerialise;
        try {
            tailleSerialise = JSON.stringify(pkgObj).length;
        } catch (e) {
            erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Package non sérialisable : ' + e.message));
            return rejet();
        }
        if (tailleSerialise > schemas.LIMITES.tailleMaxPackageOctets) {
            erreurs.push(erreur(1, 'FORMAT_INVALIDE', 'Package trop volumineux : ' + tailleSerialise + ' > ' + schemas.LIMITES.tailleMaxPackageOctets + ' octets'));
            return rejet();
        }

        // Travail sur un clone : l'objet d'entrée n'est jamais modifié.
        var pkg = clonerProfond(pkgObj);

        // ---- Niveau 2 — manifeste -----------------------------------------
        var manifest = pkg.manifest;
        if (!estObjetPlat(manifest)) {
            erreurs.push(erreur(2, 'MANIFEST_INVALIDE', 'manifest doit être un objet'));
            return rejet();
        }
        var problemesManifest = [];
        validerObjetFerme(manifest, schemas.SCHEMA_MANIFESTE.champs, 'manifest', problemesManifest, null);
        problemesManifest.forEach(function (p) {
            erreurs.push(erreur(2, 'MANIFEST_INVALIDE', p.message, { champ: p.champ, champInconnu: !!p.inconnu }));
        });
        if (manifest.dateExport && isNaN(Date.parse(manifest.dateExport))) {
            erreurs.push(erreur(2, 'MANIFEST_INVALIDE', 'dateExport non parsable en date ISO 8601', { champ: 'manifest.dateExport' }));
        }
        if (erreurs.length) return rejet();

        // ---- Niveau 3 — schéma fermé par entité ---------------------------
        var entites = pkg.entites;
        if (!estObjetPlat(entites)) {
            erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'entites doit être un objet'));
            return rejet();
        }
        Object.keys(entites).forEach(function (clePluriel) {
            var type = null;
            Object.keys(schemas.CLES_ENTITES).forEach(function (t) {
                if (schemas.CLES_ENTITES[t] === clePluriel) type = t;
            });
            if (!type) {
                erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'Type d\'entité inconnu : « ' + clePluriel + ' »', { champInconnu: true }));
                return;
            }
            var liste = entites[clePluriel];
            if (!Array.isArray(liste)) {
                erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'entites.' + clePluriel + ' doit être un tableau', { type: type }));
                return;
            }
            if (liste.length > schemas.LIMITES.maxItemsParType) {
                erreurs.push(erreur(3, 'ENTITE_INVALIDE', liste.length + ' items > max ' + schemas.LIMITES.maxItemsParType, { type: type }));
            }
            var schemaType = schemas.SCHEMA_ENTITE[type];
            liste.forEach(function (item, i) {
                if (!estObjetPlat(item)) {
                    erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'item non-objet', { type: type, index: i }));
                    return;
                }
                // Niveau 6 (partiel) — flags démo retirés SILENCIEUSEMENT
                // avant la validation fermée (spec test 10 : pas de rejet).
                schemas.CHAMPS_RETIRES_SILENCIEUSEMENT.forEach(function (flag) {
                    delete item[flag];
                });
                var problemes = [];
                validerObjetFerme(item, schemaType.champs, clePluriel + '[' + i + ']', problemes,
                    schemas.CHAMPS_INTERDITS_COMMUNS.concat(schemaType.champsInterdits));
                problemes.forEach(function (p) {
                    erreurs.push(erreur(3, 'ENTITE_INVALIDE', p.message, { type: type, id: item.id || null, champ: p.champ, champInconnu: !!p.inconnu }));
                });
                // #1120, lot 1 — ce que le schéma du barème ne dit pas : la règle de `bareme.js`,
                // la même qu'à l'écriture (une seule source). Sans elle, rien n'entre.
                if (!problemes.length && Array.isArray(item.criteres)) {
                    item.criteres.forEach(function (c, j) {
                        if (!c || !('bareme' in c)) return;
                        var raison = window.bareme ? window.bareme.refusStructure(c.bareme) : 'module du barème absent';
                        if (raison) {
                            erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'barème : ' + raison,
                                { type: type, id: item.id || null, champ: clePluriel + '[' + i + '].criteres[' + j + '].bareme' }));
                        }
                    });
                    // La table de cas, lot 3b (26 oct. 2026) — de même, les tables de cas : la règle de leur
                    // registre (`tablesCasAlgo.refusStructure`), celle que la lecture applique.
                    item.criteres.forEach(function (c, j) {
                        if (!c || !('tablesCas' in c)) return;
                        var raison = window.tablesCasAlgo ? window.tablesCasAlgo.refusStructure(c.tablesCas) : 'module des tables de cas absent';
                        if (raison) {
                            erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'tables de cas : ' + raison,
                                { type: type, id: item.id || null, champ: clePluriel + '[' + i + '].criteres[' + j + '].tablesCas' }));
                        }
                    });
                    // Étape 4a (27 oct. 2026) — « quand une donnée vaut 0 » : la règle du registre des calculs.
                    item.criteres.forEach(function (c, j) {
                        if (!c || !('casZero' in c)) return;
                        var raison = window.formulesAlgo ? window.formulesAlgo.refusCasZero(c.casZero) : 'module des calculs absent';
                        if (raison) {
                            erreurs.push(erreur(3, 'ENTITE_INVALIDE', 'calcul de la note : ' + raison,
                                { type: type, id: item.id || null, champ: clePluriel + '[' + i + '].criteres[' + j + '].casZero' }));
                        }
                    });
                }
            });
        });
        if (erreurs.length) return rejet();

        // item_principal doit exister dans entites (spec niveau 2, vérifiable
        // seulement maintenant que entites est validé).
        var ip = manifest.item_principal;
        var listePrincipale = entites[schemas.CLES_ENTITES[ip.type]] || [];
        var itemPrincipal = null;
        listePrincipale.forEach(function (item) {
            if (item.id === ip.id) itemPrincipal = item;
        });
        if (!itemPrincipal) {
            erreurs.push(erreur(2, 'MANIFEST_INVALIDE', 'item_principal introuvable dans entites : ' + ip.type + '/' + ip.id));
            return rejet();
        }

        // ---- Niveau 4 — intégrité référentielle ---------------------------
        var references = pkg.references || [];
        if (!Array.isArray(references)) {
            erreurs.push(erreur(4, 'REFERENCE_ORPHELINE', 'references doit être un tableau'));
            return rejet();
        }
        if (references.length > schemas.LIMITES.maxReferences) {
            erreurs.push(erreur(4, 'REFERENCE_ORPHELINE', references.length + ' références > max ' + schemas.LIMITES.maxReferences));
        }
        var idsParType = {};
        schemas.TYPES_ENTITES.forEach(function (t) {
            idsParType[t] = {};
            (entites[schemas.CLES_ENTITES[t]] || []).forEach(function (item) {
                idsParType[t][item.id] = true;
            });
        });
        var arcs = {}; // clé "type/id" → [clés cibles]
        references.forEach(function (ref, i) {
            var problemes = [];
            if (!estObjetPlat(ref)) {
                erreurs.push(erreur(4, 'REFERENCE_ORPHELINE', 'référence non-objet', { index: i }));
                return;
            }
            validerObjetFerme(ref, schemas.SCHEMA_REFERENCE.champs, 'references[' + i + ']', problemes, null);
            if (problemes.length) {
                problemes.forEach(function (p) {
                    erreurs.push(erreur(4, 'REFERENCE_ORPHELINE', p.message, { champ: p.champ }));
                });
                return;
            }
            [ref.depuis, ref.vers].forEach(function (extremite, j) {
                if (!idsParType[extremite.type] || !idsParType[extremite.type][extremite.id]) {
                    erreurs.push(erreur(4, 'REFERENCE_ORPHELINE',
                        'Référence ' + (j === 0 ? 'depuis' : 'vers') + ' un item absent du package : ' + extremite.type + '/' + extremite.id,
                        { index: i }));
                }
            });
            var de = ref.depuis.type + '/' + ref.depuis.id;
            var vers = ref.vers.type + '/' + ref.vers.id;
            (arcs[de] = arcs[de] || []).push(vers);
        });
        // Détection de cycle (DFS itératif avec pile d'états ; couvre A → A).
        var ETAT_EN_COURS = 1, ETAT_FINI = 2;
        var etats = {};
        Object.keys(arcs).forEach(function (depart) {
            if (etats[depart]) return;
            var pile = [{ noeud: depart, indexArc: 0 }];
            etats[depart] = ETAT_EN_COURS;
            while (pile.length) {
                var haut = pile[pile.length - 1];
                var suivants = arcs[haut.noeud] || [];
                if (haut.indexArc >= suivants.length) {
                    etats[haut.noeud] = ETAT_FINI;
                    pile.pop();
                    continue;
                }
                var cible = suivants[haut.indexArc++];
                if (etats[cible] === ETAT_EN_COURS) {
                    erreurs.push(erreur(4, 'REFERENCE_CIRCULAIRE', 'Cycle de références détecté via ' + cible));
                } else if (!etats[cible]) {
                    etats[cible] = ETAT_EN_COURS;
                    pile.push({ noeud: cible, indexArc: 0 });
                }
            }
        });
        if (erreurs.length) return rejet();

        // medias : structure prévue au format, gérée en Phase 2 seulement.
        if ('medias' in pkg) {
            if (!Array.isArray(pkg.medias)) {
                erreurs.push(erreur(4, 'FORMAT_INVALIDE', 'medias doit être un tableau'));
            } else if (pkg.medias.length > 0) {
                erreurs.push(erreur(4, 'MEDIAS_NON_SUPPORTES', 'Les médias ne sont pas supportés en Phase 1 (' + pkg.medias.length + ' déclarés)'));
            }
            if (erreurs.length) return rejet();
        }

        // ---- Niveau 5 — sanitisation (sur le clone) -----------------------
        transformerChaines(pkg, function (s, chemin) {
            var pattern = trouverPatternDangereux(s);
            if (pattern) {
                erreurs.push(erreur(5, 'CONTENU_DANGEREUX', 'Pattern dangereux détecté (' + pattern + ')', { champ: chemin }));
                return s;
            }
            if (contientHtmlBrut(s)) return echapperTexte(s);
            return s;
        }, 'package');
        if (erreurs.length) return rejet();

        // ---- Niveau 6 — chaîne « Demo Labo Codex » réservée ---------------
        var champsAuteur = [{ valeur: manifest.auteur.nom, champ: 'manifest.auteur.nom' }];
        (manifest.chaineAttribution || []).forEach(function (maillon, i) {
            champsAuteur.push({ valeur: maillon.auteur, champ: 'manifest.chaineAttribution[' + i + '].auteur' });
        });
        champsAuteur.forEach(function (c) {
            if (c.valeur === schemas.AUTEUR_RESERVE) {
                erreurs.push(erreur(6, 'USURPATION_DEMO', 'Chaîne d\'auteur réservée « ' + schemas.AUTEUR_RESERVE + ' »', { champ: c.champ }));
            }
        });
        schemas.TYPES_ENTITES.forEach(function (t) {
            (entites[schemas.CLES_ENTITES[t]] || []).forEach(function (item) {
                if (typeof item.id === 'string' && item.id.indexOf(schemas.PREFIXE_ID_DEMO) === 0) {
                    erreurs.push(erreur(6, 'USURPATION_DEMO', 'ID réservé au pack démo : ' + item.id, { type: t, id: item.id }));
                }
            });
        });
        if (erreurs.length) return rejet();

        // ---- Repères de maîtrise orphelins (#583, 25 sept. 2026) -----------
        var avertissements = retirerReperesOrphelins(entites[schemas.CLES_ENTITES.echelle] || []);

        // ---- Succès --------------------------------------------------------
        var nbEntites = {};
        schemas.TYPES_ENTITES.forEach(function (t) {
            nbEntites[schemas.CLES_ENTITES[t]] = (entites[schemas.CLES_ENTITES[t]] || []).length;
        });
        return {
            valide: true,
            erreurs: [],
            preview: {
                nomItemPrincipal: itemPrincipal.nom || itemPrincipal.titre || '(sans nom)',
                auteurNom: manifest.auteur.nom,
                dateExport: manifest.dateExport,
                nbEntites: nbEntites,
                chaineAttribution: clonerProfond(manifest.chaineAttribution || []),
                // #643 — '' pour un fichier émis avant ce lot, ou sans cartouche : la
                // prévisualisation ne dit alors rien, plutôt qu'une phrase inventée.
                trimestreCartouches: (nbEntites[schemas.CLES_ENTITES.cartouche] > 0
                    && typeof manifest.trimestreCartouches === 'string') ? manifest.trimestreCartouches : '',
                avertissements: avertissements.map(function (a) { return a.message; })
            },
            avertissements: avertissements,
            packageNettoye: pkg
        };
    };

    // ------------------------------------------------------------------
    // Tests manuels console — spec §6 (14 scénarios)
    // ------------------------------------------------------------------
    // Validation manuelle Mac/iPad : ouvrir la console et exécuter
    // `_testPartagePhase1()`. La couverture AUTOMATISÉE équivalente vit dans
    // `tests/unit/partage-phase1-P1.test.js` (sentinelles Vitest, amendement
    // du plan du 10 juin) — cette fonction reste pour le terrain sans Node.
    // Tests 1-2 : le modèle de dépendances réel est grille → cartouches
    // (PAS grille → échelle comme l'exemple de la spec d'avril).
    window._testPartagePhase1 = function () {
        var schemas = window.partageSchemas;
        var resultats = [];

        function verifier(numero, libelle, condition) {
            resultats.push({ numero: numero, libelle: libelle, ok: !!condition });
            if (!condition) console.error('[Test Phase 1] ÉCHEC #' + numero + ' — ' + libelle);
        }

        function grilleFixture() {
            return {
                id: 'GR_TEST_P1', nom: 'Grille de test P1',
                criteres: [{ id: 'C1', nom: 'Structure', ponderation: 20 }],
                metadata_cc: { auteur_original: 'Test P1', licence: schemas.LICENCE, contributeurs: [] }
            };
        }

        function pkgFixture() {
            return {
                format: schemas.FORMAT,
                manifest: {
                    licence: schemas.LICENCE,
                    dateExport: '2026-06-10T12:00:00Z',
                    auteur: { nom: 'Test P1' },
                    item_principal: { type: 'grille', id: 'GR_TEST_P1' },
                    chaineAttribution: [],
                    signature: null, clePublique: null, algorithme: null
                },
                entites: { grilles: [grilleFixture()] },
                references: [],
                medias: []
            };
        }

        var v = partageValidation.validerPackage;

        // 1-2 — construirePackage (grille réelle du storage si disponible,
        // fixture sinon) → package valide ; dépendances incluses.
        var grilleSource = null;
        if (typeof db !== 'undefined' && db.getSync) {
            var cleGrilles = (typeof cle === 'function') ? cle('grillesTemplates') : 'grillesTemplates';
            var grilles = db.getSync(cleGrilles, []);
            if (Array.isArray(grilles) && grilles.length) grilleSource = grilles[0];
        }
        if (!grilleSource) {
            console.warn('[Test Phase 1] grillesTemplates vide — tests 1-2 sur fixture');
            grilleSource = grilleFixture();
        }
        var pkgConstruit = null;
        try {
            pkgConstruit = window.partageFormat.construirePackage(grilleSource, {
                type: 'grille', inclureDependances: true, identiteAuteur: 'Test P1'
            });
        } catch (e) {
            console.error('[Test Phase 1] construirePackage a lancé :', e.message);
        }
        var r1 = pkgConstruit ? v(pkgConstruit) : { valide: false, erreurs: [] };
        if (!r1.valide && r1.erreurs.length) console.error('[Test Phase 1] #1 erreurs :', r1.erreurs);
        verifier(1, 'construirePackage(grille) → validerPackage valide', r1.valide);

        var cartouchesAttendues = (typeof db !== 'undefined' && db.getSync)
            ? (db.getSync((typeof cle === 'function') ? cle('cartouches_' + grilleSource.id) : 'cartouches_' + grilleSource.id, []) || []).length : 0;
        var cartouchesIncluses = pkgConstruit ? (pkgConstruit.entites.cartouches || []).length : 0;
        if (cartouchesAttendues === 0) {
            console.warn('[Test Phase 1] #2 — aucune cartouche en storage pour ' + grilleSource.id + ' : vérification structurelle seulement');
            verifier(2, 'inclureDependances — structure references/medias présente',
                pkgConstruit && Array.isArray(pkgConstruit.references) && Array.isArray(pkgConstruit.medias));
        } else {
            verifier(2, 'inclureDependances — les cartouches de la grille sont incluses',
                cartouchesIncluses === cartouchesAttendues
                && pkgConstruit.references.length === cartouchesAttendues);
        }

        // 3 — objet vide rejeté.
        verifier(3, 'rejette un objet vide', v({}).valide === false);

        // 4 — format différent rejeté.
        var p4 = pkgFixture(); p4.format = 'autre-format';
        verifier(4, 'rejette un format différent', v(p4).erreurs.some(function (e) { return e.code === 'FORMAT_INVALIDE'; }));

        // 5 — manifest sans auteur.nom rejeté.
        var p5 = pkgFixture(); delete p5.manifest.auteur.nom;
        verifier(5, 'rejette un manifest sans auteur.nom', v(p5).erreurs.some(function (e) { return e.code === 'MANIFEST_INVALIDE'; }));

        // 6 — auteur réservé rejeté.
        var p6 = pkgFixture(); p6.manifest.auteur.nom = schemas.AUTEUR_RESERVE;
        verifier(6, 'rejette auteur.nom « Demo Labo Codex »', v(p6).erreurs.some(function (e) { return e.code === 'USURPATION_DEMO'; }));

        // 7 — champ inconnu rejeté.
        var p7 = pkgFixture(); p7.entites.grilles[0].champMystere = 'x';
        verifier(7, 'rejette une grille avec champ inconnu', v(p7).erreurs.some(function (e) { return e.code === 'ENTITE_INVALIDE'; }));

        // 8 — référence orpheline rejetée.
        var p8 = pkgFixture();
        p8.references = [{ depuis: { type: 'grille', id: 'GR_TEST_P1' }, vers: { type: 'echelle', id: 'FANTOME' }, nature: 'utilise' }];
        verifier(8, 'rejette une référence orpheline', v(p8).erreurs.some(function (e) { return e.code === 'REFERENCE_ORPHELINE'; }));

        // 9 — référence circulaire détectée (A → A).
        var p9 = pkgFixture();
        p9.references = [{ depuis: { type: 'grille', id: 'GR_TEST_P1' }, vers: { type: 'grille', id: 'GR_TEST_P1' }, nature: 'derive_de' }];
        verifier(9, 'détecte une référence circulaire', v(p9).erreurs.some(function (e) { return e.code === 'REFERENCE_CIRCULAIRE'; }));

        // 10 — flag isDemo retiré silencieusement.
        var p10 = pkgFixture(); p10.entites.grilles[0].isDemo = true;
        var r10 = v(p10);
        verifier(10, 'retire silencieusement isDemo', r10.valide && !('isDemo' in r10.packageNettoye.entites.grilles[0]));

        // 11 — HTML brut échappé (bénin, sans pattern dangereux).
        var p11 = pkgFixture(); p11.entites.grilles[0].nom = 'Grille <em>riche</em>';
        var r11 = v(p11);
        verifier(11, 'échappe le HTML brut d\'un champ texte',
            r11.valide && r11.packageNettoye.entites.grilles[0].nom.indexOf('<') === -1);

        // 12 — chaîne d'attribution multi-niveaux préservée.
        var p12 = pkgFixture();
        p12.manifest.chaineAttribution = [
            { niveau: 0, auteur: 'Auteur originel', nomItem: 'Grille mère' },
            { niveau: 1, auteur: 'Forkeur', nomItem: 'Grille fille' }
        ];
        var r12 = v(p12);
        verifier(12, 'préserve la chaîne d\'attribution multi-niveaux',
            r12.valide && r12.preview.chaineAttribution.length === 2
            && r12.preview.chaineAttribution[1].auteur === 'Forkeur');

        // 13 — limite 50 critères.
        var p13 = pkgFixture();
        p13.entites.grilles[0].criteres = [];
        for (var i = 0; i < 51; i++) p13.entites.grilles[0].criteres.push({ id: 'C' + i, nom: 'c' });
        verifier(13, 'respecte la limite de 50 critères', v(p13).valide === false);

        // 14 — limite 200 caractères sur nom.
        var p14 = pkgFixture();
        p14.entites.grilles[0].nom = new Array(202).join('x');
        verifier(14, 'respecte la limite de 200 caractères sur nom', v(p14).valide === false);

        var reussis = resultats.filter(function (r) { return r.ok; }).length;
        console.warn('[Test Phase 1] ' + reussis + '/14 tests réussis');
        return reussis === 14;
    };

    window.partageValidation = partageValidation;
})();
