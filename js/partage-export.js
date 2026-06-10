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

    function getSyncSur(cle) {
        if (typeof db === 'undefined' || !db.getSync) return [];
        var v = db.getSync(cle, []);
        return Array.isArray(v) ? v : [];
    }

    function clesCandidates(type, contexteId) {
        switch (type) {
            case 'grille':
                return ['grillesTemplates', 'bibliothequeGrilles'];
            case 'echelle':
                return ['echellesTemplates', 'bibliothequeEchelles'];
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
                // Ancrage réel : cartouches_{grilleId}. Avec contexte, direct ;
                // sans contexte, balayage des grilles connues.
                if (contexteId) return ['cartouches_' + contexteId];
                var clesC = [];
                getSyncSur('grillesTemplates').forEach(function (g) {
                    if (g && g.id) clesC.push('cartouches_' + g.id);
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
            var overlay = el('div', 'modal-overlay');
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

            var identite = (typeof obtenirIdentiteCCUtilisateur === 'function')
                ? obtenirIdentiteCCUtilisateur() : '';
            carte.appendChild(el('p', null,
                'Le contenu sera publié sous licence ' + window.partageSchemas.LICENCE
                + ', attribué à : ' + (identite || 'identité CC non renseignée (Réglages › Identité)') + '.'));

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
     * Chaîne complète, avec AUTO-CONTRÔLE : le package signé repasse par
     * validerPackage avant d'être émis.
     */
    partageExport.exporterPourPartager = function (type, id, contexteId) {
        var entite = partageExport.resoudreEntite(type, id, contexteId);
        if (!entite) {
            console.error('[partage-export] Entité introuvable :', type, id);
            alert('Cet item est introuvable dans ses collections — export impossible.');
            return Promise.resolve(false);
        }
        if (window.BibliothequeUI && BibliothequeUI.estItemDemo && BibliothequeUI.estItemDemo(entite)) {
            alert('Le matériel de démonstration ne s\'exporte pas : il est déjà fourni avec Labo Codex.');
            return Promise.resolve(false);
        }

        var dependances = window.partageFormat.rassemblerDependances(entite, type);

        return confirmerExport(type, entite, dependances).then(function (confirme) {
            if (!confirme) return false;
            return window.partageFormat.construirePackageSigne(entite, { type: type })
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
            var grilles = getSyncSur('grillesTemplates').filter(function (g) {
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
