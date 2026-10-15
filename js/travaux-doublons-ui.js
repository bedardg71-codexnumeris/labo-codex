(function() {
    'use strict';

    // =========================================================================
    // ÉTAT INTERNE
    // =========================================================================

    var _payload = null;       // { totalDoublons, productionsAffectees }
    var _decisions = {};       // { fichierId: 'garder' | 'corbeille' | null }
    var _filtreCas = null;     // { da, productionId } ou null

    var CLE_VALIDATIONS = 'cas_fichiers_multiples_valides';

    // =========================================================================
    // VALIDATIONS PERSISTÉES
    //
    // Chaque entrée : { da, productionId, fichierIds: [trié], dateValidation }
    // La signature (fichierIds triés) change si un nouveau fichier rejoint le
    // groupe → la validation expire automatiquement et le cas réapparaît.
    // =========================================================================

    function _signatureFichiers(fichiers) {
        return fichiers.map(function(f) { return f.id; }).sort().join('|');
    }

    function _obtenirValidations() {
        if (typeof db === 'undefined' || typeof cle !== 'function') return [];
        return db.getSync(cle(CLE_VALIDATIONS), []) || [];
    }

    function _enregistrerValidations(liste) {
        if (typeof db === 'undefined' || typeof cle !== 'function') return;
        // setSync écrit localStorage immédiatement + IDB en arrière-plan.
        // Indispensable pour que mettreAJourBandeau (db.getSync) voie la
        // nouvelle valeur juste après l'application des validations.
        db.setSync(cle(CLE_VALIDATIONS), liste);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle(CLE_VALIDATIONS));   // lot F : geste hors témoin (valider des doublons)
    }

    function _estCasValide(d) {
        var sig = _signatureFichiers(d.fichiers);
        var validations = _obtenirValidations();
        return validations.some(function(v) {
            return v.da === d.da &&
                   v.productionId === d.productionId &&
                   (v.fichierIds || []).slice().sort().join('|') === sig;
        });
    }

    function _persisterValidation(da, productionId, fichierIds) {
        var validations = _obtenirValidations();
        // Retirer les anciennes entrées pour ce (da, productionId) — on remplace
        validations = validations.filter(function(v) {
            return !(v.da === da && v.productionId === productionId);
        });
        validations.push({
            da: da,
            productionId: productionId,
            fichierIds: fichierIds.slice().sort(),
            dateValidation: new Date().toISOString()
        });
        _enregistrerValidations(validations);
    }

    /**
     * Persiste plusieurs validations en un seul write — évite la course
     * read/write si db.set est asynchrone (write-behind).
     */
    function _persisterValidationsLot(casList) {
        if (!casList || casList.length === 0) return;
        var validations = _obtenirValidations();
        var nowIso = new Date().toISOString();
        casList.forEach(function(d) {
            validations = validations.filter(function(v) {
                return !(v.da === d.da && v.productionId === d.productionId);
            });
            validations.push({
                da: d.da,
                productionId: d.productionId,
                fichierIds: d.fichiers.map(function(f) { return f.id; }).sort(),
                dateValidation: nowIso
            });
        });
        _enregistrerValidations(validations);
    }

    function _marquerCasValide(d) {
        _persisterValidation(d.da, d.productionId, d.fichiers.map(function(f) { return f.id; }));
    }

    /**
     * API publique pour persister une validation depuis l'extérieur
     * (utilisée par la modale d'import quand l'utilisateur choisit
     * « Livrable additionnel »).
     */
    function marquerLivrableAdditionnel(da, productionId, fichierIds) {
        if (!da || !productionId || !Array.isArray(fichierIds) || fichierIds.length === 0) return;
        _persisterValidation(da, productionId, fichierIds);
    }

    // =========================================================================
    // PATTERNS ET RECOMMANDATIONS
    //
    // Deux familles seulement, pour ne pas pré-juger des cas que l'app ne peut
    // pas trancher avec certitude :
    //   - jeton : suffixe « _-_Jeton_ » dans le nom (convention reconnue de
    //     reprise) → recommandé garder les deux
    //   - plusieurs-fichiers : tout le reste → décision manuelle
    //
    // Les autres signaux (PDF + image, mêmes noms, dates proches, statuts
    // mixtes) sont affichés comme tags informatifs, sans recommandation.
    // =========================================================================

    function _detecterPattern(d) {
        var nomsAvecJeton = d.fichiers.some(function(f) {
            return (f.nomFichier || '').indexOf('_-_Jeton_') !== -1;
        });
        if (nomsAvecJeton) return 'jeton';
        return 'plusieurs-fichiers';
    }

    function _libellePattern(pattern) {
        if (pattern === 'jeton') {
            return { texte: 'Reprise via jeton — recommandé : garder les deux' };
        }
        return { texte: 'Plusieurs fichiers — décision manuelle' };
    }

    function _libelleTagInformatif(indice) {
        if (indice === 'mixte-pdf-image') return { texte: 'PDF + image' };
        if (indice === 'memes-noms')      return { texte: 'mêmes noms' };
        if (indice === 'dates-proches')   return { texte: 'dates proches (< 5 min)' };
        if (indice === 'statuts-mixtes')  return { texte: 'statuts mixtes' };
        return null;
    }

    function _recommandation(d, pattern) {
        var rec = {};
        if (pattern === 'jeton') {
            d.fichiers.forEach(function(f) { rec[f.id] = 'garder'; });
        } else {
            // plusieurs-fichiers : pas de pré-sélection (décision manuelle)
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
        // Utilise le diagnostic filtré (cas validés exclus). Si l'utilisateur
        // ouvre via le bandeau, il ne verra que les cas non encore validés.
        _payload = _diagnosticNonValide();
        if (!_payload || _payload.totalDoublons === 0) {
            notifications.succes('Aucun cas à examiner', 'Tous les cas avec plusieurs fichiers ont été traités ou validés.');
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
            console.error('[Fichiers multiples] #modalTravauxDoublons absente du DOM');
            return;
        }
        var corps = modal.querySelector('.td-corps');
        if (corps) corps.innerHTML = _genererCorpsHtml();
        modal.classList.add('actif');
        _miseAJourFooter();
    }

    function _genererCorpsHtml() {
        var compteurs = { 'jeton': 0, 'plusieurs-fichiers': 0 };
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
            return '<p class="texte-muted">Aucun cas ne correspond au filtre.</p>';
        }

        var recapParts = [];
        if (compteurs.jeton)               recapParts.push(compteurs.jeton + ' reprise(s) via jeton');
        if (compteurs['plusieurs-fichiers']) recapParts.push(compteurs['plusieurs-fichiers'] + ' à clarifier');

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

        // Tags informatifs (PDF + image, mêmes noms, dates proches, statuts mixtes)
        var tagsHtml = '';
        (d.indicesCause || []).forEach(function(indice) {
            var tag = _libelleTagInformatif(indice);
            if (!tag) return;
            tagsHtml += '<span class="td-tag-info">' + echapperHtml(tag.texte) + '</span>';
        });

        // Bouton « Valider ce cas » : raccourci pour cocher Garder sur tous les fichiers
        var boutonValider = '<button class="btn btn-secondaire btn-petit td-btn-valider"' +
            ' data-action="travauxDoublonsUI.validerCas"' +
            ' data-da="' + echapperHtml(d.da) + '"' +
            ' data-production-id="' + echapperHtml(d.productionId) + '"' +
            ' title="Marque ce cas comme validé : tous les fichiers restent actifs et le cas n\'apparaîtra plus dans le bandeau">' +
            'Valider ce cas</button>';

        var html = '<div class="td-carte" data-pattern="' + pattern + '">';
        html += '<div class="td-carte-entete">';
        html += '<strong>' + echapperHtml(nomComplet) + '</strong>';
        html += '<span class="td-pattern-badge td-pattern-' + pattern + '">' +
                echapperHtml(lib.texte) + '</span>';
        html += '</div>';
        if (tagsHtml) html += '<div class="td-tags">' + tagsHtml + '</div>';
        html += '<div class="td-carte-actions">' + boutonValider + '</div>';
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
        var taille = f.tailleOctets ? window.TailleFichier.dire(f.tailleOctets, { decimales: { Ko: 0, Mo: 1, Go: 2 } }) : '?';
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

    /**
     * Compte les actions sélectionnées par l'utilisateur :
     *   - corbeille : nombre de fichiers à mettre à la corbeille
     *   - validation : nombre de cas où tous les fichiers sont cochés Garder
     *                  (et aucun en corbeille) — sera marqué validé
     *   - orphelin : cas avec corbeille demandée sans aucun garder
     */
    function _compterActions() {
        var nbCorbeille = 0;
        var nbValidations = 0;
        var nbOrphelins = 0;

        _payload.productionsAffectees.forEach(function(prod) {
            prod.etudiantsAvecDoublons.forEach(function(d) {
                if (!_correspondAuFiltre(d)) return;
                var nbGardes = 0;
                var nbCorbeilleCas = 0;
                d.fichiers.forEach(function(f) {
                    if (_decisions[f.id] === 'garder') nbGardes++;
                    else if (_decisions[f.id] === 'corbeille') {
                        nbCorbeille++;
                        nbCorbeilleCas++;
                    }
                });
                if (nbCorbeilleCas > 0 && nbGardes === 0) {
                    nbOrphelins++;
                } else if (nbCorbeilleCas === 0 && nbGardes === d.fichiers.length) {
                    // Tous les fichiers sont cochés Garder → cas à valider
                    nbValidations++;
                }
            });
        });

        return { nbCorbeille: nbCorbeille, nbValidations: nbValidations, nbOrphelins: nbOrphelins };
    }

    function _miseAJourFooter() {
        var modal = document.getElementById('modalTravauxDoublons');
        if (!modal) return;
        var btn = modal.querySelector('.td-btn-appliquer');
        var statut = modal.querySelector('.td-footer-statut');
        if (!btn || !statut) return;

        var c = _compterActions();

        if (c.nbOrphelins > 0) {
            btn.disabled = true;
            btn.textContent = 'Au moins 1 fichier à garder par étudiant';
            statut.textContent = c.nbOrphelins + ' cas sans fichier gardé — corrige avant d\'appliquer.';
            statut.classList.add('td-footer-statut-erreur');
        } else if (c.nbCorbeille === 0 && c.nbValidations === 0) {
            // Aucune décision → fermer
            btn.disabled = false;
            btn.textContent = 'Fermer (aucune action)';
            statut.textContent = 'Aucune décision sélectionnée — tu peux fermer la modale.';
            statut.classList.remove('td-footer-statut-erreur');
        } else if (c.nbCorbeille > 0 && c.nbValidations === 0) {
            btn.disabled = false;
            btn.textContent = 'Mettre ' + c.nbCorbeille + ' fichier(s) à la corbeille';
            statut.textContent = 'Restaurable 30 jours depuis la corbeille.';
            statut.classList.remove('td-footer-statut-erreur');
        } else if (c.nbCorbeille === 0 && c.nbValidations > 0) {
            btn.disabled = false;
            btn.textContent = 'Marquer ' + c.nbValidations + ' cas comme validés';
            statut.textContent = 'Les cas validés ne réapparaîtront plus tant qu\'aucun nouveau fichier ne s\'y ajoute.';
            statut.classList.remove('td-footer-statut-erreur');
        } else {
            btn.disabled = false;
            btn.textContent = 'Appliquer (' + c.nbCorbeille + ' corbeille · ' + c.nbValidations + ' validation' + (c.nbValidations > 1 ? 's' : '') + ')';
            statut.textContent = 'Corbeille restaurable 30 jours · validations annulables en re-modifiant un fichier.';
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

    /**
     * Coche « Garder » sur tous les fichiers d'un cas (raccourci de validation).
     * Appelé depuis le bouton « ✓ Valider ce cas » dans chaque carte.
     */
    function validerCas(elemBouton) {
        if (!elemBouton || !elemBouton.getAttribute) return;
        var da = elemBouton.getAttribute('data-da');
        var productionId = elemBouton.getAttribute('data-production-id');
        if (!da || !productionId || !_payload) return;

        var trouve = false;
        _payload.productionsAffectees.forEach(function(prod) {
            if (prod.productionId !== productionId) return;
            prod.etudiantsAvecDoublons.forEach(function(d) {
                if (d.da !== da) return;
                trouve = true;
                d.fichiers.forEach(function(f) {
                    _decisions[f.id] = 'garder';
                    var radioGarder = document.querySelector(
                        'input[type="radio"][name="td-' + f.id + '"][value="garder"]');
                    if (radioGarder) radioGarder.checked = true;
                });
            });
        });
        if (!trouve) return;

        // Signal visuel : carte marquée en attente d'application + bouton désactivé
        var carte = elemBouton.closest('.td-carte');
        if (carte) carte.classList.add('td-carte-validee');
        elemBouton.disabled = true;
        elemBouton.textContent = 'Validé (en attente)';

        _miseAJourFooter();
    }

    function appliquerActions() {
        var aCorbeille = Object.keys(_decisions).filter(function(fid) {
            return _decisions[fid] === 'corbeille';
        });

        // Détecter les cas à marquer comme validés (tous Garder, pas de Corbeille)
        var casAvalider = [];
        _payload.productionsAffectees.forEach(function(prod) {
            prod.etudiantsAvecDoublons.forEach(function(d) {
                if (!_correspondAuFiltre(d)) return;
                var nbGardes = 0;
                var nbCorbeilleCas = 0;
                d.fichiers.forEach(function(f) {
                    if (_decisions[f.id] === 'garder') nbGardes++;
                    else if (_decisions[f.id] === 'corbeille') nbCorbeilleCas++;
                });
                if (nbCorbeilleCas === 0 && nbGardes === d.fichiers.length) {
                    casAvalider.push(d);
                }
            });
        });

        // Mode « Fermer (aucune action) » : ni corbeille ni validation → fermer
        if (aCorbeille.length === 0 && casAvalider.length === 0) {
            fermerDialogue();
            return;
        }

        // Marquer les cas validés en lot (1 seul write pour éviter
        // les courses read/write si db.set est async)
        _persisterValidationsLot(casAvalider);

        // Si pas de corbeille à appliquer, on s'arrête ici
        if (aCorbeille.length === 0) {
            notifications.succes(
                casAvalider.length + ' cas marqué(s) comme validé(s)',
                'Ces cas n\'apparaîtront plus dans le bandeau.'
            );
            fermerDialogue();
            if (typeof appliquerFiltres === 'function') {
                try { appliquerFiltres(); } catch (e) { console.warn('[Fichiers multiples] Recharge liste évaluations', e); }
            }
            return;
        }

        if (typeof travauxStockage === 'undefined' ||
            typeof travauxStockage.deplacerEnCorbeille !== 'function') {
            console.error('[Fichiers multiples] travauxStockage.deplacerEnCorbeille indisponible');
            return;
        }

        var traites = 0, echecs = 0;
        for (var i = 0; i < aCorbeille.length; i++) {
            try {
                if (travauxStockage.deplacerEnCorbeille(aCorbeille[i])) traites++;
                else echecs++;
            } catch (e) {
                console.error('[Fichiers multiples] Erreur corbeille ' + aCorbeille[i], e);
                echecs++;
            }
        }

        if (echecs === 0) {
            var msg = traites + ' fichier(s) mis à la corbeille';
            if (casAvalider.length > 0) {
                msg += ' · ' + casAvalider.length + ' cas validé(s)';
            }
            notifications.succes(msg, 'Restauration possible 30 jours via la corbeille.');
        } else if (echecs > 0) {
            notifications.erreur(
                traites + ' traités, ' + echecs + ' échecs',
                'Voir la console pour les détails.'
            );
        }

        fermerDialogue();

        // Recharger la liste des évaluations si elle est ouverte
        if (typeof appliquerFiltres === 'function') {
            try { appliquerFiltres(); } catch (e) { console.warn('[Fichiers multiples] Recharge liste évaluations', e); }
        }
    }

    // =========================================================================
    // BANDEAU INFORMATIF (haut de la liste des évaluations)
    // =========================================================================

    function _diagnosticNonValide() {
        if (typeof travauxResolution === 'undefined' ||
            typeof travauxResolution.diagnostiquerDoublons !== 'function') return null;
        var diag = travauxResolution.diagnostiquerDoublons(undefined, { silencieux: true });
        if (!diag) return null;
        // Filtrer les cas validés
        var prodsFiltrees = [];
        var totalNonValide = 0;
        diag.productionsAffectees.forEach(function(prod) {
            var nonValides = prod.etudiantsAvecDoublons.filter(function(d) {
                return !_estCasValide(d);
            });
            if (nonValides.length > 0) {
                prodsFiltrees.push({
                    productionId: prod.productionId,
                    productionTitre: prod.productionTitre,
                    etudiantsAvecDoublons: nonValides
                });
                totalNonValide += nonValides.length;
            }
        });
        return { totalDoublons: totalNonValide, productionsAffectees: prodsFiltrees };
    }

    function mettreAJourBandeau() {
        var bandeau = document.getElementById('bandeau-doublons-evaluations');
        if (!bandeau) return;

        var diag = _diagnosticNonValide();
        var n = diag ? diag.totalDoublons : 0;

        if (n === 0) {
            bandeau.classList.add('u-hide');
            return;
        }

        bandeau.classList.remove('u-hide');
        var compteurEl = bandeau.querySelector('.bandeau-doublons-compteur');
        if (compteurEl) {
            compteurEl.textContent = n + ' cas avec plusieurs fichiers dans ce groupe-cours';
        }
    }

    function aDoublonPourCas(da, productionId) {
        if (!da || !productionId) return false;
        var diag = _diagnosticNonValide();
        if (!diag) return false;
        return diag.productionsAffectees.some(function(prod) {
            if (prod.productionId !== productionId) return false;
            return prod.etudiantsAvecDoublons.some(function(d) { return d.da === da; });
        });
    }

    /**
     * Pour le compteur du carrousel (travaux-ui.js) : ramène à 1 fichier
     * compté par étudiant pour les cas validés. Les cas non validés gardent
     * leur compte exact (asymétrie visible).
     */
    function compterAvecValidations(fichiers, productionId) {
        if (!fichiers || fichiers.length === 0) {
            return { nbE: 0, nbF: 0 };
        }
        var validations = _obtenirValidations();
        // Index des cas validés pour cette production : { da: Set<fichierId> }
        var validesParDA = {};
        validations.forEach(function(v) {
            if (v.productionId !== productionId) return;
            validesParDA[v.da] = new Set(v.fichierIds || []);
        });

        var dasVus = {};
        var lstAffichee = fichiers.filter(function(f) {
            var fichiersValides = validesParDA[f.etudiantDA];
            if (!fichiersValides || !fichiersValides.has(f.id)) return true; // pas validé → garder
            // Validé : ne garder qu'1 fichier par DA (les autres sont des extras validés)
            if (dasVus[f.etudiantDA]) return false;
            dasVus[f.etudiantDA] = true;
            return true;
        });

        return {
            nbF: lstAffichee.length,
            nbE: new Set(lstAffichee.map(function(f) { return f.etudiantDA; }).filter(Boolean)).size
        };
    }

    // =========================================================================
    // API PUBLIQUE
    // =========================================================================

    window.travauxDoublonsUI = {
        ouvrirModale: ouvrirModale,
        fermerDialogue: fermerDialogue,
        onDecision: onDecision,
        validerCas: validerCas,
        appliquerActions: appliquerActions,
        mettreAJourBandeau: mettreAJourBandeau,
        aDoublonPourCas: aDoublonPourCas,
        compterAvecValidations: compterAvecValidations,
        marquerLivrableAdditionnel: marquerLivrableAdditionnel
    };

})();
