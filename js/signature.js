/**
 * signature.js — Défense F : signature ECDSA des packages de partage
 *
 * Chantier #329 Voûte Phase 1, lot F (décision D2 du 11 mai 2026).
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 *
 * Rôle : garantir l'authenticité et l'intégrité d'un package
 * `labo-codex-partage-v1` (cf. partage-schemas.js). Neutralise U-01
 * (usurpation d'identité, MODELE-MENACES.md) : aucun package accepté
 * sans signature valide une fois ce lot câblé dans le pipeline P3.
 *
 * CE QUI EST SIGNÉ (spécifié ici, la spec d'avril ne le disait pas) :
 * la sérialisation CANONIQUE (clés d'objets triées, UTF-8) du package
 * ENTIER, bloc signature mis à null (manifest.signature, clePublique,
 * algorithme). Signer le manifeste seul laisserait altérer les entités
 * sans invalider la signature — le critère 16 du plan serait illusoire.
 * Toute mise à jour d'un package repasse par signerPackage (R3 du
 * benchmark Obsidian) : il n'existe qu'un seul chemin de signature.
 *
 * CRYPTO : Web Crypto natif exclusivement (`crypto.subtle`), ECDSA
 * P-256 + SHA-256 (partage-schemas.ALGORITHME_SIGNATURE). Aucune
 * primitive maison. Signature et clé publique (JWK JSON) encodées
 * base64 dans le manifeste.
 *
 * STOCKAGE DE L'IDENTITÉ : base IndexedDB DÉDIÉE (`labo-codex-identite`),
 * possédée par ce module — PAS db.js. Décision Grégoire 10 juin 2026
 * (écart au plan documenté) : db.js recopie chaque écriture dans
 * localStorage en JSON, où un CryptoKey non extractible se dégrade
 * silencieusement en {} ; et les exports/restaurations Codex itèrent
 * sur les clés db.js — le matériel d'identité ne doit jamais entrer
 * dans ce flux. Clé privée NON EXTRACTIBLE : perte = nouvelle identité
 * (accepté pour le pilote ; sauvegarde chiffrée = #47, hors lot).
 * Registre documenté dans docs/DATA-OWNERSHIP.md.
 *
 * Tests : tests/unit/signature-F.test.js (canonicalisation, aller-retour,
 * vecteurs fixes committés) + window._testSignatureF() (terrain Safari).
 */
(function () {
    'use strict';

    var signaturePartage = {};

    // ------------------------------------------------------------------
    // Constantes
    // ------------------------------------------------------------------

    var NOM_BDD = 'labo-codex-identite';
    var VERSION_BDD = 1;
    var NOM_STORE = 'cles';
    var ID_IDENTITE = 'identite-v1';

    var PARAMS_CLE = { name: 'ECDSA', namedCurve: 'P-256' };
    var PARAMS_SIGNATURE = { name: 'ECDSA', hash: { name: 'SHA-256' } };

    signaturePartage.NOM_BDD = NOM_BDD;

    function subtle() {
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            throw new Error('[signature] Web Crypto (crypto.subtle) indisponible');
        }
        return crypto.subtle;
    }

    function algorithmeAttendu() {
        return window.partageSchemas
            ? window.partageSchemas.ALGORITHME_SIGNATURE
            : 'ECDSA-P256-SHA-256';
    }

    // ------------------------------------------------------------------
    // Encodage — base64 ↔ ArrayBuffer, UTF-8
    // ------------------------------------------------------------------

    function bufferVersB64(buffer) {
        var octets = new Uint8Array(buffer);
        var binaire = '';
        for (var i = 0; i < octets.length; i++) {
            binaire += String.fromCharCode(octets[i]);
        }
        return btoa(binaire);
    }

    function b64VersBuffer(b64) {
        var binaire = atob(b64);
        var octets = new Uint8Array(binaire.length);
        for (var i = 0; i < binaire.length; i++) {
            octets[i] = binaire.charCodeAt(i);
        }
        return octets.buffer;
    }

    function chaineVersOctets(chaine) {
        return new TextEncoder().encode(chaine);
    }

    // ------------------------------------------------------------------
    // Canonicalisation — sérialisation déterministe pour signature
    // ------------------------------------------------------------------

    /**
     * Sérialise une valeur JSON en chaîne CANONIQUE : identique à
     * JSON.stringify, mais avec les clés d'objets triées récursivement.
     * Nécessaire pour que signataire et vérificateur produisent les
     * mêmes octets quel que soit l'ordre d'insertion des clés.
     */
    function canonicaliser(valeur) {
        if (valeur === undefined) return undefined;
        if (valeur === null || typeof valeur === 'number'
            || typeof valeur === 'boolean' || typeof valeur === 'string') {
            return JSON.stringify(valeur);
        }
        if (Array.isArray(valeur)) {
            var items = valeur.map(function (v) {
                var s = canonicaliser(v);
                return s === undefined ? 'null' : s;
            });
            return '[' + items.join(',') + ']';
        }
        if (typeof valeur === 'object') {
            var cles = Object.keys(valeur).sort();
            var paires = [];
            cles.forEach(function (k) {
                var s = canonicaliser(valeur[k]);
                if (s !== undefined) {
                    paires.push(JSON.stringify(k) + ':' + s);
                }
            });
            return '{' + paires.join(',') + '}';
        }
        // function, symbol : ignorés comme en JSON.
        return undefined;
    }
    signaturePartage.canonicaliser = canonicaliser;

    /**
     * Construit la chaîne signée d'un package : canonicalisation du
     * package entier, bloc signature neutralisé (les trois champs à
     * null). Utilisée À L'IDENTIQUE par signerPackage et
     * verifierSignaturePackage.
     */
    function construirePayloadSignature(pkg) {
        if (!pkg || typeof pkg !== 'object' || !pkg.manifest || typeof pkg.manifest !== 'object') {
            throw new Error('[signature] Package sans manifeste : payload impossible');
        }
        var clone = JSON.parse(JSON.stringify(pkg));
        clone.manifest.signature = null;
        clone.manifest.clePublique = null;
        clone.manifest.algorithme = null;
        return canonicaliser(clone);
    }
    signaturePartage.construirePayloadSignature = construirePayloadSignature;

    // ------------------------------------------------------------------
    // Crypto pur — fonctions testables sans IndexedDB
    // ------------------------------------------------------------------

    /** Signe une chaîne UTF-8. Retourne la signature en base64. */
    signaturePartage.signerChaine = function (clePrivee, chaine) {
        return subtle().sign(PARAMS_SIGNATURE, clePrivee, chaineVersOctets(chaine))
            .then(bufferVersB64);
    };

    /** Vérifie une signature base64 sur une chaîne UTF-8. Retourne un booléen. */
    signaturePartage.verifierChaine = function (clePublique, chaine, signatureB64) {
        var buffer;
        try {
            buffer = b64VersBuffer(signatureB64);
        } catch (e) {
            return Promise.resolve(false);
        }
        return subtle().verify(PARAMS_SIGNATURE, clePublique, buffer, chaineVersOctets(chaine));
    };

    /** Exporte une clé publique en base64(JWK JSON) — forme du manifeste. */
    signaturePartage.exporterClePubliqueB64 = function (clePublique) {
        return subtle().exportKey('jwk', clePublique).then(function (jwk) {
            return btoa(JSON.stringify(jwk));
        });
    };

    /** Importe une clé publique depuis base64(JWK JSON). Rejette si malformée. */
    signaturePartage.importerClePubliqueB64 = function (b64) {
        var jwk;
        try {
            jwk = JSON.parse(atob(b64));
        } catch (e) {
            return Promise.reject(new Error('[signature] Clé publique illisible (base64/JSON)'));
        }
        return subtle().importKey('jwk', jwk, PARAMS_CLE, true, ['verify']);
    };

    // ------------------------------------------------------------------
    // Identité locale — base IndexedDB dédiée
    // ------------------------------------------------------------------

    function ouvrirBdd() {
        return new Promise(function (resolve, reject) {
            var requete = indexedDB.open(NOM_BDD, VERSION_BDD);
            requete.onupgradeneeded = function () {
                var bdd = requete.result;
                if (!bdd.objectStoreNames.contains(NOM_STORE)) {
                    bdd.createObjectStore(NOM_STORE, { keyPath: 'id' });
                }
            };
            requete.onsuccess = function () { resolve(requete.result); };
            requete.onerror = function () {
                console.error('[signature] Ouverture de la base identité impossible :', requete.error);
                reject(requete.error);
            };
        });
    }

    function lireIdentite(bdd) {
        return new Promise(function (resolve, reject) {
            var tx = bdd.transaction([NOM_STORE], 'readonly');
            var requete = tx.objectStore(NOM_STORE).get(ID_IDENTITE);
            requete.onsuccess = function () { resolve(requete.result || null); };
            requete.onerror = function () { reject(requete.error); };
        });
    }

    function ecrireIdentite(bdd, enregistrement) {
        return new Promise(function (resolve, reject) {
            var tx = bdd.transaction([NOM_STORE], 'readwrite');
            var requete = tx.objectStore(NOM_STORE).put(enregistrement);
            requete.onsuccess = function () { resolve(enregistrement); };
            requete.onerror = function () { reject(requete.error); };
        });
    }

    /**
     * Retourne l'identité locale { clePrivee, clePublique, clePubliqueB64,
     * dateCreation } ou null si aucune n'a encore été créée.
     */
    signaturePartage.obtenirIdentite = function () {
        return ouvrirBdd().then(function (bdd) {
            return lireIdentite(bdd).then(function (identite) {
                bdd.close();
                return identite;
            });
        });
    };

    /**
     * Crée et persiste une nouvelle identité de signature. Clé privée
     * NON EXTRACTIBLE : elle ne quitte jamais la base dédiée (perte =
     * nouvelle identité, re-TOFU chez les pairs — documenté au plan).
     * N'écrase JAMAIS une identité existante (erreur explicite).
     */
    signaturePartage.creerIdentite = function () {
        return ouvrirBdd().then(function (bdd) {
            return lireIdentite(bdd).then(function (existante) {
                if (existante) {
                    bdd.close();
                    throw new Error('[signature] Une identité existe déjà — création refusée');
                }
                return subtle().generateKey(PARAMS_CLE, false, ['sign', 'verify'])
                    .then(function (paire) {
                        return signaturePartage.exporterClePubliqueB64(paire.publicKey)
                            .then(function (b64) {
                                var enregistrement = {
                                    id: ID_IDENTITE,
                                    clePrivee: paire.privateKey,
                                    clePublique: paire.publicKey,
                                    clePubliqueB64: b64,
                                    dateCreation: new Date().toISOString()
                                };
                                return ecrireIdentite(bdd, enregistrement);
                            });
                    })
                    .then(function (enregistrement) {
                        bdd.close();
                        return enregistrement;
                    }, function (e) {
                        bdd.close();
                        throw e;
                    });
            });
        });
    };

    signaturePartage.obtenirOuCreerIdentite = function () {
        return signaturePartage.obtenirIdentite().then(function (identite) {
            return identite || signaturePartage.creerIdentite();
        });
    };

    // ------------------------------------------------------------------
    // Signature et vérification de packages
    // ------------------------------------------------------------------

    /**
     * Signe un package avec l'identité locale (créée au premier appel).
     * Retourne un CLONE du package, bloc signature rempli. L'objet
     * d'entrée n'est pas modifié. Chemin unique de signature : les mises
     * à jour d'un package déjà publié repassent ici (R3).
     */
    signaturePartage.signerPackage = function (pkg) {
        var payload = construirePayloadSignature(pkg);
        return signaturePartage.obtenirOuCreerIdentite().then(function (identite) {
            return signaturePartage.signerChaine(identite.clePrivee, payload)
                .then(function (signatureB64) {
                    var signe = JSON.parse(JSON.stringify(pkg));
                    signe.manifest.signature = signatureB64;
                    signe.manifest.clePublique = identite.clePubliqueB64;
                    signe.manifest.algorithme = algorithmeAttendu();
                    return signe;
                });
        });
    };

    /**
     * Vérifie la signature d'un package. AUTONOME : utilise la clé
     * publique embarquée dans le manifeste (l'authenticité de cette clé
     * relève du lot T — TOFU). Retourne { valide, code, message } ;
     * ne lance jamais pour un package malformé.
     */
    signaturePartage.verifierSignaturePackage = function (pkg) {
        function refus(code, message) {
            return { valide: false, code: code, message: message };
        }
        if (!pkg || typeof pkg !== 'object' || !pkg.manifest || typeof pkg.manifest !== 'object') {
            return Promise.resolve(refus('FORMAT_INVALIDE', 'Package sans manifeste'));
        }
        var manifest = pkg.manifest;
        if (!manifest.signature) {
            return Promise.resolve(refus('SIGNATURE_ABSENTE', 'Le package n\'est pas signé'));
        }
        if (!manifest.clePublique) {
            return Promise.resolve(refus('CLE_PUBLIQUE_ABSENTE', 'Le package ne porte pas de clé publique'));
        }
        if (manifest.algorithme !== algorithmeAttendu()) {
            return Promise.resolve(refus('ALGORITHME_INCONNU',
                'Algorithme « ' + manifest.algorithme + ' » non supporté (attendu : ' + algorithmeAttendu() + ')'));
        }
        var payload;
        try {
            payload = construirePayloadSignature(pkg);
        } catch (e) {
            return Promise.resolve(refus('FORMAT_INVALIDE', e.message));
        }
        return signaturePartage.importerClePubliqueB64(manifest.clePublique)
            .then(function (clePublique) {
                return signaturePartage.verifierChaine(clePublique, payload, manifest.signature);
            })
            .then(function (ok) {
                return ok
                    ? { valide: true, code: 'SIGNATURE_VALIDE', message: 'Signature vérifiée' }
                    : refus('SIGNATURE_INVALIDE', 'La signature ne correspond pas au contenu du package');
            })
            .catch(function () {
                return refus('CLE_PUBLIQUE_INVALIDE', 'Clé publique illisible ou incompatible');
            });
    };

    // ------------------------------------------------------------------
    // Test console terrain (Safari) — patron _testPartagePhase1
    // ------------------------------------------------------------------

    /**
     * Validation manuelle du lot F dans la console. Lecture seule sur les
     * données de l'app ; crée l'identité locale si absente (effet voulu).
     * Console Safari : tout est en fonctions classiques, une instruction
     * par ligne d'appel.
     */
    window._testSignatureF = function () {
        var resultats = [];
        function noter(nom, ok, detail) {
            resultats.push({ test: nom, ok: ok, detail: detail || '' });
        }
        var paquetTest = {
            format: window.partageSchemas.FORMAT,
            manifest: {
                licence: window.partageSchemas.LICENCE,
                licence_url: window.partageSchemas.LICENCE_URL,
                dateExport: new Date().toISOString(),
                auteur: { nom: 'Test lot F' },
                item_principal: { type: 'echelle', id: 'test-f-echelle' },
                chaineAttribution: [],
                signature: null,
                clePublique: null,
                algorithme: null
            },
            entites: {
                grilles: [], echelles: [{
                    id: 'test-f-echelle', nom: 'Échelle test lot F',
                    niveaux: [{ code: 'A', nom: 'Atteint' }]
                }],
                cartouches: [], productions: [], pratiques: []
            },
            references: [],
            medias: []
        };
        return signaturePartage.signerPackage(paquetTest)
            .then(function (signe) {
                noter('1. signerPackage remplit le bloc', !!(signe.manifest.signature && signe.manifest.clePublique
                    && signe.manifest.algorithme === algorithmeAttendu()));
                noter('2. l\'original n\'est pas modifié', paquetTest.manifest.signature === null);
                return signaturePartage.verifierSignaturePackage(signe).then(function (v) {
                    noter('3. package signé → SIGNATURE_VALIDE', v.valide && v.code === 'SIGNATURE_VALIDE', v.code);
                    var altere = JSON.parse(JSON.stringify(signe));
                    altere.entites.echelles[0].nom = 'Échelle ALTÉRÉE';
                    return signaturePartage.verifierSignaturePackage(altere);
                }).then(function (v) {
                    noter('4. entité altérée → SIGNATURE_INVALIDE', !v.valide && v.code === 'SIGNATURE_INVALIDE', v.code);
                    var altere2 = JSON.parse(JSON.stringify(signe));
                    altere2.manifest.auteur.nom = 'Usurpateur';
                    return signaturePartage.verifierSignaturePackage(altere2);
                }).then(function (v) {
                    noter('5. manifeste altéré → SIGNATURE_INVALIDE', !v.valide && v.code === 'SIGNATURE_INVALIDE', v.code);
                    var nonSigne = JSON.parse(JSON.stringify(paquetTest));
                    return signaturePartage.verifierSignaturePackage(nonSigne);
                }).then(function (v) {
                    noter('6. package non signé → SIGNATURE_ABSENTE', !v.valide && v.code === 'SIGNATURE_ABSENTE', v.code);
                    return subtle().generateKey(PARAMS_CLE, true, ['sign', 'verify']);
                }).then(function (paireEtrangere) {
                    var payload = construirePayloadSignature(signe);
                    return signaturePartage.signerChaine(paireEtrangere.privateKey, payload)
                        .then(function (signatureEtrangere) {
                            var usurpe = JSON.parse(JSON.stringify(signe));
                            usurpe.manifest.signature = signatureEtrangere;
                            return signaturePartage.verifierSignaturePackage(usurpe);
                        });
                }).then(function (v) {
                    noter('7. signé par une clé étrangère → SIGNATURE_INVALIDE', !v.valide && v.code === 'SIGNATURE_INVALIDE', v.code);
                    return signaturePartage.obtenirIdentite();
                }).then(function (identite) {
                    noter('8. identité persistée (base dédiée)', !!(identite && identite.clePubliqueB64));
                    var verts = resultats.filter(function (r) { return r.ok; }).length;
                    console.warn('[_testSignatureF] ' + verts + '/' + resultats.length + ' verts');
                    console.table(resultats);
                    return resultats;
                });
            })
            .catch(function (e) {
                console.error('[_testSignatureF] échec :', e);
                console.table(resultats);
                throw e;
            });
    };

    window.signaturePartage = signaturePartage;
})();
