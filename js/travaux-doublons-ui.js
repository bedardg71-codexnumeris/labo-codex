(function() {
    'use strict';

    // =========================================================================
    // ÉTAT INTERNE
    // =========================================================================

    var _payload = null;       // { totalDoublons, productionsAffectees }
    var _decisions = {};       // { fichierId: 'garder' | 'corbeille' | null }
    var _filtreCas = null;     // { da, productionId } ou null

    // =========================================================================
    // PATTERNS ET RECOMMANDATIONS
    // =========================================================================

    function _detecterPattern(d) {
        var nomsAvecJeton = d.fichiers.some(function(f) {
            return (f.nomFichier || '').indexOf('_-_Jeton_') !== -1;
        });
        if (nomsAvecJeton) return 'jeton';

        var indices = d.indicesCause || [];
        if (indices.indexOf('mixte-pdf-image') !== -1) return 'mixte-pdf-image';

        return 're-import-modifie';
    }

    function _libellePattern(pattern) {
        if (pattern === 'jeton') {
            return { icone: '🟢', texte: 'Reprise avec jeton — recommandé : garder les deux' };
        }
        if (pattern === 'mixte-pdf-image') {
            return { icone: '🟡', texte: 'Mixte PDF + image — recommandé : garder le PDF' };
        }
        return { icone: '🟠', texte: 'Re-import modifié — décision manuelle requise' };
    }

    function _recommandation(d, pattern) {
        var rec = {};
        if (pattern === 'jeton') {
            d.fichiers.forEach(function(f) { rec[f.id] = 'garder'; });
        } else if (pattern === 'mixte-pdf-image') {
            d.fichiers.forEach(function(f) {
                rec[f.id] = (f.typeMIME === 'application/pdf') ? 'garder' : 'corbeille';
            });
        } else {
            // re-import modifié : pas de pré-sélection (décision manuelle)
            d.fichiers.forEach(function(f) { rec[f.id] = null; });
        }
        return rec;
    }

    function _initialiserDecisions() {
        _decisions = {};
        _payload.productionsAffectees.forEach(function(prod) {
            prod.etudiantsAvecDoublons.forEach(function(d) {
                if (!_correspondAuFiltre(d)) return;
                var pat = _detecterPattern(d);
                var rec = _recommandation(d, pat);
                Object.keys(rec).forEach(function(fid) { _decisions[fid] = rec[fid]; });
            });
        });
    }

    function _correspondAuFiltre(d) {
        if (!_filtreCas) return true;
        return d.da === _filtreCas.da && d.productionId === _filtreCas.productionId;
    }

    // =========================================================================
    // OUVERTURE / FERMETURE
    // =========================================================================

    function ouvrirModale(filtre) {
        if (typeof travauxResolution === 'undefined' ||
            typeof travauxResolution.diagnostiquerDoublons !== 'function') {
            console.error('[Doublons UI] travauxResolution.diagnostiquerDoublons indisponible');
            return;
        }

        _payload = travauxResolution.diagnostiquerDoublons();
        if (!_payload || _payload.totalDoublons === 0) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Aucun doublon à examiner', 'Tous les fichiers sont uniques par étudiant et production.');
            }
            return;
        }

        _filtreCas = (filtre && filtre.da && filtre.productionId) ? filtre : null;
        _initialiserDecisions();
        _afficherModale();
    }

    function fermerDialogue() {
        var modal = document.getElementById('modalTravauxDoublons');
        if (modal) modal.classList.remove('actif');
        _payload = null;
        _decisions = {};
        _filtreCas = null;
    }

    // =========================================================================
    // RENDU
    // =========================================================================

    function _afficherModale() {
        var modal = document.getElementById('modalTravauxDoublons');
        if (!modal) {
            console.error('[Doublons UI] #modalTravauxDoublons absente du DOM');
            return;
        }
        var corps = modal.querySelector('.td-corps');
        if (corps) corps.innerHTML = _genererCorpsHtml();
        modal.classList.add('actif');
        _miseAJourFooter();
    }

    function _genererCorpsHtml() {
        var compteurs = { jeton: 0, 'mixte-pdf-image': 0, 're-import-modifie': 0 };
        var totalAffiche = 0;
        var prodsAvecCas = [];

        _payload.productionsAffectees.forEach(function(prod) {
            var casFiltres = prod.etudiantsAvecDoublons.filter(_correspondAuFiltre);
            if (casFiltres.length === 0) return;
            totalAffiche += casFiltres.length;
            prodsAvecCas.push({ prod: prod, cas: casFiltres });
            casFiltres.forEach(function(d) { compteurs[_detecterPattern(d)]++; });
        });

        if (totalAffiche === 0) {
            return '<p class="texte-muted">Aucun doublon ne correspond au filtre.</p>';
        }

        var recapParts = [];
        if (compteurs.jeton) recapParts.push(compteurs.jeton + ' reprise(s) avec jeton');
        if (compteurs['re-import-modifie']) recapParts.push(compteurs['re-import-modifie'] + ' re-import(s) modifié(s)');
        if (compteurs['mixte-pdf-image']) recapParts.push(compteurs['mixte-pdf-image'] + ' mixte(s) PDF + image');

        var html = '<div class="td-recap">' +
                   '<strong>' + totalAffiche + ' cas à examiner</strong>' +
                   (recapParts.length ? ' · ' + recapParts.join(' · ') : '') +
                   '</div>';

        prodsAvecCas.forEach(function(item) {
            html += '<div class="td-section">';
            html += '<h4 class="td-section-titre">' +
                    echapperHtml(item.prod.productionTitre) +
                    ' <span class="texte-muted">— ' + item.cas.length + ' cas</span></h4>';
            item.cas.forEach(function(d) { html += _genererCarteEtudiant(d); });
            html += '</div>';
        });

        return html;
    }

    function _genererCarteEtudiant(d) {
        var pattern = _detecterPattern(d);
        var lib = _libellePattern(pattern);
        var nomComplet = ((d.prenom || '') + ' ' + (d.nom || '')).trim() || ('DA ' + d.da);

        var html = '<div class="td-carte" data-pattern="' + pattern + '">';
        html += '<div class="td-carte-entete">';
        html += '<strong>' + echapperHtml(nomComplet) + '</strong>';
        html += '<span class="td-pattern-badge td-pattern-' + pattern + '">' +
                lib.icone + ' ' + echapperHtml(lib.texte) + '</span>';
        html += '</div>';
        html += '<div class="td-fichiers">';
        d.fichiers.forEach(function(f) { html += _genererLigneFichier(f); });
        html += '</div>';
        html += '</div>';
        return html;
    }

    function _genererLigneFichier(f) {
        var decision = _decisions[f.id];
        var dateAff = '?';
        if (f.dateModification) {
            try {
                dateAff = new Date(f.dateModification).toLocaleString('fr-CA',
                    { dateStyle: 'short', timeStyle: 'short' });
            } catch (e) { dateAff = String(f.dateModification); }
        }
        var taille = f.tailleKo ? f.tailleKo + ' Ko' : '?';
        var typeAff = (f.typeMIME || '?')
            .replace('application/', '').replace('image/', '');
        var statutAff = f.statutWorkflow || 'importé';
        var marqueRecent = f.plusRecent ? ' <span class="td-badge-recent">plus récent</span>' : '';

        var inputName = 'td-' + f.id;
        var radioGarder = '<label class="td-radio td-radio-garder">' +
            '<input type="radio" name="' + inputName + '" value="garder" ' +
            'data-fichier-id="' + f.id + '" data-on-change="travauxDoublonsUI.onDecision"' +
            (decision === 'garder' ? ' checked' : '') + '>' +
            ' Garder</label>';
        var radioCorbeille = '<label class="td-radio td-radio-corbeille">' +
            '<input type="radio" name="' + inputName + '" value="corbeille" ' +
            'data-fichier-id="' + f.id + '" data-on-change="travauxDoublonsUI.onDecision"' +
            (decision === 'corbeille' ? ' checked' : '') + '>' +
            ' Corbeille</label>';

        var html = '<div class="td-fichier" data-fichier-id="' + f.id + '">';
        html += '<div class="td-fichier-radios">' + radioGarder + radioCorbeille + '</div>';
        html += '<div class="td-fichier-info">';
        html += '<div class="td-fichier-nom">' + echapperHtml(f.nomFichier || '?') + marqueRecent + '</div>';
        html += '<div class="td-fichier-meta texte-muted">' +
                echapperHtml(typeAff) + ' · ' + echapperHtml(taille) +
                ' · Importé ' + echapperHtml(dateAff) +
                ' · ' + echapperHtml(statutAff) +
                '</div>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    // =========================================================================
    // FOOTER ET VALIDATION
    // =========================================================================

    function _miseAJourFooter() {
        var modal = document.getElementById('modalTravauxDoublons');
        if (!modal) return;
        var btn = modal.querySelector('.td-btn-appliquer');
        var statut = modal.querySelector('.td-footer-statut');
        if (!btn || !statut) return;

        var nbCorbeille = 0;
        var casOrphelin = 0;

        _payload.productionsAffectees.forEach(function(prod) {
            prod.etudiantsAvecDoublons.forEach(function(d) {
                if (!_correspondAuFiltre(d)) return;
                var nbGardes = 0;
                d.fichiers.forEach(function(f) {
                    if (_decisions[f.id] === 'garder') nbGardes++;
                    else if (_decisions[f.id] === 'corbeille') nbCorbeille++;
                });
                if (nbGardes === 0) casOrphelin++;
            });
        });

        if (casOrphelin > 0) {
            btn.disabled = true;
            btn.textContent = 'Au moins 1 fichier à garder par étudiant';
            statut.textContent = casOrphelin + ' cas sans fichier gardé — corrige avant d\'appliquer.';
            statut.classList.add('td-footer-statut-erreur');
        } else if (nbCorbeille === 0) {
            btn.disabled = true;
            btn.textContent = 'Aucune action sélectionnée';
            statut.textContent = 'Choisis « Corbeille » sur les fichiers à retirer.';
            statut.classList.remove('td-footer-statut-erreur');
        } else {
            btn.disabled = false;
            btn.textContent = 'Mettre ' + nbCorbeille + ' fichier(s) à la corbeille';
            statut.textContent = 'Restaurable 30 jours depuis la corbeille.';
            statut.classList.remove('td-footer-statut-erreur');
        }
    }

    // =========================================================================
    // INTERACTIONS
    // =========================================================================

    function onDecision(input) {
        var fid = input && input.getAttribute && input.getAttribute('data-fichier-id');
        if (!fid || !input.value) return;
        _decisions[fid] = input.value;
        _miseAJourFooter();
    }

    function appliquerActions() {
        if (typeof travauxStockage === 'undefined' ||
            typeof travauxStockage.deplacerEnCorbeille !== 'function') {
            console.error('[Doublons UI] travauxStockage.deplacerEnCorbeille indisponible');
            return;
        }

        var aCorbeille = Object.keys(_decisions).filter(function(fid) {
            return _decisions[fid] === 'corbeille';
        });
        if (aCorbeille.length === 0) return;

        var traites = 0, echecs = 0;
        for (var i = 0; i < aCorbeille.length; i++) {
            try {
                if (travauxStockage.deplacerEnCorbeille(aCorbeille[i])) traites++;
                else echecs++;
            } catch (e) {
                console.error('[Doublons UI] Erreur corbeille ' + aCorbeille[i], e);
                echecs++;
            }
        }

        if (typeof afficherNotificationSucces === 'function' && echecs === 0) {
            afficherNotificationSucces(
                traites + ' fichier(s) mis à la corbeille',
                'Restauration possible 30 jours via la corbeille.'
            );
        } else if (typeof afficherNotificationErreur === 'function' && echecs > 0) {
            afficherNotificationErreur(
                traites + ' traités, ' + echecs + ' échecs',
                'Voir la console pour les détails.'
            );
        }

        fermerDialogue();

        // Recharger la liste des évaluations si elle est ouverte
        if (typeof appliquerFiltres === 'function') {
            try { appliquerFiltres(); } catch (e) { console.warn('[Doublons UI] Recharge liste évaluations', e); }
        }
    }

    // =========================================================================
    // BANDEAU INFORMATIF (haut de la liste des évaluations)
    // =========================================================================

    function mettreAJourBandeau() {
        var bandeau = document.getElementById('bandeau-doublons-evaluations');
        if (!bandeau) return;

        if (typeof travauxResolution === 'undefined' ||
            typeof travauxResolution.diagnostiquerDoublons !== 'function') {
            bandeau.classList.add('u-hide');
            return;
        }

        var diag = travauxResolution.diagnostiquerDoublons(undefined, { silencieux: true });
        var n = diag ? diag.totalDoublons : 0;

        if (n === 0) {
            bandeau.classList.add('u-hide');
            return;
        }

        bandeau.classList.remove('u-hide');
        var compteurEl = bandeau.querySelector('.bandeau-doublons-compteur');
        if (compteurEl) {
            compteurEl.textContent = n + ' fichier' + (n > 1 ? 's' : '') +
                ' en doublon dans ce groupe-cours';
        }
    }

    function aDoublonPourCas(da, productionId) {
        if (!da || !productionId) return false;
        if (typeof travauxResolution === 'undefined' ||
            typeof travauxResolution.diagnostiquerDoublons !== 'function') return false;
        var diag = travauxResolution.diagnostiquerDoublons(undefined, { silencieux: true });
        if (!diag) return false;
        return diag.productionsAffectees.some(function(prod) {
            if (prod.productionId !== productionId) return false;
            return prod.etudiantsAvecDoublons.some(function(d) { return d.da === da; });
        });
    }

    // =========================================================================
    // API PUBLIQUE
    // =========================================================================

    window.travauxDoublonsUI = {
        ouvrirModale: ouvrirModale,
        fermerDialogue: fermerDialogue,
        onDecision: onDecision,
        appliquerActions: appliquerActions,
        mettreAJourBandeau: mettreAJourBandeau,
        aDoublonPourCas: aDoublonPourCas
    };

})();
