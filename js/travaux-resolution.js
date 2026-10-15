(function() {
    'use strict';

    /**
     * Module de résolution centralisé fichier ↔ évaluation.
     *
     * Résolution par clé composite (etudiantDA, productionId) uniquement.
     * En cas d'ambiguïté (2+ résultats), retourne null + log warning.
     *
     * Phase 3b : fichierId supprimé — un seul chemin de résolution.
     */

    // Dernier avertissement (ambiguïté/incohérence) pour affichage UI
    var _dernierAvertissement = null;

    /**
     * Trouve l'évaluation active pour un fichier donné.
     * Résolution par (etudiantDA, productionId).
     * En cas d'ambiguïté (2+ résultats), retourne le plus récent + warning.
     * @param {Object} fichier - Le fichier importé
     * @returns {Object|null} L'évaluation active ou null
     */
    function trouverEvaluationPourFichier(fichier) {
        _dernierAvertissement = null;
        if (!fichier) return null;
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        // Résolution par clé composite (etudiantDA, productionId)
        if (!fichier.etudiantDA || !fichier.productionId) return null;
        const candidats = evaluations.filter(e =>
            e.etudiantDA === fichier.etudiantDA &&
            e.productionId === fichier.productionId &&
            !e.remplaceeParId
        );
        if (candidats.length === 0) return null;
        if (candidats.length === 1) return candidats[0];

        // 2+ résultats : retourner le plus récent + signaler l'ambiguïté
        candidats.sort((a, b) =>
            new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0)
        );
        console.warn(`[Résolution] AMBIGUÏTÉ: ${candidats.length} évaluations pour (${fichier.etudiantDA}, ${fichier.productionId}) — retourne la plus récente`);
        _dernierAvertissement = {
            type: 'ambiguite-evaluation',
            da: fichier.etudiantDA,
            productionId: fichier.productionId,
            candidats: candidats.map(e => ({ id: e.id, date: e.dateEvaluation }))
        };
        return candidats[0];
    }

    /**
     * Trouve le fichier associé à une évaluation.
     * Résolution par (etudiantDA, productionId).
     * En cas d'ambiguïté (2+ résultats), retourne le plus récent + warning.
     * @param {Object} evaluation - L'évaluation sauvegardée
     * @returns {Object|null} Le fichier ou null
     */
    function trouverFichierPourEvaluation(evaluation) {
        _dernierAvertissement = null;
        if (!evaluation) return null;
        if (typeof travauxStockage === 'undefined') return null;

        // Chemin prioritaire : résolution directe par evaluationId
        if (evaluation.id) {
            var tousLesFichiers = travauxStockage.obtenirFichiersTravaux();
            var parEvalId = tousLesFichiers.filter(function(f) {
                return f.evaluationId === evaluation.id && f.statut !== 'corbeille';
            });
            if (parEvalId.length === 1) return parEvalId[0];
            if (parEvalId.length > 1) {
                parEvalId.sort(function(a, b) {
                    return new Date(b.dateModification || 0) - new Date(a.dateModification || 0);
                });
                return parEvalId[0];
            }

            // Chaîne de reprise : si l'évaluation est une reprise,
            // chercher le fichier lié à l'évaluation originale
            if (parEvalId.length === 0 && evaluation.repriseDeId) {
                var parOriginaleId = tousLesFichiers.filter(function(f) {
                    return f.evaluationId === evaluation.repriseDeId && f.statut !== 'corbeille';
                });
                if (parOriginaleId.length === 1) return parOriginaleId[0];
                if (parOriginaleId.length > 1) {
                    parOriginaleId.sort(function(a, b) {
                        return new Date(b.dateModification || 0) - new Date(a.dateModification || 0);
                    });
                    return parOriginaleId[0];
                }
            }
        }

        // Fallback : résolution par clé composite (etudiantDA, productionId)
        if (!evaluation.etudiantDA) {
            return null;
        }
        // 🔧 FIX #145 (2 juillet 2026) : refuser la résolution par DA seul.
        // Une évaluation SANS productionId (production sans fichier propre,
        // productionIdEffective || '' dans evaluation-chargement.js) récupérait
        // le fichier le plus récent de l'élève TOUTES productions confondues →
        // PDF étranger affiché + flot de warnings « AMBIGUÏTÉ (DA, ) ».
        // La symétrie existe déjà dans trouverEvaluationPourFichier (l.29).
        if (!evaluation.productionId) {
            return null;
        }
        var fichiers = travauxStockage.obtenirFichiersEtudiant(evaluation.etudiantDA);
        fichiers = fichiers.filter(function(f) { return f.productionId === evaluation.productionId; });
        if (fichiers.length === 0) {
            return null;
        }
        if (fichiers.length === 1) return fichiers[0];

        // 2+ résultats : retourner le plus récent + signaler l'ambiguïté
        fichiers.sort(function(a, b) {
            return new Date(b.dateModification || 0) - new Date(a.dateModification || 0);
        });
        console.warn('[Résolution] AMBIGUÏTÉ: ' + fichiers.length + ' fichiers pour (' + evaluation.etudiantDA + ', ' + evaluation.productionId + ') — retourne le plus récent');
        _dernierAvertissement = {
            type: 'ambiguite-fichier',
            da: evaluation.etudiantDA,
            productionId: evaluation.productionId,
            candidats: fichiers.map(function(f) { return { id: f.id, nom: f.nomFichier, date: f.dateModification }; })
        };
        return fichiers[0];
    }

    /**
     * Retourne le dernier avertissement émis par la résolution (ambiguïté).
     * Réinitialisé à chaque appel de résolution.
     * @returns {Object|null}
     */
    function dernierAvertissement() {
        return _dernierAvertissement;
    }

    /**
     * Diagnostic : affiche toutes les associations fichier↔évaluation pour un étudiant.
     * Usage console : travauxResolution.diagnostiquer('DA_ICI')
     * ou : travauxResolution.diagnostiquer('Benjamin') pour chercher par prénom/nom
     * @param {string} [daOuPrenom] - DA de l'étudiant ou début de prénom/nom
     */
    function diagnostiquer(daOuPrenom) {
        // ACCÈS DIRECT INTENTIONNEL — outil diagnostic console, doit lire TOUS les étudiants
        const etudiants = db.getSync(cle('groupeEtudiants'), []);
        let da = daOuPrenom;

        // Si pas un DA (pas numérique), chercher par prénom
        if (da && !/^\d+$/.test(da)) {
            const cherche = da.toLowerCase();
            const trouve = etudiants.find(e =>
                (e.prenom || '').toLowerCase().includes(cherche) ||
                (e.nom || '').toLowerCase().includes(cherche)
            );
            if (!trouve) {
                console.error(`Aucun étudiant trouvé pour "${daOuPrenom}"`);
                return;
            }
            da = trouve.da;
        }

        if (!da) {
            console.error('Usage : travauxResolution.diagnostiquer("Benjamin") ou travauxResolution.diagnostiquer("1234567")');
            return;
        }

        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        const productions = db.getSync(cle('productions'), []);
        const fichiers = travauxStockage.obtenirFichiersEtudiant(da);
        const eleve = etudiants.find(e => e.da === da) || {};

        // Nom des productions
        const prodNom = {};
        productions.forEach(p => { prodNom[p.id] = p.titre || p.nom || p.id; });

        const nomComplet = `${eleve.prenom || ''} ${eleve.nom || ''}`.trim() || `(DA ${da})`;
        console.group(`[Diagnostic] ${nomComplet} — ${fichiers.length} fichier(s), ${evaluations.filter(e => e.etudiantDA === da).length} évaluation(s)`);

        // 1. Lister les fichiers
        console.group(`📄 Fichiers (${fichiers.length})`);
        fichiers.forEach(f => {
            const titreProd = prodNom[f.productionId] || `(id inconnu : ${f.productionId})`;
            console.log(`  ${f.id} → [${titreProd}] ${f.nomFichier || '?'} (${f.typeMIME || '?'})`);
        });
        console.groupEnd();

        // 2. Lister les évaluations actives et leur résolution fichier
        const evalsDA = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);
        console.group(`📋 Évaluations actives (${evalsDA.length})`);
        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
            const titreProd = prodNom[e.productionId] || `(id inconnu : ${e.productionId})`;
            const fichierTxt = fichierResolu
                ? `→ fichier ${fichierResolu.id} (${fichierResolu.nomFichier || '?'})`
                : '→ AUCUN FICHIER';
            console.log(`  ${e.id} [${titreProd}] ${fichierTxt}`);
        });
        console.groupEnd();

        // 3. Détecter les incohérences éval → fichier (productionId divergent)
        const incoherences = [];
        evalsDA.forEach(e => {
            const fichierResolu = trouverFichierPourEvaluation(e);
            if (fichierResolu && fichierResolu.productionId !== e.productionId) {
                incoherences.push({ eval: e, fichier: fichierResolu });
                console.warn(
                    `  INCOHÉRENCE : éval ${e.id} [${prodNom[e.productionId]}] → fichier ${fichierResolu.id} dont productionId=${fichierResolu.productionId} [${prodNom[fichierResolu.productionId] || '?'}]`
                );
            }
        });
        if (incoherences.length === 0) {
            console.log('✅ Aucune incohérence éval → fichier');
        }

        console.groupEnd();
        return { da: da, fichiers: fichiers, evaluations: evalsDA, incoherences: incoherences };
    }

    /**
     * Diagnostic des doublons : liste tous les couples (étudiant × production)
     * pour lesquels 2+ fichiers coexistent dans le groupe-cours actif.
     *
     * Usage console :
     *   travauxResolution.diagnostiquerDoublons()                  // tous les doublons
     *   travauxResolution.diagnostiquerDoublons('Artefact 8')      // filtre par titre
     *   travauxResolution.diagnostiquerDoublons('prod_xyz_abc')    // filtre par ID exact
     *
     * Sortie :
     *   - Console (lecture humaine) : groupes par production puis par étudiant,
     *     avec table comparant les fichiers, indices de cause détectés
     *   - Retour : { totalDoublons, productionsAffectees: [...] } exploitable
     *
     * @param {string} [filtre] - Titre partiel ou ID exact d'une production
     * @param {Object} [opts] - { silencieux: true } pour ne pas écrire dans la console
     * @returns {{totalDoublons: number, productionsAffectees: Array}|null}
     */
    function diagnostiquerDoublons(filtre, opts) {
        const silencieux = !!(opts && opts.silencieux);
        if (typeof travauxStockage === 'undefined' || typeof travauxStockage.obtenirFichiersGroupeActif !== 'function') {
            if (!silencieux) console.error('[Doublons] travauxStockage non disponible');
            return null;
        }

        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        if (fichiers.length === 0) {
            if (!silencieux) console.warn('[Doublons] Aucun fichier dans le groupe-cours actif');
            return { totalDoublons: 0, productionsAffectees: [] };
        }

        // Références
        const productions = db.getSync(cle('productions'), []) || [];
        const etudiants = db.getSync(cle('groupeEtudiants'), []) || [];
        const prodById = {};
        productions.forEach(p => { prodById[p.id] = p; });
        const etByDa = {};
        etudiants.forEach(e => { etByDa[e.da] = e; });

        // Filtrage par production si demandé (match ID exact OU titre partiel insensible casse)
        let prodIdsCibles = null;
        if (filtre) {
            const filtreNorm = String(filtre).toLowerCase();
            const match = productions.filter(p =>
                p.id === filtre ||
                ((p.titre || p.nom || '').toLowerCase().indexOf(filtreNorm) !== -1)
            );
            if (match.length === 0) {
                if (!silencieux) console.warn(`[Doublons] Aucune production ne correspond à "${filtre}"`);
                return { totalDoublons: 0, productionsAffectees: [] };
            }
            prodIdsCibles = new Set(match.map(p => p.id));
        }

        // Grouper par (DA × productionId)
        const groupes = {};
        fichiers.forEach(f => {
            if (!f.etudiantDA || !f.productionId) return;
            if (prodIdsCibles && !prodIdsCibles.has(f.productionId)) return;
            const k = f.etudiantDA + '||' + f.productionId;
            if (!groupes[k]) groupes[k] = [];
            groupes[k].push(f);
        });

        // Filtrer ceux >= 2 fichiers
        const doublons = [];
        Object.keys(groupes).forEach(k => {
            const lot = groupes[k];
            if (lot.length < 2) return;

            // Trier par date décroissante (plus récent en premier)
            lot.sort((a, b) =>
                new Date(b.dateModification || b.dateAjout || 0) -
                new Date(a.dateModification || a.dateAjout || 0)
            );

            const da = lot[0].etudiantDA;
            const prodId = lot[0].productionId;
            const eleve = etByDa[da] || {};
            const prod = prodById[prodId] || {};

            doublons.push({
                da: da,
                prenom: eleve.prenom || '',
                nom: eleve.nom || '',
                productionId: prodId,
                productionTitre: prod.titre || prod.nom || prodId,
                fichiers: lot.map((f, i) => ({
                    id: f.id,
                    nomFichier: f.nomFichier || '?',
                    typeMIME: f.typeMIME || '?',
                    tailleOctets: f.tailleFichier || null,
                    dateAjout: f.dateAjout || null,
                    dateModification: f.dateModification || null,
                    statutWorkflow: f.statutWorkflow || (f.estAnnote ? 'annote' : 'importe'),
                    plusRecent: i === 0
                })),
                indicesCause: _analyserCauseDoublons(lot)
            });
        });

        // Regrouper par production pour la sortie hiérarchique
        const parProduction = {};
        doublons.forEach(d => {
            if (!parProduction[d.productionId]) {
                parProduction[d.productionId] = {
                    productionId: d.productionId,
                    productionTitre: d.productionTitre,
                    etudiantsAvecDoublons: []
                };
            }
            parProduction[d.productionId].etudiantsAvecDoublons.push(d);
        });
        const productionsAffectees = Object.values(parProduction);

        // Affichage console structuré (sauf si silencieux)
        if (!silencieux) {
            _afficherDoublonsConsole(productionsAffectees, doublons.length, filtre);
        }

        return {
            totalDoublons: doublons.length,
            productionsAffectees: productionsAffectees
        };
    }

    /**
     * Détecte des indices sur la cause d'un doublon (pour aider l'utilisateur).
     * @param {Array} fichiers - Lot de 2+ fichiers pour le même (DA × productionId)
     * @returns {Array<string>} Liste de tags d'indices
     */
    function _analyserCauseDoublons(fichiers) {
        const indices = [];
        if (fichiers.length < 2) return indices;

        // Mêmes noms : re-import du même fichier (détection de doublons à l'import a échoué)
        const noms = new Set(fichiers.map(f => f.nomFichier || ''));
        if (noms.size === 1 && !noms.has('')) indices.push('memes-noms');

        // Dates proches : < 5 min entre les 2 plus récents → glitch d'import
        const dates = fichiers
            .map(f => new Date(f.dateModification || f.dateAjout || 0).getTime())
            .filter(t => t > 0)
            .sort((a, b) => b - a);
        if (dates.length >= 2 && (dates[0] - dates[1]) < 5 * 60 * 1000) {
            indices.push('dates-proches');
        }

        // Mixte PDF + image → fusion entamée mais sources non supprimées
        const hasPdf = fichiers.some(f => f.typeMIME === 'application/pdf');
        const hasImage = fichiers.some(f => (f.typeMIME || '').indexOf('image/') === 0);
        if (hasPdf && hasImage) indices.push('mixte-pdf-image');

        // Statuts workflow différents : ré-import sur fichier existant
        const statuts = new Set(fichiers.map(f => f.statutWorkflow || (f.estAnnote ? 'annote' : 'importe')));
        if (statuts.size > 1) indices.push('statuts-mixtes');

        return indices;
    }

    /**
     * Affiche le rapport de doublons dans la console (console.group + console.table).
     * @param {Array} productionsAffectees
     * @param {number} totalDoublons
     * @param {string} [filtre]
     */
    function _afficherDoublonsConsole(productionsAffectees, totalDoublons, filtre) {
        if (totalDoublons === 0) {
            const suffixe = filtre ? ` (filtre : "${filtre}")` : '';
            console.log(`[Doublons] Aucun doublon détecté ✅${suffixe}`);
            return;
        }

        const titreFiltre = filtre ? ` (filtre : "${filtre}")` : '';
        console.group(`[Doublons] ${totalDoublons} doublon(s) sur ${productionsAffectees.length} production(s)${titreFiltre}`);

        productionsAffectees.forEach(prod => {
            console.group(`📋 ${prod.productionTitre} — ${prod.etudiantsAvecDoublons.length} étudiant(s) en doublon`);
            prod.etudiantsAvecDoublons.forEach(d => {
                const nomComplet = `${d.prenom} ${d.nom}`.trim() || `(DA ${d.da})`;
                const indicesTxt = d.indicesCause.length ? ` [${d.indicesCause.join(', ')}]` : '';
                console.group(`👤 ${nomComplet} — ${d.fichiers.length} fichiers${indicesTxt}`);
                console.table(d.fichiers.map(f => ({
                    id: f.id,
                    nomFichier: f.nomFichier,
                    type: f.typeMIME,
                    tailleOctets: f.tailleOctets,
                    dateAjout: f.dateAjout ? new Date(f.dateAjout).toLocaleString('fr-CA') : '?',
                    dateModif: f.dateModification ? new Date(f.dateModification).toLocaleString('fr-CA') : '?',
                    statut: f.statutWorkflow,
                    'plus récent (utilisé)': f.plusRecent ? '✅' : ''
                })));
                console.groupEnd();
            });
            console.groupEnd();
        });

        console.group('💡 Légende des indices de cause');
        console.log("• memes-noms       : nom de fichier identique → re-import du même fichier");
        console.log("• dates-proches    : < 5 min entre imports → glitch ou interruption d'import");
        console.log("• mixte-pdf-image  : PDF + image coexistent → fusion entamée mais sources non supprimées");
        console.log("• statuts-mixtes   : un fichier annoté coexiste avec un non-annoté → ré-import sur fichier existant");
        console.groupEnd();

        console.log('\n💾 Le fichier marqué « plus récent (utilisé) » est celui que la résolution choisit pour l\'évaluation.');
        console.log('🔧 Pour nettoyer manuellement : ouvrir la grille des fichiers et supprimer les doublons un par un.');
        console.log('📊 Pour le détail brut : utiliser la valeur de retour ↑');

        console.groupEnd();
    }

    /**
     * Nettoie les doublons EXACTS du groupe-cours actif : couples (DA × productionId)
     * où plusieurs fichiers ont le MÊME nom ET la MÊME taille (= mêmes octets,
     * re-import du même contenu). Garde le plus récent, déplace les anciens
     * vers la corbeille (réversible 30 jours).
     *
     * Mode DRY-RUN par défaut (n'agit pas, retourne la liste des actions prévues).
     * Pour exécuter réellement : passer { dryRun: false }.
     *
     * Par défaut, les fichiers vont dans la CORBEILLE (cohérent avec l'UI normale,
     * restaurable). Pour suppression définitive immédiate (irréversible) :
     * passer { definitive: true }.
     *
     * NE TOUCHE PAS les doublons à contenu différent (tailles différentes,
     * noms différents, formats mixtes) — ceux-ci nécessitent une décision
     * manuelle (voir UI de nettoyage à venir).
     *
     * Usage console :
     *   travauxResolution.nettoyerDoublonsExacts()                    // dry-run, tous
     *   travauxResolution.nettoyerDoublonsExacts({ filtre: 'Artefact 8' })  // dry-run, filtré
     *   travauxResolution.nettoyerDoublonsExacts({ dryRun: false })   // execution -> corbeille
     *   travauxResolution.nettoyerDoublonsExacts({ dryRun: false, definitive: true })
     *                                                                  // execution -> hard delete (irreversible)
     *
     * @param {Object} [opts]
     * @param {boolean} [opts.dryRun=true] - true = simulation, false = action réelle
     * @param {boolean} [opts.definitive=false] - true = hard delete (irréversible). false = corbeille (défaut, restaurable 30 j)
     * @param {string} [opts.filtre] - Titre partiel ou ID exact d'une production
     * @returns {Promise<{dryRun, definitive, total, traites, conserves, actions}>}
     */
    async function nettoyerDoublonsExacts(opts) {
        opts = opts || {};
        const dryRun = opts.dryRun !== false; // par défaut true
        const definitive = opts.definitive === true; // par défaut false (corbeille)
        const diagnostic = diagnostiquerDoublons(opts.filtre);
        if (!diagnostic || diagnostic.totalDoublons === 0) {
            console.log('[Nettoyage] Rien à nettoyer.');
            return { dryRun: dryRun, definitive: definitive, total: 0, traites: 0, conserves: 0, actions: [] };
        }

        // Recouper avec les fichiers complets (le diagnostic ne porte que les
        // champs résumés). On a besoin de tailleFichier pour matcher les
        // « doublons exacts » (mêmes octets).
        const fichiersComplets = travauxStockage.obtenirFichiersGroupeActif() || [];
        const fichierById = {};
        fichiersComplets.forEach(f => { fichierById[f.id] = f; });

        const actions = []; // { aGarder: id, aSupprimer: [id...], etudiant, production, raison }

        diagnostic.productionsAffectees.forEach(prod => {
            prod.etudiantsAvecDoublons.forEach(d => {
                // d.fichiers triés par date décroissante (plus récent en premier)
                if (d.fichiers.length < 2) return;

                // Critère STRICT : tous les fichiers doivent avoir le MÊME nom
                // ET la MÊME taille (à l'octet près) que le plus récent (gardé).
                // Sinon on ne touche pas (cas reprise jeton, format change, etc.)
                const garde = fichierById[d.fichiers[0].id];
                if (!garde) return; // sécurité
                const refNom = garde.nomFichier || '';
                const refTaille = garde.tailleFichier || 0;
                if (!refNom || !refTaille) return; // sans repère, on ne touche pas

                const aSupprimer = [];
                let safe = true;
                for (let i = 1; i < d.fichiers.length; i++) {
                    const candidat = fichierById[d.fichiers[i].id];
                    if (!candidat) { safe = false; break; }
                    const memesOctets = (candidat.nomFichier === refNom) &&
                        (candidat.tailleFichier === refTaille);
                    if (!memesOctets) { safe = false; break; }
                    aSupprimer.push(candidat.id);
                }
                if (!safe || aSupprimer.length === 0) return;

                actions.push({
                    etudiant: `${d.prenom} ${d.nom}`.trim() || `(DA ${d.da})`,
                    da: d.da,
                    production: d.productionTitre,
                    aGarder: garde.id,
                    aGarderNom: garde.nomFichier,
                    aGarderDate: garde.dateModification || garde.dateAjout,
                    aSupprimer: aSupprimer,
                    raison: 'memes-octets (nom + taille identiques)'
                });
            });
        });

        // Affichage console — adapter le verbe au mode
        const modeTxt = definitive ? 'suppression DEFINITIVE' : 'corbeille';
        const titre = dryRun
            ? `[Nettoyage DRY-RUN ${modeTxt}] ${actions.length} cas avec mêmes octets — aucune action`
            : `[Nettoyage ${modeTxt}] ${actions.length} cas en cours...`;
        console.group(titre);
        actions.forEach(a => {
            console.log(`👤 ${a.etudiant} — ${a.production}`);
            console.log(`   ✅ Garde : ${a.aGarder} (${a.aGarderNom}, ${new Date(a.aGarderDate).toLocaleString('fr-CA')})`);
            const icone = definitive ? '🔥' : '🗑 ';
            a.aSupprimer.forEach(id => {
                console.log(`   ${icone} ${definitive ? 'Supprime def.' : 'Vers corbeille'} : ${id}`);
            });
        });
        console.groupEnd();

        // Cas non touchés (pour info)
        const totalCasInitiaux = diagnostic.totalDoublons;
        const intacts = totalCasInitiaux - actions.length;
        if (intacts > 0) {
            console.warn(`[Nettoyage] ${intacts} cas NON touchés : noms ou tailles différents (reprises avec jeton, formats mixtes, contenu modifié...). Outil UI à venir pour ces cas.`);
        }

        if (dryRun) {
            const exemple = definitive
                ? 'travauxResolution.nettoyerDoublonsExacts({ dryRun: false, definitive: true })'
                : 'travauxResolution.nettoyerDoublonsExacts({ dryRun: false })';
            console.log(`💡 Pour exécuter réellement (${modeTxt}) : ${exemple}`);
            if (!definitive) {
                console.log('💡 Pour suppression définitive (irréversible) : ajouter { definitive: true }');
            }
            return { dryRun: true, definitive: definitive, total: actions.length, traites: 0, conserves: 0, actions: actions };
        }

        // Exécution réelle : corbeille (soft delete) ou suppression définitive
        let traites = 0;
        let echecs = 0;
        for (const a of actions) {
            for (const id of a.aSupprimer) {
                try {
                    let ok;
                    if (definitive) {
                        ok = await travauxStockage.supprimerFichierTravail(id);
                    } else {
                        // deplacerEnCorbeille est synchrone (pas async) -- mais on
                        // l'await quand meme par sécurité (si l'API évolue).
                        ok = travauxStockage.deplacerEnCorbeille(id);
                    }
                    if (ok) traites++;
                    else echecs++;
                } catch (e) {
                    console.error(`[Nettoyage] Erreur ${definitive ? 'suppression' : 'mise en corbeille'} ${id} :`, e);
                    echecs++;
                }
            }
        }

        const verbeFinal = definitive ? 'supprimé(s) définitivement' : 'mis en corbeille';
        const msg = `[Nettoyage] Terminé : ${traites} fichier(s) ${verbeFinal}`
            + (echecs > 0 ? `, ${echecs} échec(s)` : '');
        console.log(msg);
        if (!definitive && traites > 0) {
            console.log('💡 Restauration possible 30 jours via la corbeille (bouton « Corbeille » dans la liste des évaluations).');
        }
        if (echecs === 0) {
            console.log('💡 Recharge la page (Cmd+Q Safari + rouvrir) pour voir le carrousel à jour.');
        }

        return {
            dryRun: false,
            definitive: definitive,
            total: actions.length,
            traites: traites,
            echecs: echecs,
            conserves: actions.length,
            actions: actions
        };
    }

    // API publique
    window.travauxResolution = {
        trouverEvaluationPourFichier,
        trouverFichierPourEvaluation,
        dernierAvertissement,
        diagnostiquer,
        diagnostiquerDoublons,
        nettoyerDoublonsExacts
    };

})();
