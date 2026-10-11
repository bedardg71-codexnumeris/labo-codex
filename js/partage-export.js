/**
 * partage-export.js — Lot P2 : pipeline d'export d'un package de partage
 *
 * Chantier #329 Voûte Phase 1, lot P2.
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 *
 * Rôle : le bouton « Exporter pour partager » des 5 bibliothèques Structure
 * (grilles, échelles, cartouches, productions, pratiques) aboutit ici.
 * Chaîne : résolution de l'entité → modale de confirmation CC → package
 * signé (partage-format + signature) → AUTO-CONTRÔLE par validerPackage
 * (on n'émet JAMAIS un package que notre propre import rejetterait) →
 * conteneur `.lcz` → téléchargement.
 *
 * CONTENEUR `.lcz` (D-V1, canon posé ici — la spec d'avril s'arrêtait à
 * l'objet JSON) : un ZIP contenant `package.json` (l'objet
 * labo-codex-partage-v1, UTF-8) à la racine. Le dossier `medias/` est
 * réservé pour les phases ultérieures. Extension dédiée pour éviter la
 * décompression au double-clic macOS/iPadOS ; l'import (P3) lira les
 * magic bytes, pas le nom.
 *
 * GARDE-FOUS :
 *  - les items du mode démo ne s'exportent pas (leur package serait de
 *    toute façon rejeté à l'import : préfixe `demo-`, auteur réservé) ;
 *  - le nom de fichier passe par genererNomFichierExport (#262) ;
 *  - modale en API DOM + textContent (cohérent avec trust-tofu : les noms
 *    d'items sont des données utilisateur), zéro handler inline.
 *
 * Vocabulaire UI : « partage » (D-V2 « Voûte » vs « Partage » non tranchée —
 * ce module n'emploie jamais « Voûte » dans l'interface).
 *
 * Tests : tests/unit/partage-export-P2.test.js (résolution, garde-fous,
 * nommage) + window._testPartageExportP2() (terrain : aller-retour complet
 * package → .lcz → relecture → validation + signature + TOFU, sans
 * téléchargement ni écriture).
 */
(function () {
    'use strict';

    var partageExport = {};

    var NOM_FICHIER_PACKAGE = 'package.json';
    partageExport.NOM_FICHIER_PACKAGE = NOM_FICHIER_PACKAGE;

    var LIBELLES_TYPE = {
        grille: 'grille',
        echelle: 'échelle',
        cartouche: 'cartouche',
        production: 'production',
        pratique: 'pratique de notation'
    };

    // ------------------------------------------------------------------
    // Résolution de l'entité (par type, dans ses collections réelles)
    // ------------------------------------------------------------------

    /**
     * Clé de stockage des cartouches d'une grille, dans le TRIMESTRE ACTIF.
     * S5/#623 : `cartouches_<grilleId>` est namespacée depuis D2-A. Le `cle()`
     * est posé ICI, au site d'appel — jamais dans un lecteur dont le paramètre
     * s'appelle `cle` (cf. `partage-format.js:150`, où `cle(cle)` lèverait un
     * TypeError invisible à la relecture).
     */
    function cleCartouches(grilleId) {
        var brute = 'cartouches_' + grilleId;
        return (typeof window.cle === 'function') ? window.cle(brute) : brute;
    }

    /**
     * Noms des trimestres dont la collection de travail contient cette grille.
     * Sert UNIQUEMENT à décider si la modale doit nommer le trimestre source :
     * une grille qui n'existe que dans le trimestre actif n'a pas d'ambiguïté à
     * lever, et l'annoncer ajouterait du bruit à chaque partage.
     * Coût : un `getSync` par trimestre — celui que `toutesGrillesTravail` paie
     * déjà à chaque appel.
     */
    function trimestresPortantGrille(grilleId) {
        if (!grilleId || typeof window.obtenirTrimestres !== 'function'
            || typeof db === 'undefined' || !db.getSync) return [];
        var noms = [];
        window.obtenirTrimestres().forEach(function (t) {
            if (!t || !t.id) return;
            var liste = db.getSync(t.id + '_grillesTemplates', []) || [];
            if (liste.some(function (g) { return g && g.id === grilleId; })) {
                noms.push(t.nom || t.id);
            }
        });
        return noms;
    }

    function getSyncSur(cle) {
        if (typeof db === 'undefined' || !db.getSync) return [];
        var v = db.getSync(cle, []);
        return Array.isArray(v) ? v : [];
    }

    function clesCandidates(type, contexteId) {
        switch (type) {
            // #358 Option A : modèles de travail namespacés (trimestre actif) puis
            // catalogue de gabarits. Même patron que 'production'/'pratique' ci-dessous.
            case 'grille': {
                var clesG = [];
                if (typeof window.cle === 'function') clesG.push(window.cle('grillesTemplates'));
                clesG.push('bibliothequeGrilles');
                return clesG;
            }
            case 'echelle': {
                var clesE = [];
                if (typeof window.cle === 'function') clesE.push(window.cle('echellesTemplates'));
                clesE.push('bibliothequeEchelles');
                return clesE;
            }
            case 'production': {
                var cles = [];
                if (typeof getCleProductions === 'function') {
                    cles.push(getCleProductions());
                } else if (typeof window.cle === 'function') {
                    cles.push(window.cle('productions'));
                }
                cles.push('bibliothequeProductions');
                return cles;
            }
            case 'pratique': {
                var clesP = [];
                if (typeof window.cle === 'function') clesP.push(window.cle('pratiquesConfigurables'));
                clesP.push('bibliothequePratiques');
                return clesP;
            }
            case 'cartouche': {
                // Ancrage réel : `<trim>_cartouches_{grilleId}` depuis S5/#623.
                // ⚠ DÉCISION DE GRÉGOIRE (31 août 2026) : une grille peut vivre dans
                // PLUSIEURS trimestres à la fois (#358 — `migrerModelesVersNamespace`
                // copie la grille dans chaque trimestre qui l'utilise), et ses
                // cartouches y divergent depuis D2-A. « Le trimestre propriétaire »
                // n'a donc pas de réponse unique. Règle retenue : **on partage les
                // cartouches du trimestre ACTIF**. La modale de confirmation NOMME ce
                // trimestre quand la grille existe ailleurs aussi — sans quoi on
                // remplacerait un partage silencieux par un choix silencieux.
                if (contexteId) return [cleCartouches(contexteId)];
                var clesC = [];
                // Le balayage reste inter-trimestres pour ÉNUMÉRER les grilles (une
                // grille créée ailleurs doit rester exportable), mais chaque clé est
                // résolue dans le trimestre actif.
                var grillesScan = (typeof window.toutesGrillesTravail === 'function')
                    ? window.toutesGrillesTravail() : getSyncSur('grillesTemplates');
                grillesScan.forEach(function (g) {
                    if (g && g.id) clesC.push(cleCartouches(g.id));
                });
                return clesC;
            }
            default:
                return [];
        }
    }

    /**
     * Retrouve l'entité {type, id} dans ses collections. Retourne l'objet
     * brut (non cloné — construirePackage ne mute pas) ou null.
     */
    partageExport.resoudreEntite = function (type, id, contexteId) {
        var cles = clesCandidates(type, contexteId);
        for (var i = 0; i < cles.length; i++) {
            var items = getSyncSur(cles[i]);
            for (var j = 0; j < items.length; j++) {
                if (items[j] && items[j].id === id) return items[j];
            }
        }
        return null;
    };

    // ------------------------------------------------------------------
    // Génération du conteneur .lcz
    // ------------------------------------------------------------------

    /** Sérialise un package signé en Blob ZIP `.lcz` (package.json à la racine). */
    partageExport.genererLcz = function (pkgSigne) {
        if (typeof JSZip === 'undefined') {
            return Promise.reject(new Error('[partage-export] JSZip indisponible'));
        }
        var zip = new JSZip();
        zip.file(NOM_FICHIER_PACKAGE, JSON.stringify(pkgSigne, null, 2));
        return zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
    };

    /** Nom de fichier lisible (#262) : {type}-{nom}-…-cc-by-sa-{date-minute}.lcz */
    partageExport.nomFichierLcz = function (type, entite) {
        return genererNomFichierExport(type, {
            nom: entite.nom || entite.titre || '',
            extension: '.lcz',
            inclureLicence: true,
            precisionDate: 'minute'
        });
    };

    function telechargerBlob(blob, nomFichier) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // ------------------------------------------------------------------
    // Modale de confirmation CC
    // ------------------------------------------------------------------

    function el(balise, classe, texte) {
        var noeud = document.createElement(balise);
        if (classe) noeud.className = classe;
        if (texte) noeud.textContent = texte;
        return noeud;
    }

    /**
     * Modale de confirmation avant export. Récapitule l'item, les
     * dépendances embarquées, la licence et l'attribution. Retourne
     * Promise<bool> (false = annulé ; ESC et clic hors carte annulent).
     */
    function confirmerExport(type, entite, dependances) {
        return new Promise(function (resolve) {
            // --partage : au-dessus des modales de bibliothèque (z-index 10000)
            // d'où l'action est déclenchée (bug terrain 10 juin 2026).
            var overlay = el('div', 'modal-overlay modal-overlay--partage');
            overlay.id = 'modalPartageExport';

            var carte = el('div', 'modal-contenu modal-compact');
            carte.setAttribute('role', 'dialog');
            carte.setAttribute('aria-modal', 'true');
            carte.setAttribute('aria-labelledby', 'titrePartageExport');

            var titre = el('h2', 'modal-titre', 'Exporter pour partager');
            titre.id = 'titrePartageExport';
            carte.appendChild(titre);

            carte.appendChild(el('p', null,
                'Tu vas générer un fichier .lcz signé contenant la '
                + (LIBELLES_TYPE[type] || type) + ' « ' + (entite.nom || entite.titre || 'sans titre') + ' ».'));

            var nbDeps = 0;
            Object.keys(dependances.entites || {}).forEach(function (k) {
                nbDeps += dependances.entites[k].length;
            });
            if (nbDeps > 0) {
                carte.appendChild(el('p', null,
                    'Le package embarque aussi ' + nbDeps + ' ressource(s) liée(s) '
                    + '(grille et cartouches associées), pour que l\'item fonctionne chez la personne qui l\'importe.'));
            }

            // S5/#623 — DIRE d'où viennent les cartouches. Décision de Grégoire du
            // 31 août 2026 : on partage celles du trimestre ACTIF. Mais une grille
            // peut vivre dans plusieurs trimestres (#358), où ses cartouches
            // divergent depuis D2-A : dans ce cas seulement, le choix doit être
            // ANNONCÉ. Sur une grille qui n'existe qu'ici, la phrase serait du bruit.
            var cartouchesEmbarquees = (dependances.entites && dependances.entites.cartouches) || [];
            if (cartouchesEmbarquees.length > 0) {
                var grilleAncrage = null;
                for (var iC = 0; iC < cartouchesEmbarquees.length && !grilleAncrage; iC++) {
                    if (cartouchesEmbarquees[iC]) grilleAncrage = cartouchesEmbarquees[iC].grilleId || null;
                }
                var porteurs = trimestresPortantGrille(grilleAncrage);
                if (porteurs.length > 1) {
                    var actif = (typeof window.obtenirTrimestreActif === 'function')
                        ? window.obtenirTrimestreActif() : null;
                    var nomActif = (actif && (actif.nom || actif.id)) || 'trimestre actif';
                    carte.appendChild(el('p', 'alerte alerte-attention',
                        'Cette grille est utilisée dans ' + porteurs.length + ' trimestres ('
                        + porteurs.join(', ') + '). Les cartouches envoyées sont celles de « '
                        + nomActif + ' » — les autres trimestres peuvent en avoir de différentes.'));
                }
            }

            var identite = (typeof obtenirIdentiteCCUtilisateur === 'function')
                ? obtenirIdentiteCCUtilisateur() : '';
            carte.appendChild(el('p', null,
                'Le contenu sera publié sous licence ' + window.partageSchemas.LICENCE
                + ', attribué à : ' + (identite || 'identité CC non renseignée (Cadre › Trimestre, enseignant)') + '.'));

            carte.appendChild(el('p', null,
                'Le fichier est signé avec ta clé : la personne qui l\'importe '
                + 'pourra vérifier qu\'il vient bien de toi et qu\'il n\'a pas été modifié.'));

            var actions = el('div', 'modal-actions-centre');
            var btnAnnuler = el('button', 'btn btn-annuler', 'Annuler');
            btnAnnuler.type = 'button';
            btnAnnuler.setAttribute('data-decision', 'annuler');
            var btnExporter = el('button', 'btn btn-principal', 'Exporter (.lcz)');
            btnExporter.type = 'button';
            btnExporter.setAttribute('data-decision', 'exporter');
            actions.appendChild(btnAnnuler);
            actions.appendChild(btnExporter);
            carte.appendChild(actions);
            overlay.appendChild(carte);

            function conclure(ok) {
                document.removeEventListener('keydown', surClavier);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                resolve(ok);
            }

            function surClavier(e) {
                if (!document.body.contains(overlay)) {
                    document.removeEventListener('keydown', surClavier);
                    return;
                }
                if (e.key === 'Escape') conclure(false);
            }

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { conclure(false); return; }
                var bouton = e.target.closest ? e.target.closest('[data-decision]') : null;
                if (bouton) conclure(bouton.getAttribute('data-decision') === 'exporter');
            });
            document.addEventListener('keydown', surClavier);

            document.body.appendChild(overlay);
            overlay.classList.add('actif');
            btnExporter.focus();
        });
    }

    // ------------------------------------------------------------------
    // Point d'entrée data-action
    // ------------------------------------------------------------------

    /**
     * Entrée des menus ⋮ : data-action="partageExport.exporterPourPartager"
     * avec param=type, param2=id, param3=grilleId (cartouches seulement).
     * Résout l'entité dans les collections de l'utilisateur, puis délègue.
     */
    partageExport.exporterPourPartager = function (type, id, contexteId) {
        var entite = partageExport.resoudreEntite(type, id, contexteId);
        if (!entite) {
            console.error('[partage-export] Entité introuvable :', type, id);
            alert('Cet item est introuvable dans ses collections — export impossible.');
            return Promise.resolve(false);
        }
        return partageExport.exporterEntite(entite, type);
    };

    /**
     * Cœur d'export, sur une entité DÉJÀ RÉSOLUE : confirmation, package
     * signé, AUTO-CONTRÔLE (le package repasse par notre propre validation
     * d'import avant d'être émis), `.lcz`, téléchargement.
     *
     * Extrait de `exporterPourPartager` le 25 août 2026 (décision 3.2 de la
     * porte #490) pour que la section « Partagés » puisse ré-exporter un item
     * du namespace `partage_*` SANS dupliquer ce pipeline — elle sait résoudre
     * son entité et sa provenance, elle ne doit pas réécrire la chaîne de
     * signature et d'auto-contrôle.
     *
     * @param {Object} entite - entité résolue, non mutée
     * @param {string} type
     * @param {Object} [options] - passé tel quel à `construirePackageSigne` :
     *        `lecteurs` (d'où lire les dépendances) et `chaineAttribution`
     *        (provenance explicite). Voir l'en-tête de partage-format.js.
     */
    partageExport.exporterEntite = function (entite, type, options) {
        options = options || {};
        if (window.BibliothequeUI && BibliothequeUI.estItemDemo && BibliothequeUI.estItemDemo(entite)) {
            alert('Le matériel de démonstration ne s\'exporte pas : il est déjà fourni avec Labo Codex.');
            return Promise.resolve(false);
        }

        // Les MÊMES lecteurs que le package : sinon la confirmation annoncerait
        // un contenu que l'export n'émettrait pas.
        var dependances = window.partageFormat.rassemblerDependances(entite, type, options.lecteurs);

        return confirmerExport(type, entite, dependances).then(function (confirme) {
            if (!confirme) return false;
            var optionsPackage = { type: type };
            if (options.lecteurs) optionsPackage.lecteurs = options.lecteurs;
            if (options.chaineAttribution) optionsPackage.chaineAttribution = options.chaineAttribution;
            if (options.identiteAuteur) optionsPackage.identiteAuteur = options.identiteAuteur;

            return window.partageFormat.construirePackageSigne(entite, optionsPackage)
                .then(function (pkgSigne) {
                    // Auto-contrôle : ne JAMAIS émettre un package que notre
                    // propre validation d'import (P3) rejetterait.
                    var verdict = window.partageValidation.validerPackage(pkgSigne);
                    if (!verdict.valide) {
                        console.error('[partage-export] Auto-contrôle échoué :', verdict.erreurs);
                        alert('L\'export a été interrompu : le package généré ne passe pas la validation '
                            + '(détail dans la console). Rien n\'a été téléchargé.');
                        return false;
                    }
                    return partageExport.genererLcz(pkgSigne).then(function (blob) {
                        telechargerBlob(blob, partageExport.nomFichierLcz(type, entite));
                        return true;
                    });
                })
                .catch(function (e) {
                    console.error('[partage-export] Échec d\'export :', e);
                    alert('L\'export a échoué : ' + e.message);
                    return false;
                });
        });
    };

    // ------------------------------------------------------------------
    // Test console terrain (Safari) — aller-retour complet sans téléchargement
    // ------------------------------------------------------------------

    /**
     * Valide la chaîne P2 de bout en bout sur une entité réelle (1re grille
     * non-démo par défaut, ou (type, id) fournis) : package signé →
     * auto-contrôle → .lcz → relecture du ZIP → re-validation + signature
     * + statut TOFU. Lecture seule, aucun téléchargement, aucune écriture.
     */
    window._testPartageExportP2 = function (type, id) {
        var resultats = [];
        function noter(nom, ok, detail) {
            resultats.push({ test: nom, ok: ok, detail: detail || '' });
        }
        if (!type) {
            type = 'grille';
            var grilles = ((typeof window.toutesGrillesTravail === 'function')
                ? window.toutesGrillesTravail() : getSyncSur('grillesTemplates')).filter(function (g) {
                return !(window.BibliothequeUI && BibliothequeUI.estItemDemo && BibliothequeUI.estItemDemo(g));
            });
            if (!grilles.length) {
                console.error('[_testPartageExportP2] Aucune grille non-démo — passer (type, id) explicites');
                return Promise.resolve([]);
            }
            id = grilles[0].id;
        }
        var entite = partageExport.resoudreEntite(type, id);
        noter('1. entité résolue', !!entite, type + '/' + id);
        if (!entite) { console.table(resultats); return Promise.resolve(resultats); }

        return window.partageFormat.construirePackageSigne(entite, { type: type })
            .then(function (pkgSigne) {
                noter('2. package signé (bloc rempli)', !!(pkgSigne.manifest.signature && pkgSigne.manifest.clePublique));
                var verdict = window.partageValidation.validerPackage(pkgSigne);
                noter('3. auto-contrôle validerPackage', verdict.valide,
                    verdict.valide ? '' : JSON.stringify(verdict.erreurs).slice(0, 120));
                return partageExport.genererLcz(pkgSigne).then(function (blob) {
                    noter('4. .lcz généré', blob.size > 0, blob.size + ' octets');
                    return JSZip.loadAsync(blob);
                });
            })
            .then(function (zip) {
                var fichier = zip.file(NOM_FICHIER_PACKAGE);
                noter('5. package.json présent dans le .lcz', !!fichier);
                return fichier.async('string');
            })
            .then(function (json) {
                var relu = JSON.parse(json);
                var verdict = window.partageValidation.validerPackage(relu);
                noter('6. package relu depuis le .lcz → valide', verdict.valide);
                return window.signaturePartage.verifierSignaturePackage(relu).then(function (v) {
                    noter('7. signature vérifiée après aller-retour', v.valide, v.code);
                    var tofu = window.trustTofu.verifierConfianceTOFU(relu);
                    noter('8. statut TOFU déterminé (lecture seule)',
                        ['nouveau', 'verifiee', 'cle_changee'].indexOf(tofu.statut) !== -1, tofu.statut);
                    var verts = resultats.filter(function (r) { return r.ok; }).length;
                    console.warn('[_testPartageExportP2] ' + verts + '/' + resultats.length + ' verts');
                    console.table(resultats);
                    return resultats;
                });
            })
            .catch(function (e) {
                console.error('[_testPartageExportP2] échec :', e);
                console.table(resultats);
                throw e;
            });
    };

    window.partageExport = partageExport;
})();
